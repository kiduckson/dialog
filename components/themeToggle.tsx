"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const ROTATE_DEG = 45;
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mount, setMount] = React.useState(false);
  const rotateDeg = React.useRef(-ROTATE_DEG);

  const handleOnClick = () => {
    rotateDeg.current = (rotateDeg.current += ROTATE_DEG) % 360;
    setTheme(theme === "dark" ? "light" : "dark");
  };

  console.log("rotateDeg", rotateDeg.current);

  React.useEffect(() => {
    setMount(true);
  }, []);

  return (
    <Button
      variant="outline"
      size="xs"
      className="px-4"
      onClick={handleOnClick}
    >
      {!mount ? (
        <>
          <Sun className="h-[1.2em] w-[1.2em] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2em] w-[1.2em] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          {theme === "dark" ? (
            <motion.span
              key={"dark" + rotateDeg.current}
              initial={{ opacity: 0, rotate: rotateDeg.current, scale: 1 }}
              animate={{
                opacity: 1,
                rotate: rotateDeg.current + ROTATE_DEG,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                rotate: rotateDeg.current + ROTATE_DEG * 2,
                scale: 1,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Moon className="h-[1.2em] w-[1.2em]" />
            </motion.span>
          ) : (
            <motion.span
              key={"light" + rotateDeg.current}
              initial={{
                opacity: 0,
                rotate: rotateDeg.current - ROTATE_DEG,
                scale: 1,
              }}
              animate={{ opacity: 1, rotate: rotateDeg.current, scale: 1 }}
              exit={{
                opacity: 0,
                rotate: rotateDeg.current + ROTATE_DEG,
                scale: 1,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Sun className="h-[1.2em] w-[1.2em]" />
            </motion.span>
          )}
        </AnimatePresence>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
