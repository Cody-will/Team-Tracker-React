import { BsPersonFill, BsLockFill } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { auth } from "../firebase.js";
import { useAuth } from "./context/AuthContext";
import { useState, useEffect } from "react";
import Button from "../components/Button";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { signIn } = useAuth();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const message = () => {
    toast(error);
  };

  if (currentUser) {
    navigate("/add-user");
  }

  async function handleLogin(user) {
    try {
      setLoading(true);

      await signIn(user.email, user.password);
      navigate("/home");
    } catch (error) {
      setError(error.code);
      setLoading(false);
      message();
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="flex items-center bg-[url('./assets/background.svg')] bg-no-repeat bg-center bg-cover justify-center h-screen">
        <div
          id="panel"
          className="w-full max-w-md bg-zinc-950/30 font-semibold drop-shadow-xl drop-shadow-zinc-950/30 p-10 rounded-xl shadow-lg/40 border border-zinc-800"
        >
          <h2 className="text-2xl font-bold text-zinc-200 mb-6 text-center">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
            {error && <div className="text-red-500 text-md">{error}</div>}
            <div>
              <label className="block text-lg font-senibold text-zinc-300 mb-1">
                Email
              </label>
              <input
                {...register("email", { required: "Email required" })}
                type="email"
                className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:drop-shadow-lg focus:drop-shadow-sky-500/50 focus:ring-2 focus:ring-sky-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-zinc-200 mb-1">
                Password
              </label>
              <input
                {...register("password", { required: "Password required" })}
                type="password"
                className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="••••••••"
              />
            </div>

            <Button
              text={loading ? "Loading..." : "Sign In"}
              action={() => {}}
              type="submit"
              disabled={loading}
            />
          </form>

          <div className="mt-4 text-center text-sm text-zinc-400">
            Problem logging in?{" "}
            <a href="#" className="text-sky-500 hover:underline">
              Reset password
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
