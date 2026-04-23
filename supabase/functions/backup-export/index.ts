/**
 * Backup export edge function.
 * Returns a JSON backup of all public tables + a list of storage image URLs.
 *
 * NOTE: Images are NOT bundled into the archive — they live in the public
 * 'images' bucket and are referenced by URL. This keeps the export within
 * Edge Function CPU/memory limits.
 *
 * SECURITY: Only callable by authenticated admin users.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TABLES = [
  "languages",
  "ui_translations",
  "ingredient_types",
  "ingredients",
  "ingredient_translations",
  "equipment",
  "equipment_translations",
  "hashtags",
  "recipes",
  "recipe_translations",
  "recipe_steps",
  "recipe_step_translations",
  "recipe_ingredients",
  "recipe_ingredient_translations",
  "recipe_equipment",
  "recipe_tags",
  "recipe_hashtags",
  "recipe_recommendations",
  "country_language_targets",
  "admin_settings",
  "reviews",
  "contact_messages",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const sb = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roles) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data: Record<string, any> = {};
    for (const table of TABLES) {
      const all: any[] = [];
      let from = 0;
      const pageSize = 1000;
      while (true) {
        const { data: rows, error } = await sb
          .from(table)
          .select("*")
          .range(from, from + pageSize - 1);
        if (error) {
          console.error(`Error reading ${table}:`, error.message);
          break;
        }
        if (!rows || rows.length === 0) break;
        all.push(...rows);
        if (rows.length < pageSize) break;
        from += pageSize;
      }
      data[table] = all;
    }

    // List storage images (paths only — actual files stay in the bucket)
    const imagePaths: string[] = [];
    const listImages = async (prefix = "") => {
      let offset = 0;
      while (true) {
        const { data: items, error } = await sb.storage
          .from("images")
          .list(prefix, { limit: 1000, offset });
        if (error || !items || items.length === 0) break;
        for (const item of items) {
          const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null) {
            await listImages(fullPath);
          } else {
            imagePaths.push(fullPath);
          }
        }
        if (items.length < 1000) break;
        offset += 1000;
      }
    };
    await listImages();

    const payload = {
      version: "2",
      exported_at: new Date().toISOString(),
      tables: TABLES,
      counts: Object.fromEntries(TABLES.map((t) => [t, data[t]?.length || 0])),
      image_count: imagePaths.length,
      image_paths: imagePaths,
      data,
    };

    const json = JSON.stringify(payload);
    const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new Response(json, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("backup-export error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
