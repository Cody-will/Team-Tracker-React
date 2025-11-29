import { useState } from "react";
import bg from "./assets/default.webp";
import bgTwo from "./assets/default2.webp";
import bgThree from "./assets/default3.webp";
import bgFour from "./assets/default4.webp";
import bgFive from "./assets/default5.webp";

export const primaryAccent = "sky-500";
export const primaryAccentHex = "#0ea5e9";
export const secondaryAccent = "orange-500";
export const secondaryAccentHex = "#f97316";
export const backgroundImage = bgFour;
export const backgroundOptions = {
  0: { name: "Default 1", src: bg },
  1: { name: "Default 2", src: bgTwo },
  2: { name: "Default 3", src: bgThree },
  4: { name: "Default 4", src: bgFour },
  5: { name: "Default 5", src: bgFive },
};
