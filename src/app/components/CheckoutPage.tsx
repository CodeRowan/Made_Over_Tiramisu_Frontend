import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MapPin, Truck, ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "../CartContext";

interface CheckoutPageProps {
  onNavigate: (page: string, data?: any) => void;
}

type Step = "location" | "delivery" | "address" | "review";

const LOCATIONS = [
  { id: "hopes-island", name: "Hope Island", address: "Mariners Cove, Hope Island QLD 4212" },
  { id: "emerald-lakes", name: "Emerald Lakes", address: "Emerald Lakes Dr, Carrara QLD 4211" },
];

export function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, total } = useCart();
  const [step, setStep] = useState<Step>("location");
  const [location, setLocation] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup" | "">("");
  const [address, setAddress] = useState({ name: "", street: "", suburb: "", phone: "" });

  const steps: Step[] = ["location", "delivery", "address", "review"];
  const stepIdx = steps.indexOf(step);

  const handleNext = () => {
    if (step === "location" && location) setStep("delivery");
    else if (step === "delivery" && deliveryType) setStep("address");
    else if (step === "address") setStep("review");
    else if (step === "review") {
      onNavigate("confirm", { location, deliveryType, address });
    }
  };

  const canNext =
    (step === "location" && !!location) ||
    (step === "delivery" && !!deliveryType) ||
    (step === "address" && !!address.name && !!address.street && !!address.phone) ||
    step === "review";

  return (
    <div className="min-h-screen pt-20 px-4 pb-16" style={{ background: "#F5EFE0" }}>
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => step === "location" ? onNavigate("cart") : setStep(steps[stepIdx - 1])}
            className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70"
            style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}
          >
            <ArrowLeft size={15} />
            Back
          </button>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", color: "#2C1810", marginBottom: "0.5rem" }}>
            Checkout
          </h1>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-300"
                  style={{
                    background: i <= stepIdx ? "#C0633A" : "rgba(59,30,10,0.15)",
                    color: i <= stepIdx ? "#F5EFE0" : "#8B6B4A",
                    fontFamily: "'Lato', sans-serif",
                  }}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="h-px w-8 transition-all duration-300"
                    style={{ background: i < stepIdx ? "#C0633A" : "rgba(59,30,10,0.15)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Location */}
              {step === "location" && (
                <div>
                  <h2 className="mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2C1810" }}>
                    Choose your location
                  </h2>
                  <p className="mb-6 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                    Which store would you like to order from?
                  </p>
                  <div className="space-y-3">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => setLocation(loc.id)}
                        className="w-full p-5 rounded-2xl text-left flex items-start gap-4 transition-all duration-200 border-2"
                        style={{
                          background: location === loc.id ? "#3B1E0A" : "#EDE3CC",
                          borderColor: location === loc.id ? "#C0633A" : "transparent",
                          color: location === loc.id ? "#F5EFE0" : "#2C1810",
                        }}
                      >
                        <MapPin size={18} style={{ color: location === loc.id ? "#C9A87C" : "#C0633A", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>{loc.name}</p>
                          <p className="text-sm mt-0.5 opacity-70" style={{ fontFamily: "'Lato', sans-serif" }}>{loc.address}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Delivery or Pickup */}
              {step === "delivery" && (
                <div>
                  <h2 className="mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2C1810" }}>
                    Delivery or Pickup?
                  </h2>
                  <p className="mb-6 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                    From: {LOCATIONS.find((l) => l.id === location)?.name}
                  </p>
                  <div className="space-y-3">
                    {[
                      { id: "delivery", icon: <Truck size={22} />, label: "Home Delivery", sub: "We'll bring it to your door · $5 flat rate" },
                      { id: "pickup", icon: <ShoppingBag size={22} />, label: "Click & Collect", sub: "Pick up at the store · Free" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setDeliveryType(opt.id as any)}
                        className="w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all duration-200 border-2"
                        style={{
                          background: deliveryType === opt.id ? "#3B1E0A" : "#EDE3CC",
                          borderColor: deliveryType === opt.id ? "#C0633A" : "transparent",
                          color: deliveryType === opt.id ? "#F5EFE0" : "#2C1810",
                        }}
                      >
                        <span style={{ color: deliveryType === opt.id ? "#C9A87C" : "#C0633A" }}>{opt.icon}</span>
                        <div>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>{opt.label}</p>
                          <p className="text-sm mt-0.5 opacity-70" style={{ fontFamily: "'Lato', sans-serif" }}>{opt.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {step === "address" && (
                <div>
                  <h2 className="mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2C1810" }}>
                    {deliveryType === "delivery" ? "Delivery Address" : "Your Details"}
                  </h2>
                  <p className="mb-6 text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>
                    {deliveryType === "delivery" ? "Where should we deliver to?" : "Contact details for your pickup"}
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: "name", label: "Full Name", placeholder: "Jane Smith", type: "text" },
                      { key: "phone", label: "Phone Number", placeholder: "+61 400 000 000", type: "tel" },
                      ...(deliveryType === "delivery"
                        ? [
                            { key: "street", label: "Street Address", placeholder: "123 Main St", type: "text" },
                            { key: "suburb", label: "Suburb", placeholder: "Gold Coast QLD", type: "text" },
                          ]
                        : []),
                    ].map((field) => (
                      <div key={field.key}>
                        <label
                          className="block text-xs tracking-wider uppercase mb-1.5"
                          style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={(address as any)[field.key]}
                          onChange={(e) => setAddress((a) => ({ ...a, [field.key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                          style={{
                            background: "#EDE3CC",
                            border: "1px solid rgba(59,30,10,0.15)",
                            fontFamily: "'Lato', sans-serif",
                            color: "#2C1810",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === "review" && (
                <div>
                  <h2 className="mb-6" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#2C1810" }}>
                    Review Your Order
                  </h2>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#EDE3CC" }}>
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#2C1810" }}>{item.name}</p>
                          <p className="text-xs" style={{ fontFamily: "'Lato', sans-serif", color: "#8B6B4A" }}>x{item.quantity}</p>
                        </div>
                        <p style={{ fontFamily: "'Playfair Display', serif", color: "#2C1810" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl space-y-2 mb-4" style={{ background: "#EDE3CC" }}>
                    <div className="flex justify-between text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>
                      <span>Location</span>
                      <span>{LOCATIONS.find((l) => l.id === location)?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>
                      <span>Type</span>
                      <span>{deliveryType === "delivery" ? "Home Delivery" : "Click & Collect"}</span>
                    </div>
                    {deliveryType === "delivery" && (
                      <div className="flex justify-between text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>
                        <span>Address</span>
                        <span>{address.street}, {address.suburb}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm" style={{ fontFamily: "'Lato', sans-serif", color: "#4A2E1A" }}>
                      <span>Delivery fee</span>
                      <span>{deliveryType === "delivery" ? "$5.00" : "Free"}</span>
                    </div>
                    <div
                      className="flex justify-between pt-2"
                      style={{ borderTop: "1px solid rgba(59,30,10,0.1)", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#2C1810" }}
                    >
                      <span>Total</span>
                      <span>${(total + (deliveryType === "delivery" ? 5 : 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <button
            onClick={handleNext}
            disabled={!canNext}
            className="w-full mt-8 py-3.5 rounded-full text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40"
            style={{ background: "#C0633A", color: "#F5EFE0", fontFamily: "'Lato', sans-serif" }}
          >
            {step === "review" ? "Place Order" : "Continue"}
            <ChevronRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
