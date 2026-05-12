// Public review submission with IP + geo enrichment
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  recipe_id?: string;
  author_name?: string;
  text?: string;
  rating?: number;
  language_code?: string;
}

function clientIp(req: Request): string | null {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || null;
}

async function lookupGeo(ip: string | null) {
  if (!ip || ip === "127.0.0.1" || ip.startsWith("10.") || ip.startsWith("192.168.")) return {};
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return {};
    const j = await res.json();
    return {
      country: j.country_name || null,
      country_code: j.country_code || null,
      city: j.city || null,
    };
  } catch {
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Body = await req.json();
    const recipe_id = body.recipe_id;
    const author_name = (body.author_name || "").trim().slice(0, 100);
    const text = (body.text || "").trim().slice(0, 1000);
    const rating = Number(body.rating);
    const language_code = (body.language_code || "").slice(0, 8) || null;

    if (!recipe_id || !author_name || !text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "invalid_input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ip = clientIp(req);

    // Block duplicate review per recipe+ip
    if (ip) {
      const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("recipe_id", recipe_id)
        .eq("ip", ip);
      if ((count || 0) > 0) {
        return new Response(JSON.stringify({ error: "already_reviewed" }), {
          status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const geo = await lookupGeo(ip);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        recipe_id, author_name, text, rating,
        ip, language_code,
        ...geo,
      })
      .select("id, author_name, rating, text, created_at")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ review: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "server_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
