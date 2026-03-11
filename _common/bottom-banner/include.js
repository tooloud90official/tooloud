// /_common/bottom-banner/include.js

(async function () {
  const target = document.querySelector("#bottom-banner");
  if (!target) return;

  try {
    const res = await fetch("/_common/bottom-banner/bottom-banner.html");
    if (!res.ok) return;
    const html = await res.text();
    target.innerHTML = html;
  } catch (err) {
    console.error("푸터 로드 실패:", err);
  }
})();