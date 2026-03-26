import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 나중에 GitHub Pages URL로 교체
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_MODELS = [
  "llama-3.1-8b-instant",
];

const ALLOWED_ROLES = ["system", "user", "assistant"];

const MAX_REQUESTS_PER_MINUTE = 10;

/**
 * 주의:
 * 이 rate limit은 Edge Function 인스턴스 메모리 기반이라
 * 서버리스 환경 전체에서 완전한 보안 장치로 동작하는 건 아님.
 * 그래도 프로젝트용/기본 억제용으로는 사용 가능.
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // POST만 허용
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rate Limiting
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, {
      count: 1,
      resetAt: now + 60_000,
    });
  } else if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return new Response(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else {
    record.count += 1;
  }

  try {
    const body = await req.json();
    const { model, messages } = body ?? {};

    // 기본 입력 검증
    if (
      !model ||
      !ALLOWED_MODELS.includes(model) ||
      !Array.isArray(messages) ||
      messages.length === 0 ||
      messages.length > 30
    ) {
      return new Response(JSON.stringify({ error: "Bad Request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // messages 상세 검증
    for (const msg of messages) {
      if (!msg || typeof msg !== "object") {
        return new Response(JSON.stringify({ error: "Invalid Message Format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (
        typeof msg.role !== "string" ||
        !ALLOWED_ROLES.includes(msg.role)
      ) {
        return new Response(JSON.stringify({ error: "Invalid Role" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (typeof msg.content !== "string") {
        return new Response(JSON.stringify({ error: "Invalid Content" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 한 메시지당 100자 제한
      if (msg.content.length > 2000) {
        return new Response(JSON.stringify({ error: "Message Too Long" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const apiKey = Deno.env.get("GROQ_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server Misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return new Response(
        JSON.stringify({
          error: data?.error?.message ?? "Upstream API Error",
        }),
        {
          status: groqRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});