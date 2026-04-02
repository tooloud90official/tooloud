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

  return user;
}

async function fetchUserProfile(authUser) {
  const { data, error } = await supabase
    .from("users")
    .select("user_id, recommended_tools, recent_tools, favorite_tools")
    .eq("user_id", authUser.id)
    .single();

  if (error) {
    console.error("[personal_AI] users 조회 실패:", error);
    throw error;
  }

  return data;
}

async function fetchToolsByIds(toolIds = []) {
  if (!Array.isArray(toolIds) || toolIds.length === 0) return [];

  const cleanIds = toolIds
    .filter((id) => id !== null && id !== undefined && String(id).trim() !== "")
    .map((id) => String(id).trim());

  if (cleanIds.length === 0) return [];

  const { data, error } = await supabase
    .from("tools")
    .select("tool_ID, tool_name, icon")
    .in("tool_ID", cleanIds);

  if (error) {
    console.error("[personal_AI] tools 조회 실패:", error);
    throw error;
  }

  const toolMap = new Map(
    (data || []).map((tool) => [String(tool.tool_ID).trim(), tool])
  );

  return cleanIds
    .map((id) => toolMap.get(id))
    .filter(Boolean);
}

function renderEmptyMessage(container, message = "등록된 툴이 없습니다.") {
  if (!container) return;
  container.innerHTML = `<p class="tool-board__empty">${message}</p>`;
}

async function markClickedRecommend(userId) {
  if (!userId) return;

  try {
    const { error } = await supabase
      .from("users")
      .update({ clicked_recommend: true })
      .eq("user_id", userId);

    if (error) {
      console.error("[personal_AI] clicked_recommend 업데이트 실패:", error);
    }
  } catch (err) {
    console.error("[personal_AI] clicked_recommend 예외:", err);
  }
}

function bindRecommendClicks(containerSelector, tools, authUser) {
  const container = document.querySelector(containerSelector);
  if (!container || !Array.isArray(tools) || tools.length === 0 || !authUser?.id) return;

  const mounts = container.querySelectorAll(".tool-icon-mount");

  mounts.forEach((mount, index) => {
    const tool = tools[index];
    if (!tool) return;

    const detailUrl = `/detail_AI/detail_AI.html?tool_ID=${encodeURIComponent(tool.tool_ID)}`;

    mount.style.cursor = "pointer";

    mount.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      await markClickedRecommend(authUser.id);
      window.location.href = detailUrl;
    });
  });
}

async function renderToolIcons(targetSelector, tools) {
  const container = document.querySelector(targetSelector);
  if (!container) return;

  if (typeof window.loadToolIconCard !== "function") {
    console.warn("[personal_AI] loadToolIconCard 없음");
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

    const detailUrl = `/detail_AI/detail_AI.html?tool_ID=${encodeURIComponent(tool.tool_ID)}`;

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

    const recommendedIds = Array.isArray(userProfile?.recommended_tools)
      ? userProfile.recommended_tools
      : [];

    const recentIds = Array.isArray(userProfile?.recent_tools)
      ? userProfile.recent_tools.slice(0, 8)
      : [];

    const favoriteIds = Array.isArray(userProfile?.favorite_tools)
      ? userProfile.favorite_tools
      : [];

    const recommendedTools = await fetchToolsByIds(recommendedIds);
    const recentTools = await fetchToolsByIds(recentIds);
    const favoriteTools = await fetchToolsByIds(favoriteIds);

    await renderToolIcons("#recommendedTools", recommendedTools);
    await renderToolIcons("#recentTools", recentTools);
    await renderToolIcons("#favoriteTools", favoriteTools);

    // 추천 툴 영역에서 눌렀을 때만 clicked_recommend = true
    bindRecommendClicks("#recommendedTools", recommendedTools, authUser);

    setTimeout(scrollToHash, 400);
  } catch (err) {
    console.error("[personal_AI] 초기화 실패:", err);

    renderEmptyMessage(
      document.querySelector("#recommendedTools"),
      "추천 툴을 불러오지 못했습니다."
    );
    renderEmptyMessage(
      document.querySelector("#recentTools"),
      "최근 사용 툴을 불러오지 못했습니다."
    );
    renderEmptyMessage(
      document.querySelector("#favoriteTools"),
      "관심 툴을 불러오지 못했습니다."
    );
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await initPersonalAIPage();
});