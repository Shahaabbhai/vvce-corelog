import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';
import { useComplaints } from '../contexts/ComplaintContext';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#eab308'];

export const AnalyticsCharts: React.FC = () => {
  const { complaints } = useComplaints();

  const analyticsData = useMemo(() => {
    // Over time data
    const datesMap: Record<string, number> = {};
    
    // Category distribution
    const categoryMap: Record<string, number> = {};

    // Priority distribution
    const priorityMap: Record<string, number> = {};

    complaints.forEach(c => {
      // By Date
      const dateKey = new Date(c.created_at).toISOString().split('T')[0];
      datesMap[dateKey] = (datesMap[dateKey] || 0) + 1;
      
      // By Category
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;

      // By Priority
      priorityMap[c.priority] = (priorityMap[c.priority] || 0) + 1;
    });

    const overTime = Object.keys(datesMap)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => ({
        date: date.substring(5), // Just MM-DD
        complaints: datesMap[date]
      }))
      .slice(-14); // Keep last 14 days

    const byCategory = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    })).sort((a, b) => b.value - a.value);

    const byPriority = Object.keys(priorityMap).map(name => ({
      name,
      value: priorityMap[name]
    }));

    return { overTime, byCategory, byPriority };
  }, [complaints]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Activity Volume</h3>
            <div className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incoming Volume</div>
          </div>
          <div className="h-72 mt-4 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.overTime}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#334155" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#334155" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151110', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="complaints" 
                  stroke="#ff6b00" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Issue Clusters</h3>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.byCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {analyticsData.byCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151110', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center flex-wrap gap-4 mt-4">
            {analyticsData.byCategory.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cat.name} ({cat.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Priority Breakdown</h3>
          <div className="h-72 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2e" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#334155" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#334155" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151110', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]}>
                  {analyticsData.byPriority.map((entry, index) => {
                    let color = '#10b981'; // Low priority default
                    if (entry.name === 'High') color = '#f43f5e';
                    else if (entry.name === 'Medium') color = '#ff6b00';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
