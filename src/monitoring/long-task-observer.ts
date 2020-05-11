import { datadogLogs } from "@datadog/browser-logs";
import { agent } from "./stats-agent";

const LONG_TASK_METRIC = "long_task";

export const startLongTaskObserver = () => {
  var observer = new PerformanceObserver(function (list) {
    var perfEntries = list.getEntries();
    for (var i = 0; i < perfEntries.length; i++) {
      const longtask = perfEntries[i];
      //  local log
      console.log(longtask);
      // send to log management app
      if (longtask.entryType === "longtask") {
        datadogLogs.logger.info("longtask detected", {
          duration: longtask.duration,
          performanceEntryType: longtask.entryType,
          startTime: longtask.startTime,
        });
      }
      // compute aggregated timings for longtasks
      // number of long tasks
      agent.addMetricPoint({
        metricName: LONG_TASK_METRIC,
        metricType: "count",
        value: 1,
      });
      // compute p99 avg... 
      agent.addMetricPoint({
        metricName: LONG_TASK_METRIC,
        metricType: "timing",
        value: longtask.duration,
      });
    }
  });
  // register observer for long task notifications
  observer.observe({ entryTypes: ["longtask"] });
};
