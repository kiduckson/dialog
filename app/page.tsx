"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [enlarged, setEnlarged] = useState(false);

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    setEnlarged((prev) => !prev);
  };

  const handleDrag = (e) => {
    console.log("handle drag");

    console.log(e);
  };

  const grid =
    "lg:grid-cols-[repeat(16,_minmax(0,_1fr))] lg:grid-rows-[repeat(16,_minmax(0,_1fr))] md:grid-cols-[repeat(12,_minmax(0,_1fr))] lg:grid-rows-[repeat(12,_minmax(0,_1fr))] ";

  return (
    <main className="flex min-h-screen min-w-screen flex-col items-center justify-between p-12 bg-background">
      <div
        className={`relative grid ${grid} h-dvh w-full bg-background border p-10`}
      >
        <motion.div
          className={`flex flex-col absolute ${
            enlarged ? "col-span-8 row-span-8" : "col-span-4 row-span-4"
          } border`}
          layout
          draggable
          onDrag={handleDrag}
        >
          <motion.span
            layout
            className="flex items-center justify-center h-8 border-b p-1 cursor-pointer select-none font-thin bg-background"
            tabIndex={-1}
            onDoubleClick={handleDoubleClick}
          >
            Header
          </motion.span>
        </motion.div>
      </div>
    </main>
  );
}
