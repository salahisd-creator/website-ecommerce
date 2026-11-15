import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, LucideLogIn } from "lucide-react";
import { supabase } from "./supabaseClient";

const styles = `
  .lg-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
    background: #05070b;
    font-family: "Segoe UI", Tahoma, "Noto Sans Arabic", sans-serif;
    direction: rtl;
  }
  .lg-bg {
    position: absolute;
    inset: -20%;
    background:
      radial-gradient(60% 40% at 20% 30%, rgba(30,120,255,0.45), transparent 70%),
      radial-gradient(50% 35% at 85% 75%, rgba(0,190,255,0.35), transparent 70%),
      conic-gradient(from 210deg at 50% 50%, #05070b, #0b1a2e, #05070b, #10263f, #05070b);
    filter: blur(30px);
    animation: lg-drift 18s ease-in-out infinite alternate;
  }
  .lg-streak {
    position: absolute;
    left: -10%;
    width: 120%;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, #4cc3ff, #1f6bff, transparent);
    box-shadow: 0 0 24px 4px rgba(60,160,255,0.55);
    opacity: 0.7;
  }
  .lg-streak.s1 { top: 22%; transform: rotate(-14deg); }
  .lg-streak.s2 { top: 68%; transform: rotate(-9deg); opacity: 0.45; }
  .lg-streak.s3 { top: 84%; transform: rotate(-18deg); opacity: 0.3; }
  @keyframes lg-drift {
    from { transform: translate3d(-2%,-1%,0) scale(1); }
    to   { transform: translate3d(2%,2%,0) scale(1.08); }
  }
  .lg-card-wrap {
    —cut: 46px;
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 1px;
    background: linear-gradient(145deg, rgba(255,255,255,0.65), rgba(120,190,255,0.12) 40%, rgba(255,255,255,0.35));
    clip-path: polygon(var(—cut) 0, 100% 0, 100% calc(100% - var(—cut)), calc(100% - var(—cut)) 100%, 0 100%, 0 var(—cut));
    filter: drop-shadow(0 30px 60px rgba(0,80,200,0.35));
  }
  .lg-card {
    position: relative;
    padding: 40px 32px 32px;
    background: linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04));
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
    clip-path: polygon(var(—cut) 0, 100% 0, 100% calc(100% - var(—cut)), calc(100% - var(—cut)) 100%, 0 100%, 0 var(—cut));
  }
  .lg-title { margin: 0 0 6px; font-size: 28px; font-weight: 700; color: #fff; }
  .lg-sub { margin: 0 0 28px; font-size: 14px; color: rgba(255,255,255,0.6); }
  .lg-field { position: relative; margin-bottom: 14px; }
  .lg-field > svg.lg-icon {
    position: absolute; top: 50%; right: 14px;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.55); pointer-events: none;
  }
  .lg-input {
    width: 100%; box-sizing: border-box; height: 50px;
    padding: 0 44px; border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(5,12,24,0.45);
    color: #fff; font-size: 15px; outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .lg-input::placeholder { color: rgba(255,255,255,0.4); }
  .lg-input:focus {
    border-color: #4cc3ff;
    background: rgba(5,12,24,0.65);
    box-shadow: 0 0 0 3px rgba(76,195,255,0.22);
  }
  .lg-eye {
    position: absolute; top: 50%; left: 12px;
    transform: translateY(-50%);
    background: none; border: none; padding: 6px;
    cursor: pointer; color: rgba(255,255,255,0.55); display: flex;
  }
  .lg-eye:hover { color: #fff; }
  .lg-error {
    margin: 4px 0 14px; padding: 10px 12px; border-radius: 10px;
    font-size: 13px; color: #ffb4b4;
    background: rgba(255,70,70,0.12);
    border: 1px solid rgba(255,90,90,0.35);
  }
  .lg-btn {
    width: 100%; height: 52px; margin-top: 8px;
    border: none; border-radius: 14px; cursor: pointer;
    font-size: 16px; font-weight: 700; color: #fff;
    background: linear-gradient(135deg, #1f6bff, #20b4ff);
    box-shadow: 0 10px 30px rgba(31,107,255,0.45), inset 0 1px 0 rgba(255,255,255,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .lg-spin { animation: lg-rot 0.9s linear infinite; }
  @keyframes lg-rot { to { transform: rotate(360deg); } }
  .lg-switch {
    margin-top: 22px; text-align: center;
    font-size: 14px; color: rgba(255,255,255,0.6);
  }
  .lg-switch button {
    background: none; border: none; padding: 0;
    margin-inline-start: 6px; cursor: pointer;
    font-size: 14px; font-weight: 700; color: #6fd0ff;
  }
  .lg-switch button:hover { text-decoration: underline; }
`;

function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = mode === "login";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError("الإيميل أو كلمة السر غير صحيحة");
      else navigate("/");
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else if (data.session) navigate("/");
      else setInfo("تم إنشاء الحساب. تحقق من بريدك لتأكيد الإيميل.");
    }
  }

  function toggleMode() {
    setMode(isLogin ? "signup" : "login");
    setError("");
    setInfo("");
  }

  return (
    <div className="lg-page">
      <style>{styles}</style>

      <div className="lg-bg" />
      <span className="lg-streak s1" />
      <span className="lg-streak s2" />
      <span className="lg-streak s3" />

      <motion.div
        className="lg-card-wrap"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="lg-card">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="lg-title">
                {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
              </h1>
              <p className="lg-sub">
                {isLogin
                  ? "أدخل بياناتك للمتابعة إلى حسابك"
                  : "أنشئ حسابًا جديدًا في دقيقة"}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <Mail className="lg-icon" size={18} />
              <input
                className="lg-input"
                type="email"
                placeholder="الإيميل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>

            <div className="lg-field">
              <Lock className="lg-icon" size={18} />
              <input
                className="lg-input"
                type={showPassword ? "text" : "password"}
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={6}
                required
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              <button
                type="button"
                className="lg-eye"
                onClick={() => setShowPassword((s) => !s)}
                aria-label="إظهار أو إخفاء كلمة السر"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="lg-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
              {info && (
                <motion.div
                  className="lg-error"
                  style={{
                    color: "#b8f5d0",
                    background: "rgba(40,200,120,0.12)",
                    borderColor: "rgba(60,220,140,0.35)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {info}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              className="lg-btn"
              type="submit"
              disabled={loading}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <Loader2 className="lg-spin" size={20} />
              ) : isLogin ? (
                "دخول"
              ) : (
                "إنشاء الحساب"
              )}
            </motion.button>
          </form>

          <div className="lg-switch">
            {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
            <button type="button" onClick={toggleMode}>
              {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
              