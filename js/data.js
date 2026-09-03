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
