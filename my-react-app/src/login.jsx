import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "./supabaseClient";

/* ───────────── غيّر التصميم من هنا فقط ─────────────
   "glass" = زجاجي أزرق  |  "light" = فاتح بسيط  |  "gold" = داكن وذهبي */
const THEME = "gold";

const themes = {
  glass: {
    pageBg: "var(--c-bk)",
    art: `radial-gradient(60% 40% at 20% 30%, rgba(30,120,255,0.45), transparent 70%),
      radial-gradient(50% 35% at 85% 75%, rgba(0,190,255,0.35), transparent 70%),
      conic-gradient(from 210deg at 50% 50%, var(--c-bk), #0b1a2e, var(--c-bk), #10263f, var(--c-bk))`,
    streaks: "block",
    wrap: "linear-gradient(145deg, rgba(255,255,255,0.65), rgba(120,190,255,0.12) 40%, rgba(255,255,255,0.35))",
    shadow: "drop-shadow(0 30px 60px rgba(0,80,200,0.35))",
    card: "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.72)",
    icon: "rgba(255,255,255,0.65)",
    inputBg: "rgba(5,12,24,0.45)",
    inputBgFocus: "rgba(5,12,24,0.65)",
    inputBorder: "rgba(255,255,255,0.18)",
    placeholder: "rgba(255,255,255,0.5)",
    accent: "#4cc3ff",
    accentRing: "rgba(76,195,255,0.28)",
    btnBg: "linear-gradient(135deg, #1f6bff, #20b4ff)",
    btnText: "#ffffff",
    btnShadow: "0 10px 30px rgba(31,107,255,0.45), inset 0 1px 0 rgba(255,255,255,0.35)",
    link: "#6fd0ff",
    errText: "#ffb4b4", errBg: "rgba(255,70,70,0.12)", errBorder: "rgba(255,90,90,0.35)",
    okText: "#b8f5d0", okBg: "rgba(40,200,120,0.12)", okBorder: "rgba(60,220,140,0.35)",
    blur: "blur(22px) saturate(140%)",
  },
  light: {
    pageBg: "var(--c-cream)",
    art: "none",
    streaks: "none",
    wrap: "var(--c-cream2)",
    shadow: "drop-shadow(0 14px 30px rgba(20,19,19,0.10))",
    card: "#ffffff",
    text: "var(--c-k)",
    muted: "var(--c-ink4)",
    icon: "var(--c-ink4)",
    inputBg: "var(--c-cream)",
    inputBgFocus: "#ffffff",
    inputBorder: "var(--c-ink3)",
    placeholder: "var(--c-ink4)",
    accent: "var(--c-k)",
    accentRing: "rgba(26,26,26,0.14)",
    btnBg: "var(--c-k)",
    btnText: "#ffffff",
    btnShadow: "0 6px 16px rgba(26,26,26,0.22)",
    link: "var(--c-g0)",
    errText: "#9B1C1C", errBg: "#FDECEC", errBorder: "#F2B8B8",
    okText: "#14633A", okBg: "#E8F6EE", okBorder: "#A9DDBF",
    blur: "none",
  },
  gold: {
    pageBg: "linear-gradient(180deg, var(--st-top, var(--c-tan)), var(--st-deep, var(--c-tan)))",
    art: "none",
    streaks: "none",
    wrap: "linear-gradient(145deg, rgba(212,175,55,0.75), rgba(212,175,55,0.12) 45%, rgba(212,175,55,0.45))",
    shadow: "drop-shadow(0 18px 40px rgba(0,0,0,0.25))",
    card: "#16161A",
    text: "var(--c-cream)",
    muted: "#B8B2A4",
    icon: "#8A8578",
    inputBg: "#0D0D0F",
    inputBgFocus: "#101013",
    inputBorder: "#3A3A42",
    placeholder: "#8A8578",
    accent: "var(--c-g1)",
    accentRing: "rgba(212,175,55,0.25)",
    btnBg: "var(--c-g1)",
    btnText: "#14110A",
    btnShadow: "0 8px 22px rgba(212,175,55,0.28)",
    link: "var(--c-g1)",
    errText: "#FFB4B4", errBg: "rgba(255,70,70,0.12)", errBorder: "rgba(255,90,90,0.4)",
    okText: "#B8F5D0", okBg: "rgba(40,200,120,0.12)", okBorder: "rgba(60,220,140,0.35)",
    blur: "none",
  },
};

function themeVars(t) {
  return `
  .lg-page {
    --page-bg:${t.pageBg}; --art:${t.art}; --streaks:${t.streaks};
    --wrap:${t.wrap}; --shadow:${t.shadow}; --card:${t.card}; --blur:${t.blur};
    --text:${t.text}; --muted:${t.muted}; --icon:${t.icon};
    --input-bg:${t.inputBg}; --input-bg-focus:${t.inputBgFocus};
    --input-border:${t.inputBorder}; --placeholder:${t.placeholder};
    --accent:${t.accent}; --ring:${t.accentRing};
    --btn-bg:${t.btnBg}; --btn-text:${t.btnText}; --btn-shadow:${t.btnShadow};
    --link:${t.link};
    --err-text:${t.errText}; --err-bg:${t.errBg}; --err-border:${t.errBorder};
    --ok-text:${t.okText}; --ok-bg:${t.okBg}; --ok-border:${t.okBorder};
  }`;
}

const styles = `
  @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap");

  .lg-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
    background: var(--page-bg);
    font-family: "Cairo", "Segoe UI", Tahoma, "Noto Sans Arabic", sans-serif;
    direction: rtl;
  }
  .lg-bg {
    position: absolute;
    inset: -20%;
    background: var(--art);
    filter: blur(30px);
    animation: lg-drift 18s ease-in-out infinite alternate;
  }
  .lg-streak {
    display: var(--streaks);
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
    --cut: 46px;
    position: relative;
    width: 100%;
    max-width: 420px;
    padding: 1px;
    background: var(--wrap);
    clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
    filter: var(--shadow);
  }
  .lg-card {
    --cut: 46px;
    position: relative;
    padding: 40px 32px 32px;
    background: var(--card);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  }

  .lg-title { margin: 0 0 6px; font-size: 30px; font-weight: 700; color: var(--text); }
  .lg-sub { margin: 0 0 28px; font-size: 15px; color: var(--muted); }

  .lg-field { position: relative; margin-bottom: 14px; }
  .lg-field > svg.lg-icon {
    position: absolute; top: 50%; right: 14px;
    transform: translateY(-50%);
    color: var(--icon); pointer-events: none;
  }
  .lg-input {
    width: 100%; box-sizing: border-box; height: 52px;
    padding: 0 44px; border-radius: 14px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    color: var(--text); font-size: 15px; font-family: inherit; outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .lg-input::placeholder { color: var(--placeholder); }
  .lg-input:focus {
    border-color: var(--accent);
    background: var(--input-bg-focus);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .lg-eye {
    position: absolute; top: 50%; left: 8px;
    transform: translateY(-50%);
    background: none; border: none; padding: 10px;
    cursor: pointer; color: var(--icon); display: flex; border-radius: 10px;
  }
  .lg-eye:hover { color: var(--text); }
  .lg-eye:focus-visible, .lg-btn:focus-visible, .lg-switch button:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px;
  }

  .lg-error {
    margin: 4px 0 14px; padding: 10px 12px; border-radius: 10px;
    font-size: 13px; color: var(--err-text);
    background: var(--err-bg); border: 1px solid var(--err-border);
  }
  .lg-info {
    margin: 4px 0 14px; padding: 10px 12px; border-radius: 10px;
    font-size: 13px; color: var(--ok-text);
    background: var(--ok-bg); border: 1px solid var(--ok-border);
  }

  .lg-btn {
    width: 100%; height: 54px; margin-top: 8px;
    border: none; border-radius: 14px; cursor: pointer;
    font-size: 17px; font-weight: 700; font-family: inherit;
    color: var(--btn-text); background: var(--btn-bg); box-shadow: var(--btn-shadow);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .lg-spin { animation: lg-rot 0.9s linear infinite; }
  @keyframes lg-rot { to { transform: rotate(360deg); } }

  .lg-switch {
    margin-top: 22px; text-align: center;
    font-size: 14px; color: var(--muted);
  }
  .lg-switch button {
    background: none; border: none; padding: 4px;
    margin-inline-start: 4px; cursor: pointer; font-family: inherit;
    font-size: 14px; font-weight: 700; color: var(--link);
  }
  .lg-switch button:hover { text-decoration: underline; }

  @media (max-width: 420px) {
    .lg-card { padding: 36px 22px 26px; }
    .lg-card-wrap, .lg-card { --cut: 34px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .lg-bg, .lg-spin { animation: none; }
  }
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
  const theme = themes[THEME] || themes.glass;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError("الإيميل أو كلمة السر غير صحيحة");
      else navigate("/choose");
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
      <style>{styles + themeVars(theme)}</style>

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
              <Mail className="lg-icon" size={18} aria-hidden="true" />
              <input
                className="lg-input"
                type="email"
                placeholder="الإيميل"
                aria-label="الإيميل"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>

            <div className="lg-field">
              <Lock className="lg-icon" size={18} aria-hidden="true" />
              <input
                className="lg-input"
                type={showPassword ? "text" : "password"}
                placeholder="كلمة السر"
                aria-label="كلمة السر"
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
                  className="lg-info"
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