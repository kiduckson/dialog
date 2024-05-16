import { useState, useEffect, useMemo } from "react";

const useDragConstraints = (ref?: React.RefObject<HTMLElement>) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 1200,
    height: 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions({
        width: globalThis.innerWidth,
        height: globalThis.innerHeight,
      });
    }

    if (typeof globalThis !== "undefined") {
      setWindowDimensions({
        width: globalThis.innerWidth,
        height: globalThis.innerHeight,
      });
      globalThis.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof globalThis !== "undefined") {
        globalThis.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  const constraints = useMemo(() => {
    const refWidth = ref?.current?.offsetWidth ?? 0;
    const refHeight = ref?.current?.offsetHeight ?? 0;

    return {
      right: windowDimensions.width - (windowDimensions.width - refWidth),
      bottom: windowDimensions.height - (windowDimensions.height - refHeight),
    };
  }, [windowDimensions, ref]);

  return constraints;
};

export default useDragConstraints;
