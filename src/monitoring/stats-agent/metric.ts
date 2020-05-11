export type MetricType = 'count' | 'gauge' | 'timing' | 'histogram' | 'set';
export interface Metric {
    metricName: string;
    value: number | string;
    metricType: MetricType;
    context?: { [key: string]: string };
    sampleRate?: number;
}