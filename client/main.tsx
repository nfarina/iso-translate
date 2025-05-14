import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./base.css";
import App from "./components/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
