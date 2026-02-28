// common/signup_status/include.js

document.addEventListener("DOMContentLoaded", async () => {
  const target = document.getElementById("signup-status");
  if (!target) return;

  const basePath = "../../common/signup_status/";

  try {
    const htmlRes = await fetch(basePath + "signup_status.html");
    if (!htmlRes.ok) throw new Error(`HTML 로드 실패 (${htmlRes.status})`);
    target.innerHTML = await htmlRes.text();

    // ✅ data-step 속성으로 현재 단계 받기
    const currentStep = parseInt(target.dataset.step) || 1;
    const circles = target.querySelectorAll('.step-circle');
    circles.forEach((circle, index) => {
      if (index < currentStep) circle.classList.add('active');
    });

    if (!document.querySelector(`link[data-style="signup_status"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = basePath + "signup_status.css";
      link.dataset.style = "signup_status";
      document.head.appendChild(link);
    }

    if (!document.querySelector(`script[data-script="signup_status"]`)) {
      const script = document.createElement("script");
      script.src = basePath + "signup_status.js";
      script.dataset.script = "signup_status";
      document.body.appendChild(script);
    }

  } catch (err) {
    console.error("signup_status 컴포넌트 로드 실패:", err);
  }
});