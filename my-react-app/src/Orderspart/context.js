/* =========================================================
   context.js  ←  ضعه في: src/admin/context.js
   يحمل معلومات مشتركة بين كل الصفحات: الوضع الداكن، الخروج، قفل الجلسة.
   ========================================================= */
import { createContext, useContext } from "react";

export const AdminContext = createContext(null);

export function useAdmin() {
  const c = useContext(AdminContext);
  if (!c) throw new Error("useAdmin يجب أن يُستعمل داخل AdminApp");
  return c;
}
