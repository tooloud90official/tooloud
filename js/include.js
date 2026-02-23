async function loadTopBanner() {
const target = document.getElementById("top-banner");
if (!target) return;

try {
const res = await fetch("/html/index.html");
const html = await res.text();
target.innerHTML = html;
} catch (e) {
console.error("배너 불러오기 실패:", e);
}
}

loadTopBanner();