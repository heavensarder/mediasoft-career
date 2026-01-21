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
    [key: string]: any;
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
// --- 2. Department Distribution (Donut) ---
// --- 2. Department Distribution (Donut) ---
export function DepartmentDistributionChart({ data }: { data: ChartData[] }) {
    return (
        <div className="w-full font-sans">
             {/* Chart Area - Fixed Height for the Pie */}
            <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            {data.map((_, index) => (
                                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={`url(#gradient-${index})`} 
                                    stroke="rgba(255,255,255,0.2)" 
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                backdropFilter: 'blur(8px)',
                                border: '1px solid #e2e8f0', 
                                borderRadius: '16px', 
                                color: '#1e293b',
                                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.15)',
                                padding: '12px 16px'
                            }}
                            itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '14px' }}
                            cursor={{ fill: 'transparent' }}
                            formatter={(value: number) => [`${value} Jobs`, 'Vol']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom HTML Legend - Grows Naturally */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 px-4 pb-6 mt-2 border-t border-slate-50 pt-6">
                {data.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                        <span 
                            className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{entry.name}</span>
                        <span className="text-slate-400 text-xs ml-0.5">({entry.value})</span>
                    </div>
                ))}
            </div>
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
