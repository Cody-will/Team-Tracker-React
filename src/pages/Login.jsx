import { BsPersonFill, BsLockFill } from "react-icons/bs";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div
        id="panel"
        className="w-full max-w-md bg-zinc-900/30 drop-shadow-xl drop-shadow-zinc-950/30 p-8 rounded-lg shadow-lg border border-zinc-700"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Welcome Back
        </h2>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:drop-shadow-lg focus:drop-shadow-sky-500/50 focus:ring-2 focus:ring-sky-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded-md transition-colors"
          >
            Log In
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-zinc-400">
          Don’t have an account?{" "}
          <a href="#" className="text-sky-500 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
