import { loadNativeSelect } from "/_common/select/select.js";
import { mountArtworkCardTemplate, renderArtworkCards } from "/artwork/artwork_card/artwork-card.js";

/* =========================
   1) 사이드바 토글
========================= */
const fab     = document.getElementById("artworkFab");
const sidebar = document.getElementById("artworkSidebar");
const shell   = document.getElementById("artworkShell");
const dim     = document.getElementById("artworkDim");

function openSidebar() {
  sidebar.classList.add("is-open");
  shell.classList.add("is-shift");
  dim.classList.add("is-on");
  sidebar.setAttribute("aria-hidden", "false");
  fab.setAttribute("aria-expanded", "true");
  fab.classList.add("is-hidden");
}

function closeSidebar() {
  sidebar.classList.remove("is-open");
  shell.classList.remove("is-shift");
  dim.classList.remove("is-on");
  sidebar.setAttribute("aria-hidden", "true");
  fab.setAttribute("aria-expanded", "false");
  fab.classList.remove("is-hidden");
}

function toggleSidebar() {
  sidebar.classList.contains("is-open") ? closeSidebar() : openSidebar();
}

if (fab && dim && sidebar && shell) {
  fab.addEventListener("click", toggleSidebar);
  dim.addEventListener("click", closeSidebar);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}

/* =========================
   2) 탭 전환 (타이틀·설명·검색창만)
========================= */
function setTab(tabKey) {
  const searchArea   = document.getElementById("search-area");
  const sectionTitle = document.querySelector(".artwork-section__title");
  const sectionDesc  = document.querySelector(".artwork-section__desc");

  // 내 라이브러리일 때 검색창 숨김
  if (searchArea) {
    searchArea.style.display = tabKey === "내 라이브러리" ? "none" : "";
  }

  // 타이틀 교체
  if (sectionTitle) {
    sectionTitle.textContent =
      tabKey === "내 라이브러리"       ? "📁 내 라이브러리" :
      tabKey === "AI 추천 작업물 보기" ? "🤖 AI 추천 작업물" :
      `📂 ${tabKey}`;
  }

  // 설명 교체
  if (sectionDesc) {
    sectionDesc.textContent =
      tabKey === "내 라이브러리"       ? "내가 저장한 작업물들을 확인해보세요." :
      tabKey === "AI 추천 작업물 보기" ? "AI가 추천하는 작업물을 감상해보세요." :
      `${tabKey} 관련 작업물들을 감상해보세요.`;
  }

  // 활성 탭 스타일
  document.querySelectorAll(".artwork-sidebar__item[data-tab]").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.tab === tabKey);
  });
}

/* =========================
   3) 초기화
========================= */
document.addEventListener("DOMContentLoaded", async () => {

  // 셀렉트
  await loadNativeSelect({
    target: "#select-root",
    placeholder: "정렬",
    value: "like",
    options: [
      { value: "like", label: "좋아요 순" },
      { value: "new",  label: "최신 순" },
      { value: "view", label: "조회수 순" },
    ],
    onChange(item) {
      console.log("정렬 변경:", item);
      // TODO: DB 연결 시 여기서 정렬 로직 연결
    },
  });

  // 검색창
  if (typeof loadSearchBar === "function") {
    loadSearchBar({
      target: "#search-area",
      placeholder: "검색어를 입력하세요",
      onSearch: (keyword) => console.log("검색:", keyword),
    });
  } else {
    console.warn("loadSearchBar가 없습니다. /_common/searchBar/searchBar.js 경로 확인!");
  }

  // 카드 템플릿 마운트
  await mountArtworkCardTemplate();

  // 카드 렌더링 (TODO: DB 연결 시 데이터 교체)
  renderArtworkCards("#artworkGrid", [
    {
      imageSrc:  "/yujin/img/sample-work.jpg",
      avatarSrc: "/yujin/img/sample-avatar.jpg",
      toolName:  "Adobe Firefly",
      stars:     "★★★★☆",
      userName:  "yoon",
      dateText:  "2026년 01월 30일",
      text:      "신년을 맞아 비즈니스 계획을 세워보았습니다. 좋은 레퍼런스가 될 것 같아 여러분께 공유드립니다. 새해 복 많이 받으세요. ^^",
      onLike:    (item) => console.log("like", item),
      onComment: (item) => console.log("comment", item),
      onSave:    (item) => console.log("save", item),
    },
    {
      imageSrc:  "/yujin/img/sample-work.jpg",
      avatarSrc: "/yujin/img/sample-avatar.jpg",
      toolName:  "Adobe Firefly",
      stars:     "★★★★☆",
      userName:  "yoon",
      dateText:  "2026년 01월 30일",
      text:      "신년을 맞아 비즈니스 계획을 세워보았습니다. 좋은 레퍼런스가 될 것 같아 여러분께 공유드립니다. 새해 복 많이 받으세요. ^^",
      onLike:    (item) => console.log("like", item),
      onComment: (item) => console.log("comment", item),
      onSave:    (item) => console.log("save", item),
    },
  ]);

  // 사이드바 탭 클릭 이벤트
  document.querySelectorAll(".artwork-sidebar__item[data-tab]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      setTab(el.dataset.tab);
      closeSidebar();
    });
  });
});