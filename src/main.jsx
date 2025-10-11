import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

// Pastikan elemen root tersedia
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element not found! Pastikan index.html punya <div id='root'></div>"
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
