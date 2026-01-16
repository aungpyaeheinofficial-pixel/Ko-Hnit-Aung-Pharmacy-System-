
import React, { useState, useMemo } from 'react';
import { useProductStore, useBranchStore } from '../store';
import { Card, Button, Badge, ProgressBar, Tabs } from '../components/UI';
import { AlertTriangle, Calendar, AlertCircle, Clock, Download, ArrowRight, Trash2, Tag, Truck, Image as ImageIcon } from 'lucide-react';
import { Product, Batch } from '../types';

interface ExpiryItem {
  product: Product;
  batch: Batch;
  daysRemaining: number;
  status: 'CRITICAL' | 'WARNING' | 'WATCH' | 'GOOD';
}

const Expiry = () => {
  // Ensure we use the live products from the store
  const { products, removeBatchStock, syncWithBranch } = useProductStore();
  const { currentBranchId } = useBranchStore();
  const [activeTab, setActiveTab] = useState('CRITICAL');

  // Force refresh on mount
  React.useEffect(() => {
      if (currentBranchId) {
          syncWithBranch(currentBranchId);
      }
  }, [currentBranchId]);

  // Calculate expiry data
  const expiryItems: ExpiryItem[] = useMemo(() => {
    const items: ExpiryItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to midnight for accuracy

    products.forEach(product => {
      const batches = product.batches || []; // Fallback for safety
      batches.forEach(batch => {
        // Skip batches with 0 quantity
        if (batch.quantity <= 0) return;

        const expiryDate = new Date(batch.expiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status: ExpiryItem['status'] = 'GOOD';
        if (daysRemaining <= 30) status = 'CRITICAL';
        else if (daysRemaining <= 60) status = 'WARNING';
        else if (daysRemaining <= 90) status = 'WATCH';

        items.push({ product, batch, daysRemaining, status });
      });
    });

    return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [products]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'ALL') return expiryItems;
    return expiryItems.filter(item => item.status === activeTab);
  }, [expiryItems, activeTab]);

  const counts = useMemo(() => ({
    CRITICAL: expiryItems.filter(i => i.status === 'CRITICAL').length,
    WARNING: expiryItems.filter(i => i.status === 'WARNING').length,
    WATCH: expiryItems.filter(i => i.status === 'WATCH').length,
    ALL: expiryItems.length
  }), [expiryItems]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'WATCH': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    }
  };

  const handleAction = (item: ExpiryItem, action: 'WRITEOFF' | 'RETURN') => {
      const confirmed = window.confirm(
          `${item.product.nameEn} ၏ ဤအသုတ်ကို ${action === 'WRITEOFF' ? 'ဖျက်သိမ်းလိုပါသလား' : 'ပြန်လည်ပို့ဆောင်လိုပါသလား'}? \n\nအရေအတွက်: ${item.batch.quantity}`
      );
      
      if (confirmed) {
          removeBatchStock(item.product.id, item.batch.batchNumber, item.batch.quantity, action);
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            ကုန်ကျန်ရက်ကုန်ဆုံးမှု စီမံခန့်ခွဲမှု စင်တာ
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200">
              {counts.CRITICAL} အရေးကြီး
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">ကုန်ကျန်ရက်ကုန်ဆုံးမည့် ပစ္စည်းများကို စောင့်ကြည့်နှင့် စီမံခန့်ခွဲပြီး ဆုံးရှုံးမှုကို လျှော့ချပါ။</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="gap-2 bg-white">
             <Calendar size={16} /> Calendar View
           </Button>
           <Button variant="outline" className="gap-2 bg-white">
             <Download size={16} /> Export Report
           </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600"><AlertCircle size={80} /></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertTriangle size={20} /></div>
            <h3 className="font-semibold text-slate-700">အရေးကြီး (၀-၃၀ ရက်)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{counts.CRITICAL}</p>
          <p className="text-xs text-slate-500 mt-1">ဒီလအတွင်း ကုန်ဆုံးမည့် အသုတ်များ</p>
          <div className="mt-4 pt-4 border-t border-red-100/50">
             <div className="flex justify-between text-xs text-red-700 font-medium mb-1">
               <span>အန္တရာယ်ရှိ ငွေကြေးတန်ဖိုး</span>
               <span>{(150000).toLocaleString()} MMK</span>
             </div>
             <ProgressBar value={75} variant="danger" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-600"><Clock size={80} /></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Clock size={20} /></div>
            <h3 className="font-semibold text-slate-700">သတိပေး (၃၁-၆၀ ရက်)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{counts.WARNING}</p>
          <p className="text-xs text-slate-500 mt-1">မကြာမီ လုပ်ဆောင်ရန် လိုအပ်သည်</p>
           <div className="mt-4 pt-4 border-t border-amber-100/50">
             <div className="flex justify-between text-xs text-amber-700 font-medium mb-1">
               <span>အန္တရာယ်ရှိ ငွေကြေးတန်ဖိုး</span>
               <span>{(85000).toLocaleString()} MMK</span>
             </div>
             <ProgressBar value={45} variant="warning" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Calendar size={80} /></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Calendar size={20} /></div>
            <h3 className="font-semibold text-slate-700">စောင့်ကြည့် (၆၁-၉၀ ရက်)</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">{counts.WATCH}</p>
          <p className="text-xs text-slate-500 mt-1">အရောင်းမြှင့်တင်မှု သို့မဟုတ် ပြန်လည်ပို့ဆောင်မှု စီစဉ်ပါ</p>
           <div className="mt-4 pt-4 border-t border-blue-100/50">
             <div className="flex justify-between text-xs text-blue-700 font-medium mb-1">
               <span>အန္တရာယ်ရှိ ငွေကြေးတန်ဖိုး</span>
               <span>{(42000).toLocaleString()} MMK</span>
             </div>
             <ProgressBar value={20} variant="info" />
          </div>
        </div>
      </div>

      <Card className="p-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <Tabs 
            activeTab={activeTab} 
            onChange={setActiveTab}
            className="w-full md:w-fit"
            tabs={[
              { id: 'CRITICAL', label: 'အရေးကြီး (၀-၃၀ရက်)', count: counts.CRITICAL },
              { id: 'WARNING', label: 'သတိပေး (၃၁-၆၀ရက်)', count: counts.WARNING },
              { id: 'WATCH', label: 'စောင့်ကြည့် (၆၁-၉၀ရက်)', count: counts.WATCH },
              { id: 'ALL', label: 'အားလုံး', count: counts.ALL },
            ]} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="px-6 py-4">ထုတ်ကုန်</th>
                <th className="px-6 py-4 text-center">အသုတ် အချက်အလက်</th>
                <th className="px-6 py-4 text-center">အခြေအနေ</th>
                <th className="px-6 py-4 text-center">ကုန်ကျန်တန်ဖိုး</th>
                <th className="px-6 py-4 text-center">အကြံပြုထားသော လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <tr key={`${item.product.id}-${item.batch.id}`} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.product.nameEn}</p>
                        <p className="text-xs text-slate-500 font-mm">{item.product.nameMm}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-mono text-slate-700">
                           <span className="bg-slate-100 px-1.5 rounded text-xs">#{item.batch.batchNumber}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          ကုန်ဆုံးရက်: <span className="font-medium">{new Date(item.batch.expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          အရေအတွက်: <span className="font-medium">{item.batch.quantity}</span> ခု
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex flex-col items-center justify-center px-3 py-1 rounded-lg border ${getStatusColor(item.status)} mx-auto`}>
                         <span className="text-xl font-bold leading-none">{item.daysRemaining}</span>
                         <span className="text-[10px] uppercase font-bold tracking-wide">Days Left</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-800 text-center">
                        {(item.batch.quantity * item.product.price).toLocaleString()} Ks
                      </div>
                      <div className="text-xs text-slate-400 text-center">
                        ကုန်ကျစရိတ်: {(item.batch.quantity * item.batch.costPrice).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2 justify-center">
                         {item.status === 'CRITICAL' ? (
                           <>
                            <button 
                                onClick={() => handleAction(item, 'WRITEOFF')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                            >
                               <Trash2 size={14} /> ဖျက်သိမ်းရန်
                            </button>
                            <button 
                                onClick={() => handleAction(item, 'RETURN')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
                            >
                               <Truck size={14} /> ပြန်လည်ပို့ဆောင်ရန်
                            </button>
                           </>
                         ) : (
                           <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                              <Tag size={14} /> လျှော့စျေး
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                     <div className="flex flex-col items-center justify-center">
                       <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                         <Calendar size={24} className="opacity-50" />
                       </div>
                       <p>ဤအမျိုးအစားတွင် ပစ္စည်းများ မတွေ့ရှိပါ။</p>
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Expiry;
