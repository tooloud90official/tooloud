import { SUPABASE_URL } from "/_ignore/supabase.js";
import { supabase } from "/_ignore/supabase.js";

// ===== 카테고리 =====
const categories = {
  대분류: {
    media: '이미지/오디오/영상',
    res:   '리서치',
    doc:   '문서',
    dev:   '개발/코딩',
    edu:   '학습/교육',
    ast:   '챗봇/어시스턴트'
  },
  소분류: {
    img_gen:  '이미지 생성',
    img_edit: '이미지 편집',
    vid_gen:  '영상 생성',
    vid_edit: '영상 편집',
    aud_gen:  '음성 생성',
    aud_edit: '오디오 편집',
    res_paper:'논문 리서치',
    res_img:  '이미지 리서치',
    res_shop: '쇼핑 리서치',
    doc_gen:  '문서 생성',
    doc_sum:  '문서 요약',
    doc_edit: '문서 편집',
    dev_gen:  '코드 생성',
    dev_bld:  '웹/앱 빌더',
    edu_lan:  '언어',
    edu_supp: '학습 보조',
    ast_gen:  '생성형 AI',
    ast_work: '협업'
  }
};

//////////////////////////////
// ===== 문자열 정규화 =====
//////////////////////////////

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace(/[^a-z0-9가-힣]/g, '');
}

//////////////////////////////
// ===== 자연어 → 핵심 토큰 분해 =====
// "고양이 사진을 그리는 AI 툴" → ["고양이", "사진", "그리는", "AI", "툴"]
// 불필요한 조사/어미 제거 후 의미 있는 단어만 추출
//////////////////////////////

const STOP_WORDS = new Set([
  '을', '를', '이', '가', '은', '는', '의', '에', '서', '로', '으로',
  '와', '과', '도', '만', '에서', '한', '하는', '해주는', '위한',
  '수', '있는', '있어요', '줘', '주는', '하고', '싶은', '좋은',
  'ai', 'AI', '툴', '도구', '앱', '프로그램', '소프트웨어',
]);

function tokenize(text) {
  // 공백 기준으로 분리 후 정규화, 불용어 제거, 2자 미만 제거
  return text
    .split(/\s+/)
    .map(t => t.replace(/[^a-zA-Z0-9가-힣]/g, ''))
    .filter(t => t.length >= 2 && !STOP_WORDS.has(t));
}

//////////////////////////////
// ===== Levenshtein =====
//////////////////////////////

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, () => []);

  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a, b) {
  const normA = normalize(a);
  const normB = normalize(b);

  if (!normA || !normB) return 0;

  if (normA.includes(normB) || normB.includes(normA)) {
    return 0.95;
  }

  const distance = levenshtein(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);

  return 1 - distance / maxLen;
}

//////////////////////////////
// ===== 토큰 기반 최대 유사도 =====
// 자연어 문장의 각 토큰과 대상 필드를 비교해 최고 점수 반환
//////////////////////////////

function tokenSimilarity(tokens, target) {
  if (!tokens.length || !target) return 0;
  const scores = tokens.map(t => similarity(t, target));
  return Math.max(...scores);
}

//////////////////////////////
// ===== 카테고리 매칭 =====
//////////////////////////////

function categoryScore(tokens, tool) {
  let score = 0;

  const catLabel = categories.대분류[tool.tool_cat];
  if (catLabel) {
    score += tokenSimilarity(tokens, catLabel) * 0.2;
  }

  const subLabel = categories.소분류[tool.tool_subcat];
  if (subLabel) {
    score += tokenSimilarity(tokens, subLabel) * 0.3;
  }

  return score;
}

//////////////////////////////
// ===== DB 조회 =====
//////////////////////////////

async function fetchAllTools() {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      tool_name,
      tool_des,
      tool_key,
      tool_cat,
      tool_subcat
    `);

  if (error) {
    console.error('[tools] fetch 실패:', error.message);
    return [];
  }

  return data;
}

//////////////////////////////
// ===== 통합 유사도 =====
// 자연어 문장을 토큰 분해 후 각 컬럼과 비교
// score도 함께 반환 (searchResult에서 정렬에 활용)
//////////////////////////////

async function findSimilarTools(keyword, topN = 10) {
  const tools  = await fetchAllTools();
  const tokens = tokenize(keyword); // 자연어 분해

  // 토큰이 없으면(단일 단어 등) 원본 키워드를 토큰으로 사용
  const effectiveTokens = tokens.length > 0 ? tokens : [keyword];

  const scored = tools.map(tool => {

    // 각 컬럼에 대해 토큰별 최대 유사도 계산
    const nameScore = tokenSimilarity(effectiveTokens, tool.tool_name);
    const descScore = tokenSimilarity(effectiveTokens, tool.tool_des);
    const keyScore  = tokenSimilarity(effectiveTokens, tool.tool_key);
    const catScore  = categoryScore(effectiveTokens, tool);

    const finalScore =
      nameScore * 0.5 +
      descScore * 0.25 +
      keyScore  * 0.1 +
      catScore  * 0.15;

    return {
      name:  tool.tool_name,
      score: finalScore,
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .filter(t => t.score > 0.2); // 자연어 대응을 위해 임계값 낮춤
}

//////////////////////////////
// ===== Groq =====
//////////////////////////////

async function callGroq(prompt) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/groq-proxy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const raw = await response.text();

  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {}

  const text =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    '';

  const clean = text.replace(/```json|```/g, '').trim();

  if (!clean) throw new Error('Groq 응답 없음');

  return JSON.parse(clean);
}

//////////////////////////////
// ===== 검색 =====
//////////////////////////////

async function searchCategories(keyword) {

  // similarTools: [{ name, score }, ...]
  const similarTools = await findSimilarTools(keyword);

  // 자연어 의도 해석 + 카테고리/키워드 추출을 Groq에 위임
  const prompt = `
사용자가 다음 자연어로 AI 툴을 검색했습니다.
검색어: "${keyword}"

아래 카테고리 중에서 이 검색 의도에 맞는 것을 골라주세요.
카테고리:
${JSON.stringify(categories)}

검색어에서 핵심 기능/목적 키워드도 추출해주세요.
예) "고양이 사진을 그리는 AI 툴" → keywords: ["이미지", "생성", "그림", "사진"]

JSON만 반환 (다른 텍스트 없이):
{
  "tool_names": [],
  "recommended_cats": [],
  "recommended_subcats": [],
  "keywords": []
}
`;

  try {
    const result = await callGroq(prompt);

    const groqNames    = result.tool_names || [];
    const similarNames = similarTools.map(t => t.name);

    result.tool_names = [...new Set([...similarNames, ...groqNames])];

    result._similarityMap = Object.fromEntries(
      similarTools.map(t => [t.name, t.score])
    );

    return result;

  } catch (e) {
    return {
      tool_names: similarTools.map(t => t.name),
      recommended_cats: [],
      recommended_subcats: [],
      keywords: tokenize(keyword), // Groq 실패 시 토큰을 키워드로 활용
      _similarityMap: Object.fromEntries(
        similarTools.map(t => [t.name, t.score])
      ),
    };
  }
}

//////////////////////////////
// ===== 추천 (그대로 유지)
//////////////////////////////

async function matchCategories(userInput) {
  let favoriteTools = [];

  try {
    favoriteTools = JSON.parse(userInput.favorite_tools.replace(/'/g, '"'));
  } catch {
    favoriteTools = [userInput.favorite_tools];
  }

  const prompt = `
사용자 정보:
- 연령대: ${userInput.user_age}
- 직군: ${userInput.user_job}
- 국적: ${userInput.user_country}
- 관심 툴: ${favoriteTools.join(', ')}

카테고리:
${JSON.stringify(categories)}

JSON만 반환:
{
  "recommended_cats": [],
  "recommended_subcats": []
}
`;

  try {
    return await callGroq(prompt);
  } catch (e) {
    return null;
  }
}

export { matchCategories, searchCategories };