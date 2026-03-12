document.addEventListener('DOMContentLoaded', async () => {

  /* =====================================================
     [0] 빈 상태 플래그
     ===================================================== */
  const EMPTY_MODE = false;


  /* =====================================================
     [1] 데이터
     ===================================================== */

  const RECENT_TOOLS = [
    { name: 'Framer',  img: 'https://logo.clearbit.com/framer.com' },
    { name: 'Notion',  img: 'https://logo.clearbit.com/notion.so' },
    { name: 'Figma',   img: 'https://logo.clearbit.com/figma.com' },
  ];

  const AI_TOOLS = [
    { name: 'Notion',  img: 'https://logo.clearbit.com/notion.so' },
    { name: 'Claude',  img: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399' },
    { name: 'Gamma',   img: 'https://logo.clearbit.com/gamma.app' },
  ];

  const FAVORITE_TOOLS = [
    { name: 'Canva',   img: 'https://logo.clearbit.com/canva.com' },
    { name: 'ChatGPT', img: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399' },
  ];

  const MY_REVIEWS = [
    { toolName: '네이버 클로바 더빙', toolImg: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399',   date: '2026/01/26', rating: 5, text: 'AI 보이스 진짜 사람같네요...' },
    { toolName: 'Jotform',           toolImg: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399', date: '2026/01/26', rating: 4, text: '폼 만들기가 너무 쉬워요.' },
    { toolName: 'Linear',            toolImg: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399',  date: '2026/01/26', rating: 4, text: '이슈 트래킹이 깔끔해요.' },
    { toolName: 'Framer',            toolImg: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399',  date: '2026/01/26', rating: 5, text: '레이아웃 잡기가 편해요.' },
    { toolName: 'Adobe',             toolImg: 'https://cdn.brandfetch.io/ideA07K8J2/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1766207012399',   date: '2026/01/26', rating: 3, text: '기능은 많은데 무거워요.' },
  ];

  const WORKS_DATA = {
    '문서': [
      { name: '오토레이아웃 가이드.pdf', ext: 'PDF', size: '2.4 MB', date: '2026/01/20' },
      { name: '브랜드 기획서.pdf',      ext: 'PDF', size: '1.1 MB', date: '2026/01/18',thumb: '/media/pdfthumbnail.png' },
    ],
    '이미지': [
      { name: 'UI 시안_최종.png',  img: 'https://picsum.photos/200/120?random=1', size: '3.2 MB', date: '2026/01/22' },
      { name: '배너_수정본.jpg',   img: 'https://picsum.photos/200/120?random=2', size: '1.8 MB', date: '2026/01/19' },
    ],
    '영상': [
      { name: '프로모션_영상.mp4', duration: '0:42', date: '2026/01/15' },
      { name: '튜토리얼_클립.mov', duration: '1:23', date: '2026/01/10' },
    ],
    '오디오': [
      { name: 'AI_보이스_샘플.mp3', duration: '0:28', date: '2026/01/21' },
      { name: '배경음악_초안.wav',   duration: '2:14', date: '2026/01/17' },
    ],
  };

  let currentWorksFilter = '문서';


  /* =====================================================
     [2] 빈 상태 오버레이 헬퍼
     ===================================================== */

  function applyEmptyOverlay(wrapperEl, message) {
    if (!wrapperEl) return;
    wrapperEl.classList.add('empty-blurred');
    const overlay = document.createElement('div');
    overlay.className = 'empty-overlay';
    overlay.innerHTML = `
      <span class="empty-overlay__icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </span>
      <span class="empty-overlay__msg">${message}</span>
    `;
    wrapperEl.style.position = 'relative';
    wrapperEl.appendChild(overlay);
  }


  /* =====================================================
     [3] 아이콘 마크업 생성 헬퍼
     ===================================================== */

  function iconCardHtml(imgUrl, sizeKey = 'lg') {
    return `<div class="mypage-icon mypage-icon--${sizeKey}"
                 style="background-image:url('${imgUrl}');"></div>`;
  }


  /* =====================================================
     [4] 내가 쓴 리뷰 카드 렌더링 (대시보드)
     ===================================================== */

  function renderReviewList() {
    const container = document.getElementById('reviewList');
    if (!container) return;

    const starsHtml = (rating) =>
      '★'.repeat(rating) + '☆'.repeat(5 - rating) + ' ' + rating + '.0';

    const dummyReviews = [
      { toolName: '툴 이름', toolImg: '', date: '----/--/--', rating: 5, text: '리뷰 내용이 표시됩니다.' },
      { toolName: '툴 이름', toolImg: '', date: '----/--/--', rating: 4, text: '리뷰 내용이 표시됩니다.' },
      { toolName: '툴 이름', toolImg: '', date: '----/--/--', rating: 3, text: '리뷰 내용이 표시됩니다.' },
    ];

    const source = EMPTY_MODE ? dummyReviews : MY_REVIEWS;

    container.innerHTML = source.map(r => `
      <li class="review-item">
        <div class="review-item__header">
          <span class="review-item__tool-name">${r.toolName}</span>
          <span class="review-item__date">${r.date}</span>
        </div>
        <div class="review-item__row">
          ${iconCardHtml(r.toolImg, 'sm')}
          <div style="display:flex;flex-direction:column;flex:1;min-width:0;gap:2px;">
            <span class="review-item__stars">${starsHtml(r.rating)}</span>
            <span class="review-item__desc">${r.text}</span>
          </div>
        </div>
      </li>
    `).join('');

    if (EMPTY_MODE) {
      const card = container.closest('.dashboard-card');
      applyEmptyOverlay(card, '작성한 리뷰가 없습니다');
    }
  }


  /* =====================================================
     [5] 리뷰 관리 섹션 렌더링
     ===================================================== */

  function renderReviewManage() {
    const container = document.getElementById('reviewManageList');
    if (!container) return;

    if (EMPTY_MODE) {
      container.innerHTML = `
        <div class="review-manage-item">
          <div class="mypage-icon mypage-icon--md" style="background-color:#e8eef5;"></div>
          <div class="review-manage-item__body">
            <div class="review-manage-item__meta">툴 이름 · ----/--/--</div>
            <div class="review-manage-item__text">리뷰 내용이 표시됩니다.</div>
          </div>
          <div class="review-manage-item__actions">
            <button class="review-action-btn" disabled>수정</button>
            <button class="review-action-btn review-action-btn--delete" disabled>삭제</button>
          </div>
        </div>
        <div class="review-manage-item">
          <div class="mypage-icon mypage-icon--md" style="background-color:#e8eef5;"></div>
          <div class="review-manage-item__body">
            <div class="review-manage-item__meta">툴 이름 · ----/--/--</div>
            <div class="review-manage-item__text">리뷰 내용이 표시됩니다.</div>
          </div>
          <div class="review-manage-item__actions">
            <button class="review-action-btn" disabled>수정</button>
            <button class="review-action-btn review-action-btn--delete" disabled>삭제</button>
          </div>
        </div>
      `;
      applyEmptyOverlay(container, '작성한 리뷰가 없습니다');
      return;
    }

    container.innerHTML = '';

    MY_REVIEWS.forEach((r, idx) => {
      const item = document.createElement('div');
      item.className = 'review-manage-item';

      const renderView = () => {
        item.innerHTML = `
          ${iconCardHtml(r.toolImg, 'md')}
          <div class="review-manage-item__body">
            <div class="review-manage-item__meta">${r.toolName} · ${r.date}</div>
            <div class="review-manage-item__text">${r.text}</div>
          </div>
          <div class="review-manage-item__actions">
            <button class="review-action-btn edit-btn">수정</button>
            <button class="review-action-btn review-action-btn--delete delete-btn">삭제</button>
          </div>
        `;
        item.querySelector('.edit-btn').onclick = renderEdit;
        item.querySelector('.delete-btn').onclick = () => {
          if (!confirm('리뷰를 삭제할까요?')) return;
          MY_REVIEWS.splice(idx, 1);
          renderReviewList();
          renderReviewManage();
        };
      };

      const renderEdit = () => {
        item.innerHTML = `
          ${iconCardHtml(r.toolImg, 'md')}
          <div class="review-manage-item__body">
            <div class="review-manage-item__meta">${r.toolName} · ${r.date}</div>
            <textarea class="review-edit-textarea" rows="2">${r.text}</textarea>
          </div>
          <div class="review-manage-item__actions">
            <button class="review-action-btn save-btn">저장</button>
            <button class="review-action-btn review-action-btn--cancel cancel-btn">취소</button>
          </div>
        `;
        item.querySelector('.save-btn').onclick = () => {
          MY_REVIEWS[idx].text = item.querySelector('textarea').value;
          r.text = MY_REVIEWS[idx].text;
          renderReviewList();
          renderReviewManage();
        };
        item.querySelector('.cancel-btn').onclick = renderView;
      };

      renderView();
      container.appendChild(item);
    });
  }


  /* =====================================================
     [6] 툴 슬라이더
     ===================================================== */

  function renderToolSlider(containerId, tools, isEmpty = false, emptyMsg = '사용한 툴이 없습니다') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (isEmpty) {
      container.innerHTML = `
        <button class="slider-arrow prev" disabled>
          <img src="/media/next.png" alt="이전">
        </button>
        <div class="mypage-icon mypage-icon--lg" style="background-color:#e8eef5;"></div>
        <button class="slider-arrow next" disabled>
          <img src="/media/next.png" alt="다음">
        </button>
      `;
      const card = container.closest('.dashboard-card');
      applyEmptyOverlay(card, emptyMsg);
      return;
    }

    let idx = 0;
    const update = () => {
      const tool = tools[idx];
      container.innerHTML = `
        <button class="slider-arrow prev">
          <img src="/media/next.png" alt="이전">
        </button>
        ${iconCardHtml(tool.img, 'lg')}
        <button class="slider-arrow next">
          <img src="/media/next.png" alt="다음">
        </button>
      `;
      container.querySelector('.prev').onclick = () => {
        idx = (idx - 1 + tools.length) % tools.length;
        update();
      };
      container.querySelector('.next').onclick = () => {
        idx = (idx + 1) % tools.length;
        update();
      };
    };
    update();
  }


  /* =====================================================
     [7] 업로드한 작업물 렌더링 (가로형 카드)
     ===================================================== */

  /**
   * 오디오 플레이어 인터랙션 연결
   * @param {HTMLElement} item - .work-item 엘리먼트
   * @param {string} duration  - "0:28" 형식의 총 길이 문자열
   */
  function initAudioPlayer(item, duration) {
    const playBtn  = item.querySelector('.work-audio-play');
    const progress = item.querySelector('.work-audio-progress');
    const timeEl   = item.querySelector('.work-audio-time');
    if (!playBtn) return;

    // 총 초 계산
    const [min, sec] = duration.split(':').map(Number);
    const totalSec = min * 60 + sec;
    let elapsed = 0;
    let playing = false;
    let timer   = null;

    const PLAY_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>`;
    const PAUSE_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8"/><rect x="6" y="1" width="3" height="8"/></svg>`;

    const fmt = (s) => {
      const m = Math.floor(s / 60);
      const ss = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${ss}`;
    };

    const update = () => {
      const pct = totalSec > 0 ? (elapsed / totalSec) * 100 : 0;
      progress.style.width = pct + '%';
      timeEl.textContent = fmt(elapsed);
    };

    const stop = () => {
      clearInterval(timer);
      playing = false;
      playBtn.innerHTML = PLAY_SVG;
    };

    playBtn.innerHTML = PLAY_SVG;

    playBtn.addEventListener('click', () => {
      if (playing) {
        stop();
      } else {
        if (elapsed >= totalSec) elapsed = 0;
        playing = true;
        playBtn.innerHTML = PAUSE_SVG;
        timer = setInterval(() => {
          elapsed += 0.5;
          if (elapsed >= totalSec) {
            elapsed = totalSec;
            update();
            stop();
            return;
          }
          update();
        }, 500);
      }
    });

    // 트랙 클릭으로 탐색
    const track = item.querySelector('.work-audio-track');
    if (track) {
      track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        elapsed = ratio * totalSec;
        update();
      });
    }

    update();
  }

  /**
   * 영상 플레이어 인터랙션 연결 (시뮬레이션)
   * @param {HTMLElement} item - .work-item 엘리먼트
   * @param {string} duration  - "0:42" 형식의 총 길이 문자열
   */
  function initVideoPlayer(item, duration) {
    const playBtn  = item.querySelector('.work-video-play');
    const progress = item.querySelector('.work-video-progress');
    const timeEl   = item.querySelector('.work-video-time');
    if (!playBtn) return;

    const [min, sec] = duration.split(':').map(Number);
    const totalSec = min * 60 + sec;
    let elapsed = 0;
    let playing = false;
    let timer   = null;

    const PLAY_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>`;
    const PAUSE_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="3" height="8"/><rect x="6" y="1" width="3" height="8"/></svg>`;

    const fmt = (s) => {
      const m = Math.floor(s / 60);
      const ss = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${ss}`;
    };

    const update = () => {
      const pct = totalSec > 0 ? (elapsed / totalSec) * 100 : 0;
      progress.style.width = pct + '%';
      timeEl.textContent = fmt(elapsed);
    };

    const stop = () => {
      clearInterval(timer);
      playing = false;
      playBtn.innerHTML = PLAY_SVG;
    };

    playBtn.innerHTML = PLAY_SVG;

    playBtn.addEventListener('click', () => {
      if (playing) {
        stop();
      } else {
        if (elapsed >= totalSec) elapsed = 0;
        playing = true;
        playBtn.innerHTML = PAUSE_SVG;
        timer = setInterval(() => {
          elapsed += 0.5;
          if (elapsed >= totalSec) {
            elapsed = totalSec;
            update();
            stop();
            return;
          }
          update();
        }, 500);
      }
    });

    const track = item.querySelector('.work-video-track');
    if (track) {
      track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        elapsed = ratio * totalSec;
        update();
      });
    }

    update();
  }

  /**
   * 필터에 맞는 작업물 목록을 가로형 카드로 렌더링
   */
  function renderWorksContent(filter) {
    const container = document.getElementById('worksContent');
    if (!container) return;

    const items = WORKS_DATA[filter] || [];
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = `<p style="text-align:center;color:#aaa;font-size:13px;padding:24px 0;">업로드된 파일이 없습니다.</p>`;
      return;
    }

    const list = document.createElement('div');
    list.className = 'works-list';

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'work-item';

      let thumbHtml = '';
      let infoHtml  = '';

      if (filter === '문서') {
        thumbHtml = item.thumb
          ? `<div class="work-thumb work-thumb--doc">
               <img src="${item.thumb}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
             </div>`
          : `<div class="work-thumb work-thumb--doc">
               <span class="doc-ext">${item.ext}</span>
               <div class="doc-lines">
                 <div class="doc-line"></div>
                 <div class="doc-line"></div>
                 <div class="doc-line" style="width:70%;"></div>
               </div>
             </div>`;
        infoHtml = `
          <div class="work-info">
            <span class="work-name">${item.name}</span>
            <span class="work-meta">${item.size} · ${item.date}</span>
          </div>`;

      } else if (filter === '이미지') {
        thumbHtml = `
          <div class="work-thumb work-thumb--image">
            ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ''}
          </div>`;
        infoHtml = `
          <div class="work-info">
            <span class="work-name">${item.name}</span>
            <span class="work-meta">${item.size} · ${item.date}</span>
          </div>`;

      } else if (filter === '영상') {
        thumbHtml = `
          <div class="work-thumb work-thumb--video" style="position:relative;">
            ${item.thumb ? `<img src="${item.thumb}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : ''}
            <button class="work-video-play" style="
              position:absolute;inset:0;margin:auto;
              width:28px;height:28px;border-radius:50%;
              background:rgba(255,255,255,0.9);border:none;
              cursor:pointer;display:flex;align-items:center;justify-content:center;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:2;color:#1a1a2e;
              transition:transform 0.15s;
            "></button>
          </div>`;
        infoHtml = `
          <div class="work-info">
            <span class="work-name">${item.name}</span>
            <span class="work-meta">${item.date}</span>
            <div class="work-video-bar">
              <div class="work-video-track">
                <div class="work-video-progress"></div>
              </div>
              <span class="work-video-time">${item.duration}</span>
            </div>
          </div>`;

      } else if (filter === '오디오') {
        thumbHtml = item.thumb
          ? `<div class="work-thumb work-thumb--audio">
               <img src="${item.thumb}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
             </div>`
          : `<div class="work-thumb work-thumb--audio">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                 <path d="M9 18V5l12-2v13"/>
                 <circle cx="6" cy="18" r="3"/>
                 <circle cx="18" cy="16" r="3"/>
               </svg>
             </div>`;
        infoHtml = `
          <div class="work-info">
            <span class="work-name">${item.name}</span>
            <span class="work-meta">${item.date}</span>
            <div class="work-audio-bar">
              <button class="work-audio-play"></button>
              <div class="work-audio-track">
                <div class="work-audio-progress"></div>
              </div>
              <span class="work-audio-time">${item.duration}</span>
            </div>
          </div>`;
      }

      div.innerHTML = thumbHtml + infoHtml;
      list.appendChild(div);

      // 플레이어 초기화
      if (filter === '오디오') {
        initAudioPlayer(div, item.duration);
      } else if (filter === '영상') {
        // 썸네일 내 play 버튼도 info 내 트랙과 연동
        initVideoPlayer(div, item.duration);
      }
    });

    container.appendChild(list);
  }

  function renderWorks() {
    const worksCard = document.querySelector('.works-card');

    if (EMPTY_MODE) {
      applyEmptyOverlay(worksCard, '업로드한 작업물이 없습니다');
      return;
    }

    // 네이티브 select 직접 생성
    const filterTarget = document.getElementById('worksFilterSelect');
    if (filterTarget) {
      filterTarget.innerHTML = `
        <select style="
          height:36px;
          padding:0 32px 0 12px;
          border:1.5px solid #e0e8f5;
          border-radius:10px;
          font-size:13px;
          font-weight:600;
          color:#1a1a2e;
          background:#fff url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path d=%22M0 0l5 6 5-6z%22 fill=%22%23888%22/></svg>') no-repeat right 10px center;
          background-size:10px 6px;
          appearance:none;
          -webkit-appearance:none;
          cursor:pointer;
          outline:none;
          box-sizing:border-box;
        ">
          <option value="문서">문서</option>
          <option value="이미지">이미지</option>
          <option value="영상">영상</option>
          <option value="오디오">오디오</option>
        </select>
      `;
      const sel = filterTarget.querySelector('select');
      sel.value = currentWorksFilter;
      sel.addEventListener('change', (e) => {
        currentWorksFilter = e.target.value;
        renderWorksContent(e.target.value);
      });
    }

    renderWorksContent(currentWorksFilter);
  }


  /* =====================================================
     [8] 내 정보 수정 폼
     ===================================================== */

  async function initInfoEditForm() {
    const initSelect = (wrapperId, options, defaultValue) => {
      const wrap = document.getElementById(wrapperId);
      if (!wrap) return;
      wrap.innerHTML = `
        <select class="edit-input">
          ${options.map(o =>
            `<option${o === defaultValue ? ' selected' : ''}>${o}</option>`
          ).join('')}
        </select>
      `;
    };

    initSelect('selectJobWrap',     ['마케터', '개발자', '디자이너', '기획자', '기타'], '마케터');
    initSelect('selectAgeWrap',     ['10대', '20대', '30대', '40대', '50대 이상'],       '20대');
    initSelect('selectCountryWrap', ['대한민국', '미국', '일본', '중국', '기타'],        '대한민국');

    await loadButton({
      target: '#nicknameCheckContainer',
      text: '중복확인',
      variant: 'outline',
      onClick: () => {
        const nick = document.getElementById('editNickname').value.trim();
        if (!nick) return alert('닉네임을 입력해주세요.');
        alert(`"${nick}"은(는) 사용 가능한 닉네임입니다.`);
      },
    });

    await loadButton({
      target: '#infoSubmitContainer',
      text: '수정',
      variant: 'primary',
      onClick: () => alert('정보가 수정되었습니다.'),
    });
  }


  /* =====================================================
     [9] FAQ 드롭다운
     ===================================================== */

  function initFaqItems() {
    document.querySelectorAll('[data-drop_down]').forEach(drop => {
      const trigger = drop.querySelector('[data-faq-trigger]');
      const panel   = drop.querySelector('[data-faq-panel]');
      if (!trigger || !panel) return;

      panel.style.display = 'none';

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));
        panel.setAttribute('aria-hidden', String(isOpen));
        panel.style.display = isOpen ? 'none' : 'block';
      });
    });
  }


  /* =====================================================
     [10] 버튼 클릭 동작
     ===================================================== */

  function initButtonActions() {
    document.querySelectorAll('[data-scroll-to]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.getAttribute('data-scroll-to'));
        if (!target) return;

        const trigger = target.querySelector('[data-faq-trigger]');
        const panel   = target.querySelector('[data-faq-panel]');
        if (trigger && panel && trigger.getAttribute('aria-expanded') !== 'true') {
          trigger.setAttribute('aria-expanded', 'true');
          panel.setAttribute('aria-hidden', 'false');
          panel.style.display = 'block';
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('[data-href]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = btn.getAttribute('data-href');
      });
    });
  }


  /* =====================================================
     [11] 1:1 문의 버튼
     ===================================================== */

  await loadButton({
    target: '#inquiryBtnContainer',
    text: '문의하기',
    variant: 'primary',
    onClick: () => { window.location.href = '/inquiry/inquiry.html'; },
  });


  /* =====================================================
     [12] 초기화
     ===================================================== */

  initFaqItems();
  initButtonActions();
  await initInfoEditForm();

  renderToolSlider('aiToolSlider', AI_TOOLS, false);
  renderToolSlider('recentToolSlider',   RECENT_TOOLS,   EMPTY_MODE, '사용한 툴이 없습니다');
  renderToolSlider('favoriteToolSlider', FAVORITE_TOOLS, EMPTY_MODE, '관심 툴이 없습니다');

  renderReviewList();
  renderReviewManage();
  renderWorks();

});