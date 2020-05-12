import { Metric } from "./metric";
import {
  computeCount,
  computeGauge,
  computeSet,
  computeHistogram,
} from "./compute-metric";
import { datadogLogs } from "@datadog/browser-logs";

interface MetricContext {
  [metricId: string]: Metric[];
}

interface TagMap {
  [tag: string]: string;
}

interface ContextMap {
  [context: string]: MetricContext;
}

interface Histogram {
  avg: number;
  median: number;
  max: number;
  min: number;
  p95: number;
}

interface MetricMessage {
  timestamp: number;
  metrics: {
    [metricName: string]: number | Histogram;
  };
}

let buffer: Metric[] = [];
interface UserAction {
  name: string;
  timestamp: number;
  actionContext?: { [key: string]: string | number };
}
const actionsQueue: UserAction[] = [{ name: "PAGE_LOAD", timestamp: Date.now() }];

class MetricsAgent {
  start = () => {
    window.addEventListener("beforeunload", () => {
      this.flushMetrics();
    });
  };
  groupByContext = (metricsEvents: Metric[]) => {
    const contextMap: ContextMap = {};
    metricsEvents.forEach((metric) => {
      let context = "no-context";
      if (metric.context !== undefined) {
        const metricContext = metric.context as { [key: string]: string };
        context = Object.keys(metric.context)
          .map((key) => `${key}:${metricContext[key]}`)
          .join("|");
      }
      if (!contextMap[context]) {
        contextMap[context] = {};
      }
      const metricId = `${metric.metricName}.${metric.metricType}`;
      if (!contextMap[context][metricId]) {
        contextMap[context][metricId] = [];
      }
      contextMap[context][metricId].push(metric);
    });
    return contextMap;
  };

  getTagsInLogsFormat = (tags: string[]) => {
    const keyValues = tags.map((tag) => {
      const splitTag = tag.split(":");
      return {
        key: splitTag[0],
        value: splitTag.slice(1).join(":"),
      };
    });
    const tagMap: TagMap = {};
    keyValues.forEach((keyValue) => {
      tagMap[keyValue.key] = keyValue.value;
    });
    return tagMap;
  };

  sendContext = (
    action: UserAction,
    contextKey: string,
    context: MetricContext
  ) => {
    const log: MetricMessage = {
      timestamp: action.timestamp,
      metrics: {},
    };

    let contextMetadata: {
      [key: string]: string;
    } = {};
    let metricName = 'unknown';

    Object.keys(context).forEach((metricId, index) => {
      // should all be the same as we grouped by this before
      if (index === 0) {
        contextMetadata = context[metricId][0].context || {};
        metricName = context[metricId][0].metricName;
      }
      this.computeMetric(log, metricId, context[metricId]);
    });
    const actionContextString = action.actionContext
      ? Object.keys(action.actionContext)
          .map((key: string) => `${key}:${(action.actionContext as any)[key]}`)
          .join("|")
      : "";
    datadogLogs.logger.info(
      `ACTION: ${action.name} ${actionContextString} METRICS: ${Object.keys(
        context
      ).join("|")} CONTEXT: ${contextKey}`,
      {
        action: action.name,
        metric: metricName,
        actionContext: action.actionContext,
        performanceEntryType: "stats-agent",
        timestamp: log.timestamp,
        metrics: log.metrics as any,
        ...contextMetadata,
      }
    );
  };

  computeMetric = (log: MetricMessage, metricId: string, metrics: Metric[]) => {
    const metricType = metrics[0].metricType;
    switch (metricType) {
      case "count":
        log.metrics[metricId] = computeCount(metrics);
        break;
      case "gauge":
        log.metrics[metricId] = computeGauge(metrics);
        break;
      case "set":
        log.metrics[metricId] = computeSet(metrics);
        break;
      case "histogram":
      case "timing":
        log.metrics[metricId] = computeHistogram(metrics);
        break;
      default:
        break;
    }
  };

  flushMetrics = () => {
    const action = actionsQueue.shift() as UserAction;
    const bufferToSend = [...buffer];
    buffer = [];
    const contextMap = this.groupByContext(bufferToSend);
    Object.keys(contextMap).forEach((contextKey) => {
      this.sendContext(action, contextKey, contextMap[contextKey]);
    });
  };
}
const internalMetricsAgent = new MetricsAgent();
internalMetricsAgent.start();

export const agent = {
  // register metric
  addMetricPoint: (metric: Metric) => {
    buffer.push(metric);
  },
  markUserAction: (
    name: UserAction["name"],
    actionContext?: UserAction["actionContext"]
  ) => {
    // flush metrics to link them to the previous action that triggered them
    internalMetricsAgent.flushMetrics();
    // add new action to the queue to be the next one flushed
    actionsQueue.push({ name, actionContext: actionContext, timestamp: Date.now() });
  },
};
