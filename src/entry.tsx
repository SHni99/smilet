import React from "react";
import ReactDOM from "react-dom/client";

import { NextUIProvider } from "@nextui-org/react";

import App from "./src/App";
import "./entry.css";

// Set the document title to the app name
try {
  document.title = "Smilet";
} catch (e) {
  // ignore server-side or non-browser environments
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <NextUIProvider>
    <App />
  </NextUIProvider>
);
