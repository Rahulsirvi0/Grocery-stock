import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Tax rates based on product categories (current market rates)
const taxRates: { [key: string]: { cgst: number; sgst: number; total: number } } = {
  "Fruits & Vegetables": { cgst: 2.5, sgst: 2.5, total: 5 },
  "Dairy Products": { cgst: 6, sgst: 6, total: 12 },
  "Beverages": { cgst: 14, sgst: 14, total: 28 },
  "Snacks & Packaged Food": { cgst: 6, sgst: 6, total: 12 },
  "Grains & Pulses": { cgst: 0, sgst: 0, total: 0 },
  "Spices & Condiments": { cgst: 6, sgst: 6, total: 12 },
  "Bakery Items": { cgst: 6, sgst: 6, total: 12 },
  "Household Essentials": { cgst: 9, sgst: 9, total: 18 }
};

export default function Billing() {
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [businessDetails, setBusinessDetails] = useState<any>({});
  
  // Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    phone: ""
  });
  
  // Payment details
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionId, setTransactionId] = useState("");
  
  // Discount
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");

  // Generate unique invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());

  // Load business details from logged user
  const loadBusinessDetails = async () => {
    // First try to get from localStorage
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");
    
    if (loggedUser && loggedUser.shopName) {
      // Use data from signup
      setBusinessDetails({
        name: loggedUser.shopName,
        address: loggedUser.address || "Address not updated",
        phone: loggedUser.phone || "Not provided",
        email: loggedUser.email,
        gst: loggedUser.gstNumber || "Not registered"
      });
    } else {
      // If no data in localStorage, fetch from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setBusinessDetails({
            name: profile.shop_name,
            address: profile.address || "Address not updated",
            phone: profile.phone || "Not provided",
            email: profile.email,
            gst: profile.gst_number || "Not registered"
          });
          
          // Update localStorage
          localStorage.setItem("loggedUser", JSON.stringify({
            username: profile.username,
            shopName: profile.shop_name,
            email: profile.email,
            address: profile.address,
            gstNumber: profile.gst_number,
            phone: profile.phone || ""
          }));
        }
      }
    }
  };

  // Load products
  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
    loadBusinessDetails();
    resetInvoiceNumber();
  }, []);

  const resetInvoiceNumber = () => {
    setInvoiceNumber(generateInvoiceNumber());
  };

  // Add item to bill
  const addItem = () => {
    const product = products.find(p => p.id == selectedProduct);
    if (!product) return;

    const existingItem = billItems.find(item => item.id === product.id);
    
    // Get tax rate for product category
    const taxRate = taxRates[product.category] || taxRates["Household Essentials"];
    
    if (existingItem) {
      setBillItems(prev => prev.map(item => 
        item.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + quantity, 
              total: (item.quantity + quantity) * product.price,
              taxAmount: ((item.quantity + quantity) * product.price * taxRate.total) / 100
            }
          : item
      ));
    } else {
      const itemTotal = product.price * quantity;
      const item = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: itemTotal,
        category: product.category,
        taxRate: taxRate,
        cgstAmount: (itemTotal * taxRate.cgst) / 100,
        sgstAmount: (itemTotal * taxRate.sgst) / 100
      };
      setBillItems(prev => [...prev, item]);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    
    billItems.forEach(item => {
      subtotal += item.total;
      totalCgst += (item.total * item.taxRate.cgst) / 100;
      totalSgst += (item.total * item.taxRate.sgst) / 100;
    });
    
    const discountAmount = discountType === "percentage" 
      ? (subtotal * discount) / 100 
      : discount;
    
    const taxableAmount = subtotal - discountAmount;
    const grandTotal = taxableAmount + totalCgst + totalSgst;
    
    return { subtotal, totalCgst, totalSgst, discountAmount, taxableAmount, grandTotal };
  };

  const { subtotal, totalCgst, totalSgst, discountAmount, taxableAmount, grandTotal } = calculateTotals();

  // Generate bill and save to database
  const generateBill = async () => {
    if (billItems.length === 0) {
      alert("Please add items to the bill");
      return;
    }

    if (!customerDetails.name || !customerDetails.phone) {
      alert("Please enter customer name and phone number");
      return;
    }

    // Generate transaction ID only for non-cash payments
    const finalTransactionId = paymentMethod !== "Cash" 
      ? (transactionId || `TXN-${Date.now()}`)
      : "N/A";

    const { data: bill, error: billError } = await supabase
      .from("bills")
      .insert({
        invoice_number: invoiceNumber,
        customer_name: customerDetails.name,
        customer_address: customerDetails.address,
        customer_phone: customerDetails.phone,
        subtotal: subtotal,
        discount: discountAmount,
        taxable_amount: taxableAmount,
        cgst: totalCgst,
        sgst: totalSgst,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        transaction_id: finalTransactionId,
        bill_date: new Date().toISOString()
      })
      .select()
      .single();

    if (billError) {
      console.error("Error creating bill:", billError);
      alert("Error creating bill");
      return;
    }

    if (!bill) return;

    // Save bill items and update stock
    for (const item of billItems) {
      await supabase
        .from("bill_items")
        .insert({
          bill_id: bill.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          category: item.category,
          cgst: (item.total * item.taxRate.cgst) / 100,
          sgst: (item.total * item.taxRate.sgst) / 100
        });

      // Update stock
      const { data } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", item.id)
        .single();

      if (data) {
        const newQty = data.quantity - item.quantity;
        await supabase
          .from("products")
          .update({ quantity: newQty })
          .eq("id", item.id);
      }
    }
    
    setInvoiceItems([...billItems]);
    setShowInvoicePopup(true);
  };

 // Download professional invoice PDF
  const downloadInvoice = () => {
    const doc = new jsPDF();
    let yPos = 20;

    // ===== Business Header =====
    doc.setFontSize(20);
    doc.setTextColor(46, 125, 50);
    doc.text(businessDetails.name || "My Store", 105, yPos, { align: "center" });

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Address: ${businessDetails.address}`, 105, yPos, { align: "center" });

    yPos += 6;
    doc.text(`Phone: ${businessDetails.phone}`, 105, yPos, { align: "center" });

    yPos += 6;
    doc.text(`GST: ${businessDetails.gst}`, 105, yPos, { align: "center" });

    yPos += 12;

    // ===== Invoice Info =====
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: ${invoiceNumber}`, 14, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, yPos);

    yPos += 10;

    // ===== Customer Details =====
    doc.text(`Customer Name: ${customerDetails.name}`, 14, yPos);
    yPos += 6;

    doc.text(`Phone: ${customerDetails.phone}`, 14, yPos);
    yPos += 6;

    doc.text(`Address: ${customerDetails.address || "-"}`, 14, yPos);

    yPos += 10;

    // ===== Product Table =====
    autoTable(doc, {
      startY: yPos,
      head: [["Item", "Category", "Qty", "Price", "Total"]],
      body: billItems.map(item => [
        item.name,
        item.category,
        item.quantity,
        `${item.price}`,
        `${item.total}`
      ])
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // ===== Totals =====
    doc.setFontSize(11);

    doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 140, yPos);
    yPos += 6;

    doc.text(`Discount: ${discountAmount.toFixed(2)}`, 140, yPos);
    yPos += 6;

    doc.text(`CGST: ${totalCgst.toFixed(2)}`, 140, yPos);
    yPos += 6;

    doc.text(`SGST: ${totalSgst.toFixed(2)}`, 140, yPos);
    yPos += 8;

    doc.setFontSize(13);
    doc.setTextColor(46, 125, 50);
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 140, yPos);

    yPos += 15;

    // ===== Payment Details =====
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text(`Payment Method: ${paymentMethod}`, 14, yPos);
    yPos += 6;

    doc.text(`Transaction ID: ${paymentMethod === "Cash" ? "N/A" : transactionId}`, 14, yPos);

    yPos += 20;

    // ===== Signature =====
    // doc.text("Authorized Signature", 150, yPos);

    // yPos += 8;
    // doc.text(businessDetails.name || "Store", 150, yPos);

    // ===== Footer =====
    yPos += 20;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your purchase!", 105, yPos, { align: "center" });

    doc.save(`Invoice-${invoiceNumber}.pdf`);
  };

  const clearBill = () => {
    setBillItems([]);
    setCustomerDetails({ name: "", address: "", phone: "" });
    setPaymentMethod("Cash");
    setTransactionId("");
    setDiscount(0);
    setDiscountType("percentage");
    resetInvoiceNumber();
  };

  return (
    <div className="max-w-6xl mx-auto animate-slide-up p-4">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Customer Billing
        </h2>
        <p className="text-white/80 text-lg">
          Generate professional invoices with GST
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Business Details Display */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">Business Details</h3>
            <div className="text-white/80 text-sm space-y-1">
              <p><span className="font-semibold">Shop:</span> {businessDetails.name}</p>
              <p><span className="font-semibold">GST:</span> {businessDetails.gst}</p>
              <p><span className="font-semibold">Address:</span> {businessDetails.address}</p>
              <p><span className="font-semibold">Email:</span> {businessDetails.email}</p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Customer Details</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Customer Name *"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Customer Address"
                value={customerDetails.address}
                onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="tel"
                placeholder="Customer Phone *"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Payment Details</h3>
            <div className="space-y-4">
              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  if (e.target.value === "Cash") {
                    setTransactionId("");
                  }
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option className="text-black">Cash</option>
                <option className="text-black">Credit Card</option>
                <option className="text-black">Debit Card</option>
                <option className="text-black">UPI</option>
                <option className="text-black">Bank Transfer</option>
              </select>
              
              {paymentMethod !== "Cash" && (
                <input
                  type="text"
                  placeholder="Transaction/Reference ID *"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>
          </div>

          {/* Add Product Section */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Add Products</h3>
            <div className="space-y-4">
              <select
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option className="text-black">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="text-black">
                    {p.name} - {p.price} ({p.category || "Uncategorized"})
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addItem}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Bill Items */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Bill Items</h3>
            <button
              onClick={clearBill}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-400/50"
            >
              Clear Bill
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {billItems.map((item, i) => (
              <div key={i} className="flex justify-between items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white">
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-white/60">{item.quantity} × {item.price}</p>
                  <p className="text-xs text-green-300">GST: {item.taxRate.total}%</p>
                </div>
                <p className="font-bold text-lg">{item.total}</p>
              </div>
            ))}
            {billItems.length === 0 && (
              <p className="text-white/60 text-center py-8">No items added yet</p>
            )}
          </div>

          {/* Discount Section */}
          <div className="border-t border-white/20 pt-4 mb-4">
            <div className="flex gap-4">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/30 text-white"
              >
                <option className="text-black">Percentage (%)</option>
                <option className="text-black">Fixed ()</option>
              </select>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="Discount"
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/30 text-white"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 border-t border-white/20 pt-4">
            <div className="flex justify-between text-white">
              <span>Subtotal:</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-300">
                <span>Discount:</span>
                <span>-{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white">
              <span>Taxable Amount:</span>
              <span>{taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-sm">
              <span>CGST:</span>
              <span>{totalCgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-sm">
              <span>SGST:</span>
              <span>{totalSgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-green-300 pt-2 border-t border-white/20">
              <span>Grand Total:</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={generateBill}
            className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-xl hover:scale-105 transition-all duration-300 shadow-xl text-lg"
          >
            Generate Bill & Download Invoice
          </button>
        </div>
      </div>

      {/* Invoice Popup */}
      {showInvoicePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-[400px] text-center">
            <h2 className="text-2xl font-bold text-green-300 mb-3">
              Invoice Generated Successfully!
            </h2>
            <p className="text-white/70 mb-2">
              Invoice Number: <span className="font-bold text-white">{invoiceNumber}</span>
            </p>
            <p className="text-white/70 mb-6">
              Amount: {grandTotal.toFixed(2)}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  downloadInvoice();
                  setShowInvoicePopup(false);
                  clearBill();
                }}
                className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-400/50"
              >
                Download Invoice
              </button>
              <button
                onClick={() => {
                  setShowInvoicePopup(false);
                  clearBill();
                }}
                className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/50"
              >
                New Bill
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}