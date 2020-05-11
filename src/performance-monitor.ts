import { datadogLogs } from "@datadog/browser-logs";

export const startLongTaskObserver = () => {
  var observer = new PerformanceObserver(function (list) {
    var perfEntries = list.getEntries();
    for (var i = 0; i < perfEntries.length; i++) {
      const longtask = perfEntries[i];
      console.log(longtask);
      if (longtask.entryType === "longtask") {
        datadogLogs.logger.info("longtask detected", {
          duration: longtask.duration,
          performanceEntryType: longtask.entryType,
          startTime: longtask.startTime,
        });
      }
    }
  });
  // register observer for long task notifications
  observer.observe({ entryTypes: ["longtask", "mark"] });
};
