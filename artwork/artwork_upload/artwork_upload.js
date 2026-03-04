// /artwork/artwork_upload/artwork_upload.js

/* =========================
   TOOL LIST (15개 샘플)
========================= */
const TOOL_LIST = [
  { id:"firefly", name:"Adobe Firefly", brand:"@Adobe", stars:4 },
  { id:"chatgpt", name:"ChatGPT", brand:"@OpenAI", stars:5 },
  { id:"claude", name:"Claude", brand:"@Anthropic", stars:5 },
  { id:"gemini", name:"Gemini", brand:"@Google", stars:4 },
  { id:"midjourney", name:"Midjourney", brand:"@Midjourney", stars:5 },
  { id:"ideogram", name:"Ideogram", brand:"@Ideogram", stars:4 },
  { id:"runway", name:"Runway", brand:"@Runway", stars:4 },
  { id:"pika", name:"Pika", brand:"@Pika", stars:4 },
  { id:"capcut", name:"CapCut", brand:"@ByteDance", stars:4 },
  { id:"notion", name:"Notion", brand:"@Notion", stars:5 },
  { id:"figma", name:"Figma", brand:"@Figma", stars:5 },
  { id:"photoshop", name:"Photoshop", brand:"@Adobe", stars:5 },
  { id:"illustrator", name:"Illustrator", brand:"@Adobe", stars:5 },
  { id:"blender", name:"Blender", brand:"@Blender", stars:5 },
  { id:"premiere", name:"Premiere Pro", brand:"@Adobe", stars:4 },
];

let selectedToolId = null;
let toolModalRef = null;

/* =========================
   TOOL CARD
========================= */
function starsToText(n) {
  const s = Math.max(0, Math.min(5, Number(n) || 0));
  return "★".repeat(s) + "☆".repeat(5 - s);
}

function getSelectedTool() {
  return TOOL_LIST.find(t => t.id === selectedToolId) || null;
}

// ✅ 처음엔 placeholder(가운데 회색), 선택하면 meta(이름/별점/브랜드)
function renderToolCard(tool) {
  const placeholder = document.getElementById("toolPlaceholder");
  const meta = document.getElementById("toolMeta");
  const nameEl = document.getElementById("toolName");
  const brandEl = document.getElementById("toolBrand");
  const starsEl = document.getElementById("toolStars");

  if (!placeholder || !meta || !nameEl || !brandEl || !starsEl) return;

  if (!tool) {
    placeholder.hidden = false;
    meta.hidden = true;
    nameEl.textContent = "";
    brandEl.textContent = "";
    starsEl.textContent = "";
    return;
  }

  placeholder.hidden = true;
  meta.hidden = false;

  nameEl.textContent = tool.name;
  brandEl.textContent = tool.brand || "@";
  starsEl.textContent = starsToText(tool.stars ?? 5);
}

/* =========================
   TOOL MODAL
========================= */
function ensureToolModal() {
  if (toolModalRef) return toolModalRef;

  const modal = document.createElement("div");
  modal.className = "tool-modal";
  modal.innerHTML = `
    <div class="tool-modal__dim" data-tool-dim></div>

    <div class="tool-modal__panel" role="dialog" aria-modal="true" aria-label="툴 선택">
      <div class="tool-modal__header">
        <div class="tool-modal__toprow">
          <h3 class="tool-modal__title">툴 선택</h3>
          <button type="button" class="tool-modal__close" data-tool-close aria-label="닫기">×</button>
        </div>
        <input class="tool-modal__search" data-tool-search type="text" placeholder="툴 이름 검색..." />
      </div>

      <div class="tool-modal__body">
        <div class="tool-grid" data-tool-grid></div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const dim = modal.querySelector("[data-tool-dim]");
  const closeBtn = modal.querySelector("[data-tool-close]");
  const search = modal.querySelector("[data-tool-search]");
  const grid = modal.querySelector("[data-tool-grid]");

  const close = () => modal.classList.remove("is-open");
  const open = () => modal.classList.add("is-open");

  dim.addEventListener("click", close);
  closeBtn.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
  });

  search.addEventListener("input", () => {
    renderToolGrid(grid, search.value.trim());
  });

  toolModalRef = { modal, search, grid, open, close };
  return toolModalRef;
}

function renderToolGrid(gridEl, keyword = "") {
  const q = keyword.toLowerCase();
  const list = TOOL_LIST.filter(t => t.name.toLowerCase().includes(q));

  gridEl.innerHTML = list.map(t => {
    const isSel = (t.id === selectedToolId) ? "is-selected" : "";
    return `
      <button type="button" class="tool-item ${isSel}" data-tool-id="${t.id}">
        <div class="tool-icon" aria-hidden="true"></div>
        <div class="tool-name">${t.name}</div>
      </button>
    `;
  }).join("");

  gridEl.querySelectorAll("[data-tool-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedToolId = btn.getAttribute("data-tool-id");
      renderToolCard(getSelectedTool());
      ensureToolModal().close();
    });
  });
}

function openToolModal() {
  const { search, grid, open } = ensureToolModal();
  open();
  search.value = "";
  renderToolGrid(grid, "");
  setTimeout(() => search.focus(), 0);
}

/* =========================
   FILE UPLOAD (버튼 컴포넌트 + 아이콘 삽입)
========================= */
function setupFileInput() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "artworkFileInput";
  fileInput.multiple = true;
  fileInput.accept = ".mp4,.mp3,.jpg,.jpeg,.png,.pdf,.txt";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    console.log("선택된 파일:", files);

    const dz = document.querySelector(".drop-zone p");
    if (dz) dz.textContent = `${files.length}개 파일 선택됨`;

    fileInput.value = "";
  });

  return fileInput;
}

function setupDragDrop() {
  const dropZone = document.querySelector(".drop-zone");
  if (!dropZone) return;

  const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };

  ["dragenter","dragover"].forEach((t) => {
    dropZone.addEventListener(t, (e) => {
      prevent(e);
      dropZone.classList.add("is-dragover");
    });
  });

  ["dragleave","drop"].forEach((t) => {
    dropZone.addEventListener(t, (e) => {
      prevent(e);
      dropZone.classList.remove("is-dragover");
    });
  });

  dropZone.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    console.log("드롭된 파일:", files);

    const p = dropZone.querySelector("p");
    if (p) p.textContent = `${files.length}개 파일 드롭됨`;
  });
}

async function mountUploadButton(fileInput) {
  if (typeof loadButton !== "function") {
    console.error("loadButton 없음: /_common/button/button.js 로드 확인!");
    return;
  }

  // ✅ 버튼 컴포넌트로 마운트
  await loadButton({
    target: "#fileUploadMount",
    text: "파일 업로드",
    variant: "primary",
    onClick: () => fileInput.click(),
  });

  // ✅ 버튼 안을 아이콘+텍스트로 교체
  const mount = document.querySelector("#fileUploadMount");
  const btn = mount?.querySelector(".btn") || mount?.querySelector("button");
  if (btn) {
    btn.innerHTML = `
      <span class="upload-btn__inner">
        <img class="upload-btn__icon" src="/media/upload.png" alt="" />
        <span class="upload-btn__text">파일 업로드</span>
      </span>
    `;
  }
}

/* =========================
   ACTION BUTTONS (취소/등록)
========================= */
async function mountActionButtons() {
  if (typeof loadButton !== "function") return;

  await loadButton({
    target: "#cancelBtnMount",
    text: "취소하기",
    variant: "outline",
    onClick: () => history.back(),
  });

  await loadButton({
    target: "#submitBtnMount",
    text: "등록하기",
    variant: "primary",
    onClick: () => {
      const desc = document.querySelector("#description")?.value?.trim() ?? "";
      const tool = getSelectedTool();
      alert(
        `등록하기 클릭\n` +
        `설명: ${desc}\n` +
        `툴: ${tool ? tool.name : "(미선택)"}`
      );
    },
  });
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  // 1) 툴 카드: 초기 상태(가운데 회색 안내 문구)
  renderToolCard(null);

  // 2) 툴 카드 클릭 -> 모달
  const picker = document.getElementById("toolPicker");
  if (picker) {
    picker.addEventListener("click", openToolModal);
    picker.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openToolModal();
      }
    });
  }

  // 3) 파일 업로드: input + drag&drop + 버튼 마운트
  const fileInput = setupFileInput();
  setupDragDrop();
  await mountUploadButton(fileInput);

  // 4) 취소/등록 버튼 마운트
  await mountActionButtons();
});