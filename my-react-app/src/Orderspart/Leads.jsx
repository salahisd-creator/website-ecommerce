/* =========================================================
   Leads.jsx  ←  src/Orderspart/Leads.jsx
   «السلات المتروكة»: زبائن كتبوا رقم هاتفهم وبدأوا الطلب ولم يكملوه.
   جدول بالحالة والوقت ومؤشر «مشكوك فيه» + أزرار اتصال وواتساب.
   ========================================================= */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, AuthError } from "./api";
import { useAdmin } from "./context";
import Layout from "./Layout";

const STATE = {
  abandoned: { label: "متروكة", bg: "#FFE1DE", color: "#9B2C22" },
  contacted: { label: "تم الاتصال", bg: "#FFF1CC", color: "#7A5200" },
  ordered: { label: "تحولت لطلب ✓", bg: "#D9F5E7", color: "#17663F" },
  ignored: { label: "متجاهَلة", bg: "#ECE9E0", color: "#4A4F60" },
};
const FILTERS = [["all", "الكل"], ["abandoned", "متروكة"], ["contacted", "تم الاتصال"], ["ordered", "تحولت لطلب"], ["sus", "مشكوك فيها"], ["ignored", "متجاهَلة"]];

const CSS = `
.ld{max-width:1150px;margin:0 auto;padding:4px 0 60px;direction:rtl;color:var(--ink)}
.ld-tabs{display:flex;gap:8px;margin:0 0 14px;flex-wrap:wrap}
.ld-tabs a{padding:9px 16px;border-radius:999px;border:1px solid var(--line);text-decoration:none;color:inherit;font-weight:bold;font-size:14px}
.ld-tabs a.on{background:var(--gold);color:#111;border-color:var(--gold)}
.ld-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:14px}
.ld-card{padding:14px;border-radius:16px;border:1px solid var(--line);background:var(--card)}
.ld-card b{display:block;font-size:26px}.ld-card span{font-size:13px;opacity:.75}
.ld-top{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px}
.ld-top input{flex:1;min-width:170px;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--soft);color:var(--ink);font:inherit}
.ld-chip{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:14px;cursor:pointer}
.ld-chip.on{background:var(--gold);color:#111;border-color:var(--gold);font-weight:bold}
.ld-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.ld-t{width:100%;border-collapse:collapse;min-width:860px}
.ld-t th{background:var(--soft);padding:11px 12px;font-size:13px;text-align:right;white-space:nowrap}
.ld-t td{padding:11px 12px;border-top:1px solid var(--line);font-size:14px;vertical-align:top}
.ld-pill{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold;white-space:nowrap}
.ld-sus{display:inline-block;margin:2px 0 0 4px;padding:3px 9px;border-radius:8px;background:#FFE1DE;color:#9B2C22;font-size:12px}
.ld-ok{display:inline-block;padding:3px 9px;border-radius:8px;background:#D9F5E7;color:#17663F;font-size:12px}
.ld-act{display:flex;gap:6px;flex-wrap:wrap}
.ld-btn{padding:6px 11px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:13px;cursor:pointer;text-decoration:none;white-space:nowrap}
.ld-btn.g{background:#25D366;color:#fff;border-color:#25D366}
.ld-btn.r{color:#c0392b}
.ld-note{padding:20px;text-align:center;opacity:.8}
.ld-t input.nt{width:150px;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--soft);color:var(--ink);font:inherit;font-size:13px}
`;

const ago = (min) => (min < 1 ? "الآن" : min < 60 ? `منذ ${min} د` : min < 1440 ? `منذ ${Math.floor(min / 60)} س` : `منذ ${Math.floor(min / 1440)} يوم`);
const wa = (l) => {
  const p = "213" + String(l.phone).replace(/^0/, "");
  const names = (l.items || []).map((i) => i.name).join("، ");
  const msg = `السلام عليكم ${l.name || ""}، معكم متجر ISD. لاحظنا أنك بدأت طلب (${names}) ولم تكمله. هل تحتاج مساعدة لإتمام الطلب؟`;
  return `https://wa.me/${p}?text=${encodeURIComponent(msg)}`;
};

export default function Leads() {
  const { lock } = useAdmin();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    try {
      const d = await api("/admin/leads");
      if (mounted.current) { setList(Array.isArray(d.leads) ? d.leads : []); setMsg(""); }
    } catch (e) {
      if (e instanceof AuthError) { lock(); return; }
      if (mounted.current) setMsg("تعذّر تحميل السلات. تأكد أن server.js يعمل (أعد تشغيله بعد التحديث).");
    }
    if (mounted.current) setLoading(false);
  }, [lock]);
  useEffect(() => {
    mounted.current = true; load();
    const t = setInterval(() => { if (!document.hidden) load(); }, 30000);
    return () => { mounted.current = false; clearInterval(t); };
  }, [load]);

  const patch = async (id, body) => { try { await api(`/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }); load(); } catch (e) { if (e instanceof AuthError) lock(); else setMsg("تعذّر الحفظ."); } };
  const del = async (id) => { if (!window.confirm("حذف هذا السجل نهائياً؟")) return; try { await api(`/admin/leads/${id}`, { method: "DELETE" }); load(); } catch (e) { if (e instanceof AuthError) lock(); else setMsg("تعذّر الحذف."); } };

  const count = (f) => list.filter((l) => (f === "all" ? true : f === "sus" ? l.suspicious.length > 0 : l.state === f)).length;
  const rows = useMemo(() => list.filter((l) => {
    if (filter === "sus" ? !l.suspicious.length : filter !== "all" && l.state !== filter) return false;
    const s = q.trim().toLowerCase();
    return !s || l.phone.includes(s) || (l.name || "").toLowerCase().includes(s) || (l.items || []).some((i) => i.name.toLowerCase().includes(s));
  }), [list, filter, q]);
  const lostValue = list.filter((l) => l.state === "abandoned").length;

  return (
    <Layout hideSearch>
      <style>{CSS}</style>
      <div className="ld">
        <div className="crumb" style={{ marginBottom: 6 }}>لوحة التحكم / السلات المتروكة</div>
        <h2 style={{ margin: "0 0 4px" }}>السلات المتروكة {lostValue ? `(${lostValue})` : ""}</h2>
        <p style={{ margin: "0 0 14px", opacity: .75, fontSize: 14 }}>زبائن كتبوا رقم هاتفهم في نموذج الطلب ولم يكملوا. تواصل معهم لإنقاذ الطلب.</p>

        <div className="ld-cards">
          <div className="ld-card"><b>{count("abandoned")}</b><span>متروكة تحتاج متابعة</span></div>
          <div className="ld-card"><b>{count("contacted")}</b><span>تم الاتصال بهم</span></div>
          <div className="ld-card"><b>{count("ordered")}</b><span>تحولوا إلى طلبات ✓</span></div>
          <div className="ld-card"><b>{count("sus")}</b><span>مشكوك فيها ⚠️</span></div>
        </div>

        <div className="ld-top">
          <input placeholder="ابحث بالاسم أو الهاتف أو المنتج..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="ld-btn" onClick={load} aria-label="تحديث">↻ تحديث</button>
        </div>
        <div className="ld-top">
          {FILTERS.map(([k, l]) => <button key={k} type="button" className={`ld-chip${filter === k ? " on" : ""}`} onClick={() => setFilter(k)}>{l} ({count(k)})</button>)}
        </div>
        {msg ? <div className="ld-note" role="alert" style={{ color: "#c0392b" }}>{msg}</div> : null}

        <div className="ld-wrap">
          {loading ? <div className="ld-note">جارٍ التحميل...</div> : rows.length === 0 ? <div className="ld-note">لا توجد سجلات {filter === "all" ? "بعد. تظهر هنا السلات عندما يكتب الزبون رقم هاتفه في نموذج الطلب." : "في هذا التصنيف."}</div> : (
            <table className="ld-t">
              <thead><tr><th>الزبون</th><th>المنتجات</th><th>الولاية</th><th>الحالة</th><th>الوقت</th><th>تقييم الثقة</th><th>ملاحظة</th><th>إجراءات</th></tr></thead>
              <tbody>
                {rows.map((l) => {
                  const st = STATE[l.state] || STATE.abandoned;
                  return (
                    <tr key={l.id}>
                      <td><b>{l.name || "—"}</b><br /><span dir="ltr" style={{ opacity: .8 }}>{l.phone}</span></td>
                      <td>{(l.items || []).map((i, k) => <div key={k}>{i.name}{i.color ? ` (${i.color})` : ""} × {i.qty}</div>)}</td>
                      <td>{l.wilaya || "—"}</td>
                      <td><span className="ld-pill" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                      <td title={new Date(l.updatedAt).toLocaleString("ar-DZ")}>{ago(l.ageMin)}<br /><span style={{ opacity: .6, fontSize: 12 }}>{new Date(l.updatedAt).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span></td>
                      <td>
                        {l.suspicious.length ? l.suspicious.map((w) => <span className="ld-sus" key={w}>⚠️ {w}</span>) : l.trusted ? <span className="ld-ok">عميل سابق موثوق ✓</span> : <span style={{ opacity: .6 }}>عادي</span>}
                      </td>
                      <td><input className="nt" defaultValue={l.note || ""} maxLength={300} placeholder="ملاحظة..." onBlur={(e) => { if (e.target.value !== (l.note || "")) patch(l.id, { note: e.target.value }); }} /></td>
                      <td>
                        <div className="ld-act">
                          <a className="ld-btn" href={`tel:${l.phone}`}>📞 اتصال</a>
                          <a className="ld-btn g" href={wa(l)} target="_blank" rel="noopener noreferrer" onClick={() => l.state === "abandoned" && patch(l.id, { status: "contacted" })}>واتساب</a>
                          {l.state !== "contacted" && l.state !== "ordered" ? <button type="button" className="ld-btn" onClick={() => patch(l.id, { status: "contacted" })}>تم الاتصال</button> : null}
                          {l.state !== "ignored" && l.state !== "ordered" ? <button type="button" className="ld-btn" onClick={() => patch(l.id, { status: "ignored" })}>تجاهل</button> : null}
                          <button type="button" className="ld-btn r" onClick={() => del(l.id)}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
