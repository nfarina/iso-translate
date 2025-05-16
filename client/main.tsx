import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./base.css";
import App from "./components/App";
import "./utils/firebase"; // Import Firebase initialization
import { trackPageView } from "./utils/firebase";

// Track initial page view
trackPageView(window.location.pathname);

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
