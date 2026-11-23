/* =========================================================
   styles.js  ←  ضعه في: src/admin/styles.js
   كل تنسيقات اللوحة (الألوان في أول الملف).
   ========================================================= */
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
.adm{--bg:#F4F5F9;--card:#fff;--ink:#16181F;--mut:#5B6072;--line:#E4E6EE;--line2:#EEF0F5;--soft:#F8F9FC;--hov:#FAFBFD;--sel:#FFF8E1;--gold:#F0B429;--navy:#131826;--shadow:0 1px 2px rgba(19,24,38,.05),0 6px 18px rgba(19,24,38,.05)}
.adm[data-theme=dark]{--bg:#0D1018;--card:#171B26;--ink:#F1F2F6;--mut:#9AA0B4;--line:#2A2F3D;--line2:#222735;--soft:#1B202C;--hov:#1B202C;--sel:#2C2714;--shadow:none}
html:has(.adm),body:has(.adm){background:#F4F5F9 !important;margin:0}
html:has(.adm[data-theme=dark]),body:has(.adm[data-theme=dark]){background:#0D1018 !important}
.adm{display:flex;min-height:100vh;min-height:100dvh;background:var(--bg);color:var(--ink);font-family:Cairo,Tahoma,sans-serif}
.adm *{box-sizing:border-box}
.adm button,.adm input,.adm textarea,.adm select{font-family:inherit;color:inherit}
.adm :focus-visible{outline:2px solid var(--gold);outline-offset:2px}
.muted{color:var(--mut)}
.sb{width:236px;flex:none;background:var(--navy);padding:20px 12px;display:flex;flex-direction:column;gap:4px;position:sticky;top:0;height:100vh;overflow:auto}
.brand{display:flex;align-items:center;gap:10px;padding:2px 8px 20px}
.logo{width:42px;height:42px;border-radius:12px;background:#000;overflow:hidden;display:grid;place-items:center;flex:none;border:1px solid var(--line)}.logo img,.av img{width:100%;height:100%;object-fit:cover;display:block}
.bt{display:flex;flex-direction:column;line-height:1.3}.bt b{color:#fff;font-size:17px}.bt span{color:#9AA0B4;font-size:12px}
.ni{display:flex;align-items:center;gap:12px;width:100%;padding:0 14px;border-radius:12px;color:#C9CCD6;background:transparent;border:0;font-weight:600;font-size:14.5px;min-height:46px;cursor:pointer;text-align:right;position:relative}
.ni:hover{background:#1F2535;color:#fff}
.ni.on{background:var(--gold);color:#16181F;font-weight:700}
.ni.on::after{content:"";position:absolute;inset-inline-end:-12px;top:8px;bottom:8px;width:4px;border-radius:4px 0 0 4px;background:var(--gold)}
.nb{margin-inline-start:auto;background:#E5534B;color:#fff;border-radius:99px;font-size:12px;padding:1px 8px}
.sbf{margin-top:auto;display:flex;flex-direction:column;gap:10px;padding-top:12px}
.cty{border:1px solid #2A3042;color:#C9CCD6;border-radius:12px;padding:8px 12px;font-size:13px;font-weight:600}
.sw{display:flex;align-items:center;justify-content:center;gap:10px;background:transparent;border:0;color:#C9CCD6;cursor:pointer;min-height:36px}
.sk{width:40px;height:22px;border-radius:99px;background:var(--gold);position:relative;display:block}
.sk i{position:absolute;top:3px;inset-inline-start:3px;width:16px;height:16px;border-radius:50%;background:#16181F}
.sw[aria-checked=true] .sk i{inset-inline-start:21px}
.ct{flex:1;min-width:0;display:flex;flex-direction:column}
.tp{display:flex;align-items:center;gap:12px;margin:16px 28px 0;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:8px 14px;box-shadow:var(--shadow)}
.tsr{flex:1;max-width:520px;display:flex;align-items:center;gap:10px;background:var(--bg);border:1px solid var(--line);border-radius:99px;padding:0 16px;min-height:42px;color:var(--mut)}
.tsr input{border:0;outline:0;background:transparent;flex:1;min-width:0;font-size:14px}
.tp .ib.bell{margin-inline-start:auto;position:relative}
.bb{position:absolute;top:-4px;inset-inline-start:-4px;background:#E5534B;color:#fff;border-radius:99px;font-size:11px;font-weight:700;padding:0 6px;min-width:18px;line-height:18px}
.sepv{width:1px;height:26px;background:var(--line)}
.adc{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px}
.av{width:34px;height:34px;border-radius:50%;background:#000;overflow:hidden;display:grid;place-items:center;flex:none}
.mn{padding:18px 28px 230px;display:flex;flex-direction:column;gap:18px;max-width:1400px;width:100%}
.crumb{display:flex;align-items:center;gap:8px;color:var(--mut);font-size:13px}
.ph{display:flex;align-items:center;gap:12px}
.h1{margin:0;font-size:30px;font-weight:800;display:flex;align-items:center;gap:12px;line-height:1.3}
.gb{width:5px;height:1.1em;border-radius:3px;background:var(--gold);display:inline-block;flex:none}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.sc{--c:#7F77DD;--b:#EEEDFE;display:grid;grid-template-columns:1fr auto;grid-template-areas:"sx si" "sd sp";gap:10px 12px;align-items:center;text-align:right;background:linear-gradient(160deg,var(--b),var(--card) 85%);border:1.5px solid var(--line);border-radius:18px;padding:16px;cursor:pointer;box-shadow:var(--shadow)}
.sc.p{--c:#7F77DD;--b:#EEEDFE}.sc.a{--c:#EF9F27;--b:#FFF3D3}.sc.b{--c:#378ADD;--b:#E2EEFC}.sc.g{--c:#2DBE7E;--b:#DFF5EA}.sc.r{--c:#E5534B;--b:#FCE5E3}
.adm[data-theme=dark] .sc{--b:color-mix(in srgb,var(--c) 16%,var(--card))}
.sc.on{border-color:var(--c)}
.si{grid-area:si;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 20%,transparent);color:var(--c)}
.sx{grid-area:sx;display:flex;flex-direction:column;line-height:1.25}
.sl{font-size:14px;font-weight:600;color:var(--mut)}
.sn{font-size:32px;font-weight:800}
.sd{grid-area:sd;font-size:13px;font-weight:700;color:var(--mut)}.sd.pos{color:#14803F}.sd.neg{color:#C2362E}
.spark{grid-area:sp;width:100%;height:30px}
.sh2{grid-column:1/-1;grid-row:2;font-size:13px;color:var(--mut);font-weight:600}
.tc{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);padding-bottom:4px}
.th{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:16px}
.tt{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:800}
@keyframes admspin{to{transform:rotate(360deg)}}
.chips{display:flex;gap:6px;flex-wrap:wrap;flex:1}
.fc{border:0;background:var(--soft);color:var(--mut);border-radius:99px;padding:0 14px;min-height:36px;font-size:13.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.fc .fn{font-size:12px;opacity:.8}
.fc.on{background:#FFF1CC;color:#7A5200}
.adm[data-theme=dark] .fc.on{background:#3A3014;color:#F0B429}
.tools{display:flex;align-items:center;gap:8px}
.dd{position:relative}
.trg{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;min-height:38px;border:1px solid var(--line);background:var(--card);border-radius:10px;padding:4px 10px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}
.trg:hover{border-color:#C9CCD6}
.trg.st{border:0;border-radius:99px;font-weight:700;justify-content:center;gap:6px;min-height:34px}
.tr{display:inline-flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis}
.menu{position:absolute;top:calc(100% + 6px);inset-inline-start:0;min-width:180px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:6px;z-index:30;box-shadow:0 12px 32px rgba(19,24,38,.18)}
.menu.up{top:auto;bottom:calc(100% + 6px)}
.it{display:flex;align-items:center;gap:8px;width:100%;border:0;background:transparent;text-align:right;padding:0 10px;min-height:40px;border-radius:9px;font-size:14px;font-weight:600;cursor:pointer}
.it:hover{background:var(--soft)}
.tbl{border-top:1px solid var(--line2)}
.empty{padding:40px 20px;text-align:center}
.row{display:grid;align-items:center;gap:12px;padding:12px 16px;border-top:1px solid var(--line2);font-size:14.5px;cursor:pointer}
.row.hd{border-top:0;font-size:13px;color:var(--mut);font-weight:700;background:var(--soft);cursor:default;padding-top:11px;padding-bottom:11px}
.row.sel{background:var(--sel)}
.row:not(.hd):not(.sel):hover{background:var(--hov)}
.tg{grid-template-columns:96px minmax(0,1.5fr) 140px 116px 120px 132px 150px}
.mg{grid-template-columns:30px minmax(0,1.7fr) 110px 92px minmax(0,1.35fr) minmax(0,1.05fr) 134px}
.c-ph,.c-dt{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:13.5px}
.c-ph{justify-content:flex-end}
.cname,.lk{font-weight:700}
.lk{background:none;border:0;padding:0;cursor:pointer;font-size:14.5px;text-align:right}
.lk:hover{text-decoration:underline}
.sub{font-size:12.5px;margin-top:2px}
.only-n{display:none;margin-inline-start:6px}
.c-ac{display:flex;justify-content:flex-end;cursor:default}
.vw{display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:10px;min-height:36px;padding:0 12px;font-size:13px;font-weight:600;cursor:pointer}
.vw:hover{border-color:var(--gold)}
.pill{display:inline-block;border-radius:99px;font-weight:700;white-space:nowrap;font-size:12.5px;padding:4px 12px}
.trk{display:inline-flex;gap:6px;align-items:center;direction:ltr;font-size:13px;font-weight:700}
.ck{width:22px;height:22px;border-radius:6px;border:1.5px solid var(--mut);display:grid;place-items:center;padding:0;cursor:pointer;color:#16181F}
.dots{display:inline-flex;gap:3px}.dots i{width:8px;height:8px;border-radius:50%;background:var(--line);display:inline-block}.dots i.f{background:var(--gold)}
.ib{width:42px;height:42px;flex:none;border-radius:12px;border:1px solid var(--line);background:var(--card);display:grid;place-items:center;cursor:pointer}
.ib.sm{width:36px;height:36px;border-radius:10px}
.ib.dark{background:#2E3140;border-color:#2E3140;color:#fff}
.ib:disabled{opacity:.4;cursor:not-allowed}
.pri{background:#16181F;color:var(--gold);border:0;border-radius:12px;min-height:42px;padding:0 18px;font-weight:700;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}
.adm[data-theme=dark] .pri{background:#2A2F3D}
.pri.gold,.adm[data-theme=dark] .pri.gold{background:var(--gold);color:#16181F}
.pri.big{font-size:16px;min-height:50px}.pri.sm{min-height:36px;padding:0 12px;font-size:13px;width:100%}
.pri:disabled{opacity:.5;cursor:not-allowed}
.ln{border:1.5px solid #4B3A8C;color:#4B3A8C;background:transparent;border-radius:10px;min-height:36px;padding:0 10px;font-size:13px;font-weight:700;width:100%;cursor:pointer}
.adm[data-theme=dark] .ln{color:#B7A9F0;border-color:#8F7FD6}
.chip{border:1px solid var(--line);background:var(--card);border-radius:99px;padding:0 16px;min-height:44px;font-size:14.5px;font-weight:600;cursor:pointer;white-space:nowrap}
.chip.on{background:#16181F;color:#fff;border-color:#16181F}
.chip.on.gold{background:var(--gold);color:#16181F;border-color:var(--gold)}
.chip.lnk{display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.chip:disabled{opacity:.5;cursor:not-allowed}
.pg{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid var(--line2);font-size:13.5px}
.bulk{position:sticky;bottom:16px;align-self:center;display:flex;align-items:center;gap:12px;background:#16181F;color:#fff;border-radius:16px;padding:8px 10px 8px 18px;font-weight:600;z-index:10}
.dr{position:fixed;top:0;bottom:0;left:0;width:min(420px,100%);background:var(--card);border-inline-end:1px solid var(--line);padding:22px;overflow:auto;z-index:40;transform:translateX(-102%);visibility:hidden;transition:transform .25s,visibility 0s .25s}
.dr.open{transform:none;visibility:visible;transition:transform .25s,visibility 0s}
.bd{display:none}.bd.open{display:block;position:fixed;inset:0;background:rgba(19,24,38,.5);z-index:35}
.sec{margin-top:18px;padding-top:18px;border-top:1px solid var(--line2);font-size:15px}
.sh{font-weight:800;margin-bottom:6px}
.kv{display:flex;justify-content:space-between;gap:12px;padding:5px 0}.kv span{color:var(--mut)}
.alert{margin-top:16px;border-radius:14px;padding:12px 14px;font-size:14px;font-weight:600;line-height:1.7}
.alert.v{background:#E6E0F7;color:#4B3A8C}.alert.r{background:#FBE0DE;color:#9B2C25}.alert.g{background:#ECE9E0;color:#4A4F60}
.dt{margin-top:14px;border-top:1px solid var(--line2);padding-top:12px}
.dt summary{cursor:pointer;font-weight:700;min-height:32px}
.ta{display:block;width:100%;margin-top:10px;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:10px;font-size:14px;resize:none}
.ov{position:fixed;inset:0;background:rgba(19,24,38,.55);display:grid;place-items:center;padding:16px;z-index:50}
.md{width:100%;max-width:520px;max-height:94vh;overflow:auto;background:var(--bg);border-radius:22px;padding:22px}
.lbl{font-weight:700;font-size:14px;margin:18px 0 8px}
.seg{display:flex;gap:8px;flex-wrap:wrap}.seg .chip{flex:1}
.mrow{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card);cursor:pointer}
.fl{display:flex;flex-direction:column;gap:6px;margin-top:14px;font-weight:700;font-size:14px}
.inp{min-height:46px;border:1px solid var(--line);border-radius:12px;background:var(--card);padding:0 14px;font-size:15px;font-weight:400}
.er{color:#C2362E;font-weight:600;font-size:12.5px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#16181F;color:#fff;border-radius:14px;padding:12px 20px;font-weight:700;z-index:60;max-width:92vw}
.tl{list-style:none;margin:10px 0 0;padding:0;display:flex}
.tl li{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12.5px;color:var(--mut);position:relative;text-align:center}
.tl li::before{content:"";position:absolute;top:11px;inset-inline-start:50%;width:100%;height:2px;background:var(--line)}
.tl li:last-child::before{display:none}
.tl li.done{color:var(--ink);font-weight:700}
.tl li.done:has(+ li.done)::before{background:var(--gold)}
.dotl{position:relative;z-index:1;width:22px;height:22px;border-radius:50%;background:var(--line);display:grid;place-items:center;color:#16181F}
.tl li.done .dotl{background:var(--gold)}
.gate{align-items:center;justify-content:center;padding:16px}
.gt{width:100%;max-width:400px;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:var(--shadow)}
.bn{display:none}
.bi{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#C9CCD6;background:transparent;border:0;font-size:11.5px;font-weight:600;min-height:48px;cursor:pointer}.bi.on{color:var(--gold)}
@media(max-width:1180px){
  .sb{width:76px;padding:20px 10px;align-items:center}
  .bt,.nl,.cty,.sw .sk{display:none}
  .ni{justify-content:center;padding:0}.ni .nb{position:absolute;top:4px;inset-inline-start:2px;margin:0;padding:0 5px;font-size:11px}
  .ni.on::after{display:none}
  .brand{padding:2px 0 20px}
  .sw{flex-direction:column;gap:6px}
  .cards{grid-template-columns:repeat(2,1fr)}
  .tg{grid-template-columns:80px minmax(0,1.4fr) 112px 120px 130px 140px}
  .tg .c-ph,.row.hd.tg>span:nth-child(3){display:none}
  .mg{grid-template-columns:30px minmax(0,1.7fr) 100px minmax(0,1.3fr) minmax(0,1fr) 130px}
  .mg .c-ti{display:none}.only-n{display:inline-block}
  .tp,.mn{margin-inline:20px}.tp{margin-inline:20px}.mn{padding-inline:20px}
}
@media(max-width:860px){
  .sb{display:none}
  .bn{display:flex;position:fixed;bottom:0;left:0;right:0;background:var(--navy);padding:6px 8px 10px;gap:4px;z-index:20}
  .tp{margin:12px 14px 0}.tp .sepv,.tp .adc{display:none}
  .mn{padding:14px 14px 100px}.h1{font-size:24px}
  .ph{flex-wrap:wrap}.add{width:100%}
  .cards{gap:10px}.sn{font-size:26px}
  .row.hd{display:none}
  .row{margin:10px;border:1px solid var(--line2);border-radius:16px;gap:8px 12px}
  .tg{grid-template-columns:1fr auto;grid-template-areas:"id st" "cu cu" "dt am" "ph ph" "ac ac"}
  .tg .c-ph{display:flex;justify-content:flex-start}
  .tg .c-id{grid-area:id}.tg .c-cu{grid-area:cu}.tg .c-dt{grid-area:dt}.tg .c-am{grid-area:am;text-align:left}.tg .c-st{grid-area:st}.tg .c-ph{grid-area:ph}.tg .c-ac{grid-area:ac}
  .tg .vw{width:100%;justify-content:center}
  .mg{grid-template-columns:1fr 1fr;grid-template-areas:"cu cu" "am ti" "cl st" "ac ac"}
  .mg .ck{display:none}.mg .c-cu{grid-area:cu}.mg .c-am{grid-area:am}.mg .c-ti{grid-area:ti;display:block;text-align:left}.mg .c-cl{grid-area:cl}.mg .c-st{grid-area:st}.mg .c-ac{grid-area:ac}
  .only-n{display:none}
  .c-ac .pri,.c-ac .ln{width:100%}
  .bulk{bottom:84px}.toast{bottom:90px}
  .tl{margin-top:14px}
}
@media(prefers-reduced-motion:reduce){.adm *{transition:none!important;animation:none!important}}
.sb a.ni,.bn a.bi,.sb a.ni:hover{text-decoration:none}
.crumb a{color:inherit;text-decoration:none}.crumb a:hover{text-decoration:underline}
.hm{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}
.hl{display:flex;align-items:center;gap:14px;background:var(--card);border:1.5px solid var(--line);border-radius:18px;padding:18px;box-shadow:var(--shadow);color:inherit;text-decoration:none}
.hl:hover{border-color:var(--gold)}
.hl .si2{width:50px;height:50px;border-radius:14px;background:var(--navy);color:var(--gold);display:grid;place-items:center;flex:none}
.hl b{display:block;font-size:16px}.hl small{color:var(--mut);font-size:13px}
.hl .hn{margin-inline-start:auto;font-size:26px;font-weight:800}
`;
