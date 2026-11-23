/* =========================================================
   InfoPages.jsx  ←  src/InfoPages.jsx
   صفحات المعلومات: من نحن / التوصيل والإرجاع / الخصوصية / الشروط / اتصل بنا
   (بثلاث لغات، متوافقة مع الأسئلة الشائعة في أسفل المتجر)
   ========================================================= */
import { Link } from "react-router-dom";
import { usePrefs } from "./prefs";

const PHONE = "213774812167";
const MAIL = "cheribetsal@gmail.com";

const PAGES = {
  about: {
    ar: { title: "من نحن", blocks: [
      { p: "ISD | +213 متجر جزائري إلكتروني متخصص في الساعات والنظارات والحقائب والقبعات. هدفنا أن تجد في مكان واحد منتجات بتصاميم راقية مع خدمة واضحة وصادقة." },
      { h: "ماذا نقدّم؟", ul: ["ساعات ونظارات وحقائب وقبعات من علامات متنوعة.", "ضمان لمدة سنة على المنتجات الأصلية.", "الدفع عند الاستلام والتوصيل إلى كل الولايات.", "تواصل مباشر عبر واتساب للإجابة عن أسئلتك."] },
      { h: "التزامنا", p: "نعرض لك السعر ورسوم التوصيل بوضوح قبل تأكيد الطلب، ونتصل بك لتأكيده. لا رسوم مخفية." },
    ] },
    fr: { title: "Qui sommes-nous", blocks: [
      { p: "ISD | +213 est une boutique en ligne algérienne de montres, lunettes, sacs et casquettes. Notre but : réunir des produits au design raffiné avec un service clair et honnête." },
      { h: "Ce que nous proposons", ul: ["Montres, lunettes, sacs et casquettes de marques variées.", "Garantie d'un an sur les produits originaux.", "Paiement à la livraison et livraison dans toutes les wilayas.", "Contact direct sur WhatsApp pour répondre à vos questions."] },
      { h: "Notre engagement", p: "Le prix et les frais de livraison sont affichés clairement avant de confirmer la commande, et nous vous appelons pour la confirmer. Aucun frais caché." },
    ] },
    en: { title: "About us", blocks: [
      { p: "ISD | +213 is an Algerian online store for watches, eyewear, bags and caps. Our goal is to bring refined designs together in one place with clear and honest service." },
      { h: "What we offer", ul: ["Watches, eyewear, bags and caps from various brands.", "A one-year warranty on original products.", "Cash on delivery and shipping to every wilaya.", "Direct contact on WhatsApp to answer your questions."] },
      { h: "Our commitment", p: "The price and delivery fee are shown clearly before you confirm, and we call you to confirm the order. No hidden fees." },
    ] },
  },
  shipping: {
    ar: { title: "التوصيل والإرجاع", blocks: [
      { h: "مدة التوصيل", p: "من 24 إلى 72 ساعة حسب الولاية، بعد تأكيد الطلب هاتفياً." },
      { h: "رسوم التوصيل", p: "تختلف حسب الولاية ونوع التوصيل (للمنزل أو لمكتب التوصيل). تظهر الرسوم في استمارة الطلب بمجرد اختيار الولاية، وتُضاف إلى المجموع قبل أن تؤكد." },
      { h: "الدفع", p: "الدفع عند الاستلام: تفحص المنتج ثم تدفع. تتوفر أيضاً طرق أخرى مذكورة في استمارة الطلب مع تفاصيلها." },
      { h: "الإرجاع والاستبدال", ul: ["يمكنك الإرجاع أو الاستبدال خلال 7 أيام من الاستلام.", "بشرط أن يكون المنتج سليماً وبحالته الأصلية.", "تواصل معنا عبر واتساب وسنرتّب الأمر معك."] },
      { h: "الضمان", p: "سنة كاملة على المنتجات الأصلية." },
    ] },
    fr: { title: "Livraison et retours", blocks: [
      { h: "Délai de livraison", p: "De 24 à 72 heures selon la wilaya, après confirmation de la commande par téléphone." },
      { h: "Frais de livraison", p: "Ils varient selon la wilaya et le type de livraison (à domicile ou bureau de livraison). Ils s'affichent dans le formulaire dès que vous choisissez la wilaya et sont ajoutés au total avant confirmation." },
      { h: "Paiement", p: "Paiement à la livraison : vous vérifiez le produit puis vous payez. D'autres modes sont indiqués dans le formulaire avec leurs détails." },
      { h: "Retours et échanges", ul: ["Retour ou échange possible sous 7 jours après réception.", "Le produit doit être intact et dans son état d'origine.", "Contactez-nous sur WhatsApp et nous arrangerons cela."] },
      { h: "Garantie", p: "Un an complet sur les produits originaux." },
    ] },
    en: { title: "Delivery & returns", blocks: [
      { h: "Delivery time", p: "24 to 72 hours depending on the wilaya, after the order is confirmed by phone." },
      { h: "Delivery fees", p: "They depend on the wilaya and delivery type (home or delivery office). Fees appear in the order form as soon as you pick your wilaya and are added to the total before you confirm." },
      { h: "Payment", p: "Cash on delivery: inspect the product, then pay. Other methods, with their details, are listed in the order form." },
      { h: "Returns & exchanges", ul: ["You can return or exchange within 7 days of delivery.", "The product must be intact and in its original condition.", "Message us on WhatsApp and we will sort it out."] },
      { h: "Warranty", p: "A full year on original products." },
    ] },
  },
  privacy: {
    ar: { title: "سياسة الخصوصية", blocks: [
      { h: "ما البيانات التي نجمعها؟", p: "عند الطلب فقط: الاسم، رقم الهاتف، الولاية، البلدية، المنتجات المطلوبة وطريقة الدفع. لا نطلب أرقام بطاقات ولا كلمات مرور." },
      { h: "كيف نستعملها؟", p: "لمعالجة طلبك والاتصال بك لتأكيده وتوصيله. لا نبيع بياناتك ولا نشاركها مع أحد إلا مع شركة التوصيل بالقدر اللازم لتسليم الطلب." },
      { h: "أدوات القياس الإعلانية", p: "قد نستعمل بيكسل فيسبوك أو تيك توك لقياس فعالية الإعلانات. يرسلان معلومات تصفّح عامة (الصفحات والمنتجات التي شاهدتها وقيمة الطلب) ولا نرسل اسمك ولا هاتفك. يمكنك منعها من إعدادات المتصفح أو بإضافة حجب الإعلانات." },
      { h: "التخزين في متصفحك", p: "نحفظ في متصفحك فقط: السلة والمفضلة واللغة والمظهر، لتبقى كما اخترتها." },
      { h: "حقوقك", p: `يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها بمراسلتنا على ${MAIL}.` },
    ] },
    fr: { title: "Politique de confidentialité", blocks: [
      { h: "Données collectées", p: "Uniquement lors d'une commande : nom, téléphone, wilaya, commune, produits commandés et mode de paiement. Nous ne demandons ni numéro de carte ni mot de passe." },
      { h: "Utilisation", p: "Pour traiter votre commande, vous appeler pour la confirmer et la livrer. Nous ne vendons pas vos données et ne les partageons qu'avec la société de livraison, dans la mesure nécessaire." },
      { h: "Mesure publicitaire", p: "Nous pouvons utiliser les pixels Facebook ou TikTok pour mesurer l'efficacité de nos publicités. Ils reçoivent des informations de navigation générales (pages et produits vus, montant de la commande) mais jamais votre nom ni votre téléphone. Vous pouvez les bloquer dans votre navigateur ou avec un bloqueur de publicités." },
      { h: "Stockage dans votre navigateur", p: "Nous enregistrons seulement : panier, favoris, langue et thème, pour conserver vos choix." },
      { h: "Vos droits", p: `Vous pouvez demander l'accès, la correction ou la suppression de vos données en écrivant à ${MAIL}.` },
    ] },
    en: { title: "Privacy policy", blocks: [
      { h: "What we collect", p: "Only when you order: name, phone number, wilaya, commune, the products ordered and the payment method. We never ask for card numbers or passwords." },
      { h: "How we use it", p: "To process your order, call you to confirm it and deliver it. We do not sell your data, and share it only with the delivery company as far as needed to deliver." },
      { h: "Advertising measurement", p: "We may use the Facebook or TikTok pixel to measure ad performance. They receive general browsing information (pages and products viewed, order value) but never your name or phone. You can block them in your browser or with an ad blocker." },
      { h: "Storage in your browser", p: "We only store your cart, favorites, language and theme so your choices are kept." },
      { h: "Your rights", p: `You can ask to access, correct or delete your data by writing to ${MAIL}.` },
    ] },
  },
  terms: {
    ar: { title: "شروط البيع", blocks: [
      { h: "الطلب", p: "بإرسالك الطلب تؤكد صحة بياناتك. نتصل بك لتأكيد الطلب قبل الشحن، وقد نلغيه إذا تعذّر الوصول إليك." },
      { h: "الأسعار", p: "الأسعار بالدينار الجزائري، ويحسب الخادم السعر النهائي (المنتجات + التوصيل) عند إرسال الطلب. قد تتغير الأسعار دون إشعار مسبق، والسعر المعتمد هو الظاهر عند تأكيدك." },
      { h: "الدفع والاستلام", p: "تفحص المنتج عند الاستلام. يجب أن يكون المبلغ المتفق عليه جاهزاً عند وصول المندوب." },
      { h: "الإرجاع والضمان", p: "الإرجاع أو الاستبدال خلال 7 أيام من الاستلام بشرط سلامة المنتج. ضمان سنة على المنتجات الأصلية، ولا يشمل سوء الاستعمال أو الكسر." },
      { h: "التواصل", p: "لأي استفسار أو شكوى راسلنا عبر واتساب أو البريد الإلكتروني." },
    ] },
    fr: { title: "Conditions de vente", blocks: [
      { h: "Commande", p: "En envoyant votre commande vous certifiez l'exactitude de vos données. Nous vous appelons pour la confirmer avant l'expédition ; nous pouvons l'annuler si nous ne parvenons pas à vous joindre." },
      { h: "Prix", p: "Les prix sont en dinars algériens et le serveur calcule le prix final (produits + livraison) à l'envoi de la commande. Les prix peuvent changer sans préavis ; le prix retenu est celui affiché à la confirmation." },
      { h: "Paiement et réception", p: "Vous vérifiez le produit à la réception. Le montant convenu doit être prêt à l'arrivée du livreur." },
      { h: "Retours et garantie", p: "Retour ou échange sous 7 jours après réception si le produit est intact. Garantie d'un an sur les produits originaux, hors mauvais usage ou casse." },
      { h: "Contact", p: "Pour toute question ou réclamation, écrivez-nous sur WhatsApp ou par e-mail." },
    ] },
    en: { title: "Terms of sale", blocks: [
      { h: "Ordering", p: "By sending your order you confirm your details are correct. We call you to confirm before shipping, and may cancel if we cannot reach you." },
      { h: "Prices", p: "Prices are in Algerian dinars and the server computes the final price (products + delivery) when the order is sent. Prices may change without notice; the price that applies is the one shown when you confirm." },
      { h: "Payment & receipt", p: "You inspect the product on delivery. The agreed amount should be ready when the courier arrives." },
      { h: "Returns & warranty", p: "Return or exchange within 7 days of delivery if the product is intact. One-year warranty on original products, excluding misuse or breakage." },
      { h: "Contact", p: "For any question or complaint, write to us on WhatsApp or by email." },
    ] },
  },
  contact: {
    ar: { title: "اتصل بنا", blocks: [{ p: "يسعدنا سماعك. أسرع طريقة للوصول إلينا هي واتساب." }] },
    fr: { title: "Contactez-nous", blocks: [{ p: "Nous serons ravis de vous lire. Le moyen le plus rapide est WhatsApp." }] },
    en: { title: "Contact us", blocks: [{ p: "We'd love to hear from you. The fastest way to reach us is WhatsApp." }] },
  },
};

const CONTACT = {
  ar: { wa: "واتساب", phone: "الهاتف", mail: "البريد الإلكتروني", addr: "العنوان", place: "الجزائر العاصمة، الجزائر", hours: "ساعات العمل", time: "09:00 - 21:00 · السبت - الخميس" },
  fr: { wa: "WhatsApp", phone: "Téléphone", mail: "E-mail", addr: "Adresse", place: "Alger, Algérie", hours: "Horaires", time: "09:00 - 21:00 · Sam - Jeu" },
  en: { wa: "WhatsApp", phone: "Phone", mail: "Email", addr: "Address", place: "Algiers, Algeria", hours: "Working hours", time: "09:00 - 21:00 · Sat - Thu" },
};
const BACK = { ar: "← الرئيسية", fr: "← Accueil", en: "← Home" };

const CSS = `
.ip{max-width:760px;margin:0 auto;padding:22px 16px 34px;line-height:1.95;font-family:Tahoma,"Segoe UI",system-ui,sans-serif;color:#2a1d0f}
.ip h1{font-family:Georgia,serif;font-size:28px;margin:6px 0 14px}
.ip h2{font-size:18px;margin:22px 0 6px;color:var(--c-d1)}
.ip p{margin:0 0 8px}
.ip ul{margin:0;padding-inline-start:22px}
.ip a.ip-back{color:inherit;text-decoration:none;font-weight:700}
.ip-card{background:rgba(255,255,255,.55);border:1px solid rgba(107,74,38,.2);border-radius:16px;padding:14px 18px;margin:0 0 10px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:center}
.ip-card small{display:block;opacity:.7}
.ip-card a{color:inherit;font-weight:700}
html[data-theme="dark"] .ip{color:var(--c-cream2)}
html[data-theme="dark"] .ip h2{color:var(--c-g2)}
html[data-theme="dark"] .ip-card{background:rgba(255,255,255,.06);border-color:rgba(232,197,143,.3)}
`;

export default function InfoPage({ page }) {
  const { lang, dir } = usePrefs();
  const d = (PAGES[page] || PAGES.about)[lang] || PAGES[page].ar;
  const c = CONTACT[lang] || CONTACT.ar;
  return (
    <main className="ip" dir={dir}>
      <style>{CSS}</style>
      <Link to="/" className="ip-back">{BACK[lang] || BACK.ar}</Link>
      <h1>{d.title}</h1>
      {d.blocks.map((b, i) => (
        <section key={i}>
          {b.h ? <h2>{b.h}</h2> : null}
          {b.p ? <p>{b.p}</p> : null}
          {b.ul ? <ul>{b.ul.map((x) => <li key={x}>{x}</li>)}</ul> : null}
        </section>
      ))}
      {page === "contact" && (
        <div style={{ marginTop: 16 }}>
          <div className="ip-card"><span><small>{c.wa}</small></span><a href={`https://wa.me/${PHONE}`} target="_blank" rel="noopener noreferrer">+213 774 81 21 67</a></div>
          <div className="ip-card"><span><small>{c.phone}</small></span><a href={`tel:+${PHONE}`} dir="ltr">+213 774 81 21 67</a></div>
          <div className="ip-card"><span><small>{c.mail}</small></span><a href={`mailto:${MAIL}`}>{MAIL}</a></div>
          <div className="ip-card"><span><small>{c.addr}</small></span><b>{c.place}</b></div>
          <div className="ip-card"><span><small>{c.hours}</small></span><b>{c.time}</b></div>
        </div>
      )}
    </main>
  );
}
