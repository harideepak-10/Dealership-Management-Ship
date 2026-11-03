// Vehicle catalogue: models -> variants. Physical vehicles live in seed.js (inventory).
// Prices: ex-showroom (New Delhi) as listed on CarDekho, Nov 2026 — indicative only.
// Photos: Unsplash (free licence, https://unsplash.com/license), hot-linked via images.unsplash.com.

const img = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const categories = ['Sports Car', 'Electric', 'SUV', 'Gran Turismo'];

export const models = [
  {
    slug: '911',
    name: '911',
    category: 'Sports Car',
    shape: 'sedan',
    tagline: 'The icon, refined for every road.',
    description:
      'The rear-engined two-door sports car, from the 385 PS Carrera to the 650 PS Turbo S — precise, usable every day and unmistakable from any angle.',
    isNew: false,
    featured: true,
    image: img('1614162692292-7ac56d7f7f1e'),
    gallery: [img('1614162692292-7ac56d7f7f1e'), img('1580274455191-1c62238fa333'), img('1615836426606-c16238a6bfb4')],
    photoCredit: 'Laurent Perren / Unsplash',
    colours: [
      { name: 'GT Silver Metallic', hex: '#b8bcc0' },
      { name: 'Jet Black Metallic', hex: '#17191c' },
      { name: 'Carrara White', hex: '#eeeeea' },
      { name: 'Guards Red', hex: '#c8102e' },
    ],
    specs: {
      Engine: '3.0L twin-turbo flat-six',
      Power: '385 – 650 PS',
      Torque: '450 – 800 Nm',
      '0–100 km/h': '2.7 – 4.2 s',
      'Top speed': 'Up to 330 km/h',
      Transmission: '8-speed PDK',
      Seating: '2 + 2',
      'Front boot': '132 L',
    },
    features: ['Sport Chrono package', 'Porsche Active Suspension Management', 'Sport exhaust', '10.9" central display', 'Rear-axle steering (select variants)', 'Adaptive sports seats'],
    variants: [
      { id: '911-carrera', name: '911 Carrera', price: 20000000, fuel: 'Petrol', transmission: 'PDK' },
      { id: '911-c4gts', name: '911 Carrera 4 GTS', price: 27800000, fuel: 'Petrol (T-Hybrid)', transmission: 'PDK' },
      { id: '911-turbo50', name: '911 Turbo 50 Years', price: 37700000, fuel: 'Petrol', transmission: 'PDK' },
      { id: '911-turbos', name: '911 Turbo S', price: 38000000, fuel: 'Petrol', transmission: 'PDK' },
    ],
  },
  {
    slug: 'taycan',
    name: 'Taycan',
    category: 'Electric',
    shape: 'ev',
    tagline: 'Soul, electrified.',
    description:
      'The all-electric four-door sports saloon. 93.4 kWh battery, up to 705 km of certified range and 10–80% charging in about 33 minutes.',
    isNew: true,
    featured: true,
    image: img('1777197503545-46245551cbb3'),
    gallery: [img('1777197503545-46245551cbb3'), img('1772772876593-9d54e5f05a5b')],
    photoCredit: 'Osman İçli / Unsplash',
    colours: [
      { name: 'Volcano Grey Metallic', hex: '#55595e' },
      { name: 'Frozen Blue Metallic', hex: '#9fb6c8' },
      { name: 'Ice Grey Metallic', hex: '#c9ccd0' },
      { name: 'Jet Black Metallic', hex: '#17191c' },
    ],
    specs: {
      Battery: '93.4 kWh',
      Power: 'Up to 884 PS',
      Range: 'Up to 705 km',
      'DC charging': '10–80% in ~33 min',
      'AC charging': '11 kW · ~9 h',
      'Top speed': '250 km/h',
      Seating: '4',
      Boot: '366 L',
    },
    features: ['800-volt architecture', 'Porsche Electric Sport Sound', 'Adaptive air suspension', 'Curved 16.8" instrument cluster', 'Passenger display', 'Head-up display'],
    variants: [
      { id: 'taycan-std', name: 'Taycan', price: 17000000, fuel: 'Electric', transmission: 'Automatic' },
      { id: 'taycan-4s', name: 'Taycan 4S', price: 19600000, fuel: 'Electric', transmission: 'Automatic' },
      { id: 'taycan-turbo', name: 'Taycan Turbo', price: 27000000, fuel: 'Electric', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'cayenne',
    name: 'Cayenne',
    category: 'SUV',
    shape: 'suv',
    tagline: 'A sports car, with room for everything.',
    description:
      'The five-seat performance SUV. Turbocharged V6 and V8 engines, all-wheel drive and a cabin that is as comfortable on the highway as it is on a ghat road.',
    isNew: false,
    featured: true,
    image: img('1696315072523-1bd90867944b'),
    gallery: [img('1696315072523-1bd90867944b'), img('1699325974549-fd06639650aa'), img('1654159866298-e3c8ee93e43b')],
    photoCredit: 'Tim Meyer / Unsplash',
    colours: [
      { name: 'Jet Black Metallic', hex: '#17191c' },
      { name: 'Quartzite Grey Metallic', hex: '#8b8f93' },
      { name: 'Carrara White Metallic', hex: '#eeeeea' },
      { name: 'Algarve Blue Metallic', hex: '#2b5c8a' },
    ],
    specs: {
      Engine: '3.0L V6 / 4.0L V8 twin-turbo',
      Power: '353 – 500 PS',
      Torque: '500 – 660 Nm',
      'Top speed': 'Up to 275 km/h',
      Transmission: '8-speed Tiptronic S',
      Drive: 'All-wheel drive',
      Seating: '5',
      Boot: '772 L',
    },
    features: ['Adaptive air suspension', 'Porsche Traction Management', 'Panoramic roof', '12.3" curved display', 'Matrix LED headlights', 'Surround view'],
    variants: [
      { id: 'cayenne-std', name: 'Cayenne', price: 13900000, fuel: 'Petrol', transmission: 'Automatic' },
      { id: 'cayenne-gts', name: 'Cayenne GTS', price: 19400000, fuel: 'Petrol', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'macan',
    name: 'Macan Electric',
    category: 'Electric',
    shape: 'suv',
    tagline: 'The compact SUV, all electric.',
    description:
      'The first all-electric Macan. A 100 kWh battery, up to 624 km of range and 10–80% charging in about 21 minutes on a 270 kW charger.',
    isNew: true,
    featured: false,
    image: null, // no free-licence Macan photo found yet — illustration shown until brand assets arrive
    gallery: [],
    photoCredit: null,
    colours: [
      { name: 'Provence', hex: '#8b8fb8' },
      { name: 'Papaya Metallic', hex: '#d9772b' },
      { name: 'Ice Grey Metallic', hex: '#c9ccd0' },
      { name: 'Volcano Grey Metallic', hex: '#55595e' },
    ],
    specs: {
      Battery: '100 kWh',
      Power: '402 – 608 bhp',
      Range: 'Up to 624 km',
      'DC charging': '10–80% in ~21 min',
      'AC charging': '11 kW · ~10 h',
      Drive: 'RWD / AWD',
      Seating: '5',
      Boot: '540 L',
    },
    features: ['800-volt architecture', 'Rear-axle steering', 'AR head-up display', 'Passenger display', 'Adaptive air suspension', '8 airbags'],
    variants: [
      { id: 'macan-ev', name: 'Macan Electric', price: 12200000, fuel: 'Electric', transmission: 'Automatic' },
      { id: 'macan-4s', name: 'Macan 4S Electric', price: 15800000, fuel: 'Electric', transmission: 'Automatic' },
      { id: 'macan-turbo', name: 'Macan Turbo Electric', price: 17300000, fuel: 'Electric', transmission: 'Automatic' },
    ],
  },
  {
    slug: 'panamera',
    name: 'Panamera',
    category: 'Gran Turismo',
    shape: 'sedan',
    tagline: 'Four doors. No compromise.',
    description:
      'The luxury sports saloon, from the efficient hybrid to the 480 PS twin-turbo V8 GTS — long-distance comfort with sports-car dynamics.',
    isNew: false,
    featured: false,
    image: img('1601929862217-f1bf94503333'),
    gallery: [img('1601929862217-f1bf94503333'), img('1611157816410-6a6b31ee255e')],
    photoCredit: 'Peter Miranda / Unsplash',
    colours: [
      { name: 'Jet Black Metallic', hex: '#17191c' },
      { name: 'Carrara White Metallic', hex: '#eeeeea' },
      { name: 'Madeira Gold Metallic', hex: '#9a7a52' },
    ],
    specs: {
      Engine: '2.9L V6 hybrid / 4.0L V8',
      Power: '353 – 480 PS',
      Torque: '500 – 620 Nm',
      '0–100 km/h': 'From 3.9 s',
      'Top speed': 'Up to 302 km/h',
      Transmission: '8-speed PDK',
      Seating: '4 (5 optional)',
      Drive: 'RWD / AWD',
    },
    features: ['Porsche Active Ride', 'Four-zone climate', 'Bose surround sound', 'Passenger display', 'Massage seats', 'Night vision assist'],
    variants: [
      { id: 'panamera-hybrid', name: 'Panamera Hybrid', price: 17100000, fuel: 'Petrol hybrid', transmission: 'PDK' },
      { id: 'panamera-gts', name: 'Panamera GTS', price: 23300000, fuel: 'Petrol', transmission: 'PDK' },
    ],
  },
];

export const interiorImage = img('1563156454-0be991636c70');

export const getModel = (slug) => models.find((m) => m.slug === slug);
export const startingPrice = (m) => Math.min(...m.variants.map((v) => v.price));
export const allVariants = models.flatMap((m) => m.variants.map((v) => ({ ...v, model: m.name, slug: m.slug })));
export const variantById = (id) => allVariants.find((v) => v.id === id);

export const offers = [
  {
    id: 'off-1',
    title: 'Complimentary Home Charging',
    models: ['Taycan', 'Macan Electric'],
    benefit: '22 kW wallbox included',
    description: 'A home charger with standard installation on every electric model booked this quarter.',
    validTill: '2026-12-31',
    terms: 'Installation within city limits. Site survey required.',
  },
  {
    id: 'off-2',
    title: 'Exchange Advantage',
    models: ['Cayenne', 'Panamera'],
    benefit: 'Up to ₹5,00,000 bonus',
    description: 'An additional exchange bonus over market value when you trade in your current car.',
    validTill: '2026-11-30',
    terms: 'Subject to vehicle evaluation. Cannot be combined with corporate offers.',
  },
  {
    id: 'off-3',
    title: 'Extended Warranty',
    models: ['911'],
    benefit: '2 extra years',
    description: 'Factory-backed extended warranty for 4 years in total on new 911 bookings.',
    validTill: '2026-12-31',
    terms: 'Registration within offer period required.',
  },
  {
    id: 'off-4',
    title: 'Service Package',
    models: ['Cayenne', 'Macan Electric', 'Panamera'],
    benefit: '3 years scheduled service',
    description: 'Scheduled maintenance labour and consumables covered for 3 years.',
    validTill: '2026-12-31',
    terms: 'Covers scheduled labour and consumables only.',
  },
];
