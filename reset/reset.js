document.addEventListener("DOMContentLoaded", async () => {

  // =========================
  // top banner 로드
  // =========================
  if (window.includeHTML) {
    await includeHTML("#top-banner", "/_common/top-banner/top-banner.html");
  }

  // =========================
  // 코드 전송 버튼 생성 (안전 버전)
  // =========================
  const container = document.getElementById("sendCodeBtnContainer");

  if (window.loadButton) {
    // button 컴포넌트 사용
    loadButton({
      containerId: "sendCodeBtnContainer",
      text: "코드 전송",
      type: "primary",
      onClick: sendResetCode
    });

  } else {
    // ❗ fallback 직접 생성 (무조건 표시)
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = "코드 전송";
    btn.onclick = sendResetCode;
    container.appendChild(btn);

    console.warn("loadButton 없음 → 기본 버튼 생성됨");
  }

  // =========================
  // 뒤로가기
  // =========================
  document.getElementById("goBack").addEventListener("click", () => {
    window.location.href = "/login1/login1.html";
  });

});



function sendResetCode() {

  const id = document.getElementById("emailId").value.trim();
  const domain = document.getElementById("emailDomain").value;

  if (!id) {
    alert("이메일을 입력하세요.");
    return;
  }

  if (!domain) {
    alert("이메일 주소를 선택하세요.");
    return;
  }

  const email = `${id}@${domain}`;

  console.log("코드 전송:", email);
  alert("코드가 전송되었습니다.");
}