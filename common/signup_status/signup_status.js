/* common/signup_status/signup_status.js */

async function updateSignupStatus() {
    const target = document.getElementById("signup-status");
    if (!target) return;

    // 1. 현재 URL 파일명 확인
    const path = window.location.pathname;
    const fileName = path.split("/").pop(); // 예: login3.html

    // 2. 상태 업데이트 로직
    const steps = target.querySelectorAll(".status-steps li");
    
    steps.forEach((step, index) => {
        // 모든 클래스 초기화
        step.classList.remove("active", "completed");

        // 파일명에 따른 단계별 활성화 (시안 기준)
        if (fileName.includes("login1")) {
            if (index === 0) step.classList.add("active");
        } 
        else if (fileName.includes("login2")) {
            if (index === 0) step.classList.add("completed");
            if (index === 1) step.classList.add("active");
        } 
        else if (fileName.includes("login3")) {
            // 현재 사용 중인 추가 정보 입력 페이지
            if (index === 0) step.classList.add("completed");
            if (index === 1) step.classList.add("active");
        } 
        else if (fileName.includes("login4")) {
            if (index < 2) step.classList.add("completed");
            if (index === 2) step.classList.add("active");
        }
    });
}

// include.js가 HTML을 다 불러온 뒤 실행되어야 하므로 이벤트 순서 조정이 필요할 수 있습니다.
document.addEventListener("DOMContentLoaded", () => {
    // 만약 include.js에서 비동기로 불러온다면, 0.1초 정도 지연 실행하여 태그를 찾도록 함
    setTimeout(updateSignupStatus, 100);
});