// login3.js
import { loadNativeSelect } from '/_common/select/select.js';
import { supabase } from '/_ignore/supabase.js';

document.addEventListener("DOMContentLoaded", async () => {

  // ===== 0. 신규/기존 유저 판단 =====
  // 소셜 로그인으로 넘어온 경우 users 테이블에 이미 있으면 main1으로
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    const authEmail = session.user.email;

    // users 테이블에서 이메일로 조회 (auth uid 저장 컬럼 없으므로 이메일 기준)
    // → user_name이 아니라 별도 컬럼이 없기 때문에 auth.users id 기준으로
    //   signup_uid를 sessionStorage에 저장해둔 경우를 제외하고
    //   소셜 로그인 신규 유저는 sessionStorage에 아무것도 없음
    // → users 테이블에 같은 이메일로 가입된 유저가 있는지 확인하기 위해
    //   user_id 컬럼에 auth uid를 저장하는 구조가 필요하나,
    //   현재는 user001 형식이므로 전체 조회 후 auth uid 매칭 불가
    // → 대신 Supabase auth.users의 created_at과 last_sign_in_at 비교:
    //   처음 로그인이면 created_at ≈ last_sign_in_at (차이 5초 이내)
    const createdAt     = new Date(session.user.created_at).getTime();
    const lastSignIn    = new Date(session.user.last_sign_in_at).getTime();
    const isNewUser     = Math.abs(lastSignIn - createdAt) < 5000;

    if (!isNewUser) {
      // 기존 유저 → 바로 메인으로
      window.location.href = '/main1/main1.html';
      return;
    }

    // 신규 소셜 유저 → sessionStorage에 이메일 저장 (login4에서 insert 시 참고용)
    sessionStorage.setItem('signup_email', authEmail);
  }


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


  // ===== 2. 직업 / 국가 / 연령대 셀렉트 =====
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

  await loadNativeSelect({
    target: '#age-select-wrap',
    placeholder: '선택 해주세요',
    options: [
      { value: '10대', label: '10대' },
      { value: '20대', label: '20대' },
      { value: '30대', label: '30대' },
      { value: '40대', label: '40대' },
      { value: '50대', label: '50대' },
      { value: '60대', label: '60대' },
      { value: '70대', label: '70대' },
    ]
  });


  // ===== 3. 닉네임 중복 확인 (Supabase 조회) =====
  const nicknameInput   = document.getElementById('nickname');
  const nicknameMsg     = document.getElementById('nickname-msg');
  const checkBtn        = document.getElementById('check-duplicate-btn');
  let isNicknameChecked = false;

  const CAUTION_ICON = `<img src="/media/caution.png" alt="caution" style="width:14px;height:14px;margin-right:1px;margin-top:-2px;vertical-align:middle;">`;

  nicknameInput?.addEventListener('input', () => {
    isNicknameChecked = false;
    nicknameMsg.innerHTML = '';
  });

  checkBtn?.addEventListener('click', async () => {
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

    checkBtn.disabled = true;
    nicknameMsg.innerHTML = '확인 중...';
    nicknameMsg.style.color = '#888';

    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_name')
        .eq('user_name', val)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        isNicknameChecked = false;
        nicknameMsg.innerHTML = `${CAUTION_ICON}이미 사용 중인 닉네임입니다.`;
        nicknameMsg.style.color = '#e53e3e';
      } else {
        isNicknameChecked = true;
        nicknameMsg.innerHTML = '사용 가능한 닉네임입니다.';
        nicknameMsg.style.color = '#0080ff';
      }
    } catch (err) {
      nicknameMsg.innerHTML = `${CAUTION_ICON}확인 중 오류가 발생했습니다.`;
      nicknameMsg.style.color = '#e53e3e';
      console.error('[닉네임 중복 확인 오류]', err);
    } finally {
      checkBtn.disabled = false;
    }
  });


  // ===== 4. 다음 버튼 유효성 검사 =====
  window.validateLogin3 = function() {
    let isValid = true;

    const CAUTION = `<img src="/media/caution.png" alt="caution" style="width:14px;height:14px;margin-right:1px;margin-top:-2px;vertical-align:middle;">`;

    // 닉네임
    if (!isNicknameChecked) {
      nicknameMsg.innerHTML = `${CAUTION}닉네임 중복 확인을 해주세요.`;
      nicknameMsg.style.color = '#e53e3e';
      isValid = false;
    }

    // 연령대
    const ageSelect = document.querySelector('#age-select-wrap select');
    const ageValue  = ageSelect?.value || '';
    if (!ageValue) {
      let ageMsg = document.getElementById('age-msg');
      if (!ageMsg) {
        ageMsg = document.createElement('p');
        ageMsg.id = 'age-msg';
        ageMsg.className = 'field-msg';
        document.getElementById('age-select-wrap').insertAdjacentElement('afterend', ageMsg);
      }
      ageMsg.innerHTML = `${CAUTION}연령대를 선택해주세요.`;
      ageMsg.style.color = '#e53e3e';
      isValid = false;
    } else {
      const ageMsg = document.getElementById('age-msg');
      if (ageMsg) ageMsg.innerHTML = '';
    }

    // 직업
    const jobSelect = document.querySelector('#job-select-wrap select');
    const jobValue  = jobSelect?.value || '';
    if (!jobValue) {
      let jobMsg = document.getElementById('job-msg');
      if (!jobMsg) {
        jobMsg = document.createElement('p');
        jobMsg.id = 'job-msg';
        jobMsg.className = 'field-msg';
        document.getElementById('job-select-wrap').insertAdjacentElement('afterend', jobMsg);
      }
      jobMsg.innerHTML = `${CAUTION}직업을 선택해주세요.`;
      jobMsg.style.color = '#e53e3e';
      isValid = false;
    } else {
      const jobMsg = document.getElementById('job-msg');
      if (jobMsg) jobMsg.innerHTML = '';
    }

    // 국가
    const countrySelect = document.querySelector('#country-select-wrap select');
    const countryValue  = countrySelect?.value || '';
    if (!countryValue) {
      let countryMsg = document.getElementById('country-msg');
      if (!countryMsg) {
        countryMsg = document.createElement('p');
        countryMsg.id = 'country-msg';
        countryMsg.className = 'field-msg';
        document.getElementById('country-select-wrap').insertAdjacentElement('afterend', countryMsg);
      }
      countryMsg.innerHTML = `${CAUTION}국가를 선택해주세요.`;
      countryMsg.style.color = '#e53e3e';
      isValid = false;
    } else {
      const countryMsg = document.getElementById('country-msg');
      if (countryMsg) countryMsg.innerHTML = '';
    }

    if (isValid) {
      sessionStorage.setItem('signup_nickname', nicknameInput.value.trim());
      sessionStorage.setItem('signup_age',      ageValue);
      sessionStorage.setItem('signup_job',      jobValue);
      sessionStorage.setItem('signup_country',  countryValue);
    }

    return isValid;
  };


  // ===== 5. confirm 모달 초기화 =====
  if (!document.getElementById('modal-root')) {
    const root = document.createElement('div');
    root.id = 'modal-root';
    document.body.appendChild(root);
  }

  await window.includeHTML('#modal-root', '/_common/confirm/confirm.html');


  // ===== 6. 이전으로 돌아가기 =====
  document.getElementById('backBtn')?.addEventListener('click', async () => {
    const result = await window.showConfirm({
      title      : '페이지를 나가시겠습니까?',
      desc       : '입력한 내용이 저장되지 않습니다.',
      confirmText: '확인',
      cancelText : '취소',
    });
    if (result) window.location.href = '/login2/login2.html';
  });

});