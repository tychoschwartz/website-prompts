import fs from "fs";
import path from "path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const base = fs.readFileSync(path.join(DIR, "_base.html"), "utf8");

const VIDEO = {
  mainframe: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4",
  prisma:    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4",
  wanderful: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4",
};

/* ---- inline logo generation -------------------------------------------------
   The base references external files (logos/<handle>.<ext>) that aren't shipped
   with the HTML, so no logos show. We replace every logos/ reference with a
   self-contained SVG monogram data-URI: a distinct colour per handle (hashed)
   plus a two-letter mark, so a logo always renders in the portfolio wall, the
   case-study .clogo, the editor .lg and the phone profile picture. ---------- */
const MONOGRAM = {
  opusreality: "OR", forthinkingminds: "FM", mindsetraptors: "MR",
  thephilosophart: "PA", businessedgex: "BE", bymotivify: "MO",
  hustlingmillionaires: "HM", causewerefemales: "CW", capitalfortunes: "CF",
  inspi: "IN", adhdreacts: "AR", aroundvalue: "AV", execute: "EX",
  moneyciety: "MC", multimillionaire_mind: "MM", wordsyoulovee: "WL",
  createimprovement: "CI", victorianpoetry: "VP", vawtez: "VZ",
};
function hashInt(s){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))>>>0; } return h; }
function initials(name){
  if(MONOGRAM[name]) return MONOGRAM[name];
  const parts=name.split(/[_-]+/).filter(Boolean);
  const s=(parts.length>1? parts[0][0]+parts[1][0] : name.slice(0,2));
  return s.toUpperCase();
}
function logoDataUri(name){
  const h=hashInt(name);
  const hue=h%360, hue2=(hue+38)%360;
  // double-quoted attrs so encodeURIComponent yields a quote-free URI
  // (safe inside both src="..." and onerror="this.src='...'")
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">`+
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`+
    `<stop offset="0" stop-color="hsl(${hue},68%,54%)"/>`+
    `<stop offset="1" stop-color="hsl(${hue2},66%,30%)"/>`+
    `</linearGradient></defs>`+
    `<rect width="100" height="100" fill="url(#g)"/>`+
    `<circle cx="30" cy="26" r="34" fill="rgba(255,255,255,.14)"/>`+
    `<text x="50" y="54" text-anchor="middle" dominant-baseline="central" `+
    `font-family="Georgia, serif" font-weight="700" font-size="40" `+
    `letter-spacing="1" fill="rgba(255,255,255,.96)">${initials(name)}</text></svg>`;
  return "data:image/svg+xml,"+encodeURIComponent(svg);
}
// map handle -> actual file on disk (case differs for some)
const LOGO_FILES = {
  Forthinkingminds: "Forthinkingminds.png", forthinkingminds: "Forthinkingminds.png",
  MindsetRaptors: "MindsetRaptors.jpg", mindsetraptors: "MindsetRaptors.jpg",
};
const MIME = { jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", webp:"image/webp" };
function realLogoDataUri(name){
  const dir = path.join(DIR, "logos");
  // try known filename, then common extensions
  const candidates = [];
  if (LOGO_FILES[name]) candidates.push(LOGO_FILES[name]);
  for (const ext of ["jpg","png","webp","jpeg"]) candidates.push(name + "." + ext);
  for (const f of candidates) {
    const p = path.join(dir, f);
    if (fs.existsSync(p)) {
      const ext = f.split(".").pop().toLowerCase();
      const b64 = fs.readFileSync(p).toString("base64");
      return "data:" + (MIME[ext]||"image/jpeg") + ";base64," + b64;
    }
  }
  return null;
}
function inlineLogos(html){
  // Prefer a real logo baked in (if decoded to smm/logos/); otherwise keep the
  // logos/<file> reference so the user's own logo folder is used when present,
  // with a distinct monogram as an automatic onerror fallback for standalone use.
  return html.replace(
    /<img\b([^>]*?)src="logos\/([a-zA-Z0-9_-]+)\.([a-z0-9]+)"([^>]*?)>/g,
    (m, pre, name, ext, post) => {
      const real = realLogoDataUri(name);
      if (real) return `<img${pre}src="${real}"${post}>`;
      const mono = logoDataUri(name);
      return `<img${pre}src="logos/${name}.${ext}" onerror="this.onerror=null;this.src='${mono}'"${post}>`;
    }
  );
}

const NOISE_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/* CSS shared by every variant: video sits behind, scrim keeps text readable */
const cssCommon = `
  /* ===== prompt background injection (content from index.html is untouched) ===== */
  html{background:var(--bg);}
  #bg-video-wrap{position:fixed;inset:0;z-index:-2;overflow:hidden;background:var(--bg);}
  #bg-video{width:100%;height:100%;object-fit:cover;display:block;}
  #bg-scrim{position:fixed;inset:0;z-index:-1;pointer-events:none;}
`;

const variants = {
  mainframe: {
    title: "Schwartz Media Managing — Mainframe background",
    css: `
  #bg-video{object-position:70% center;}
  #bg-scrim{background:linear-gradient(180deg,rgba(14,14,16,.74) 0%,rgba(14,14,16,.86) 100%);}
  .bg-hint{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:40;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);opacity:.55;pointer-events:none;}
`,
    markup: `
<div id="bg-video-wrap"><video id="bg-video" muted playsinline preload="auto" src="${VIDEO.mainframe}"></video></div>
<div id="bg-scrim"></div>
<div class="bg-hint">Move your mouse to scrub the background</div>`,
    script: `
<script>
/* Mainframe: mouse-scrub background video (no autoplay) */
(function(){
  var video=document.getElementById('bg-video'); if(!video) return;
  var SENS=0.8, prevX=null, targetTime=0, seeking=false;
  function seekTo(t){ seeking=true; video.currentTime=t; }
  video.addEventListener('seeked',function(){
    seeking=false;
    if(Math.abs(video.currentTime-targetTime)>0.001) seekTo(targetTime);
  });
  window.addEventListener('mousemove',function(e){
    if(!video.duration||isNaN(video.duration)) return;
    if(prevX===null){ prevX=e.clientX; return; }
    var delta=e.clientX-prevX; prevX=e.clientX;
    var off=(delta/window.innerWidth)*SENS*video.duration;
    var t=Math.max(0,Math.min(video.duration,targetTime+off));
    targetTime=t; if(!seeking) seekTo(t);
  },{passive:true});
})();
</script>`,
  },

  prisma: {
    title: "Schwartz Media Managing — Prisma background",
    css: `
  #bg-scrim{background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,.82) 100%);}
  #bg-noise{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.5;mix-blend-mode:overlay;background-image:${NOISE_URI};}
`,
    markup: `
<div id="bg-video-wrap"><video id="bg-video" autoplay loop muted playsinline src="${VIDEO.prisma}"></video></div>
<div id="bg-noise"></div>
<div id="bg-scrim"></div>`,
    script: ``,
  },

  wanderful: {
    title: "Schwartz Media Managing — Wanderful background",
    css: `
  #bg-scrim{background:linear-gradient(180deg,rgba(10,12,16,.58) 0%,rgba(10,12,16,.8) 100%);}
  /* liquid-glass navbar to match the Wanderful aesthetic */
  nav{background:rgba(14,14,16,.32)!important;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:inset 0 1px 1px rgba(255,255,255,.08);}
`,
    markup: `
<div id="bg-video-wrap"><video id="bg-video" autoplay loop muted playsinline src="${VIDEO.wanderful}"></video></div>
<div id="bg-scrim"></div>`,
    script: `
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
/* Wanderful: GSAP mouse-parallax on the background video */
(function(){
  var wrap=document.getElementById('bg-video-wrap');
  var video=document.getElementById('bg-video');
  if(video){ video.addEventListener('loadedmetadata',function(){ video.playbackRate=1.25; }); }
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(!wrap||!window.gsap||reduce) return;
  gsap.set(wrap,{scale:1.08});
  var tx=0,ty=0,cx=0,cy=0;
  window.addEventListener('mousemove',function(e){
    var mx=window.innerWidth/2,my=window.innerHeight/2;
    tx=((e.clientX-mx)/mx)*20; ty=((e.clientY-my)/my)*20;
  },{passive:true});
  (function tick(){ cx+=(tx-cx)*0.06; cy+=(ty-cy)*0.06; gsap.set(wrap,{x:cx,y:cy}); requestAnimationFrame(tick); })();
})();
</script>`,
  },
};

const based = inlineLogos(base);

for (const [key, v] of Object.entries(variants)) {
  let html = based;

  // 1) make the page background transparent so the video shows through
  html = html.replace(
    "body{background:var(--bg);color:var(--ink);",
    "body{background:transparent;color:var(--ink);"
  );

  // 2) inject CSS just before the (single) </style>
  html = html.replace("</style>", cssCommon + v.css + "\n</style>");

  // 3) inject the background markup right after <body>
  html = html.replace("<body>\n", "<body>\n" + v.markup + "\n");

  // 4) swap the <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${v.title}</title>`
  );

  // 5) inject the variant script just before </body>
  html = html.replace("</body>", v.script + "\n</body>");

  const out = path.join(DIR, "..", `smm-${key}.html`);
  fs.writeFileSync(out, html);
  console.log("wrote", path.basename(out), "(" + html.length + " bytes)");
}
