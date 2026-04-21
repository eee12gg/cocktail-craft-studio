/**
 * Backup restore edge function.
 * Receives a base64-encoded ZIP (from backup-export) and restores
 * all tables + images.
 *
 * Strategy: clears each table (except languages/auth-related), then re-inserts.
 * Images are uploaded with upsert.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Order matters: parents before children
const RESTORE_ORDER = [
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
];

// Reverse order for deletion (children first)
const DELETE_ORDER = [...RESTORE_ORDER].reverse();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Auth: verify admin
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, anonKey, {
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

    const body = await req.json();
    const zipB64 = body?.zip as string;
    if (!zipB64) {
      return new Response(JSON.stringify({ error: "Missing zip" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Decode base64 → Uint8Array
    const binary = atob(zipB64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const zip = await JSZip.loadAsync(bytes);
    const dataFile = zip.file("data.json");
    if (!dataFile) {
      return new Response(JSON.stringify({ error: "Invalid backup: data.json missing" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const dataStr = await dataFile.async("string");
    const data = JSON.parse(dataStr) as Record<string, any[]>;

    const log: string[] = [];

    // Clear tables in reverse order
    for (const table of DELETE_ORDER) {
      // Only clear if data has it
      if (!(table in data)) continue;
      const { error } = await sb.from(table).delete().not("id", "is", null);
      if (error && !error.message.includes("violates")) {
        log.push(`Warn ${table}: ${error.message}`);
      }
    }

    // Insert in proper order
    for (const table of RESTORE_ORDER) {
      const rows = data[table];
      if (!rows?.length) continue;

      // Insert in batches of 100
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await sb.from(table).upsert(batch, {
          onConflict: table === "languages" ? "code" : "id",
        });
        if (error) {
          log.push(`Error ${table}: ${error.message}`);
        }
      }
      log.push(`${table}: ${rows.length} rows`);
    }

    // Restore images
    let imageCount = 0;
    for (const fileName of Object.keys(zip.files)) {
      if (!fileName.startsWith("images/") || zip.files[fileName].dir) continue;
      const path = fileName.substring("images/".length);
      const buf = await zip.files[fileName].async("uint8array");
      const ext = path.split(".").pop()?.toLowerCase();
      const contentType =
        ext === "png"
          ? "image/png"
          : ext === "webp"
          ? "image/webp"
          : ext === "gif"
          ? "image/gif"
          : ext === "svg"
          ? "image/svg+xml"
          : "image/jpeg";
      const { error } = await sb.storage
        .from("images")
        .upload(path, buf, { contentType, upsert: true });
      if (!error) imageCount++;
    }
    log.push(`Images: ${imageCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: log.join("; "),
        log,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("backup-restore error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
