// Stylised vehicle side-profile illustrations (no external images needed).
// Swap for real photography once the brand assets are available.
const shapes = {
  hatch: {
    body: 'M46,118 C44,104 52,95 70,93 L112,88 C130,66 152,50 186,48 L276,48 C296,50 312,66 330,96 L346,100 C354,104 357,110 357,118 L357,124 L46,124 Z',
    glass: 'M124,88 C140,70 158,57 186,56 L272,56 C288,57 300,70 314,92 Z',
    pillar: 'M222,56 L218,90',
    wheels: [108, 300],
  },
  sedan: {
    body: 'M22,116 C22,104 30,96 52,94 L112,88 C134,72 164,54 204,52 L252,52 C284,54 306,70 324,88 L362,94 C378,96 384,104 384,114 L384,124 L22,124 Z',
    glass: 'M128,88 C148,72 170,60 204,59 L250,59 C274,60 292,72 306,88 Z',
    pillar: 'M222,59 L220,88',
    wheels: [92, 318],
  },
  suv: {
    body: 'M20,116 C20,100 28,88 50,86 L98,82 C114,60 132,42 168,40 L300,40 C318,42 332,58 342,82 L366,86 C380,88 386,98 386,112 L386,124 L20,124 Z',
    glass: 'M112,82 C126,62 142,48 168,47 L296,47 C310,48 320,62 328,82 Z',
    pillar: 'M232,47 L230,82',
    wheels: [94, 320],
  },
  ev: {
    body: 'M24,116 C24,102 32,92 54,90 L106,85 C126,64 150,46 190,44 L268,44 C300,46 322,64 340,86 L364,90 C378,92 384,102 384,114 L384,124 L24,124 Z',
    glass: 'M120,85 C138,66 158,52 190,51 L266,51 C292,52 310,66 324,85 Z',
    pillar: 'M228,51 L226,85',
    wheels: [96, 318],
  },
  mpv: {
    body: 'M24,116 C24,98 30,86 50,84 L86,80 C98,56 118,36 160,34 L324,34 C342,36 354,54 362,84 L374,88 C384,92 388,100 388,112 L388,124 L24,124 Z',
    glass: 'M100,80 C112,58 128,42 160,41 L320,41 C334,42 342,58 348,80 Z',
    pillar: 'M210,41 L208,80 M276,41 L276,80',
    wheels: [96, 326],
  },
};

let uid = 0;

export default function CarArt({ shape = 'sedan', color = '#9aa3ad', className = '', glow = true }) {
  const s = shapes[shape] || shapes.sedan;
  const id = `car${++uid}`;
  return (
    <svg className={className} viewBox="0 0 400 160" role="img" aria-label={`${shape} illustration`}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="1" />
          <stop offset="0.55" stopColor={color} stopOpacity="0.92" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dfe8f0" stopOpacity="0.75" />
          <stop offset="1" stopColor="#1c2530" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id={`${id}s`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <ellipse cx="204" cy="140" rx="190" ry="12" fill={`url(#${id}s)`} />}
      <path d={s.body} fill={`url(#${id}b)`} />
      <path d={s.body} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />
      <path d={s.glass} fill={`url(#${id}g)`} />
      <path d={s.pillar} stroke={color} strokeWidth="5" />
      <path d="M40,106 L380,104" stroke="#fff" strokeOpacity="0.12" strokeWidth="1.5" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="124" r="22" fill="#101215" />
          <circle cx={x} cy="124" r="13" fill="#2c3036" stroke="#8a9099" strokeWidth="2" />
          <circle cx={x} cy="124" r="3.5" fill="#c2c7cd" />
        </g>
      ))}
    </svg>
  );
}
