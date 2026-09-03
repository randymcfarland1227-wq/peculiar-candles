// Static reference config for Peculiar Candles. All actual inventory (jars, oils,
// wicks) and the candle build log live in localStorage — see js/app.js — this file
// only holds fixed data: scent-note colors, wick types, fragrance-intensity presets,
// and the wax-yield estimate the calculator uses.

// Scent note "family" -> color, used to color-code fragrance note chips (e.g. a
// Cedarwood note tagged "woody" renders brown, a Linen note tagged "clean" renders
// near-white). Chip text color is computed for contrast at render time in app.js.
const NOTE_META = {
  woody:    { label: 'Woody',    color: '#6f4e33' },
  earthy:   { label: 'Earthy',   color: '#8a7752' },
  clean:    { label: 'Clean',    color: '#e4e6dc' },
  fresh:    { label: 'Fresh',    color: '#4f8fa3' },
  floral:   { label: 'Floral',   color: '#d98bab' },
  sweet:    { label: 'Sweet',    color: '#d9a441' },
  citrus:   { label: 'Citrus',   color: '#e8952e' },
  fruity:   { label: 'Fruity',   color: '#d1573f' },
  spicy:    { label: 'Spicy',    color: '#b5432a' },
  vanilla:  { label: 'Vanilla',  color: '#cf9a5c' },
  herbal:   { label: 'Herbal',   color: '#6f8f4e' },
  smoky:    { label: 'Smoky',    color: '#4a453e' },
  musky:    { label: 'Musky',    color: '#7a6b85' },
  powdery:  { label: 'Powdery',  color: '#c9bfc9' },
  green:    { label: 'Green',    color: '#4a9e6b' },
  airy:     { label: 'Airy',     color: '#d7e6df' },
  warm:     { label: 'Warm',     color: '#d68847' },
  dry:      { label: 'Dry',      color: '#a68a5c' },
  creamy:   { label: 'Creamy',   color: '#ecdfc4' },
  soft:     { label: 'Soft',     color: '#e3cdd6' },
  resinous: { label: 'Resinous', color: '#a8672e' },
  gourmand: { label: 'Gourmand', color: '#9c5a35' },
};
const NOTE_FAMILY_ORDER = Object.keys(NOTE_META);

const WICK_TYPES = [
  { id: 'cotton', label: 'Cotton', icon: '🧵' },
  { id: 'wood', label: 'Wood', icon: '🪵' },
];

// Fragrance intensity presets — % is fragrance oil weight as a share of wax weight.
// 5-10% is the standard safe range for soy container candles; this tool won't
// suggest above that (higher can cause poor burn, frosting, or wick drowning).
const INTENSITY_LEVELS = [
  { id: 'light', label: 'Light', pct: 0.05, desc: '5% fragrance load — subtle, everyday' },
  { id: 'medium', label: 'Medium', pct: 0.07, desc: '7% fragrance load — balanced, most common' },
  { id: 'strong', label: 'Strong', pct: 0.10, desc: '10% fragrance load — bold throw' },
];

// Rough wax weight (oz) yielded per 1 fl oz of jar volume. Soy wax poured to a
// sensible fill line sits close to water density with some loss to headspace and
// the wick bar, so ~0.85oz wax per 1 fl oz jar capacity is a reasonable estimate —
// treat it as a starting point and always weigh your actual pour.
const WAX_YIELD_FACTOR = 0.85;

const JAR_SOURCES = ['Recycled candle basin', 'Secondhand / thrifted', 'Purchased new'];

const JAR_STATUSES = [
  { id: 'available', label: 'Available' },
  { id: 'inuse', label: 'In Use' },
  { id: 'cleaning', label: 'Needs Cleaning' },
  { id: 'retired', label: 'Retired' },
];

const CANDLE_PURPOSES = [
  { id: 'tester', label: 'Tester' },
  { id: 'personal', label: 'Personal' },
  { id: 'gift', label: 'Gift' },
  { id: 'sell', label: 'For Sale' },
];

const CANDLE_STATUSES = [
  { id: 'curing', label: 'Curing' },
  { id: 'ready', label: 'Ready' },
  { id: 'gifted', label: 'Gifted' },
  { id: 'sold', label: 'Sold' },
  { id: 'kept', label: 'Kept' },
];

const LOW_STOCK_OIL_OZ = 1;
const LOW_STOCK_WICK_QTY = 3;

// Starting fragrance-oil inventory — loads into localStorage the first time the
// site runs on a given browser (see app.js: state.oils falls back to this only
// when nothing's been saved yet), same pattern as ROUTINES in routine-hub. Edit
// directly here, or manage it from the Oils tab once it's loaded — either way
// works. A few of the supplier's own note words (e.g. "Coniferous", "Balsamic",
// "Aromatic", "Camphorous") don't have their own chip color and are mapped to the
// closest existing family below; the label text itself always shows the original
// word.
const SEED_OILS = [
  { id: 'oil-bamboo', name: 'Bamboo', amountOz: 0.3, supplier: '', notes: [
    { text: 'Green', family: 'green' }, { text: 'Fresh', family: 'fresh' }, { text: 'Clean', family: 'clean' }, { text: 'Airy', family: 'airy' }, { text: 'Woody', family: 'woody' },
  ] },
  { id: 'oil-forest-pine', name: 'Forest Pine', amountOz: 0.3, supplier: '', notes: [
    { text: 'Coniferous', family: 'woody' }, { text: 'Woody', family: 'woody' }, { text: 'Green', family: 'green' }, { text: 'Resinous', family: 'resinous' }, { text: 'Fresh', family: 'fresh' },
  ] },
  { id: 'oil-sandalwood', name: 'Sandalwood', amountOz: 0.3, supplier: '', notes: [
    { text: 'Woody', family: 'woody' }, { text: 'Creamy', family: 'creamy' }, { text: 'Warm', family: 'warm' }, { text: 'Soft', family: 'soft' }, { text: 'Musky', family: 'musky' },
  ] },
  { id: 'oil-cedar', name: 'Cedar', amountOz: 0.3, supplier: '', notes: [
    { text: 'Woody', family: 'woody' }, { text: 'Dry', family: 'dry' }, { text: 'Earthy', family: 'earthy' }, { text: 'Resinous', family: 'resinous' }, { text: 'Warm', family: 'warm' },
  ] },
  { id: 'oil-vetiver', name: 'Vetiver', amountOz: 0.3, supplier: '', notes: [
    { text: 'Earthy', family: 'earthy' }, { text: 'Woody', family: 'woody' }, { text: 'Smoky', family: 'smoky' }, { text: 'Dry', family: 'dry' }, { text: 'Green', family: 'green' },
  ] },
  { id: 'oil-teakwood', name: 'Teakwood', amountOz: 0.3, supplier: '', notes: [
    { text: 'Woody', family: 'woody' }, { text: 'Warm', family: 'warm' }, { text: 'Spicy', family: 'spicy' }, { text: 'Rich', family: 'gourmand' }, { text: 'Musky', family: 'musky' },
  ] },
  { id: 'oil-fall-leaf', name: 'Fall Leaf', amountOz: 0.2, supplier: '', notes: [
    { text: 'Earthy', family: 'earthy' }, { text: 'Woody', family: 'woody' }, { text: 'Dry', family: 'dry' }, { text: 'Spicy', family: 'spicy' }, { text: 'Warm', family: 'warm' },
  ] },
  { id: 'oil-apple-cedar', name: 'Apple Cedar', amountOz: 0.2, supplier: '', notes: [
    { text: 'Fruity', family: 'fruity' }, { text: 'Woody', family: 'woody' }, { text: 'Sweet', family: 'sweet' }, { text: 'Fresh', family: 'fresh' }, { text: 'Warm', family: 'warm' },
  ] },
  { id: 'oil-harvest-spice', name: 'Harvest Spice', amountOz: 0.2, supplier: '', notes: [
    { text: 'Spicy', family: 'spicy' }, { text: 'Warm', family: 'warm' }, { text: 'Sweet', family: 'sweet' }, { text: 'Gourmand', family: 'gourmand' }, { text: 'Balsamic', family: 'resinous' },
  ] },
  { id: 'oil-vanilla', name: 'Vanilla', amountOz: 0.2, supplier: '', notes: [
    { text: 'Vanilla', family: 'vanilla' }, { text: 'Sweet', family: 'sweet' }, { text: 'Creamy', family: 'creamy' }, { text: 'Warm', family: 'warm' }, { text: 'Gourmand', family: 'gourmand' },
  ] },
  { id: 'oil-cinnamon', name: 'Cinnamon', amountOz: 0.2, supplier: '', notes: [
    { text: 'Spicy', family: 'spicy' }, { text: 'Warm', family: 'warm' }, { text: 'Sweet', family: 'sweet' }, { text: 'Dry', family: 'dry' }, { text: 'Gourmand', family: 'gourmand' },
  ] },
  { id: 'oil-pumpkin', name: 'Pumpkin', amountOz: 0.2, supplier: '', notes: [
    { text: 'Gourmand', family: 'gourmand' }, { text: 'Sweet', family: 'sweet' }, { text: 'Warm', family: 'warm' }, { text: 'Creamy', family: 'creamy' }, { text: 'Earthy', family: 'earthy' },
  ] },
  { id: 'oil-creamy-woods-sweet-musk', name: 'Creamy Woods & Sweet Musk', amountOz: 0.4, supplier: '', notes: [
    { text: 'Woody', family: 'woody' }, { text: 'Creamy', family: 'creamy' }, { text: 'Musky', family: 'musky' }, { text: 'Sweet', family: 'sweet' }, { text: 'Soft', family: 'soft' },
  ] },
  { id: 'oil-blossom-water', name: 'Blossom Water', amountOz: 0.5, supplier: '', notes: [
    { text: 'Floral', family: 'floral' }, { text: 'Aquatic', family: 'fresh' }, { text: 'Fresh', family: 'fresh' }, { text: 'Airy', family: 'airy' }, { text: 'Clean', family: 'clean' },
  ] },
  { id: 'oil-beach-sage', name: 'Beach Sage', amountOz: 0.5, supplier: '', notes: [
    { text: 'Herbal', family: 'herbal' }, { text: 'Aquatic', family: 'fresh' }, { text: 'Fresh', family: 'fresh' }, { text: 'Green', family: 'green' }, { text: 'Aromatic', family: 'herbal' },
  ] },
  { id: 'oil-lavender-sandalwood', name: 'Lavender Sandalwood', amountOz: 0.5, supplier: '', notes: [
    { text: 'Floral', family: 'floral' }, { text: 'Herbal', family: 'herbal' }, { text: 'Woody', family: 'woody' }, { text: 'Creamy', family: 'creamy' }, { text: 'Aromatic', family: 'herbal' },
  ] },
  { id: 'oil-fresh-sheets', name: 'Fresh Sheets', amountOz: 0.5, supplier: '', notes: [
    { text: 'Clean', family: 'clean' }, { text: 'Fresh', family: 'fresh' }, { text: 'Airy', family: 'airy' }, { text: 'Powdery', family: 'powdery' }, { text: 'Soft', family: 'soft' },
  ] },
  { id: 'oil-amberfire-wood', name: 'Amberfire Wood', amountOz: 0.5, supplier: '', notes: [
    { text: 'Amber', family: 'resinous' }, { text: 'Woody', family: 'woody' }, { text: 'Smoky', family: 'smoky' }, { text: 'Warm', family: 'warm' }, { text: 'Resinous', family: 'resinous' },
  ] },
  { id: 'oil-bergamot-breeze', name: 'Bergamot Breeze', amountOz: 0.5, supplier: '', notes: [
    { text: 'Citrus', family: 'citrus' }, { text: 'Fresh', family: 'fresh' }, { text: 'Airy', family: 'airy' }, { text: 'Aromatic', family: 'herbal' }, { text: 'Green', family: 'green' },
  ] },
  { id: 'oil-velvet-woods', name: 'Velvet Woods', amountOz: 0.5, supplier: '', notes: [
    { text: 'Woody', family: 'woody' }, { text: 'Musky', family: 'musky' }, { text: 'Soft', family: 'soft' }, { text: 'Warm', family: 'warm' }, { text: 'Rich', family: 'gourmand' },
  ] },
  { id: 'oil-palo-santo', name: 'Palo Santo', amountOz: 0.5, supplier: '', notes: [
    { text: 'Woody', family: 'woody' }, { text: 'Smoky', family: 'smoky' }, { text: 'Resinous', family: 'resinous' }, { text: 'Warm', family: 'warm' }, { text: 'Balsamic', family: 'resinous' },
  ] },
  { id: 'oil-tea-tree', name: 'Tea Tree', amountOz: 0.1, supplier: '', notes: [
    { text: 'Herbal', family: 'herbal' }, { text: 'Camphorous', family: 'fresh' }, { text: 'Fresh', family: 'fresh' }, { text: 'Green', family: 'green' }, { text: 'Medicinal', family: 'clean' },
  ] },
  { id: 'oil-sweet-orange', name: 'Sweet Orange', amountOz: 0.1, supplier: '', notes: [
    { text: 'Citrus', family: 'citrus' }, { text: 'Sweet', family: 'sweet' }, { text: 'Fruity', family: 'fruity' }, { text: 'Fresh', family: 'fresh' }, { text: 'Juicy', family: 'fruity' },
  ] },
  { id: 'oil-eucalyptus', name: 'Eucalyptus', amountOz: 0, supplier: '', notes: [
    { text: 'Camphorous', family: 'fresh' }, { text: 'Fresh', family: 'fresh' }, { text: 'Cool', family: 'fresh' }, { text: 'Herbal', family: 'herbal' }, { text: 'Minty', family: 'herbal' },
  ] },
  { id: 'oil-rose', name: 'Rose', amountOz: 0.2, supplier: '', notes: [
    { text: 'Floral', family: 'floral' }, { text: 'Sweet', family: 'sweet' }, { text: 'Rich', family: 'gourmand' }, { text: 'Green', family: 'green' }, { text: 'Powdery', family: 'powdery' },
  ] },
  { id: 'oil-lavender', name: 'Lavender', amountOz: 0.15, supplier: '', notes: [
    { text: 'Floral', family: 'floral' }, { text: 'Herbal', family: 'herbal' }, { text: 'Aromatic', family: 'herbal' }, { text: 'Fresh', family: 'fresh' }, { text: 'Soft', family: 'soft' },
  ] },
];

// Named blends — a "recipe" is parts by ratio (not fixed oz), scaled at build time
// to whatever total fragrance-oil amount the calculator suggests for the chosen jar
// + intensity. `oil` values must match an oil's `name` in SEED_OILS (case-insensitive)
// for the Build tab to auto-resolve them to that oil's inventory row.
const RECIPES = [
  { id: 'after-the-rain', icon: '🌲', name: 'After the Rain', expect: 'Wet green forest, cool air, earthy underneath', parts: [
    { oil: 'Bamboo', parts: 3 }, { oil: 'Forest Pine', parts: 2 }, { oil: 'Vetiver', parts: 1 }, { oil: 'Eucalyptus', parts: 1 },
  ] },
  { id: 'old-library', icon: '🪵', name: 'Old Library', expect: 'Dry old wood, warmth, slightly dusty/cozy', parts: [
    { oil: 'Cedar', parts: 3 }, { oil: 'Vanilla', parts: 2 }, { oil: 'Teakwood', parts: 2 }, { oil: 'Vetiver', parts: 1 },
  ] },
  { id: 'midnight-garden', icon: '🌙', name: 'Midnight Garden', expect: 'Dark floral rather than traditionally "pretty" floral', parts: [
    { oil: 'Lavender Sandalwood', parts: 3 }, { oil: 'Blossom Water', parts: 2 }, { oil: 'Vetiver', parts: 1 }, { oil: 'Rose', parts: 1 },
  ] },
  { id: 'cabin-at-dusk', icon: '🔥', name: 'Cabin at Dusk', expect: 'Fireplace, timber, pine air, subtle sweetness', parts: [
    { oil: 'Amberfire Wood', parts: 3 }, { oil: 'Forest Pine', parts: 2 }, { oil: 'Cedar', parts: 1 }, { oil: 'Vanilla', parts: 1 },
  ] },
  { id: 'apple-orchard', icon: '🍎', name: 'Apple Orchard', expect: 'More actual autumn orchard than apple-pie candle', parts: [
    { oil: 'Apple Cedar', parts: 3 }, { oil: 'Fall Leaf', parts: 2 }, { oil: 'Cinnamon', parts: 1 }, { oil: 'Cedar', parts: 1 },
  ] },
  { id: 'sunday-morning', icon: '🛏️', name: 'Sunday Morning', expect: 'Clean linen, open windows, soft floral air', parts: [
    { oil: 'Fresh Sheets', parts: 4 }, { oil: 'Blossom Water', parts: 2 }, { oil: 'Lavender', parts: 1 },
  ] },
  { id: 'coastal-woods', icon: '🌊', name: 'Coastal Woods', expect: 'Breezy coastal vegetation + weathered wood', parts: [
    { oil: 'Beach Sage', parts: 3 }, { oil: 'Bergamot Breeze', parts: 2 }, { oil: 'Cedar', parts: 2 }, { oil: 'Eucalyptus', parts: 1 },
  ] },
  { id: 'skin-and-wood', icon: '🧡', name: 'Skin & Wood', expect: 'Warm skin, creamy wood, subtle perfume quality', parts: [
    { oil: 'Creamy Woods & Sweet Musk', parts: 4 }, { oil: 'Sandalwood', parts: 2 }, { oil: 'Vanilla', parts: 1 }, { oil: 'Bergamot Breeze', parts: 1 },
  ] },
  { id: 'orange-grove', icon: '🍊', name: 'Orange Grove', expect: 'Bright citrus peel, leaves and branches instead of orange candy', parts: [
    { oil: 'Sweet Orange', parts: 4 }, { oil: 'Bergamot Breeze', parts: 2 }, { oil: 'Cedar', parts: 1 }, { oil: 'Tea Tree', parts: 1 },
  ] },
  { id: 'rainy-cabin', icon: '🌧️', name: 'Rainy Cabin', expect: 'Damp air, clean interior, earthy wood', parts: [
    { oil: 'Bamboo', parts: 3 }, { oil: 'Cedar', parts: 2 }, { oil: 'Fresh Sheets', parts: 2 }, { oil: 'Vetiver', parts: 1 },
  ] },
  { id: 'october-6pm', icon: '🍂', name: 'October 6 PM', expect: 'Leaves, chilly evening, distant warmth', parts: [
    { oil: 'Fall Leaf', parts: 3 }, { oil: 'Amberfire Wood', parts: 2 }, { oil: 'Apple Cedar', parts: 1 }, { oil: 'Cinnamon', parts: 1 },
  ] },
  { id: 'incense-shop', icon: '🕯️', name: 'Incense Shop', expect: 'Resinous, meditative, creamy and slightly smoky', parts: [
    { oil: 'Palo Santo', parts: 3 }, { oil: 'Sandalwood', parts: 2 }, { oil: 'Vetiver', parts: 1 }, { oil: 'Vanilla', parts: 1 },
  ] },
  { id: 'greenhouse', icon: '🌿', name: 'Greenhouse', expect: 'Crushed green plants, humidity, fresh air', parts: [
    { oil: 'Bamboo', parts: 3 }, { oil: 'Beach Sage', parts: 2 }, { oil: 'Eucalyptus', parts: 1 }, { oil: 'Bergamot Breeze', parts: 1 },
  ] },
  { id: 'rosewood', icon: '🌹', name: 'Rosewood', expect: 'Sophisticated woody rose, much less "grandma rose"', parts: [
    { oil: 'Sandalwood', parts: 3 }, { oil: 'Rose', parts: 2 }, { oil: 'Creamy Woods & Sweet Musk', parts: 1 }, { oil: 'Bergamot Breeze', parts: 1 },
  ] },
  { id: 'pumpkin-but-grown', icon: '🎃', name: 'Pumpkin, But Grown', expect: 'Pumpkin warmth without becoming a sugary PSL', parts: [
    { oil: 'Pumpkin', parts: 3 }, { oil: 'Cedar', parts: 2 }, { oil: 'Vanilla', parts: 1 }, { oil: 'Harvest Spice', parts: 1 }, { oil: 'Vetiver', parts: 1 },
  ] },
  { id: 'winter-forest', icon: '❄️', name: 'Winter Forest', expect: 'Cold pine forest with a warm woody base', parts: [
    { oil: 'Forest Pine', parts: 4 }, { oil: 'Eucalyptus', parts: 2 }, { oil: 'Cedar', parts: 1 }, { oil: 'Palo Santo', parts: 1 },
  ] },
  { id: 'clean-boy', icon: '🧺', name: 'Clean Boy™', expect: "Clean laundry + expensive men's skin scent", parts: [
    { oil: 'Fresh Sheets', parts: 4 }, { oil: 'Bergamot Breeze', parts: 2 }, { oil: 'Creamy Woods & Sweet Musk', parts: 2 }, { oil: 'Sandalwood', parts: 1 },
  ] },
  { id: 'velvet-night', icon: '🌌', name: 'Velvet Night', expect: 'Dark, smooth, warm, sexy woody amber', parts: [
    { oil: 'Velvet Woods', parts: 3 }, { oil: 'Amberfire Wood', parts: 2 }, { oil: 'Creamy Woods & Sweet Musk', parts: 2 }, { oil: 'Vanilla', parts: 1 },
  ] },
  { id: 'spiced-orange', icon: '🍊', name: 'Spiced Orange', expect: 'Orange peel, spice and warm wood', parts: [
    { oil: 'Sweet Orange', parts: 4 }, { oil: 'Cinnamon', parts: 2 }, { oil: 'Vanilla', parts: 2 }, { oil: 'Cedar', parts: 1 },
  ] },
  { id: 'earth', icon: '🌾', name: 'Earth', expect: 'Dry soil, roots, dead leaves and wood—intentionally earthy', parts: [
    { oil: 'Vetiver', parts: 3 }, { oil: 'Cedar', parts: 2 }, { oil: 'Fall Leaf', parts: 2 }, { oil: 'Palo Santo', parts: 1 },
  ] },
  { id: 'lavender-smoke', icon: '💜', name: 'Lavender Smoke', expect: 'Herbal lavender softened by creamy smoky wood', parts: [
    { oil: 'Lavender', parts: 3 }, { oil: 'Palo Santo', parts: 2 }, { oil: 'Sandalwood', parts: 2 }, { oil: 'Vanilla', parts: 1 },
  ] },
  { id: 'beach-house', icon: '🏖️', name: 'Beach House', expect: 'Clean coastal air rather than sunscreen/tropical beach', parts: [
    { oil: 'Blossom Water', parts: 4 }, { oil: 'Beach Sage', parts: 3 }, { oil: 'Fresh Sheets', parts: 2 }, { oil: 'Bergamot Breeze', parts: 1 },
  ] },
  { id: 'harvest-kitchen', icon: '🍁', name: 'Harvest Kitchen', expect: 'Your unapologetically cozy gourmand fall candle', parts: [
    { oil: 'Apple Cedar', parts: 3 }, { oil: 'Pumpkin', parts: 2 }, { oil: 'Vanilla', parts: 1 }, { oil: 'Cinnamon', parts: 1 }, { oil: 'Harvest Spice', parts: 1 },
  ] },
  { id: 'strange-woods', icon: '🌲', name: 'Strange Woods', expect: 'Foresty at first, then this unexpected dark floral underneath', parts: [
    { oil: 'Forest Pine', parts: 3 }, { oil: 'Velvet Woods', parts: 2 }, { oil: 'Rose', parts: 1 }, { oil: 'Vetiver', parts: 1 },
  ] },
];
