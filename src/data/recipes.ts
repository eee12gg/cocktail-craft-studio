import mojitoImg from "@/assets/cocktails/mojito.png";
import oldFashionedImg from "@/assets/cocktails/old-fashioned.png";
import margaritaImg from "@/assets/cocktails/margarita.png";
import espressoMartiniImg from "@/assets/cocktails/espresso-martini.png";
import cosmopolitanImg from "@/assets/cocktails/cosmopolitan.png";
import pinaColadaImg from "@/assets/cocktails/pina-colada.png";
import tequilaSunriseImg from "@/assets/cocktails/tequila-sunrise.png";
import b52Img from "@/assets/cocktails/b52.png";
import jagerbombImg from "@/assets/cocktails/jagerbomb.png";
import virginDaiquiriImg from "@/assets/cocktails/virgin-daiquiri.png";
import virginMojitoImg from "@/assets/cocktails/virgin-mojito.png";
import kamikazeImg from "@/assets/cocktails/kamikaze.png";

export type Category = "cocktails" | "shots" | "non-alcoholic";

export interface Ingredient {
  name: string;
  amount_value: number;
  amount_unit: string;
  display_text: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  category: Category;
  image: string;
  description: string;
  tags: string[];
  hashtags: string[];
  ingredients: Ingredient[];
  equipment: string[];
  instructions: string[];
  prep_time: string;
  alcohol_level: string;
  badge?: "Trending" | "Popular" | "Top 10" | "New";
}

export const recipes: Recipe[] = [
  {
    id: "1",
    slug: "mojito",
    title: "Mojito",
    category: "cocktails",
    image: mojitoImg,
    description: "A refreshing Cuban classic with white rum, fresh mint, lime, sugar, and sparkling water.",
    tags: ["Refreshing", "Classic", "Rum"],
    hashtags: ["#summer", "#minty", "#cuban"],
    ingredients: [
      { name: "White Rum", amount_value: 60, amount_unit: "ml", display_text: "60 ml White Rum" },
      { name: "Fresh Lime Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Lime Juice" },
      { name: "Sugar Syrup", amount_value: 20, amount_unit: "ml", display_text: "20 ml Sugar Syrup" },
      { name: "Fresh Mint", amount_value: 8, amount_unit: "leaves", display_text: "8 Fresh Mint Leaves" },
      { name: "Soda Water", amount_value: 60, amount_unit: "ml", display_text: "60 ml Soda Water" },
    ],
    equipment: ["Highball Glass", "Muddler", "Bar Spoon"],
    instructions: [
      "Gently muddle mint leaves with sugar syrup in a highball glass.",
      "Add fresh lime juice and white rum.",
      "Fill the glass with crushed ice.",
      "Top with soda water and stir gently.",
      "Garnish with a sprig of fresh mint and a lime wheel.",
    ],
    prep_time: "5 min",
    alcohol_level: "Medium",
    badge: "Popular",
  },
  {
    id: "2",
    slug: "old-fashioned",
    title: "Old Fashioned",
    category: "cocktails",
    image: oldFashionedImg,
    description: "The quintessential whiskey cocktail — bourbon, bitters, sugar, and a twist of orange.",
    tags: ["Classic", "Whiskey", "Strong"],
    hashtags: ["#bourbon", "#classic", "#gentleman"],
    ingredients: [
      { name: "Bourbon", amount_value: 60, amount_unit: "ml", display_text: "60 ml Bourbon" },
      { name: "Sugar Cube", amount_value: 1, amount_unit: "piece", display_text: "1 Sugar Cube" },
      { name: "Angostura Bitters", amount_value: 3, amount_unit: "dashes", display_text: "3 dashes Angostura Bitters" },
      { name: "Orange Peel", amount_value: 1, amount_unit: "piece", display_text: "1 Orange Peel" },
    ],
    equipment: ["Rocks Glass", "Muddler", "Bar Spoon"],
    instructions: [
      "Place sugar cube in a rocks glass and saturate with bitters.",
      "Muddle until dissolved.",
      "Add bourbon and a large ice cube.",
      "Stir gently for 20 seconds.",
      "Express orange peel over the glass and drop it in.",
    ],
    prep_time: "3 min",
    alcohol_level: "Strong",
    badge: "Top 10",
  },
  {
    id: "3",
    slug: "margarita",
    title: "Margarita",
    category: "cocktails",
    image: margaritaImg,
    description: "Tequila, lime juice, and triple sec shaken to perfection with a salted rim.",
    tags: ["Citrus", "Tequila", "Party"],
    hashtags: ["#tequila", "#lime", "#fiesta"],
    ingredients: [
      { name: "Tequila", amount_value: 50, amount_unit: "ml", display_text: "50 ml Tequila" },
      { name: "Triple Sec", amount_value: 25, amount_unit: "ml", display_text: "25 ml Triple Sec" },
      { name: "Fresh Lime Juice", amount_value: 25, amount_unit: "ml", display_text: "25 ml Fresh Lime Juice" },
      { name: "Salt", amount_value: 1, amount_unit: "pinch", display_text: "Salt for rim" },
    ],
    equipment: ["Coupe Glass", "Shaker", "Strainer"],
    instructions: [
      "Rim the glass with salt.",
      "Combine tequila, triple sec, and lime juice in a shaker with ice.",
      "Shake vigorously for 15 seconds.",
      "Strain into the prepared glass.",
      "Garnish with a lime wheel.",
    ],
    prep_time: "4 min",
    alcohol_level: "Medium",
    badge: "Trending",
  },
  {
    id: "4",
    slug: "espresso-martini",
    title: "Espresso Martini",
    category: "cocktails",
    image: espressoMartiniImg,
    description: "A sophisticated blend of vodka, coffee liqueur, and freshly brewed espresso.",
    tags: ["Coffee", "Vodka", "Elegant"],
    hashtags: ["#coffee", "#nightlife", "#espresso"],
    ingredients: [
      { name: "Vodka", amount_value: 50, amount_unit: "ml", display_text: "50 ml Vodka" },
      { name: "Coffee Liqueur", amount_value: 25, amount_unit: "ml", display_text: "25 ml Coffee Liqueur" },
      { name: "Fresh Espresso", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Espresso" },
      { name: "Sugar Syrup", amount_value: 10, amount_unit: "ml", display_text: "10 ml Sugar Syrup" },
    ],
    equipment: ["Martini Glass", "Shaker", "Strainer"],
    instructions: [
      "Brew a fresh shot of espresso and let it cool slightly.",
      "Combine all ingredients in a shaker with ice.",
      "Shake hard for 15 seconds to create a rich foam.",
      "Double strain into a chilled martini glass.",
      "Garnish with three coffee beans.",
    ],
    prep_time: "5 min",
    alcohol_level: "Medium",
    badge: "Trending",
  },
  {
    id: "5",
    slug: "cosmopolitan",
    title: "Cosmopolitan",
    category: "cocktails",
    image: cosmopolitanImg,
    description: "Vodka citron, cranberry juice, triple sec, and fresh lime — elegant and vibrant.",
    tags: ["Fruity", "Vodka", "Elegant"],
    hashtags: ["#cosmo", "#cranberry", "#chic"],
    ingredients: [
      { name: "Vodka Citron", amount_value: 40, amount_unit: "ml", display_text: "40 ml Vodka Citron" },
      { name: "Triple Sec", amount_value: 15, amount_unit: "ml", display_text: "15 ml Triple Sec" },
      { name: "Cranberry Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Cranberry Juice" },
      { name: "Fresh Lime Juice", amount_value: 15, amount_unit: "ml", display_text: "15 ml Fresh Lime Juice" },
    ],
    equipment: ["Martini Glass", "Shaker", "Strainer"],
    instructions: [
      "Add all ingredients to a shaker with ice.",
      "Shake until well-chilled.",
      "Strain into a chilled martini glass.",
      "Garnish with an orange twist.",
    ],
    prep_time: "4 min",
    alcohol_level: "Medium",
  },
  {
    id: "6",
    slug: "pina-colada",
    title: "Piña Colada",
    category: "cocktails",
    image: pinaColadaImg,
    description: "A tropical paradise of rum, coconut cream, and pineapple juice blended with ice.",
    tags: ["Tropical", "Rum", "Sweet"],
    hashtags: ["#tropical", "#coconut", "#beach"],
    ingredients: [
      { name: "White Rum", amount_value: 60, amount_unit: "ml", display_text: "60 ml White Rum" },
      { name: "Coconut Cream", amount_value: 40, amount_unit: "ml", display_text: "40 ml Coconut Cream" },
      { name: "Pineapple Juice", amount_value: 90, amount_unit: "ml", display_text: "90 ml Pineapple Juice" },
    ],
    equipment: ["Hurricane Glass", "Blender"],
    instructions: [
      "Combine rum, coconut cream, and pineapple juice in a blender.",
      "Add a cup of crushed ice.",
      "Blend until smooth.",
      "Pour into a hurricane glass.",
      "Garnish with a pineapple wedge and cherry.",
    ],
    prep_time: "5 min",
    alcohol_level: "Medium",
    badge: "Popular",
  },
  {
    id: "7",
    slug: "tequila-sunrise",
    title: "Tequila Sunrise",
    category: "cocktails",
    image: tequilaSunriseImg,
    description: "A visually stunning layered drink with tequila, orange juice, and grenadine.",
    tags: ["Fruity", "Tequila", "Colorful"],
    hashtags: ["#sunrise", "#layered", "#orange"],
    ingredients: [
      { name: "Tequila", amount_value: 45, amount_unit: "ml", display_text: "45 ml Tequila" },
      { name: "Orange Juice", amount_value: 120, amount_unit: "ml", display_text: "120 ml Orange Juice" },
      { name: "Grenadine", amount_value: 15, amount_unit: "ml", display_text: "15 ml Grenadine" },
    ],
    equipment: ["Highball Glass", "Bar Spoon"],
    instructions: [
      "Fill a highball glass with ice.",
      "Pour tequila and orange juice, stir gently.",
      "Slowly pour grenadine down the side of the glass.",
      "Let it sink to the bottom to create the sunrise effect.",
      "Garnish with an orange slice and cherry.",
    ],
    prep_time: "3 min",
    alcohol_level: "Medium",
    badge: "New",
  },
  // SHOTS
  {
    id: "8",
    slug: "b52",
    title: "B-52",
    category: "shots",
    image: b52Img,
    description: "Three beautifully layered liqueurs — Kahlúa, Baileys, and Grand Marnier.",
    tags: ["Layered", "Sweet", "Classic"],
    hashtags: ["#layered", "#shooter", "#flaming"],
    ingredients: [
      { name: "Kahlúa", amount_value: 20, amount_unit: "ml", display_text: "20 ml Kahlúa" },
      { name: "Baileys", amount_value: 20, amount_unit: "ml", display_text: "20 ml Baileys" },
      { name: "Grand Marnier", amount_value: 20, amount_unit: "ml", display_text: "20 ml Grand Marnier" },
    ],
    equipment: ["Shot Glass", "Bar Spoon"],
    instructions: [
      "Pour Kahlúa into a shot glass.",
      "Using the back of a bar spoon, slowly layer Baileys on top.",
      "Repeat layering with Grand Marnier.",
      "Serve immediately — optionally flame the top layer.",
    ],
    prep_time: "2 min",
    alcohol_level: "Strong",
    badge: "Top 10",
  },
  {
    id: "9",
    slug: "jagerbomb",
    title: "Jägerbomb",
    category: "shots",
    image: jagerbombImg,
    description: "A high-energy classic — Jägermeister dropped into an energy drink.",
    tags: ["Energy", "Party", "Fast"],
    hashtags: ["#party", "#energy", "#bomb"],
    ingredients: [
      { name: "Jägermeister", amount_value: 30, amount_unit: "ml", display_text: "30 ml Jägermeister" },
      { name: "Energy Drink", amount_value: 120, amount_unit: "ml", display_text: "120 ml Energy Drink" },
    ],
    equipment: ["Shot Glass", "Pint Glass"],
    instructions: [
      "Pour energy drink into a pint glass.",
      "Fill a shot glass with Jägermeister.",
      "Drop the shot glass into the energy drink.",
      "Drink immediately!",
    ],
    prep_time: "1 min",
    alcohol_level: "Medium",
    badge: "Popular",
  },
  {
    id: "10",
    slug: "kamikaze",
    title: "Kamikaze",
    category: "shots",
    image: kamikazeImg,
    description: "A sharp, citrusy shot of vodka, triple sec, and fresh lime juice.",
    tags: ["Citrus", "Vodka", "Sharp"],
    hashtags: ["#sharp", "#citrus", "#shooter"],
    ingredients: [
      { name: "Vodka", amount_value: 30, amount_unit: "ml", display_text: "30 ml Vodka" },
      { name: "Triple Sec", amount_value: 15, amount_unit: "ml", display_text: "15 ml Triple Sec" },
      { name: "Fresh Lime Juice", amount_value: 15, amount_unit: "ml", display_text: "15 ml Fresh Lime Juice" },
    ],
    equipment: ["Shot Glass", "Shaker"],
    instructions: [
      "Combine all ingredients in a shaker with ice.",
      "Shake briefly.",
      "Strain into a shot glass.",
      "Serve immediately.",
    ],
    prep_time: "2 min",
    alcohol_level: "Strong",
    badge: "New",
  },
  // NON-ALCOHOLIC
  {
    id: "11",
    slug: "virgin-strawberry-daiquiri",
    title: "Virgin Strawberry Daiquiri",
    category: "non-alcoholic",
    image: virginDaiquiriImg,
    description: "Sweet, fruity, and refreshing — frozen strawberries blended with lime and sugar.",
    tags: ["Fruity", "Frozen", "Sweet"],
    hashtags: ["#mocktail", "#strawberry", "#frozen"],
    ingredients: [
      { name: "Fresh Strawberries", amount_value: 150, amount_unit: "g", display_text: "150 g Fresh Strawberries" },
      { name: "Fresh Lime Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Lime Juice" },
      { name: "Sugar Syrup", amount_value: 30, amount_unit: "ml", display_text: "30 ml Sugar Syrup" },
      { name: "Crushed Ice", amount_value: 1, amount_unit: "cup", display_text: "1 cup Crushed Ice" },
    ],
    equipment: ["Hurricane Glass", "Blender"],
    instructions: [
      "Combine strawberries, lime juice, sugar syrup, and ice in a blender.",
      "Blend until smooth and thick.",
      "Pour into a hurricane glass.",
      "Garnish with a fresh strawberry and mint sprig.",
    ],
    prep_time: "5 min",
    alcohol_level: "None",
    badge: "Trending",
  },
  {
    id: "12",
    slug: "virgin-mojito",
    title: "Virgin Mojito",
    category: "non-alcoholic",
    image: virginMojitoImg,
    description: "All the freshness of a classic mojito — mint, lime, and sparkling water, no alcohol.",
    tags: ["Refreshing", "Minty", "Light"],
    hashtags: ["#mocktail", "#minty", "#refreshing"],
    ingredients: [
      { name: "Fresh Mint", amount_value: 8, amount_unit: "leaves", display_text: "8 Fresh Mint Leaves" },
      { name: "Fresh Lime Juice", amount_value: 30, amount_unit: "ml", display_text: "30 ml Fresh Lime Juice" },
      { name: "Sugar Syrup", amount_value: 20, amount_unit: "ml", display_text: "20 ml Sugar Syrup" },
      { name: "Soda Water", amount_value: 150, amount_unit: "ml", display_text: "150 ml Soda Water" },
    ],
    equipment: ["Highball Glass", "Muddler"],
    instructions: [
      "Gently muddle mint leaves with sugar syrup in a glass.",
      "Add lime juice and fill with crushed ice.",
      "Top with soda water.",
      "Stir gently and garnish with mint and lime.",
    ],
    prep_time: "4 min",
    alcohol_level: "None",
    badge: "Popular",
  },
];

export const allTags = [...new Set(recipes.flatMap((r) => r.tags))];
export const allEquipment = [...new Set(recipes.flatMap((r) => r.equipment))];
export const allIngredientNames = [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.name)))];

export function getRecipesByCategory(category: Category): Recipe[] {
  return recipes.filter((r) => r.category === category);
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

export function searchRecipes(query: string): Recipe[] {
  const q = query.toLowerCase();
  return recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.hashtags.some((h) => h.toLowerCase().includes(q)) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(q)) ||
      r.equipment.some((e) => e.toLowerCase().includes(q)) ||
      r.category.toLowerCase().includes(q)
  );
}
