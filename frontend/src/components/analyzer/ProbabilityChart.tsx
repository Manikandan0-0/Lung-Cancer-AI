import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ClassProbability } from '../../types/api';
import { BarChart3, Info } from 'lucide-react';

interface ProbabilityChartProps {
  probabilities: ClassProbability[];
  predictedClass: string;
}

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
  predictedClass,
}) => {
  // Format data for Recharts horizontal bar chart
  const data = probabilities.map((item) => ({
    name: item.className,
    score: item.score,
    percentage: parseFloat((item.score * 100).toFixed(1)),
    isPredicted: item.className === predictedClass || item.isPredicted,
  }));

  return (
    <div className="rounded-2xl bg-[#253237] border border-[#5C6B73]/40 p-6 sm:p-7 shadow-xl backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#5C6B73]/30 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#5C6B73]/30 text-[#9DB4C0]">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Probability Distribution
            </h3>
            <p className="text-xs text-[#C2DFE3]">
              Softmax categorical distribution across all 4 target classes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#E0FBFC]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#9DB4C0]" />
            Predicted Class
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#5C6B73]/60" />
            Other Classes
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="rgba(144, 224, 239, 0.1)"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              stroke="#C2DFE3"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(92, 107, 115, 0.5)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#E0FBFC"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={160}
            />
            <Tooltip
              formatter={(value: any) => [`${value}%`, 'Output Score']}
              contentStyle={{
                backgroundColor: '#253237',
                borderColor: '#9DB4C0',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              }}
              cursor={{ fill: 'rgba(157, 180, 192, 0.12)' }}
            />
            <Bar
              dataKey="percentage"
              radius={[0, 8, 8, 0]}
              barSize={24}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPredicted ? '#9DB4C0' : '#5C6B73'}
                  opacity={entry.isPredicted ? 1 : 0.65}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Numerical breakdown table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#5C6B73]/30">
        {data.map((item) => (
          <div
            key={item.name}
            className={`p-2.5 rounded-xl border text-center transition-colors ${
              item.isPredicted
                ? 'bg-[#5C6B73]/30 border-[#9DB4C0] text-white'
                : 'bg-[#1b2529]/60 border-white/5 text-[#C2DFE3]'
            }`}
          >
            <p className="text-[11px] truncate font-medium">{item.name}</p>
            <p className="text-base font-bold mt-0.5 text-white">
              {item.percentage}%
            </p>
            <p className="text-[10px] text-[#E0FBFC]/70 font-mono">
              Score: {item.score.toFixed(3)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 pt-2 text-[11px] text-[#C2DFE3]">
        <Info className="w-3.5 h-3.5 text-[#9DB4C0] shrink-0 mt-0.5" />
        <p className="leading-snug">
          Values represent ResNet50 softmax posterior output scores, not clinically calibrated probabilities.
        </p>
      </div>
    </div>
  );
};
