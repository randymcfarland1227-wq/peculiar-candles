// Static reference config for Peculiar Candles. All actual inventory (jars, oils,
// wicks) and the candle build log live in localStorage — see js/app.js — this file
// only holds fixed data: scent-note colors, wick types, fragrance-intensity presets,
// and the wax-yield estimate the calculator uses.

// Scent note "family" -> color, used to color-code fragrance note chips (e.g. a
// Cedarwood note tagged "woody" renders brown, a Linen note tagged "clean" renders
// near-white). Chip text color is computed for contrast at render time in app.js.
const NOTE_META = {
  woody:   { label: 'Woody',   color: '#6f4e33' },
  earthy:  { label: 'Earthy',  color: '#8a7752' },
  clean:   { label: 'Clean',   color: '#e4e6dc' },
  fresh:   { label: 'Fresh',   color: '#4f8fa3' },
  floral:  { label: 'Floral',  color: '#d98bab' },
  sweet:   { label: 'Sweet',   color: '#d9a441' },
  citrus:  { label: 'Citrus',  color: '#e8952e' },
  fruity:  { label: 'Fruity',  color: '#d1573f' },
  spicy:   { label: 'Spicy',   color: '#b5432a' },
  vanilla: { label: 'Vanilla', color: '#cf9a5c' },
  herbal:  { label: 'Herbal',  color: '#6f8f4e' },
  smoky:   { label: 'Smoky',   color: '#4a453e' },
  musky:   { label: 'Musky',   color: '#7a6b85' },
  powdery: { label: 'Powdery', color: '#c9bfc9' },
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
