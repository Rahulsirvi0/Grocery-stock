import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Minus, CheckCircle } from 'lucide-react';
import { getProducts, updateProductQuantity, Product } from '../utils/storage';

/**
 * UPDATE STOCK PAGE
 * Interface to update product quantities with real-time status updates
 */
export function UpdateStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityChange, setQuantityChange] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = getProducts();
    setProducts(allProducts);
  };

  // Update selected product details when selection changes
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      setSelectedProduct(product || null);
      setQuantityChange('');
    } else {
      setSelectedProduct(null);
      setQuantityChange('');
    }
  }, [selectedProductId, products]);

  // Handle quantity increase
  const handleIncrease = () => {
    if (!selectedProduct) return;
    const amount = parseInt(quantityChange) || 1;
    const newQuantity = selectedProduct.quantity + amount;
    updateQuantity(newQuantity);
  };

  // Handle quantity decrease
  const handleDecrease = () => {
    if (!selectedProduct) return;
    const amount = parseInt(quantityChange) || 1;
    const newQuantity = Math.max(0, selectedProduct.quantity - amount);
    updateQuantity(newQuantity);
  };

  // Handle direct quantity set
  const handleSetQuantity = () => {
    if (!selectedProduct) return;
    const newQuantity = parseInt(quantityChange);
    if (isNaN(newQuantity) || newQuantity < 0) return;
    updateQuantity(newQuantity);
  };

  // Update quantity in storage and refresh UI
  const updateQuantity = (newQuantity: number) => {
    if (!selectedProduct) return;
    
    const updated = updateProductQuantity(selectedProduct.id, newQuantity);
    if (updated) {
      // Refresh products list
      loadProducts();
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  // Get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-green-300 bg-green-500/20 border-green-400/50';
      case 'Low Stock': return 'text-orange-300 bg-orange-500/20 border-orange-400/50';
      case 'Out of Stock': return 'text-red-300 bg-red-500/20 border-red-400/50';
      default: return 'text-white/70 bg-white/10 border-white/20';
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Update Stock Levels
        </h2>
        <p className="text-white/80 text-lg">
          Manage product quantities with real-time status updates
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 backdrop-blur-md bg-green-500/20 border border-green-400/50 rounded-2xl p-4 shadow-2xl animate-bounce-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <p className="text-white font-semibold">Stock Updated Successfully!</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl space-y-8">
        
        {/* Product Selection */}
        <div>
          <label htmlFor="product-select" className="flex items-center gap-2 text-white font-semibold mb-3 text-lg">
            <RefreshCw className="w-5 h-5" />
            Select Product
          </label>
          <select
            id="product-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg cursor-pointer"
          >
            <option value="" className="bg-purple-900 text-white">-- Choose a Product --</option>
            {products.map(product => (
              <option key={product.id} value={product.id} className="bg-purple-900 text-white">
                {product.name} (Current: {product.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Product Details */}
        {selectedProduct && (
          <div className="space-y-6 animate-fade-in">
            {/* Current Status Card */}
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-semibold text-xl mb-4">Current Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Product Name</p>
                  <p className="text-white font-bold text-lg">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Current Quantity</p>
                  <p className="text-white font-bold text-3xl">{selectedProduct.quantity}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Status</p>
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg font-bold border ${getStatusColor(selectedProduct.status)}`}>
                    {selectedProduct.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-white font-semibold text-xl mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setQuantityChange('1'); handleIncrease(); }}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Increase by 1
                </button>
                <button
                  onClick={() => { setQuantityChange('1'); handleDecrease(); }}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Minus className="w-5 h-5" />
                  Decrease by 1
                </button>
              </div>
            </div>

            {/* Custom Adjustment */}
            <div>
              <h3 className="text-white font-semibold text-xl mb-4">Custom Adjustment</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder="Enter quantity"
                  min="0"
                  className="flex-1 px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg"
                />
                <button
                  onClick={handleIncrease}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
                <button
                  onClick={handleDecrease}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
                >
                  <Minus className="w-5 h-5" />
                  Remove
                </button>
                <button
                  onClick={handleSetQuantity}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedProduct && (
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-lg">Select a product to update its stock level</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
