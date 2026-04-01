import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type SalesChartProps = {
  category: string;
};

export function SalesChart({ category }: SalesChartProps) {

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const COLORS = [
    "#6366F1",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#A855F7",
    "#EC4899",
    "#10B981"
  ];

  const loadSales = async () => {

    const { data: products, error } = await supabase
      .from("products")
      .select("name, quantity")
      .eq("category", category);

    if (error) {
      console.log("Error loading chart:", error);
      return;
    }

    const result = products || [];

    const totalItems = result.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    setTotal(totalItems);
    setData(result);
  };

  useEffect(() => {

    loadSales();

    const interval = setInterval(loadSales, 5000);

    return () => clearInterval(interval);

  }, [category]);

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl relative">

      <h3 className="text-white text-xl mb-6 font-semibold text-center">
        {category} 
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>

          <Pie
            data={data}
            dataKey="quantity"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                style={{
                  filter: "drop-shadow(0px 0px 8px rgba(255,255,255,0.5))"
                }}
              />
            ))}
          </Pie>

          <Tooltip />

        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-white text-3xl font-bold">
          {total}
        </div>
        <div className="text-white/70 text-sm">
          Total Items
        </div>
      </div>

    </div>
  );
}