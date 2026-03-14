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

// 정렬 적용
function applySort(sortVal) {
  const list = document.querySelector('.result-list');
  const cards = Array.from(list.querySelectorAll('.tool-card'));

  cards.sort((a, b) => {
    if (sortVal === 'name') {
      const nameA = a.querySelector('.tool-name')?.textContent.trim() || '';
      const nameB = b.querySelector('.tool-name')?.textContent.trim() || '';
      return nameA.localeCompare(nameB, 'ko');
    }
    if (sortVal === 'rating') {
      const ratingA = parseInt(a.dataset.rating || '0', 10);
      const ratingB = parseInt(b.dataset.rating || '0', 10);
      return ratingB - ratingA;
    }
    return 0;
  });

  cards.forEach(card => list.appendChild(card));
}

// 아이콘 팝업 제거: loadToolIconCard 래퍼로 confirm/alert 차단
function patchIconPopup() {
  document.querySelectorAll('.tool-icon').forEach(iconEl => {
    // icon.js가 달아둔 클릭 이벤트의 window.confirm / alert 을 막기 위해
    // 아이콘 내 모든 클릭을 캡처 단계에서 stopPropagation 없이 confirm을 패치
    iconEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    }, true);
  });
}

// 필터 초기화
async function initFilters() {
  const { loadNativeSelect } = await import('/_common/select/select.js');

  await loadNativeSelect({
    target: '#filterSelect-sort',
    placeholder: '정렬',
    options: [
      { value: 'name',   label: '이름순' },
      { value: 'rating', label: '별점순' },
    ],
    onChange: ({ value }) => applySort(value),
  });
}

async function initPage() {
  await includeHTML('#top-banner', '/_common/top-banner/top-banner.html');
  await includeHTML('#searchBar', '/_common/searchBar/searchBar.html');

  await loadToolIconCard('#toolIcon-chatgpt',    { toolName: "ChatGPT" });
  await loadToolIconCard('#toolIcon-midjourney', { toolName: "Midjourney" });
  await loadToolIconCard('#toolIcon-notionai',   { toolName: "Notion AI" });
  await loadToolIconCard('#toolIcon-runway',     { toolName: "Runway" });
  await loadToolIconCard('#toolIcon-copilot',    { toolName: "GitHub Copilot" });
  await loadToolIconCard('#toolIcon-canva',      { toolName: "Canva AI" });

  // 아이콘 클릭 팝업 제거
  patchIconPopup();

  await initFilters();
  bindDetailNavigation();
}

document.addEventListener("DOMContentLoaded", initPage);