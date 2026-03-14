// login2.js
import { loadNativeSelect } from '/_common/select/select.js';

document.addEventListener("DOMContentLoaded", async () => {

  // ===== 1. 다음 버튼 렌더링 =====
  loadButton({
    target: "#signup-button",
    text: "다음",
    variant: "primary",
    size: "md",
    onClick: () => {
      if (window.validateLogin2?.()) {
        window.location.href = "/login3/login3.html";
      }
    }
  });


  // ===== 2. 이메일 도메인 셀렉트 (loadNativeSelect) =====
  await loadNativeSelect({
    target: '#emailDomainSelect',
    placeholder: '이메일 주소 선택',
    options: [
      { value: 'gmail.com',   label: 'gmail.com' },
      { value: 'naver.com',   label: 'naver.com' },
      { value: 'icloud.com',  label: 'icloud.com' },
      { value: 'direct',      label: '직접 입력' },
    ],
    onChange: (item) => {
      const customInput = document.getElementById('emailCustom');
      if (item.value === 'direct') {
        customInput.style.display = 'block';
        customInput.focus();
      } else {
        customInput.style.display = 'none';
        customInput.value = '';
      }
      // 도메인이 바뀌면 인증 상태 초기화
      resetVerification();
    }
  });


  // ===== 3. 이메일 인증 로직 =====

  // --- 헬퍼: 완성된 이메일 주소 반환 ---
  function getFullEmail() {
    const id     = document.getElementById('emailId').value.trim();
    const custom = document.getElementById('emailCustom');
    const domainSelectValue = document.querySelector('#emailDomainSelect [data-select-value]')?.textContent?.trim();

    let domain = '';
    if (custom.style.display !== 'none') {
      domain = custom.value.trim();
    } else {
      // loadNativeSelect가 주입한 select 요소에서 value 읽기
      const nativeSelect = document.querySelector('#emailDomainSelect select');
      domain = nativeSelect ? nativeSelect.value : '';
      // 플레이스홀더 상태('이메일 주소 선택')이면 빈 값
      if (!domain || domain === '이메일 주소 선택') domain = '';
    }

    if (!id || !domain) return null;
    return `${id}@${domain}`;
  }

  // --- 상태 변수 ---
  let timerInterval   = null;
  let isVerified      = false;   // 인증 성공 여부
  let codeSent        = false;   // 코드 전송 여부

  const sendCodeBtn    = document.getElementById('sendCodeBtn');
  const verifyCodeWrap = document.getElementById('verifyCodeWrap');
  const verifyCodeInput= document.getElementById('verifyCode');
  const verifyTimer    = document.getElementById('verifyTimer');
  const verifyBtn      = document.getElementById('verifyBtn');
  const resendBtn      = document.getElementById('resendBtn');
  const emailMsg       = document.getElementById('email-msg');
  const verifyMsg      = document.getElementById('verify-msg');

  // --- 타이머 시작 ---
  function startTimer(seconds = 180) {
    clearInterval(timerInterval);
    verifyTimer.classList.remove('expired');
    let remaining = seconds;

    function tick() {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      verifyTimer.textContent = `${m}:${s.toString().padStart(2, '0')}`;

      if (remaining <= 0) {
        clearInterval(timerInterval);
        verifyTimer.textContent = '0:00';
        verifyTimer.classList.add('expired');
        verifyBtn.disabled = true;
        setFieldMsg(verifyMsg, '인증 시간이 만료되었습니다. 코드를 재전송해 주세요.', '#e53e3e');
      }
      remaining--;
    }

    tick();
    timerInterval = setInterval(tick, 1000);
  }

  // --- 상태 메시지 출력 ---
  function setFieldMsg(el, text, color) {
    el.textContent = text;
    el.style.color = color || '';
  }

  // --- 인증 상태 전체 초기화 ---
  function resetVerification() {
    clearInterval(timerInterval);
    isVerified  = false;
    codeSent    = false;

    sendCodeBtn.classList.remove('sent');
    sendCodeBtn.textContent = '인증코드 전송';
    sendCodeBtn.disabled    = false;

    verifyCodeWrap.style.display = 'none';
    verifyCodeInput.value        = '';
    verifyBtn.disabled           = false;
    verifyBtn.classList.remove('verified');
    verifyBtn.textContent        = '확인';
    verifyTimer.textContent      = '3:00';
    verifyTimer.classList.remove('expired');

    setFieldMsg(emailMsg,  '', '');
    setFieldMsg(verifyMsg, '', '');
  }

  // --- 인증코드 전송 ---
  async function sendVerificationCode() {
    const email = getFullEmail();

    if (!email) {
      setFieldMsg(emailMsg, '이메일 주소를 입력해 주세요.', '#e53e3e');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldMsg(emailMsg, '올바른 이메일 형식이 아닙니다.', '#e53e3e');
      return;
    }

    setFieldMsg(emailMsg, '인증코드를 전송 중입니다...', '#888');
    sendCodeBtn.disabled = true;

    try {
      // ── Supabase Auth 이메일 OTP 전송 ──────────────────────────
      // supabaseClient는 _ignore/supabase.js에서 전역으로 노출되어 있다고 가정
      // 실제 연동 시 아래 주석을 해제하고 사용하세요.
      //
      // const { error } = await supabaseClient.auth.signInWithOtp({
      //   email,
      //   options: { shouldCreateUser: false }   // 회원가입 전 인증이므로 false
      // });
      // if (error) throw error;
      //
      // ── 위 코드로 교체 전 임시: 콘솔 확인용 ──────────────────
      console.log(`[DEV] 인증코드 전송 대상: ${email}`);
      await new Promise(r => setTimeout(r, 600)); // 네트워크 딜레이 시뮬레이션
      // ──────────────────────────────────────────────────────────

      codeSent = true;
      sendCodeBtn.classList.add('sent');
      sendCodeBtn.textContent = '전송 완료';
      setFieldMsg(emailMsg, `${email} 로 인증코드를 전송했습니다.`, '#0080ff');

      verifyCodeWrap.style.display = 'block';
      verifyCodeInput.value        = '';
      verifyBtn.disabled           = false;
      verifyBtn.classList.remove('verified');
      verifyBtn.textContent        = '확인';
      verifyCodeInput.focus();

      startTimer(180);

    } catch (err) {
      sendCodeBtn.disabled = false;
      setFieldMsg(emailMsg, '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.', '#e53e3e');
      console.error('[이메일 인증 전송 오류]', err);
    }
  }

  // --- 인증코드 확인 ---
  async function verifyCode() {
    const email = getFullEmail();
    const code  = verifyCodeInput.value.trim();

    if (!code) {
      setFieldMsg(verifyMsg, '인증코드를 입력해 주세요.', '#e53e3e');
      return;
    }

    verifyBtn.disabled   = true;
    setFieldMsg(verifyMsg, '확인 중...', '#888');

    try {
      // ── Supabase OTP 검증 ────────────────────────────────────
      // const { error } = await supabaseClient.auth.verifyOtp({
      //   email,
      //   token: code,
      //   type: 'email'
      // });
      // if (error) throw error;
      //
      // ── 임시: 콘솔 확인용 (코드 '123456' 성공 처리) ──────────
      await new Promise(r => setTimeout(r, 500));
      if (code !== '123456') throw new Error('invalid_code'); // 개발 테스트용
      // ──────────────────────────────────────────────────────────

      // 인증 성공
      clearInterval(timerInterval);
      isVerified = true;

      verifyBtn.classList.add('verified');
      verifyBtn.textContent    = '인증 완료';
      verifyCodeInput.disabled = true;
      verifyTimer.textContent  = '✓';
      verifyTimer.style.color  = '#0080ff';
      resendBtn.style.display  = 'none';

      setFieldMsg(verifyMsg, '이메일 인증이 완료되었습니다.', '#0080ff');

    } catch (err) {
      verifyBtn.disabled = false;
      const msg = err.message === 'invalid_code'
        ? '인증코드가 올바르지 않습니다.'
        : '인증에 실패했습니다. 다시 시도해 주세요.';
      setFieldMsg(verifyMsg, msg, '#e53e3e');
      console.error('[이메일 인증 확인 오류]', err);
    }
  }

  // --- 이벤트 바인딩 ---
  sendCodeBtn.addEventListener('click', () => {
    if (!sendCodeBtn.classList.contains('sent')) {
      sendVerificationCode();
    }
  });

  verifyBtn.addEventListener('click', () => {
    if (!isVerified) verifyCode();
  });

  // Enter 키로 확인
  verifyCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isVerified) verifyCode();
  });

  resendBtn.addEventListener('click', () => {
    resetVerification();
    // 이메일 유지하고 바로 재전송
    sendVerificationCode();
  });

  // emailId 변경 시 인증 초기화
  document.getElementById('emailId').addEventListener('input', resetVerification);


  // ===== 4. 비밀번호 유효성 검사 =====
  const password        = document.getElementById('password');
  const passwordConfirm = document.getElementById('passwordConfirm');

  function createMessage(inputEl, id) {
    let msg = document.getElementById(id);
    if (!msg) {
      msg = document.createElement('p');
      msg.id = id;
      msg.style.cssText = 'font-size:13px; margin-top:5px; display:flex; align-items:center;';
      inputEl.parentNode.insertBefore(msg, inputEl.nextSibling);
    }
    return msg;
  }

  function setMessage(msg, text, color, showIcon = true) {
    msg.innerHTML = text
      ? `${showIcon ? `<img src="/media/caution.png" alt="caution" style="width:14px;height:14px;margin-right:1px;margin-top:-2px;vertical-align:middle;">` : ''}${text}`
      : '';
    msg.style.color = color || '';
  }

  const PW_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  password.addEventListener('input', () => {
    const msg = createMessage(password, 'pw-msg');
    if (password.value === '') { setMessage(msg, ''); return; }
    if (!PW_REGEX.test(password.value)) {
      setMessage(msg, '비밀번호는 8자 이상, 영문·숫자·특수문자를 모두 포함해야 합니다.', '#e53e3e');
    } else {
      setMessage(msg, '사용 가능한 비밀번호입니다.', '#0080ff', false);
    }
    if (passwordConfirm.value !== '') checkConfirm();
  });

  function checkConfirm() {
    const msg = createMessage(passwordConfirm, 'pw-confirm-msg');
    if (passwordConfirm.value === '') { setMessage(msg, ''); return; }
    if (password.value !== passwordConfirm.value) {
      setMessage(msg, '비밀번호가 일치하지 않습니다.', '#e53e3e');
    } else {
      setMessage(msg, '비밀번호가 일치합니다.', '#0080ff', false);
    }
  }

  passwordConfirm.addEventListener('input', checkConfirm);


  // ===== 5. 다음 버튼 유효성 검사 함수 =====
  window.validateLogin2 = function() {
    let isValid = true;

    // 이메일 인증 완료 여부 체크
    if (!isVerified) {
      if (!codeSent) {
        setFieldMsg(emailMsg, '이메일 인증을 진행해 주세요.', '#e53e3e');
      } else {
        setFieldMsg(verifyMsg, '인증코드를 확인해 주세요.', '#e53e3e');
      }
      isValid = false;
    }

    if (!PW_REGEX.test(password.value)) {
      const msg = createMessage(password, 'pw-msg');
      setMessage(msg, '비밀번호는 8자 이상, 영문·숫자·특수문자를 모두 포함해야 합니다.', '#e53e3e');
      isValid = false;
    }

    if (password.value !== passwordConfirm.value) {
      const msg = createMessage(passwordConfirm, 'pw-confirm-msg');
      setMessage(msg, '비밀번호가 일치하지 않습니다.', '#e53e3e');
      isValid = false;
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
      window.location.href = '/login1/login1.html';
    }
  });

});