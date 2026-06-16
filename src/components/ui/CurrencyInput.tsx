import React, { forwardRef, useEffect, useState } from "react";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, style, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    const formatNumber = (val: string) => {
      if (!val) return "";
      
      // Remove all non-digit and non-decimal characters
      let cleaned = val.replace(/[^\d.]/g, "");
      
      // Prevent multiple decimals
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }
      
      if (!cleaned) return "";

      const [integerPart, decimalPart] = cleaned.split(".");
      
      // Format the integer part with Indian comma system
      let formattedInteger = "";
      if (integerPart) {
        try {
          formattedInteger = new Intl.NumberFormat("en-IN").format(BigInt(integerPart));
        } catch (e) {
          formattedInteger = integerPart;
        }
      }
      
      if (decimalPart !== undefined) {
        return `${formattedInteger}.${decimalPart}`;
      }
      return formattedInteger;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      
      let cleaned = raw.replace(/[^\d.]/g, "");
      const parts = cleaned.split(".");
      if (parts.length > 2) {
        cleaned = parts[0] + "." + parts.slice(1).join("");
      }

      onChange(cleaned);
      setDisplayValue(formatNumber(cleaned));
    };

    useEffect(() => {
      setDisplayValue(formatNumber(value));
    }, [value]);

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={`amount-display font-display ${className || ""}`}
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          ...style,
        }}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
