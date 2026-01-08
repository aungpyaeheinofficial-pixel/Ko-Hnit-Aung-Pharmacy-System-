// Simplified POS Module for Ko Hnit Aung Pharmacy
// No Barcode, Just Click & Type

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, Banknote, RotateCcw, ShoppingCart, 
  CheckCircle, AlertCircle, X, AlertTriangle, Edit2, 
  Check, Package
} from 'lucide-react';
import { useCartStore, useProductStore, useTransactionStore, useCustomerStore, useBranchStore, useSettingsStore } from '../store';
import { Button, Badge } from '../components/UI';
import { Product, UNIT_TYPES } from '../types';
import { smartSearch, rankedSearch, getTopSellingProducts } from '../utils/smartSearch';
import { getStockStatus, isNearExpiry, isFullyExpired, getDaysUntilExpiry } from '../utils/stockStatus';
import { api } from '../utils/apiClient';
import { printReceipt } from '../components/Receipt';
import { printInvoice, InvoiceItem } from '../components/InvoicePrint';

// Product Card Component with Traffic Light
const ProductCard: React.FC<{ 
  product: Product, 
  onAdd: (p: Product) => void, 
  index: number 
}> = ({ product, onAdd, index }) => {
  const status = getStockStatus(product);
  
  return (
    <div 
      onClick={() => onAdd(product)}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-[#1B5E20] animate-in fade-in zoom-in-95"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="relative aspect-square bg-[#F1F8F4] w-full overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full text-slate-300">
          <Package size={48} className="opacity-50" />
        </div>
        {/* Traffic Light Stock Badge */}
        <span 
          className={`absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-lg backdrop-blur-sm ${status.bgColor} ${status.color} border-current`}
          title={status.text}
        >
          {status.icon} {product.stockLevel}
        </span>
      </div>
      
      <div className="p-3 flex flex-col flex-1">
        <h4 className="font-semibold text-[#1B5E20] text-sm truncate leading-tight" title={product.nameEn}>
          {product.nameEn}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-slate-600">
            {product.category?.substring(0, 3) || 'GEN'}
          </span>
          {product.shortCode && (
            <span className="text-[#2E7D32] font-mono font-bold">{product.shortCode}</span>
          )}
        </div>
        
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="font-bold text-[#1B5E20] text-lg">
            {product.price.toLocaleString()} Ks
          </span>
          <button className="w-8 h-8 rounded-full bg-[#FFEB3B] text-[#1B5E20] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F57F17] hover:text-white shadow-md">
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Button Component
const QuickButton: React.FC<{ 
  product: Product, 
  onClick: () => void 
}> = ({ product, onClick }) => {
  const status = getStockStatus(product);
  
  return (
    <button
      onClick={onClick}
      className="relative group bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-[#1B5E20] hover:shadow-lg transition-all duration-200 text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-[#1B5E20] text-sm truncate flex-1">{product.nameEn}</h4>
        <span className={`ml-2 text-lg ${status.icon}`} title={status.text}></span>
      </div>
      <p className="text-xs text-slate-600 mb-1">{product.category}</p>
      <p className="font-bold text-[#1B5E20]">{product.price.toLocaleString()} Ks</p>
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 rounded-full bg-[#FFEB3B] flex items-center justify-center">
          <Plus size={14} className="text-[#1B5E20]" />
        </div>
      </div>
    </button>
  );
};

const POS = () => {
  const { 
    items, addItem, removeItem, updateQuantity, updatePrice, updateUnit, 
    total, clearCart, customer, setCustomer 
  } = useCartStore();
  const { products, syncWithBranch } = useProductStore();
  const { customers } = useCustomerStore();
  const { syncWithBranch: syncTransactions } = useTransactionStore();
  const { currentBranchId } = useBranchStore();
  const { settings } = useSettingsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Expiry warning state
  const [expiryWarning, setExpiryWarning] = useState<{
    product: Product;
    message: string;
    daysUntilExpiry: number | null;
  } | null>(null);
  
  // Price/Unit edit state
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');

  // Payment state
  const [cashReceived, setCashReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'KBZ_PAY'>('CASH');

  // Derived values
  const cartTotal = total();
  const cashValue = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashValue - cartTotal);
  const canCheckout = paymentMethod === 'CASH' ? (cashReceived !== '' && cashValue >= cartTotal) : true;

  // Load products on mount
  useEffect(() => {
    if (currentBranchId) {
      syncWithBranch(currentBranchId);
      syncTransactions(currentBranchId);
    }
  }, [currentBranchId, syncWithBranch, syncTransactions]);

  // Categories
  const categories = useMemo<string[]>(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(cats)].sort();
  }, [products]);

  // Top selling products for quick buttons
  const topProducts = useMemo(() => {
    return getTopSellingProducts(products, 20);
  }, [products]);

  // Filtered products with smart search
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply smart search
    if (searchTerm.length >= 2) {
      filtered = rankedSearch(products, searchTerm);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter out out-of-stock and expired items (optional - can be toggled)
    filtered = filtered.filter(p => {
      const status = getStockStatus(p);
      return status.status !== 'expired' && status.status !== 'out';
    });

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Handle adding product to cart with expiry check
  const handleAddProduct = (product: Product) => {
    // Check if expired
    if (isFullyExpired(product)) {
      setExpiryWarning({
        product,
        message: 'ဒီဆေး သက်တမ်းကုန်နေပါပြီ!',
        daysUntilExpiry: null
      });
      return;
    }

    // Check if near expiry
    if (isNearExpiry(product, 90)) {
      const days = getDaysUntilExpiry(product);
      setExpiryWarning({
        product,
        message: `ဒီဆေး သက်တမ်းကုန်ဆုံးမှု နီးကပ်နေပါပြီ (${days} ရက်)`,
        daysUntilExpiry: days
      });
    }

    // Add to cart
    addItem(product);
    setSuccessMsg(`${product.nameEn} ထည့်ပြီးပါပြီ`);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  // Confirm adding expired/near-expiry product
  const handleConfirmExpired = () => {
    if (expiryWarning) {
      addItem(expiryWarning.product);
      setSuccessMsg(`${expiryWarning.product.nameEn} ထည့်ပြီးပါပြီ (Warning: ${expiryWarning.message})`);
      setExpiryWarning(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Start editing price
  const startEditPrice = (item: any) => {
    setEditingItem(item.cartId);
    setEditPrice(item.price.toString());
  };

  // Save price edit
  const savePriceEdit = (cartId: string) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updatePrice(cartId, price);
      setEditingItem(null);
      setEditPrice('');
    }
  };

  // Start editing unit
  const startEditUnit = (item: any) => {
    setEditingItem(item.cartId + '_unit');
    setEditUnit(item.unit);
  };

  // Save unit edit
  const saveUnitEdit = (cartId: string) => {
    if (editUnit) {
      updateUnit(cartId, editUnit);
      setEditingItem(null);
      setEditUnit('');
    }
  };

  // Checkout
  const handleCheckout = async () => {
    try {
      const payload = {
        branchId: currentBranchId,
        customerId: customer?.id || null,
        paymentMethod,
        total: cartTotal,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          batchId: item.batches?.[0]?.id || undefined,
        })),
      };

      const response = await api.post('/sales/checkout', payload);
      const saleId = response.saleId || response.id || `sale-${Date.now()}`;

      // Refresh
      if (currentBranchId) {
        await syncWithBranch(currentBranchId);
        await syncTransactions(currentBranchId);
      }

      // Print receipt or invoice if auto-print is enabled
      if (settings.autoPrint) {
        const receiptData = {
          id: saleId,
          items: items.map(item => ({
            nameEn: item.nameEn,
            quantity: item.quantity,
            unitPrice: item.price,
            unit: item.unit,
          })),
          total: cartTotal,
          paymentMethod,
          date: new Date().toISOString(),
          customerName: customer?.name || 'Walk-in Customer',
        };

        // Also prepare invoice data
        const invoiceData = {
          invoiceNo: saleId,
          date: new Date().toISOString(),
          customerName: customer?.name || 'Walk-in Customer',
          customerPhone: customer?.phone,
          items: items.map((item): InvoiceItem => ({
            id: item.id,
            name: item.nameEn,
            qty: item.quantity,
            unit: item.unit || 'PCS',
            price: item.price,
            amount: item.quantity * item.price,
          })),
          totalAmount: cartTotal,
          discount: 0,
          netAmount: cartTotal,
          paymentMethod,
        };

        // Small delay to ensure data is saved
        setTimeout(() => {
          // Always print invoice after sale (perfect invoice format)
          printInvoice(invoiceData);
        }, 500);
      }

      setPaymentModalOpen(false);
      clearCart();
      setSuccessMsg('ရောင်းချမှု အောင်မြင်ပါသည်!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      alert(`Checkout failed: ${e?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#F1F8F4] relative">
      {/* Success Toast */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-[#2E7D32] text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle size={20} />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Left Side - Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 bg-white">
        
        {/* Search & Filter Bar */}
        <div className="p-4 bg-[#1B5E20] border-b border-[#2E7D32] space-y-4 shadow-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFEB3B] pointer-events-none" size={22} />
            <input 
              type="text" 
              placeholder="ဆေးနာမည် ၂-၃ လုံး ရိုက်ရှာပါ (e.g., Bio, Para)..." 
              className="w-full pl-12 pr-4 h-14 bg-white border-2 border-[#FFEB3B] rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-[#FFEB3B]/30 transition-all shadow-md placeholder:text-slate-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat 
                    ? 'bg-[#FFEB3B] text-[#1B5E20] shadow-md' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Buttons Section */}
        {searchTerm.length < 2 && selectedCategory === 'All' && topProducts.length > 0 && (
          <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="text-sm font-bold text-[#1B5E20] mb-3 flex items-center gap-2">
              <Package size={16} />
              အရောင်းအသွက်ဆုံး / Quick Buttons
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {topProducts.slice(0, 10).map((product) => (
                <QuickButton 
                  key={product.id} 
                  product={product} 
                  onClick={() => handleAddProduct(product)} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F1F8F4]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => handleAddProduct(product)} 
                index={index} 
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={40} className="opacity-50" />
                </div>
                <p className="font-medium text-slate-600">ဆေး မတွေ့ပါ</p>
                <p className="text-sm">ရှာဖွေမှုကို ပြောင်းလဲကြည့်ပါ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 bg-white flex flex-col shrink-0 shadow-xl z-20 border-l border-slate-100">
        {/* Current Sale Header */}
        <div className="p-5 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1B5E20] flex items-center gap-2 text-lg">
              <ShoppingCart size={20} className="text-[#2E7D32]" /> Current Sale
            </h3>
            <button 
              onClick={clearCart} 
              className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
            >
              <RotateCcw size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F1F8F4]">
          {items.map(item => {
            const isEditingPrice = editingItem === item.cartId;
            const isEditingUnit = editingItem === item.cartId + '_unit';
            const status = getStockStatus(item);
            
            return (
              <div 
                key={item.cartId} 
                className="flex gap-3 bg-white border-2 rounded-xl p-3 shadow-sm hover:border-[#1B5E20] transition-all group relative"
              >
                <button 
                  onClick={() => removeItem(item.cartId)}
                  className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 border-2 border-slate-100 shadow-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <X size={12} />
                </button>
                
                <div className="w-14 h-14 bg-[#F1F8F4] rounded-lg flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                  <Package size={20} className="text-slate-300" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B5E20] truncate pr-4 leading-tight">
                      {item.nameEn}
                    </h4>
                    
                    {/* Price Edit */}
                    {isEditingPrice ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          className="w-20 px-2 py-1 text-xs border-2 border-[#1B5E20] rounded focus:outline-none"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') savePriceEdit(item.cartId);
                            if (e.key === 'Escape') setEditingItem(null);
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => savePriceEdit(item.cartId)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="text-sm font-bold text-[#1B5E20] cursor-pointer hover:text-[#2E7D32] hover:underline"
                          onClick={() => startEditPrice(item)}
                          title="Click to edit price"
                        >
                          {item.price.toLocaleString()} Ks
                        </span>
                        {item.customPrice && (
                          <Badge variant="warning" className="text-[9px]">Custom</Badge>
                        )}
                      </div>
                    )}

                    {/* Unit Edit */}
                    {isEditingUnit ? (
                      <div className="flex items-center gap-2 mt-2">
                        <select
                          className="text-xs border-2 border-[#1B5E20] rounded px-2 py-1 focus:outline-none"
                          value={editUnit}
                          onChange={(e) => setEditUnit(e.target.value)}
                          autoFocus
                        >
                          {UNIT_TYPES.map(u => (
                            <option key={u.code} value={u.code}>{u.nameMm}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => saveUnitEdit(item.cartId)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditUnit(item)}
                        className="text-xs text-slate-500 hover:text-[#1B5E20] mt-1 flex items-center gap-1"
                        title="Click to change unit"
                      >
                        Unit: {UNIT_TYPES.find(u => u.code === item.unit)?.nameMm || item.unit}
                        <Edit2 size={10} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-end justify-between mt-2">
                    <div className="flex items-center bg-[#F1F8F4] rounded-lg p-0.5 border border-slate-200">
                      <button 
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md text-[#1B5E20] transition-all active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md text-[#1B5E20] transition-all active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[#1B5E20]">
                      {(item.price * item.quantity).toLocaleString()} Ks
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={32} />
              </div>
              <p className="text-sm font-medium">Cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-5 bg-white border-t border-slate-100 space-y-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-700">{cartTotal.toLocaleString()} Ks</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (0%)</span>
              <span className="font-medium text-slate-700">0 Ks</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-[#1B5E20] pt-3 border-t-2 border-[#F1F8F4] mt-2">
              <span>Total</span>
              <span>{cartTotal.toLocaleString()} Ks</span>
            </div>
          </div>

          <Button 
            variant="primary" 
            className="w-full h-12 text-base font-bold shadow-xl bg-[#1B5E20] hover:bg-[#2E7D32] border-0 transform active:scale-[0.98] transition-all text-white"
            disabled={items.length === 0}
            onClick={() => setPaymentModalOpen(true)}
          >
            Charge {cartTotal.toLocaleString()} Ks
          </Button>
        </div>
      </div>

      {/* Expiry Warning Modal */}
      {expiryWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border-t-4 border-red-500">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Expiry Warning</h3>
              <p className="text-lg font-semibold text-red-600 mb-2">{expiryWarning.message}</p>
              <p className="text-sm text-slate-600">{expiryWarning.product.nameEn}</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setExpiryWarning(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleConfirmExpired}
              >
                Continue Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-[#1B5E20] mb-1">Confirm Payment</h3>
            <p className="text-sm text-slate-500 mb-6">
              Total Amount: <span className="font-bold text-[#1B5E20]">{cartTotal.toLocaleString()} Ks</span>
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-[#1B5E20] bg-[#F1F8F4] text-[#1B5E20]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote size={28} />
                <span className="font-bold text-sm">Cash</span>
              </button>
              <button
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-[#1B5E20] bg-[#F1F8F4] text-[#1B5E20]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote size={28} />
                <span className="font-bold text-sm">Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('KBZ_PAY')}
                className={`flex flex-col items-center justify-center gap-2 p-4 border-2 rounded-xl transition-all ${
                  paymentMethod === 'KBZ_PAY'
                    ? 'border-[#1B5E20] bg-[#F1F8F4] text-[#1B5E20]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Banknote size={28} />
                <span className="font-bold text-sm">KBZ Pay</span>
              </button>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <label className="block text-sm font-bold text-[#1B5E20] mb-2">Cash Received</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 text-lg font-mono border-2 border-slate-200 rounded-xl focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none"
                    placeholder="0"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={() => setCashReceived(cartTotal.toString())}
                    className="absolute right-2 top-9 px-3 py-1 text-xs font-bold bg-[#F1F8F4] hover:bg-[#FFEB3B] text-[#1B5E20] rounded-lg transition-colors border border-[#1B5E20]"
                  >
                    Exact
                  </button>
                </div>
                
                <div className={`flex justify-between text-sm p-4 rounded-xl border-2 ${
                  changeDue > 0 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-slate-500 font-medium">Change Due</span>
                  <span className={`font-bold text-lg ${
                    changeDue > 0 ? 'text-green-700' : 'text-slate-800'
                  }`}>
                    {changeDue.toLocaleString()} Ks
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-11" 
                onClick={() => setPaymentModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 h-11 bg-[#1B5E20] hover:bg-[#2E7D32] shadow-lg text-white disabled:opacity-50" 
                onClick={handleCheckout}
                disabled={!canCheckout}
              >
                Complete Sale
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
