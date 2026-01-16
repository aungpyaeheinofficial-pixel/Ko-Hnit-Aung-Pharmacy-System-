// Simplified Stock Entry for Ko Hnit Aung Pharmacy
// Direct Entry - No Barcode, Just Click & Type

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Search, Calendar, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { useProductStore, useBranchStore } from '../store';
import { UNIT_TYPES } from '../types';
import { getStockStatus } from '../utils/stockStatus';
import { smartSearch } from '../utils/smartSearch';
import { api } from '../utils/apiClient';

const StockEntry = () => {
  const navigate = useNavigate();
  const { allProducts, incrementStock, addProduct, syncWithBranch } = useProductStore();
  const { currentBranchId } = useBranchStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    productId: '', // Selected product ID
    productName: '', // For new products
    category: '',
    quantity: '',
    expiryDate: '', // Auto-creates batch
    costPrice: '',
    sellingPrice: '',
    unit: 'STRIP',
  });

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return smartSearch(allProducts, searchTerm).slice(0, 10);
  }, [searchTerm, allProducts]);

  // Categories
  const categories = useMemo<string[]>(() => {
    const cats = new Set(allProducts.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allProducts]);

  // Select existing product
  const selectProduct = (product: any) => {
    setFormData(prev => ({
      ...prev,
      productId: product.id,
      productName: product.nameEn,
      category: product.category,
      unit: product.unit || 'STRIP',
      sellingPrice: product.price.toString(),
      costPrice: '',
      quantity: '',
      expiryDate: '',
    }));
    setSearchTerm('');
    setShowNewProductForm(false);
  };

  // Create new product
  const handleNewProduct = () => {
    setShowNewProductForm(true);
    setFormData(prev => ({
      ...prev,
      productId: '',
      productName: '',
      category: '',
      quantity: '',
      expiryDate: '',
      costPrice: '',
      sellingPrice: '',
      unit: 'STRIP',
    }));
    setSearchTerm('');
  };

  // Save stock entry
  const handleSave = async () => {
    try {
      setErrorMsg('');
      
      // Validation
      if (!formData.productName.trim()) {
        setErrorMsg('ဆေးနာမည် ထည့်ရန် လိုအပ်ပါသည်');
        return;
      }

      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        setErrorMsg('အရေအတွက် ထည့်ရန် လိုအပ်ပါသည်');
        return;
      }

      if (!formData.expiryDate) {
        setErrorMsg('သက်တမ်းကုန်ရက် ထည့်ရန် လိုအပ်ပါသည်');
        return;
      }

      const qty = parseInt(formData.quantity);
      const costPrice = parseFloat(formData.costPrice) || 0;
      const sellingPrice = parseFloat(formData.sellingPrice) || 0;

      // Check if product exists
      let product = formData.productId 
        ? allProducts.find(p => p.id === formData.productId)
        : null;

      if (!product) {
        // Create new product
        const newProduct = {
          id: `p-${Date.now()}`,
          nameEn: formData.productName,
          nameMm: formData.productName,
          sku: `SKU-${Date.now()}`,
          category: formData.category || 'Uncategorized',
          price: sellingPrice,
          stockLevel: 0,
          unit: formData.unit,
          minStockLevel: 10,
          requiresPrescription: false,
          image: '',
          branchId: currentBranchId,
          batches: [],
        };

        await addProduct(newProduct);
        product = newProduct;
      }

      // Add stock with auto batch creation from expiry date
      // Backend will auto-create batch number if not provided
      await incrementStock(
        product.id,
        null, // Batch number - auto-generated from expiry date
        qty,
        formData.unit,
        '', // Location
        formData.expiryDate,
        costPrice
      );

      // Update selling price if changed
      if (sellingPrice > 0 && sellingPrice !== product.price) {
        await useProductStore.getState().updateProduct(product.id, { price: sellingPrice });
      }

      // Refresh products
      await syncWithBranch(currentBranchId);

      setSuccessMsg(`${formData.productName} - ${qty} ${formData.unit} ထည့်သွင်းပြီးပါပြီ`);
      
      // Reset form
      setFormData({
        productId: '',
        productName: '',
        category: '',
        quantity: '',
        expiryDate: '',
        costPrice: '',
        sellingPrice: '',
        unit: 'STRIP',
      });
      setSearchTerm('');
      setShowNewProductForm(false);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(`အမှား: ${error?.message || 'မသိရသေးသော အမှား'}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B5E20] flex items-center gap-2">
          Stock Entry
          <span className="text-base font-normal text-[#2E7D32] font-mm ml-2">ပစ္စည်း ထည့်သွင်းရန်</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">ရိုးရှင်းလွယ်ကူသော Stock ထည့်သွင်းစနစ်</p>
      </div>

      {/* Success/Error Messages */}
      {successMsg && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={20} />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle size={20} />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <Card className="border-l-4 border-l-[#1B5E20]">
        {/* Product Search */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#1B5E20] mb-2">
              1. ဆေးရွေးချယ်ရန် / Select Product
            </label>
            
            {!showNewProductForm ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none transition-all text-lg"
                  placeholder="ဆေးနာမည် ၂-၃ လုံး ရိုက်ရှာပါ (e.g., Bio, Para)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                {/* Search Results Dropdown */}
                {searchTerm.length >= 2 && searchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {searchResults.map((product) => {
                      const status = getStockStatus(product);
                      return (
                        <button
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="w-full text-left px-4 py-3 hover:bg-[#F1F8F4] border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{product.nameEn}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {product.category} • Stock: {product.stockLevel} {product.unit}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.color}`}>
                              {status.icon}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {searchTerm.length >= 2 && searchResults.length === 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl p-4 text-center text-slate-500">
                    <p>ဆေးမတွေ့ပါ</p>
                    <button
                      onClick={handleNewProduct}
                      className="mt-2 text-[#1B5E20] font-bold hover:underline"
                    >
                      + ဆေးအသစ် ထည့်ရန်
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="ဆေးနာမည် (English)"
                  value={formData.productName}
                  onChange={(e: any) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="e.g., Paracetamol 500mg"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <input
                    list="categories"
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-[#1B5E20] outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Analgesics"
                  />
                  <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>

                <button
                  onClick={() => {
                    setShowNewProductForm(false);
                    setSearchTerm('');
                  }}
                  className="text-sm text-slate-500 hover:text-[#1B5E20]"
                >
                  ← ရှိပြီးသား ဆေးများမှ ရွေးချယ်ရန်
                </button>
              </div>
            )}

            {!showNewProductForm && (
              <button
                onClick={handleNewProduct}
                className="mt-3 text-sm text-[#1B5E20] font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={16} />
                ဆေးအသစ် ထည့်ရန်
              </button>
            )}
          </div>

          {/* Selected Product Info */}
          {formData.productId && !showNewProductForm && (
            <div className="bg-[#F1F8F4] border border-[#2E7D32] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#1B5E20]">{formData.productName}</p>
                  <p className="text-sm text-slate-600 mt-1">Current Stock: {allProducts.find(p => p.id === formData.productId)?.stockLevel || 0}</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, productId: '', productName: '' })}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-bold text-[#1B5E20] mb-2">
                2. အရေအတွက် / Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-4 py-3 text-xl font-bold text-center border-2 border-slate-200 rounded-xl focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B5E20] mb-2">
                3. Unit Type
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B5E20] outline-none font-semibold"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {UNIT_TYPES.map(u => (
                  <option key={u.code} value={u.code}>{u.nameMm} ({u.nameEn})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B5E20] mb-2">
                4. သက်တမ်းကုန်ရက် / Expiry Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]/20 outline-none"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
              </div>
              <p className="text-xs text-slate-500 mt-1">Batch number ကို system က အလိုအလျောက် ဖန်တီးပေးပါမည်</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B5E20] mb-2">
                5. ဈေးနှုန်း / Price (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:border-[#1B5E20] outline-none text-sm"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="Cost"
                />
                <input
                  type="number"
                  className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-lg focus:border-[#1B5E20] outline-none text-sm"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="Selling"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => navigate('/inventory')}>
          ပယ်ဖျက်ရန်
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white px-8"
        >
          <Save size={18} className="mr-2" />
          သိမ်းဆည်းရန်
        </Button>
      </div>
    </div>
  );
};

export default StockEntry;
