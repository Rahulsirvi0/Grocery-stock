import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Store, Mail, MapPin, Hash, Lock } from "lucide-react";
import { supabase } from "../utils/supabase";

export function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    shopName: "",
    email: "",
    address: "",
    gstNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!formData.username || !formData.shopName || !formData.email || 
        !formData.address || !formData.gstNumber || !formData.password) {

      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {

      // 1️⃣ Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      const user = data.user;

      if (!user) throw new Error("User signup failed");

      // 2️⃣ Insert Profile Data into users table
      const { error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            username: formData.username,
            shop_name: formData.shopName,
            address: formData.address,
            gst_number: formData.gstNumber,
            email: formData.email
          }
        ]);

      if (profileError) throw profileError;

      // 3️⃣ Navigate to dashboard
      navigate("/dashboard");

    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">

      <div className="w-full max-w-lg backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <UserPlus className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-white/70">Start managing your shop inventory</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.username}
            onChange={handleChange}
          />

          <input
            type="text"
            name="shopName"
            placeholder="Shop Name"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.shopName}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.email}
            onChange={handleChange}
          />

          <textarea
            name="address"
            placeholder="Shop Address"
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.address}
            onChange={handleChange}
          />

          <input
            type="text"
            name="gstNumber"
            placeholder="GST Number"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.gstNumber}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg mt-6"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="text-center mt-4">
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-300 underline"
              >
                Login here
              </button>
            </p>
          </div>

        </form>

      </div>

    </div>
  );
}