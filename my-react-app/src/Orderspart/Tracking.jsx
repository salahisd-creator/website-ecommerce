/* =========================================================
   Tracking.jsx  ←  ضعه في: src/admin/Tracking.jsx
   صفحة «تتبع الطلبيات»  —  المسار: /admin/orders
   ========================================================= */
import Layout from "./Layout";
import { TRACK_FILTERS, STATUS } from "./config";
import { dateOf, fmtPhone, shortId } from "./helpers";
import useOrders, { OrderOverlays, PageHead, TableState, TableTop } from "./Orders";
import { Icon, Pager, Pill, Spark } from "./ui";

export default function Tracking() {
  const s = useOrders(false);
  const { orders, filter, setFilter, rows, sorted, cur, pages, setPage, sheet, active, openOrder, sp, countOf, viewOf } = s;

  const cards = [
    { key: "all", label: "إجمالي الطلبيات", n: orders.length, icon: "bag", cls: "p", color: "#7F77DD", s: sp.all },
    { key: "new", label: "طلبيات جديدة", n: countOf("new"), icon: "clock", cls: "a", color: "#EF9F27", s: sp.new },
    { key: "shipping", label: "قيد التوصيل", n: countOf("shipping"), icon: "truck", cls: "b", color: "#378ADD", s: sp.shipping },
    { key: "delivered", label: "مُسلَّمة", n: countOf("delivered"), icon: "check", cls: "g", color: "#2DBE7E", s: sp.delivered },
  ];

  const row = (o) => {
    const v = viewOf(o);
    return (
      <div key={o.id} className={`row tg${sheet && active === o.id ? " sel" : ""}`} onClick={() => openOrder(o.id)}>
        <div className="c-id"><b>#{shortId(o.id)}</b></div>
        <div className="c-cu"><span className="cname">{o.name || "—"}</span></div>
        <div className="c-ph" dir="ltr"><Icon name="phone" size={14} />{fmtPhone(o.phone)}</div>
        <div className="c-dt"><Icon name="calendar" size={14} />{dateOf(o.createdAt)}</div>
        <div className="c-am"><b>{o.total.toLocaleString("en-US")}</b> <span className="muted">دج</span></div>
        <div className="c-st"><Pill s={STATUS[v]} /></div>
        <div className="c-ac" onClick={(e) => e.stopPropagation()}>
          <button className="vw" onClick={() => openOrder(o.id)}><Icon name="eye" size={16} />عرض التفاصيل</button>
        </div>
      </div>
    );
  };

  return (
    <Layout
      newCount={s.newCount} query={s.query} setQuery={s.setQuery} toast={s.toast}
      onBell={() => { setFilter("new"); s.setQuery(""); }}
      overlays={<OrderOverlays s={s} manage={false} />}
    >
      <PageHead s={s} title="تتبع الطلبيات" sub="تابع حالة كل طلبية من الاستلام حتى التسليم." />

      <section className="cards">
        {cards.map((c) => (
          <button key={c.key} className={`sc ${c.cls}${filter === c.key ? " on" : ""}`} aria-pressed={filter === c.key}
            onClick={() => setFilter(filter === c.key && c.key !== "all" ? "all" : c.key)}>
            <span className="si"><Icon name={c.icon} size={22} /></span>
            <span className="sx"><span className="sl">{c.label}</span><b className="sn">{c.n}</b></span>
            <span className={`sd${c.s.delta == null ? "" : c.s.delta < 0 ? " neg" : " pos"}`}>
              {c.s.delta == null ? "—" : `${c.s.delta > 0 ? "+" : ""}${c.s.delta}%`}
            </span>
            <Spark data={c.s.buckets} color={c.color} />
          </button>
        ))}
      </section>

      <section className="tc">
        <TableTop s={s} filters={TRACK_FILTERS} title="أحدث الطلبيات" />
        <div className="tbl">
          <TableState s={s} />
          {rows.length > 0 && (
            <>
              <div className="row hd tg">
                <span>رقم الطلب</span><span>العميل</span><span>الهاتف</span><span>التاريخ</span><span>المبلغ</span><span>الحالة</span><span>إجراء</span>
              </div>
              {rows.map(row)}
            </>
          )}
        </div>
        <Pager page={cur} pages={pages} total={sorted.length} onPage={setPage} />
      </section>
    </Layout>
  );
}
