import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, RouterProvider } from "react-router-dom";

//if (typeof window !== "undefined") {
//  const isIOS =
//   /iPad|iPhone|iPod/.test(navigator.userAgent) ||
//    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
//
//  if (isIOS) {
//    import("vconsole").then(({ default: VConsole }) => {
//      new VConsole();
//      console.log("[vConsole] enabled");
//    });
//  }
//}
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
