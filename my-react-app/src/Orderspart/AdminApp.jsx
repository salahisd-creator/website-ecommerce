/* =========================================================
   AdminApp.jsx  ←  ضعه في: src/admin/AdminApp.jsx
   نقطة الدخول الوحيدة للوحة الإدارة. هنا فقط توجد الروابط بين الصفحات،
   وهنا تُدار الجلسة (شاشة الدخول) والوضع الداكن.

   هذا الملف يغلّف كل صفحات الإدارة (الدخول + الوضع الداكن).
   الصفحات والروابط نفسها تُكتب في App.js (انظر الشرح).
   ========================================================= */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { api, AuthError } from "./api";
import { AdminContext } from "./context";
import Login from "./Login";

export default function AdminApp() {
  const [locked, setLocked] = useState(false);
  const [me, setMe] = useState(null);
  const [meErr, setMeErr] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("adm-theme") === "dark" ? "dark" : "light"; } catch { return "light"; }
  });

  const lock = useCallback(() => setLocked(true), []);
  const toggleTheme = useCallback(() => setTheme((t) => {
    const n = t === "dark" ? "light" : "dark";
    try { localStorage.setItem("adm-theme", n); } catch { /* تجاهل */ }
    return n;
  }), []);
  const logout = useCallback(async () => {
    try { await api("/admin/logout", { method: "POST" }); } catch { /* نكمل إلى شاشة الدخول */ }
    setLocked(true);
  }, []);

  /* من أنا؟ (الاسم والدور) — يُحمَّل بعد كل دخول، والخادم هو من يفرض الصلاحيات فعلياً */
  const loadMe = useCallback(() => {
    setMeErr(false);
    api("/admin/me").then(setMe).catch((e) => { if (e instanceof AuthError) setLocked(true); else setMeErr(true); });
  }, []);
  useEffect(() => { if (!locked) loadMe(); }, [locked, loadMe]);
  const can = useCallback((perm) => !!me && me.perms.includes(perm), [me]);

  const value = useMemo(() => ({ lock, logout, theme, toggleTheme, me, setMe, can }), [lock, logout, theme, toggleTheme, me, can]);

  /* انتهت الجلسة (401) أو ضغطت «خروج» ← شاشة الدخول، وبعدها تعود الصفحة وتحمّل بياناتها من جديد */
  if (locked) return <Login onOk={() => { setMe(null); setLocked(false); }} />;
  if (!me) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Cairo, Tahoma, sans-serif" }}>
        {meErr ? <div style={{ textAlign: "center" }}><p>تعذّر الوصول إلى الخادم. تأكد أن server.js يعمل.</p><button onClick={loadMe}>إعادة المحاولة</button></div> : <p>جارٍ التحميل...</p>}
      </div>
    );
  }

  return (
    <AdminContext.Provider value={value}>
      <Outlet />
    </AdminContext.Provider>
  );
}
