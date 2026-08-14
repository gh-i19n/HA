"use client";

import { cn } from "../../lib/utils";
import * as React from "react";
import * as RechartsPrimitive from "recharts";

export interface DonutChartSegment {
  readonly key: string;
  readonly value: number;
  readonly color: string;
}

interface DonutChartProps {
  readonly segments: readonly DonutChartSegment[];
  readonly size?: number;
  readonly innerRadius?: number;
  readonly outerRadius?: number;
  readonly className?: string;
  readonly center?: React.ReactNode;
}

/**
 * Generic, data-driven donut chart. Domain meaning (what each segment
 * represents, its color, its label) is owned entirely by the caller —
 * this component only renders segments and an optional centered node.
 */
export function DonutChart({
  segments,
  size = 128,
  innerRadius = 42,
  outerRadius = 64,
  className,
  center,
}: DonutChartProps) {
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <RechartsPrimitive.ResponsiveContainer height="100%" width="100%">
        <RechartsPrimitive.PieChart>
          <RechartsPrimitive.Pie
            cx="50%"
            cy="50%"
            data={segments as DonutChartSegment[]}
            dataKey="value"
            innerRadius={innerRadius}
            nameKey="key"
            outerRadius={outerRadius}
            strokeWidth={0}
          >
            {segments.map((segment) => (
              <RechartsPrimitive.Cell fill={segment.color} key={segment.key} />
            ))}
          </RechartsPrimitive.Pie>
        </RechartsPrimitive.PieChart>
      </RechartsPrimitive.ResponsiveContainer>
      {center ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          {center}
        </div>
      ) : null}
    </div>
  );
}
