import { User, LogOut, Store, Mail, MapPin, Hash, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../utils/supabase";

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await getCurrentUser();
        
        if (!mounted) return;
        
        if (error) throw error;
        
        if (data) {
          setUser(data);
        } else {
          navigate("/login", { replace: true });
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUserProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("loggedUser");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-red-300 bg-white/10 backdrop-blur-md p-8 rounded-2xl">
          <p>Error loading profile: {error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-xl border border-blue-400/50 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-slide-up p-4">
      <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white">User Profile</h2>
          <p className="text-white/60 text-sm mt-2">Shop Details</p>
        </div>

        <div className="space-y-4 text-white">
          
          {/* Username */}
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <p className="text-white/60 text-sm flex items-center gap-2 mb-1">
              <User className="w-4 h-4" /> Username
            </p>
            <p className="font-bold text-lg">{user?.username || "Not provided"}</p>
          </div>

          {/* Shop Name */}
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <p className="text-white/60 text-sm flex items-center gap-2 mb-1">
              <Store className="w-4 h-4" /> Shop Name
            </p>
            <p className="font-bold text-lg">{user?.shop_name || "Not provided"}</p>
          </div>

          {/* Email */}
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <p className="text-white/60 text-sm flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4" /> Email
            </p>
            <p className="font-bold text-lg">{user?.email || "Not provided"}</p>
          </div>

          {/* Shop Address */}
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <p className="text-white/60 text-sm flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4" /> Shop Address
            </p>
            <p className="font-bold text-lg whitespace-pre-wrap">
              {user?.address || "Not provided"}
            </p>
          </div>

          {/* GST Number */}
          <div className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <p className="text-white/60 text-sm flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4" /> GST Number
            </p>
            <p className="font-bold text-lg">{user?.gst_number || "Not provided"}</p>
          </div>

        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-400/50 hover:border-red-400 transition-all duration-300 font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

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