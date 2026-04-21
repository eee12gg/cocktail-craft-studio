/**
 * Backup export edge function.
 * Collects all data from public tables + storage images and returns
 * a base64-encoded ZIP archive containing data.json and images/ folder.
 *
 * SECURITY: Only callable by authenticated admin users.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import JSZip from "https://esm.sh/jszip@3.10.1";

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

    // Verify caller is admin
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
    const adminCheck = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await adminCheck
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

    const sb = adminCheck;
    const data: Record<string, any> = {};

    // Collect all tables (paginated, 1000 at a time)
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

    const zip = new JSZip();
    zip.file("data.json", JSON.stringify(data, null, 2));
    zip.file(
      "metadata.json",
      JSON.stringify(
        {
          exported_at: new Date().toISOString(),
          tables: TABLES,
          counts: Object.fromEntries(TABLES.map((t) => [t, data[t]?.length || 0])),
          version: "1",
        },
        null,
        2,
      ),
    );

    // Collect all images from 'images' bucket
    const imagesFolder = zip.folder("images")!;
    let listFrom = 0;
    const collectImages = async (prefix = "") => {
      const { data: items, error } = await sb.storage
        .from("images")
        .list(prefix, { limit: 1000, offset: 0 });
      if (error || !items) return;
      for (const item of items) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          // It's a folder
          await collectImages(fullPath);
        } else {
          const { data: blob } = await sb.storage.from("images").download(fullPath);
          if (blob) {
            const buf = new Uint8Array(await blob.arrayBuffer());
            imagesFolder.file(fullPath, buf);
          }
        }
      }
    };
    await collectImages();

    const zipBuf = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Convert to base64
    let binary = "";
    for (let i = 0; i < zipBuf.length; i++) binary += String.fromCharCode(zipBuf[i]);
    const base64 = btoa(binary);

    return new Response(
      JSON.stringify({
        zip: base64,
        size: zipBuf.length,
        counts: Object.fromEntries(TABLES.map((t) => [t, data[t]?.length || 0])),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("backup-export error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
