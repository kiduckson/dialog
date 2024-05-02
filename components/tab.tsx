import { motion, useMotionValue } from "framer-motion";
import React, { useRef } from "react";

/**
 * TODO:
 * 1. tab out of the window
 * x threshhold =
 * if
 */

export default function Tab({ order, id, title, updateTabOrder }) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  //   console.log(
  //     order,
  //     x.get(),
  //     y.get(),
  //     ref.current?.clientWidth,
  //     ref.current?.offsetLeft,
  //     ref.current
  //   );
  x.on("change", (latest) => {
    const shiftInOrder = Math.round(latest / 96);
    updateTabOrder(order, shiftInOrder);
  });

  return (
    <motion.span
      ref={ref}
      className="bg-stone-600 rounded-t-lg hover:bg-slate-700 corner px-4 w-24 min-w-12 truncate"
      drag="x"
      style={{
        x,
        y,
      }}
      layoutId={order}
      layout
      dragElastic={false}
      dragMomentum={false}
      dragSnapToOrigin
    >
      {title} {order}
    </motion.span>
  );
}
