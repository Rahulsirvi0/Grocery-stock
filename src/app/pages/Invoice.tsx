import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export default function Invoice({ billId }: any) {

  const [items,setItems] = useState<any[]>([]);
  const [bill,setBill] = useState<any>(null);

  useEffect(()=>{

    const loadInvoice = async () => {

      const { data: billData } = await supabase
        .from("bills")
        .select("*")
        .eq("id", billId)
        .single();

      const { data: itemData } = await supabase
        .from("bill_items")
        .select("*")
        .eq("bill_id", billId);

      setBill(billData);
      setItems(itemData || []);
    };

    loadInvoice();

  },[]);

  return (
    <div>

      <h1>Invoice #{bill?.id}</h1>

      {items.map((i)=>(
        <div key={i.id}>
          {i.product_name} - {i.quantity} × {i.price} = {i.total}
        </div>
      ))}

      <h2>Total : Rs. {bill?.total_amount}</h2>

    </div>
  );
}