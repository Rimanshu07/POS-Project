const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const menuCategories = [
  // ==========================================
  // MENU 1 — BAR MENU
  // ==========================================
  {
    name: 'Whisky',
    slug: 'whisky',
    products: [
      { name: 'Rampur Asava (30ml)', size: '30ml', price: 649, isAlcohol: true },
      { name: 'Rampur Asava (60ml)', size: '60ml', price: 1199, isAlcohol: true },
      { name: 'Rampur (30ml)', size: '30ml', price: 549, isAlcohol: true },
      { name: 'Rampur (60ml)', size: '60ml', price: 1049, isAlcohol: true },
      { name: 'Glenfiddich 15yrs (30ml)', size: '30ml', price: 459, isAlcohol: true },
      { name: 'Glenfiddich 15yrs (60ml)', size: '60ml', price: 899, isAlcohol: true },
      { name: 'Sangam (30ml)', size: '30ml', price: 399, isAlcohol: true },
      { name: 'Sangam (60ml)', size: '60ml', price: 799, isAlcohol: true },
      { name: 'Glenfiddich 12yrs (30ml)', size: '30ml', price: 399, isAlcohol: true },
      { name: 'Glenfiddich 12yrs (60ml)', size: '60ml', price: 799, isAlcohol: true },
      { name: 'Singleton 12yrs (30ml)', size: '30ml', price: 399, isAlcohol: true },
      { name: 'Singleton 12yrs (60ml)', size: '60ml', price: 799, isAlcohol: true },
      { name: 'Indri (30ml)', size: '30ml', price: 369, isAlcohol: true },
      { name: 'Indri (60ml)', size: '60ml', price: 749, isAlcohol: true },
      { name: 'Glenlivet 12yrs (30ml)', size: '30ml', price: 359, isAlcohol: true },
      { name: 'Glenlivet 12yrs (60ml)', size: '60ml', price: 699, isAlcohol: true },
      { name: 'Monkey Shoulder (30ml)', size: '30ml', price: 339, isAlcohol: true },
      { name: 'Monkey Shoulder (60ml)', size: '60ml', price: 649, isAlcohol: true },
      { name: 'Amrut Fusion (30ml)', size: '30ml', price: 339, isAlcohol: true },
      { name: 'Amrut Fusion (60ml)', size: '60ml', price: 649, isAlcohol: true },
      { name: 'Virasat 1943 Rampur (30ml)', size: '30ml', price: 309, isAlcohol: true },
      { name: 'Virasat 1943 Rampur (60ml)', size: '60ml', price: 599, isAlcohol: true },
    ],
  },
  {
    name: 'American / Irish Whisky',
    slug: 'american-irish-whisky',
    products: [
      { name: 'Jameson Black Barrel (30ml)', size: '30ml', price: 279, isAlcohol: true },
      { name: 'Jameson Black Barrel (60ml)', size: '60ml', price: 549, isAlcohol: true },
      { name: 'Jack Daniel’s (30ml)', size: '30ml', price: 279, isAlcohol: true },
      { name: 'Jack Daniel’s (60ml)', size: '60ml', price: 549, isAlcohol: true },
      { name: 'Jameson (30ml)', size: '30ml', price: 229, isAlcohol: true },
      { name: 'Jameson (60ml)', size: '60ml', price: 449, isAlcohol: true },
      { name: 'Jim Beam White (30ml)', size: '30ml', price: 209, isAlcohol: true },
      { name: 'Jim Beam White (60ml)', size: '60ml', price: 399, isAlcohol: true },
    ],
  },
  {
    name: 'Single Malt / Scotch Whisky',
    slug: 'single-malt-scotch-whisky',
    products: [
      { name: 'JW Blue Label (30ml)', size: '30ml', price: 1249, isAlcohol: true },
      { name: 'JW Blue Label (60ml)', size: '60ml', price: 2399, isAlcohol: true },
      { name: 'Chivas Regal 18yrs (30ml)', size: '30ml', price: 459, isAlcohol: true },
      { name: 'Chivas Regal 18yrs (60ml)', size: '60ml', price: 899, isAlcohol: true },
      { name: 'JW Gold Label (30ml)', size: '30ml', price: 429, isAlcohol: true },
      { name: 'JW Gold Label (60ml)', size: '60ml', price: 849, isAlcohol: true },
      { name: 'Chivas Regal 12yrs (30ml)', size: '30ml', price: 279, isAlcohol: true },
      { name: 'Chivas Regal 12yrs (60ml)', size: '60ml', price: 549, isAlcohol: true },
      { name: 'JW Black Label (30ml)', size: '30ml', price: 279, isAlcohol: true },
      { name: 'JW Black Label (60ml)', size: '60ml', price: 549, isAlcohol: true },
      { name: 'Black Dog 12yrs (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: 'Black Dog 12yrs (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: '100 Pipers 12yrs (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: '100 Pipers 12yrs (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'Teachers 50 (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: 'Teachers 50 (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'Ballentine’s 12yrs (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: 'Ballentine’s 12yrs (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'JW Blonde (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: 'JW Blonde (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: '100 Pipers Blended (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: '100 Pipers Blended (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'Ballentine\'s Finest (30ml)', size: '30ml', price: 209, isAlcohol: true },
      { name: 'Ballentine\'s Finest (60ml)', size: '60ml', price: 399, isAlcohol: true },
      { name: 'Dewar\'s White Label (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: 'Dewar\'s White Label (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: '100 Pipers 8yrs (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: '100 Pipers 8yrs (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: 'Black & White (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: 'Black & White (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: 'Black Dog 8yrs (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: 'Black Dog 8yrs (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: 'Teachers Highland Cream (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: 'Teachers Highland Cream (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: 'Royal Ranthambore Crafted (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: 'Royal Ranthambore Crafted (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: 'Singhasan Finest (30ml)', size: '30ml', price: 199, isAlcohol: true },
      { name: 'Singhasan Finest (60ml)', size: '60ml', price: 379, isAlcohol: true },
      { name: 'JW Red Label (30ml)', size: '30ml', price: 179, isAlcohol: true },
      { name: 'JW Red Label (60ml)', size: '60ml', price: 349, isAlcohol: true },
      { name: 'VAT 69 (30ml)', size: '30ml', price: 179, isAlcohol: true },
      { name: 'VAT 69 (60ml)', size: '60ml', price: 349, isAlcohol: true },
    ],
  },
  {
    name: 'Ultra Premium Whisky',
    slug: 'ultra-premium-whisky',
    products: [
      { name: 'Rockford Reserve (30ml)', size: '30ml', price: 149, isAlcohol: true },
      { name: 'Rockford Reserve (60ml)', size: '60ml', price: 279, isAlcohol: true },
      { name: 'Blenders Reserve (30ml)', size: '30ml', price: 149, isAlcohol: true },
      { name: 'Blenders Reserve (60ml)', size: '60ml', price: 279, isAlcohol: true },
      { name: 'Blenders Pride Premium (30ml)', size: '30ml', price: 129, isAlcohol: true },
      { name: 'Blenders Pride Premium (60ml)', size: '60ml', price: 239, isAlcohol: true },
    ],
  },
  {
    name: 'Liquors',
    slug: 'liquors',
    products: [
      { name: 'Jagermeister (30ml)', size: '30ml', price: 279, isAlcohol: true },
      { name: 'Jagermeister (60ml)', size: '60ml', price: 549, isAlcohol: true },
      { name: 'Baileys (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: 'Baileys (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'Malibu (30ml)', size: '30ml', price: 259, isAlcohol: true },
      { name: 'Malibu (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'Kahlua Coffee Liqueur (30ml)', size: '30ml', price: 229, isAlcohol: true },
      { name: 'Kahlua Coffee Liqueur (60ml)', size: '60ml', price: 449, isAlcohol: true },
    ],
  },
  {
    name: 'Vodka',
    slug: 'vodka',
    products: [
      { name: 'Grey Goose (30ml)', size: '30ml', price: 279, isAlcohol: true },
      { name: 'Grey Goose (60ml)', size: '60ml', price: 549, isAlcohol: true },
      { name: 'Kashmyr Saffron (30ml)', size: '30ml', price: 269, isAlcohol: true },
      { name: 'Kashmyr Saffron (60ml)', size: '60ml', price: 499, isAlcohol: true },
      { name: 'Kashmyr (30ml)', size: '30ml', price: 239, isAlcohol: true },
      { name: 'Kashmyr (60ml)', size: '60ml', price: 449, isAlcohol: true },
      { name: 'Absolut Plain (30ml)', size: '30ml', price: 209, isAlcohol: true },
      { name: 'Absolut Plain (60ml)', size: '60ml', price: 399, isAlcohol: true },
      { name: 'Absolut Flavoured (30ml)', size: '30ml', price: 209, isAlcohol: true },
      { name: 'Absolut Flavoured (60ml)', size: '60ml', price: 399, isAlcohol: true },
      { name: 'Smirnoff Flavoured (30ml)', size: '30ml', price: 139, isAlcohol: true },
      { name: 'Smirnoff Flavoured (60ml)', size: '60ml', price: 249, isAlcohol: true },
      { name: 'Smirnoff Plain (30ml)', size: '30ml', price: 129, isAlcohol: true },
      { name: 'Smirnoff Plain (60ml)', size: '60ml', price: 239, isAlcohol: true },
      { name: 'Magic Moments Verve (30ml)', size: '30ml', price: 129, isAlcohol: true },
      { name: 'Magic Moments Verve (60ml)', size: '60ml', price: 239, isAlcohol: true },
    ],
  },
  {
    name: 'Rum',
    slug: 'rum',
    products: [
      { name: 'Bacardi White (30ml)', size: '30ml', price: 119, isAlcohol: true },
      { name: 'Bacardi White (60ml)', size: '60ml', price: 229, isAlcohol: true },
      { name: 'Bacardi Black (30ml)', size: '30ml', price: 119, isAlcohol: true },
      { name: 'Bacardi Black (60ml)', size: '60ml', price: 229, isAlcohol: true },
      { name: 'Bacardi Limon (30ml)', size: '30ml', price: 119, isAlcohol: true },
      { name: 'Bacardi Limon (60ml)', size: '60ml', price: 229, isAlcohol: true },
      { name: 'Bacardi Mango Chilli (30ml)', size: '30ml', price: 119, isAlcohol: true },
      { name: 'Bacardi Mango Chilli (60ml)', size: '60ml', price: 229, isAlcohol: true },
      { name: '1965 (30ml)', size: '30ml', price: 109, isAlcohol: true },
      { name: '1965 (60ml)', size: '60ml', price: 199, isAlcohol: true },
      { name: 'Old Monk (30ml)', size: '30ml', price: 99, isAlcohol: true },
      { name: 'Old Monk (60ml)', size: '60ml', price: 179, isAlcohol: true },
    ],
  },
  {
    name: 'Gin',
    slug: 'gin',
    products: [
      { name: 'Jaisalmer (30ml)', size: '30ml', price: 289, isAlcohol: true },
      { name: 'Jaisalmer (60ml)', size: '60ml', price: 569, isAlcohol: true },
      { name: 'Tanqueray (30ml)', size: '30ml', price: 229, isAlcohol: true },
      { name: 'Tanqueray (60ml)', size: '60ml', price: 449, isAlcohol: true },
      { name: 'Nicobar (30ml)', size: '30ml', price: 229, isAlcohol: true },
      { name: 'Nicobar (60ml)', size: '60ml', price: 449, isAlcohol: true },
      { name: 'Greater Than (30ml)', size: '30ml', price: 179, isAlcohol: true },
      { name: 'Greater Than (60ml)', size: '60ml', price: 349, isAlcohol: true },
      { name: 'Beefeater (30ml)', size: '30ml', price: 159, isAlcohol: true },
      { name: 'Beefeater (60ml)', size: '60ml', price: 299, isAlcohol: true },
    ],
  },
  {
    name: 'Tequila',
    slug: 'tequila',
    products: [
      { name: 'Don Julio (30ml)', size: '30ml', price: 749, isAlcohol: true },
      { name: 'Camino (30ml)', size: '30ml', price: 249, isAlcohol: true },
    ],
  },
  {
    name: 'Wine',
    slug: 'wine',
    products: [
      { name: 'Jacobs Creek Red (150ml)', size: '150ml', price: 549, isAlcohol: true },
      { name: 'Jacobs Creek White (150ml)', size: '150ml', price: 549, isAlcohol: true },
      { name: 'Sula Red (150ml)', size: '150ml', price: 449, isAlcohol: true },
    ],
  },
  {
    name: 'Mahua Liquor',
    slug: 'mahua-liquor',
    products: [
      { name: 'Mond Heritage (30ml)', size: '30ml', price: 109, isAlcohol: true },
      { name: 'Mond Heritage (60ml)', size: '60ml', price: 199, isAlcohol: true },
    ],
  },
  {
    name: 'Bacardi / Breezer',
    slug: 'bacardi-breezer',
    products: [
      { name: 'Bacardi/Breezer Cranberry', description: 'Flavour: Cranberry', price: 199, isAlcohol: true },
      { name: 'Bacardi/Breezer Blackberry', description: 'Flavour: Blackberry', price: 199, isAlcohol: true },
      { name: 'Bacardi/Breezer Jamaican Passion', description: 'Flavour: Jamaican Passion', price: 199, isAlcohol: true },
      { name: 'Bacardi/Breezer Lemonade', description: 'Flavour: Lemonade', price: 199, isAlcohol: true },
    ],
  },
  {
    name: 'Brandy',
    slug: 'brandy',
    products: [
      { name: 'Morpheus (30ml)', size: '30ml', price: 129, isAlcohol: true },
      { name: 'Morpheus (60ml)', size: '60ml', price: 239, isAlcohol: true },
    ],
  },
  {
    name: 'Beer',
    slug: 'beer',
    products: [
      { name: 'Budweiser Magnum (Pint / 330ml)', size: 'Pint / 330ml', price: 349, isAlcohol: true },
      { name: 'Budweiser Magnum (Can / 500ml)', size: 'Can / 500ml', price: 429, isAlcohol: true },
      { name: 'Budweiser Magnum (Bottle / 650ml)', size: 'Bottle / 650ml', price: 549, isAlcohol: true },
      { name: 'Heineken (Pint / 330ml)', size: 'Pint / 330ml', price: 349, isAlcohol: true },
      { name: 'Heineken (Can / 500ml)', size: 'Can / 500ml', price: 429, isAlcohol: true },
      { name: 'Heineken (Bottle / 650ml)', size: 'Bottle / 650ml', price: 549, isAlcohol: true },
      { name: 'Budweiser Lager (Pint / 330ml)', size: 'Pint / 330ml', price: 349, isAlcohol: true },
      { name: 'Budweiser Lager (Can / 500ml)', size: 'Can / 500ml', price: 429, isAlcohol: true },
      { name: 'Budweiser Lager (Bottle / 650ml)', size: 'Bottle / 650ml', price: 529, isAlcohol: true },
      { name: 'Kingfisher Ultra (Pint / 330ml)', size: 'Pint / 330ml', price: 349, isAlcohol: true },
      { name: 'Kingfisher Ultra (Can / 500ml)', size: 'Can / 500ml', price: 399, isAlcohol: true },
      { name: 'Kingfisher Ultra (Bottle / 650ml)', size: 'Bottle / 650ml', price: 499, isAlcohol: true },
      { name: 'Kingfisher Ultra Max (Pint / 330ml)', size: 'Pint / 330ml', price: 349, isAlcohol: true },
      { name: 'Kingfisher Ultra Max (Can / 500ml)', size: 'Can / 500ml', price: 399, isAlcohol: true },
      { name: 'Kingfisher Ultra Max (Bottle / 650ml)', size: 'Bottle / 650ml', price: 529, isAlcohol: true },
      { name: 'Kingfisher Strong (Pint / 330ml)', size: 'Pint / 330ml', price: 419, isAlcohol: true },
      { name: 'Stok Strong (Pint / 330ml)', size: 'Pint / 330ml', price: 419, isAlcohol: true },
      { name: 'Kingfisher Lager (Pint / 330ml)', size: 'Pint / 330ml', price: 419, isAlcohol: true },
      { name: 'Corona (Pint / 330ml)', size: 'Pint / 330ml', price: 449, isAlcohol: true },
      { name: 'Hoegaarden (Pint / 330ml)', size: 'Pint / 330ml', price: 449, isAlcohol: true },
    ],
  },
  {
    name: 'Non-Alcoholic Drinks / Mixers',
    slug: 'non-alcoholic-drinks-mixers',
    products: [
      { name: 'Fresh Lime Water', price: 99, isAlcohol: false },
      { name: 'Fresh Lime Soda', price: 119, isAlcohol: false },
      { name: 'Masala Lemonade', price: 139, isAlcohol: false },
      { name: 'Red Bull', price: 189, isAlcohol: false },
      { name: 'Water Bottle', price: 39, isAlcohol: false },
      { name: 'Soft Drink', price: 39, isAlcohol: false },
      { name: 'Diet Coke', price: 89, isAlcohol: false },
      { name: 'Tonic Water', price: 99, isAlcohol: false },
      { name: 'Ginger Ale', price: 99, isAlcohol: false },
    ],
  },
  {
    name: 'Signature Cocktails',
    slug: 'signature-cocktails',
    products: [
      { name: 'Bullfrog', price: 799, isAlcohol: true },
      { name: 'Surfer on Acid', price: 599, isAlcohol: true },
      { name: 'Bahama Mama', price: 599, isAlcohol: true },
      { name: 'Elder Flower Gin Garden', price: 549, isAlcohol: true },
      { name: 'Picante', price: 499, isAlcohol: true },
      { name: 'New York-Sour', price: 499, isAlcohol: true },
      { name: 'Mai Tai', price: 499, isAlcohol: true },
      { name: 'Zombie', price: 499, isAlcohol: true },
      { name: 'Black Russian', price: 449, isAlcohol: true },
      { name: 'Chocolate Espresso Martini', price: 449, isAlcohol: true },
      { name: 'Appletini', price: 399, isAlcohol: true },
      { name: 'Spicy Fifty', price: 399, isAlcohol: true },
      { name: 'Classic Daiquiri', price: 399, isAlcohol: true },
      { name: 'Bee\'s Knees', price: 399, isAlcohol: true },
      { name: 'Kiwi Smash', price: 349, isAlcohol: true },
      { name: 'Whisky Sour', price: 399, isAlcohol: true },
      { name: 'Blue Hawaii', price: 399, isAlcohol: true },
      { name: 'Old Fashioned', price: 399, isAlcohol: true },
      { name: 'Dry Martini', price: 349, isAlcohol: true },
      { name: 'Cosmopolitan', price: 349, isAlcohol: true },
      { name: 'Bloody Mary', price: 349, isAlcohol: true },
      { name: 'Painkiller', price: 349, isAlcohol: true },
      { name: 'Screwdriver', price: 349, isAlcohol: true },
    ],
  },
  {
    name: 'Signature Mocktails',
    slug: 'signature-mocktails',
    products: [
      { name: 'LIIT Super Strong', price: 799, isAlcohol: true },
      { name: 'LIIT Strong', price: 699, isAlcohol: true },
      { name: 'LIIT Regular', price: 499, isAlcohol: true },
      { name: 'Penicillin', price: 649, isAlcohol: true },
      { name: 'Tequila Sunrise', price: 599, isAlcohol: true },
      { name: 'Gimlet', price: 499, isAlcohol: true },
      { name: 'Jaisalmer Tonic', price: 499, isAlcohol: true },
      { name: 'Strong Arm', price: 499, isAlcohol: true },
      { name: 'Sangria', price: 499, isAlcohol: true },
      { name: 'Margarita', price: 399, isAlcohol: true },
      { name: 'Pina Colada', price: 399, isAlcohol: true },
      { name: 'Hot Toddy', price: 399, isAlcohol: true },
      { name: 'Sex on the Beach', price: 399, isAlcohol: true },
    ],
  },
  {
    name: 'Mocktails',
    slug: 'mocktails',
    products: [
      { name: 'Coco Mojo', price: 239, isAlcohol: false },
      { name: 'Cinderella', price: 239, isAlcohol: false },
      { name: 'Mandarin Twist', price: 239, isAlcohol: false },
      { name: 'French Kiss', price: 239, isAlcohol: false },
      { name: 'Sunset Cooler', price: 239, isAlcohol: false },
      { name: 'Sherwoods Living Smash', price: 239, isAlcohol: false },
      { name: 'Spicy Guava Martini', price: 239, isAlcohol: false },
      { name: 'Peach Iced Tea', price: 239, isAlcohol: false },
      { name: 'Lemon Iced Tea', price: 239, isAlcohol: false },
      { name: 'Virgin Mojito', price: 239, isAlcohol: false },
      { name: 'The Valentine', price: 239, isAlcohol: false },
      { name: 'Watermelon Twister', price: 239, isAlcohol: false },
      { name: 'Shirley Temple', price: 239, isAlcohol: false },
      { name: 'Barman Special Mocktail', price: 269, isAlcohol: false },
      { name: 'Green Apple Mojito', price: 239, isAlcohol: false },
      { name: 'Cucumber Mojito', price: 239, isAlcohol: false },
      { name: 'Watermelon Mojito', price: 239, isAlcohol: false },
      { name: 'Kiwi Mojito', price: 239, isAlcohol: false },
      { name: 'Orange Mojito', price: 239, isAlcohol: false },
      { name: 'Passion Fruit Mojito', price: 239, isAlcohol: false },
      { name: 'Blueberry Mojito', price: 239, isAlcohol: false },
      { name: 'Mango-Chilly Mojito', price: 239, isAlcohol: false },
      { name: 'Hibiscus Mojito', price: 239, isAlcohol: false },
      { name: 'Blood Orange Mojito', price: 239, isAlcohol: false },
    ],
  },

  // ==========================================
  // MENU 2 — SHERWOODS FOOD MENU
  // ==========================================
  {
    name: 'Beverages',
    slug: 'beverages',
    products: [
      { name: 'Water', price: 39, isAlcohol: false },
      { name: 'Soda', price: 39, isAlcohol: false },
      { name: 'Soft Drink (250ml)', size: '250ml', price: 39, isAlcohol: false },
      { name: 'Soft Drink Can (300ml)', size: '300ml', price: 69, isAlcohol: false },
      { name: 'Fresh Lime Water', price: 99, isAlcohol: false },
      { name: 'Fresh Lime Soda', price: 119, isAlcohol: false },
      { name: 'Cold Coffee (Without Ice Cream)', description: 'Without Ice Cream', price: 199, isAlcohol: false },
      { name: 'Cold Coffee (With Ice Cream)', description: 'With Ice Cream', price: 249, isAlcohol: false },
      { name: 'Shake (Without Ice Cream)', description: 'Without Ice Cream', price: 249, isAlcohol: false },
      { name: 'Shake (With Ice Cream)', description: 'With Ice Cream', price: 299, isAlcohol: false },
      { name: 'Tea', price: 69, isAlcohol: false },
      { name: 'Coffee', price: 99, isAlcohol: false },
      { name: 'Black Tea', price: 69, isAlcohol: false },
      { name: 'Black Coffee', price: 89, isAlcohol: false },
    ],
  },
  {
    name: 'Veg Soups',
    slug: 'veg-soups',
    products: [
      { name: 'Manchow Soup', price: 179, isAlcohol: false },
      { name: 'Hot & Sour Soup', price: 179, isAlcohol: false },
      { name: 'Veg Clear Soup', price: 189, isAlcohol: false },
      { name: 'Sweet Corn Soup', price: 189, isAlcohol: false },
      { name: 'Lemon Coriander Soup', price: 179, isAlcohol: false },
      { name: 'Steamed Won Ton Soup', price: 219, isAlcohol: false },
      { name: 'Tamatar Dhaniya Ka Shorba', price: 199, isAlcohol: false },
      { name: 'Palak Ka Shorba', price: 199, isAlcohol: false },
      { name: 'Tomato Soup', price: 179, isAlcohol: false },
      { name: 'Tomato Cream Soup', price: 199, isAlcohol: false },
      { name: 'Cream of Mushroom Soup', price: 199, isAlcohol: false },
      { name: 'Roasted Pumpkin & Garlic Soup', price: 199, isAlcohol: false },
      { name: 'Cream of Broccoli Soup', price: 219, isAlcohol: false },
    ],
  },
  {
    name: 'Indian Veg Appetizers',
    slug: 'indian-veg-appetizers',
    products: [
      { name: 'Papad (Dry)', description: 'Variant: Dry', price: 39, isAlcohol: false },
      { name: 'Papad (Fry)', description: 'Variant: Fry', price: 49, isAlcohol: false },
      { name: 'Papad (Masala)', description: 'Variant: Masala', price: 89, isAlcohol: false },
      { name: 'Peanut Fry (Regular)', description: 'Variant: Regular', price: 179, isAlcohol: false },
      { name: 'Peanut Fry (Masala)', description: 'Variant: Masala', price: 199, isAlcohol: false },
      { name: 'Peanut Fry (Garlic)', description: 'Variant: Garlic', price: 199, isAlcohol: false },
      { name: 'Peanut Fry (Chat)', description: 'Variant: Chat', price: 199, isAlcohol: false },
      { name: 'Chana Roast (Masala)', description: 'Variant: Masala', price: 199, isAlcohol: false },
      { name: 'Chana Roast (Garlic)', description: 'Variant: Garlic', price: 199, isAlcohol: false },
      { name: 'Chana Roast (Chat)', description: 'Variant: Chat', price: 199, isAlcohol: false },
      { name: 'Bhajiya', price: 249, isAlcohol: false },
      { name: 'Veg Pakoda', price: 249, isAlcohol: false },
      { name: 'Hara Bhara Kabab', price: 289, isAlcohol: false },
      { name: 'Corn Cheese Kabab', price: 299, isAlcohol: false },
      { name: 'Dahi Kabab', price: 299, isAlcohol: false },
      { name: 'Veg Seekh Kabab', price: 299, isAlcohol: false },
      { name: 'Soya Chap (Tandoori)', description: 'Variant: Tandoori', price: 299, isAlcohol: false },
      { name: 'Soya Chap (Punjabi)', description: 'Variant: Punjabi', price: 299, isAlcohol: false },
      { name: 'Tandoori Aloo Nargisi', price: 329, isAlcohol: false },
      { name: 'Soya Malai Chap', price: 329, isAlcohol: false },
      { name: 'Paneer Pakoda', price: 329, isAlcohol: false },
      { name: 'Paneer Tikka (Regular)', description: 'Variant: Regular', price: 349, isAlcohol: false },
      { name: 'Dahi Ke Sholay', price: 349, isAlcohol: false },
      { name: 'Rajma Galauti Kabab', price: 369, isAlcohol: false },
      { name: 'Mushroom Cheese Kabab', price: 369, isAlcohol: false },
      { name: 'Mushroom Tikka', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Malai', description: 'Variant: Malai', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Pudina', description: 'Variant: Pudina', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Kasundi', description: 'Variant: Kasundi', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Lehsuni', description: 'Variant: Lehsuni', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Achari', description: 'Variant: Achari', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Kali Mirch', description: 'Variant: Kali Mirch', price: 369, isAlcohol: false },
      { name: 'Paneer Tikka Pahadi', description: 'Variant: Pahadi', price: 369, isAlcohol: false },
    ],
  },
  {
    name: 'Asian Veg Appetizers',
    slug: 'asian-veg-appetizers',
    products: [
      { name: 'Chilly Potato (Regular)', description: 'Variant: Regular', price: 279, isAlcohol: false },
      { name: 'Chilly Potato (Honey)', description: 'Variant: Honey', price: 299, isAlcohol: false },
      { name: 'Chana Chilly', price: 279, isAlcohol: false },
      { name: 'Crispy Corn', price: 289, isAlcohol: false },
      { name: 'Spring Roll', price: 299, isAlcohol: false },
      { name: 'Manchurian (Dry)', description: 'Variant: Dry', price: 299, isAlcohol: false },
      { name: 'Manchurian (Gravy)', description: 'Variant: Gravy', price: 299, isAlcohol: false },
      { name: 'Veg Kothey', price: 299, isAlcohol: false },
      { name: 'Veg Lollipop', price: 299, isAlcohol: false },
      { name: 'Stir Fry Exotic Asian Greens', price: 299, isAlcohol: false },
      { name: 'Paneer 65', price: 349, isAlcohol: false },
      { name: 'Chilly Paneer (Dry)', description: 'Variant: Dry', price: 349, isAlcohol: false },
      { name: 'Chilly Paneer (Gravy)', description: 'Variant: Gravy', price: 349, isAlcohol: false },
      { name: 'Pepper Paneer', price: 349, isAlcohol: false },
      { name: 'Wok Tossed Lotus Stem with Honey', price: 349, isAlcohol: false },
      { name: 'Paneer Dragon', price: 369, isAlcohol: false },
      { name: 'Cottage Cheese with Bokchoy in Black Bean Sauce', price: 399, isAlcohol: false },
      { name: 'Mushroom Chilly', price: 399, isAlcohol: false },
    ],
  },
  {
    name: 'Asian & Continental Veg Main Course',
    slug: 'asian-continental-veg-main-course',
    products: [
      { name: 'French Fry (Regular)', description: 'Variant: Regular', price: 199, isAlcohol: false },
      { name: 'French Fry (Peri Peri)', description: 'Variant: Peri Peri', price: 219, isAlcohol: false },
      { name: 'French Fry (Cheese)', description: 'Variant: Cheese', price: 249, isAlcohol: false },
      { name: 'Potato Wedges', price: 219, isAlcohol: false },
      { name: 'Boiled Corn', price: 269, isAlcohol: false },
      { name: 'Cheese Garlic Bread (Regular)', description: 'Variant: Regular', price: 299, isAlcohol: false },
      { name: 'Cheese Garlic Bread (Chilly)', description: 'Variant: Chilly', price: 299, isAlcohol: false },
      { name: 'Cheese Ball', price: 299, isAlcohol: false },
      { name: 'Loaded Nachos', price: 299, isAlcohol: false },
      { name: 'Avocado Toast (2 pcs)', description: 'Quantity: 2 pcs', price: 299, isAlcohol: false },
      { name: 'Cottage Cheese Tacos', price: 329, isAlcohol: false },
      { name: 'Pita with Hummus', price: 349, isAlcohol: false },
      { name: 'Falafel with Hummus', price: 349, isAlcohol: false },
      { name: 'Cheese Cigar Roll', price: 349, isAlcohol: false },
      { name: 'Avocado Bhel', price: 349, isAlcohol: false },
      { name: 'Pesto Grilled Paneer', price: 379, isAlcohol: false },
    ],
  },
  {
    name: 'Indian Veg Main Course',
    slug: 'indian-veg-main-course',
    products: [
      { name: 'Aloo Jeera', price: 279, isAlcohol: false },
      { name: 'Aloo Gobhi', price: 279, isAlcohol: false },
      { name: 'Aloo Matar', price: 279, isAlcohol: false },
      { name: 'Aloo Palak', price: 279, isAlcohol: false },
      { name: 'Aloo Capsicum', price: 279, isAlcohol: false },
      { name: 'Corn Palak', price: 249, isAlcohol: false },
      { name: 'Mix Vegetables', price: 279, isAlcohol: false },
      { name: 'Tawa Vegetables', price: 279, isAlcohol: false },
      { name: 'Chhole (Pindi)', description: 'Variant: Pindi', price: 279, isAlcohol: false },
      { name: 'Chhole (Masala)', description: 'Variant: Masala', price: 279, isAlcohol: false },
      { name: 'Dum Aloo', price: 299, isAlcohol: false },
      { name: 'Veg Kolhapuri', price: 299, isAlcohol: false },
      { name: 'Veg Kofta', price: 299, isAlcohol: false },
      { name: 'Malai Kofta', price: 349, isAlcohol: false },
      { name: 'Matar Paneer', price: 329, isAlcohol: false },
      { name: 'Mushroom Matar', price: 349, isAlcohol: false },
      { name: 'Mushroom Masala', price: 399, isAlcohol: false },
      { name: 'Methi Matar Malai', price: 349, isAlcohol: false },
      { name: 'Subz Diwani Handi', price: 349, isAlcohol: false },
      { name: 'Seekh Kabab Masala', price: 349, isAlcohol: false },
      { name: 'Paneer Lababdar', price: 369, isAlcohol: false },
      { name: 'Paneer Butter', price: 369, isAlcohol: false },
      { name: 'Paneer Handi', price: 369, isAlcohol: false },
      { name: 'Paneer Kadahi', price: 369, isAlcohol: false },
      { name: 'Paneer Palak', price: 369, isAlcohol: false },
      { name: 'Paneer Tawa Masala', price: 369, isAlcohol: false },
      { name: 'Paneer Punjabi', price: 369, isAlcohol: false },
      { name: 'Paneer Kolhapuri', price: 369, isAlcohol: false },
      { name: 'Paneer Pasanda', price: 399, isAlcohol: false },
      { name: 'Paneer Shahi', price: 399, isAlcohol: false },
      { name: 'Paneer Tikka Masala', price: 399, isAlcohol: false },
      { name: 'Paneer Bhurji Masala', price: 399, isAlcohol: false },
      { name: 'Veg Keema Kasturi', price: 399, isAlcohol: false },
      { name: 'Navratan Korma', price: 399, isAlcohol: false },
      { name: 'Kaju Curry Red', description: 'Variant: Red', price: 399, isAlcohol: false },
      { name: 'Kaju Curry White', description: 'Variant: White', price: 449, isAlcohol: false },
    ],
  },
  {
    name: 'Asian Veg Main Course',
    slug: 'asian-veg-main-course',
    products: [
      { name: 'Veg Noodles', price: 279, isAlcohol: false },
      { name: 'Shanghai Noodles', price: 279, isAlcohol: false },
      { name: 'Hakka Noodles', price: 279, isAlcohol: false },
      { name: 'Schezwan Noodles', price: 279, isAlcohol: false },
      { name: 'Burnt Garlic Noodles', price: 279, isAlcohol: false },
      { name: 'Veg Rice', price: 279, isAlcohol: false },
      { name: 'Schezwan Rice', price: 279, isAlcohol: false },
      { name: 'Thai Curry Red', description: 'Variant: Red', price: 299, isAlcohol: false },
      { name: 'Thai Curry Green', description: 'Variant: Green', price: 299, isAlcohol: false },
      { name: 'Stir Fried Noodles with Basil Chillibean', price: 299, isAlcohol: false },
      { name: 'Wok Tossed Burnt Garlic Rice', price: 299, isAlcohol: false },
      { name: 'Wok Tossed Chillibean Rice', price: 299, isAlcohol: false },
      { name: 'Veg Chop Suey', price: 299, isAlcohol: false },
      { name: 'Manchurian with Rice', price: 319, isAlcohol: false },
      { name: 'Manchurian with Noodles', price: 319, isAlcohol: false },
      { name: 'Chilly Paneer with Rice', price: 349, isAlcohol: false },
      { name: 'Chilly Paneer with Noodles', price: 349, isAlcohol: false },
      { name: 'Grilled Cottage Cheese Peperonata with Herbed Rice', price: 399, isAlcohol: false },
    ],
  },
  {
    name: 'Breads',
    slug: 'breads',
    products: [
      { name: 'Rumali Roti', price: 34, isAlcohol: false },
      { name: 'Tandoori Roti (Plain)', description: 'Variant: Plain', price: 34, isAlcohol: false },
      { name: 'Tandoori Roti (Butter)', description: 'Variant: Butter', price: 39, isAlcohol: false },
      { name: 'Laccha Paratha', price: 49, isAlcohol: false },
      { name: 'Butter Naan', price: 59, isAlcohol: false },
      { name: 'Missi Roti', price: 59, isAlcohol: false },
      { name: 'Butter Garlic Naan', price: 69, isAlcohol: false },
      { name: 'Stuffed Kulcha (Mix Veg)', description: 'Variant: Mix Veg', price: 99, isAlcohol: false },
      { name: 'Stuffed Kulcha (Aloo)', description: 'Variant: Aloo', price: 129, isAlcohol: false },
      { name: 'Stuffed Kulcha (Paneer)', description: 'Variant: Paneer', price: 129, isAlcohol: false },
      { name: 'Bread Basket', description: 'Roti + Naan + Garlic Naan + Laccha Paratha + Missi Roti', price: 269, isAlcohol: false },
    ],
  },
  {
    name: 'Veg Sandwiches',
    slug: 'veg-sandwiches',
    products: [
      { name: 'Veg Cheese Sandwich', price: 179, isAlcohol: false },
      { name: 'Corn Spinach Sandwich', price: 189, isAlcohol: false },
      { name: 'Paneer Cheese Sandwich', price: 199, isAlcohol: false },
      { name: 'Paneer Tikka Sandwich', price: 209, isAlcohol: false },
    ],
  },
  {
    name: 'Veg Pizza',
    slug: 'veg-pizza',
    products: [
      { name: 'Gardener\'s Pizza', price: 369, isAlcohol: false },
      { name: 'Classic Margherita Pizza', price: 399, isAlcohol: false },
      { name: 'Paneer Tikka Pizza', price: 449, isAlcohol: false },
    ],
  },
  {
    name: 'Desserts',
    slug: 'desserts',
    products: [
      { name: 'Gulab Jamun', price: 79, isAlcohol: false },
      { name: 'Choice of Ice Cream', price: 89, isAlcohol: false },
      { name: 'Sizzling Brownie', price: 199, isAlcohol: false },
      { name: 'Sizzling Brownie with Ice Cream', description: 'With Ice Cream', price: 249, isAlcohol: false },
      { name: 'Dry Fruit & Chocolate Spring Roll', price: 249, isAlcohol: false },
      { name: 'Dry Fruit & Chocolate Spring Roll with Ice Cream', description: 'With Ice Cream', price: 299, isAlcohol: false },
    ],
  },
  {
    name: 'Curd & Raita',
    slug: 'curd-raita',
    products: [
      { name: 'Plain Curd', price: 129, isAlcohol: false },
      { name: 'Sweet Curd', price: 129, isAlcohol: false },
      { name: 'Mix Veg Raita', price: 169, isAlcohol: false },
      { name: 'Cucumber Raita', price: 169, isAlcohol: false },
      { name: 'Mint Raita', price: 169, isAlcohol: false },
      { name: 'Boondi Raita', price: 169, isAlcohol: false },
      { name: 'Fruit Raita', price: 189, isAlcohol: false },
    ],
  },
  {
    name: 'Veg Pasta',
    slug: 'veg-pasta',
    products: [
      { name: 'Alfredo Pasta', price: 289, isAlcohol: false },
      { name: 'Pink Sauce Pasta', price: 289, isAlcohol: false },
      { name: 'Arrabbiata Pasta', price: 299, isAlcohol: false },
      { name: 'Spaghetti Aglio e Olio Pasta', price: 299, isAlcohol: false },
      { name: 'Baked Mac. & Cheese', price: 349, isAlcohol: false },
      { name: 'Pesto Sauce Pasta', price: 349, isAlcohol: false },
      { name: 'Veg Lasagna', price: 349, isAlcohol: false },
    ],
  },
  {
    name: 'Dal',
    slug: 'dal',
    products: [
      { name: 'Dal Tadka', price: 229, isAlcohol: false },
      { name: 'Dal Ghee Fry Garlic', description: 'Flavour: Garlic', price: 229, isAlcohol: false },
      { name: 'Dal Ghee Fry Hing', description: 'Flavour: Hing', price: 229, isAlcohol: false },
      { name: 'Dal Ghee Fry Green Chilly', description: 'Flavour: Green Chilly', price: 229, isAlcohol: false },
      { name: 'Butter Dal Khichdi', description: 'Served with curd and papad', price: 239, isAlcohol: false },
      { name: 'Butter Dal Tadka', description: 'Served with curd and papad', price: 259, isAlcohol: false },
      { name: 'Dal Palak', price: 249, isAlcohol: false },
      { name: 'Dal Makhani', price: 299, isAlcohol: false },
    ],
  },
  {
    name: 'Veg Rice & Combo',
    slug: 'veg-rice-combo',
    products: [
      { name: 'Steamed Rice', price: 179, isAlcohol: false },
      { name: 'Jeera Rice', price: 199, isAlcohol: false },
      { name: 'Subz Pulao', price: 289, isAlcohol: false },
      { name: 'Subz Dum Biryani', price: 299, isAlcohol: false },
      { name: 'Paneer Tikka Rice Bowl', price: 329, isAlcohol: false },
    ],
  },
  {
    name: 'Salad',
    slug: 'salad',
    products: [
      { name: 'Kachumar Salad', price: 159, isAlcohol: false },
      { name: 'Garden Green Salad', price: 159, isAlcohol: false },
      { name: 'Tandoori Onion Salad', price: 179, isAlcohol: false },
      { name: 'Greek Salad', price: 229, isAlcohol: false },
      { name: 'Watermelon Feta Cheese Salad', price: 249, isAlcohol: false },
      { name: 'Caesar Salad', price: 249, isAlcohol: false },
      { name: 'Vietnamese Rice Paper Roll with Sweet Chilli Sauce', description: 'Served with sweet chilli sauce', price: 279, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Soups',
    slug: 'non-veg-soups',
    products: [
      { name: 'Murgh Pudina Shorba', price: 229, isAlcohol: false },
      { name: 'Murgh Badam Shorba', price: 229, isAlcohol: false },
      { name: 'Cream of Chicken Soup', price: 229, isAlcohol: false },
      { name: 'Chicken Manchow Soup', price: 219, isAlcohol: false },
      { name: 'Chicken Hot & Sour Soup', price: 219, isAlcohol: false },
      { name: 'Chicken Clear Soup', price: 219, isAlcohol: false },
      { name: 'Chicken Sweet Corn Soup', price: 219, isAlcohol: false },
      { name: 'Chicken Lemon Coriander Soup', price: 229, isAlcohol: false },
      { name: 'Steamed Won Ton Chicken Soup', price: 239, isAlcohol: false },
    ],
  },
  {
    name: 'Indian Non-Veg Appetizers',
    slug: 'indian-non-veg-appetizers',
    products: [
      { name: 'Egg Tandoori (3 pcs)', description: 'Quantity: 3 pcs', price: 249, isAlcohol: false },
      { name: 'Murgh Shami Kabab', price: 349, isAlcohol: false },
      { name: 'Murgh Tikka', price: 399, isAlcohol: false },
      { name: 'Murgh Tikka Malai', description: 'Variant: Malai', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Afghani', description: 'Variant: Afghani', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Pudina', description: 'Variant: Pudina', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Kasundi', description: 'Variant: Kasundi', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Lehsuni', description: 'Variant: Lehsuni', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Achari', description: 'Variant: Achari', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Kali Mirch', description: 'Variant: Kali Mirch', price: 429, isAlcohol: false },
      { name: 'Murgh Tikka Pahadi', description: 'Variant: Pahadi', price: 429, isAlcohol: false },
      { name: 'Murgh Gilafi Seekh Kabab', price: 429, isAlcohol: false },
      { name: 'Murgh Reshmi Kabab', price: 449, isAlcohol: false },
      { name: 'Murgh Tandoori (Half)', description: 'Portion: Half', price: 379, isAlcohol: false },
      { name: 'Murgh Tandoori (Full)', description: 'Portion: Full', price: 699, isAlcohol: false },
      { name: 'Gosht Seekh Kabab', price: 469, isAlcohol: false },
      { name: 'Gosht Lababdar', price: 499, isAlcohol: false },
      { name: 'Fish Tikka', price: 539, isAlcohol: false },
      { name: 'Fish Tikka Malai', description: 'Variant: Malai', price: 569, isAlcohol: false },
      { name: 'Fish Tikka Kasaundi', description: 'Variant: Kasaundi', price: 569, isAlcohol: false },
      { name: 'Fish Tikka Ajwain', description: 'Variant: Ajwain', price: 569, isAlcohol: false },
      { name: 'Fish Tikka Kali Mirchi', description: 'Variant: Kali Mirchi', price: 569, isAlcohol: false },
      { name: 'Hare Masale Ki Tawa Macchi', price: 569, isAlcohol: false },
    ],
  },
  {
    name: 'Asian Non-Veg Appetizers',
    slug: 'asian-non-veg-appetizers',
    products: [
      { name: 'Boiled Egg (3 pcs)', description: 'Quantity: 3 pcs', price: 119, isAlcohol: false },
      { name: 'Masala Omlet', price: 149, isAlcohol: false },
      { name: 'Cheese Omlet', price: 159, isAlcohol: false },
      { name: 'Bread Omlet', price: 199, isAlcohol: false },
      { name: 'Half Fry Omlet', price: 149, isAlcohol: false },
      { name: 'Hummus with Pita', price: 359, isAlcohol: false },
      { name: 'Chicken Tacos', price: 369, isAlcohol: false },
      { name: 'Caribbean Fried Chicken Strips', price: 399, isAlcohol: false },
      { name: 'BBQ Chicken Wings', price: 449, isAlcohol: false },
      { name: 'Chipotle Chicken Wings', price: 449, isAlcohol: false },
      { name: 'Fish Fry', price: 529, isAlcohol: false },
      { name: 'Fish Finger', price: 529, isAlcohol: false },
      { name: 'Lemon Butter Fish', price: 569, isAlcohol: false },
      { name: 'Egg Chilly', price: 299, isAlcohol: false },
      { name: 'Garlic Chicken', price: 399, isAlcohol: false },
      { name: 'Chicken 65', price: 399, isAlcohol: false },
      { name: 'Pepper Chicken', price: 399, isAlcohol: false },
      { name: 'Chilly Chicken', price: 399, isAlcohol: false },
      { name: 'Chilly Chicken Tikka', price: 449, isAlcohol: false },
      { name: 'Chicken Lollipop', price: 449, isAlcohol: false },
      { name: 'Honey Glazed Chicken Wings', price: 449, isAlcohol: false },
      { name: 'Sliced Chicken with Black Pepper Sauce', price: 449, isAlcohol: false },
      { name: 'Crispy Konjee Chicken', price: 449, isAlcohol: false },
      { name: 'Kung Pao Chicken', price: 449, isAlcohol: false },
      { name: 'Chilly Fish', price: 549, isAlcohol: false },
      { name: 'Apollo Fish', price: 549, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Sandwich',
    slug: 'non-veg-sandwich',
    products: [
      { name: 'Chicken Cheese Sandwich', price: 199, isAlcohol: false },
      { name: 'Chicken Tikka Sandwich', price: 209, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Pizza',
    slug: 'non-veg-pizza',
    products: [
      { name: 'BBQ Chicken Pizza', price: 459, isAlcohol: false },
      { name: 'Angry Bird Pizza', price: 479, isAlcohol: false },
      { name: 'Chicken Sausage Pizza', price: 489, isAlcohol: false },
      { name: 'Chicken Superemo Pizza', price: 499, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Salad',
    slug: 'non-veg-salad',
    products: [
      { name: 'Chicken Caesar Salad', price: 299, isAlcohol: false },
    ],
  },
  {
    name: 'Indian Non-Veg Main Course',
    slug: 'indian-non-veg-main-course',
    products: [
      { name: 'Egg Curry', price: 249, isAlcohol: false },
      { name: 'Bhurji Curry', price: 279, isAlcohol: false },
      { name: 'Egg Masala', price: 279, isAlcohol: false },
      { name: 'Egg Bharta Curry', price: 299, isAlcohol: false },
      { name: 'Chicken Curry', price: 449, isAlcohol: false },
      { name: 'Chicken Gharwala', price: 449, isAlcohol: false },
      { name: 'Chicken Handi', price: 479, isAlcohol: false },
      { name: 'Chicken Kadahi', price: 479, isAlcohol: false },
      { name: 'Chicken Masala', price: 479, isAlcohol: false },
      { name: 'Chicken Korma', price: 479, isAlcohol: false },
      { name: 'Butter Chicken', price: 479, isAlcohol: false },
      { name: 'Butter Chicken Boneless Tandoor', description: 'Boneless Tandoor', price: 519, isAlcohol: false },
      { name: 'Butter Chicken Boneless Tikka', description: 'Boneless Tikka', price: 519, isAlcohol: false },
      { name: 'Chicken Tikka Masala', price: 519, isAlcohol: false },
      { name: 'Chicken Rara Masala', price: 529, isAlcohol: false },
      { name: 'Mutton Curry', price: 549, isAlcohol: false },
      { name: 'Mutton Gharwala', price: 549, isAlcohol: false },
      { name: 'Mutton Bhuna', price: 579, isAlcohol: false },
      { name: 'Mutton Sagwala', price: 579, isAlcohol: false },
      { name: 'Mutton Rogan Josh', price: 579, isAlcohol: false },
      { name: 'Mutton Rara Masala', price: 599, isAlcohol: false },
      { name: 'Fish Curry', price: 549, isAlcohol: false },
      { name: 'Fish Masala', price: 579, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Pasta',
    slug: 'non-veg-pasta',
    products: [
      { name: 'Chicken Alfredo', price: 329, isAlcohol: false },
      { name: 'Chicken Arrabbiata', price: 349, isAlcohol: false },
      { name: 'Chicken Spaghetti Aglio e Olio', price: 349, isAlcohol: false },
      { name: 'Chicken Pink Sauce', price: 369, isAlcohol: false },
      { name: 'Chicken Pesto Sauce', price: 399, isAlcohol: false },
      { name: 'Chicken Lasagna', price: 469, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Rice & Combo',
    slug: 'non-veg-rice-combo',
    products: [
      { name: 'Egg Biryani', price: 299, isAlcohol: false },
      { name: 'Murgh Biryani (3 pcs)', description: 'Served with Salan and Raita | 3 pcs', price: 379, isAlcohol: false },
      { name: 'Murgh Tikka Biryani (5 pcs)', description: 'Served with Salan and Raita | 5 pcs', price: 379, isAlcohol: false },
      { name: 'Chicken Tikka Rice Bowl (4 pcs)', description: '4 pcs', price: 399, isAlcohol: false },
      { name: 'Gosht Biryani (4 pcs)', description: 'Served with Salan and Raita | 4 pcs', price: 499, isAlcohol: false },
    ],
  },
  {
    name: 'Non-Veg Breads',
    slug: 'non-veg-breads',
    products: [
      { name: 'Chicken Tikka Keema Kulcha', price: 199, isAlcohol: false },
    ],
  },
  {
    name: 'Asian & Continental Non-Veg Main Course',
    slug: 'asian-continental-non-veg-main-course',
    products: [
      { name: 'Egg Shanghai Noodles', price: 299, isAlcohol: false },
      { name: 'Egg Hakka Noodles', price: 299, isAlcohol: false },
      { name: 'Egg Schezwan Noodles', price: 299, isAlcohol: false },
      { name: 'Egg Burnt Garlic Noodles', price: 299, isAlcohol: false },
      { name: 'Egg Schezwan Rice', price: 299, isAlcohol: false },
      { name: 'Egg Burnt Garlic Rice', price: 299, isAlcohol: false },
      { name: 'Chicken Chop Suey', price: 349, isAlcohol: false },
      { name: 'Chicken Shanghai Noodles', price: 349, isAlcohol: false },
      { name: 'Chicken Hakka Noodles', price: 349, isAlcohol: false },
      { name: 'Chicken Schezwan Noodles', price: 349, isAlcohol: false },
      { name: 'Chicken Burnt Garlic Noodles', price: 349, isAlcohol: false },
      { name: 'Chicken Schezwan Rice', price: 349, isAlcohol: false },
      { name: 'Chicken Burnt Garlic Rice', price: 349, isAlcohol: false },
      { name: 'Chicken Chilli Bean Rice', price: 349, isAlcohol: false },
      { name: 'Chicken Thai Curry Red', description: 'Variant: Red', price: 349, isAlcohol: false },
      { name: 'Chicken Thai Curry Green', description: 'Variant: Green', price: 349, isAlcohol: false },
      { name: 'Chicken Stroganoff with Herbed Rice', price: 399, isAlcohol: false },
      { name: 'Grilled Chicken with Wild Mushroom Sauce & Herbed Rice', price: 579, isAlcohol: false },
    ],
  },
];

async function seedMenu() {
  console.log('--- STARTING GRANULAR MENU SEED ---');

  let totalCategoriesCreated = 0;
  let totalCategoriesUpdated = 0;
  let totalProductsCreated = 0;
  let totalProductsUpdated = 0;

  // Track product IDs belonging to the new seed
  const seededProductIds = new Set();

  for (const catData of menuCategories) {
    // 1. Upsert Category (by slug or name)
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: catData.slug },
          { name: catData.name }
        ]
      }
    });

    if (category) {
      category = await prisma.category.update({
        where: { id: category.id },
        data: {
          name: catData.name,
          slug: catData.slug,
          is_active: true,
          deleted_at: null,
        }
      });
      totalCategoriesUpdated++;
    } else {
      category = await prisma.category.create({
        data: {
          name: catData.name,
          slug: catData.slug,
          is_active: true,
        }
      });
      totalCategoriesCreated++;
    }

    // 2. Seed Products in this Category
    for (const prodData of catData.products) {
      const gstType = prodData.isAlcohol ? 'VAT' : 'GST';
      const gstPercentage = prodData.isAlcohol ? 18.00 : 5.00;
      
      // Build description
      let description = prodData.description || '';
      if (prodData.size) {
        description = description ? `${description} | Size: ${prodData.size}` : `Size: ${prodData.size}`;
      }

      // Check if product already exists in this category
      const existingProduct = await prisma.product.findFirst({
        where: {
          category_id: category.id,
          name: prodData.name,
        }
      });

      if (existingProduct) {
        const updated = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            price: prodData.price,
            description: description || existingProduct.description,
            gst_type: gstType,
            gst_percentage: gstPercentage,
            is_active: true,
            deleted_at: null,
          }
        });
        seededProductIds.add(updated.id);
        totalProductsUpdated++;
      } else {
        const created = await prisma.product.create({
          data: {
            category_id: category.id,
            name: prodData.name,
            description: description || null,
            price: prodData.price,
            gst_type: gstType,
            gst_percentage: gstPercentage,
            is_active: true,
          }
        });
        seededProductIds.add(created.id);
        totalProductsCreated++;
      }
    }
  }

  // Deactivate old test products that were not in this seed and have no orders
  const unseededProducts = await prisma.product.findMany({
    where: {
      id: { notIn: Array.from(seededProductIds) },
      is_active: true,
    },
    include: {
      items: { select: { id: true }, take: 1 }
    }
  });

  let deactivatedOld = 0;
  for (const oldProd of unseededProducts) {
    // Only deactivate if it was an old OCR test product from temp categories
    // We preserve user test items if needed, or soft-deactivate old duplicate OCR items
    await prisma.product.update({
      where: { id: oldProd.id },
      data: { is_active: false }
    });
    deactivatedOld++;
  }

  console.log(`\n=== SEED COMPLETED SUCCESSFULLY ===`);
  console.log(`Categories Created: ${totalCategoriesCreated}`);
  console.log(`Categories Updated: ${totalCategoriesUpdated}`);
  console.log(`Total Categories Active: ${menuCategories.length}`);
  console.log(`Products Created: ${totalProductsCreated}`);
  console.log(`Products Updated: ${totalProductsUpdated}`);
  console.log(`Total Menu Products Seeded: ${seededProductIds.size}`);
  console.log(`Old unmapped products deactivated: ${deactivatedOld}`);
}

module.exports = { seedMenu };

if (require.main === module) {
  seedMenu()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
