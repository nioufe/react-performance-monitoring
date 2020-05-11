import { Metric } from './metric';

export const computeCount = (metrics: Metric[]): number => {
    return metrics.reduce(
        (currentCount: number, metric) =>
            currentCount + (metric.value as number),
        0
    );
};

export const computeGauge = (metrics: Metric[]): number => {
    return metrics.reduce((currentCount: number, metric) => {
        if (typeof metric.value === 'string') {
            return currentCount + parseInt(metric.value, 10);
        }
        return metric.value;
    }, 0);
};

export const computeSet = (metrics: Metric[]): number => {
    const set = new Set(metrics.map(metric => metric.value));
    return set.size;
};

const getPercentile = (sortedMetrics: Metric[], percentile: number): number => {
    if (sortedMetrics.length === 1) {
        return sortedMetrics[0].value as number;
    }
    const rank = (percentile / 100) * (sortedMetrics.length - 1);
    const integer = Math.floor(rank);
    const rankFraction = rank - integer;
    const element = sortedMetrics[integer];
    const nextElement = sortedMetrics[integer + 1];
    return (
        (element.value as number) +
        rankFraction *
            ((nextElement.value as number) - (element.value as number))
    );
};

export const computeHistogram = (metrics: Metric[]) => {
    const sortedMetrics = metrics.sort((a, b) => {
        return (a.value as number) - (b.value as number);
    });

    return {
        avg:
            sortedMetrics.reduce(
                (sum, metric) => sum + (metric.value as number),
                0
            ) / sortedMetrics.length,
        median: getPercentile(sortedMetrics, 50),
        max: sortedMetrics[sortedMetrics.length - 1].value as number,
        min: sortedMetrics[0].value as number,
        p95: getPercentile(sortedMetrics, 95)
    };
};