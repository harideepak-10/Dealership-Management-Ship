// Brand & dealership configuration.
// The PRD keeps the brand configurable: change the values here to re-skin the demo.
// Concept demo: the dealership below is fictional and not affiliated with Porsche AG.
export const brand = {
  name: 'Porsche',
  tagline: 'Performance, every single day.',
  dealership: 'Coastal Motors Chennai',
  city: 'Chennai',
  address: '42, Anna Salai, Teynampet, Chennai, Tamil Nadu 600018',
  phone: '+91 44 4000 1234',
  whatsapp: '914440001234',
  email: 'hello@coastalmotors.in',
  hours: [
    { day: 'Mon – Sat', time: '9:30 AM – 8:00 PM' },
    { day: 'Sunday', time: '10:00 AM – 6:00 PM' },
  ],
  accent: '#c8102e',
  currency: 'INR',
  disclaimer: 'Concept demo · not affiliated with or endorsed by Porsche AG',
};

export const formatINR = (n) =>
  n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const formatLakh = (n) => {
  if (n == null) return '—';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
  return '₹' + (n / 100000).toFixed(2) + ' L';
};
