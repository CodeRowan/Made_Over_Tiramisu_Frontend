const baseFieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "0 12px",
  fontSize: "14px",
  background: "rgba(245,239,224,.07)",
  border: "1px solid rgba(44,24,16,.16)",
  borderRadius: "8px",
  color: "#2C1810",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function Counter({ length, max }: { length: number; max: number }) {
  const nearLimit = length >= max * 0.9;
  const atLimit = length >= max;
  return (
    <span style={{ fontSize: "11px", color: atLimit ? "#a4522e" : nearLimit ? "#C0633A" : "#9d8371", flexShrink: 0 }}>
      {length}/{max}
    </span>
  );
}

interface LimitedFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  helperText?: string;
  multiline?: boolean;
  error?: string;
}

/**
 * Text input/textarea with a hard character cap (native maxLength — can't be
 * typed past), visible counter, and validation error support.
 */
export function LimitedField({ value, onChange, maxLength, placeholder, helperText, multiline, error }: LimitedFieldProps) {
  const dynamicStyle: React.CSSProperties = {
    ...baseFieldStyle,
    border: error ? "1.5px solid #EF4444" : "1.8px solid rgba(44,24,16,.2)",
    background: error ? "rgba(239,68,68,.05)" : "rgba(245,239,224,.07)",
  };

  return (
    <div>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...dynamicStyle, height: "100px", padding: "12px", resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...dynamicStyle, height: "44px" }}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px", marginTop: "5px" }}>
        <span style={{ fontSize: "11px", color: error ? "#EF4444" : "#9d8371", fontWeight: error ? 600 : 400 }}>
          {error ? error : (helperText || "")}
        </span>
        <Counter length={value.length} max={maxLength} />
      </div>
    </div>
  );
}
