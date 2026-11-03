/* ============================================================
   铜陵旅游指导网站 — 交互脚本
   ============================================================ */

/* ---------- 配图资源（文生图接口，按 key 注入到页面） ---------- */
const IMG_BASE = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?image_size=landscape_16_9&prompt=";
const IMG = {
  hero: "panoramic view of Tongling city along the Yangtze River at golden sunset, bronze culture sculpture, green mountains and misty river, cinematic aerial photography",
  attractionsHero: "aerial view of a great bend of the Yangtze River with an ancient Hui-style town and green misty mountains at dawn, cinematic",
  foodHero: "lavish table of Anhui Chinese cuisine, braised river fish in clay pot, spiced dried tofu, candied white ginger, rising steam, warm lantern light",
  guideHero: "white high-speed train crossing a cable-stayed bridge over the Yangtze River at dusk, blue hour, long exposure, cinematic",
  cta: "ancient Chinese bronze ritual vessel silhouette against dramatic Yangtze River sunset and misty mountains, artistic composition",

  datong: "ancient Chinese riverside old street named Datong, Hui-style white walls dark tiles and horse-head gables, glistening bluestone road, red lanterns, morning mist, quiet tourists",
  heyue: "sandbar island in the Yangtze River, old village, golden reed marsh, wooden ferry boat, autumn sunset, peaceful",
  porpoise: "Yangtze finless porpoise leaping out of blue river water, splashing droplets, wildlife photography, golden sunlight",
  tianjing: "serene city lake park, zigzag nine-bend stone bridge over the lake, willow trees, traditional pavilion, cherry blossoms, calm reflection",
  fushan: "ancient volcanic rocky peaks with strange rock formations above a sea of clouds, Buddhist temple cliff, pine trees, Chinese mountain landscape",
  fenghuang: "vast hillside field of blooming white and purple tree peonies in spring, distant green mountains, tourists walking, sunny",
  xihu: "urban wetland park, curving wooden boardwalk over lake water, reeds, a white egret flying, blue sky with soft clouds",
  binjiang: "modern riverside ecological park at sunset, glass waterfront book house by the Yangtze, wooden walkway, locals strolling",
  museum: "grand bronze museum interior, ancient Chinese bronze ritual vessels and tripod cauldrons in glass display cases, dramatic spotlights",
  yongquan: "elegant Jiangnan classical garden, koi pond, Taihu rockery, covered corridor, white walls, plum blossoms in spring",
  liqiao: "Chinese water town at night, Hui-style buildings with glowing red lanterns reflected in the canal, black-awning boat, spectacular molten iron firework sparks",
  tongguanshan: "renovated old copper mining industrial heritage site, rust-colored mining headframe, modern cafes and street art, young visitors, blue sky",
  wutong: "colorful flower valley in full bloom, glass water slide winding through green hills, families playing, clear blue sky",
  jinniudong: "ancient underground copper mine archaeological site, stone mining pit with old wooden supports, interpretive plaques, soft light",
  diaosculpture: "international bronze sculpture art park, contemporary polished bronze statues on green lawn, visitors, modern city background",
  diaoaoshan: "bizarre granite peaks of Daiao Mountain emerging from mist, ancient village and terraced fields below, Chinese landscape",

  ginger: "candied Tongling white ginger slices, translucent golden, served in a blue and white porcelain bowl on rustic bamboo table, soft light",
  chagan: "Chinese spiced dried tea tofu squares stacked in bamboo steamer, glossy brown savory glaze, sesame, traditional snack",
  riverfish: "braised Yangtze-style river fish in rich brown sauce in an earthen clay pot, scallions and chili, rising steam, Chinese home cooking",
  sesameoil: "traditional stone-ground sesame oil pouring into a small glass bottle, roasted sesame seeds and old stone mill, rustic kitchen",
  sutang: "traditional Chinese peanut and sesame crisp candy bars stacked on a ceramic plate, warm tones, close up",
  noodles: "bowl of Chinese beef noodle soup with cilantro and red chili oil, chopsticks, steam, wooden table",
  zongyangduck: "braised Zongyang free-range duck, glossy amber sauce, clay plate, scallions garnish, Chinese banquet dish",
  heizhu: "Anhui Zongyang black pork braised pork belly chunks glazed in soy sauce, Chinese clay pot, star anise",
  fengdan: "dried medicinal Fengdan tree peony root bark in a wooden bowl beside fresh white peony flowers, herbal still life",
  bronzeCraft: "intricate traditional Chinese bronze handicraft vase in a craftsman workshop, patina detail, warm light",
  snacks: "bustling Chinese snack street at night with red lanterns, dumplings pastries and local small eats, steam and crowds",

  seasonSpring: "spring in Tongling, blooming tree peony fields and green tea hills, soft sunlight",
  seasonSummer: "summer lotus pond in city wetland, pink lotus, egret, lush green, blue sky",
  seasonAutumn: "autumn Yangtze riverside, golden reed marshes and fishing boats, warm sunset",
  seasonWinter: "light winter snow on Hui-style ancient town rooftops, red lanterns, quiet poetic mood"
};

function imgUrl(key) { return IMG_BASE + encodeURIComponent(IMG[key] || key); }

/* 注入 <img data-img="key"> 与背景图容器 [data-img-bg="key"] */
document.querySelectorAll("img[data-img]").forEach((el) => {
  el.loading = el.getAttribute("loading") || "lazy";
  el.src = imgUrl(el.dataset.img);
  el.alt = el.alt || "";
  el.addEventListener("error", () => el.classList.add("img-fail"));
});
document.querySelectorAll("[data-img-bg]").forEach((el) => {
  el.style.backgroundImage = `url("${imgUrl(el.dataset.imgBg)}")`;
  el.style.backgroundSize = "cover";
  el.style.backgroundPosition = "center";
});

/* ---------- 导航：滚动变色 / 移动端菜单 ---------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");

function onScrollNav() {
  if (!nav) return;
  const overHero = window.scrollY < 80;
  nav.classList.toggle("scrolled", !overHero);
  const toTop = document.getElementById("toTop");
  if (toTop) toTop.classList.toggle("show", window.scrollY > 500);
}
window.addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

if (navToggle) {
  navToggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );
}

/* ---------- 滚动显现动画 ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* ---------- 景点分类筛选 ---------- */
const filterBtns = document.querySelectorAll(".filter-btn");
if (filterBtns.length) {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      document.querySelectorAll(".spot-card[data-cat]").forEach((card) => {
        const cats = card.dataset.cat.split(/\s+/);
        const show = cat === "all" || cats.includes(cat);
        card.classList.toggle("hidden", !show);
      });
    });
  });
}

/* ---------- 景点详情弹层 ---------- */
let modal = null;
function ensureModal() {
  if (modal) return modal;
  modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "spotModal";
  modal.innerHTML = `
    <div class="modal-mask"></div>
    <div class="modal-box" role="dialog" aria-modal="true">
      <button class="modal-close" aria-label="关闭">✕</button>
      <div class="modal-media"><img alt=""></div>
      <div class="modal-body">
        <div class="m-tag"></div>
        <h3></h3>
        <div class="m-loc"></div>
        <p class="m-text"></p>
        <div class="modal-facts">
          <div class="m-fact"><b>门票参考</b><span class="f-ticket"></span></div>
          <div class="m-fact"><b>建议游玩</b><span class="f-duration"></span></div>
          <div class="m-fact"><b>最佳时段</b><span class="f-best"></span></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-mask") || e.target.classList.contains("modal-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  return modal;
}
function openModal(card) {
  const d = card.dataset;
  const m = ensureModal();
  m.querySelector(".m-tag").textContent = d.mTag || "";
  m.querySelector("h3").textContent = d.mName || "";
  m.querySelector(".m-loc").textContent = d.mLoc ? "📍 " + d.mLoc : "";
  m.querySelector(".m-text").textContent = d.mText || "";
  m.querySelector(".f-ticket").textContent = d.mTicket || "以景区公告为准";
  m.querySelector(".f-duration").textContent = d.mDuration || "1–2 小时";
  m.querySelector(".f-best").textContent = d.mBest || "四季皆宜";
  const img = m.querySelector(".modal-media img");
  img.src = imgUrl(d.mImg || "datong");
  img.alt = d.mName || "";
  m.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
  history.replaceState(null, "", location.pathname + location.search);
}
document.querySelectorAll(".spot-card[data-m-name]").forEach((card) => {
  card.querySelectorAll(".spot-more, .js-open").forEach((btn) =>
    btn.addEventListener("click", (e) => { e.preventDefault(); openModal(card); })
  );
});

/* 通过 URL 锚点直接打开景点详情，如 attractions.html#datong */
if (location.hash) {
  const target = document.querySelector('.spot-card[id="' + CSS.escape(location.hash.slice(1)) + '"]');
  if (target && target.dataset.mName) {
    setTimeout(() => {
      target.scrollIntoView({ block: "center" });
      openModal(target);
    }, 350);
  }
}

/* ---------- FAQ 手风琴 ---------- */
document.querySelectorAll(".acc-head").forEach((head) => {
  head.addEventListener("click", () => {
    const item = head.closest(".acc-item");
    const panel = item.querySelector(".acc-panel");
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".acc-item.open").forEach((o) => {
      o.classList.remove("open");
      o.querySelector(".acc-panel").style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add("open");
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

/* ---------- 返回顶部 ---------- */
let toTop = document.getElementById("toTop");
if (!toTop) {
  toTop = document.createElement("button");
  toTop.id = "toTop";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "返回顶部");
  toTop.innerHTML = "↑";
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(toTop);
}

/* ---------- 页脚年份 ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
