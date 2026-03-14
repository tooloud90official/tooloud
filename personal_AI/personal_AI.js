/**
 * html 조각 로드 (탑 배너용)
 */
async function includeHTML(targetSelector, filePath) {
  const target = document.querySelector(targetSelector);
  if (!target) throw new Error(`[includeHTML] target not found: ${targetSelector}`);

  const res = await fetch(filePath);
  if (!res.ok) throw new Error(`[includeHTML] failed to load: ${filePath} (${res.status})`);

  const html = await res.text();
  target.insertAdjacentHTML("beforeend", html);
}

/**
 * 아이콘 컴포넌트 mount 생성 후 loadToolIconCard 호출
 */
function renderToolIcons(targetSelector, tools) {
  const container = document.querySelector(targetSelector);
  if (!container) return;

  if (typeof window.loadToolIconCard !== "function") {
    console.warn("loadToolIconCard not found. /_common/icon/icon.js 확인");
    return;
  }

  container.innerHTML = "";

  tools.forEach((tool, index) => {
    const mount = document.createElement("div");
    mount.className = "tool-icon-mount";

    const mountId = `${targetSelector.replace("#", "")}-icon-${index + 1}`;
    mount.id = mountId;

    container.appendChild(mount);

    window.loadToolIconCard(`#${mountId}`, {
      toolName: tool.toolName,
      url: tool.url || "#",
      onClick: tool.onClick || undefined
    });
  });
}

/* 샘플 데이터 */
const recommendedTools = [
  { toolName: "Chat GPT",     url: "/detail_AI/detail_AI.html" },
  { toolName: "Claude",       url: "/detail_AI/detail_AI.html" },
  { toolName: "Gemini",       url: "/detail_AI/detail_AI.html" },
  { toolName: "툴 #1",        url: "/detail_AI/detail_AI.html" },
  { toolName: "Midjourney",   url: "/detail_AI/detail_AI.html" },
  { toolName: "Gamma",        url: "/detail_AI/detail_AI.html" },
  { toolName: "Perplexity AI",url: "/detail_AI/detail_AI.html" },
  { toolName: "툴 #1",        url: "/detail_AI/detail_AI.html" }
];

const recentTools = [
  { toolName: "Chat GPT",     url: "/detail_AI/detail_AI.html" },
  { toolName: "Claude",       url: "/detail_AI/detail_AI.html" },
  { toolName: "Gemini",       url: "/detail_AI/detail_AI.html" },
  { toolName: "툴 #1",        url: "/detail_AI/detail_AI.html" },
  { toolName: "Midjourney",   url: "/detail_AI/detail_AI.html" },
  { toolName: "Gamma",        url: "/detail_AI/detail_AI.html" },
  { toolName: "Perplexity AI",url: "/detail_AI/detail_AI.html" },
  { toolName: "툴 #1",        url: "/detail_AI/detail_AI.html" }
];

const favoriteTools = [
  { toolName: "Chat GPT",     url: "/detail_AI/detail_AI.html" },
  { toolName: "Claude",       url: "/detail_AI/detail_AI.html" },
  { toolName: "Gemini",       url: "/detail_AI/detail_AI.html" },
  { toolName: "툴 #1",        url: "/detail_AI/detail_AI.html" },
  { toolName: "Midjourney",   url: "/detail_AI/detail_AI.html" },
  { toolName: "Gamma",        url: "/detail_AI/detail_AI.html" },
  { toolName: "Perplexity AI",url: "/detail_AI/detail_AI.html" },
  { toolName: "툴 #1",        url: "/detail_AI/detail_AI.html" }
];

// ===== hash 스크롤 처리 =====
function scrollToHash() {
  const hash = window.location.hash?.replace('#', '');
  if (!hash) return;

  const target = document.getElementById(hash);
  if (target) {
    // top-banner 높이(75px)만큼 오프셋 보정
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    renderToolIcons("#recommendedTools", recommendedTools);
    renderToolIcons("#recentTools", recentTools);
    renderToolIcons("#favoriteTools", favoriteTools);

    // 아이콘 렌더 완료 후 스크롤 (비동기 로드 감안해 약간 대기)
    setTimeout(scrollToHash, 400);

  } catch (err) {
    console.error("[personal_AI] 초기화 실패:", err);
  }
});