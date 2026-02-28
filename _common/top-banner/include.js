// top-banner/include.js

async function loadTopBanner() {
  const target = document.getElementById("top-banner");
  if (!target) return;

  try {
    // HTML 로드 (경로 순서대로 시도)
    let html = null;

    const paths = [
      "/common/top-banner/top-banner.html",       // 절대경로 (Live Server 루트 기준)
      "../../common/top-banner/top-banner.html",  // 2단계 하위 폴더
      "../common/top-banner/top-banner.html",     // 1단계 하위 폴더
    ];

    for (const path of paths) {
      const res = await fetch(path);
      if (res.ok) {
        html = await res.text();
        break;
      }
    }

    if (!html) throw new Error("top-banner.html 을 찾을 수 없습니다.");
    target.innerHTML = html;

    // ✅ index.js 로드 (HTML 삽입 후 실행)
    if (!document.querySelector('script[data-script="top-banner"]')) {
      const script = document.createElement("script");
      script.src = "/common/top-banner/index.js"; // 절대경로
      script.dataset.script = "top-banner";
      document.body.appendChild(script);
    }

  } catch (e) {
    console.error("Top Banner Load Error:", e);
  }
}

document.addEventListener("DOMContentLoaded", loadTopBanner);