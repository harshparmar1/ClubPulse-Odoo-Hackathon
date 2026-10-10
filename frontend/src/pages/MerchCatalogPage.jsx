import React, { useState, useEffect } from 'react';
import { api, formatINR } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Box, CheckCircle2, AlertCircle, Sparkles, X, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';

export const MerchCatalogPage = () => {
  const { user, isMember } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [orderError, setOrderError] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await api.get('/api/products');
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load merchandise:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openOrderModal = (product) => {
    setSelectedProduct(product);
    const firstAvail = product.sizes.find((s) => s.stock > 0);
    setSelectedSize(firstAvail ? firstAvail.size : product.sizes[0]?.size || 'Standard');
    setQuantity(1);
    setDeliveryNotes('');
    setOrderError('');
    setOrderSuccess(null);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setOrderLoading(true);
    setOrderError('');

    try {
      const res = await api.post('/api/orders', {
        items: [
          {
            product_id: selectedProduct.id,
            size: selectedSize,
            quantity
          }
        ],
        delivery_notes: deliveryNotes
      });
      setOrderSuccess(res);
      fetchProducts();
    } catch (err) {
      setOrderError(err.message || 'Order could not be placed due to stock shortage.');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#625BF6]/10 border border-[#625BF6]/20 text-xs font-semibold text-[#625BF6] mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Official Chapter Store</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171A2B]">
            Chapter Merchandise & Gear
          </h1>
          <p className="text-xs sm:text-sm text-[#687086] mt-1 max-w-xl">
            High-grade organic cotton hoodies, conference edition tees, and waterproof die-cut decal packs.
            Proceeds support collegiate hackathon travel grants.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E7E9F1]"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-[#E7E9F1]">
            <EmptyState
              icon={Box}
              title="No merchandise items listed"
              description="New chapter hoodies and gear will be added before the next semester."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((prod) => {
              const inStock = prod.total_stock > 0;
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[#E7E9F1] shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-48 rounded-xl bg-[#F7F8FC] overflow-hidden relative">
                      <img
                        src={prod.image_url || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant={inStock ? (prod.total_stock <= 5 ? 'warning' : 'active') : 'critical'}>
                          {inStock ? (prod.total_stock <= 5 ? `Low Stock (${prod.total_stock})` : 'In Stock') : 'Sold Out'}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#625BF6] mb-0.5">
                        {prod.category} • SKU: {prod.sku}
                      </div>
                      <h3 className="font-bold text-base text-[#171A2B]">{prod.name}</h3>
                      <p className="text-xs text-[#687086] mt-1 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Size pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-[#687086] mr-1">Sizes:</span>
                      {prod.sizes?.map((sz) => (
                        <span
                          key={sz.size}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                            sz.stock > 0
                              ? 'bg-[#F7F8FC] text-[#171A2B] border-[#E7E9F1]'
                              : 'bg-[#F7F8FC] text-[#687086]/50 border-dashed border-[#E7E9F1] line-through'
                          }`}
                        >
                          {sz.size} ({sz.stock})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E7E9F1] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#687086]">Price</div>
                      <div className="text-base font-bold text-[#171A2B]">
                        {formatINR(prod.price_paise)}
                      </div>
                    </div>

                    <button
                      onClick={() => openOrderModal(prod)}
                      disabled={!inStock}
                      className="px-4 py-2 bg-[#625BF6] hover:bg-[#5048E5] disabled:opacity-40 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{inStock ? 'Order Now' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Order Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E7E9F1]">
            <div className="p-4 border-b border-[#E7E9F1] flex items-center justify-between bg-[#F7F8FC]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#625BF6]/10 text-[#625BF6] rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#171A2B] text-sm">Place Order</h3>
                  <p className="text-xs text-[#687086]">{selectedProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-[#687086] hover:text-[#171A2B] rounded-lg hover:bg-[#E7E9F1]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {orderSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-[#16856B]/10 text-[#16856B] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-[#171A2B]">Order Confirmed!</h4>
                  <p className="text-xs text-[#687086]">
                    Order #{orderSuccess.id.slice(-6).toUpperCase()} has been reserved. You can collect your apparel at the club office desk.
                  </p>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="w-full mt-3 py-2 bg-[#625BF6] text-white rounded-xl text-xs font-semibold hover:bg-[#5048E5]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {orderError && (
                    <div className="p-3 rounded-xl bg-[#D9485F]/10 border border-[#D9485F]/20 flex items-center gap-2 text-xs text-[#D9485F]">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#D9485F]" />
                      <span>{orderError}</span>
                    </div>
                  )}

                  {/* Size Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171A2B] mb-1.5">
                      Select Variant Size
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.sizes.map((sz) => {
                        const isAvail = sz.stock > 0;
                        const isSelected = selectedSize === sz.size;
                        return (
                          <button
                            key={sz.size}
                            type="button"
                            disabled={!isAvail}
                            onClick={() => setSelectedSize(sz.size)}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                              isSelected
                                ? 'bg-[#625BF6] text-white border-[#625BF6] shadow-2xs'
                                : isAvail
                                ? 'bg-white hover:bg-[#F7F8FC] text-[#171A2B] border-[#E7E9F1]'
                                : 'bg-[#F7F8FC] text-[#687086]/40 border-dashed border-[#E7E9F1] cursor-not-allowed'
                            }`}
                          >
                            <div>{sz.size}</div>
                            <div className="text-[9px] font-normal opacity-80 mt-0.5">
                              {isAvail ? `${sz.stock} left` : 'Out'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                      Quantity
                    </label>
                    <div className="flex items-center border border-[#E7E9F1] rounded-xl w-32 overflow-hidden bg-[#F7F8FC]">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-1.5 hover:bg-[#E7E9F1] text-[#171A2B] font-bold"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-xs text-[#171A2B]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-1.5 hover:bg-[#E7E9F1] text-[#171A2B] font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#171A2B] mb-1">
                      Delivery / Pickup Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Collect at CS Lab or Hostel 4"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#E7E9F1] rounded-xl bg-[#F7F8FC] text-[#171A2B] focus:outline-none focus:ring-2 focus:ring-[#625BF6]"
                    />
                  </div>

                  {/* Price & Checkout */}
                  <div className="pt-3 border-t border-[#E7E9F1] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#687086]">Total Due</span>
                      <div className="text-lg font-bold text-[#171A2B]">
                        {formatINR(selectedProduct.price_paise * quantity)}
                      </div>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={orderLoading}
                      className="px-5 py-2.5 bg-[#625BF6] hover:bg-[#5048E5] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <span>{orderLoading ? 'Reserving...' : 'Confirm Order'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
