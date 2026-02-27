import { recipes } from "./recipes";
import { ingredientImages } from "./ingredientImages";

export interface QuickRecipeStep {
  text: string;
}

export interface QuickRecipeIngredient {
  name: string;
  amount: string;
}

export interface QuickRecipe {
  drinkName: string;
  ingredients: QuickRecipeIngredient[];
  steps: QuickRecipeStep[];
  fullRecipeSlug?: string;
}

export interface IngredientDetail {
  slug: string;
  name: string;
  image: string | null;
  description: string | null;
  quickRecipe: QuickRecipe | null;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Build ingredient details from existing recipe data
function buildIngredientDetails(): IngredientDetail[] {
  const ingredientMap = new Map<string, IngredientDetail>();

  const allIngredientNames = [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.name)))];

  for (const name of allIngredientNames) {
    const slug = toSlug(name);
    const image = ingredientImages[name] || null;

    // Find the first recipe that uses this ingredient for the quick recipe
    const recipe = recipes.find((r) => r.ingredients.some((i) => i.name === name));

    let quickRecipe: QuickRecipe | null = null;
    if (recipe) {
      quickRecipe = {
        drinkName: recipe.title,
        ingredients: recipe.ingredients.map((i) => ({
          name: i.name,
          amount: i.display_text,
        })),
        steps: recipe.instructions.slice(0, 3).map((text) => ({ text })),
        fullRecipeSlug: recipe.slug,
      };
    }

    // Generate descriptions for known ingredients
    const descriptions: Record<string, string> = {
      "White Rum": "White rum is a light-bodied spirit distilled from sugarcane juice or molasses. It is typically aged for a short period and then filtered to remove color. Known for its clean, slightly sweet flavor with subtle vanilla and tropical fruit notes, white rum is the foundation of many classic cocktails.\n\nWhite rum originated in the Caribbean, where sugarcane plantations provided the raw material. Today it is produced in countries like Cuba, Puerto Rico, Jamaica, and the Dominican Republic. Each region imparts its own character to the spirit.\n\nIt pairs exceptionally well with citrus, mint, coconut, and tropical fruits, making it one of the most versatile spirits behind any bar.",
      "Fresh Lime Juice": "Fresh lime juice is the cornerstone of countless cocktails and mixed drinks. Extracted from ripe limes, it provides a bright, tart acidity that balances sweetness and adds a refreshing zing to any beverage.\n\nAlways use freshly squeezed lime juice rather than bottled for the best flavor. A single lime typically yields about 30ml of juice. The juice is best used immediately after squeezing, as it begins to lose its vibrant flavor within hours.",
      "Vodka": "Vodka is a clear, neutral spirit traditionally made from grains or potatoes. It is distilled to a high proof and then diluted with water, resulting in a clean, smooth spirit with minimal flavor and aroma.\n\nOriginating in Eastern Europe — with both Russia and Poland claiming its invention — vodka has become one of the world's most popular spirits. Its neutral character makes it incredibly versatile in cocktails, serving as a blank canvas that lets other ingredients shine.\n\nModern craft distillers are exploring vodkas made from grapes, corn, rice, and even milk whey, each adding subtle differences in texture and mouthfeel.",
      "Tequila": "Tequila is a distinctive Mexican spirit made from the blue agave plant, primarily produced in the region surrounding the city of Tequila in Jalisco. By law, tequila must contain at least 51% blue agave, though premium tequilas are made from 100% agave.\n\nThe spirit comes in several styles: Blanco (unaged, crisp and vegetal), Reposado (aged 2-12 months, smooth with oak notes), and Añejo (aged 1-3 years, complex with caramel and vanilla). Each style brings different characteristics to cocktails.\n\nTequila pairs beautifully with citrus, particularly lime, as well as salt, agave syrup, and tropical fruits.",
      "Bourbon": "Bourbon is an American whiskey made primarily from corn (at least 51%) and aged in new charred oak barrels. It is known for its rich, sweet flavor profile featuring notes of vanilla, caramel, oak, and sometimes cherry or chocolate.\n\nWhile bourbon can be made anywhere in the United States, Kentucky is its spiritual home, producing about 95% of the world's supply. The charred oak barrels give bourbon its distinctive amber color and complex flavor.\n\nIn cocktails, bourbon provides warmth and depth, pairing particularly well with bitters, citrus, honey, and stone fruits.",
      "Fresh Mint": "Fresh mint is an aromatic herb essential to many classic cocktails. Its bright, cooling flavor and fragrant aroma make it one of the most important garnishes and ingredients in mixology.\n\nWhen using mint in cocktails, gently muddle the leaves to release their essential oils without shredding them — over-muddling creates a bitter, grassy taste. Slap the mint between your palms before garnishing to release its aroma.\n\nSpearmint is the preferred variety for cocktails, offering a sweeter, more rounded flavor compared to the more intense peppermint.",
      "Triple Sec": "Triple sec is a clear, orange-flavored liqueur essential to many classic cocktails. Made from the dried peels of bitter and sweet oranges, it provides a bright citrus sweetness that enhances and balances drink recipes.\n\nThe name 'triple sec' refers to the triple distillation process used in its production. Premium brands like Cointreau offer a more refined and balanced flavor, while budget options work well in mixed drinks where the subtleties may be less noticeable.",
      "Coffee Liqueur": "Coffee liqueur is a rich, sweet spirit made by combining coffee beans or extract with a base spirit and sugar. The most famous example is Kahlúa, originating from Veracruz, Mexico.\n\nIts deep, roasted coffee flavor with notes of vanilla and caramel makes it a versatile ingredient in both cocktails and desserts. It pairs exceptionally well with vodka, cream liqueurs, and espresso.",
    };

    ingredientMap.set(name, {
      slug,
      name,
      image,
      description: descriptions[name] || null,
      quickRecipe,
    });
  }

  return Array.from(ingredientMap.values());
}

export const ingredientDetails = buildIngredientDetails();

export function getIngredientBySlug(slug: string): IngredientDetail | undefined {
  return ingredientDetails.find((i) => i.slug === slug);
}

export function getRecipesUsingIngredient(ingredientName: string) {
  return recipes.filter((r) => r.ingredients.some((i) => i.name === ingredientName));
}
