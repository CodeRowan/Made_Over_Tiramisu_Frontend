import { motion } from "motion/react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../CartContext";

interface CartPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function CartPage({ onNavigate }: CartPageProps) {
  const { items, removeItem, updateQuantity, total } = useCart();

  return (
    <div className="min-h-screen pt-20 px-4 pb-16" style={{ background: "#F5EFE0" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70"
            style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}
          >
            <ArrowLeft size={15} />
            Continue Shopping
          </button>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", color: "#2C1810", marginBottom: "2rem" }}>
            Your Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} style={{ color: "#C9A87C", margin: "0 auto 1rem" }} />
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#8B6B4A" }}>
                Your cart is empty
              </p>
              <p className="mt-2 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#A07850" }}>
                Add something delicious to get started.
              </p>
              <button
                onClick={() => onNavigate("home")}
                className="mt-6 px-6 py-2.5 rounded-full text-sm tracking-widest uppercase"
                style={{ background: "#C0633A", color: "#F5EFE0", fontFamily: "'Lato', sans-serif" }}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: "#EDE3CC" }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Playfair Display', serif", color: "#2C1810", fontSize: "1rem" }}>
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="text-xs" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                          {item.size}
                        </p>
                      )}
                      <p className="mt-0.5" style={{ fontFamily: "'Playfair Display', serif", color: "#C0633A" }}>
                        ${item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-2 rounded-full px-2 py-1"
                        style={{ background: "#F5EFE0", border: "1px solid rgba(59,30,10,0.15)" }}
                      >
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus size={12} style={{ color: "#6B4A2A" }} />
                        </button>
                        <span className="text-sm w-5 text-center" style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810" }}>
                          {item.quantity}
                        </span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus size={12} style={{ color: "#6B4A2A" }} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 rounded-full transition-opacity hover:opacity-70"
                        style={{ color: "#C0633A" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order summary */}
              <div className="p-6 rounded-2xl" style={{ background: "#EDE3CC" }}>
                <div className="flex justify-between mb-3">
                  <span style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>Subtotal</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", color: "#2C1810" }}>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-5" style={{ borderTop: "1px solid rgba(59,30,10,0.1)", paddingTop: "12px" }}>
                  <span style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810", fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#2C1810" }}>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => onNavigate("checkout")}
                  className="w-full py-3.5 rounded-full text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90 active:scale-98"
                  style={{ background: "#C0633A", color: "#F5EFE0", fontFamily: "'Lato', sans-serif" }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
