/* =========================================================
   config.js  ←  ضعه في: src/admin/config.js
   الإعدادات والثوابت (الحالات، القائمة الجانبية، المسارات). غيّر هنا فقط.
   ========================================================= */
export const USE_SAMPLE = false;          // true = بيانات تجريبية للمعاينة فقط. false = يقرأ من الخادم
export const API = "/api";                // عنوان الخادم (server.js)
export const TRACK_PATH = "/admin/orders";
export const MANAGE_PATH = "/admin/orders/manage";
export const DUP_WINDOW_HOURS = 24;       // نفس الهاتف + نفس المنتج خلال هذه المدة = مكررة
export const REFRESH_MS = 30000;          // تحديث الطلبيات تلقائياً كل 30 ثانية
export const REQUEST_TIMEOUT_MS = 15000;  // مهلة كل طلب إلى الخادم
export const PAGE_SIZE = 10;              // عدد الصفوف في كل صفحة من الجدول

export const NAV = [
  { to: "/admin", label: "الرئيسية", icon: "home", mobile: true },
  { to: TRACK_PATH, label: "تتبع الطلبيات", icon: "radar", mobile: true, badge: true },
  { to: MANAGE_PATH, label: "إدارة الطلبيات", icon: "list", mobile: true },
  { to: "/admin/products", label: "المنتجات", icon: "tag", perm: "products" },
  { to: "/admin/leads", label: "السلات المتروكة", icon: "clock", perm: "orders", badge: false },
  { to: "/admin/rates", label: "أسعار التوصيل", icon: "card", perm: "settings" },
  { to: "/admin/reviews", label: "آراء الزبائن", icon: "star", perm: "reviews" },
  { to: "/admin/notify", label: "الإشعارات والإعلانات", icon: "bell", perm: "settings" },
  { to: "/admin/delivery", label: "التوصيل", icon: "truck", perm: "delivery" },
  { to: "/admin/team", label: "الفريق", icon: "shield", perm: "team" },
  { to: "/admin/settings", label: "الإعدادات", icon: "gear", mobile: true },
];

export const ROLES = {
  owner: { label: "مالك", bg: "#FFF1CC", color: "#7A5200" },
  manager: { label: "مدير", bg: "#DCEBFF", color: "#1D4A8A" },
  agent: { label: "موظف", bg: "#ECE9E0", color: "#4A4F60" },
};

export const COMPANIES = [
  { key: "yalidine", label: "Yalidine" },
  { key: "zr", label: "ZR Express" },
  { key: "procolis", label: "Procolis" },
];

/* =========================================================
   الحالات
   ========================================================= */
export const STATUS = {
  new:       { label: "جديدة",       bg: "#FFF1CC", color: "#7A5200" },
  confirmed: { label: "مؤكدة",       bg: "#DCEBFF", color: "#1D4A8A" },
  shipping:  { label: "قيد التوصيل", bg: "#DDF3E8", color: "#14633F" },
  delivered: { label: "مُسلَّمة",     bg: "#CFEFE3", color: "#085041" },
  returned:  { label: "مرتجعة",      bg: "#FBE0DE", color: "#9B2C25" },
  duplicate: { label: "مكررة",       bg: "#E6E0F7", color: "#4B3A8C" },
  cancelled: { label: "ملغاة",       bg: "#ECE9E0", color: "#4A4F60" },
};
/* أسماء بديلة قد يرسلها الخادم */
export const STATUS_ALIAS = { pending: "new", processing: "confirmed", shipped: "shipping", completed: "delivered", canceled: "cancelled", refunded: "returned" };

export const CALLS = [
  { key: "no_answer", label: "لا يرد" },
  { key: "busy", label: "مشغول" },
  { key: "postponed", label: "أجّل الاتصال" },
  { key: "confirmed", label: "تم التأكيد" },
  { key: "wrong_number", label: "رقم خاطئ" },
  { key: "cancelled", label: "ألغى الطلبية" },
];
export const STATUS_ITEMS = ["new", "confirmed", "cancelled"].map((k) => ({ key: k, label: STATUS[k].label }));
export const SORTS = [
  { key: "newest", label: "الأحدث أولاً" },
  { key: "oldest", label: "الأقدم أولاً" },
  { key: "highest", label: "الأعلى مبلغاً" },
];
export const TRACK_FILTERS = ["all", "new", "confirmed", "shipping", "delivered", "returned", "duplicate", "cancelled"];
export const MANAGE_FILTERS = ["all", "new", "confirmed", "duplicate", "risk", "cancelled"];

export const TIER = {
  trusted: { label: "موثوق", bg: "#DDF3E8", color: "#14633F" },
  mid:     { label: "متوسط", bg: "#FFF1CC", color: "#7A5200" },
  risk:    { label: "عميل خطر", bg: "#FBE0DE", color: "#9B2C25" },
  new:     { label: "عميل جديد", bg: "#ECE9E0", color: "#4A4F60" },
};
