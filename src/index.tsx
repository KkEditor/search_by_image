import React, { Fragment } from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { DeviceDetectProvider } from "./assets/lib/context/DeviceDetectContext";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <DeviceDetectProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<App />} />
          <Route path="/:id" element={<div>hehe</div>} />
        </Routes>
      </Router>
    </DeviceDetectProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
