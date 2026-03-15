import { supabase } from "/_ignore/supabase.js";

async function requireLogin() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("[personal_AI] auth.getUser 오류:", error);
    window.location.replace("/login1/login1.html");
    return null;
  }
  if (!user) {
    window.location.replace("/login1/login1.html");
    return null;
  }
  console.log("[DEBUG] 로그인 유저 ID:", user.id);
  return user;
}

async function fetchUserProfile(authUser) {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, recommended_tools, recent_tools, favorite_tools")
    .eq("user_id", authUser.id)
    .single();

  if (error) {
    console.error("[DEBUG] users 조회 실패:", error);
    throw error;
  }

  console.log("[DEBUG] userProfile 원본:", JSON.stringify(data));
  return data;
}

async function fetchToolsByNames(toolNames = []) {
  if (!Array.isArray(toolNames) || toolNames.length === 0) return [];
  const cleanNames = toolNames.filter(Boolean).map((name) => String(name).trim());
  if (cleanNames.length === 0) return [];

  console.log("[DEBUG] tools 조회 요청 names:", cleanNames);

  const { data, error } = await supabase
    .from("tools")
    .select("tool_ID, tool_name, icon")
    .in("tool_name", cleanNames);

  if (error) {
    console.error("[DEBUG] tools 조회 실패:", error);
    throw error;
  }

  console.log("[DEBUG] tools 조회 결과:", JSON.stringify(data));

  const toolMap = new Map((data || []).map((tool) => [tool.tool_name, tool]));
  return cleanNames.map((name) => toolMap.get(name)).filter(Boolean);
}

function renderEmptyMessage(container, message = "등록된 툴이 없습니다.") {
  if (!container) return;
  container.innerHTML = `<p class="tool-board__empty">${message}</p>`;
}

async function renderToolIcons(targetSelector, tools) {
  const container = document.querySelector(targetSelector);
  if (!container) {
    console.warn("[DEBUG] container 없음:", targetSelector);
    return;
  }

  console.log("[DEBUG] loadToolIconCard 타입:", typeof window.loadToolIconCard);

  if (typeof window.loadToolIconCard !== "function") {
    console.warn("[DEBUG] loadToolIconCard 없음 — icon.js 로드 안됨");
    return;
  }

  container.innerHTML = "";

  if (!tools || tools.length === 0) {
    renderEmptyMessage(container, "등록된 툴이 없습니다.");
    return;
  }

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const mount = document.createElement("div");
    mount.className = "tool-icon-mount";
    mount.id = `${targetSelector.replace("#", "")}-icon-${i + 1}`;
    container.appendChild(mount);

    const detailUrl = `/detail_AI/detail_AI.html?tool_id=${encodeURIComponent(tool.tool_ID)}`;

    console.log("[DEBUG] loadToolIconCard 호출:", mount.id, tool);

    await window.loadToolIconCard(`#${mount.id}`, {
      toolName: tool.tool_name || "툴",
      iconUrl: tool.icon || "",
      url: detailUrl,
    });
  }
}

function scrollToHash() {
  const hash = window.location.hash?.replace("#", "");
  if (!hash) return;
  const target = document.getElementById(hash);
  if (target) {
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

async function initPersonalAIPage() {
  try {
    const authUser = await requireLogin();
    if (!authUser) return;

    const userProfile = await fetchUserProfile(authUser);

    const recommendedNames = userProfile?.recommended_tools || [];
    const recentNames = userProfile?.recent_tools || [];
    const favoriteNames = userProfile?.favorite_tools || [];

    console.log("[DEBUG] recommended_tools:", recommendedNames);
    console.log("[DEBUG] recent_tools:", recentNames);
    console.log("[DEBUG] favorite_tools:", favoriteNames);

    const [recommendedTools, recentTools, favoriteTools] = await Promise.all([
      fetchToolsByNames(recommendedNames),
      fetchToolsByNames(recentNames),
      fetchToolsByNames(favoriteNames),
    ]);

    await renderToolIcons("#recommendedTools", recommendedTools);
    await renderToolIcons("#recentTools", recentTools);
    await renderToolIcons("#favoriteTools", favoriteTools);

    setTimeout(scrollToHash, 400);
  } catch (err) {
    console.error("[personal_AI] 초기화 실패:", err);
    renderEmptyMessage(document.querySelector("#recommendedTools"), "추천 툴을 불러오지 못했습니다.");
    renderEmptyMessage(document.querySelector("#recentTools"), "최근 사용 툴을 불러오지 못했습니다.");
    renderEmptyMessage(document.querySelector("#favoriteTools"), "관심 툴을 불러오지 못했습니다.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initPersonalAIPage();
});