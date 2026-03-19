import { User, LogOut } from "lucide-react";

export function Profile(){

  const user = JSON.parse(localStorage.getItem("loggedUser") || "{}");

  const logout = () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "/login";
  };

  return (

    <div className="flex items-center justify-center min-h-screen animate-slide-up">

      <div className="w-full max-w-md backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <User className="w-14 h-14 text-white mx-auto mb-3"/>
          <h2 className="text-4xl font-bold text-white">User Profile</h2>
        </div>

        <div className="space-y-4 text-white">

          <div className="bg-white/5 border border-white/20 rounded-xl p-4">
            <p className="text-white/60 text-sm">Name</p>
            <p className="font-bold text-lg">{user.name}</p>
          </div>

          <div className="bg-white/5 border border-white/20 rounded-xl p-4">
            <p className="text-white/60 text-sm">Email</p>
            <p className="font-bold text-lg">{user.email}</p>
          </div>

        </div>

        <button
          onClick={logout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-400/50 hover:border-red-400 transition-all duration-300 font-semibold"
        >
          <LogOut className="w-5 h-5"/>
          Logout
        </button>

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