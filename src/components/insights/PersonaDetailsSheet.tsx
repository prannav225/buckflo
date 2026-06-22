import { type Transaction } from "../../db/schema";
import { evaluatePersona } from "../../utils/personaEvaluator";
import { PixelArtAvatar } from "../ui/PixelArtAvatar";
import { X, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useBackHandler } from "../../hooks/useBackHandler";
import { updateSheetOpenState } from "../../utils/modalHelper";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";

interface PersonaDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  monthYear: string;
}

export function PersonaDetailsSheet({
  isOpen,
  onClose,
  transactions,
  monthYear,
}: PersonaDetailsSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const persona = evaluatePersona(transactions);

  useBackHandler(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      updateSheetOpenState();
    }
    return () => {
      setTimeout(updateSheetOpenState, 0);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (!sheetRef.current) return;
    setIsSharing(true);
    const toastId = toast.loading("Preparing your sharing card...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const dataUrl = await toPng(sheetRef.current, {
        cacheBust: true,
        filter: (node) => {
          if (node.classList && node.classList.contains("no-export")) {
            return false;
          }
          return true;
        },
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `buckflo_persona_${monthYear}.png`, {
        type: "image/png",
      });

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `My buckflo Spending Persona: ${persona.title}`,
          text: `I've been analyzed as "${persona.title}"! #buckflo`,
          files: [file],
        });
        toast.success("Shared successfully!", { id: toastId });
      } else {
        const link = document.createElement("a");
        link.download = `buckflo_persona_${monthYear}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Card downloaded!", { id: toastId });
      }
    } catch (err) {
      console.error("Failed to share persona:", err);
      toast.error("Could not generate sharing card", { id: toastId });
    } finally {
      setIsSharing(false);
    }
  };

  return createPortal(
    <div className="sheet-overlay no-export" onClick={onClose}>
      <div 
        className="sheet-panel max-h-[85vh] flex flex-col p-6 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />

        {/* Ambient background glow */}
        <div 
          className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: persona.avatarColors[0] }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
          <div>
            <span className="text-[9px] font-bold text-(--accent) uppercase tracking-widest block mb-0.5 leading-none">
              Monthly Archetype
            </span>
            <h3 className="text-xl font-bold text-(--text) m-0 font-display italic font-normal!">
              {persona.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={isSharing}
              onClick={handleShare}
              className="btn-ghost p-1.5 min-h-0 h-auto rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-(--text-secondary) hover:text-(--accent) transition-colors"
              title="Share Card"
            >
              {isSharing ? (
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Share2 size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost p-1.5 min-h-0 h-auto rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-(--text-secondary)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          ref={sheetRef}
          className="flex-1 overflow-y-auto pr-1 flex flex-col items-center gap-5 pb-6 scrollbar-none relative z-10"
        >
          {/* Mascot */}
          <div className="relative shrink-0 select-none py-2 mt-2">
            <div className="flex items-center justify-center shrink-0">
              <PixelArtAvatar
                id={persona.id}
                size={96}
                colors={persona.avatarColors}
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-[13px] text-(--text-secondary) leading-relaxed text-center m-0 font-medium max-w-[320px] font-sans">
            {persona.description}
          </p>

          {/* Key Metric */}
          <div className="w-full py-2.5 px-3.5 rounded-xl bg-black/5 dark:bg-white/4 border border-black/5 dark:border-white/5 flex flex-col gap-1.5 mt-1 text-left max-w-sm">
            <span className="text-[8px] font-bold text-(--text-muted) uppercase tracking-wider leading-none">
              Key Metric
            </span>
            <span className="text-[11px] font-semibold text-(--accent) leading-normal whitespace-nowrap">
              {persona.statsHighlight}
            </span>
          </div>

          {/* Recommendation */}
          <div className="w-full border-t border-black/5 dark:border-white/5 pt-4 mt-2 flex flex-col gap-1.5 max-w-sm">
            <span className="text-[8px] font-bold text-(--text-muted) uppercase tracking-widest text-center leading-none">
              Mindful Observation
            </span>
            <p className="text-xs text-(--text-secondary) leading-relaxed text-center m-0 font-medium max-w-[320px] mx-auto">
              {persona.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
