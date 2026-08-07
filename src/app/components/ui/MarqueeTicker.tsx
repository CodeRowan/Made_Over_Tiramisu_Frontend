import { motion } from "motion/react";

const ITEMS = [
  "DAILY",
  "SMALL BATCH",
  "MAD OVER TIRAMISU",
  "HAND-BUILT DAILY",
  "AUTHENTICALLY ITALIAN",
  "PURE OBSESSION",
];

function TickerContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-6">
          <span
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              color: "#2C1810",
              whiteSpace: "nowrap",
            }}
          >
            {item}
          </span>
          <span style={{ color: "#C0633A", fontSize: "0.5rem" }}>●</span>
        </span>
      ))}
    </>
  );
}

export function MarqueeTicker() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "#F5EFE0",
        borderTop: "1px solid #C9A87C",
        borderBottom: "1px solid #C9A87C",
        padding: "12px 0",
      }}
    >
      <motion.div
        className="flex gap-8"
        style={{ width: "max-content" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <TickerContent />
        <TickerContent />
        <TickerContent />
        <TickerContent />
      </motion.div>
    </div>
  );
}