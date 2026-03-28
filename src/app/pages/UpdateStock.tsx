import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Minus, CheckCircle, Package } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { CATEGORIES } from "../constants/categories";

/**
 * UPDATE STOCK PAGE
 * Interface to update product quantities with real-time status updates
 */

type Product = {
  id: number
  name: string
  quantity: number
  price: number
  category: string
  status?: string
}

export function UpdateStock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityChange, setQuantityChange] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")

    if (error) {
      console.error("Error loading products:", error.message)
      return
    }

    setProducts(data || [])
  }

  // Update selected product
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        product.status =
          product.quantity === 0
            ? 'Out of Stock'
            : product.quantity < 10
            ? 'Low Stock'
            : 'Available';
      }
      setSelectedProduct(product || null);
      setQuantityChange('');
    } else {
      setSelectedProduct(null);
      setQuantityChange('');
    }
  }, [selectedProductId, products]);

  // Increase quantity
  const handleIncrease = () => {
    if (!selectedProduct) return;
    const amount = parseInt(quantityChange) || 1;
    const newQuantity = selectedProduct.quantity + amount;
    updateQuantity(newQuantity);
  };

  // Decrease quantity
  const handleDecrease = () => {
    if (!selectedProduct) return;
    const amount = parseInt(quantityChange) || 1;
    const newQuantity = Math.max(0, selectedProduct.quantity - amount);
    updateQuantity(newQuantity);
  };

  // Direct set
  const handleSetQuantity = () => {
    if (!selectedProduct) return;
    const newQuantity = parseInt(quantityChange);
    if (isNaN(newQuantity) || newQuantity < 0) return;
    updateQuantity(newQuantity);
  };

  // Update DB
  const updateQuantity = async (newQuantity: number) => {
    if (!selectedProduct) return;
    const difference = selectedProduct.quantity - newQuantity;
    const { error } = await supabase
      .from("products")
      .update({ quantity: newQuantity })
      .eq("id", selectedProduct.id);

    if (!error) {
      if (difference > 0) {
        await supabase.from("sales").insert({
          product_name: selectedProduct.name,
          quantity: difference
        });
      }
      loadProducts();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'text-green-300 bg-green-500/20 border-green-400/50';
      case 'Low Stock':
        return 'text-orange-300 bg-orange-500/20 border-orange-400/50';
      case 'Out of Stock':
        return 'text-red-300 bg-red-500/20 border-red-400/50';
      default:
        return 'text-white/70 bg-white/10 border-white/20';
    }
  };

  // FILTER PRODUCTS BASED ON CATEGORY
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : [];

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Update Stock Levels
        </h2>
        <p className="text-white/80 text-lg">
          Manage product quantities with real-time status updates
        </p>
      </div>

      {showSuccess && (
        <div className="mb-6 backdrop-blur-md bg-green-500/20 border border-green-400/50 rounded-2xl p-4 shadow-2xl animate-bounce-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-300" />
            <p className="text-white font-semibold">
              Stock Updated Successfully!
            </p>
          </div>
        </div>
      )}

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl space-y-8">
        {/* CATEGORY SELECT */}
        <div>
          <label className="flex items-center gap-2 text-white font-semibold mb-3 text-lg">
            <Package className="w-5 h-5" />
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setSelectedProductId(null)
            }}
            className="w-full px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white"
          >
            <option value="" className="bg-purple-900 text-white">
              -- Choose Category --
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-purple-900 text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT SELECT */}
        <div>
          <label htmlFor="product-select" className="flex items-center gap-2 text-white font-semibold mb-3 text-lg">
            <RefreshCw className="w-5 h-5" />
            Select Product
          </label>
          <select
            id="product-select"
            value={selectedProductId ?? ''}
            onChange={(e) =>
              setSelectedProductId(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="w-full px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white"
          >
            <option value="" className="bg-purple-900 text-white">
              -- Choose a Product --
            </option>
            {filteredProducts.map(product => (
              <option key={product.id} value={product.id} className="bg-purple-900 text-white">
                {product.name} (Current: {product.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT DETAILS */}
        {selectedProduct && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-semibold text-xl mb-4">
                Current Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Product Name</p>
                  <p className="text-white font-bold text-lg">
                    {selectedProduct.name}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Current Quantity</p>
                  <p className="text-white font-bold text-3xl">
                    {selectedProduct.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Status</p>
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg font-bold border ${getStatusColor(selectedProduct.status || 'Available')}`}>
                    {selectedProduct.status}
                  </span>
                </div>
              </div>
            </div>

            {/* ADDED: QUANTITY CONTROLS SECTION */}
            <div className="bg-white/5 border border-white/20 rounded-xl p-6">
              <h3 className="text-white font-semibold text-xl mb-4">
                Update Quantity
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/80 text-sm mb-2 block">
                    Quantity to Add/Remove
                  </label>
                  <input
                    type="number"
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(e.target.value)}
                    placeholder="Enter quantity (default: 1)"
                    className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleIncrease}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 rounded-xl text-white font-semibold transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Increase
                  </button>
                  <button
                    onClick={handleDecrease}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-xl text-white font-semibold transition-all"
                  >
                    <Minus className="w-5 h-5" />
                    Decrease
                  </button>
                  <button
                    onClick={handleSetQuantity}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 rounded-xl text-white font-semibold transition-all"
                  >
                    Set Quantity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}