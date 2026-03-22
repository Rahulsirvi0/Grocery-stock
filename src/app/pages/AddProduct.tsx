import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Package, CheckCircle } from 'lucide-react';
import { addProduct } from '../utils/storage';

/**
 * ADD PRODUCT PAGE
 * Form to add new products to inventory
 */
export function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
    }

    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Add product to storage
    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);
    addProduct(formData.name, quantity, price);

    // Show success animation
    setShowSuccess(true);
    
    // Reset form
    setFormData({ name: '', quantity: '', price: '' });
    setErrors({});

    // Hide success message and optionally navigate
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Add New Product
        </h2>
        <p className="text-white/80 text-lg">
          Enter product details to add to inventory
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 backdrop-blur-md bg-green-500/20 border border-green-400/50 rounded-2xl p-6 shadow-2xl animate-bounce-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-300" />
            <div>
              <h3 className="text-xl font-bold text-white">Product Added Successfully!</h3>
              <p className="text-green-200">The product has been added to your inventory.</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <Package className="w-5 h-5" />
              Product Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Fresh Apples"
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.name ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
            />
            {errors.name && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <span className="text-lg">⚠</span> {errors.name}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <Package className="w-5 h-5" />
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              placeholder="e.g., 50"
              min="0"
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.quantity ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
            />
            {errors.quantity && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <span className="text-lg">⚠</span> {errors.quantity}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <DollarSign className="w-5 h-5" />
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="e.g., 3.99"
              min="0"
              step="0.01"
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.price ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
            />
            {errors.price && (
              <p className="mt-2 text-red-300 text-sm flex items-center gap-1">
                <span className="text-lg">⚠</span> {errors.price}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
          >
            <Plus className="w-6 h-6" />
            Add Product to Inventory
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
