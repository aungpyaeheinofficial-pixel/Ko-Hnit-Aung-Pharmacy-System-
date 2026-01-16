
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw, Activity, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { useBranchStore, useSettingsStore } from '../store';
import { api } from '../utils/apiClient';

interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  lowStockCount: number;
  recentTransactions: any[];
  chartData: any[];
}

// Helpers for Date Management
const getDateRange = (filter: 'Today' | 'Week' | 'Month' | 'Year') => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  // Previous period for trend calculation
  const prevStart = new Date(now);
  const prevEnd = new Date(now);

  end.setHours(23, 59, 59, 999);

  if (filter === 'Today') {
    start.setHours(0, 0, 0, 0);
    
    // Previous: Yesterday
    prevStart.setDate(now.getDate() - 1);
    prevStart.setHours(0, 0, 0, 0);
    prevEnd.setDate(now.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
  } else if (filter === 'Week') {
    // Start of current week (Sunday)
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    
    // Previous: Week before
    prevStart.setDate(start.getDate() - 7);
    prevEnd.setDate(start.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
  } else if (filter === 'Month') {
    // Start of current month
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    
    // Previous: Month before
    prevStart.setMonth(now.getMonth() - 1);
    prevStart.setDate(1);
    prevEnd.setDate(0); // Last day of prev month
    prevEnd.setHours(23, 59, 59, 999);
  } else if (filter === 'Year') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    
    prevStart.setFullYear(now.getFullYear() - 1);
    prevStart.setMonth(0, 1);
    prevEnd.setFullYear(now.getFullYear() - 1);
    prevEnd.setMonth(11, 31);
    prevEnd.setHours(23, 59, 59, 999);
  }

  return { start, end, prevStart, prevEnd };
};


const StatCard = ({ title, value, subValue, trend, trendValue, icon: Icon, colorClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-card hover:shadow-card-hover border border-slate-200/60 group transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1' : ''}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-2xl ${colorClass} bg-opacity-10 flex items-center justify-center`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-').replace('100', '600')} />
      </div>
      {trendValue && (
          <span className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${trend === 'up' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {trend === 'up' ? <ArrowUpRight size={10} className="mr-0.5"/> : <ArrowDownRight size={10} className="mr-0.5"/>}
              {trendValue}
          </span>
      )}
    </div>
    
    <div>
      <p className="text-slate-500 text-sm font-semibold tracking-wide uppercase text-[10px]">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h3>
      {subValue && <p className="text-xs text-slate-400 mt-1.5 font-medium">{subValue}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  
  const { currentBranchId } = useBranchStore();
  const { settings } = useSettingsStore();
  const { getCurrentBranch } = useBranchStore();

  const [filterType, setFilterType] = useState<'Today' | 'Week' | 'Month' | 'Year'>('Month');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    lowStockCount: 0,
    recentTransactions: [],
    chartData: []
  });

  const fetchDashboardData = async () => {
    if (!currentBranchId) return;
    
    setLoading(true);
    try {
      const { start, end, prevStart, prevEnd } = getDateRange(filterType);
      
      // Fetch data from backend APIs
      const [transactionsRes, productsRes] = await Promise.all([
        api.get(`/finance/transactions?branchId=${currentBranchId}`),
        api.get(`/products?branchId=${currentBranchId}`)
      ]);

      const transactions = transactionsRes.transactions || [];
      const products = productsRes.products || [];

      // Filter transactions by date range
      const currentTrans = transactions.filter((t: any) => {
        const d = new Date(t.date);
        return t.type === 'INCOME' && d >= start && d <= end;
      });
      
      const prevTrans = transactions.filter((t: any) => {
        const d = new Date(t.date);
        return t.type === 'INCOME' && d >= prevStart && d <= prevEnd;
      });

      // Calculate revenue
      const totalRevenue = currentTrans.reduce((sum: number, t: any) => sum + t.amount, 0);
      const prevTotalRevenue = prevTrans.reduce((sum: number, t: any) => sum + t.amount, 0);

      // Calculate growth
      const growth = prevTotalRevenue === 0 
        ? (totalRevenue > 0 ? 100 : 0)
        : ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100;

      // Calculate low stock count
      const lowStock = products.filter((p: any) => 
        p.stockLevel <= (p.minStockLevel || 10)
      ).length;

      // Chart data aggregation
      const chartMap = new Map<string, number>();
      const labelFormat = filterType === 'Today' ? 'hour' : filterType === 'Year' ? 'month' : 'day';
      
      const addToChart = (dateStr: string, amount: number) => {
        const date = new Date(dateStr);
        let key = '';
        
        if (labelFormat === 'hour') {
          key = date.getHours() + ':00';
        } else if (labelFormat === 'month') {
          key = date.toLocaleString('my-MM', { month: 'short' });
        } else {
          key = date.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' });
        }
        
        chartMap.set(key, (chartMap.get(key) || 0) + amount);
      };

      currentTrans.forEach((t: any) => addToChart(t.date, t.amount));
      const chartData = Array.from(chartMap, ([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => {
          // Simple sort - for production would use actual dates
          return a.name.localeCompare(b.name);
        });

      // Recent transactions
      const recentTransactions = [...currentTrans]
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setMetrics({
        totalRevenue,
        revenueGrowth: growth,
        lowStockCount: lowStock,
        recentTransactions,
        chartData
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when branch or filter changes
  useEffect(() => {
    fetchDashboardData();
  }, [currentBranchId, filterType]);

  // Print Daily Sales Report
  const printDailySalesReport = async () => {
    if (!currentBranchId) return;
    
    try {
      const { start, end } = getDateRange(filterType);
      const transactionsRes = await api.get(`/finance/transactions?branchId=${currentBranchId}`);
      const transactions = transactionsRes.transactions || [];
      
      const currentTrans = transactions.filter((t: any) => {
        const d = new Date(t.date);
        return t.type === 'INCOME' && d >= start && d <= end;
      });

      const totalRevenue = currentTrans.reduce((sum: number, t: any) => sum + t.amount, 0);
      const totalTransactions = currentTrans.length;
      const currentBranch = getCurrentBranch();
      const shopName = settings.shopNameReceipt || settings.companyName || 'ကိုနှစ်အောင် ဆေးဆိုင်';

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ရောင်းအားစာရင်း - ${filterType === 'Today' ? 'ယနေ့' : filterType === 'Week' ? 'အပတ်စဉ်' : filterType === 'Month' ? 'လစဉ်' : 'နှစ်စဉ်'}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 1cm;
                }
              }
              body {
                font-family: 'Arial', sans-serif;
                font-size: 12px;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: bold;
              }
              .header h2 {
                margin: 5px 0;
                font-size: 18px;
                color: #666;
              }
              .info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
              }
              .info-item {
                padding: 10px;
                background: #f5f5f5;
                border-radius: 5px;
              }
              .info-label {
                font-weight: bold;
                color: #666;
                font-size: 10px;
                text-transform: uppercase;
              }
              .info-value {
                font-size: 16px;
                font-weight: bold;
                margin-top: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              th {
                background: #1B5E20;
                color: white;
                font-weight: bold;
              }
              tr:hover {
                background: #f5f5f5;
              }
              .total-row {
                font-weight: bold;
                background: #f0f0f0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 15px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 10px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${shopName}</h1>
              <h2>ရောင်းအားစာရင်း - ${filterType === 'Today' ? 'ယနေ့' : filterType === 'Week' ? 'အပတ်စဉ်' : filterType === 'Month' ? 'လစဉ်' : 'နှစ်စဉ်'}</h2>
              <p>${new Date(start).toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' })} 
                 ${filterType !== 'Today' ? `မှ ${new Date(end).toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}</p>
              ${currentBranch ? `<p>ဆိုင်ခွဲ: ${currentBranch.name}</p>` : ''}
            </div>
            
            <div class="info">
              <div class="info-item">
                <div class="info-label">စုစုပေါင်းဝင်ငွေ</div>
                <div class="info-value">${totalRevenue.toLocaleString()} ကျပ်</div>
              </div>
              <div class="info-item">
                <div class="info-label">စုစုပေါင်းရောင်းအား</div>
                <div class="info-value">${totalTransactions}</div>
              </div>
              <div class="info-item">
                <div class="info-label">ပျမ်းမျှရောင်းအား</div>
                <div class="info-value">${totalTransactions > 0 ? (totalRevenue / totalTransactions).toLocaleString() : 0} ကျပ်</div>
              </div>
              <div class="info-item">
                <div class="info-label">ကုန်ပစ္စည်းလျော့နည်းများ</div>
                <div class="info-value">${metrics.lowStockCount}</div>
              </div>
            </div>
            
            <h3>ရောင်းအားအသေးစိတ်</h3>
            <table>
              <thead>
                <tr>
                  <th>ရက်စွဲ</th>
                  <th>အမျိုးအစား</th>
                  <th>ဖော်ပြချက်</th>
                  <th>ငွေပေးချေမှုနည်းလမ်း</th>
                  <th style="text-align: right;">ပမာဏ</th>
                </tr>
              </thead>
              <tbody>
                ${currentTrans.map((t: any) => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString('my-MM', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>${t.category}</td>
                    <td>${t.description || '-'}</td>
                    <td>${t.paymentMethod || '-'}</td>
                    <td style="text-align: right;">${t.amount.toLocaleString()} ကျပ်</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="4" style="text-align: right;"><strong>စုစုပေါင်း:</strong></td>
                  <td style="text-align: right;"><strong>${totalRevenue.toLocaleString()} ကျပ်</strong></td>
                </tr>
              </tbody>
            </table>
            
            <div class="footer">
              <p>ထုတ်ယူသည့်ရက်စွဲ: ${new Date().toLocaleString('my-MM', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              <p>${settings.receiptFooter || 'ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ပါသည်!'}</p>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    } catch (error) {
      console.error('Failed to print report:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ဒက်ရှ်ဘုတ်အပေါ်မြင်ကွင်း</h1>
          <p className="text-slate-500 text-sm flex items-center gap-2 font-medium mt-1">
            လုပ်ငန်းခွဲဆိုင်ရာ အချက်အလက်များ
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
               နောက်ဆုံးမွမ်းမံချိန်: {lastUpdated.toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60">
           <div className="flex bg-slate-100/80 p-1 rounded-xl">
              {([
                { key: 'Today' as const, label: 'ယနေ့' },
                { key: 'Week' as const, label: 'အပတ်စဉ်' },
                { key: 'Month' as const, label: 'လစဉ်' },
                { key: 'Year' as const, label: 'နှစ်စဉ်' }
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    filterType === key 
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {label}
                </button>
              ))}
           </div>

           <Button variant="outline" onClick={fetchDashboardData} disabled={loading} className="px-3 bg-white hover:bg-slate-50 border-slate-200 shadow-sm text-slate-600">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
           </Button>
           
           <Button 
             variant="outline" 
             onClick={printDailySalesReport} 
             disabled={loading}
             className="px-4 bg-white hover:bg-slate-50 border-slate-200 shadow-sm text-slate-600 flex items-center gap-2"
           >
              <Printer size={16} />
              <span className="hidden sm:inline">စာရင်းထုတ်ယူရန်</span>
           </Button>
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>)}
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            title="စုစုပေါင်းဝင်ငွေ" 
            value={`${metrics.totalRevenue.toLocaleString()} ကျပ်`} 
            subValue={`${filterType === 'Today' ? 'ယနေ့' : filterType === 'Week' ? 'အပတ်စဉ်' : filterType === 'Month' ? 'လစဉ်' : 'နှစ်စဉ်'} ရောင်းအားအပေါ်အခြေခံသည်`}
            trend={metrics.revenueGrowth >= 0 ? 'up' : 'down'} 
            trendValue={`${Math.abs(metrics.revenueGrowth).toFixed(1)}%`} 
            icon={TrendingUp} 
            colorClass="bg-emerald-100" 
            onClick={() => navigate('/finance')}
          />
          <StatCard 
            title="ကုန်ပစ္စည်းလျော့နည်းများ" 
            value={metrics.lowStockCount} 
            subValue="စတော့ခ် <= အနည်းဆုံးအဆင့်"
            trend="down" 
            icon={AlertTriangle} 
            colorClass="bg-amber-100"
            onClick={() => navigate('/inventory?filter=low_stock')}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card title="ဝင်ငွေခွဲခြမ်းစိတ်ဖြာမှု">
          <div className="h-[320px] w-full mt-4">
            {metrics.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} tickFormatter={(value) => `${value/1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} ကျပ်`, 'ဝင်ငွေ']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                    itemStyle={{ color: '#3B82F6', fontWeight: 600, fontSize: '12px' }}
                    labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}
                    cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 flex-col">
                  <Activity size={32} className="opacity-20 mb-2" />
                  <p>{filterType === 'Today' ? 'ယနေ့' : filterType === 'Week' ? 'အပတ်စဉ်' : filterType === 'Month' ? 'လစဉ်' : 'နှစ်စဉ်'} အတွက် ဝင်ငွေအချက်အလက်မရှိပါ</p>
               </div>
            )}
          </div>
        </Card>
      </div>
      
      <Card title="နောက်ဆုံးရောင်းအားများ (၅ ခု)" className="overflow-hidden border border-slate-200/60 shadow-card">
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4 text-xs uppercase tracking-wider">ရောင်းအား ID</th>
                 <th className="px-6 py-4 text-xs uppercase tracking-wider">ဖော်ပြချက်</th>
                 <th className="px-6 py-4 text-xs uppercase tracking-wider">ရက်စွဲ</th>
                 <th className="px-6 py-4 text-xs uppercase tracking-wider">ပမာဏ</th>
                 <th className="px-6 py-4 text-xs uppercase tracking-wider">အမျိုးအစား</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {metrics.recentTransactions.length > 0 ? (
                 metrics.recentTransactions.map((t: any) => (
                   <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                     <td className="px-6 py-4 font-mono text-slate-500 text-xs font-medium group-hover:text-slate-800 transition-colors">#{t.id.slice(0, 8)}</td>
                     <td className="px-6 py-4 font-semibold text-slate-700">{t.description || '-'}</td>
                     <td className="px-6 py-4 text-slate-500 text-xs font-medium">{new Date(t.date).toLocaleDateString('my-MM', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                     <td className={`px-6 py-4 font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                       {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal ml-0.5">ကျပ်</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
                         {t.category}
                       </span>
                     </td>
                   </tr>
                 ))
               ) : (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                       <div className="flex flex-col items-center justify-center">
                          <Activity size={40} className="opacity-10 mb-2" />
                          <p>နောက်ဆုံးရောင်းအားများ မတွေ့ရှိပါ။</p>
                       </div>
                    </td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
         <div className="p-4 border-t border-slate-50 text-center bg-slate-50/50">
            <Button variant="ghost" onClick={() => navigate('/finance')} className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wide">ရောင်းအားအားလုံးကြည့်ရန်</Button>
         </div>
      </Card>
    </div>
  );
};

export default Dashboard;
