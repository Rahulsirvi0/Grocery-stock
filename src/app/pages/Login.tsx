import { useState } from "react";
import { LogIn } from "lucide-react";

export function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e:any) => {
    e.preventDefault();

    const user = {
      name: "Admin User",
      email: email
    };

    localStorage.setItem("loggedUser", JSON.stringify(user));

    window.location.href = "/profile";
  };

  return (
    <div className="flex items-center justify-center min-h-screen animate-slide-up">

      <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">

        {/* Title */}
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 text-white mx-auto mb-3" />
          <h2 className="text-4xl font-bold text-white mb-2">Login</h2>
          <p className="text-white/70">Access your inventory dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-xl border border-blue-400/50 hover:border-blue-400 transition-all duration-300 font-semibold"
          >
            <LogIn className="w-5 h-5"/>
            Login
          </button>

        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform: translateY(30px); }
          to { opacity:1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>

    </div>
  );
}