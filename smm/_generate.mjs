import fs from "fs";
import path from "path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const base = fs.readFileSync(path.join(DIR, "_base.html"), "utf8");

const VIDEO = {
  mainframe: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4",
  prisma:    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4",
  wanderful: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260510_060007_60275ce7-030c-4668-a160-8f364ec537d3.mp4",
};

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

for (const [key, v] of Object.entries(variants)) {
  let html = base;

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
