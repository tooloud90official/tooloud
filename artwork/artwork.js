import { loadNativeSelect } from "/_common/select/select.js";
import { mountArtworkCardTemplate, renderArtworkCards } from "/artwork/artwork_card/artwork-card.js";

/* =========================
   1) 사이드바 토글
========================= */
const fab = document.getElementById("artworkFab");
const sidebar = document.getElementById("artworkSidebar");
const shell = document.getElementById("artworkShell");
const dim = document.getElementById("artworkDim");

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
  const isOpen = sidebar.classList.contains("is-open");
  if (isOpen) closeSidebar();
  else openSidebar();
}

if (fab && dim && sidebar && shell) {
  fab.addEventListener("click", toggleSidebar);
  dim.addEventListener("click", closeSidebar);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}

/* =========================
   2) 초기화
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await loadNativeSelect({
    target: "#select-root",
    placeholder: "정렬",
    value: "like",
    options: [
      { value: "like", label: "좋아요 순" },
      { value: "new", label: "최신 순" },
      { value: "view", label: "조회수 순" },
    ],
    onChange(item) {
      console.log("정렬 변경:", item);
      // TODO: 여기서 정렬 로직 연결
    },
  });

  if (typeof loadSearchBar === "function") {
    loadSearchBar({
      target: "#search-area",
      placeholder: "검색어를 입력하세요",
      onSearch: (keyword) => {
        console.log("검색:", keyword);
      },
    });
  } else {
    console.warn("loadSearchBar가 없습니다. /_common/searchBar/searchBar.js 경로 확인!");
  }

  await mountArtworkCardTemplate();

  renderArtworkCards("#artworkGrid", [
    {
      imageSrc: "/yujin/img/sample-work.jpg",
      avatarSrc: "/yujin/img/sample-avatar.jpg",
      toolName: "Adobe Firefly",
      stars: "★★★★☆",
      userName: "yoon",
      dateText: "2026년 01월 30일",
      text: "신년을 맞아 비즈니스 계획을 세워보았습니다. 좋은 레퍼런스가 될 것 같아 여러분께 공유드립니다. 새해 복 많이 받으세요. ^^",
      onLike: (item) => console.log("like", item),
      onComment: (item) => console.log("comment", item),
      onSave: (item) => console.log("save", item),
    },
    {
      imageSrc: "/yujin/img/sample-work.jpg",
      avatarSrc: "/yujin/img/sample-avatar.jpg",
      toolName: "Adobe Firefly",
      stars: "★★★★☆",
      userName: "yoon",
      dateText: "2026년 01월 30일",
      text: "신년을 맞아 비즈니스 계획을 세워보았습니다. 좋은 레퍼런스가 될 것 같아 여러분께 공유드립니다. 새해 복 많이 받으세요. ^^",
      onLike: (item) => console.log("like", item),
      onComment: (item) => console.log("comment", item),
      onSave: (item) => console.log("save", item),
    }
  ]);
});