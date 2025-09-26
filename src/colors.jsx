import { useState } from "react";
import bg from "./assets/background.svg";
import bgTwo from "./assets/background2.jpg";
import bgThree from "./assets/background3.jpg";

export const primaryAccent = "sky-500";
export const primaryAccentHex = "#0ea5e9";
export const secondaryAccent = "orange-500";
export const secondaryAccentHex = "#f97316";
export const backgroundImage = bg;
export const backgroundOptions = {
  0: { name: "Background 1", src: bg },
  1: { name: "Background 2", src: bgTwo },
  2: { name: "Background 3", src: bgThree },
};
