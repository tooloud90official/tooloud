// searchResult/searchResult.js
import { supabase } from '/_ignore/supabase.js';
import { searchCategories } from '/_ignore/groq.js';

/* ===== URL에서 키워드 추출 ===== */
function getKeyword() {
  const params = new URLSearchParams(window.location.search);
  return decodeURIComponent(params.get('keyword') || '').trim();
}

/* ===== Groq로 태그 추출 ===== */
async function extractTags(keyword) {
  try {
    const result = await searchCategories(keyword);
    console.log('[groq] 추출된 태그:', result);
    return result;
  } catch (e) {
    console.error('[groq] 태그 추출 실패:', e.message);
    return null;
  }
}

/* ===== Supabase에서 툴 목록 조회 ===== */
async function fetchTools(groqResult, keyword) {

  // ✅ tool_names가 있으면 tool_name 직접 매칭 필터도 함께 구성
  const toolNames = groqResult?.tool_names || [];

  let toolQuery = supabase
    .from('tools')
    .select('tool_ID, tool_name, icon, tool_cat, tool_subcat, tool_link, tool_des, tool_key');

  if (groqResult && (
    groqResult.recommended_cats?.length > 0 ||
    groqResult.recommended_subcats?.length > 0 ||
    groqResult.keywords?.length > 0 ||
    toolNames.length > 0
  )) {
    const filters = [
      // ✅ tool_names → tool_name ilike 필터 추가
      ...toolNames.map(n => `tool_name.ilike.%${n}%`),
      ...(groqResult.recommended_cats    || []).map(c => `tool_cat.eq.${c}`),
      ...(groqResult.recommended_subcats || []).map(s => `tool_subcat.eq.${s}`),
      ...(groqResult.keywords            || []).map(k => `tool_key.ilike.%${k}%`),
    ].join(',');

    console.log('[supabase] 필터:', filters);
    toolQuery = toolQuery.or(filters);

  } else {
    console.warn('[search] Groq 실패 → 이름 검색 폴백');
    toolQuery = toolQuery.or(`tool_name.ilike.%${keyword}%,tool_key.ilike.%${keyword}%`);
  }

  const { data: tools, error: toolError } = await toolQuery.order('tool_name', { ascending: true });

  if (toolError) {
    console.error('[tools] Supabase 에러:', toolError.message);
    return [];
  }
  if (!tools || tools.length === 0) {
    console.warn('[tools] 조회된 툴 없음');
    return [];
  }

  console.log('[supabase] 조회된 툴 수:', tools.length);

  const toolIds = tools.map(t => t.tool_ID);
  const { data: reviews, error: reviewError } = await supabase
    .from('tool_reviews')
    .select('tool_id, rating')
    .in('tool_id', toolIds);

  if (reviewError) {
    console.warn('[reviews] 별점 조회 실패:', reviewError.message);
  }

  const ratingMap = {};
  if (reviews && reviews.length > 0) {
    reviews.forEach(r => {
      if (!ratingMap[r.tool_id]) ratingMap[r.tool_id] = [];
      ratingMap[r.tool_id].push(r.rating);
    });
  }

  const toolsWithRating = tools.map(tool => ({
    ...tool,
    avg_rating: ratingMap[tool.tool_ID]
      ? Math.round(ratingMap[tool.tool_ID].reduce((a, b) => a + b, 0) / ratingMap[tool.tool_ID].length)
      : 0,
  }));

  // ✅ tool_names 매칭 툴을 최상단으로 정렬
  if (toolNames.length > 0) {
    const isNameMatch = (tool) =>
      toolNames.some(n => tool.tool_name.toLowerCase().includes(n.toLowerCase()));

    const nameMatched  = toolsWithRating.filter(t => isNameMatch(t));
    const tagMatched   = toolsWithRating.filter(t => !isNameMatch(t));

    console.log('[sort] 이름 매칭:', nameMatched.map(t => t.tool_name));
    return [...nameMatched, ...tagMatched];
  }

  return toolsWithRating;
}

/* ===== 헤더 업데이트 ===== */
function updateHeader(keyword, count) {
  const keywordEl = document.getElementById('result-keyword');
  const countEl   = document.getElementById('result-count');
  if (keywordEl) keywordEl.textContent = `"${keyword}"`;
  if (countEl)   countEl.textContent   = count;
}

/* ===== 툴 카드 렌더링 ===== */
function renderResults(tools, keyword) {
  const list = document.querySelector('.result-list');
  if (!list) return;

  updateHeader(keyword, tools.length);
  list.innerHTML = '';

  if (tools.length === 0) {
    list.innerHTML = `
      <div class="no-result">
        <p>검색 결과가 없습니다.</p>
        <p>다른 키워드로 검색해보세요.</p>
      </div>`;
    return;
  }

  tools.forEach(tool => {
    let iconUrl = tool.icon;
    if (!iconUrl && tool.tool_link) {
      try {
        const domain = new URL(tool.tool_link).hostname.replace('www.', '');
        iconUrl = `https://logo.clearbit.com/${domain}`;
      } catch { /* 무시 */ }
    }
    if (!iconUrl) {
      iconUrl = `https://logo.clearbit.com/${tool.tool_name.toLowerCase().replace(/\s/g, '')}.com`;
    }

    const rating    = tool.avg_rating || 0;
    const starFull  = '★'.repeat(Math.min(rating, 5));
    const starEmpty = '★'.repeat(Math.max(5 - rating, 0));

    const card = document.createElement('div');
    card.className      = 'tool-card';
    card.dataset.url    = `/detail_AI/detail_AI.html?tool_id=${tool.tool_ID}`;
    card.dataset.link   = tool.tool_link || '';
    card.dataset.toolId = tool.tool_ID;
    card.dataset.rating = rating;

    card.innerHTML = `
      <div class="tool-icon">
        <img src="${iconUrl}" alt="${tool.tool_name}" onerror="this.style.display='none'">
      </div>
      <div class="tool-info">
        <div class="tool-top">
          <span class="tool-name">${tool.tool_name}</span>
          <span class="rating">
            <span style="color: orange;">${starFull}</span>
            <span style="color: #ccc;">${starEmpty}</span>
          </span>
        </div>
        <p class="tool-desc">${tool.tool_des || ''}</p>
      </div>
      <div class="tool-action">
        <span class="detail">상세 ></span>
      </div>
    `;
    list.appendChild(card);
  });

  bindDetailNavigation();
}

/* ===== recent_tools 저장 ===== */
async function saveRecentTool(toolId) {
  if (!toolId) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('users')
    .select('recent_tools')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.warn('[recent_tools] 조회 실패:', error.message);
    return;
  }

  const current = Array.isArray(data?.recent_tools) ? data.recent_tools : [];

  // ✅ 중복 제거 후 맨 앞에 추가, 최대 20개 유지
  const updated = [toolId, ...current.filter(id => id !== toolId)].slice(0, 20);

  const { error: updateError } = await supabase
    .from('users')
    .update({ recent_tools: updated })
    .eq('user_id', user.id);

  if (updateError) {
    console.warn('[recent_tools] 저장 실패:', updateError.message);
  }
}

/* ===== 상세 페이지 이동 + 외부 링크 연결 ===== */
function bindDetailNavigation() {
  document.querySelectorAll('.tool-card').forEach(card => {
    const detailBtn = card.querySelector('.detail');
    const iconEl    = card.querySelector('.tool-icon');

    // ✅ 외부 링크로 이동 + recent_tools 저장
    const goExternal = async (e) => {
      e.stopPropagation();
      const link   = card.dataset.link;
      const toolId = card.dataset.toolId;

      await saveRecentTool(toolId);

      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    };

    if (detailBtn) detailBtn.addEventListener('click', goExternal);
    if (iconEl)    iconEl.addEventListener('click', goExternal);
  });
}

/* ===== 정렬 ===== */
function applySort(sortVal) {
  const list  = document.querySelector('.result-list');
  const cards = Array.from(list.querySelectorAll('.tool-card'));

  cards.sort((a, b) => {
    if (sortVal === 'name') {
      const nameA = a.querySelector('.tool-name')?.textContent.trim() || '';
      const nameB = b.querySelector('.tool-name')?.textContent.trim() || '';
      return nameA.localeCompare(nameB, 'ko');
    }
    if (sortVal === 'rating') {
      return parseInt(b.dataset.rating || '0', 10) - parseInt(a.dataset.rating || '0', 10);
    }
    return 0;
  });

  cards.forEach(card => list.appendChild(card));
}

/* ===== 필터 초기화 ===== */
async function initFilters() {
  try {
    const { loadNativeSelect } = await import('/_common/select/select.js');
    await loadNativeSelect({
      target: '#filterSelect-sort',
      placeholder: '정렬',
      options: [
        { value: 'name',   label: '이름순' },
        { value: 'rating', label: '별점순' },
      ],
      onChange: ({ value }) => applySort(value),
    });
  } catch (e) {
    console.warn('[filter] 필터 초기화 실패:', e.message);
  }
}

/* ===== 검색바 초기화 ===== */
function initSearchBar(keyword) {
  try {
    loadSearchBar({
      target: '#searchbar-container',
      placeholder: keyword || '검색어를 입력하세요',
      onSearch: (value) => {
        const encoded = encodeURIComponent(value.trim());
        window.location.href = `/searchResult/searchResult.html?keyword=${encoded}`;
      }
    });
  } catch (e) {
    console.warn('[searchBar] loadSearchBar 실패:', e.message);
  }
}

/* ===== 로딩 표시 ===== */
function setLoading(isLoading) {
  const list = document.querySelector('.result-list');
  if (!list) return;
  if (isLoading) {
    list.innerHTML = '<p class="loading-text">AI가 검색 결과를 분석 중입니다...</p>';
  }
}

/* ===== 메인 초기화 ===== */
async function initPage() {
  const keyword = getKeyword();
  initSearchBar(keyword);

  if (!keyword) {
    updateHeader('', 0);
    await initFilters();
    return;
  }

  setLoading(true);

  const groqResult = await extractTags(keyword);
  const tools      = await fetchTools(groqResult, keyword);

  renderResults(tools, keyword);
  await initFilters();
}

document.addEventListener('DOMContentLoaded', initPage);