import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: Props) => {

  const user = localStorage.getItem("loggedUser");
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">

        <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-[360px] text-center">

          <h2 className="text-2xl font-bold text-white mb-3">
            Please Login First
          </h2>

          <p className="text-white/70 mb-6">
            You must login before accessing this section.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center gap-2 mx-auto px-5 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-400/50 transition-all"
          >
            <LogIn className="w-5 h-5"/>
            Login
          </button>

        </div>

      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;