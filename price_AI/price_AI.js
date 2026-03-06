/**
 * html 조각 로드 (탑 배너용)
 */
async function includeHTML(targetSelector, filePath) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  try {
    const res = await fetch(filePath);
    if (!res.ok) return;
    const html = await res.text();
    target.innerHTML = html;
  } catch (err) {
    console.error("배너 로드 실패:", err);
  }
}

/** 슬라이더 지점 라벨 */
const SLIDER_LABELS = ["옵션 1", "옵션 2", "옵션 3", "옵션 4", "옵션 5", "옵션 6"];

/** 샘플 카드 데이터 */
const TOOL_CARDS = [
  { toolName: "Chat GPT",      price: "$35/월", url: "/detail_AI/detail_AI.html" },
  { toolName: "Claude",        price: "$40/월", url: "/detail_AI/detail_AI.html" },
  { toolName: "Flexclip",      price: "$45/월", url: "/detail_AI/detail_AI.html" },
  { toolName: "Adobe Firefly", price: "$50/월", url: "/detail_AI/detail_AI.html" },
  { toolName: "Descript",      price: "$55/월", url: "/detail_AI/detail_AI.html" },
];

/**
 * 가격 카드 렌더링
 */
function renderToolCards() {
  const grid = document.querySelector("#toolCardGrid");
  if (!grid) return;
  grid.innerHTML = "";

  TOOL_CARDS.forEach((tool, index) => {
    const card = document.createElement("article");
    card.className = "tool-price-card";

    const iconWrap = document.createElement("div");
    iconWrap.className = "tool-price-card__icon";
    const iconMount = document.createElement("div");
    iconMount.id = `toolPriceIconMount${index + 1}`;
    iconWrap.appendChild(iconMount);

    const bottom = document.createElement("div");
    bottom.className = "tool-price-card__bottom";

    const price = document.createElement("div");
    price.className = "tool-price-card__price";
    price.textContent = tool.price;

    const more = document.createElement("a");
    more.className = "tool-price-card__more";
    more.href = tool.url || "#";
    more.textContent = "더보기 >";

    bottom.append(price, more);
    card.append(iconWrap, bottom);
    grid.appendChild(card);

    if (typeof window.loadToolIconCard === "function") {
      window.loadToolIconCard(`#${iconMount.id}`, {
        toolName: tool.toolName,
        url: tool.url || "#",
      });
    }
  });
}

/**
 * 슬라이더 초기화
 */
function initStepSlider() {
  const sliderRoot = document.querySelector("#stepSlider");
  const labelsWrap = document.querySelector(".price-filter__labels");
  const track      = document.querySelector(".price-filter__track");
  const fill       = document.querySelector("#sliderFill");
  const thumb      = document.querySelector("#sliderThumb");
  const hint       = document.querySelector("#sliderHint");

  if (!sliderRoot || !thumb || !track || !fill || !labelsWrap) return;

  const maxStep = SLIDER_LABELS.length - 1;
  let isDragging = false;
  let stepPositions = [];
  let currentStep = 0;

  // ── 라벨 생성 (텍스트를 <span>으로 감쌈 → CSS 말풍선 적용 대상)
  labelsWrap.innerHTML = "";
  SLIDER_LABELS.forEach((label, i) => {
    const el = document.createElement("div");
    el.className = "price-filter__step-label";
    el.innerHTML = `<span>${label}</span>`;
    el.addEventListener("click", () => render(i));
    labelsWrap.appendChild(el);
  });

  // ── dot 생성
  sliderRoot.querySelectorAll(".price-filter__dot").forEach(d => d.remove());
  const dotEls = SLIDER_LABELS.map((_, i) => {
    const el = document.createElement("div");
    el.className = "price-filter__dot";
    el.addEventListener("click", (e) => { e.stopPropagation(); render(i); });
    sliderRoot.appendChild(el);
    return el;
  });

  // ── 라벨 중앙 x를 슬라이더 기준으로 계산
  function calcStepPositions() {
    const sliderRect = sliderRoot.getBoundingClientRect();
    const labelNodes = labelsWrap.querySelectorAll(".price-filter__step-label");
    stepPositions = Array.from(labelNodes).map(el => {
      const r = el.getBoundingClientRect();
      return (r.left + r.width / 2) - sliderRect.left;
    });
  }

  // ── 트랙·dot 레이아웃
  function layoutTrack() {
    calcStepPositions();
    if (stepPositions.length < 2) return;

    const first = stepPositions[0];
    const last  = stepPositions[stepPositions.length - 1];

    track.style.left  = first + "px";
    track.style.width = (last - first) + "px";
    fill.style.left   = first + "px";

    dotEls.forEach((d, i) => {
      d.style.left = stepPositions[i] + "px";
    });
  }

  // ── UI 렌더
  function render(step) {
    currentStep = Math.max(0, Math.min(maxStep, step));

    const px    = stepPositions[currentStep];
    const first = stepPositions[0];

    // thumb
    thumb.style.left = px + "px";

    // fill
    fill.style.width = Math.max(0, px - first) + "px";

    // dots
    dotEls.forEach((d, i) => {
      d.classList.toggle("is-right", i > currentStep);
    });

    // 라벨 - is-active 토글 (CSS가 말풍선으로 바꿔줌)
    labelsWrap.querySelectorAll(".price-filter__step-label").forEach((l, i) => {
      l.classList.toggle("is-active", i === currentStep);
    });

    if (hint) hint.textContent = `현재 선택: ${SLIDER_LABELS[currentStep]}`;
  }

  // ── 가장 가까운 스텝 찾기
  function clientXToStep(clientX) {
    const rect = sliderRoot.getBoundingClientRect();
    const x = clientX - rect.left;
    let closest = 0, minDist = Infinity;
    stepPositions.forEach((pos, i) => {
      const d = Math.abs(pos - x);
      if (d < minDist) { minDist = d; closest = i; }
    });
    return closest;
  }

  // ── 이벤트
  thumb.addEventListener("pointerdown", (e) => {
    isDragging = true;
    thumb.setPointerCapture(e.pointerId);
  });

  window.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    render(clientXToStep(e.clientX));
  });

  window.addEventListener("pointerup", () => { isDragging = false; });

  sliderRoot.addEventListener("click", (e) => {
    if (e.target.closest(".price-filter__thumb")) return;
    render(clientXToStep(e.clientX));
  });

  // ── 초기화 & 리사이즈
  function init() {
    layoutTrack();
    render(0);
  }

  init();
  window.addEventListener("resize", () => {
    layoutTrack();
    render(currentStep);
  });
}

// ✅ DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initStepSlider();
  renderToolCards();
});