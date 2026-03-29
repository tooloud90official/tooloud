import { supabase } from '../_ignore/supabase.js';
import { searchCategories } from '../_ignore/groq.js';

const workCardContainer = document.getElementById("workCardImage");
const workCardImg = document.getElementById("workCardImg");
const workCardMoreBtn = document.getElementById("workCardMoreBtn");
const workCardUserName = document.getElementById("workCardUserName");

function renderWorkCard(data) {
  if (!data) return;

  workCardUserName.textContent = data.userName ? `${data.userName}님의 작업물` : "익명의 작업물";

  const imgUrl = data.img || "media/work-sample.png";
  workCardImg.src = imgUrl.startsWith("http") ? imgUrl : `/tooloud/main1/${imgUrl}`;
  workCardImg.onerror = () => { workCardImg.parentElement.style.background = "#e8eef5"; };

  const toolEl = document.getElementById("workCardTool");
  toolEl.textContent = data.tool || "";

  workCardMoreBtn.style.display = data.hasMore ? "block" : "none";
}

// 예시 렌더링
renderWorkCard({
  userName: "강민주",
  img: "media/work-sample.png",
  hasMore: true,
  tool: "AI 이미지 생성"
});

function initSearchBar() {
  const container = document.getElementById("searchbar-container");
  if (!container) return;
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "AI 툴을 검색해보세요.";
  input.className = "search-bar";
  container.appendChild(input);
}

initSearchBar();

document.querySelectorAll(".category-tab").forEach(tab => {
  tab.addEventListener("click", e => {
    document.querySelectorAll(".category-tab").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    const category = tab.dataset.category;
    console.log("선택된 카테고리:", category);
  });
});

function showRecommendSection(tools = []) {
  const section = document.getElementById("recommendSection");
  const grid = document.getElementById("recommendGrid");
  if (!section || !grid) return;
  if (tools.length > 0) {
    section.style.display = "block";
    grid.innerHTML = tools.map(tool => `<div class="tool-card">${tool.name}</div>`).join("");
  }
}

showRecommendSection([
  { name: "AI 이미지 생성" },
  { name: "문서 요약" }
]);

export { renderWorkCard, showRecommendSection };