export async function mountArtworkCardTemplate() {
  if (document.getElementById("artworkCardTpl")) return;

  const res = await fetch("/artwork/artwork_card/artwork-card.html");
  const html = await res.text();

  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
}

export function renderArtworkCards(targetSelector, items = []) {
  const target = document.querySelector(targetSelector);
  if (!target) throw new Error(`target not found: ${targetSelector}`);

  const tpl = document.getElementById("artworkCardTpl");
  if (!tpl) throw new Error(`템플릿이 없습니다.`);

  const frag = document.createDocumentFragment();

  items.forEach((item) => {
    const node = tpl.content.cloneNode(true);

    // ✅ 카드 전체 클릭 → 게시글 상세로 이동
    const cardElement = node.querySelector(".artwork-card");
    if (cardElement) {
      cardElement.style.cursor = "pointer";
      cardElement.onclick = () => {
        window.location.href = "/artwork/artwork_post/artwork_post.html";
      };
    }

    // ✅ 툴 아이콘 클릭 → detail_AI로 이동
    const toolLink = node.querySelector(".artwork-card__tool-icLink");
    if (toolLink) {
      toolLink.href = `/detail_AI/detail_AI.html`;
      toolLink.addEventListener("click", (e) => {
        e.stopPropagation(); // 카드 전체 클릭 이벤트 막기
      });
    }

    // 데이터 바인딩
    const img     = node.querySelector("[data-art-img]");
    const avatar  = node.querySelector("[data-art-avatar]");
    const tool    = node.querySelector("[data-art-tool]");
    const stars   = node.querySelector("[data-art-stars]");
    const user    = node.querySelector("[data-art-user]");
    const date    = node.querySelector("[data-art-date]");
    const text    = node.querySelector("[data-art-text]");

    if (img)    img.src              = item.imageSrc  || "";
    if (avatar) avatar.src           = item.avatarSrc || "";
    if (tool)   tool.textContent     = item.toolName  || "Tool";
    if (stars)  stars.textContent    = item.stars     || "★★★★★";
    if (user)   user.textContent     = item.userName  || "user";
    if (date)   date.textContent     = item.dateText  || "";
    if (text)   text.textContent     = item.text      || "";

    // 좋아요/댓글 버튼
    const likeBtn    = node.querySelector("[data-art-like]");
    const commentBtn = node.querySelector("[data-art-comment]");

    likeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      item.onLike?.(item);
    });

    commentBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      item.onComment?.(item);
    });

    frag.appendChild(node);
  });

  target.innerHTML = "";
  target.appendChild(frag);
}