import React, {
  Profiler as ReactProfiler,
  ProfilerProps as ReactProfilerProps,
  ProfilerOnRenderCallback,
  ReactNode,
} from "react";
import { datadogLogs } from "@datadog/browser-logs";
import { agent } from "./stats-agent";
interface ProfilerProps {
  id: ReactProfilerProps["id"];
  children: ReactNode;
}

const REACT_RENDER_METRIC = "react_render";

const onRenderChildren: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration
) => {
  // local logging
  console.log(id, phase, actualDuration);
  // render logs to log management
  datadogLogs.logger.info(
    `react profiler - component ${id} rendered for ${actualDuration} on ${phase}`,
    {
      performanceEntryType: "reactprofiler",
      duration: actualDuration,
      react: {
        component: id,
        phase,
      },
    }
  );

  // aggregate with user actions before sending
  // count number of renders
  agent.addMetricPoint({
    metricName: REACT_RENDER_METRIC,
    metricType: "count",
    value: 1,
    context: {
      'react.id': id, // identify the component
      'react.phase': phase, // update vs mount
    },
  });
  // compute p99 avg... render timings
  agent.addMetricPoint({
    metricName: REACT_RENDER_METRIC,
    metricType: "timing",
    value: actualDuration,
    context: {
      'react.id': id, // identify the component
      'react.phase': phase, // update vs mount
    },
  });
};

export const ReactProfilerProd = ({ id, children }: ProfilerProps) => {
  return (
    <ReactProfiler id={id} onRender={onRenderChildren}>
      {children}
    </ReactProfiler>
  );
};
