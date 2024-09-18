'use client';
import React, { useMemo } from 'react';
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
  CartesianGrid,
  AreaChart,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
} from '@/components/ui/chart';
import {
  getEstimatedCashflowForDateRange,
  Transaction,
} from '@/lib/transaction';

const chartConfig = {
  amount: {
    label: 'Net Cash Flow',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface CashFlowChartProps {
  data: Transaction[];
  endDate: Date;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const amount = payload[0].value;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount as number);
    const date = new Date(label).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return (
      <div className="p-2 border border-primary rounded shadow">
        <p>{formattedAmount}</p>
        <p>{date}</p>
      </div>
    );
  }
  return null;
};

const formatXAxisTick = (tickItem: number) => {
  const date = new Date(tickItem);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

const formatYAxisTick = (tickItem: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
  }).format(tickItem);
};

export const CashFlowChart = ({ data, endDate }: CashFlowChartProps) => {
  const chartData = useMemo(() => {
    return getEstimatedCashflowForDateRange(
      data,
      endDate
    );
  }, [data, endDate]);

  const isHidden = useMemo(() => {
    return data.length === 0
  }, [data]);

  const xAxisTicks = useMemo(() => {
    if (chartData.length === 0) return [];
    
    const firstDate = new Date(chartData[0].date);
    const lastDate = new Date(chartData[chartData.length - 1].date);
    const ticks = [];

    ticks.push(firstDate.getTime());
    for (let d = new Date(firstDate); d <= lastDate; d.setMonth(d.getMonth() + 3)) {
      ticks.push(d.getTime());
    }
    ticks.push(lastDate.getTime());
    
    return ticks;
  }, [chartData]);

  return (
    <div className="relative min-h-[200px] w-full">
      <ChartContainer config={chartConfig} className='min-h-[200px] w-full'>
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 0, right: 12, bottom: 0, left: 12 }}
          ><CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey='date'
            tickLine={false}
            axisLine={true}
            tickMargin={8}
            tickFormatter={formatXAxisTick}
            ticks={xAxisTicks}
            hide={isHidden}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            hide={isHidden}
            tickLine={false}
            axisLine={true}
            tickMargin={8}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            dataKey='amount'
            type='monotone'
            stroke='hsl(var(--chart-1))'
            dot={false}
            strokeWidth={2}
            hide={isHidden}
          />
        </LineChart>
      </ChartContainer>
      {isHidden && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-lg font-medium">No Data Available</p>
        </div>
      )}
    </div>
  );
}