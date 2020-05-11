import React, {
  Profiler as ReactProfiler,
  ProfilerProps as ReactProfilerProps,
  ProfilerOnRenderCallback,
  ReactNode,
} from "react";
import { datadogLogs } from "@datadog/browser-logs";

interface ProfilerProps {
  id: ReactProfilerProps["id"];
  children: ReactNode;
}

const onRenderChildren: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration
) => {
  console.log(id, phase, actualDuration);
  datadogLogs.logger.info(`react profiler - component ${id} rendered for ${actualDuration} on ${phase}`, {
    performanceEntryType: 'reactprofiler',
    duration: actualDuration,
    react: {
        component: id,
        phase,
    }
  });
};

export const ReactProfilerProd = ({ id, children }: ProfilerProps) => {
  return (
    <ReactProfiler id={id} onRender={onRenderChildren}>
      {children}
    </ReactProfiler>
  );
};
