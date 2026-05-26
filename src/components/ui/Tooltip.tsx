import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import { useTooltipContext } from "../../context/TooltipContext";

interface TooltipProps {
  id: string;
  text: string;
  preferredPosition?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  id,
  text,
  preferredPosition = "bottom",
}: TooltipProps) {
  const { activeTooltipId, setActiveTooltipId } = useTooltipContext();
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(preferredPosition);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isVisible = activeTooltipId === id;

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVisible) {
      setActiveTooltipId(null);
    } else {
      setActiveTooltipId(id);
    }
  };

  // Handle positioning
  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;

      if (!trigger || !tooltip) {
        setActiveTooltipId(null);
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;
      let pos = preferredPosition;

      // Spacing between trigger and tooltip
      const gap = 12;

      // Calculate base positions
      if (pos === "bottom") {
        top = triggerRect.bottom + scrollY + gap;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        // Flip to top if not enough space at bottom
        if (top + tooltipRect.height - scrollY > window.innerHeight) {
          pos = "top";
          top = triggerRect.top + scrollY - tooltipRect.height - gap;
        }
      } else if (pos === "top") {
        top = triggerRect.top + scrollY - tooltipRect.height - gap;
        left =
          triggerRect.left +
          scrollX +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        if (top - scrollY < 0) {
          pos = "bottom";
          top = triggerRect.bottom + scrollY + gap;
        }
      }

      // Constrain horizontal bounds
      const padding = 16; // safe area padding
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }

      setCoords({ top, left });
      setActualPosition(pos);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isVisible, preferredPosition, setActiveTooltipId]);

  // Handle auto-dismissal
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setActiveTooltipId(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible, setActiveTooltipId]);

  // Close if user taps anywhere else
  useEffect(() => {
    if (!isVisible) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (triggerRef.current && triggerRef.current.contains(e.target as Node)) {
        return; // Ignore clicks on the trigger itself
      }
      if (tooltipRef.current && tooltipRef.current.contains(e.target as Node)) {
        return; // Ignore clicks inside the tooltip itself
      }
      setActiveTooltipId(null);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isVisible, setActiveTooltipId]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={toggleTooltip}
        type="button"
        className="inline-flex items-center justify-center p-1 rounded-full text-(--text-muted) hover:text-(--text) hover:bg-(--bg-glass) transition-colors cursor-pointer border-0 bg-transparent align-middle outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
        aria-label="More info"
      >
        <HelpCircle size={14} />
      </button>

      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`fixed z-9999 max-w-[240px] p-3 bg-[#2a2927] border border-(--accent)/40 rounded-lg shadow-xl shadow-black/20 text-[#f5f5f3] text-xs font-sans animate-fade-in pointer-events-auto leading-relaxed`}
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pointer Arrow */}
            <div
              className="absolute w-0 h-0 border-[6px] border-transparent"
              style={{
                ...(actualPosition === "bottom"
                  ? {
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderBottomColor: "rgba(255,102,0,0.4)", // Match --claude-orange 40%
                    }
                  : {
                      bottom: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderTopColor: "rgba(255,102,0,0.4)",
                    }),
              }}
            />
            <div
              className="absolute w-0 h-0 border-[5px] border-transparent"
              style={{
                ...(actualPosition === "bottom"
                  ? {
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderBottomColor: "#2a2927",
                    }
                  : {
                      bottom: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      borderTopColor: "#2a2927",
                    }),
              }}
            />

            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
