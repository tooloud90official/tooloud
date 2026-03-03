/* 공통 include 함수 */
async function includeHTML(selector, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.querySelector(selector).innerHTML = html;
}


// 상세 페이지 이동 연결
function bindDetailNavigation() {

  document.querySelectorAll(".tool-card").forEach(card => {

    const detailBtn = card.querySelector(".detail");
    const url = card.dataset.url;

    if (!detailBtn || !url) return;

    detailBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.location.href = url;
    });

  });

}

async function initPage() {

  await includeHTML('#top-banner', '/_common/top-banner/top-banner.html');
  await includeHTML('#searchBar', '/_common/searchBar/searchBar.html');

  await loadToolIconCard('#toolIcon-chatgpt', { toolName: "ChatGPT" });
  await loadToolIconCard('#toolIcon-midjourney', { toolName: "Midjourney" });
  await loadToolIconCard('#toolIcon-notionai', { toolName: "Notion AI" });
  await loadToolIconCard('#toolIcon-runway', { toolName: "Runway" });
  await loadToolIconCard('#toolIcon-copilot', { toolName: "GitHub Copilot" });
  await loadToolIconCard('#toolIcon-canva', { toolName: "Canva AI" });

  bindDetailNavigation();
}

document.addEventListener("DOMContentLoaded", initPage);