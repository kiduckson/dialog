import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DialogEnlargedType, DialogPosition } from "@/components/windowDialog/types";

const ENLARGE_THRESHOLD = 20;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFixedDirection(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): [Exclude<DialogEnlargedType, "full">, DialogPosition] {
  const leftCond = x < -ENLARGE_THRESHOLD;
  const rightCond = x > containerWidth + ENLARGE_THRESHOLD;
  const topCond = y < -ENLARGE_THRESHOLD / 2;
  const bottomCond = y > containerHeight - ENLARGE_THRESHOLD / 2;

  const conditions = [
    { cond: topCond && leftCond, direction: "topLeft" },
    { cond: topCond && rightCond, direction: "topRight" },
    { cond: bottomCond && leftCond, direction: "bottomLeft" },
    { cond: bottomCond && rightCond, direction: "bottomRight" },
    { cond: leftCond, direction: "left" },
    { cond: rightCond, direction: "right" },
    { cond: topCond, direction: "top" },
    { cond: bottomCond, direction: "bottom" },
  ];

  let direction = "center";

  for (const condition of conditions) {
    if (condition.cond) {
      direction = condition.direction;
      break;
    }
  }

  const cordinates = {
    x: /(right)/i.test(direction) ? containerWidth / 2 : 0,
    y: /(bottom)/i.test(direction) ? containerHeight / 2 : 0,
    width: /(right|left)/i.test(direction) ? containerWidth / 2 : containerWidth,
    height: /(top|bottom)/i.test(direction) ? containerHeight / 2 : containerHeight,
  };

  return [direction as Exclude<DialogEnlargedType, "full">, cordinates];
}
