// Vehicle catalogue: models -> variants. Physical vehicles live in seed.js (inventory).
export const categories = ['Hatchback', 'Sedan', 'SUV', 'Electric', 'MPV'];

export const models = [
  {
    slug: 'metro',
    name: 'Metro',
    category: 'Hatchback',
    shape: 'hatch',
    tagline: 'The city, simplified.',
    description:
      'A nimble five-door hatchback built for dense traffic and tight parking, with a surprisingly roomy cabin and best-in-class efficiency.',
    isNew: false,
    featured: false,
    colours: [
      { name: 'Arctic White', hex: '#e9ecef' },
      { name: 'Coral Red', hex: '#d94b3d' },
      { name: 'Slate Grey', hex: '#5b6470' },
      { name: 'Lagoon Blue', hex: '#2f7fb5' },
    ],
    specs: {
      Engine: '1.2L 4-cyl petrol',
      Power: '88 PS @ 6000 rpm',
      Torque: '113 Nm @ 4400 rpm',
      Transmission: '5MT / AMT',
      Mileage: '22.4 km/l',
      Seating: '5',
      Boot: '318 L',
      'Ground clearance': '170 mm',
    },
    features: ['7" touchscreen', 'Rear parking camera', 'Dual airbags', 'Auto climate control', 'Keyless entry'],
    variants: [
      { id: 'metro-e', name: 'Metro E', price: 749000, fuel: 'Petrol', transmission: 'Manual' },
      { id: 'metro-s', name: 'Metro S', price: 829000, fuel: 'Petrol', transmission: 'Manual' },
      { id: 'metro-z', name: 'Metro Z AMT', price: 929000, fuel: 'Petrol', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'aero',
    name: 'Aero',
    category: 'Sedan',
    shape: 'sedan',
    tagline: 'Quiet confidence, every kilometre.',
    description:
      'A refined executive sedan with a hushed cabin, adaptive cruise and a turbo engine tuned for effortless highway runs.',
    isNew: false,
    featured: true,
    colours: [
      { name: 'Obsidian Black', hex: '#1b1d21' },
      { name: 'Pearl White', hex: '#f1f1ee' },
      { name: 'Champagne', hex: '#bfa27a' },
      { name: 'Deep Ocean', hex: '#1f3b5c' },
    ],
    specs: {
      Engine: '1.5L turbo petrol',
      Power: '160 PS @ 5500 rpm',
      Torque: '253 Nm @ 1750 rpm',
      Transmission: '7-speed DCT',
      Mileage: '17.8 km/l',
      Seating: '5',
      Boot: '510 L',
      'Ground clearance': '165 mm',
    },
    features: ['Adaptive cruise control', 'Ventilated front seats', '10.25" digital cluster', '6 airbags', 'Wireless charging', 'Sunroof'],
    variants: [
      { id: 'aero-s', name: 'Aero S', price: 1850000, fuel: 'Petrol', transmission: 'Manual' },
      { id: 'aero-gt', name: 'Aero GT', price: 2140000, fuel: 'Petrol', transmission: 'Automatic' },
      { id: 'aero-gtline', name: 'Aero GT Line', price: 2390000, fuel: 'Petrol', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'terra',
    name: 'Terra',
    category: 'SUV',
    shape: 'suv',
    tagline: 'Built for every kind of road.',
    description:
      'A commanding mid-size SUV with all-wheel drive, terrain modes and a premium cabin that is as comfortable in the city as it is on a ghat road.',
    isNew: true,
    featured: true,
    colours: [
      { name: 'Forest Green', hex: '#2f4a3a' },
      { name: 'Glacier White', hex: '#eef0f2' },
      { name: 'Desert Sand', hex: '#c4a77d' },
      { name: 'Graphite', hex: '#3a3d42' },
    ],
    specs: {
      Engine: '2.0L turbo diesel',
      Power: '175 PS @ 3750 rpm',
      Torque: '380 Nm @ 1750 rpm',
      Transmission: '6-speed AT',
      Mileage: '15.2 km/l',
      Seating: '5',
      Boot: '480 L',
      'Ground clearance': '210 mm',
    },
    features: ['AWD with terrain modes', 'Panoramic sunroof', '360° camera', 'Level 2 ADAS', '12.3" infotainment', 'Powered tailgate'],
    variants: [
      { id: 'terra-lx', name: 'Terra LX', price: 2490000, fuel: 'Diesel', transmission: 'Manual' },
      { id: 'terra-xlx', name: 'Terra XLX', price: 2790000, fuel: 'Diesel', transmission: 'Automatic' },
      { id: 'terra-signature', name: 'Terra Signature AWD', price: 3190000, fuel: 'Diesel', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'volt',
    name: 'Volt',
    category: 'Electric',
    shape: 'ev',
    tagline: 'All electric. All yours.',
    description:
      'A fully electric crossover with up to 480 km of certified range, DC fast charging and instant, silent performance.',
    isNew: true,
    featured: true,
    colours: [
      { name: 'Aurora Teal', hex: '#2a8c8c' },
      { name: 'Lunar Silver', hex: '#c3c7cc' },
      { name: 'Midnight', hex: '#15181d' },
      { name: 'Solar Copper', hex: '#b5663f' },
    ],
    specs: {
      Battery: '45 / 60 kWh',
      Power: '150 – 218 PS',
      Torque: '310 Nm',
      Range: 'Up to 480 km (ARAI)',
      'Fast charging': '10–80% in 32 min',
      Seating: '5',
      Boot: '420 L',
      'Ground clearance': '190 mm',
    },
    features: ['DC fast charging', 'Vehicle-to-load', 'One-pedal driving', 'OTA updates', 'Connected car app', 'Heat pump'],
    variants: [
      { id: 'volt-sr', name: 'Volt Standard Range', price: 2190000, fuel: 'Electric', transmission: 'Automatic' },
      { id: 'volt-lr', name: 'Volt Long Range', price: 2490000, fuel: 'Electric', transmission: 'Automatic' },
      { id: 'volt-perf', name: 'Volt Performance', price: 2790000, fuel: 'Electric', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'atlas',
    name: 'Atlas',
    category: 'MPV',
    shape: 'mpv',
    tagline: 'Room for everyone, and everything.',
    description:
      'A seven-seat premium people-mover with captain chairs, three-zone climate and a flat-folding third row.',
    isNew: false,
    featured: false,
    colours: [
      { name: 'Platinum', hex: '#b9bcc0' },
      { name: 'Royal Maroon', hex: '#5e1f2a' },
      { name: 'Ivory', hex: '#ece6d8' },
    ],
    specs: {
      Engine: '2.0L petrol hybrid',
      Power: '186 PS (combined)',
      Torque: '206 Nm',
      Transmission: 'e-CVT',
      Mileage: '21.1 km/l',
      Seating: '7',
      Boot: '300 L (all rows up)',
      'Ground clearance': '185 mm',
    },
    features: ['Captain seats', '3-zone climate', 'Powered sliding doors', 'Rear entertainment', '6 airbags', 'Ambient lighting'],
    variants: [
      { id: 'atlas-g', name: 'Atlas G', price: 2950000, fuel: 'Hybrid', transmission: 'Automatic' },
      { id: 'atlas-zx', name: 'Atlas ZX', price: 3250000, fuel: 'Hybrid', transmission: 'Automatic' },
    ],
  },
];

export const getModel = (slug) => models.find((m) => m.slug === slug);
export const startingPrice = (m) => Math.min(...m.variants.map((v) => v.price));
export const allVariants = models.flatMap((m) => m.variants.map((v) => ({ ...v, model: m.name, slug: m.slug })));
export const variantById = (id) => allVariants.find((v) => v.id === id);

export const offers = [
  {
    id: 'off-1',
    title: 'Festive Cash Benefit',
    models: ['Terra', 'Aero'],
    benefit: 'Up to ₹75,000 off',
    description: 'Cash discount plus exchange bonus on select Terra and Aero variants.',
    validTill: '2026-11-30',
    terms: 'Valid on stock vehicles only. Cannot be combined with corporate offers.',
  },
  {
    id: 'off-2',
    title: 'Volt Home Charger on Us',
    models: ['Volt'],
    benefit: 'Free 7.2 kW wallbox',
    description: 'Complimentary home charger with standard installation on every Volt booked this month.',
    validTill: '2026-12-15',
    terms: 'Installation within city limits. Site survey required.',
  },
  {
    id: 'off-3',
    title: 'First Car Advantage',
    models: ['Metro'],
    benefit: '₹20,000 + free insurance',
    description: 'Special pricing and first-year insurance for first-time car buyers.',
    validTill: '2026-12-31',
    terms: 'Proof of first purchase required.',
  },
  {
    id: 'off-4',
    title: '5-Year Care Package',
    models: ['Atlas', 'Terra'],
    benefit: '5 years free service',
    description: 'Scheduled maintenance covered for 5 years or 75,000 km.',
    validTill: '2026-12-31',
    terms: 'Covers scheduled labour and consumables only.',
  },
];
