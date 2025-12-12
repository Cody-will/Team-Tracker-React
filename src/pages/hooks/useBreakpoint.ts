// src/hooks/useBreakpoint.ts
import { useEffect, useState } from "react";

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  hd: 1080, // your custom 1080 width
  xl: 1280,
  "2xl": 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

type BreakpointState = {
  width: number;
  height: number;

  // width-based (Tailwind-style)
  smUp: boolean;
  mdUp: boolean;
  lgUp: boolean;
  hdUp: boolean;
  xlUp: boolean;
  twoXlUp: boolean;
  isBelowHd: boolean;
  currentMin: BreakpointKey | null;

  // height-based desktop helpers
  isDesktop: boolean;
  isShortDesktop: boolean; // e.g. 1366×768
  isTallDesktop: boolean; // e.g. 1920×1080
  isMiddleDesktop: boolean;
};

function getWindowSize() {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }
  const vv = window.visualViewport;
  return {
    width: vv?.width ?? window.innerWidth,
    height: vv?.height ?? window.innerHeight,
  };
}

export function useBreakpoint(): BreakpointState {
  const [size, setSize] = useState(getWindowSize);

  useEffect(() => {
    const handleResize = () => {
      setSize(getWindowSize());
    };

    handleResize(); // sync on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = size;

  // width logic
  const smUp = width >= BREAKPOINTS.sm;
  const mdUp = width >= BREAKPOINTS.md;
  const lgUp = width >= BREAKPOINTS.lg;
  const hdUp = width >= BREAKPOINTS.hd;
  const xlUp = width >= BREAKPOINTS.xl;
  const twoXlUp = width >= BREAKPOINTS["2xl"];
  const isBelowHd = width < BREAKPOINTS.hd;

  let currentMin: BreakpointKey | null = null;
  (Object.keys(BREAKPOINTS) as BreakpointKey[]).forEach((key) => {
    if (width >= BREAKPOINTS[key]) {
      currentMin = key;
    }
  });


  // height logic – only care when it's truly "desktop width"
  const isDesktop = width >= BREAKPOINTS.lg; // >= 1024 wide

  // tune these thresholds how you like:
  const isTallDesktop = isDesktop && height >= 900; // 1080, 1200, etc.
  const isShortDesktop = isDesktop && height <= 800; // 768ish
  const isMiddleDesktop = isDesktop && !isTallDesktop && !isShortDesktop;

  return {
    width,
    height,
    smUp,
    mdUp,
    lgUp,
    hdUp,
    xlUp,
    twoXlUp,
    isBelowHd,
    currentMin,
    isDesktop,
    isShortDesktop,
    isTallDesktop,
    isMiddleDesktop,
  };
}
