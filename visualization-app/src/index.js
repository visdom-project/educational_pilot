import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

/**
 * Entrypoint into the visualization app. The root element is a div 
 * that is drawn on the page, and the actual contents of the application
 * is rendered inside it. Check App.js next.
 */
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
