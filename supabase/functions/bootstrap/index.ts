import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "admin@demo.com";
const ADMIN_PASSWORD = "12345678";

const INGREDIENTS_DATA = [
  { name: "White Rum", slug: "white-rum", type: "alcohol", description: "Light-bodied Caribbean spirit distilled from sugarcane, clean and slightly sweet." },
  { name: "Fresh Lime Juice", slug: "fresh-lime-juice", type: "juice", description: "Bright, tart citrus juice essential to countless cocktails." },
  { name: "Sugar Syrup", slug: "sugar-syrup", type: "syrup", description: "Simple syrup made from equal parts sugar and water." },
  { name: "Fresh Mint", slug: "fresh-mint", type: "fruit", description: "Aromatic herb with a cooling flavor, essential for mojitos." },
  { name: "Soda Water", slug: "soda-water", type: "mixer", description: "Carbonated water that adds effervescence to drinks." },
  { name: "Bourbon", slug: "bourbon", type: "alcohol", description: "American whiskey with rich vanilla, caramel, and oak notes." },
  { name: "Sugar Cube", slug: "sugar-cube", type: "other", description: "Compressed cube of sugar used in classic cocktails." },
  { name: "Angostura Bitters", slug: "angostura-bitters", type: "other", description: "Aromatic bitters with complex herbal and spice flavors." },
  { name: "Orange Peel", slug: "orange-peel", type: "fruit", description: "Citrus peel expressing aromatic oils for garnish." },
  { name: "Tequila", slug: "tequila", type: "alcohol", description: "Mexican spirit made from blue agave plant." },
  { name: "Triple Sec", slug: "triple-sec", type: "liqueur", description: "Clear orange-flavored liqueur, triple distilled." },
  { name: "Salt", slug: "salt", type: "other", description: "Used for rimming glasses in margaritas and other cocktails." },
  { name: "Vodka", slug: "vodka", type: "alcohol", description: "Clear, neutral spirit perfect as a cocktail base." },
  { name: "Coffee Liqueur", slug: "coffee-liqueur", type: "liqueur", description: "Rich, sweet spirit with deep roasted coffee flavor." },
  { name: "Fresh Espresso", slug: "fresh-espresso", type: "other", description: "Freshly brewed espresso shot for coffee cocktails." },
  { name: "Vodka Citron", slug: "vodka-citron", type: "alcohol", description: "Lemon-flavored vodka with bright citrus notes." },
  { name: "Cranberry Juice", slug: "cranberry-juice", type: "juice", description: "Tart, vibrant red juice from cranberries." },
  { name: "Coconut Cream", slug: "coconut-cream", type: "mixer", description: "Rich, creamy extract from coconut flesh." },
  { name: "Pineapple Juice", slug: "pineapple-juice", type: "juice", description: "Sweet, tropical juice from fresh pineapples." },
  { name: "Orange Juice", slug: "orange-juice", type: "juice", description: "Fresh-squeezed citrus juice, sweet and tangy." },
  { name: "Grenadine", slug: "grenadine", type: "syrup", description: "Sweet pomegranate-flavored syrup, deep red color." },
  { name: "Kahlúa", slug: "kahlua", type: "liqueur", description: "Mexican coffee liqueur with vanilla notes." },
  { name: "Baileys", slug: "baileys", type: "liqueur", description: "Irish cream liqueur, smooth and sweet." },
  { name: "Grand Marnier", slug: "grand-marnier", type: "liqueur", description: "Premium orange liqueur with cognac base." },
  { name: "Jägermeister", slug: "jagermeister", type: "liqueur", description: "German herbal liqueur with 56 botanicals." },
  { name: "Energy Drink", slug: "energy-drink", type: "mixer", description: "Caffeinated carbonated beverage." },
  { name: "Fresh Strawberries", slug: "fresh-strawberries", type: "fruit", description: "Sweet, juicy berries perfect for blended drinks." },
  { name: "Crushed Ice", slug: "crushed-ice", type: "other", description: "Finely crushed ice for frozen and blended cocktails." },
];

const EQUIPMENT_DATA = [
  "Highball Glass", "Muddler", "Bar Spoon", "Rocks Glass", "Coupe Glass",
  "Shaker", "Strainer", "Martini Glass", "Hurricane Glass", "Blender",
  "Shot Glass", "Pint Glass",
];

const RECIPES_DATA = [
  {
    title: "Mojito", slug: "mojito", category: "cocktails", alcohol_level: "Medium", badge: "Popular", prep_time: "5 min",
    description: "A refreshing Cuban classic with white rum, fresh mint, lime, sugar, and sparkling water.",
    tags: ["Refreshing", "Classic", "Rum"], hashtags: ["#summer", "#minty", "#cuban"],
    ingredients: [
      { name: "White Rum", amount_value: 60, amount_unit: "ml", display_text: "60 ml White Rum" },
      { name: "Fresh Lime Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Lime Juice" },
      { name: "Sugar Syrup", amount_value: 20, amount_unit: "ml", display_text: "20 ml Sugar Syrup" },
      { name: "Fresh Mint", amount_value: 8, amount_unit: "leaves", display_text: "8 Fresh Mint Leaves" },
      { name: "Soda Water", amount_value: 60, amount_unit: "ml", display_text: "60 ml Soda Water" },
    ],
    equipment: ["Highball Glass", "Muddler", "Bar Spoon"],
    steps: [
      "Gently muddle mint leaves with sugar syrup in a highball glass.",
      "Add fresh lime juice and white rum.",
      "Fill the glass with crushed ice.",
      "Top with soda water and stir gently.",
      "Garnish with a sprig of fresh mint and a lime wheel.",
    ],
    recommendations: ["old-fashioned", "virgin-mojito"],
  },
  {
    title: "Old Fashioned", slug: "old-fashioned", category: "cocktails", alcohol_level: "Strong", badge: "Top 10", prep_time: "3 min",
    description: "The quintessential whiskey cocktail — bourbon, bitters, sugar, and a twist of orange.",
    tags: ["Classic", "Whiskey", "Strong"], hashtags: ["#bourbon", "#classic", "#gentleman"],
    ingredients: [
      { name: "Bourbon", amount_value: 60, amount_unit: "ml", display_text: "60 ml Bourbon" },
      { name: "Sugar Cube", amount_value: 1, amount_unit: "piece", display_text: "1 Sugar Cube" },
      { name: "Angostura Bitters", amount_value: 3, amount_unit: "dashes", display_text: "3 dashes Angostura Bitters" },
      { name: "Orange Peel", amount_value: 1, amount_unit: "piece", display_text: "1 Orange Peel" },
    ],
    equipment: ["Rocks Glass", "Muddler", "Bar Spoon"],
    steps: [
      "Place sugar cube in a rocks glass and saturate with bitters.",
      "Muddle until dissolved.",
      "Add bourbon and a large ice cube.",
      "Stir gently for 20 seconds.",
      "Express orange peel over the glass and drop it in.",
    ],
    recommendations: ["mojito", "espresso-martini"],
  },
  {
    title: "Margarita", slug: "margarita", category: "cocktails", alcohol_level: "Medium", badge: "Trending", prep_time: "4 min",
    description: "Tequila, lime juice, and triple sec shaken to perfection with a salted rim.",
    tags: ["Citrus", "Tequila", "Party"], hashtags: ["#tequila", "#lime", "#fiesta"],
    ingredients: [
      { name: "Tequila", amount_value: 50, amount_unit: "ml", display_text: "50 ml Tequila" },
      { name: "Triple Sec", amount_value: 25, amount_unit: "ml", display_text: "25 ml Triple Sec" },
      { name: "Fresh Lime Juice", amount_value: 25, amount_unit: "ml", display_text: "25 ml Fresh Lime Juice" },
      { name: "Salt", amount_value: 1, amount_unit: "pinch", display_text: "Salt for rim" },
    ],
    equipment: ["Coupe Glass", "Shaker", "Strainer"],
    steps: [
      "Rim the glass with salt.",
      "Combine tequila, triple sec, and lime juice in a shaker with ice.",
      "Shake vigorously for 15 seconds.",
      "Strain into the prepared glass.",
      "Garnish with a lime wheel.",
    ],
    recommendations: ["tequila-sunrise", "kamikaze"],
  },
  {
    title: "Espresso Martini", slug: "espresso-martini", category: "cocktails", alcohol_level: "Medium", badge: "Trending", prep_time: "5 min",
    description: "A sophisticated blend of vodka, coffee liqueur, and freshly brewed espresso.",
    tags: ["Coffee", "Vodka", "Elegant"], hashtags: ["#coffee", "#nightlife", "#espresso"],
    ingredients: [
      { name: "Vodka", amount_value: 50, amount_unit: "ml", display_text: "50 ml Vodka" },
      { name: "Coffee Liqueur", amount_value: 25, amount_unit: "ml", display_text: "25 ml Coffee Liqueur" },
      { name: "Fresh Espresso", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Espresso" },
      { name: "Sugar Syrup", amount_value: 10, amount_unit: "ml", display_text: "10 ml Sugar Syrup" },
    ],
    equipment: ["Martini Glass", "Shaker", "Strainer"],
    steps: [
      "Brew a fresh shot of espresso and let it cool slightly.",
      "Combine all ingredients in a shaker with ice.",
      "Shake hard for 15 seconds to create a rich foam.",
      "Double strain into a chilled martini glass.",
      "Garnish with three coffee beans.",
    ],
    recommendations: ["cosmopolitan", "b52"],
  },
  {
    title: "Cosmopolitan", slug: "cosmopolitan", category: "cocktails", alcohol_level: "Medium", badge: null, prep_time: "4 min",
    description: "Vodka citron, cranberry juice, triple sec, and fresh lime — elegant and vibrant.",
    tags: ["Fruity", "Vodka", "Elegant"], hashtags: ["#cosmo", "#cranberry", "#chic"],
    ingredients: [
      { name: "Vodka Citron", amount_value: 40, amount_unit: "ml", display_text: "40 ml Vodka Citron" },
      { name: "Triple Sec", amount_value: 15, amount_unit: "ml", display_text: "15 ml Triple Sec" },
      { name: "Cranberry Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Cranberry Juice" },
      { name: "Fresh Lime Juice", amount_value: 15, amount_unit: "ml", display_text: "15 ml Fresh Lime Juice" },
    ],
    equipment: ["Martini Glass", "Shaker", "Strainer"],
    steps: [
      "Add all ingredients to a shaker with ice.",
      "Shake until well-chilled.",
      "Strain into a chilled martini glass.",
      "Garnish with an orange twist.",
    ],
    recommendations: ["espresso-martini", "margarita"],
  },
  {
    title: "Piña Colada", slug: "pina-colada", category: "cocktails", alcohol_level: "Medium", badge: "Popular", prep_time: "5 min",
    description: "A tropical paradise of rum, coconut cream, and pineapple juice blended with ice.",
    tags: ["Tropical", "Rum", "Sweet"], hashtags: ["#tropical", "#coconut", "#beach"],
    ingredients: [
      { name: "White Rum", amount_value: 60, amount_unit: "ml", display_text: "60 ml White Rum" },
      { name: "Coconut Cream", amount_value: 40, amount_unit: "ml", display_text: "40 ml Coconut Cream" },
      { name: "Pineapple Juice", amount_value: 90, amount_unit: "ml", display_text: "90 ml Pineapple Juice" },
    ],
    equipment: ["Hurricane Glass", "Blender"],
    steps: [
      "Combine rum, coconut cream, and pineapple juice in a blender.",
      "Add a cup of crushed ice.",
      "Blend until smooth.",
      "Pour into a hurricane glass.",
      "Garnish with a pineapple wedge and cherry.",
    ],
    recommendations: ["mojito", "virgin-strawberry-daiquiri"],
  },
  {
    title: "Tequila Sunrise", slug: "tequila-sunrise", category: "cocktails", alcohol_level: "Medium", badge: "New", prep_time: "3 min",
    description: "A visually stunning layered drink with tequila, orange juice, and grenadine.",
    tags: ["Fruity", "Tequila", "Colorful"], hashtags: ["#sunrise", "#layered", "#orange"],
    ingredients: [
      { name: "Tequila", amount_value: 45, amount_unit: "ml", display_text: "45 ml Tequila" },
      { name: "Orange Juice", amount_value: 120, amount_unit: "ml", display_text: "120 ml Orange Juice" },
      { name: "Grenadine", amount_value: 15, amount_unit: "ml", display_text: "15 ml Grenadine" },
    ],
    equipment: ["Highball Glass", "Bar Spoon"],
    steps: [
      "Fill a highball glass with ice.",
      "Pour tequila and orange juice, stir gently.",
      "Slowly pour grenadine down the side of the glass.",
      "Let it sink to the bottom to create the sunrise effect.",
      "Garnish with an orange slice and cherry.",
    ],
    recommendations: ["margarita", "pina-colada"],
  },
  {
    title: "B-52", slug: "b52", category: "shots", alcohol_level: "Strong", badge: "Top 10", prep_time: "2 min",
    description: "Three beautifully layered liqueurs — Kahlúa, Baileys, and Grand Marnier.",
    tags: ["Layered", "Sweet", "Classic"], hashtags: ["#layered", "#shooter", "#flaming"],
    ingredients: [
      { name: "Kahlúa", amount_value: 20, amount_unit: "ml", display_text: "20 ml Kahlúa" },
      { name: "Baileys", amount_value: 20, amount_unit: "ml", display_text: "20 ml Baileys" },
      { name: "Grand Marnier", amount_value: 20, amount_unit: "ml", display_text: "20 ml Grand Marnier" },
    ],
    equipment: ["Shot Glass", "Bar Spoon"],
    steps: [
      "Pour Kahlúa into a shot glass.",
      "Using the back of a bar spoon, slowly layer Baileys on top.",
      "Repeat layering with Grand Marnier.",
      "Serve immediately — optionally flame the top layer.",
    ],
    recommendations: ["jagerbomb", "kamikaze"],
  },
  {
    title: "Jägerbomb", slug: "jagerbomb", category: "shots", alcohol_level: "Medium", badge: "Popular", prep_time: "1 min",
    description: "A high-energy classic — Jägermeister dropped into an energy drink.",
    tags: ["Energy", "Party", "Fast"], hashtags: ["#party", "#energy", "#bomb"],
    ingredients: [
      { name: "Jägermeister", amount_value: 30, amount_unit: "ml", display_text: "30 ml Jägermeister" },
      { name: "Energy Drink", amount_value: 120, amount_unit: "ml", display_text: "120 ml Energy Drink" },
    ],
    equipment: ["Shot Glass", "Pint Glass"],
    steps: [
      "Pour energy drink into a pint glass.",
      "Fill a shot glass with Jägermeister.",
      "Drop the shot glass into the energy drink.",
      "Drink immediately!",
    ],
    recommendations: ["b52", "kamikaze"],
  },
  {
    title: "Kamikaze", slug: "kamikaze", category: "shots", alcohol_level: "Strong", badge: "New", prep_time: "2 min",
    description: "A sharp, citrusy shot of vodka, triple sec, and fresh lime juice.",
    tags: ["Citrus", "Vodka", "Sharp"], hashtags: ["#sharp", "#citrus", "#shooter"],
    ingredients: [
      { name: "Vodka", amount_value: 30, amount_unit: "ml", display_text: "30 ml Vodka" },
      { name: "Triple Sec", amount_value: 15, amount_unit: "ml", display_text: "15 ml Triple Sec" },
      { name: "Fresh Lime Juice", amount_value: 15, amount_unit: "ml", display_text: "15 ml Fresh Lime Juice" },
    ],
    equipment: ["Shot Glass", "Shaker"],
    steps: [
      "Combine all ingredients in a shaker with ice.",
      "Shake briefly.",
      "Strain into a shot glass.",
      "Serve immediately.",
    ],
    recommendations: ["b52", "jagerbomb"],
  },
  {
    title: "Virgin Strawberry Daiquiri", slug: "virgin-strawberry-daiquiri", category: "non-alcoholic", alcohol_level: "None", badge: "Trending", prep_time: "5 min",
    description: "Sweet, fruity, and refreshing — frozen strawberries blended with lime and sugar.",
    tags: ["Fruity", "Frozen", "Sweet"], hashtags: ["#mocktail", "#strawberry", "#frozen"],
    ingredients: [
      { name: "Fresh Strawberries", amount_value: 150, amount_unit: "g", display_text: "150 g Fresh Strawberries" },
      { name: "Fresh Lime Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Lime Juice" },
      { name: "Sugar Syrup", amount_value: 30, amount_unit: "ml", display_text: "30 ml Sugar Syrup" },
      { name: "Crushed Ice", amount_value: 1, amount_unit: "cup", display_text: "1 cup Crushed Ice" },
    ],
    equipment: ["Hurricane Glass", "Blender"],
    steps: [
      "Combine strawberries, lime juice, sugar syrup, and ice in a blender.",
      "Blend until smooth and thick.",
      "Pour into a hurricane glass.",
      "Garnish with a fresh strawberry and mint sprig.",
    ],
    recommendations: ["virgin-mojito", "pina-colada"],
  },
  {
    title: "Virgin Mojito", slug: "virgin-mojito", category: "non-alcoholic", alcohol_level: "None", badge: "Popular", prep_time: "4 min",
    description: "All the freshness of a classic mojito — mint, lime, and sparkling water, no alcohol.",
    tags: ["Refreshing", "Minty", "Light"], hashtags: ["#mocktail", "#minty", "#refreshing"],
    ingredients: [
      { name: "Fresh Mint", amount_value: 8, amount_unit: "leaves", display_text: "8 Fresh Mint Leaves" },
      { name: "Fresh Lime Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Lime Juice" },
      { name: "Sugar Syrup", amount_value: 20, amount_unit: "ml", display_text: "20 ml Sugar Syrup" },
      { name: "Soda Water", amount_value: 150, amount_unit: "ml", display_text: "150 ml Soda Water" },
    ],
    equipment: ["Highball Glass", "Muddler"],
    steps: [
      "Gently muddle mint leaves with sugar syrup in a glass.",
      "Add lime juice and fill with crushed ice.",
      "Top with soda water.",
      "Stir gently and garnish with mint and lime.",
    ],
    recommendations: ["virgin-strawberry-daiquiri", "mojito"],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const log: string[] = [];

    // 1. Admin
    const { data: existingAdmins } = await supabase
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdmins && existingAdmins.length > 0) {
      log.push("Admin already exists — skipped.");
    } else {
      const { data: userData, error: createErr } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (createErr) {
        log.push(`Admin creation failed: ${createErr.message}`);
      } else {
        await supabase.from("user_roles").insert({ user_id: userData.user.id, role: "admin" });
        log.push(`Admin created: ${ADMIN_EMAIL}`);
      }
    }

    // 2. Ingredients
    const { count: ingCount } = await supabase.from("ingredients").select("id", { count: "exact", head: true });

    let ingredientMap: Record<string, string> = {};

    if ((ingCount ?? 0) > 0) {
      log.push(`Ingredients exist (${ingCount}) — skipped creation.`);
      const { data: existing } = await supabase.from("ingredients").select("id, name");
      for (const i of existing || []) ingredientMap[i.name] = i.id;
    } else {
      const { data: inserted, error: ingErr } = await supabase
        .from("ingredients")
        .insert(INGREDIENTS_DATA.map(i => ({
          name: i.name,
          slug: i.slug,
          type: i.type,
          description: i.description,
        })))
        .select("id, name");

      if (ingErr) {
        log.push(`Ingredients error: ${ingErr.message}`);
      } else {
        for (const i of inserted || []) ingredientMap[i.name] = i.id;
        log.push(`Ingredients created: ${inserted?.length}`);
      }
    }

    // 3. Equipment
    const { count: eqCount } = await supabase.from("equipment").select("id", { count: "exact", head: true });

    let equipmentMap: Record<string, string> = {};

    if ((eqCount ?? 0) > 0) {
      log.push(`Equipment exists (${eqCount}) — skipped.`);
      const { data: existing } = await supabase.from("equipment").select("id, name");
      for (const e of existing || []) equipmentMap[e.name] = e.id;
    } else {
      const eqInsert = EQUIPMENT_DATA.map(name => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      }));
      const { data: inserted, error: eqErr } = await supabase.from("equipment").insert(eqInsert).select("id, name");
      if (eqErr) {
        log.push(`Equipment error: ${eqErr.message}`);
      } else {
        for (const e of inserted || []) equipmentMap[e.name] = e.id;
        log.push(`Equipment created: ${inserted?.length}`);
      }
    }

    // 4. Hashtags
    const allHashtags = [...new Set(RECIPES_DATA.flatMap(r => r.hashtags))];
    const { count: htCount } = await supabase.from("hashtags").select("id", { count: "exact", head: true });

    let hashtagMap: Record<string, string> = {};

    if ((htCount ?? 0) > 0) {
      log.push(`Hashtags exist — skipped.`);
      const { data: existing } = await supabase.from("hashtags").select("id, name");
      for (const h of existing || []) hashtagMap[h.name] = h.id;
    } else {
      const { data: inserted, error: htErr } = await supabase
        .from("hashtags")
        .insert(allHashtags.map(name => ({ name })))
        .select("id, name");
      if (htErr) {
        log.push(`Hashtags error: ${htErr.message}`);
      } else {
        for (const h of inserted || []) hashtagMap[h.name] = h.id;
        log.push(`Hashtags created: ${inserted?.length}`);
      }
    }

    // 5. Recipes
    const { count: recCount } = await supabase.from("recipes").select("id", { count: "exact", head: true });

    if ((recCount ?? 0) > 0) {
      log.push(`Recipes exist (${recCount}) — skipped.`);
    } else {
      // Insert recipes
      const recipesToInsert = RECIPES_DATA.map(r => ({
        title: r.title,
        slug: r.slug,
        category: r.category,
        alcohol_level: r.alcohol_level,
        badge: r.badge,
        prep_time: r.prep_time,
        description: r.description,
        is_published: true,
      }));

      const { data: insertedRecipes, error: recErr } = await supabase
        .from("recipes")
        .insert(recipesToInsert)
        .select("id, slug");

      if (recErr) {
        log.push(`Recipes error: ${recErr.message}`);
      } else {
        const recipeMap: Record<string, string> = {};
        for (const r of insertedRecipes || []) recipeMap[r.slug] = r.id;

        // Steps
        const allSteps = [];
        for (const r of RECIPES_DATA) {
          const recipeId = recipeMap[r.slug];
          if (!recipeId) continue;
          for (let i = 0; i < r.steps.length; i++) {
            allSteps.push({ recipe_id: recipeId, step_number: i + 1, instruction: r.steps[i] });
          }
        }
        const { error: stErr } = await supabase.from("recipe_steps").insert(allSteps);
        if (stErr) log.push(`Steps error: ${stErr.message}`);

        // Recipe ingredients
        const allRecIng = [];
        for (const r of RECIPES_DATA) {
          const recipeId = recipeMap[r.slug];
          if (!recipeId) continue;
          for (let i = 0; i < r.ingredients.length; i++) {
            const ing = r.ingredients[i];
            const ingredientId = ingredientMap[ing.name];
            if (!ingredientId) continue;
            allRecIng.push({
              recipe_id: recipeId,
              ingredient_id: ingredientId,
              amount_value: ing.amount_value,
              amount_unit: ing.amount_unit,
              display_text: ing.display_text,
              sort_order: i,
            });
          }
        }
        const { error: riErr } = await supabase.from("recipe_ingredients").insert(allRecIng);
        if (riErr) log.push(`Recipe ingredients error: ${riErr.message}`);

        // Recipe equipment
        const allRecEq = [];
        for (const r of RECIPES_DATA) {
          const recipeId = recipeMap[r.slug];
          if (!recipeId) continue;
          for (const eqName of r.equipment) {
            const eqId = equipmentMap[eqName];
            if (!eqId) continue;
            allRecEq.push({ recipe_id: recipeId, equipment_id: eqId });
          }
        }
        const { error: reErr } = await supabase.from("recipe_equipment").insert(allRecEq);
        if (reErr) log.push(`Recipe equipment error: ${reErr.message}`);

        // Recipe tags
        const allTags = [];
        for (const r of RECIPES_DATA) {
          const recipeId = recipeMap[r.slug];
          if (!recipeId) continue;
          for (const tag of r.tags) {
            allTags.push({ recipe_id: recipeId, tag });
          }
        }
        const { error: tErr } = await supabase.from("recipe_tags").insert(allTags);
        if (tErr) log.push(`Tags error: ${tErr.message}`);

        // Recipe hashtags
        const allRecHt = [];
        for (const r of RECIPES_DATA) {
          const recipeId = recipeMap[r.slug];
          if (!recipeId) continue;
          for (const ht of r.hashtags) {
            const htId = hashtagMap[ht];
            if (!htId) continue;
            allRecHt.push({ recipe_id: recipeId, hashtag_id: htId });
          }
        }
        const { error: rhErr } = await supabase.from("recipe_hashtags").insert(allRecHt);
        if (rhErr) log.push(`Recipe hashtags error: ${rhErr.message}`);

        // Recommendations
        const allRecs = [];
        for (const r of RECIPES_DATA) {
          const recipeId = recipeMap[r.slug];
          if (!recipeId || !r.recommendations) continue;
          for (let i = 0; i < r.recommendations.length; i++) {
            const recId = recipeMap[r.recommendations[i]];
            if (!recId) continue;
            allRecs.push({ recipe_id: recipeId, recommended_recipe_id: recId, sort_order: i });
          }
        }
        const { error: rrErr } = await supabase.from("recipe_recommendations").insert(allRecs);
        if (rrErr) log.push(`Recommendations error: ${rrErr.message}`);

        log.push(`Recipes created: ${insertedRecipes?.length} with all relations.`);
      }
    }

    return new Response(JSON.stringify({ success: true, log }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
