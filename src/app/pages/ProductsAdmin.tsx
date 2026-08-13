import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { toast } from '../components/ui/CommonToaster';
import { productsAPI } from '../../services/api';
import { PRODUCT_LIMITS } from '../../constants/fieldLimits';
import { LimitedField } from '../components/admin/LimitedField';
import { ImageUploadField } from '../components/admin/ImageUploadField';
import { SkeletonCard } from '../components/admin/Skeleton';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  isAvailable: boolean;
}

const CATEGORIES = ['classic', 'variation', 'special', 'seasonal'];

const EMPTY_FORM = {
  name: '',
  price: '',
  description: '',
  image: '',
  category: 'classic',
  isAvailable: true,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 12px',
  fontSize: '14px',
  background: 'rgba(245,239,224,.07)',
  border: '1px solid rgba(44,24,16,.16)',
  borderRadius: '8px',
  color: '#2C1810',
  boxSizing: 'border-box',
};

export function ProductsAdmin() {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { setStatus }: any = useOutletContext();

  const loadProducts = async () => {
    try {
      setPageLoading(true);
      const response = await productsAPI.getAll(100, 0);
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useRealtimeUpdates(['products:changed'], loadProducts);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await productsAPI.delete(deleteTarget.id);
      setProducts(products.filter((p) => p._id !== deleteTarget.id));
      toast.success('Product deleted');
      setStatus('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleSoldOut = async (product: Product) => {
    try {
      setStatus('Saving...');
      const response = await productsAPI.update(product._id, {
        isAvailable: !product.isAvailable,
      });
      const updated = response.data.product;
      setProducts(products.map((p) => (p._id === product._id ? updated : p)));
      setStatus('Saved!');
      setTimeout(() => setStatus('No changes'), 2000);
    } catch (error) {
      toast.error('Failed to update availability');
      setStatus('Error saving');
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: String(product.price ?? ''),
      description: product.description,
      image: product.image,
      category: product.category,
      isAvailable: product.isAvailable,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setErrors({});
  };

  const handleFormChange = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'This field is required';
    if (!form.price.trim()) {
      newErrors.price = 'This field is required';
    } else if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      newErrors.price = 'Price must be greater than $0';
    }
    if (!form.image.trim()) newErrors.image = 'This field is required';
    if (!form.description.trim()) newErrors.description = 'This field is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields highlighted in red');
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      image: form.image.trim(),
      category: form.category,
      isAvailable: form.isAvailable,
    };

    try {
      setLoading(true);
      setStatus('Saving...');

      if (editingId) {
        const response = await productsAPI.update(editingId, payload);
        setProducts(products.map((p) => (p._id === editingId ? response.data.product : p)));
        toast.success('Product updated');
      } else {
        const response = await productsAPI.create(payload);
        setProducts([response.data.product, ...products]);
        toast.success('Product created');
      }

      setStatus('Saved!');
      setTimeout(() => setStatus('No changes'), 2000);
      closeModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save product');
      setStatus('Error saving');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: "1", overflow: "auto", padding: isMobile ? "18px 16px 40px" : "26px 34px 60px" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: "14px", marginBottom: "22px" }}>
        <input
          placeholder="Search the menu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: isMobile ? "none" : "1",
            height: "44px",
            padding: "0 16px",
            fontSize: "14px",
            background: "rgba(245,239,224,.07)",
            border: "1px solid rgba(44,24,16,.16)",
            borderRadius: "10px",
            color: "#2C1810",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "13px", color: "#7a5c48" }}>
            {filtered.length} dessert{filtered.length !== 1 ? 's' : ''}
          </span>
          {!isMobile && <div style={{ flex: "1" }}></div>}
          <button
            onClick={openCreateModal}
            style={{
              flex: isMobile ? "1" : "none",
              height: "48px",
              padding: "0 22px",
              background: "#C0633A",
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-heading)",
              fontWeight: "800",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background .2s",
              borderRadius: "10px",
            }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#a4522e"}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "#C0633A"}
          >
            + Add a dessert
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "22px" }}>
        {pageLoading && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        {!pageLoading && filtered.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#FFFDF8",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(44,24,16,.1)",
              transition: "transform .2s ease",
              cursor: "pointer",
            }}
            onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"}
            onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "none"}
          >
            {/* Image */}
            <div style={{ height: "170px", background: "#EDE3D2", borderRadius: "0", overflow: "hidden", position: "relative" }}>
              {product.image ? (
                <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9d8371" }}>
                  No image
                </div>
              )}
              {!product.isAvailable && (
                <span style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(0,0,0,.7)", color: "#fff", padding: "4px 12px", borderRadius: "4px", fontSize: "11px", fontWeight: "600" }}>
                  Sold out
                </span>
              )}
            </div>

            {/* Content */}
            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "6px", flex: "1" }}>
              <div style={{ fontSize: "11px", letterSpacing: ".14em", textTransform: "uppercase", color: "#b09b88" }}>
                {product.category}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "18px", flex: "1" }}>
                  {product.name}
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", color: "#C0633A" }}>
                  ${product.price || "0"}
                </div>
              </div>
              <div style={{ fontSize: "13px", color: "#7a5c48", lineHeight: "1.5", flex: "1", overflowWrap: "break-word", wordBreak: "break-word" }}>
                {product.description}
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(44,24,16,.1)" }}>
                <span style={{ fontSize: "12px", color: "#7a5c48" }}>In stock</span>
                <button
                  onClick={() => handleToggleSoldOut(product)}
                  style={{
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    border: "none",
                    background: product.isAvailable ? "#22c55e" : "#d1d5db",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background .2s",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    background: "#fff",
                    borderRadius: "50%",
                    top: "2px",
                    left: product.isAvailable ? "22px" : "2px",
                    transition: "left .2s",
                  }} />
                </button>
                <span style={{ flex: "1" }}></span>
                <button
                  onClick={() => openEditModal(product)}
                  style={{
                    height: "42px",
                    padding: "0 16px",
                    background: "#2C1810",
                    border: "none",
                    color: "#F5EFE0",
                    font: "inherit",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "background .2s",
                    borderRadius: "6px",
                  }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#46281a"}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "#2C1810"}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: product._id, name: product.name })}
                  style={{
                    height: "42px",
                    padding: "0 14px",
                    background: "transparent",
                    border: "1px solid rgba(44,24,16,.2)",
                    font: "inherit",
                    fontSize: "13px",
                    cursor: "pointer",
                    color: "#a4522e",
                    transition: "background .2s",
                    borderRadius: "6px",
                  }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#F7E4DC"}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!pageLoading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#7a5c48" }}>
          No products found. {search ? "Try a different search." : "Add one to get started!"}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(44,24,16,.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
          }}
        >
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            noValidate
            style={{
              background: "#FFFDF8", borderRadius: "14px", padding: "28px",
              width: "min(480px, 92vw)", maxHeight: "88vh", overflow: "auto",
              display: "flex", flexDirection: "column", gap: "16px",
            }}
          >
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "20px" }}>
              {editingId ? "Edit dessert" : "Add a dessert"}
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Name</label>
              <LimitedField
                value={form.name}
                onChange={(value) => handleFormChange('name', value)}
                maxLength={PRODUCT_LIMITS.name}
                placeholder="Classic Tiramisu"
                error={errors.name}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  placeholder="14"
                  style={{
                    ...inputStyle,
                    border: errors.price ? '1.5px solid #EF4444' : '1.8px solid rgba(44,24,16,.2)',
                    background: errors.price ? 'rgba(239,68,68,.05)' : 'rgba(245,239,224,.07)',
                  }}
                />
                {errors.price && (
                  <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px", fontWeight: 500 }}>
                    {errors.price}
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Photo</label>
              <ImageUploadField
                value={form.image}
                onChange={(url) => handleFormChange('image', url)}
                error={errors.image}
              />
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Description</label>
              <LimitedField
                value={form.description}
                onChange={(value) => handleFormChange('description', value)}
                maxLength={PRODUCT_LIMITS.description}
                multiline
                placeholder="Coffee-soaked savoiardi, velvety mascarpone..."
                error={errors.description}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => handleFormChange('isAvailable', e.target.checked)}
              />
              Available for sale
            </label>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  flex: 1, height: "44px", background: "transparent",
                  border: "1px solid rgba(44,24,16,.2)", borderRadius: "8px",
                  color: "#7a5c48", cursor: "pointer", font: "inherit", fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, height: "44px", background: "#C0633A", border: "none",
                  borderRadius: "8px", color: "#fff", fontFamily: "var(--font-heading)",
                  fontWeight: 800, fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.8 : 1,
                }}
              >
                {loading ? "Saving..." : editingId ? "Save changes" : "Create dessert"}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this dessert?"
        message={`"${deleteTarget?.name}" will be permanently removed from the menu. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
