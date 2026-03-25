import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export default function Billing() {
  const [showInvoicePopup, setShowInvoicePopup] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState<any[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);

  // load products
  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // add item to bill
  const addItem = () => {

    const product = products.find(p => p.id == selectedProduct);
    if (!product) return;

    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      total: product.price * quantity
    };

    setBillItems(prev => [...prev, item]);
  };

  // generate bill + update stock
    const generateBill = async () => {

    // create bill
    const { data: bill } = await supabase
      .from("bills")
      .insert({
        total_amount: totalAmount
      })
      .select()
      .single();

    if (!bill) return;

    // save bill items
    for (const item of billItems) {

      await supabase
        .from("bill_items")
        .insert({
          bill_id: bill.id,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        });

      // update stock
      const { data } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", item.id)
        .single();

      if (!data) continue;

      const newQty = data.quantity - item.quantity;

      await supabase
        .from("products")
        .update({ quantity: newQty })
        .eq("id", item.id);
    }
    setInvoiceItems(billItems);

    setShowInvoicePopup(true);

    setBillItems([]);
  };

  const downloadInvoice = () => {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Priyanka Grocery Store", 14, 20);

      doc.setFontSize(12);
      doc.text("Customer: Walk-in Customer", 14, 30);
      doc.text("Date: " + new Date().toLocaleDateString(), 14, 36);

      const tableData = invoiceItems.map((item) => [
        item.name,
        item.quantity,
        item.price,
        item.total
      ]);

      autoTable(doc, {
        startY: 45,
        head: [["Product", "Qty", "Price", "Total"]],
        body: tableData
      });

      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.total, 0);

      doc.text("Total: Rs. " + totalAmount, 14, (doc as any).lastAutoTable.finalY + 10);

      doc.save("invoice.pdf");

    };

 const totalAmount = billItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Customer Billing
        </h2>
        <p className="text-white/80 text-lg">
          Generate bills and automatically update stock
        </p>
      </div>


      {/* Add Product Section */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl mb-8">

        <div className="grid grid-cols-3 gap-4">

          <select
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg"
          >
            <option className="text-black">Select Product</option>

            {products.map((p) => (
              <option key={p.id} value={p.id} className="text-black">
                {p.name}
              </option>
            ))}

          </select>


          <input
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="px-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg"
          />


          <button
            onClick={addItem}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg"
          >
            Add Item
          </button>

        </div>

      </div>


      {/* Bill Items */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">

        <h3 className="text-2xl font-bold text-white mb-6">
          Bill Items
        </h3>

        <div className="space-y-3">

          {billItems.map((item, i) => (

            <div
              key={i}
              className="flex justify-between items-center bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white"
            >

              <span className="font-semibold">
                {item.name}
              </span>

              <span>
                {item.quantity} × {item.price}
              </span>

              <span className="font-bold text-lg">
                Rs.{item.total}
              </span>

            </div>

          ))}

        </div>


        {/* Total */}
        <div className="flex justify-between items-center mt-8 text-2xl font-bold text-white">

          <span>Total Amount</span>
          <span className="text-green-300">
            Rs.{totalAmount}
          </span>

        </div>


        {/* Generate Bill Button */}
        <button
          onClick={generateBill}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl text-lg"
        >
          Generate Bill
        </button>

      </div>

      {showInvoicePopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">

            <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-[360px] text-center">

              <h2 className="text-2xl font-bold text-green-300 mb-3">
                Invoice Generated
              </h2>

              <p className="text-white/70 mb-6">
                The customer's bill has been created successfully.
              </p>

              <div className="flex gap-3 justify-center">

              <button
                onClick={downloadInvoice}
                className="px-5 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-400/50"
              >
              Download Invoice
              </button>

              <button
                onClick={() => setShowInvoicePopup(false)}
                className="px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/50"
              >
              Close
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

   