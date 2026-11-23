/* اختبارات تلقائية للخادم — شغّلها بالأمر:  node --test tests
   تشغّل نسخة مؤقتة من server.js ببيانات مؤقتة (لا تلمس بياناتك الحقيقية). */
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 5600 + Math.floor(Math.random() * 300);
const PASS = "Test-Password-12345";
const BASE = `http://127.0.0.1:${PORT}`;
let proc, tmp, cookie = "";

const PNG = "data:image/png;base64," + Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(300, 1)]).toString("base64");
let seq = 0;
const phone = () => "0555" + String(100000 + ++seq * 7).padStart(6, "0");
const order = (o = {}) => ({ name: "Test User", phone: phone(), wilaya: "الشلف", commune: "أبو الحسن", place: "home", payment: "cod", items: [{ slug: "item-" + seq, qty: 1, price: 28000, name: "x" }], ...o });

async function call(method, url, body, headers = {}) {
  const r = await fetch(BASE + url, { method, headers: { "Content-Type": "application/json", ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; const txt = await r.text(); try { json = JSON.parse(txt); } catch { /* ليس JSON */ }
  return { status: r.status, json, text: txt, headers: r.headers };
}
const admin = (m, u, b) => call(m, u, b, { Cookie: cookie, "X-Requested-With": "XMLHttpRequest" });

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "isd-test-"));
  fs.mkdirSync(path.join(tmp, "build"));
  fs.writeFileSync(path.join(tmp, "build", "v.mp4"), Buffer.alloc(5000, 7));
  fs.writeFileSync(path.join(tmp, "build", "index.html"), "<html><head><title>t</title></head><body>app</body></html>");
  proc = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { env: { ...process.env, PORT: String(PORT), ADMIN_PASSWORD: PASS, DATA_DIR: path.join(tmp, "data"), BUILD_DIR: path.join(tmp, "build"), REACT_APP_SUPABASE_URL: "", REACT_APP_SUPABASE_ANON_KEY: "" }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + "/api/store-settings"); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }
  const l = await call("POST", "/api/admin/login", { password: PASS });
  cookie = String(l.headers.get("set-cookie") || "").split(";")[0];
});
after(() => { try { proc.kill(); } catch { /* */ } try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* */ } });

test("الإدارة تتطلب تسجيل دخول", async () => {
  assert.equal((await call("GET", "/api/admin/orders")).status, 401);
  assert.equal((await call("POST", "/api/admin/login", { password: "wrong-password-123" })).status, 401);
  assert.ok(cookie.startsWith("sid="));
  assert.equal((await call("GET", "/api/admin/orders", undefined, { Cookie: cookie })).status, 200);
});

test("حماية CSRF: التعديل بدون الترويسة مرفوض", async () => {
  const r = await call("PATCH", "/api/admin/settings", { storeName: "X" }, { Cookie: cookie });
  assert.equal(r.status, 403);
});

test("ترويسات الأمان موجودة", async () => {
  const r = await call("GET", "/api/store-settings");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
});

test("طلب عادي يُقبل، والمكرر لا يتكرر", async () => {
  const o = order();
  const a = await call("POST", "/api/orders", o);
  assert.equal(a.status, 201); assert.ok(a.json.id);
  const b = await call("POST", "/api/orders", o);
  assert.equal(b.json.id, a.json.id);
});

test("بيانات غير صالحة تُرفض", async () => {
  assert.equal((await call("POST", "/api/orders", order({ phone: "123" }))).status, 400);
  assert.equal((await call("POST", "/api/orders", order({ wilaya: "xx" }))).status, 400);
  assert.equal((await call("POST", "/api/orders", order({ items: [] }))).status, 400);
});

test("وصل الدفع مطلوب لغير الدفع عند الاستلام", async () => {
  assert.equal((await admin("PATCH", "/api/admin/settings", { payments: { ccp: { enabled: true, details: "CCP 1" } } })).status, 200);
  assert.equal((await call("POST", "/api/orders", order({ payment: "ccp" }))).json.error, "receipt_required");
  assert.equal((await call("POST", "/api/orders", order({ payment: "ccp", receipt: "data:image/svg+xml;base64,PHN2Zz4=" }))).status, 400);
  const ok = await call("POST", "/api/orders", order({ payment: "ccp", receipt: PNG }));
  assert.equal(ok.status, 201);
  const list = (await admin("GET", "/api/admin/orders")).json.orders;
  const f = list.find((x) => x.id === ok.json.id).receipt;
  assert.match(f, /^[a-f0-9]{24}\.png$/);
  assert.equal((await admin("GET", "/api/admin/receipts/" + f)).status, 200);
  assert.equal((await call("GET", "/api/admin/receipts/" + f)).status, 401);
  assert.equal((await call("GET", "/api/uploads/" + f)).status, 404);
});

test("تتبع الطلب يحتاج الرقم والهاتف معاً", async () => {
  const o = order();
  const c = await call("POST", "/api/orders", o);
  const ok = await call("GET", `/api/track?id=${c.json.id}&phone=${o.phone}`);
  assert.equal(ok.status, 200); assert.equal(ok.json.status, "new");
  const miss = await call("GET", `/api/track?id=${c.json.id}&phone=0555000000`);
  assert.equal(miss.status, 404); assert.equal(miss.json.error, "no_order");
  assert.equal((await call("GET", `/api/track?id=${c.json.id}`)).status, 404);
  assert.equal(ok.json.phone, undefined);
});

test("السلة المتروكة: تُحفظ، تُعلَّم المشكوك فيها، وتتحول عند الطلب", async () => {
  const ph = phone();
  const body = { phone: ph, name: "سمير", wilaya: "الشلف", items: [{ slug: "item-1", qty: 2, name: "منتج" }] };
  assert.equal((await call("POST", "/api/cart-leads", body)).status, 200);
  assert.equal((await call("POST", "/api/cart-leads", { ...body, phone: "12" })).status, 400);
  assert.equal((await call("POST", "/api/cart-leads", { phone: "0555555555", name: "aa", items: body.items })).status, 200);
  let leads = (await admin("GET", "/api/admin/leads")).json.leads;
  const bad = leads.find((l) => l.phone === "0555555555");
  assert.ok(bad.suspicious.length >= 1);
  assert.equal(leads.find((l) => l.phone === ph).state, "abandoned");
  assert.equal((await call("GET", "/api/admin/leads")).status, 401);
  await call("POST", "/api/orders", order({ phone: ph }));
  leads = (await admin("GET", "/api/admin/leads")).json.leads;
  assert.equal(leads.find((l) => l.phone === ph).status, "ordered");
});

test("رأي الزبون يدخل بانتظار الموافقة ثم يظهر بعد النشر", async () => {
  const r = await call("POST", "/api/reviews", { name: "كريم", city: "وهران", rating: 5, text: "منتج ممتاز جداً", product: "item-9" });
  assert.equal(r.status, 201);
  assert.equal((await call("GET", "/api/reviews?product=item-9")).json.reviews.length, 0);
  const all = (await admin("GET", "/api/admin/reviews")).json.reviews;
  const mine = all.find((x) => x.product === "item-9");
  assert.equal(mine.published, false);
  assert.equal((await admin("PATCH", "/api/admin/reviews/" + mine.id, { published: true })).status, 200);
  assert.equal((await call("GET", "/api/reviews?product=item-9")).json.reviews.length, 1);
  assert.equal((await call("POST", "/api/reviews", { name: "x", rating: 9, text: "ab", product: "item-9" })).status, 400);
});

test("الملفات الثابتة آمنة وrobots/sitemap يعملان", async () => {
  assert.equal((await call("GET", "/..%2f..%2fserver.js")).status === 200 && (await call("GET", "/..%2fserver.js")).text.includes("createServer"), false);
  assert.match((await call("GET", "/robots.txt")).text, /Sitemap:/);
  assert.match((await call("GET", "/sitemap.xml")).text, /<urlset/);
  assert.match((await call("GET", "/order/item-1")).text, /<html>/);
});

test("الفيديو يدعم Range (ضروري لآيفون)", async () => {
  const r = await fetch(BASE + "/v.mp4", { headers: { Range: "bytes=0-99" } });
  assert.equal(r.status, 206);
  assert.equal(r.headers.get("content-range"), "bytes 0-99/5000");
  assert.equal((await r.arrayBuffer()).byteLength, 100);
  assert.equal((await fetch(BASE + "/v.mp4", { headers: { Range: "bytes=9000-" } })).status, 416);
  assert.equal((await fetch(BASE + "/v.mp4")).headers.get("content-type"), "video/mp4");
});
