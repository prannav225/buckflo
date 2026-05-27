import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface FAQItemProps {
  q: string;
  a: string;
}

export function FAQItem({ q, a }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-black/8 dark:border-white/6 py-5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left font-semibold text-(--text) text-sm cursor-pointer hover:text-(--accent) transition-colors border-0 bg-transparent py-2 outline-none"
      >
        <span>{q}</span>
        <ChevronRight
          size={16}
          className={`text-(--text-muted) transition-transform duration-200 ${
            isOpen ? "rotate-90 text-(--accent)" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 mt-2 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-xs text-(--text-secondary) leading-relaxed pr-8 pb-2">
          {a}
        </p>
      </div>
    </div>
  );
}
