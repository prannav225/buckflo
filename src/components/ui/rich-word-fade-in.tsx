"use client";

import { motion } from "framer-motion";

export interface WordSegment {
  text: string;
  className?: string;
}

export function RichWordFadeIn({
  segments,
  delay = 0.15,
}: {
  segments: WordSegment[];
  delay?: number;
}) {
  const words = segments.flatMap((seg) =>
    seg.text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, className: seg.className }))
  );

  const variants = {
    hidden: { opacity: 0, filter: "blur(4px)", y: 4 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.04,
            delayChildren: delay,
          },
        },
      }}
      className="inline-block"
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={variants}
          className={`inline-block ${w.className || ""}`}
          style={{ marginRight: "0.25em" }}
          transition={{ duration: 0.3 }}
        >
          {w.word}
        </motion.span>
      ))}
    </motion.div>
  );
}
