import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { handle } = await req.json();
    if (!handle || typeof handle !== "string" || handle.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid handle" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user info and submissions in parallel
    const [userInfoRes, submissionsRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`),
      fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`),
    ]);

    const userInfo = await userInfoRes.json();
    const submissions = await submissionsRes.json();

    if (userInfo.status !== "OK") {
      return new Response(JSON.stringify({ error: `User not found: ${handle}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
     //ikkada changes chayali
    // ===== USER DATA INSERT =====
const user = userInfo.result[0];

const { error: userError } = await supabase.from("users").upsert({
  handle: user.handle,
  rating: user.rating || 0,
  max_rating: user.maxRating || 0,
});

if (userError) {
  console.error("User insert error:", userError);
}

// ===== SUBMISSIONS DATA INSERT =====
const rawSubs = submissions.status === "OK" ? submissions.result : [];

const formattedSubs = rawSubs.map((s: any) => ({
  handle,
  verdict: s.verdict,
  rating: s.problem?.rating || 0,
  tags: s.problem?.tags || [],
  creation_time: s.creationTimeSeconds,
}));

if (formattedSubs.length > 0) {
  const { error: subError } = await supabase
    .from("submissions")
    .insert(formattedSubs);

  if (subError) {
    console.error("Submissions insert error:", subError);
  }
}
    return new Response(JSON.stringify({
      userInfo: userInfo.result[0],
      submissions: submissions.status === "OK" ? submissions.result : [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("codeforces proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
