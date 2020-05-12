import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { datadogLogs } from "@datadog/browser-logs";

datadogLogs.init({
  clientToken: "pubf7c8eec264a69c5aa69ad6fec1bb36b7",
  datacenter: "us",
  isCollectingError: true,
  sampleRate: 100,
});
declare global {
  interface Window {
    _DATADOG_SYNTHETICS_BROWSER: any;
  }
}
datadogLogs.addLoggerGlobalContext(
  "is_a_robot",
  window._DATADOG_SYNTHETICS_BROWSER != null
);

datadogLogs.logger.info("Javascript loaded - React Performance Monitoring");

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
