const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const logo = document.getElementById("logo");
const authBtn = document.getElementById("authBtn");

/* 모바일 메뉴 토글 */
menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});

/* 로고 클릭 */
logo.addEventListener("click", () => {
    alert("홈으로 이동합니다");
});

/* 로그인 클릭 */
authBtn.addEventListener("click", () => {
    alert("로그인 페이지로 이동합니다");
});