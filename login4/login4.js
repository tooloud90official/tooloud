// login4.js
import { supabase } from '/_ignore/supabase.js';

document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // 툴 데이터
  // =============================
  const TOOLS = [
    { name: 'Descript',   img: 'https://logo.clearbit.com/descript.com' },
    { name: 'Adobe',      img: 'https://logo.clearbit.com/adobe.com' },
    { name: 'Midjourney', img: 'https://logo.clearbit.com/midjourney.com' },
    { name: 'Lilys',      img: 'https://logo.clearbit.com/lilys.ai' },
    { name: 'Cursor',     img: 'https://logo.clearbit.com/cursor.sh' },
    { name: 'Pitch',      img: 'https://logo.clearbit.com/pitch.com' },
    { name: 'Notion',     img: 'https://logo.clearbit.com/notion.so' },
    { name: 'Figma',      img: 'https://logo.clearbit.com/figma.com' },
    { name: 'ChatGPT',    img: 'https://logo.clearbit.com/openai.com' },
  ];

  const MAX_SELECT = 5;

  const toolGrid      = document.getElementById('toolGrid');
  const selectedIcons = document.getElementById('selectedIcons');
  const selectedCount = document.getElementById('selectedCount');
  const progressFill  = document.getElementById('progressFill');
  const finishBtn     = document.getElementById('finishBtn');

  let selectedTools = [];


  // =============================
  // 툴 그리드 렌더링
  // =============================
  function renderGrid() {
    toolGrid.innerHTML = '';
    TOOLS.forEach(tool => {
      const card = document.createElement('div');
      card.className = 'tool-icon-card';
      card.dataset.toolName = tool.name;
      card.innerHTML = `
        <span class="tool-icon-card__icon">
          <img src="${tool.img}" alt="${tool.name}" onerror="this.style.display='none'">
        </span>
        <span class="tool-icon-card__title">${tool.name}</span>
      `;
      if (selectedTools.includes(tool.name)) card.classList.add('is-selected');
      card.addEventListener('click', () => toggleTool(tool.name, card));
      toolGrid.appendChild(card);
    });
    updateMaxClass();
  }

  function toggleTool(name, cardEl) {
    const isSelected = selectedTools.includes(name);
    if (isSelected) {
      selectedTools = selectedTools.filter(t => t !== name);
      cardEl.classList.remove('is-selected');
    } else {
      if (selectedTools.length >= MAX_SELECT) return;
      selectedTools.push(name);
      cardEl.classList.add('is-selected');
    }
    updateMaxClass();
    renderSelected();
    updateCount();
  }

  function updateMaxClass() {
    toolGrid.classList.toggle('is-max', selectedTools.length >= MAX_SELECT);
  }

  function renderSelected() {
    selectedIcons.innerHTML = '';
    selectedTools.forEach(name => {
      const tool = TOOLS.find(t => t.name === name);
      if (!tool) return;
      const card = document.createElement('div');
      card.className = 'tool-icon-card';
      card.innerHTML = `
        <span class="tool-icon-card__icon">
          <img src="${tool.img}" alt="${tool.name}" onerror="this.style.display='none'">
        </span>
        <span class="tool-icon-card__title">${tool.name}</span>
      `;
      selectedIcons.appendChild(card);
    });
  }

  function updateCount() {
    const count = selectedTools.length;
    selectedCount.textContent = `${count}/${MAX_SELECT}`;
    progressFill.style.width = `${(count / MAX_SELECT) * 100}%`;
  }


  // =============================
  // user_id 생성: user001 형식
  // =============================
  async function generateUserId() {
    const { data, error } = await supabase.from('users').select('user_id');
    if (error) throw error;
    if (!data || data.length === 0) return 'user001';

    const maxNum = data.reduce((max, row) => {
      const match = row.user_id?.match(/^user(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    return `user${String(maxNum + 1).padStart(3, '0')}`;
  }


  // =============================
  // 완료 버튼 → users 테이블 insert
  // =============================
  finishBtn.addEventListener('click', async () => {
    if (selectedTools.length === 0) {
      alert('최소 1개 이상의 툴을 선택해주세요.');
      return;
    }

    finishBtn.disabled = true;
    finishBtn.textContent = '처리 중...';

    try {
      const nickname = sessionStorage.getItem('signup_nickname');
      const age      = sessionStorage.getItem('signup_age');
      const job      = sessionStorage.getItem('signup_job');
      const country  = sessionStorage.getItem('signup_country');

      if (!nickname) {
        alert('입력 정보가 없습니다. 처음부터 다시 진행해주세요.');
        window.location.href = '/login2/login2.html';
        return;
      }

      const newUserId = await generateUserId();

      const { error } = await supabase.from('users').insert({
        user_id        : newUserId,
        user_name      : nickname,
        user_img       : '시스템 지정 이미지',
        user_country   : country,
        user_age       : age,
        user_job       : job,
        favorite_tools : selectedTools,
      });

      if (error) throw error;

      // sessionStorage 정리
      ['signup_email','signup_password','signup_uid',
       'signup_nickname','signup_age','signup_job','signup_country']
        .forEach(k => sessionStorage.removeItem(k));

      window.location.href = '/login5/login5.html';

    } catch (err) {
      console.error('[users insert 오류]', err);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      finishBtn.disabled = false;
      finishBtn.textContent = '완료';
    }
  });


  // =============================
  // 초기 렌더
  // =============================
  renderGrid();
  renderSelected();
  updateCount();

});