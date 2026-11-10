import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRoot } from "./app/AppRoot";
import "./presentation/styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("GameHub root element is missing.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
);
