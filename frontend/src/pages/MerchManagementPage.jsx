import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { Box, Plus, AlertTriangle, CheckCircle2, X, ShoppingBag } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const MerchManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceInr, setPriceInr] = useState(499);
  const [category, setCategory] = useState('Hoodies');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stockS, setStockS] = useState(10);
  const [stockM, setStockM] = useState(20);
  const [stockL, setStockL] = useState(15);
  const [stockXL, setStockXL] = useState(5);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await api.get('/api/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await api.post('/api/products', {
        name,
        description,
        price_paise: Math.round(Number(priceInr) * 100),
        category,
        sku: sku.toUpperCase(),
        image_url: imageUrl || null,
        sizes: [
          { size: 'S', stock: Number(stockS) },
          { size: 'M', stock: Number(stockM) },
          { size: 'L', stock: Number(stockL) },
          { size: 'XL', stock: Number(stockXL) }
        ]
      });
      setModalOpen(false);
      setName('');
      setDescription('');
      setSku('');
      fetchProducts();
    } catch (err) {
      alert(`Product creation failed: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
              <Box className="w-3.5 h-3.5" />
              <span>Merchandise & Stock Logistics</span>
            </div>
            <h1 className="text-2xl font-bold text-[#171A2B] tracking-tight">
              Inventory & Apparel SKUs
            </h1>
            <p className="text-xs text-[#687086] mt-1">
              Manage product sizing variants, stock reserves, and textile supplier SKUs.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#625BF6] hover:bg-[#5048E5] text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton lines={5} />
            </div>
          ) : products.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Box}
                title="No inventory products added"
                description="Click 'Add New Product SKU' to add hoodies, tees, or club badges."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F8FC] text-[#687086] uppercase font-bold border-b border-[#E7E9F1] text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (INR)</th>
                    <th className="py-3.5 px-4">Size Variant Breakdown</th>
                    <th className="py-3.5 px-4">Total Available</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F1] font-medium text-[#171A2B]">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#F7F8FC]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#171A2B]">{prod.name}</div>
                        <div className="text-[11px] font-mono text-[#687086]">SKU: {prod.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 capitalize text-[#687086]">{prod.category}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171A2B]">
                        {formatINR(prod.price_paise)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {prod.sizes?.map((s) => (
                            <span
                              key={s.size}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                s.stock <= 2
                                  ? 'bg-[#D9485F]/10 text-[#D9485F] border-[#D9485F]/20'
                                  : 'bg-[#F7F8FC] text-[#171A2B] border-[#E7E9F1]'
                              }`}
                            >
                              {s.size}: {s.stock}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-sm text-[#171A2B]">
                        {prod.total_stock} units
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            prod.total_stock === 0
                              ? 'critical'
                              : prod.total_stock <= 5
                              ? 'warning'
                              : 'active'
                          }
                        >
                          {prod.total_stock === 0 ? 'Sold Out' : prod.total_stock <= 5 ? 'Low Stock' : 'Optimal'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E7E9F1]">
              <div className="flex justify-between items-center border-b border-[#E7E9F1] pb-3">
                <h3 className="font-bold text-sm text-[#171A2B]">Add New Merchandise Product</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-[#687086] hover:text-[#171A2B] hover:bg-[#F7F8FC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter Embroidered Fleece"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#171A2B] mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CP-HOOD-26"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#171A2B] mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                    >
                      <option value="Hoodies">Hoodies</option>
                      <option value="T-Shirts">T-Shirts</option>
                      <option value="Badges">Badges</option>
                      <option value="Stickers">Stickers</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={priceInr}
                    onChange={(e) => setPriceInr(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Material specs, wash instructions, fabric GSM..."
                    className="w-full px-3 py-2 border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold text-[#171A2B] mb-1">
                    Initial Stock by Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="block text-[10px] text-[#687086] font-bold">S</span>
                      <input
                        type="number"
                        min="0"
                        value={stockS}
                        onChange={(e) => setStockS(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-[#E7E9F1] bg-[#F7F8FC] rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#687086] font-bold">M</span>
                      <input
                        type="number"
                        min="0"
                        value={stockM}
                        onChange={(e) => setStockM(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-[#E7E9F1] bg-[#F7F8FC] rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#687086] font-bold">L</span>
                      <input
                        type="number"
                        min="0"
                        value={stockL}
                        onChange={(e) => setStockL(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-[#E7E9F1] bg-[#F7F8FC] rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#687086] font-bold">XL</span>
                      <input
                        type="number"
                        min="0"
                        value={stockXL}
                        onChange={(e) => setStockXL(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs border border-[#E7E9F1] bg-[#F7F8FC] rounded-lg text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-[#E7E9F1] text-[#687086] rounded-xl font-semibold hover:bg-[#F7F8FC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 py-2.5 bg-[#625BF6] text-white rounded-xl font-semibold hover:bg-[#5048E5] transition-colors"
                  >
                    {createLoading ? 'Saving...' : 'Add SKU'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
