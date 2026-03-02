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

/* 페이지 초기화 */
async function initPage() {

  // 공통 컴포넌트
  await includeHTML('#top-banner', '/_common/top-banner/top-banner.html');
  await includeHTML('#searchBar', '/_common/searchBar/searchBar.html');

  // ===== 아이콘 컴포넌트 로드 =====
  await loadToolIconCard('#toolIcon-chatgpt', {
    toolName: "ChatGPT",
    url: "#"
  });

  await loadToolIconCard('#toolIcon-midjourney', {
    toolName: "Midjourney",
    url: "#"
  });

}

document.addEventListener("DOMContentLoaded", initPage);