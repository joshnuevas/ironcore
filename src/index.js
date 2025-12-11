// ✅ All imports FIRST
import "./disableConsole";
import { enableDevToolsWarning } from "./utils/devtoolsWarning";

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// ✅ Run the warning AFTER imports
enableDevToolsWarning();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
