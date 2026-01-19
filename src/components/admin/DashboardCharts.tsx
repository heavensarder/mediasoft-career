'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, subDays } from 'date-fns';

// --- Types ---
interface ChartData {
    name: string;
    value: number;
}

interface TrendData {
    date: string;
    count: number;
}

// --- Colors ---
const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b'];

// --- 1. Large Trend Chart (Application Volume) ---
export function ApplicationTrendChart() {
    // MOCK DATA for visual demonstration (since we don't have historical daily counts in simple count queries)
    // In a real app, we'd group by `createdAt` in the server action.
    const data = Array.from({ length: 14 }).map((_, i) => ({
        date: format(subDays(new Date(), 13 - i), 'MMM dd'),
        count: Math.floor(Math.random() * 20) + 5
    }));

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.5} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#0ea5e9' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- 2. Department Distribution (Donut) ---
export function DepartmentDistributionChart({ data }: { data: ChartData[] }) {
    return (
        <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- 3. Sparkline (Mini Chart for Cards) ---
export function MetricSparkline({ color = "#0ea5e9" }: { color?: string }) {
    const data = [
        { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 24 }, { v: 22 }
    ];

    return (
        <div className="h-[50px] w-[100px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area
                        type="monotone"
                        dataKey="v"
                        stroke={color}
                        strokeWidth={2}
                        fill="none"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
