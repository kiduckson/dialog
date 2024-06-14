function getFixedDirection(
  x: number,
  y: number,
  containerWidth: number,
  containerHeight: number
): [Exclude<EnlargedType, "full">, boolean, ICordinate] {
  const leftCond = x < -ENLARGE_THRESHOLD;
  const rightCond = x > containerWidth + ENLARGE_THRESHOLD;
  const topCond = y < -ENLARGE_THRESHOLD / 2;
  const bottomCond = y > containerHeight + ENLARGE_THRESHOLD / 2;

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
  let display = false;

  for (const condition of conditions) {
    if (condition.cond) {
      direction = condition.direction;
      display = true;
      break;
    }
  }

  const cordinates = {
    x: /(right)/i.test(direction) ? containerWidth / 2 : 0,
    y: /(bottom)/i.test(direction) ? containerHeight / 2 : 0,
    width: /(right|left)/i.test(direction)
      ? containerWidth / 2
      : containerWidth,
    height: /(top|bottom)/i.test(direction)
      ? containerHeight / 2
      : containerHeight,
  };

  return [direction as Exclude<EnlargedType, "full">, display, cordinates];
}
