import React, { useState } from 'react';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, Tag, BarChart3, Plus, Edit3, Trash2, Building2 } from 'lucide-react';
import { dataService } from '../../utils/dataService';
import { Product, Order, InventoryMovement, Coupon, Branch } from '../../types/ecommerce';
import { useStore } from '../../context/useStore';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useStore();

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'coupons' | 'reports'>('overview');
  const [selectedBranchId, setSelectedBranchId] = useState('br-main');

  const products = dataService.getProducts();
  const orders = dataService.getOrders();
  const inventoryMovements = dataService.getInventoryMovements();
  const coupons = dataService.getCoupons();
  const branches = dataService.getBranches();
  const lowStockItems = dataService.getLowStockVariants(5);

  // KPI calculations
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.fulfillmentStatus === 'PENDING').length;
  const totalProductsCount = products.length;

  // New Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product Form state
  const [prodTitle, setProdTitle] = useState('');
  const [prodGender, setProdGender] = useState<'women' | 'men' | 'unisex'>('women');
  const [prodCategory, setProdCategory] = useState('Dresses');
  const [prodPrice, setProdPrice] = useState(5000);
  const [prodSalePrice, setProdSalePrice] = useState<number | undefined>(undefined);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');

  // New Coupon Form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState(15);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim()) return;

    const newProd: Product = {
      id: editingProductId || 'prod-' + Date.now(),
      title: prodTitle,
      slug: prodTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      gender: prodGender,
      category: prodCategory,
      subcategory: prodCategory,
      price: Number(prodPrice),
      salePrice: prodSalePrice ? Number(prodSalePrice) : undefined,
      onSale: !!prodSalePrice && Number(prodSalePrice) < Number(prodPrice),
      isNew: true,
      isBestSeller: false,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 1,
      description: prodDesc || 'Luxury fashion item from Gem & Crystal Hub.',
      fabricCare: 'Dry clean or gentle hand wash.',
      images: [prodImage],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Default Color', hex: '#ec4899' }],
      variants: [
        { id: 'v-' + Date.now() + '-s', sku: 'SKU-S', size: 'S', color: 'Default Color', price: Number(prodPrice), stockQuantity: 10 },
        { id: 'v-' + Date.now() + '-m', sku: 'SKU-M', size: 'M', color: 'Default Color', price: Number(prodPrice), stockQuantity: 15 },
        { id: 'v-' + Date.now() + '-l', sku: 'SKU-L', size: 'L', color: 'Default Color', price: Number(prodPrice), stockQuantity: 8 },
      ]
    };

    dataService.saveProduct(newProd);
    showToast(`Product "${prodTitle}" saved successfully!`, 'success');
    setIsProductModalOpen(false);
    resetProductForm();
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdPrice(5000);
    setProdSalePrice(undefined);
    setProdDesc('');
  };

  const handleAdjustStockClick = (productId: string, variantId: string, delta: number) => {
    dataService.adjustStock(productId, variantId, delta, delta > 0 ? 'IN' : 'OUT', 'Manual Admin Stock Adjustment', selectedBranchId);
    showToast(`Stock updated by ${delta > 0 ? `+${delta}` : delta}`, 'info');
  };

  const handleUpdateOrderStatus = (orderId: string, fStatus: Order['fulfillmentStatus'], pStatus: Order['paymentStatus']) => {
    dataService.updateOrderStatus(orderId, fStatus, pStatus);
    showToast(`Order status updated to ${fStatus} / ${pStatus}`, 'success');
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    dataService.saveCoupon({
      code: newCouponCode.toUpperCase().trim(),
      discountType: 'PERCENTAGE',
      discountValue: Number(newCouponVal),
      minOrderAmount: 0,
      expiryDate: '2028-12-31',
      usageLimit: 1000,
      usageCount: 0,
      isActive: true,
    });

    showToast(`Coupon ${newCouponCode.toUpperCase()} created!`, 'success');
    setNewCouponCode('');
  };

  return (
    <div className="py-10 bg-[#09090b] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header & Branch Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-gem-border gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-white">GEM & CRYSTAL ADMIN DASHBOARD</h1>
          </div>

          {/* Branch Readiness Selector */}
          <div className="flex items-center space-x-3 bg-[#121215] p-2 rounded-xl border border-gem-border text-xs">
            <Building2 className="w-4 h-4 text-gem-pink" />
            <span className="text-slate-400 font-semibold">Active Boutique Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-[#18181b] text-white font-bold px-3 py-1.5 rounded-lg border border-gem-border focus:outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="crystal-card p-5 rounded-xl border-l-4 border-l-gem-pink flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Revenue</span>
              <span className="text-2xl font-extrabold text-white">KSh {totalRevenue.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gem-pink/15 text-gem-pink flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="crystal-card p-5 rounded-xl border-l-4 border-l-amber-500 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Pending Orders</span>
              <span className="text-2xl font-extrabold text-white">{pendingOrdersCount} Orders</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>

          <div className="crystal-card p-5 rounded-xl border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Active Catalog</span>
              <span className="text-2xl font-extrabold text-white">{totalProductsCount} Products</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="crystal-card p-5 rounded-xl border-l-4 border-l-rose-500 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Low Stock Alerts</span>
              <span className="text-2xl font-extrabold text-rose-400">{lowStockItems.length} Variants</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex space-x-2 border-b border-gem-border mb-8 overflow-x-auto">
          {(['overview', 'products', 'inventory', 'orders', 'coupons', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveAdminTab(tab)}
              className={`pb-3 px-5 font-serif text-base font-bold capitalize transition-all border-b-2 whitespace-nowrap ${
                activeAdminTab === tab ? 'border-gem-pink text-gem-pink' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeAdminTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Recent Orders List */}
            <div className="crystal-card p-6 rounded-xl border border-gem-border">
              <h3 className="font-serif text-lg font-bold text-white mb-4">Recent Store Orders</h3>
              <div className="space-y-3 text-xs">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-3 rounded-lg bg-[#121215] border border-gem-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white font-mono block">{o.orderNumber}</span>
                      <span className="text-slate-400">{o.customer.fullName} • {o.items.length} items</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-gem-pink block">KSh {o.total.toLocaleString()}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">{o.paymentStatus} ({o.paymentMethod})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts Box */}
            <div className="crystal-card p-6 rounded-xl border border-gem-border">
              <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Low Stock Threshold Alerts (≤ 5)</span>
              </h3>
              <div className="space-y-2 text-xs">
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 flex items-center justify-between text-slate-200">
                      <div>
                        <span className="font-bold text-white block">{item.product.title}</span>
                        <span className="text-[11px] text-slate-400">
                          Size: {item.variant.size} | Color: {item.variant.color} | SKU: {item.variant.sku}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          {item.variant.stockQuantity} Left
                        </span>
                        <button
                          onClick={() => handleAdjustStockClick(item.product.id, item.variant.id, 10)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-[11px]"
                        >
                          +10 Stock
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">All product variant stock levels are healthy.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeAdminTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-white">Product Catalogue Manager</h3>
              <button
                onClick={() => {
                  resetProductForm();
                  setIsProductModalOpen(true);
                }}
                className="px-4 py-2.5 bg-gem-pink hover:bg-gem-magenta text-white font-bold text-xs rounded-lg shadow-pink-glow flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Fashion Item</span>
              </button>
            </div>

            <div className="crystal-card rounded-xl overflow-hidden border border-gem-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#121215] text-slate-400 uppercase text-[10px] tracking-wider border-b border-gem-border">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Department</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price (KES)</th>
                      <th className="p-4">Total Stock</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gem-border/60">
                    {products.map(p => {
                      const totalQty = p.variants.reduce((s, v) => s + v.stockQuantity, 0);
                      return (
                        <tr key={p.id} className="hover:bg-[#121215]">
                          <td className="p-4 flex items-center space-x-3">
                            <img src={p.images[0]} alt="" className="w-10 h-12 rounded object-cover" />
                            <span className="font-bold text-white">{p.title}</span>
                          </td>
                          <td className="p-4 capitalize">{p.gender}</td>
                          <td className="p-4">{p.category}</td>
                          <td className="p-4 font-bold text-white">KSh {p.price.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${totalQty > 5 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                              {totalQty} Units
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProductId(p.id);
                                setProdTitle(p.title);
                                setProdPrice(p.price);
                                setProdSalePrice(p.salePrice);
                                setProdCategory(p.category);
                                setProdDesc(p.description);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-gem-pink"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                dataService.deleteProduct(p.id);
                                showToast(`Product deleted.`, 'info');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeAdminTab === 'inventory' && (
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-6">Variant-Level Inventory & Stock Control</h3>
            <div className="crystal-card rounded-xl overflow-hidden border border-gem-border mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#121215] text-slate-400 uppercase text-[10px] tracking-wider border-b border-gem-border">
                    <tr>
                      <th className="p-4">Item & Variant</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Size / Color</th>
                      <th className="p-4">Available Stock</th>
                      <th className="p-4 text-right">Adjust Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gem-border/60">
                    {products.flatMap(p =>
                      p.variants.map(v => (
                        <tr key={v.id} className="hover:bg-[#121215]">
                          <td className="p-4 font-bold text-white">{p.title}</td>
                          <td className="p-4 font-mono text-slate-400">{v.sku}</td>
                          <td className="p-4">{v.size} / {v.color}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.stockQuantity > 5 ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'}`}>
                              {v.stockQuantity} in stock
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <button
                              onClick={() => handleAdjustStockClick(p.id, v.id, -1)}
                              className="px-2.5 py-1 bg-rose-950 border border-rose-800 text-rose-400 hover:bg-rose-900 rounded font-bold"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleAdjustStockClick(p.id, v.id, 5)}
                              className="px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 rounded font-bold"
                            >
                              +5
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeAdminTab === 'orders' && (
          <div>
            <h3 className="font-serif text-xl font-bold text-white mb-6">Order Status & Fulfillment Manager</h3>
            <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="crystal-card p-6 rounded-xl border border-gem-border">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gem-border gap-4 text-xs">
                    <div>
                      <span className="font-bold text-white font-mono text-sm">{o.orderNumber}</span>
                      <span className="text-slate-400 ml-3">Customer: {o.customer.fullName} ({o.customer.phone})</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Fulfillment Status Select */}
                      <select
                        value={o.fulfillmentStatus}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any, o.paymentStatus)}
                        className="bg-[#121215] border border-gem-border rounded px-3 py-1.5 text-xs text-white font-bold cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY">READY FOR DELIVERY</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>

                      {/* Payment Status Select */}
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => handleUpdateOrderStatus(o.id, o.fulfillmentStatus, e.target.value as any)}
                        className="bg-emerald-950 border border-emerald-700 text-emerald-400 rounded px-3 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  </div>

                  <div className="py-3 text-xs text-slate-300">
                    <p>Delivery Destination: {o.customer.address}, {o.customer.townCity}, {o.customer.county}</p>
                    <p className="text-slate-400 mt-0.5">Receipt Reference: <strong className="text-white font-mono">{o.mpesaReceipt || o.stripePaymentId || 'QJH87492KS'}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COUPONS TAB */}
        {activeAdminTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="crystal-card p-6 rounded-xl border border-gem-border">
              <h3 className="font-serif text-lg font-bold text-white mb-4">Create Discount Code</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GEM10"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white font-mono uppercase focus:border-gem-pink"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gem-pink hover:bg-gem-magenta text-white font-bold uppercase rounded-lg shadow-pink-glow"
                >
                  Create Coupon
                </button>
              </form>
            </div>

            <div className="crystal-card p-6 rounded-xl border border-gem-border">
              <h3 className="font-serif text-lg font-bold text-white mb-4">Active Discount Codes</h3>
              <div className="space-y-3 text-xs">
                {coupons.map(c => (
                  <div key={c.code} className="p-3 rounded-lg bg-[#121215] border border-gem-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gem-pink font-mono text-sm block">{c.code}</span>
                      <span className="text-slate-400">{c.discountValue}% OFF • Used {c.usageCount} times</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 font-bold rounded">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeAdminTab === 'reports' && (
          <div className="crystal-card p-8 rounded-xl border border-gem-border text-xs text-slate-300">
            <h3 className="font-serif text-2xl font-bold text-white mb-4">Store Sales & Revenue Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-xl bg-[#121215] border border-gem-border">
                <span className="text-slate-400 block mb-1">M-PESA Total Sales</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  KSh {orders.filter(o => o.paymentMethod === 'MPESA').reduce((s, o) => s + o.total, 0).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-gem-border">
                <span className="text-slate-400 block mb-1">Card Payment Sales</span>
                <span className="text-2xl font-extrabold text-gem-pink">
                  KSh {orders.filter(o => o.paymentMethod === 'CARD').reduce((s, o) => s + o.total, 0).toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#121215] border border-gem-border">
                <span className="text-slate-400 block mb-1">Average Order Value</span>
                <span className="text-2xl font-extrabold text-white">
                  KSh {orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#09090b] border border-gem-pink/40 rounded-2xl p-6 shadow-2xl z-10 text-xs">
            <h3 className="font-serif text-xl font-bold text-white mb-4">
              {editingProductId ? 'Edit Product' : 'Add New Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white focus:border-gem-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Department</label>
                  <select
                    value={prodGender}
                    onChange={(e) => setProdGender(e.target.value as any)}
                    className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Price (KES)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Sale Price (Optional)</label>
                  <input
                    type="number"
                    value={prodSalePrice || ''}
                    onChange={(e) => setProdSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gem-border">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gem-pink text-white font-bold rounded-lg shadow-pink-glow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
