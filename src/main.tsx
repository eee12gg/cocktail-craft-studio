/**
 * Application entry point.
 * Mounts the React app into the #root DOM element.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
