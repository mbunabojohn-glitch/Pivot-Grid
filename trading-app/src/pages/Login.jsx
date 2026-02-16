import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { apiUrl } from "../config/api";
 
async function post(url, body) {
  const res = await fetch(apiUrl(url), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, email, password);
      const idToken = await auth.currentUser.getIdToken();
      const r = await post("/api/auth/exchange", { idToken });
      if (r.ok && r.data?.accessToken) {
        localStorage.setItem("accessToken", r.data.accessToken);
        if (r.data?.refreshToken) localStorage.setItem("refreshToken", r.data.refreshToken);
      }
      navigate("/dashboard");
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        alert("Invalid email or password.");
      } else if (code === "auth/user-not-found") {
        alert("No account with this email. Please sign up first.");
      } else {
        alert(err.message || "Login failed");
      }
    }
    finally { setBusy(false); }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const r = await post("/api/auth/exchange", { idToken });
      if (r.ok && r.data?.accessToken) {
        localStorage.setItem("accessToken", r.data.accessToken);
        if (r.data?.refreshToken) localStorage.setItem("refreshToken", r.data.refreshToken);
      }
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    try {
      if (!email) {
        alert("Enter your email above to reset password.");
        return;
        }
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent.");
    } catch (err) {
      alert(err.message || "Failed to send reset email");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-start sm:items-center justify-center px-4 pt-6 sm:pt-0 overflow-x-hidden">
      <div className="w-full max-w-md bg-gray-900 text-gray-100 rounded-xl shadow-lg p-6 sm:p-7 md:p-8 border border-gray-800">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full text-white rounded-lg px-4 py-2 transition transform sm:hover:scale-[1.02] active:scale-95 ${busy ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {busy ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-3">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:underline bg-transparent border-0 p-0 focus:outline-none"
          >
            Forgot password?
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white rounded-lg px-4 py-2 hover:bg-gray-50 transition relative h-11 sm:h-12 flex items-center justify-center"
          >
            <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#EA4335" d="M9 3.48c1.69 0 3.22.58 4.42 1.72l2.94-2.94C14.89.86 12.2 0 9 0 5.48 0 2.41 1.64.44 4.1l3.5 2.72C4.98 4.04 6.82 3.48 9 3.48z"/>
              <path fill="#34A853" d="M17.64 9.2c0-.64-.06-1.25-.18-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71l2.73 2.12c1.6-1.48 2.86-3.68 2.86-6.47z"/>
              <path fill="#4285F4" d="M3.94 10.82a5.49 5.49 0 010-3.64L.44 4.46a9 9 0 000 9.09l3.5-2.73z"/>
              <path fill="#FBBC05" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.73-2.12c-.76.51-1.73.82-3.23.82-2.18 0-4.02-1.46-4.68-3.43L.44 13.55C2.41 16 5.48 18 9 18z"/>
            </svg>
            <span className="sr-only">Login with Google</span>
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-300">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
