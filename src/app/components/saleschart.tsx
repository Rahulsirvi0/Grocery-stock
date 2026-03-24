import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export function SalesChart() {

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
  ];

  const loadSales = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("name, quantity");

    if (error) {
      console.log("Error loading sales:", error);
      return;
    }

    const result = data || [];

    const totalItems = result.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    setTotal(totalItems);
    setData(result);
  };

  useEffect(() => {
    loadSales();

    const interval = setInterval(loadSales, 5000); // live update every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-2xl relative">

      <h3 className="text-white text-xl mb-6 font-semibold text-center">
        Stock Distribution
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <PieChart>

          <Pie
            data={data}
            dataKey="quantity"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
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

      {/* Center Counter */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-white text-4xl font-bold">
          {total}
        </div>
        <div className="text-white/70 text-sm">
          Total Items
        </div>
      </div>

    </div>
  );
}