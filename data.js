/* ------------------------------------------------------------------
   SAAR content file. Edit text here; no other file needs to change.
   Keep each set's spices under the six lid codes (S-1 ... B-6).
------------------------------------------------------------------- */
window.SAAR_DATA = {
  /* The six lid codes. These never change. */
  roles: [
    { code: "S-1", role: "Seeds",    meaning: "Whole seeds, toasted first to open a dish." },
    { code: "G-2", role: "Ground",   meaning: "The warm, earthy base of the pan." },
    { code: "C-3", role: "Colour",   meaning: "The spice that gives a dish its hue." },
    { code: "H-4", role: "Heat",     meaning: "A chilli or pepper, added to taste." },
    { code: "A-5", role: "Aromatic", meaning: "The perfume that lifts everything else." },
    { code: "B-6", role: "Blend",    meaning: "A finished mix, the signature of the cuisine." }
  ],

  /* How the lids sit in the tray, seen from above (matches the render). */
  trayLayout: [
    ["C-3", "G-2", "S-1"],
    ["B-6", "A-5", "H-4"]
  ],

  cuisines: [
    {
      id: "indian",
      name: "Indian",
      note: "Warm, layered and built slowly in the pan.",
      spices: {
        "S-1": { name: "cumin seed",       flavour: "Nutty and earthy, blooming fast in hot ghee." },
        "G-2": { name: "ground coriander", flavour: "Soft, citrus-sweet body for any masala." },
        "C-3": { name: "turmeric",         flavour: "Golden, gently bitter and quietly grounding." },
        "H-4": { name: "Kashmiri chilli",  flavour: "Deep red colour with a mild, rounded heat." },
        "A-5": { name: "green cardamom",   flavour: "Floral and cool, the scent of masala chai." },
        "B-6": { name: "garam masala",     flavour: "A warming finish, stirred in at the very end." }
      }
    },
    {
      id: "moroccan",
      name: "Moroccan",
      note: "Sweet spice and slow tagines.",
      spices: {
        "S-1": { name: "coriander seed",      flavour: "Bright and lemony when lightly crushed." },
        "G-2": { name: "ground ginger",       flavour: "Dry, peppery warmth for braises." },
        "C-3": { name: "sweet paprika",       flavour: "Mellow, sun-dried pepper sweetness." },
        "H-4": { name: "dried chilli flakes", flavour: "A clean, scattered heat to finish." },
        "A-5": { name: "cinnamon",            flavour: "Woody sweetness that loves lamb and apricot." },
        "B-6": { name: "ras el hanout",       flavour: "The spice merchant's fragrant house blend." }
      }
    },
    {
      id: "mexican",
      name: "Mexican",
      note: "Smoke, earth and dried chillies.",
      spices: {
        "S-1": { name: "cumin seed",          flavour: "Toasty and savoury, the base of a good chilli." },
        "G-2": { name: "ground coriander",    flavour: "Light citrus lift beneath the smoke." },
        "C-3": { name: "ancho chilli powder", flavour: "Dark, raisin-sweet and mild." },
        "H-4": { name: "chipotle",            flavour: "Smoked jalapeño with a slow, deep burn." },
        "A-5": { name: "Mexican oregano",     flavour: "Citrusy and resinous, bolder than Italian." },
        "B-6": { name: "adobo seasoning",     flavour: "Savoury, garlicky rub for meat and beans." }
      }
    },
    {
      id: "thai",
      name: "Thai",
      note: "Bright, hot and fragrant in balance.",
      spices: {
        "S-1": { name: "coriander seed",        flavour: "Citrus warmth, pounded into curry pastes." },
        "G-2": { name: "white pepper",          flavour: "Sharp, clean heat that catches the throat." },
        "C-3": { name: "turmeric",              flavour: "Earthy gold for southern curries." },
        "H-4": { name: "bird's eye chilli",     flavour: "Small, fierce and instantly bright." },
        "A-5": { name: "galangal powder",       flavour: "Piney and peppery, ginger's sharper cousin." },
        "B-6": { name: "Thai red curry powder", flavour: "Fragrant heat, ready for coconut milk." }
      }
    },
    {
      id: "middle-eastern",
      name: "Middle Eastern",
      note: "Tart, nutty and generous at the table.",
      spices: {
        "S-1": { name: "sesame seed",   flavour: "Toasted, nutty crunch over bread and salads." },
        "G-2": { name: "ground cumin",  flavour: "Rounded, savoury depth for grills and dips." },
        "C-3": { name: "sumac",         flavour: "Crimson and tangy, like dried lemon." },
        "H-4": { name: "Aleppo pepper", flavour: "Fruity, oily and gently building heat." },
        "A-5": { name: "dried mint",    flavour: "Cool and sweet through yoghurt and lamb." },
        "B-6": { name: "baharat",       flavour: "A rich all-spice blend for meat and rice." }
      }
    },
    {
      id: "italian",
      name: "Italian",
      note: "Few ingredients, chosen with care.",
      spices: {
        "S-1": { name: "fennel seed",        flavour: "Sweet anise, the soul of Tuscan sausage." },
        "G-2": { name: "black pepper",       flavour: "Pungent and woody, essential to cacio e pepe." },
        "C-3": { name: "saffron",            flavour: "Honeyed, hay-like gold for risotto." },
        "H-4": { name: "peperoncino",        flavour: "Direct Calabrian heat for oil and pasta." },
        "A-5": { name: "dried oregano",      flavour: "Herbal and warm, made for tomato." },
        "B-6": { name: "Italian herb blend", flavour: "A rounded garden mix for roasts and sauces." }
      }
    }
  ],

  /* Starting state of "In My Drawer" (demo data). Dates are YYYY-MM-DD. */
  drawer: {
    cuisineId: "indian",
    since: "2026-10-16",
    fills: { "S-1": 72, "G-2": 58, "C-3": 84, "H-4": 41, "A-5": 66, "B-6": 23 }
  },

  /* Sample past orders, always labelled as demo data in the app. */
  sampleOrders: [
    { ref: "SR-1012", cuisineId: "indian",   date: "2026-10-12" },
    { ref: "SR-0803", cuisineId: "moroccan", date: "2026-08-03" },
    { ref: "SR-0519", cuisineId: "italian",  date: "2026-05-19" }
  ],

  credit: "A design prototype by Ayan Kusumwal, BA Product & Furniture Design, London Metropolitan University, for Bulthaup Mayfair."
};
