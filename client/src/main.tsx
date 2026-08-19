import { createRoot } from "react-dom/client";
import StandaloneApp from "./StandaloneApp";
import "./index.css";
import "./global-error-handler";

createRoot(document.getElementById("root")!).render(<StandaloneApp />);
