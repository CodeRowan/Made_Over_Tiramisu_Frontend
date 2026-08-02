import { useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle, Home } from "lucide-react";
import { useCart } from "../CartContext";
import { useSiteLogo } from "../../hooks/useSiteLogo";

interface OrderConfirmPageProps {
  onNavigate: (page: string) => void;
  orderData: any;
}

const LOCATIONS: Record<string, string> = {
  "hopes-island": "Hope Island",
  "emerald-lakes": "Emerald Lakes",
};

export function OrderConfirmPage({ onNavigate, orderData }: OrderConfirmPageProps) {
  const { clearCart } = useCart();
  const logoImg = useSiteLogo();
  const orderNumber = `MOT-${Math.floor(Math.random() * 90000) + 10000}`;

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen pt-20 px-4 pb-16 flex items-center justify-center" style={{ background: "#F5EFE0" }}>
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "#3B1E0A" }}
          >
            <CheckCircle size={40} style={{ color: "#C9A87C" }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "#2C1810", marginBottom: "0.5rem" }}
            >
              Order Confirmed!
            </h1>
            <p className="text-sm mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
              Order #{orderNumber}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="p-6 rounded-2xl mb-8 text-left space-y-3"
          style={{ background: "#EDE3CC" }}
        >
          {orderData?.location && (
            <div className="flex justify-between text-sm">
              <span style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>Location</span>
              <span style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810" }}>{LOCATIONS[orderData.location] || orderData.location}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>Type</span>
            <span style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810" }}>
              {orderData?.deliveryType === "delivery" ? "Home Delivery" : "Click & Collect"}
            </span>
          </div>
          {orderData?.deliveryType === "delivery" && orderData?.address?.street && (
            <div className="flex justify-between text-sm">
              <span style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>Delivery to</span>
              <span style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810", maxWidth: "60%", textAlign: "right" }}>
                {orderData.address.street}, {orderData.address.suburb}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <img src={logoImg} alt="Mad Over Tiramisu" className="h-12 w-12 rounded-full mx-auto mb-4 object-cover" />
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ fontFamily: "'Lato', sans-serif", color: "#6B4A2A", fontStyle: "italic" }}
          >
            Your tiramisu is being prepared with love. You'll receive a confirmation shortly.
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-200 hover:opacity-90"
            style={{ background: "#3B1E0A", color: "#F5EFE0", fontFamily: "'Lato', sans-serif" }}
          >
            <Home size={14} />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
