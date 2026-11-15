import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const OWNER_EMAIL = "cheribetsalaheddine@gmail.com"; 

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(data.session?.user?.email === OWNER_EMAIL);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAdmin(session?.user?.email === OWNER_EMAIL);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return isAdmin;
}