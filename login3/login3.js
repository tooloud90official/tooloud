// login3.js
import { loadNativeSelect } from '/_common/select/select.js';

document.addEventListener("DOMContentLoaded", async () => {

  // ===== 1. 다음 버튼 렌더링 =====
  loadButton({
    target: "#signup-button",
    text: "다음",
    variant: "primary",
    size: "md",
    onClick: () => {
      if (window.validateLogin3?.()) {
        window.location.href = "/login4/login4.html";
      }
    }
  });


  // ===== 2. 직업 / 국가 셀렉트 =====
  await loadNativeSelect({
    target: '#job-select-wrap',
    placeholder: '선택 해주세요',
    options: [
      { value: 'developer', label: '개발자' },
      { value: 'designer',  label: '디자이너' },
      { value: 'planner',   label: '기획자' },
      { value: 'marketer',  label: '마케터' },
      { value: 'writer',    label: '작가/크리에이터' },
      { value: 'student',   label: '학생' },
      { value: 'etc',       label: '기타' },
    ]
  });

  await loadNativeSelect({
    target: '#country-select-wrap',
    placeholder: '선택 해주세요',
    options: [
      { value: 'KR',  label: '대한민국' },
      { value: 'US',  label: '미국' },
      { value: 'JP',  label: '일본' },
      { value: 'CN',  label: '중국' },
      { value: 'GB',  label: '영국' },
      { value: 'ETC', label: '기타' },
    ]
  });


  // ===== 3. 연령대 셀렉트 =====
  const ageInstance = await loadNativeSelect({
    target: '#age-select-wrap',
    placeholder: '선택 해주세요',
    options: [
      { value: '10s', label: '10대' },
      { value: '20s', label: '20대' },
      { value: '30s', label: '30대' },
      { value: '40s', label: '40대' },
      { value: '50s', label: '50대' },
      { value: '60s', label: '60대' },
      { value: '70s', label: '70대' },
    ]
  });


  // ===== 4. 닉네임 중복 확인 =====
  const nicknameInput = document.getElementById('nickname');
  const nicknameMsg   = document.getElementById('nickname-msg');
  const checkBtn      = document.getElementById('check-duplicate-btn');
  let isNicknameChecked = false;

  const CAUTION_ICON = `<img src="/media/caution.png" alt="caution" style="width:14px;height:14px;margin-right:1px;margin-top:-2px;vertical-align:middle;">`;

  nicknameInput?.addEventListener('input', () => {
    isNicknameChecked = false;
    nicknameMsg.innerHTML = '';
  });

  checkBtn?.addEventListener('click', () => {
    const val = nicknameInput.value.trim();
    if (!val) {
      nicknameMsg.innerHTML = `${CAUTION_ICON}닉네임을 입력해주세요.`;
      nicknameMsg.style.color = '#e53e3e';
      return;
    }
    if (val.length < 2 || val.length > 12) {
      nicknameMsg.innerHTML = `${CAUTION_ICON}닉네임은 2자 이상 12자 이하로 입력해주세요.`;
      nicknameMsg.style.color = '#e53e3e';
      return;
    }
    isNicknameChecked = true;
    nicknameMsg.innerHTML = '사용 가능한 닉네임입니다.';
    nicknameMsg.style.color = '#0080ff';
  });


  // ===== 5. 다음 버튼 유효성 검사 =====
  window.validateLogin3 = function() {
    let isValid = true;

    // 닉네임 중복 확인 여부
    if (!isNicknameChecked) {
      nicknameMsg.innerHTML = `${CAUTION_ICON}닉네임 중복 확인을 해주세요.`;
      nicknameMsg.style.color = '#e53e3e';
      isValid = false;
    }

    // 연령대 선택 여부
    const ageValue = ageInstance?.getValue?.();
    if (!ageValue) {
      // age-select-wrap 아래 메시지 엘리먼트가 없으면 생성
      let ageMsg = document.getElementById('age-msg');
      if (!ageMsg) {
        ageMsg = document.createElement('p');
        ageMsg.id = 'age-msg';
        ageMsg.className = 'field-msg';
        document.getElementById('age-select-wrap').insertAdjacentElement('afterend', ageMsg);
      }
      ageMsg.innerHTML = `${CAUTION_ICON}연령대를 선택해주세요.`;
      ageMsg.style.color = '#e53e3e';
      isValid = false;
    } else {
      const ageMsg = document.getElementById('age-msg');
      if (ageMsg) ageMsg.innerHTML = '';
    }

    return isValid;
  };


  // ===== 6. confirm 모달 초기화 =====
  if (!document.getElementById('modal-root')) {
    const root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }

  await window.includeHTML('#modal-root', '/_common/confirm/confirm.html');


  // ===== 7. 이전으로 돌아가기 =====
  document.getElementById('backBtn')?.addEventListener('click', async () => {
    const result = await window.showConfirm({
      title      : '페이지를 나가시겠습니까?',
      desc       : '입력한 내용이 저장되지 않습니다.',
      confirmText: '확인',
      cancelText : '취소',
    });
    if (result) {
      window.location.href = '/login2/login2.html';
    }
  });

});