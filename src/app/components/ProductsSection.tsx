import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { publicAPI } from "../../services/api";

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  isAvailable: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  classic: "#8B5E3C",
  variation: "#7A5230",
  special: "#C0633A",
  seasonal: "#5A7A40",
};

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className="h-full"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function ProductCard({ product, onSelect, onOrderNow }: { product: Product; onSelect: () => void; onOrderNow: () => void }) {
  const tagColor = CATEGORY_COLORS[product.category] || "#8B5E3C";

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onClick={onSelect}
      className="h-full rounded-2xl overflow-hidden flex flex-col cursor-pointer"
      style={{ background: "#EDE3CC", boxShadow: "0 4px 24px rgba(59,30,10,0.1)" }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "260px" }}>
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4 }}
        />
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs tracking-wider capitalize"
          style={{ background: tagColor, color: "#F5EFE0", fontFamily: "'Lato', sans-serif" }}
        >
          {product.category}
        </div>
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, rgba(44,24,16,0.7) 0%, transparent 60%)" }}
        >
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'Lato', sans-serif", color: "#F5EFE0" }}>
            View Details →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.25rem",
              color: "#2C1810",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </h3>
          <p
            className="mt-1.5 text-sm leading-relaxed"
            style={{
              fontFamily: "'Lato', sans-serif",
              color: "#6B4A2A",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        </div>

        {/* Price + Order Now Button */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2C1810" }}>
            ${product.price}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onOrderNow();
            }}
            className="px-4 py-2 rounded-lg text-xs tracking-widest uppercase font-semibold transition-all duration-200"
            style={{
              fontFamily: "'Lato', sans-serif",
              background: "#C0633A",
              color: "#F5EFE0",
              border: "none",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#a4522e";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#C0633A";
            }}
          >
            Order Now
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ProductDetailModal({ product, onClose, onOrderNow }: { product: Product; onClose: () => void; onOrderNow: () => void }) {
  const tagColor = CATEGORY_COLORS[product.category] || "#8B5E3C";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(44,24,16,0.6)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl overflow-hidden w-full"
        style={{ background: "#F5EFE0", maxWidth: "600px", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}
      >
        <div className="relative" style={{ height: "320px" }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wider capitalize"
            style={{ background: tagColor, color: "#F5EFE0", fontFamily: "'Lato', sans-serif" }}
          >
            {product.category}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: "rgba(44,24,16,0.55)", color: "#F5EFE0", border: "none", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem,4vw,2.2rem)", color: "#2C1810" }}>
            {product.name}
          </h2>
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ fontFamily: "'Lato', sans-serif", color: "#6B4A2A", lineHeight: 1.75, whiteSpace: "pre-wrap" }}
          >
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-8">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", color: "#2C1810" }}>
              ${product.price}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOrderNow}
              className="px-6 py-3 rounded-lg text-xs tracking-widest uppercase font-semibold transition-all duration-200"
              style={{ fontFamily: "'Lato', sans-serif", background: "#C0633A", color: "#F5EFE0", border: "none", cursor: "pointer" }}
              onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "#a4522e")}
              onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "#C0633A")}
            >
              Order Now
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ProductsSectionProps {
  onNavigate: (page: string, data?: any) => void;
}

export function ProductsSection({ onNavigate }: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleOrderNow = () => {
    setSelectedProduct(null);
    onNavigate("findus");
  };

  useEffect(() => {
    publicAPI
      .getProducts(50, 0)
      .then((res) => {
        setProducts(Array.isArray(res.data.products) ? res.data.products : []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="products" className="py-24 px-4" style={{ background: "#F5EFE0" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <FadeIn>
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "'Lato', sans-serif", color: "#C0633A" }}>
              Our Menu
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "#2C1810" }}>
              Made to be Mad About
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-3 max-w-md mx-auto text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
              Four ways to fall in love. One classic obsession.
            </p>
          </FadeIn>
        </div>

        {!loading && products.length === 0 ? (
          <p className="text-center text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
            Our menu is being updated — check back soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <FadeIn key={p._id} delay={i * 0.1}>
                <ProductCard
                  product={p}
                  onSelect={() => setSelectedProduct(p)}
                  onOrderNow={handleOrderNow}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOrderNow={handleOrderNow}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
