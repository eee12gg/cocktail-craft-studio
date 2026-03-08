
-- ============================================================
-- NEW INGREDIENTS
-- ============================================================
INSERT INTO ingredients (id, name, name_en, slug, type, type_id, description) VALUES
  ('a0000001-0000-0000-0000-000000000001', 'Gin', 'Gin', 'gin', 'alcohol', '2c983829-dbf3-4e27-878e-cd9692db33aa', 'A juniper-flavored spirit, the base for many classic cocktails'),
  ('a0000001-0000-0000-0000-000000000002', 'Campari', 'Campari', 'campari', 'liqueur', 'ad877f18-9b47-4586-a9c3-2bd45be78c1a', 'Italian bitter red liqueur, essential for Negroni and Americano'),
  ('a0000001-0000-0000-0000-000000000003', 'Sweet Vermouth', 'Sweet Vermouth', 'sweet-vermouth', 'alcohol', '2c983829-dbf3-4e27-878e-cd9692db33aa', 'A fortified and aromatized wine with a sweet, herbal flavor'),
  ('a0000001-0000-0000-0000-000000000004', 'Lemon Juice', 'Lemon Juice', 'lemon-juice', 'juice', '79934c24-a65f-4e16-9db3-83100c96df42', 'Freshly squeezed lemon juice, a sour component in many cocktails'),
  ('a0000001-0000-0000-0000-000000000005', 'Egg White', 'Egg White', 'egg-white', 'other', '52c43480-85af-4dbf-b669-a7ac990ddf75', 'Adds a silky, frothy texture to sour cocktails'),
  ('a0000001-0000-0000-0000-000000000006', 'Ginger Beer', 'Ginger Beer', 'ginger-beer', 'mixer', '660251d3-40f2-4a20-a26c-0ceab77c38f7', 'Spicy non-alcoholic carbonated drink made from ginger'),
  ('a0000001-0000-0000-0000-000000000007', 'Tonic Water', 'Tonic Water', 'tonic-water', 'mixer', '660251d3-40f2-4a20-a26c-0ceab77c38f7', 'Carbonated water with quinine, slightly bitter'),
  ('a0000001-0000-0000-0000-000000000008', 'Aperol', 'Aperol', 'aperol', 'liqueur', 'ad877f18-9b47-4586-a9c3-2bd45be78c1a', 'An Italian orange-flavored bitter aperitif'),
  ('a0000001-0000-0000-0000-000000000009', 'Prosecco', 'Prosecco', 'prosecco', 'alcohol', '2c983829-dbf3-4e27-878e-cd9692db33aa', 'Italian sparkling wine from Veneto region'),
  ('a0000001-0000-0000-0000-000000000010', 'Dark Rum', 'Dark Rum', 'dark-rum', 'alcohol', '2c983829-dbf3-4e27-878e-cd9692db33aa', 'Aged rum with rich, deep caramel and molasses flavor'),
  ('a0000001-0000-0000-0000-000000000011', 'Orange Curaçao', 'Orange Curacao', 'orange-curacao', 'liqueur', 'ad877f18-9b47-4586-a9c3-2bd45be78c1a', 'Orange-flavored liqueur from the Caribbean island of Curaçao'),
  ('a0000001-0000-0000-0000-000000000012', 'Orgeat Syrup', 'Orgeat Syrup', 'orgeat-syrup', 'syrup', 'c339d81e-c730-4a19-a2d1-cfe71f72116a', 'Sweet almond-flavored syrup used in tiki cocktails'),
  ('a0000001-0000-0000-0000-000000000013', 'Cola', 'Cola', 'cola', 'mixer', '660251d3-40f2-4a20-a26c-0ceab77c38f7', 'Classic carbonated soft drink'),
  ('a0000001-0000-0000-0000-000000000014', 'Cachaça', 'Cachaca', 'cachaca', 'alcohol', '2c983829-dbf3-4e27-878e-cd9692db33aa', 'Brazilian sugarcane spirit, the base of Caipirinha'),
  ('a0000001-0000-0000-0000-000000000015', 'Tomato Juice', 'Tomato Juice', 'tomato-juice', 'juice', '79934c24-a65f-4e16-9db3-83100c96df42', 'Thick red juice from tomatoes'),
  ('a0000001-0000-0000-0000-000000000016', 'Tabasco', 'Tabasco', 'tabasco', 'other', '52c43480-85af-4dbf-b669-a7ac990ddf75', 'Hot pepper sauce adding spicy kick'),
  ('a0000001-0000-0000-0000-000000000017', 'Worcestershire Sauce', 'Worcestershire Sauce', 'worcestershire-sauce', 'other', '52c43480-85af-4dbf-b669-a7ac990ddf75', 'Savory fermented condiment with complex umami flavor'),
  ('a0000001-0000-0000-0000-000000000018', 'Celery Stalk', 'Celery Stalk', 'celery-stalk', 'other', '52c43480-85af-4dbf-b669-a7ac990ddf75', 'Fresh celery used as garnish for Bloody Mary'),
  ('a0000001-0000-0000-0000-000000000019', 'Grapefruit Juice', 'Grapefruit Juice', 'grapefruit-juice', 'juice', '79934c24-a65f-4e16-9db3-83100c96df42', 'Tart pink citrus juice'),
  ('a0000001-0000-0000-0000-000000000020', 'Pisco', 'Pisco', 'pisco', 'alcohol', '2c983829-dbf3-4e27-878e-cd9692db33aa', 'South American grape brandy from Peru and Chile'),
  ('a0000001-0000-0000-0000-000000000021', 'Lime', 'Lime', 'lime', 'fruit', 'd3a7e27a-c2de-4a20-9cf5-f2c5b279559e', 'Fresh whole lime for muddling and garnish'),
  ('a0000001-0000-0000-0000-000000000022', 'Sugar', 'Sugar', 'sugar', 'other', '52c43480-85af-4dbf-b669-a7ac990ddf75', 'White granulated sugar for muddling');

-- ============================================================
-- NEW RECIPES (15 cocktails)
-- ============================================================
INSERT INTO recipes (id, title, slug, category, alcohol_level, description, is_published, prep_time, badge) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Negroni', 'negroni', 'cocktails', 'Medium', 'A perfectly balanced Italian aperitif with gin, Campari and sweet vermouth', true, '3 min', 'Popular'),
  ('b0000001-0000-0000-0000-000000000002', 'Daiquiri', 'daiquiri', 'cocktails', 'Medium', 'A classic Cuban cocktail: rum, lime, and sugar in perfect harmony', true, '3 min', NULL),
  ('b0000001-0000-0000-0000-000000000003', 'Whiskey Sour', 'whiskey-sour', 'cocktails', 'Medium', 'A timeless bourbon cocktail with citrus and silky egg white foam', true, '5 min', 'Popular'),
  ('b0000001-0000-0000-0000-000000000004', 'Moscow Mule', 'moscow-mule', 'cocktails', 'Light', 'A refreshing vodka cocktail with spicy ginger beer in a copper mug', true, '3 min', 'Trending'),
  ('b0000001-0000-0000-0000-000000000005', 'Gin & Tonic', 'gin-tonic', 'cocktails', 'Light', 'The quintessential refreshing highball: gin and tonic with lime', true, '2 min', 'Popular'),
  ('b0000001-0000-0000-0000-000000000006', 'Aperol Spritz', 'aperol-spritz', 'cocktails', 'Light', 'Italy''s iconic sparkling aperitif, bittersweet and refreshing', true, '2 min', 'Trending'),
  ('b0000001-0000-0000-0000-000000000007', 'Mai Tai', 'mai-tai', 'cocktails', 'Strong', 'The legendary tiki cocktail with rum, curaçao and orgeat', true, '5 min', NULL),
  ('b0000001-0000-0000-0000-000000000008', 'Long Island Iced Tea', 'long-island-iced-tea', 'cocktails', 'Strong', 'Five spirits combined to create a deceptively smooth, tea-colored drink', true, '5 min', NULL),
  ('b0000001-0000-0000-0000-000000000009', 'Caipirinha', 'caipirinha', 'cocktails', 'Medium', 'Brazil''s national cocktail: cachaça muddled with lime and sugar', true, '3 min', NULL),
  ('b0000001-0000-0000-0000-000000000010', 'Bloody Mary', 'bloody-mary', 'cocktails', 'Light', 'The classic brunch cocktail with vodka and spiced tomato juice', true, '5 min', NULL),
  ('b0000001-0000-0000-0000-000000000011', 'Paloma', 'paloma', 'cocktails', 'Light', 'Mexico''s most popular tequila cocktail with grapefruit and lime', true, '3 min', NULL),
  ('b0000001-0000-0000-0000-000000000012', 'Dark ''n'' Stormy', 'dark-n-stormy', 'cocktails', 'Medium', 'A bold rum cocktail with spicy ginger beer and fresh lime', true, '3 min', NULL),
  ('b0000001-0000-0000-0000-000000000013', 'Manhattan', 'manhattan', 'cocktails', 'Strong', 'A sophisticated whiskey cocktail with sweet vermouth and bitters', true, '3 min', 'Top 10'),
  ('b0000001-0000-0000-0000-000000000014', 'Tom Collins', 'tom-collins', 'cocktails', 'Light', 'A refreshing gin fizz with lemon juice, sugar and soda water', true, '3 min', NULL),
  ('b0000001-0000-0000-0000-000000000015', 'Pisco Sour', 'pisco-sour', 'cocktails', 'Medium', 'Peru''s national cocktail: pisco, lime, sugar and frothy egg white', true, '5 min', NULL);

-- ============================================================
-- RECIPE INGREDIENTS
-- ============================================================
-- Negroni
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '30 ml Gin', 1),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', '30 ml Campari', 2),
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', '30 ml Sweet Vermouth', 3),
  ('b0000001-0000-0000-0000-000000000001', '36e65be2-db67-4dea-af35-951cbcc35cc1', 'Orange peel garnish', 4);
-- Daiquiri
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000002', 'f471732b-3bc0-47b2-bd3d-0aa7af030493', '60 ml White Rum', 1),
  ('b0000001-0000-0000-0000-000000000002', '893abd00-f3e2-4138-b666-ca5ed5e5d010', '30 ml Fresh Lime Juice', 2),
  ('b0000001-0000-0000-0000-000000000002', '7b71970d-74ac-449b-b2be-c56003fecf5c', '15 ml Sugar Syrup', 3);
-- Whiskey Sour
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000003', '0e1f3be7-97c0-4b3b-b3a1-cf394b97364f', '60 ml Bourbon', 1),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000004', '30 ml Lemon Juice', 2),
  ('b0000001-0000-0000-0000-000000000003', '7b71970d-74ac-449b-b2be-c56003fecf5c', '15 ml Sugar Syrup', 3),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000005', '1 Egg White', 4),
  ('b0000001-0000-0000-0000-000000000003', '133a9e4a-dfc8-4813-9cbb-2cf39a5b4d96', '2 dashes Angostura Bitters', 5);
-- Moscow Mule
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000004', 'fb2c653e-89c9-4ccd-bed0-38fd73c021f6', '60 ml Vodka', 1),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000006', '120 ml Ginger Beer', 2),
  ('b0000001-0000-0000-0000-000000000004', '893abd00-f3e2-4138-b666-ca5ed5e5d010', '15 ml Fresh Lime Juice', 3);
-- Gin & Tonic
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', '50 ml Gin', 1),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000007', '150 ml Tonic Water', 2),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000021', 'Lime wedge garnish', 3);
-- Aperol Spritz
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000008', '60 ml Aperol', 1),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000009', '90 ml Prosecco', 2),
  ('b0000001-0000-0000-0000-000000000006', '7209cfd6-dd3f-4ab2-a5c2-c142a103ba0f', '30 ml Soda Water', 3);
-- Mai Tai
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000007', 'f471732b-3bc0-47b2-bd3d-0aa7af030493', '30 ml White Rum', 1),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000010', '30 ml Dark Rum', 2),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000011', '15 ml Orange Curaçao', 3),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000012', '15 ml Orgeat Syrup', 4),
  ('b0000001-0000-0000-0000-000000000007', '893abd00-f3e2-4138-b666-ca5ed5e5d010', '30 ml Fresh Lime Juice', 5);
-- Long Island Iced Tea
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000008', 'fb2c653e-89c9-4ccd-bed0-38fd73c021f6', '15 ml Vodka', 1),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', '15 ml Gin', 2),
  ('b0000001-0000-0000-0000-000000000008', 'f471732b-3bc0-47b2-bd3d-0aa7af030493', '15 ml White Rum', 3),
  ('b0000001-0000-0000-0000-000000000008', '0f1b3d31-bdd8-4411-841b-469856406690', '15 ml Tequila', 4),
  ('b0000001-0000-0000-0000-000000000008', '9fbcc890-55eb-487f-be43-471298964fcc', '15 ml Triple Sec', 5),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000004', '30 ml Lemon Juice', 6),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000013', 'Top with Cola', 7);
-- Caipirinha
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000014', '60 ml Cachaça', 1),
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000021', '1 Lime, cut into wedges', 2),
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000022', '2 tsp Sugar', 3);
-- Bloody Mary
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000010', 'fb2c653e-89c9-4ccd-bed0-38fd73c021f6', '45 ml Vodka', 1),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000015', '90 ml Tomato Juice', 2),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000004', '15 ml Lemon Juice', 3),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000017', '3 dashes Worcestershire Sauce', 4),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000016', '2 dashes Tabasco', 5),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000018', 'Celery stalk garnish', 6);
-- Paloma
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000011', '0f1b3d31-bdd8-4411-841b-469856406690', '60 ml Tequila', 1),
  ('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000019', '90 ml Grapefruit Juice', 2),
  ('b0000001-0000-0000-0000-000000000011', '893abd00-f3e2-4138-b666-ca5ed5e5d010', '15 ml Fresh Lime Juice', 3),
  ('b0000001-0000-0000-0000-000000000011', '7209cfd6-dd3f-4ab2-a5c2-c142a103ba0f', '30 ml Soda Water', 4),
  ('b0000001-0000-0000-0000-000000000011', '208e4cc2-6e09-4e4a-86fb-a818ca759477', 'Salt rim', 5);
-- Dark 'n' Stormy
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000010', '60 ml Dark Rum', 1),
  ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000006', '120 ml Ginger Beer', 2),
  ('b0000001-0000-0000-0000-000000000012', '893abd00-f3e2-4138-b666-ca5ed5e5d010', '15 ml Fresh Lime Juice', 3);
-- Manhattan
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000013', '0e1f3be7-97c0-4b3b-b3a1-cf394b97364f', '60 ml Bourbon', 1),
  ('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000003', '30 ml Sweet Vermouth', 2),
  ('b0000001-0000-0000-0000-000000000013', '133a9e4a-dfc8-4813-9cbb-2cf39a5b4d96', '2 dashes Angostura Bitters', 3);
-- Tom Collins
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000001', '45 ml Gin', 1),
  ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000004', '30 ml Lemon Juice', 2),
  ('b0000001-0000-0000-0000-000000000014', '7b71970d-74ac-449b-b2be-c56003fecf5c', '15 ml Sugar Syrup', 3),
  ('b0000001-0000-0000-0000-000000000014', '7209cfd6-dd3f-4ab2-a5c2-c142a103ba0f', 'Top with Soda Water', 4);
-- Pisco Sour
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, display_text, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000020', '60 ml Pisco', 1),
  ('b0000001-0000-0000-0000-000000000015', '893abd00-f3e2-4138-b666-ca5ed5e5d010', '30 ml Fresh Lime Juice', 2),
  ('b0000001-0000-0000-0000-000000000015', '7b71970d-74ac-449b-b2be-c56003fecf5c', '20 ml Sugar Syrup', 3),
  ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000005', '1 Egg White', 4),
  ('b0000001-0000-0000-0000-000000000015', '133a9e4a-dfc8-4813-9cbb-2cf39a5b4d96', '3 drops Angostura Bitters', 5);

-- ============================================================
-- RECIPE STEPS
-- ============================================================
-- Negroni
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000001', 1, 'Add gin, Campari, and sweet vermouth to a mixing glass with ice'),
  ('b0000001-0000-0000-0000-000000000001', 2, 'Stir well for 20-30 seconds until chilled'),
  ('b0000001-0000-0000-0000-000000000001', 3, 'Strain into a rocks glass over a large ice cube'),
  ('b0000001-0000-0000-0000-000000000001', 4, 'Garnish with an orange peel');
-- Daiquiri
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000002', 1, 'Add white rum, fresh lime juice, and sugar syrup to a shaker with ice'),
  ('b0000001-0000-0000-0000-000000000002', 2, 'Shake vigorously for 10-15 seconds'),
  ('b0000001-0000-0000-0000-000000000002', 3, 'Double strain into a chilled coupe glass'),
  ('b0000001-0000-0000-0000-000000000002', 4, 'Garnish with a lime wheel');
-- Whiskey Sour
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000003', 1, 'Add bourbon, lemon juice, sugar syrup, and egg white to a shaker'),
  ('b0000001-0000-0000-0000-000000000003', 2, 'Dry shake (without ice) for 15 seconds to emulsify the egg white'),
  ('b0000001-0000-0000-0000-000000000003', 3, 'Add ice and shake again vigorously for 10-15 seconds'),
  ('b0000001-0000-0000-0000-000000000003', 4, 'Strain into a rocks glass over ice'),
  ('b0000001-0000-0000-0000-000000000003', 5, 'Garnish with an orange slice, cherry, and angostura bitters drops on the foam');
-- Moscow Mule
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000004', 1, 'Fill a copper mug with ice cubes'),
  ('b0000001-0000-0000-0000-000000000004', 2, 'Pour vodka and lime juice over the ice'),
  ('b0000001-0000-0000-0000-000000000004', 3, 'Top with ginger beer and stir gently'),
  ('b0000001-0000-0000-0000-000000000004', 4, 'Garnish with a lime wedge and mint sprig');
-- Gin & Tonic
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000005', 1, 'Fill a highball glass with ice cubes'),
  ('b0000001-0000-0000-0000-000000000005', 2, 'Pour gin over the ice'),
  ('b0000001-0000-0000-0000-000000000005', 3, 'Top with tonic water and stir gently'),
  ('b0000001-0000-0000-0000-000000000005', 4, 'Garnish with a lime wedge');
-- Aperol Spritz
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000006', 1, 'Fill a large wine glass with ice cubes'),
  ('b0000001-0000-0000-0000-000000000006', 2, 'Pour Aperol and Prosecco over the ice'),
  ('b0000001-0000-0000-0000-000000000006', 3, 'Top with a splash of soda water'),
  ('b0000001-0000-0000-0000-000000000006', 4, 'Garnish with an orange slice');
-- Mai Tai
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000007', 1, 'Add white rum, orange curaçao, orgeat syrup, and lime juice to a shaker with ice'),
  ('b0000001-0000-0000-0000-000000000007', 2, 'Shake well for 10-15 seconds'),
  ('b0000001-0000-0000-0000-000000000007', 3, 'Strain into a rocks glass filled with crushed ice'),
  ('b0000001-0000-0000-0000-000000000007', 4, 'Float dark rum on top'),
  ('b0000001-0000-0000-0000-000000000007', 5, 'Garnish with a mint sprig and lime shell');
-- Long Island Iced Tea
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000008', 1, 'Add vodka, gin, rum, tequila, triple sec, and lemon juice to a shaker with ice'),
  ('b0000001-0000-0000-0000-000000000008', 2, 'Shake briefly and strain into an ice-filled highball glass'),
  ('b0000001-0000-0000-0000-000000000008', 3, 'Top with cola'),
  ('b0000001-0000-0000-0000-000000000008', 4, 'Garnish with a lemon wedge');
-- Caipirinha
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000009', 1, 'Cut lime into wedges and place in a rocks glass'),
  ('b0000001-0000-0000-0000-000000000009', 2, 'Add sugar and muddle well to release lime juice'),
  ('b0000001-0000-0000-0000-000000000009', 3, 'Fill glass with crushed ice'),
  ('b0000001-0000-0000-0000-000000000009', 4, 'Pour cachaça over the ice and stir');
-- Bloody Mary
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000010', 1, 'Add vodka, tomato juice, lemon juice, Worcestershire sauce, and Tabasco to a glass'),
  ('b0000001-0000-0000-0000-000000000010', 2, 'Add salt and pepper to taste'),
  ('b0000001-0000-0000-0000-000000000010', 3, 'Fill with ice and roll gently between two glasses to mix'),
  ('b0000001-0000-0000-0000-000000000010', 4, 'Garnish with a celery stalk and lime wedge');
-- Paloma
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000011', 1, 'Rim a highball glass with salt'),
  ('b0000001-0000-0000-0000-000000000011', 2, 'Fill with ice, add tequila and lime juice'),
  ('b0000001-0000-0000-0000-000000000011', 3, 'Top with grapefruit juice and soda water'),
  ('b0000001-0000-0000-0000-000000000011', 4, 'Stir gently and garnish with a grapefruit slice');
-- Dark 'n' Stormy
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000012', 1, 'Fill a highball glass with ice'),
  ('b0000001-0000-0000-0000-000000000012', 2, 'Pour ginger beer over the ice'),
  ('b0000001-0000-0000-0000-000000000012', 3, 'Float dark rum on top by pouring over the back of a spoon'),
  ('b0000001-0000-0000-0000-000000000012', 4, 'Garnish with a lime wedge');
-- Manhattan
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000013', 1, 'Add bourbon, sweet vermouth, and Angostura bitters to a mixing glass with ice'),
  ('b0000001-0000-0000-0000-000000000013', 2, 'Stir well for 20-30 seconds'),
  ('b0000001-0000-0000-0000-000000000013', 3, 'Strain into a chilled coupe glass'),
  ('b0000001-0000-0000-0000-000000000013', 4, 'Garnish with a maraschino cherry');
-- Tom Collins
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000014', 1, 'Add gin, lemon juice, and sugar syrup to a shaker with ice'),
  ('b0000001-0000-0000-0000-000000000014', 2, 'Shake well for 10-15 seconds'),
  ('b0000001-0000-0000-0000-000000000014', 3, 'Strain into an ice-filled Collins glass'),
  ('b0000001-0000-0000-0000-000000000014', 4, 'Top with soda water and garnish with a lemon wheel and cherry');
-- Pisco Sour
INSERT INTO recipe_steps (recipe_id, step_number, instruction) VALUES
  ('b0000001-0000-0000-0000-000000000015', 1, 'Add pisco, lime juice, sugar syrup, and egg white to a shaker'),
  ('b0000001-0000-0000-0000-000000000015', 2, 'Dry shake for 15 seconds to emulsify'),
  ('b0000001-0000-0000-0000-000000000015', 3, 'Add ice and shake vigorously for 10-15 seconds'),
  ('b0000001-0000-0000-0000-000000000015', 4, 'Strain into a chilled coupe glass'),
  ('b0000001-0000-0000-0000-000000000015', 5, 'Drop 3 drops of Angostura Bitters on the foam and make a pattern with a toothpick');
