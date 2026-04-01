import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DollarSign, Package, CheckCircle, IndianRupee } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { CATEGORIES } from "../constants/categories";

export function AddProduct() {
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    category: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [category, setCategory] = useState("");

  // Categories state
  const [categories, setCategories] = useState<any[]>([]);

  // Load categories from Supabase
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (!error && data) {
        setCategories(data);
      }
    };
    loadCategories();
  }, []);

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

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name: formData.name,
          quantity: quantity,
          price: price,
          category: formData.category,
          user_id: user?.id
        }
      ]);

    if (error) {
      alert("Error adding product: " + error.message);
      return;
    }

    setShowSuccess(true);

    setFormData({
      name: '',
      quantity: '',
      price: '',
      category: ''
    });

    setErrors({});

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">

      {/* Page title */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Add New Product
        </h2>
        <p className="text-white/80 text-lg">
          Enter product details to add to inventory
        </p>
      </div>

      {/* Success message */}
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

      {/* Form */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Product Name */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <Package className="w-5 h-5" /> Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Fresh Apples"
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.name ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
            />
            {errors.name && <p className="mt-2 text-red-300 text-sm">⚠ {errors.name}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <Package className="w-5 h-5" /> Quantity
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              placeholder="e.g., 50"
              min="0"
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.quantity ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
            />
            {errors.quantity && <p className="mt-2 text-red-300 text-sm">⚠ {errors.quantity}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <IndianRupee className="w-5 h-5" /> Price
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="e.g., 3.99"
              min="0"
              step="0.01"
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.price ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
            />
            {errors.price && <p className="mt-2 text-red-300 text-sm">⚠ {errors.price}</p>}
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="flex items-center gap-2 text-white font-semibold mb-2 text-lg">
              <Package className="w-5 h-5" /> Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-5 py-4 bg-white/10 border ${
                errors.category ? 'border-red-400' : 'border-white/30'
              } rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-lg`}
                >
              <option value="" >Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-purple-900 text-white" >
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-2 text-red-300 text-sm">⚠ {errors.category}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
          >
            <Plus className="w-6 h-6" /> Add Product to Inventory
          </button>

        </form>
      </div>
      
    </div>
    
  );
}