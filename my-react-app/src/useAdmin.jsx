import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

/* أصحاب الصلاحية (بأحرف صغيرة). نفس القائمة مكتوبة في سياسات Supabase.
   أضف أو احذف بريداً من هنا ومن السياسات معاً. */
const OWNER_EMAILS = ["cheribetsalaheddine@gmail.com", "salah@gmail.com"];

const isOwner = (session) => {
  const u = session && session.user;
  return !!u && OWNER_EMAILS.includes(String(u.email || "").toLowerCase());
};

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAdmin(isOwner(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setIsAdmin(isOwner(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  return isAdmin;
}
