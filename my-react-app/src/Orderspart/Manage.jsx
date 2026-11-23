/* =========================================================
   Manage.jsx  ←  ضعه في: src/admin/Manage.jsx
   صفحة «إدارة الطلبيات»  —  المسار: /admin/orders/manage
   (اتصال بالعميل، تأكيد، دمج المكررة، إرسال لشركة التوصيل)
   ========================================================= */
import Layout from "./Layout";
import { CALLS, MANAGE_FILTERS, STATUS, STATUS_ITEMS, TIER } from "./config";
import { fmtPhone, payOf, shortId } from "./helpers";
import useOrders, { OrderOverlays, PageHead, TableState, TableTop } from "./Orders";
import { Dots, Dropdown, Icon, Pager, Pill } from "./ui";

export default function Manage() {
  const s = useOrders(true);
  const { filter, setFilter, rows, sorted, cur, pages, setPage, sheet, active, openOrder, countOf, riskCount, viewOf, statsOf,
    selected, toggle, allOnPage, togglePage, openKey, setOpenKey, setCall, setStatus, merge, openSend, setSelected } = s;

  const cards = [
    { key: "new", label: "بانتظار التأكيد", n: countOf("new"), icon: "clock", cls: "a", hint: "تحتاج اتصالاً" },
    { key: "confirmed", label: "جاهزة للإرسال", n: countOf("confirmed"), icon: "truck", cls: "b", hint: "أرسلها لشركة التوصيل" },
    { key: "duplicate", label: "مكررة", n: countOf("duplicate"), icon: "list", cls: "p", hint: "ادمجها أو أرسلها" },
    { key: "risk", label: "عملاء خطر", n: riskCount, icon: "alert", cls: "r", hint: "راجعها قبل الإرسال" },
  ];

  const row = (o, i) => {
    const v = viewOf(o);
    const st = statsOf(o);
    const checked = selected.includes(o.id);
    const up = rows.length > 3 && i >= rows.length - 2;
    const editable = ["new", "confirmed", "cancelled"].includes(o.status) && v !== "duplicate";
    let action = null;
    if (o.tracking) action = <span className="trk"><Icon name="truck" size={14} />{o.tracking}</span>;
    else if (v === "duplicate") action = <button className="ln" onClick={() => merge(o)}>دمج وإلغاء</button>;
    else if (o.status === "confirmed") action = <button className="pri sm" onClick={() => openSend([o.id])}>إرسال للتوصيل</button>;
    else if (o.status === "new") action = <button className="pri sm gold" onClick={() => openSend([o.id])}>تأكيد وإرسال</button>;

    return (
      <div key={o.id} className={`row mg${checked || (sheet && active === o.id) ? " sel" : ""}`} onClick={() => openOrder(o.id)}>
        <button className="ck" aria-pressed={checked} aria-label={`تحديد الطلبية ${shortId(o.id)}`}
          style={{ background: checked ? "#F0B429" : "var(--card)" }}
          onClick={(e) => { e.stopPropagation(); toggle(o.id); }}>
          {checked && <Icon name="check" size={14} />}
        </button>
        <div className="c-cu">
          <button className="lk" onClick={(e) => { e.stopPropagation(); openOrder(o.id); }}>{o.name || "—"}</button>
          <span className="only-n"><Pill s={TIER[st.tier]} /></span>
          <div className="muted sub">#{shortId(o.id)} · <span dir="ltr">{fmtPhone(o.phone)}</span> · {o.wilaya} · {payOf(o).short}</div>
        </div>
        <div className="c-am"><b>{o.total.toLocaleString("en-US")}</b> <span className="muted">دج</span></div>
        <div className="c-ti"><Pill s={TIER[st.tier]} /></div>
        <div className="c-cl">
          {editable ? (
            <Dropdown k={"call-" + o.id} openKey={openKey} setOpenKey={setOpenKey} up={up} items={CALLS} current={o.callResult}
              onPick={(k) => setCall(o, k)} label={`نتيجة الاتصال للطلبية ${shortId(o.id)}`}
              trigger={<span className="tr"><Dots n={o.attempts} /><span>{o.callResult ? CALLS.find((c) => c.key === o.callResult).label : "سجّل النتيجة"}</span>{o.attempts > 3 && <span className="muted">×{o.attempts}</span>}</span>} />
          ) : (
            <span className="muted tr"><Dots n={o.attempts} />{o.attempts} محاولة</span>
          )}
        </div>
        <div className="c-st">
          {editable ? (
            <Dropdown k={"st-" + o.id} openKey={openKey} setOpenKey={setOpenKey} up={up} items={STATUS_ITEMS} current={o.status}
              onPick={(k) => setStatus(o, k)} label={`حالة الطلبية ${shortId(o.id)}`} triggerClass="trg st"
              triggerStyle={{ background: STATUS[v].bg, color: STATUS[v].color }} trigger={<span>{STATUS[v].label}</span>} />
          ) : <Pill s={STATUS[v]} />}
        </div>
        <div className="c-ac" onClick={(e) => e.stopPropagation()}>{action}</div>
      </div>
    );
  };

  return (
    <Layout
      newCount={countOf("new")} query={s.query} setQuery={s.setQuery} toast={s.toast}
      onBell={() => { setFilter("new"); s.setQuery(""); }}
      overlays={<OrderOverlays s={s} manage />}
    >
      <PageHead s={s} title="إدارة الطلبيات" sub="اتصل بالعميل، أكّد الطلبية، ثم أرسلها لشركة التوصيل." />

      <section className="cards">
        {cards.map((c) => (
          <button key={c.key} className={`sc ${c.cls}${filter === c.key ? " on" : ""}`} aria-pressed={filter === c.key}
            onClick={() => setFilter(filter === c.key ? "all" : c.key)}>
            <span className="si"><Icon name={c.icon} size={22} /></span>
            <span className="sx"><span className="sl">{c.label}</span><b className="sn">{c.n}</b></span>
            <span className="sh2">{c.hint}</span>
          </button>
        ))}
      </section>

      <section className="tc">
        <TableTop s={s} filters={MANAGE_FILTERS} title="طلبيات تحتاج متابعة" />
        <div className="tbl">
          <TableState s={s} />
          {rows.length > 0 && (
            <>
              <div className="row hd mg">
                <button className="ck" aria-pressed={allOnPage} aria-label="تحديد كل الصفحة"
                  style={{ background: allOnPage ? "#F0B429" : "var(--card)" }} onClick={togglePage}>
                  {allOnPage && <Icon name="check" size={14} />}
                </button>
                <span>العميل</span><span>المبلغ</span><span className="c-ti">التصنيف</span><span>نتيجة الاتصال</span><span>الحالة</span><span>إجراء</span>
              </div>
              {rows.map(row)}
            </>
          )}
        </div>
        <Pager page={cur} pages={pages} total={sorted.length} onPage={setPage} />
      </section>

      {selected.length > 0 && (
        <div className="bulk">
          <span>تم تحديد {selected.length}</span>
          <button className="pri gold" onClick={() => openSend(selected)}>تأكيد وإرسال للتوصيل</button>
          <button className="ib dark" onClick={() => setSelected([])} aria-label="إلغاء التحديد"><Icon name="x" /></button>
        </div>
      )}
    </Layout>
  );
}
