// One-shot bulk translator: fills recipe_translations + recipe_step_translations
// + recipe_ingredient_translations for every active language using Lovable AI.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function translateBatch(
  langName: string,
  langCode: string,
  payload: { title: string; description: string | null; steps: string[]; ingredients: string[] },
): Promise<{ title: string; description: string; steps: string[]; ingredients: string[] }> {
  const sys = `You are a professional cocktail recipe translator. Translate from English to ${langName} (${langCode}). Keep numbers, measurements (ml, oz, dash), brand names. Output ONLY a JSON object with keys: title, description, steps (array same length as input), ingredients (array same length as input). No commentary.`;
  const user = JSON.stringify(payload);

  let lastErr = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) {
      lastErr = `429 attempt ${attempt}`;
      await new Promise((r) => setTimeout(r, 4000 + attempt * 4000));
      continue;
    }
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return JSON.parse(data.choices?.[0]?.message?.content || "{}");
  }
  throw new Error(lastErr);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supa = createClient(SUPABASE_URL, SERVICE_KEY);
  const log: string[] = [];
  const started = Date.now();
  const MAX_MS = 130_000;

  try {
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const limit = parseInt(url.searchParams.get("limit") || "3", 10);

    const { data: langs } = await supa.from("languages").select("code, name").eq("is_active", true);
    const targets = (langs || []).filter((l: any) => l.code !== "en");

    const { data: recipes } = await supa.from("recipes").select("id, title, description, slug")
      .eq("is_published", true).order("created_at").range(offset, offset + limit - 1);
    if (!recipes) throw new Error("no recipes");

    let done = 0;
    for (const recipe of recipes) {
      if (Date.now() - started > MAX_MS) break;
      const [stepsRes, ingsRes] = await Promise.all([
        supa.from("recipe_steps").select("id, step_number, instruction").eq("recipe_id", recipe.id).order("step_number"),
        supa.from("recipe_ingredients").select("id, sort_order, display_text").eq("recipe_id", recipe.id).order("sort_order"),
      ]);
      const steps = stepsRes.data || [];
      const ings = ingsRes.data || [];

      for (const lang of targets) {
        try {
          // Skip steps already translated
          const { data: existingSteps } = await supa.from("recipe_step_translations")
            .select("recipe_step_id").eq("language_code", lang.code).in("recipe_step_id", steps.map((s: any) => s.id));
          const existingStepIds = new Set((existingSteps || []).map((s: any) => s.recipe_step_id));
          const stepsAllDone = steps.length > 0 && steps.every((s: any) => existingStepIds.has(s.id));

          const { data: existingRec } = await supa.from("recipe_translations")
            .select("id, title").eq("recipe_id", recipe.id).eq("language_code", lang.code).maybeSingle();

          if (stepsAllDone && existingRec) { continue; }

          const result = await translateBatch(lang.name, lang.code, {
            title: recipe.title,
            description: recipe.description,
            steps: steps.map((s: any) => s.instruction),
            ingredients: ings.map((i: any) => i.display_text),
          });

          // Upsert recipe_translations
          const recPayload = {
            recipe_id: recipe.id,
            language_code: lang.code,
            title: result.title || recipe.title,
            slug: existingRec?.title ? slugify(result.title) : slugify(`${result.title}-${lang.code}`),
            description: result.description || null,
          };
          if (existingRec) {
            await supa.from("recipe_translations").update(recPayload).eq("id", existingRec.id);
          } else {
            await supa.from("recipe_translations").insert(recPayload);
          }

          // Steps
          if (steps.length && Array.isArray(result.steps)) {
            await supa.from("recipe_step_translations").delete().eq("language_code", lang.code).in("recipe_step_id", steps.map((s: any) => s.id));
            const rows = steps.map((s: any, idx: number) => ({
              recipe_step_id: s.id,
              language_code: lang.code,
              instruction: result.steps[idx] || s.instruction,
            }));
            await supa.from("recipe_step_translations").insert(rows);
          }

          // Ingredients display_text
          if (ings.length && Array.isArray(result.ingredients)) {
            await supa.from("recipe_ingredient_translations").delete().eq("language_code", lang.code).in("recipe_ingredient_id", ings.map((i: any) => i.id));
            const rows = ings.map((i: any, idx: number) => ({
              recipe_ingredient_id: i.id,
              language_code: lang.code,
              display_text: result.ingredients[idx] || i.display_text,
            }));
            await supa.from("recipe_ingredient_translations").insert(rows);
          }

          log.push(`${recipe.title} → ${lang.code} ✓`);
        } catch (e) {
          log.push(`${recipe.title} → ${lang.code} ✗ ${(e as Error).message}`);
        }
      }
      done++;
    }

    return new Response(JSON.stringify({ ok: true, done, log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message, log }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
