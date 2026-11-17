import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { TestAttemptRecord } from '../types/quiz';
import { DIFFICULTY_LABELS } from '../types/quiz';

interface NetProgressionChartProps {
  attempts: TestAttemptRecord[];
}

interface NetChartPoint {
  label: string;
  testNumber: number;
  netScore: number;
  averageNet: number;
  topicTitle: string;
  exam: string;
  difficultyLabel: string;
  questionCount: number;
  dateLabel: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    payload?: NetChartPoint;
  }>;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md px-3.5 py-2.5 text-xs space-y-1.5 max-w-[240px]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
        <span className="font-semibold text-slate-900">
          {point.testNumber}. Test · {point.exam}
        </span>
        <span className="text-[11px] text-slate-500 tabular-nums">
          {point.dateLabel}
        </span>
      </div>
      <p className="font-medium text-slate-700 leading-snug">
        {point.topicTitle} ({point.difficultyLabel}, {point.questionCount} soru)
      </p>
      <div className="flex items-center justify-between gap-4 pt-0.5 tabular-nums font-mono">
        <span className="text-[#4B2E6B] font-semibold">
          Test Neti: {point.netScore}
        </span>
        <span className="text-[#C2591D] font-semibold">
          Ort: {point.averageNet}
        </span>
      </div>
    </div>
  );
};

export const NetProgressionChart: React.FC<NetProgressionChartProps> = ({
  attempts,
}) => {
  const chartData = useMemo<NetChartPoint[]>(() => {
    if (attempts.length === 0) return [];

    const chronological = [...attempts].sort(
      (a, b) =>
        new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    let cumulativeSum = 0;
    const allPoints: NetChartPoint[] = chronological.map((att, index) => {
      cumulativeSum += att.netScore;
      const runningAvg = Number((cumulativeSum / (index + 1)).toFixed(2));
      const testNumber = index + 1;

      return {
        label: `#${testNumber}`,
        testNumber,
        netScore: Number(att.netScore.toFixed(2)),
        averageNet: runningAvg,
        topicTitle: att.topicTitle,
        exam: att.exam,
        difficultyLabel: DIFFICULTY_LABELS[att.difficulty],
        questionCount: att.questionCount,
        dateLabel: new Date(att.completedAt).toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    return allPoints.slice(-10);
  }, [attempts]);

  const latestAverage =
    chartData.length > 0 ? chartData[chartData.length - 1].averageNet : 0;

  return (
    <section
      aria-labelledby="net-progression-heading"
      className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Zaman İçindeki Performans
          </p>
          <h2
            id="net-progression-heading"
            className="font-display text-xl font-bold text-slate-900 mt-0.5"
          >
            Son 10 Test Net Gelişimi
          </h2>
        </div>

        {chartData.length > 0 && (
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <span className="inline-flex items-center gap-2 font-medium text-slate-700">
              <span
                className="w-3 h-0.5 bg-[#4B2E6B] inline-block rounded-full"
                aria-hidden="true"
              />
              Test Neti
            </span>
            <span className="inline-flex items-center gap-2 font-medium text-slate-700">
              <span
                className="w-3 h-0.5 border-t-2 border-dashed border-[#C2591D] inline-block"
                aria-hidden="true"
              />
              Net Ortalaması ({latestAverage})
            </span>
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Henüz tamamlanmış test verisi yok. Test çözdükçe son 10 testinizin net puanı ve net ortalamanız burada çizgi grafik olarak görüntülenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="netScore"
                  name="Test Neti"
                  stroke="#4B2E6B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#4B2E6B', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 6, fill: '#4B2E6B', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="averageNet"
                  name="Net Ortalaması"
                  stroke="#C2591D"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: '#C2591D', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                  activeDot={{ r: 5, fill: '#C2591D', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {chartData.length === 1 && (
            <p className="text-xs text-slate-500 text-center">
              Gelişim çizgisinin oluşması için en az bir test daha çözün; şu anda ilk test sonucunuz gösteriliyor.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
