// Bulk Grid Stock Entry - အလွယ်ဆုံး
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { useProductStore, useBranchStore } from '../store';
import { UNIT_TYPES } from '../types';
import { smartSearch } from '../utils/smartSearch';

interface StockEntryRow {
  id: string;
  productName: string;
  productId: string;
  category: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  costPrice: string;
  sellingPrice: string;
}

const StockEntry = () => {
  const navigate = useNavigate();
  const { allProducts, incrementStock, addProduct, syncWithBranch } = useProductStore();
  const { currentBranchId } = useBranchStore();

  const [rows, setRows] = useState<StockEntryRow[]>([
    {
      id: '1',
      productName: '',
      productId: '',
      category: '',
      quantity: '',
      unit: 'STRIP',
      expiryDate: '',
      costPrice: '',
      sellingPrice: '',
    }
  ]);

  // Get available categories from products
  const categories = useMemo<string[]>(() => {
    const cats = new Set(allProducts.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allProducts]);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Add new row
  const addRow = () => {
    setRows([...rows, {
      id: Date.now().toString(),
      productName: '',
      productId: '',
      category: '',
      quantity: '',
      unit: 'STRIP',
      expiryDate: '',
      costPrice: '',
      sellingPrice: '',
    }]);
  };

  // Remove row
  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  // Update row
  const updateRow = (id: string, field: keyof StockEntryRow, value: string) => {
    setRows(prevRows => 
      prevRows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Product search
  const searchProduct = (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return smartSearch(allProducts, searchTerm).slice(0, 5);
  };

  // Select product
  const selectProduct = (rowId: string, product: any) => {
    updateRow(rowId, 'productId', product.id);
    updateRow(rowId, 'productName', product.nameEn);
    updateRow(rowId, 'category', product.category || '');
    updateRow(rowId, 'unit', product.unit || 'STRIP');
    updateRow(rowId, 'sellingPrice', product.price?.toString() || '');
  };

  // Save all entries
  const handleSave = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');

      // Validate
      const validRows = rows.filter(row => 
        row.productName.trim() && 
        row.quantity && 
        parseInt(row.quantity) > 0 &&
        row.expiryDate
      );

      if (validRows.length === 0) {
        setErrorMsg('အနည်းဆုံး တစ်ခု ထည့်သွင်းရန် လိုအပ်ပါသည်');
        return;
      }

      let savedCount = 0;

      // Process each row
      for (const row of validRows) {
        try {
          // Find or create product
          let product = row.productId 
            ? allProducts.find(p => p.id === row.productId)
            : null;

          if (!product) {
            if (!currentBranchId) {
              throw new Error('Branch not selected. Please select a branch first.');
            }

            // Create new product
            const sellingPrice = parseFloat(row.sellingPrice) || 0;
            const newProduct = {
              id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              nameEn: row.productName.trim(),
              nameMm: row.productName.trim(),
              sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              category: row.category || 'Uncategorized',
              price: Math.round(sellingPrice), // Ensure integer price
              stockLevel: 0,
              unit: row.unit || 'STRIP',
              minStockLevel: 10,
              requiresPrescription: false,
              image: '',
              branchId: currentBranchId,
              batches: [],
            };

            await addProduct(newProduct);
            // Refresh products to get the created product with proper ID from backend
            await syncWithBranch(currentBranchId);
            // Find the newly created product
            product = useProductStore.getState().allProducts.find(
              p => p.nameEn === row.productName.trim() && p.branchId === currentBranchId
            );
            
            if (!product) {
              throw new Error('Failed to create product. Please try again.');
            }
          }

          // Validate required fields
          if (!product.id) {
            throw new Error('Product ID is missing');
          }
          
          if (!row.expiryDate) {
            throw new Error('Expiry date is required');
          }

          const quantity = parseInt(row.quantity);
          if (isNaN(quantity) || quantity <= 0) {
            throw new Error('Invalid quantity');
          }

          // Add stock (batch number will be auto-generated from expiry date)
          await incrementStock(
            product.id,
            null, // Auto-generate batch from expiry date
            quantity,
            row.unit || 'STRIP',
            '',
            row.expiryDate,
            parseFloat(row.costPrice) || 0
          );

          // Update price if changed
          if (row.sellingPrice && parseFloat(row.sellingPrice) > 0) {
            const newPrice = Math.round(parseFloat(row.sellingPrice));
            if (newPrice !== product.price) {
              await useProductStore.getState().updateProduct(product.id, { 
                price: newPrice
              });
            }
          }

          savedCount++;
        } catch (err: any) {
          console.error('Error saving row:', err);
          setErrorMsg(`Row ${savedCount + 1} error: ${err?.message || 'Unknown error'}`);
          // Continue with other rows
        }
      }

      // Refresh products
      await syncWithBranch(currentBranchId);

      setSuccessMsg(`${savedCount} ခု အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ`);
      
      // Reset form
      setRows([{
        id: Date.now().toString(),
        productName: '',
        productId: '',
        category: '',
        quantity: '',
        unit: 'STRIP',
        expiryDate: '',
        costPrice: '',
        sellingPrice: '',
      }]);

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error: any) {
      setErrorMsg(`အမှား: ${error?.message || 'မသိရသေးသော အမှား'}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B5E20] flex items-center gap-2">
            Stock Entry
            <span className="text-base font-normal text-[#2E7D32] font-mm ml-2">စတော့ထည့်ခြင်း</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Bulk Grid Entry - အလွယ်ဆုံး</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          className="bg-[#1B5E20] hover:bg-[#2E7D32] text-white"
        >
          <Save size={18} className="mr-2" />
          အားလုံး သိမ်းဆည်းရန်
        </Button>
      </div>

      {/* Messages */}
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

      {/* Bulk Grid */}
      <Card className="overflow-x-auto">
        <div className="min-w-full">
          <table className="w-full">
            <thead className="bg-[#1B5E20] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold">#</th>
                <th className="px-4 py-3 text-left text-sm font-bold min-w-[250px]">ဆေးနာမည်</th>
                <th className="px-4 py-3 text-left text-sm font-bold min-w-[150px]">Category</th>
                <th className="px-4 py-3 text-left text-sm font-bold">အရေအတွက်</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Unit</th>
                <th className="px-4 py-3 text-left text-sm font-bold">သက်တမ်းကုန်ရက်</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Cost Price</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Selling Price</th>
                <th className="px-4 py-3 text-center text-sm font-bold w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, index) => {
                const searchResults = row.productName.length >= 2 
                  ? searchProduct(row.productName)
                  : [];

                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 font-bold">{index + 1}</td>
                    
                    {/* Product Name */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none"
                          placeholder="ဆေးနာမည်..."
                          value={row.productName}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setRows(prevRows => 
                              prevRows.map(r => 
                                r.id === row.id 
                                  ? { ...r, productName: newValue, productId: '' } 
                                  : r
                              )
                            );
                          }}
                          onKeyDown={(e) => {
                            // Prevent form submission on Enter
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          autoFocus={index === rows.length - 1}
                        />
                        
                        {/* Search Results */}
                        {searchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {searchResults.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectProduct(row.id, product)}
                                className="w-full text-left px-3 py-2 hover:bg-[#F1F8F4] border-b border-slate-100 last:border-b-0"
                              >
                                <div className="font-semibold text-slate-800">{product.nameEn}</div>
                                <div className="text-xs text-slate-500">
                                  {product.category} • Stock: {product.stockLevel} {product.unit}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="text"
                          list={`category-list-${row.id}`}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none text-sm"
                          placeholder="Category..."
                          value={row.category}
                          onChange={(e) => updateRow(row.id, 'category', e.target.value)}
                        />
                        <datalist id={`category-list-${row.id}`}>
                          {categories.map(cat => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none text-center font-bold"
                        placeholder="0"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                      />
                    </td>

                    {/* Unit */}
                    <td className="px-4 py-3">
                      <select
                        className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none text-sm"
                        value={row.unit}
                        onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                      >
                        {UNIT_TYPES.map(u => (
                          <option key={u.code} value={u.code}>{u.nameMm}</option>
                        ))}
                      </select>
                    </td>

                    {/* Expiry Date */}
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        className="w-40 px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none text-sm"
                        value={row.expiryDate}
                        onChange={(e) => updateRow(row.id, 'expiryDate', e.target.value)}
                      />
                    </td>

                    {/* Cost Price */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none text-sm"
                        placeholder="0"
                        value={row.costPrice}
                        onChange={(e) => updateRow(row.id, 'costPrice', e.target.value)}
                      />
                    </td>

                    {/* Selling Price */}
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        className="w-28 px-3 py-2 border border-slate-300 rounded-lg focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none text-sm"
                        placeholder="0"
                        value={row.sellingPrice}
                        onChange={(e) => updateRow(row.id, 'sellingPrice', e.target.value)}
                      />
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-3 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={addRow}
            className="w-full border-dashed border-2 border-slate-300 hover:border-[#1B5E20] text-slate-600 hover:text-[#1B5E20]"
          >
            <Plus size={18} className="mr-2" />
            အတန်းအသစ် ထည့်ရန်
          </Button>
        </div>
      </Card>

      {/* Footer Actions */}
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
          အားလုံး သိမ်းဆည်းရန်
        </Button>
      </div>
    </div>
  );
};

export default StockEntry;
