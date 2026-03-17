export function renderArtworkCards(targetSelector, items = []) {

  const target = document.querySelector(targetSelector);
  if (!target) throw new Error(`target not found: ${targetSelector}`);

  const tpl = document.getElementById("artworkCardTpl");
  if (!tpl) throw new Error("템플릿이 없습니다.");

  const frag = document.createDocumentFragment();

  items.forEach((item, index) => {

    const node = tpl.content.cloneNode(true);

    const cardElement    = node.querySelector(".artwork-card");
    const previewRoot    = node.querySelector("[data-art-preview]");
    const avatar         = node.querySelector("[data-art-avatar]");
    const toolNameEl     = node.querySelector("[data-tool-name]");
    const toolStarsEl    = node.querySelector("[data-tool-stars]");
    const toolBrandEl    = node.querySelector("[data-tool-brand]");
    const toolIconEl     = node.querySelector("[data-art-tool-icon]");
    const toolLink       = node.querySelector(".artwork-card__tool-icLink");
    const user           = node.querySelector("[data-art-user]");
    const date           = node.querySelector("[data-art-date]");
    const titleEl        = node.querySelector("[data-art-text]");
    const likeBtn        = node.querySelector("[data-art-like]");
    const commentBtn     = node.querySelector("[data-art-comment]");
    const likeCountEl    = node.querySelector("[data-art-like-count]");
    const commentCountEl = node.querySelector("[data-art-comment-count]");

    const artworkId = item.id || item.work_id || `artwork_${index+1}`;

    /* 카드 클릭 → 작업물 페이지 */
    if (cardElement) {
      cardElement.style.cursor = "pointer";
      cardElement.onclick = () => {
        window.location.href =
          `/artwork/artwork_post/artwork_post.html?id=${encodeURIComponent(artworkId)}`;
      };
    }

    /* 툴 아이콘 클릭 */
    if (toolLink) {
      const toolId = item.toolId || item.tool_id || "";
      toolLink.href =
        `/detail_AI/detail_AI.html?tool_ID=${encodeURIComponent(toolId)}`;
      toolLink.addEventListener("click", e => e.stopPropagation());
    }

    /* 프로필 */
    if (avatar) {
      avatar.src = item.user_img || "/media/profil.png";
      avatar.onerror = () => avatar.style.visibility = "hidden";
    }

    /* 툴 정보 */
    if (toolNameEl)  toolNameEl.textContent  = item.tool_name || "Tool";
    if (toolStarsEl) toolStarsEl.textContent = item.stars || "";
    if (toolBrandEl) toolBrandEl.textContent = item.tool_brand || "";

    if (toolIconEl) {
      toolIconEl.src = item.icon || "/media/tool-default.png";
      toolIconEl.onerror = () => toolIconEl.style.visibility = "hidden";
    }

    /* 작성자 */
    if (user) user.textContent = item.user_name || "user";

    /* 날짜 */
    if (date) date.textContent = item.dateText || "";

    /* 제목 */
    if (titleEl) titleEl.textContent = item.work_title || "";

    /* 좋아요 */
    if (likeCountEl)
      likeCountEl.textContent = item.like_count ?? 0;

    /* 댓글 */
    if (commentCountEl)
      commentCountEl.textContent = item.comment_count ?? 0;

    likeBtn?.addEventListener("click", e => {
      e.stopPropagation();
      item.onLike?.(item);
    });

    commentBtn?.addEventListener("click", e => {
      e.stopPropagation();
      item.onComment?.(item);
    });

    frag.appendChild(node);

    /* 미리보기 렌더 */
    requestAnimationFrame(() => {
      renderArtworkPreview(previewRoot, item);
    });

  });

  target.innerHTML = "";
  target.appendChild(frag);
}


/* ===============================
   미리보기 렌더 (이미지 / 영상 / PDF)
================================ */
function renderArtworkPreview(root, item) {

  if (!root) return;

  const src = item.previewSrc;
  if (!src) return;

  const ext = src.split(".").pop().toLowerCase();

  /* 이미지 */
  if (["png","jpg","jpeg","webp","gif"].includes(ext)) {

    root.innerHTML =
      `<img src="${src}" class="artwork-card__img">`;

    return;
  }

  /* 영상 */
  if (["mp4","webm","mov"].includes(ext)) {

    root.innerHTML = `
      <video class="artwork-card__img"
        muted
        autoplay
        loop
        playsinline>
        <source src="${src}">
      </video>
    `;

    return;
  }

  /* PDF */
  if (ext === "pdf" && window.pdfjsLib) {

    root.innerHTML =
      `<div class="artwork-card__pdf">
        <canvas class="artwork-card__pdf-canvas"></canvas>
      </div>`;

    const canvas = root.querySelector("canvas");

    pdfjsLib.getDocument(src).promise.then(pdf => {

      pdf.getPage(1).then(page => {

        const viewport = page.getViewport({ scale: 0.6 });

        canvas.width  = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");

        page.render({
          canvasContext: ctx,
          viewport
        });

      });

    });

    return;
  }

}


/* 템플릿 mount (현재 사용 안함) */
export async function mountArtworkCardTemplate() {
  return;
}