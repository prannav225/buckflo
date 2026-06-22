import { useRef, useState } from "react";
import { PixelArtAvatar } from "../ui/PixelArtAvatar";
import { motion } from "framer-motion";
import { Share2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { type Transaction } from "../../db/schema";
import { evaluatePersona } from "../../utils/personaEvaluator";
import { formatMonthYear } from "../../utils/dateUtils";
import { Tooltip } from "../ui/Tooltip";
import { CollapsibleInsightCard } from "./CollapsibleInsightCard";
import toast from "react-hot-toast";

interface SpendingPersonaCardProps {
  transactions: Transaction[];
  monthYear: string;
}

export function SpendingPersonaCard({
  transactions,
  monthYear,
}: SpendingPersonaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const persona = evaluatePersona(transactions);

  const monthName = formatMonthYear(monthYear);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    const toastId = toast.loading("Preparing your persona card...");

    try {
      // Small delay to ensure render finishes
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        style: {
          transform: "scale(1)",
        },
        filter: (node) => {
          if (node.classList && node.classList.contains("no-export")) {
            return false;
          }
          return true;
        },
      });

      // Fetch the generated dataUrl as a blob for sharing
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
          text: `I've been analyzed as "${persona.title}" for ${monthName}! ${persona.statsHighlight} #buckflo`,
          files: [file],
        });
        toast.success("Shared successfully!", { id: toastId });
      } else {
        // Fallback: Download
        const link = document.createElement("a");
        link.download = `buckflo_persona_${monthYear}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Card downloaded! Share it with friends.", {
          id: toastId,
        });
      }
    } catch (err) {
      console.error("Failed to share persona:", err);
      toast.error("Could not generate sharing card", { id: toastId });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <CollapsibleInsightCard
      isOpen={isRevealed}
      onOpen={() => setIsRevealed(true)}
      title="Spending Persona"
      tooltipText="Analyzes this month's transactions locally to categorize your spending style."
      tooltipId="spending-persona-info"
      actionText="Reveal"
      icon={<Sparkles size={16} />}
      colorScheme="accent"
      delayClass="delay-1"
    >
      <div
        ref={cardRef}
        className="p-5 relative overflow-hidden flex flex-col gap-4.5"
      >

        {/* Background ambient light */}
        <div
          className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: persona.avatarColors[0] }}
        />

        {/* Header (rendered inside the open card container) */}
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-(--accent)/20 to-transparent flex items-center justify-center">
              <Sparkles size={16} className="text-(--accent)" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[13px] font-bold text-(--text) m-0 uppercase tracking-wider">
                Spending Persona
              </h3>
              <span className="no-export flex items-center">
                <Tooltip
                  id="spending-persona-tooltip"
                  text="Analyzes this month's transactions locally to categorize your spending style."
                  preferredPosition="top"
                />
              </span>
            </div>
          </div>

          {/* Clean top-right mobile action button */}
          <button
            disabled={isSharing}
            onClick={handleShare}
            className="no-export w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-(--text-secondary) hover:text-(--accent) active:scale-90 transition-transform cursor-pointer shrink-0"
            title="Share Card"
          >
            {isSharing ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Share2 size={13} />
            )}
          </button>
        </div>

        {/* Floating character layout */}
        <div className="flex flex-col items-center gap-4 relative z-10 w-full">
          <div className="flex flex-col items-center gap-3 text-center w-full">
            {/* Standalone Floating Pixel Mascot */}
            <div className="relative shrink-0 select-none py-1">
              <motion.div
                whileHover={{ scale: 1.12, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex items-center justify-center shrink-0"
              >
                <PixelArtAvatar
                  id={persona.id}
                  size={88}
                  colors={persona.avatarColors}
                />
              </motion.div>
            </div>

            {/* Archetype Title */}
            <div className="mt-1">
              <span className="text-[9px] font-bold text-(--accent) uppercase tracking-widest block mb-0.5 leading-none">
                Monthly Archetype
              </span>
              <h4 className="font-display italic text-3xl font-normal! text-(--text) tracking-wide m-0">
                {persona.title}
              </h4>
            </div>

            {/* Description */}
            <p className="text-[13px] text-(--text-secondary) leading-relaxed max-w-[320px] m-0 font-medium font-sans">
              {persona.description}
            </p>
          </div>

          {/* Key Metric Highlight */}
          <div className="w-full py-2.5 px-3.5 rounded-xl bg-black/5 dark:bg-white/4 border border-black/5 dark:border-white/5 flex flex-col gap-1.5 mt-1 text-left w-full">
            <span className="text-[8px] font-bold text-(--text-muted) uppercase tracking-wider leading-none">
              Key Metric
            </span>
            <span className="text-[11px] font-semibold text-(--accent) leading-normal whitespace-nowrap">
              {persona.statsHighlight}
            </span>
          </div>

          {/* Observation footer split */}
          <div className="w-full border-t border-black/5 dark:border-white/5 pt-3.5 mt-1 flex flex-col gap-1">
            <span className="text-[9px] font-bold text-(--text-muted) uppercase tracking-widest text-center">
              Mindful Observation
            </span>
            <p className="text-xs text-(--text-secondary) leading-relaxed text-center m-0 font-medium max-w-[320px] mx-auto">
              {persona.recommendation}
            </p>
          </div>
        </div>
      </div>
    </CollapsibleInsightCard>
  );
}
