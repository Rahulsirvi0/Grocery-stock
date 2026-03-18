/**
 * GROCERY STOCK MANAGEMENT - LOCAL STORAGE UTILITIES
 * Handles all data persistence operations
 */

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
  createdAt: string;
}

const STORAGE_KEY = 'grocery_stock_products';

/**
 * Calculate stock status based on quantity
 * Quantity = 0 → Out of Stock
 * Quantity 1-10 → Low Stock
 * Quantity > 10 → Available
 */
export const calculateStatus = (quantity: number): Product['status'] => {
  if (quantity === 0) return 'Out of Stock';
  if (quantity >= 1 && quantity <= 10) return 'Low Stock';
  return 'Available';
};

/**
 * Get all products from localStorage
 */
export const getProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const products = JSON.parse(data) as Product[];
    // Recalculate status on load to ensure consistency
    return products.map(product => ({
      ...product,
      status: calculateStatus(product.quantity)
    }));
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
};

/**
 * Save products to localStorage
 */
const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

/**
 * Add a new product
 */
export const addProduct = (name: string, quantity: number, price: number): Product => {
  const products = getProducts();
  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    quantity,
    price,
    status: calculateStatus(quantity),
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

/**
 * Update product quantity
 */
export const updateProductQuantity = (productId: string, newQuantity: number): Product | null => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) return null;
  
  products[productIndex].quantity = Math.max(0, newQuantity); // Ensure non-negative
  products[productIndex].status = calculateStatus(products[productIndex].quantity);
  
  saveProducts(products);
  return products[productIndex];
};

/**
 * Delete a product
 */
export const deleteProduct = (productId: string): boolean => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  if (filtered.length === products.length) return false; // Product not found
  saveProducts(filtered);
  return true;
};

/**
 * Get statistics for dashboard
 */
export const getStatistics = () => {
  const products = getProducts();
  return {
    totalProducts: products.length,
    availableItems: products.filter(p => p.status === 'Available').length,
    lowStockItems: products.filter(p => p.status === 'Low Stock').length,
    outOfStockItems: products.filter(p => p.status === 'Out of Stock').length
  };
};

/**
 * Initialize with sample data if empty (for demo purposes)
 */
export const initializeSampleData = (): void => {
  const products = getProducts();
  if (products.length === 0) {
    const sampleProducts = [
      { name: 'Fresh Apples', quantity: 45, price: 3.99 },
      { name: 'Organic Bananas', quantity: 8, price: 2.49 },
      { name: 'Whole Milk', quantity: 0, price: 4.29 },
      { name: 'Brown Eggs (Dozen)', quantity: 15, price: 5.99 },
      { name: 'Wheat Bread', quantity: 5, price: 3.49 },
      { name: 'Greek Yogurt', quantity: 22, price: 6.99 },
      { name: 'Cheddar Cheese', quantity: 0, price: 7.99 },
      { name: 'Orange Juice', quantity: 12, price: 5.49 }
    ];
    
    sampleProducts.forEach(product => {
      addProduct(product.name, product.quantity, product.price);
    });
  }
};
