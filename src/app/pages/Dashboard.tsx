import { useEffect, useState } from 'react';
import { Package, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { getStatistics, initializeSampleData } from '../utils/supabase';
import { StatCard } from '../components/StatCard';
import { SalesChart } from "../components/saleschart";

/**
 * DASHBOARD PAGE
 * Displays real-time statistics with animated cards
 */
export function Dashboard() {

  const [stats, setStats] = useState({
    totalProducts: 0,
    availableItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  const loadStats = async () => {
    const statistics = await getStatistics();
    setStats(statistics);
  };

  useEffect(() => {

    initializeSampleData();
    loadStats();

    const handleFocus = () => loadStats();
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(loadStats, 5000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };

  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title */}
      <div className="text-center">
        <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
          Inventory Dashboard
        </h2>
        <p className="text-white/80 text-lg">
          Real-time overview of your grocery stock
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="purple"
          delay={0}
          
        />
        <StatCard
          title="Available Items"
          value={stats.availableItems}
          icon={TrendingUp}
          color="green"
          delay={100}
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="orange"
          delay={200}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockItems}
          icon={XCircle}
          color="red"
          delay={300}
        />
      </div>
     <div className="mt-10">
        <SalesChart />
      </div>

      {/* Quick Insights */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-6">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-3xl font-bold text-white mb-2">
              {stats.totalProducts > 0 
                ? `${Math.round((stats.availableItems / stats.totalProducts) * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-white/70">Stock Availability Rate</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-3xl font-bold text-white mb-2">
              {stats.lowStockItems}
            </div>
            <p className="text-white/70">Items Need Restock</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="text-3xl font-bold text-white mb-2">
              {stats.outOfStockItems}
            </div>
            <p className="text-white/70">Critical Attention Required</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
