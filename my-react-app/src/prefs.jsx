/* =========================================================
   prefs.jsx  ←  src/prefs.jsx
   تفضيلات الزائر: المظهر (فاتح/داكن) واللغة (عربي/Français/English).
   تُحفظ في المتصفح وتُطبَّق على كل صفحات المتجر.
   ========================================================= */
import { FR_X, EN_X } from "./i18n-extra";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const THEME_KEY = "isd-theme";
const LANG_KEY = "isd-lang";
export const LANGS = [
  { code: "ar", label: "العربية", short: "AR", dir: "rtl" },
  { code: "fr", label: "Français", short: "FR", dir: "ltr" },
  { code: "en", label: "English", short: "EN", dir: "ltr" },
];

const read = (k, ok, d) => {
  try { const v = localStorage.getItem(k); return ok.includes(v) ? v : d; } catch { return d; }
};
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { /* التخزين محجوب */ } };

function apply(theme, lang) {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.style.colorScheme = theme;
  el.lang = lang;
  el.dir = "ltr"; // اتجاه المستند يبقى كما كان؛ الصفحات العربية تأخذ rtl عبر theme.css
  el.dataset.lang = lang;
}

const initTheme = read(THEME_KEY, ["light", "dark"], "light");
const initLang = read(LANG_KEY, ["ar", "fr", "en"], "ar");
if (typeof document !== "undefined") apply(initTheme, initLang); // قبل أول رسم: بلا وميض

/* القاموس: المفتاح هو النص العربي الأصلي. أي نص غير موجود يبقى كما هو. */
const FR = {
  "الرئيسية": "Accueil", "ساعات": "Montres", "نظارات": "Lunettes", "حقائب": "Sacs", "قبعات": "Casquettes",
  "المفضلة": "Favoris", "تسجيل الدخول": "Connexion", "تسوّق": "Boutique", "حسابك": "Votre compte",
  "تواصل معنا": "Contact", "واتساب": "WhatsApp", "اتصل بنا": "Appelez-nous", "موقع المتجر": "Adresse du magasin",
  "توصيل لكل الولايات": "Livraison dans toutes les wilayas", "الدفع عند الاستلام": "Paiement à la livraison",
  "ضمان على الأصلية": "Produits originaux garantis", "القائمة": "Menu", "إغلاق القائمة": "Fermer le menu",
  "ساعات ونظارات وحقائب وقبعات": "Montres, lunettes, sacs et casquettes",
  "المظهر": "Thème", "اللغة": "Langue", "داكن": "Sombre", "فاتح": "Clair", "تغيير المظهر": "Changer le thème",
  "ابحث عن منتج...": "Rechercher un produit...", "بحث": "Rechercher",
  "© 2026 جميع الحقوق محفوظة (Created by Salah Cherihet)": "© 2026 Tous droits réservés (Created by Salah Cherihet)",
  "تصنيفاتنا": "Nos catégories", "اكتشف المجموعة ←": "Découvrir la collection →",
  "منتجاتنا": "Nos produits", "اختر ما يناسبك واطلب الآن": "Choisissez et commandez maintenant",
  "اطلب الآن": "Commander", "عرض المزيد": "Voir plus", "دفع عند الاستلام": "Paiement à la livraison",
  "منتجات أصلية": "Produits originaux", "ساعات ونظارات وحقائب وقبعات بتصاميم فاخرة": "Montres, lunettes, sacs et casquettes au design raffiné",
  "تسوق الآن": "Acheter maintenant", "كل ما يليق بك في مكان واحد": "Tout ce qui vous va, au même endroit",
  "دج": "DA", "د.ج": "DA", "جاري التحميل...": "Chargement...", "اشتري الآن": "Acheter",
  "← رجوع": "← Retour", "المفضلة ❤️": "Favoris ❤️", "لا توجد منتجات في المفضلة بعد.": "Aucun favori pour le moment.", "حذف": "Supprimer",
  "حدث خطأ:": "Erreur :", "اكتب اسم المنتج للبحث.": "Saisissez le nom du produit.", "نتائج": "Résultats",
  "غير متوفر": "indisponible", "المنتج": "Le produit", "ربما تقصد:": "Vous cherchiez peut-être :", "لا توجد منتجات مشابهة.": "Aucun produit similaire.",
  "المنتج غير متوفر": "Produit indisponible",
  "املأ الاستمارة للطلب": "Remplissez le formulaire de commande",
  "الاسم واللقب": "Nom et prénom", "اكتب اسمك الكامل": "Saisissez votre nom complet",
  "رقم الهاتف": "Téléphone", "مثال: 0555123456": "Exemple : 0555123456",
  "الولاية": "Wilaya", "اختر ولايتك": "Choisissez votre wilaya", "البلدية": "Commune",
  "مكان التوصيل": "Lieu de livraison", "🏠 للمنزل": "🏠 À domicile", "🏢 لمكتب التوصيل": "🏢 Bureau de livraison",
  "طريقة الدفع": "Mode de paiement", "الكمية": "Quantité", "زيادة": "Augmenter", "نقصان": "Diminuer",
  "سعر المنتجات": "Prix des produits", "سعر التوصيل": "Frais de livraison",
  "الدفع عند الاستلام، والتوصيل لكل الولايات": "Paiement à la livraison, livraison dans toutes les wilayas",
  "التكلفة الإجمالية": "Total", "جارٍ إرسال الطلب...": "Envoi de la commande...",
  "تم إرسال بيانات الطلب، أكمل الإرسال من واتساب ✓": "Commande enregistrée, terminez l'envoi sur WhatsApp ✓",
  "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.": "Erreur lors de l'envoi de la commande. Réessayez.",
  "السابق": "Précédent", "التالي": "Suivant", "صورة": "Image",
  "طلب جديد 🛒": "Nouvelle commande 🛒", "المنتج:": "Produit :", "الكمية:": "Quantité :", "الاسم:": "Nom :", "الهاتف:": "Téléphone :",
  "الولاية:": "Wilaya :", "البلدية:": "Commune :", "التوصيل:": "Livraison :", "للمنزل": "À domicile", "لمكتب التوصيل": "Bureau de livraison",
  "طريقة الدفع:": "Paiement :", "سعر المنتجات:": "Prix des produits :", "سعر التوصيل:": "Frais de livraison :", "السعر الإجمالي:": "Total :",
  "بريد الجزائر (CCP)": "Algérie Poste (CCP)", "بريدي موب": "BaridiMob", "تحويل بنكي": "Virement bancaire",
  "اختر طريقة الدفع": "Choisir le mode de paiement",
  "أيام العمل": "Jours d'ouverture", "مغلق": "Fermé", "أسئلة شائعة": "Questions fréquentes", "روابط مهمة": "Liens utiles",
  "الأحد": "Dimanche", "الاثنين": "Lundi", "الثلاثاء": "Mardi", "الأربعاء": "Mercredi", "الخميس": "Jeudi", "الجمعة": "Vendredi", "السبت": "Samedi",
  "هل الساعات أصلية؟": "Les montres sont-elles originales ?", "نعم، جميع ساعاتنا أصلية ومرفقة بضمان لمدة سنة.": "Oui, toutes nos montres sont originales et garanties 1 an.",
  "كيف أطلب؟": "Comment commander ?", "اختر الساعة، املأ الاسم والهاتف والولاية، وسنتصل بك لتأكيد الطلب.": "Choisissez la montre, remplissez nom, téléphone et wilaya, nous vous appellerons pour confirmer.",
  "هل الدفع عند الاستلام متاح؟": "Le paiement à la livraison est-il possible ?", "نعم، تدفع عند استلام الساعة وفحصها.": "Oui, vous payez à la réception après vérification.",
  "كم تستغرق مدة التوصيل؟": "Quel est le délai de livraison ?", "من 24 إلى 72 ساعة حسب الولاية.": "De 24 à 72 heures selon la wilaya.",
  "هل يمكنني الإرجاع أو الاستبدال؟": "Puis-je retourner ou échanger ?", "نعم، خلال 7 أيام من الاستلام بشرط سلامة الساعة.": "Oui, sous 7 jours après réception si la montre est intacte.",
  "قنواتنا الرسمية": "Canaux officiels", "الهاتف": "Téléphone", "البريد الإلكتروني": "E-mail", "الموقع": "Adresse", "ساعات العمل": "Horaires",
  "الجزائر العاصمة، الجزائر": "Alger, Algérie", "09:00 - 21:00 · السبت - الخميس": "09:00 - 21:00 · Sam - Jeu",
  "من نحن": "Qui sommes-nous", "التوصيل والإرجاع": "Livraison et retours", "سياسة الخصوصية": "Politique de confidentialité", "شروط البيع": "Conditions de vente",
};
const EN = {
  "الرئيسية": "Home", "ساعات": "Watches", "نظارات": "Eyewear", "حقائب": "Bags", "قبعات": "Caps",
  "المفضلة": "Favorites", "تسجيل الدخول": "Sign in", "تسوّق": "Shop", "حسابك": "Your account",
  "تواصل معنا": "Contact us", "واتساب": "WhatsApp", "اتصل بنا": "Call us", "موقع المتجر": "Store location",
  "توصيل لكل الولايات": "Delivery to all wilayas", "الدفع عند الاستلام": "Cash on delivery",
  "ضمان على الأصلية": "Original products guaranteed", "القائمة": "Menu", "إغلاق القائمة": "Close menu",
  "ساعات ونظارات وحقائب وقبعات": "Watches, eyewear, bags & caps",
  "المظهر": "Theme", "اللغة": "Language", "داكن": "Dark", "فاتح": "Light", "تغيير المظهر": "Toggle theme",
  "ابحث عن منتج...": "Search for a product...", "بحث": "Search",
  "© 2026 جميع الحقوق محفوظة (Created by Salah Cherihet)": "© 2026 All rights reserved (Created by Salah Cherihet)",
  "تصنيفاتنا": "Our categories", "اكتشف المجموعة ←": "Explore the collection →",
  "منتجاتنا": "Our products", "اختر ما يناسبك واطلب الآن": "Pick what suits you and order now",
  "اطلب الآن": "Order now", "عرض المزيد": "Show more", "دفع عند الاستلام": "Cash on delivery",
  "منتجات أصلية": "Original products", "ساعات ونظارات وحقائب وقبعات بتصاميم فاخرة": "Watches, eyewear, bags and caps in refined designs",
  "تسوق الآن": "Shop now", "كل ما يليق بك في مكان واحد": "Everything that suits you, in one place",
  "دج": "DZD", "د.ج": "DZD", "جاري التحميل...": "Loading...", "اشتري الآن": "Buy now",
  "← رجوع": "← Back", "المفضلة ❤️": "Favorites ❤️", "لا توجد منتجات في المفضلة بعد.": "No favorites yet.", "حذف": "Remove",
  "حدث خطأ:": "Error:", "اكتب اسم المنتج للبحث.": "Type a product name to search.", "نتائج": "Results",
  "غير متوفر": "is not available", "المنتج": "The product", "ربما تقصد:": "Did you mean:", "لا توجد منتجات مشابهة.": "No similar products.",
  "المنتج غير متوفر": "Product not available",
  "املأ الاستمارة للطلب": "Fill in the order form",
  "الاسم واللقب": "Full name", "اكتب اسمك الكامل": "Enter your full name",
  "رقم الهاتف": "Phone number", "مثال: 0555123456": "Example: 0555123456",
  "الولاية": "Wilaya", "اختر ولايتك": "Choose your wilaya", "البلدية": "Commune",
  "مكان التوصيل": "Delivery place", "🏠 للمنزل": "🏠 To home", "🏢 لمكتب التوصيل": "🏢 To delivery office",
  "طريقة الدفع": "Payment method", "الكمية": "Quantity", "زيادة": "Increase", "نقصان": "Decrease",
  "سعر المنتجات": "Products price", "سعر التوصيل": "Delivery fee",
  "الدفع عند الاستلام، والتوصيل لكل الولايات": "Cash on delivery, shipping to all wilayas",
  "التكلفة الإجمالية": "Total", "جارٍ إرسال الطلب...": "Sending order...",
  "تم إرسال بيانات الطلب، أكمل الإرسال من واتساب ✓": "Order saved. Finish sending it on WhatsApp ✓",
  "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.": "Could not send the order. Please try again.",
  "السابق": "Previous", "التالي": "Next", "صورة": "Image",
  "طلب جديد 🛒": "New order 🛒", "المنتج:": "Product:", "الكمية:": "Quantity:", "الاسم:": "Name:", "الهاتف:": "Phone:",
  "الولاية:": "Wilaya:", "البلدية:": "Commune:", "التوصيل:": "Delivery:", "للمنزل": "To home", "لمكتب التوصيل": "To delivery office",
  "طريقة الدفع:": "Payment:", "سعر المنتجات:": "Products price:", "سعر التوصيل:": "Delivery fee:", "السعر الإجمالي:": "Total:",
  "بريد الجزائر (CCP)": "Algérie Poste (CCP)", "بريدي موب": "BaridiMob", "تحويل بنكي": "Bank transfer",
  "اختر طريقة الدفع": "Choose payment method",
  "أيام العمل": "Opening days", "مغلق": "Closed", "أسئلة شائعة": "FAQ", "روابط مهمة": "Useful links",
  "الأحد": "Sunday", "الاثنين": "Monday", "الثلاثاء": "Tuesday", "الأربعاء": "Wednesday", "الخميس": "Thursday", "الجمعة": "Friday", "السبت": "Saturday",
  "هل الساعات أصلية؟": "Are the watches original?", "نعم، جميع ساعاتنا أصلية ومرفقة بضمان لمدة سنة.": "Yes, all our watches are original with a 1-year warranty.",
  "كيف أطلب؟": "How do I order?", "اختر الساعة، املأ الاسم والهاتف والولاية، وسنتصل بك لتأكيد الطلب.": "Pick a watch, fill in your name, phone and wilaya, and we'll call to confirm.",
  "هل الدفع عند الاستلام متاح؟": "Is cash on delivery available?", "نعم، تدفع عند استلام الساعة وفحصها.": "Yes, you pay when you receive and check the watch.",
  "كم تستغرق مدة التوصيل؟": "How long does delivery take?", "من 24 إلى 72 ساعة حسب الولاية.": "24 to 72 hours depending on the wilaya.",
  "هل يمكنني الإرجاع أو الاستبدال؟": "Can I return or exchange?", "نعم، خلال 7 أيام من الاستلام بشرط سلامة الساعة.": "Yes, within 7 days of delivery if the watch is undamaged.",
  "قنواتنا الرسمية": "Official channels", "الهاتف": "Phone", "البريد الإلكتروني": "Email", "الموقع": "Location", "ساعات العمل": "Working hours",
  "الجزائر العاصمة، الجزائر": "Algiers, Algeria", "09:00 - 21:00 · السبت - الخميس": "09:00 - 21:00 · Sat - Thu",
  "من نحن": "About us", "التوصيل والإرجاع": "Delivery & returns", "سياسة الخصوصية": "Privacy policy", "شروط البيع": "Terms of sale",
};
const DICT = { fr: { ...FR, ...FR_X }, en: { ...EN, ...EN_X } };

const Ctx = createContext(null);

export function PrefsProvider({ children }) {
  const [theme, setThemeState] = useState(initTheme);
  const [lang, setLangState] = useState(initLang);

  useEffect(() => { apply(theme, lang); }, [theme, lang]);

  const setTheme = useCallback((v) => { const n = v === "dark" ? "dark" : "light"; write(THEME_KEY, n); setThemeState(n); }, []);
  const setLang = useCallback((v) => { const n = LANGS.some((l) => l.code === v) ? v : "ar"; write(LANG_KEY, n); setLangState(n); }, []);

  const value = useMemo(() => {
    const d = DICT[lang];
    const t = (k) => (d && typeof k === "string" && Object.prototype.hasOwnProperty.call(d, k) ? d[k] : k);
    const money = (n) => `${Number(n).toLocaleString("en-US")} ${t("دج")}`;
    return { theme, setTheme, lang, setLang, t, money, dir: (LANGS.find((l) => l.code === lang) || LANGS[0]).dir };
  }, [theme, lang, setTheme, setLang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePrefs يجب أن يُستعمل داخل PrefsProvider");
  return c;
}

/* ---------- أدوات الواجهة: زر المظهر (شمس/قمر) واختيار اللغة ---------- */
export function ThemeToggle() {
  const { theme, setTheme, t } = usePrefs();
  const dark = theme === "dark";
  return (
    <button type="button" className={"isd-tgl" + (dark ? " dark" : "")} role="switch" aria-checked={dark} aria-label={t("تغيير المظهر")} onClick={() => setTheme(dark ? "light" : "dark")}>
      <span className="isd-tgl-ic sun" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" /></svg>
      </span>
      <span className="isd-tgl-ic moon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z" /></svg>
      </span>
      <span className="isd-tgl-knob" aria-hidden="true" />
    </button>
  );
}

export function LangSelect() {
  const { lang, setLang, t } = usePrefs();
  return (
    <div className="lg" role="radiogroup" aria-label={t("اللغة")}>
      {LANGS.map((l) => (
        <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} className={lang === l.code ? "on" : ""} onClick={() => setLang(l.code)} title={l.label}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function PrefsBar({ className = "" }) {
  const { t } = usePrefs();
  return (
    <div className={"prefs " + className}>
      <div className="prefs-row"><span>{t("المظهر")}</span><ThemeToggle /></div>
      <div className="prefs-row"><span>{t("اللغة")}</span><LangSelect /></div>
    </div>
  );
}
