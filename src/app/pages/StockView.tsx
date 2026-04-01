import { useState, useEffect } from 'react';
import { Package, DollarSign, Trash2, Filter, IndianRupee } from 'lucide-react';
import { supabase } from '../utils/supabase';

/**
 * STOCK VIEW PAGE
 * Now includes CATEGORY FILTER
 */

// Add category field
type Product = {
  id: number
  name: string
  quantity: number
  price: number
  category: string
};

// Categories list
const CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy Products",
  "Beverages",
  "Snacks & Packaged Food",
  "Grains & Pulses",
  "Spices & Condiments",
  "Bakery Items",
  "Household Essentials"
];

export function StockView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sortField, setSortField] = useState<'name' | 'quantity'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState("");

  // Load products
  useEffect(() => {
    loadProducts();

    const handleFocus = () => loadProducts();
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(loadProducts, 2000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.error("Error loading products:", error.message);
      return;
    }

    setProducts(data || []);
  };

  // Delete product
  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    loadProducts();
  };

  // FILTER BY CATEGORY
  const filteredProducts = products.filter((p) =>
    selectedCategory ? p.category === selectedCategory : true
  );

  // SORT
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'quantity':
        aValue = a.quantity;
        bValue = b.quantity;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'name' | 'quantity') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // STATUS STYLE
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'Low Stock':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/50';
      case 'Out of Stock':
        return 'bg-red-500/20 text-red-300 border-red-400/50';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available': return '🟢';
      case 'Low Stock': return '🟠';
      case 'Out of Stock': return '🔴';
      default: return '⚪';
    }
  };
  
  // Get status based on quantity
  const getStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 10) return 'Low Stock';
    return 'Available';
  };
  
  return (
    <div className="animate-slide-up">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Stock Overview
        </h2>
        <p className="text-white/80 text-lg">
          Complete inventory listing with real-time status
        </p>
      </div>

      {/* Category Filter Dropdown */}
      <div className="mb-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-white" />
          <label className="text-white font-semibold text-lg">Filter by Category</label>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white"
        >
          <option value="" className="bg-purple-900 text-white">
            All Categories
          </option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-purple-900 text-white">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {filteredProducts.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <Package className="w-20 h-20 text-white/30 mx-auto mb-4" />
            <p className="text-white/60 text-xl mb-2">
              {selectedCategory ? `No products in ${selectedCategory}` : "No products in inventory"}
            </p>
            <p className="text-white/40">
              {selectedCategory ? "Select a different category or add new products" : "Add your first product to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/20">
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-6 py-4 text-left text-white font-bold text-lg cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Product Name
                        {sortField === 'name' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('quantity')}
                      className="px-6 py-4 text-left text-white font-bold text-lg cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        Quantity
                        {sortField === 'quantity' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-white font-bold text-lg">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-white font-bold text-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product, index) => {
                    const status = getStatus(product.quantity);
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-all duration-300 animate-table-row"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-semibold text-lg">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-bold text-2xl">{product.quantity}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-white font-semibold text-lg">
                            <IndianRupee className="w-5 h-5" />
                            {product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold border ${getStatusStyle(status)}`}>
                            <span>{getStatusIcon(status)}</span>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-400/50 hover:border-red-400 transition-all duration-300 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4">
              {sortedProducts.map((product, index) => {
                const status = getStatus(product.quantity);
                return (
                  <div
                    key={product.id}
                    className="bg-white/5 border border-white/20 rounded-xl p-6 space-y-4 hover:bg-white/10 transition-all duration-300 animate-table-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{product.name}</h3>
                          <p className="text-white/60 text-sm flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold border ${getStatusStyle(status)}`}>
                        <span>{getStatusIcon(status)}</span>
                        {status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm mb-1">Quantity</p>
                        <p className="text-white font-bold text-2xl">{product.quantity}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Category</p>
                        <p className="text-white font-semibold">{product.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-400/50 hover:border-red-400 transition-all duration-300 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Product
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Stats Footer */}
            <div className="bg-white/5 border-t border-white/20 px-6 py-4">
              <p className="text-white/70 text-center">
                Showing <span className="font-bold text-white">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? 's' : ''} 
                {selectedCategory && ` in ${selectedCategory}`}
              </p>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tableRow {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .animate-table-row {
          animation: tableRow 0.4s ease-out backwards;
        }
      `}</style>
    </div>
  );
}