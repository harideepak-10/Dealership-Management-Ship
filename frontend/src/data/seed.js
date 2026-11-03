// Sample records for the static demo. Generated deterministically, with dates
// relative to "today" so the dashboard always looks current.
import { models, allVariants } from './models';

let s = 42;
const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const pad = (n, l = 4) => String(n).padStart(l, '0');

export const iso = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1, 2)}-${pad(x.getDate(), 2)}`;
};
export const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const employees = [
  { id: 'E01', name: 'Vikram Rao', role: 'Dealership Manager', dept: 'Management' },
  { id: 'E02', name: 'Divya Nair', role: 'Sales Manager', dept: 'Sales' },
  { id: 'E03', name: 'Arjun Mehta', role: 'Sales Executive', dept: 'Sales' },
  { id: 'E04', name: 'Priya Raman', role: 'Sales Executive', dept: 'Sales' },
  { id: 'E05', name: 'Karthik Subramani', role: 'Sales Executive', dept: 'Sales' },
  { id: 'E06', name: 'Sanjay Pillai', role: 'Inventory Manager', dept: 'Inventory' },
  { id: 'E07', name: 'Lakshmi Iyer', role: 'Service Manager', dept: 'Service' },
  { id: 'E08', name: 'Rahul Krishnan', role: 'Service Advisor', dept: 'Service' },
  { id: 'E09', name: 'Meena Kumari', role: 'Accountant', dept: 'Accounts' },
  { id: 'E00', name: 'Admin', role: 'Super Admin', dept: 'IT' },
];
export const salesExecs = employees.filter((e) => e.role === 'Sales Executive');

const first = ['Aarav', 'Ananya', 'Rohan', 'Kavya', 'Siddharth', 'Meera', 'Vivek', 'Nisha', 'Harish', 'Pooja', 'Ganesh', 'Sneha', 'Ashwin', 'Revathi', 'Manoj', 'Deepa', 'Suresh', 'Janani', 'Prakash', 'Ishita', 'Naveen', 'Keerthana', 'Bala', 'Shruti', 'Ramesh', 'Aditi', 'Varun', 'Swathi', 'Gokul', 'Divya'];
const last = ['Sharma', 'Iyer', 'Menon', 'Reddy', 'Natarajan', 'Kapoor', 'Pillai', 'Rajan', 'Shetty', 'Das', 'Kumar', 'Venkat', 'Joseph', 'Bose', 'Murthy'];
const areas = ['Adyar', 'Velachery', 'Anna Nagar', 'T. Nagar', 'OMR', 'Tambaram', 'Porur', 'Mylapore', 'Besant Nagar', 'Guindy'];

export const leadStatuses = ['New', 'Assigned', 'Contacted', 'Interested', 'Follow-up Required', 'Test Drive Scheduled', 'Quotation Sent', 'Negotiation', 'Converted', 'Lost', 'Not Interested'];
export const leadSources = ['Website Enquiry', 'Test Drive Request', 'Quotation Request', 'Phone Call', 'Walk-in', 'WhatsApp', 'Referral'];
export const testDriveStatuses = ['Requested', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rejected', 'No Show'];
export const timeSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

// Customers
export const seedCustomers = Array.from({ length: 36 }, (_, i) => {
  const name = `${pick(first)} ${pick(last)}`;
  const model = pick(models);
  return {
    id: `CUS-${pad(1001 + i)}`,
    name,
    mobile: `9${Math.floor(100000000 + rnd() * 899999999)}`,
    email: name.toLowerCase().replace(' ', '.') + '@example.com',
    address: `${Math.ceil(rnd() * 120)}, ${pick(areas)}, Chennai`,
    registered: dayOffset(-Math.floor(rnd() * 160)),
    contactPref: pick(['Phone', 'WhatsApp', 'Email']),
    interested: [model.name],
    budget: pick(['₹1–1.5 Cr', '₹1.5–2 Cr', '₹2–2.5 Cr', '₹2.5–3 Cr', '₹3 Cr+']),
    timeline: pick(['Immediate', 'Within 1 month', '1–3 months', '3+ months']),
    owner: pick(salesExecs).name,
    status: pick(['Prospect', 'Prospect', 'Active', 'Customer', 'Inactive']),
  };
});

// Leads (one per customer for the first 32)
export const seedLeads = seedCustomers.slice(0, 32).map((c, i) => {
  const model = models.find((m) => m.name === c.interested[0]);
  const status = pick(leadStatuses);
  return {
    id: `LD-${pad(2201 + i)}`,
    customerId: c.id,
    customer: c.name,
    mobile: c.mobile,
    model: model.name,
    variant: pick(model.variants).name,
    source: pick(leadSources),
    budget: c.budget,
    timeline: c.timeline,
    owner: status === 'New' ? null : c.owner,
    priority: pick(['High', 'Medium', 'Medium', 'Low']),
    status,
    created: dayOffset(-Math.floor(rnd() * 45)),
    nextFollowUp: ['Converted', 'Lost', 'Not Interested'].includes(status) ? null : dayOffset(Math.floor(rnd() * 10) - 4),
    lostReason: status === 'Lost' ? pick(['Bought competitor', 'Budget constraint', 'Delayed purchase']) : null,
    notes: '',
  };
});

// Inventory: individual physical vehicles (VIN-level)
const locations = ['Showroom Floor', 'Stockyard A', 'Stockyard B', 'Test Drive Fleet'];
export const seedInventory = Array.from({ length: 30 }, (_, i) => {
  const v = allVariants[i % allVariants.length];
  const m = models.find((x) => x.slug === v.slug);
  const isFleet = [0, 4, 7, 9, 12].includes(i); // one test-drive car per model
  return {
    id: `VEH-${pad(5001 + i)}`,
    vin: `MA1SL${String.fromCharCode(65 + (i % 26))}${pad(Math.floor(rnd() * 99999999), 8)}${pad(i, 4)}`,
    model: m.name,
    variant: v.name,
    colour: pick(m.colours).name,
    year: 2026,
    acquired: dayOffset(-Math.floor(rnd() * 120)),
    source: pick(['Factory allocation', 'Factory allocation', 'Dealer transfer']),
    cost: Math.round(v.price * 0.88),
    price: v.price,
    location: isFleet ? 'Test Drive Fleet' : pick(locations.slice(0, 3)),
    status: isFleet ? 'Available' : pick(['Available', 'Available', 'Available', 'Reserved', 'Allocated', 'In Transit', 'Sold']),
    testDrive: isFleet,
  };
});
const fleet = seedInventory.filter((v) => v.testDrive);

// Test drives around today
export const seedTestDrives = Array.from({ length: 22 }, (_, i) => {
  const c = seedCustomers[i + 4];
  const off = i < 4 ? 0 : Math.floor(rnd() * 14) - 7; // a few always fall on today
  const status =
    off < 0 ? pick(['Completed', 'Completed', 'Completed', 'No Show', 'Cancelled']) : off === 0 ? pick(['Confirmed', 'Assigned', 'In Progress']) : pick(['Requested', 'Requested', 'Confirmed', 'Assigned']);
  const car = fleet[i % fleet.length];
  return {
    id: `TD-${pad(3101 + i)}`,
    customerId: c.id,
    customer: c.name,
    mobile: c.mobile,
    model: car.model,
    variant: car.variant,
    date: dayOffset(off),
    slot: timeSlots[i % timeSlots.length],
    status,
    vehicleId: status === 'Requested' ? null : car.id,
    executive: status === 'Requested' ? null : pick(salesExecs).name,
    feedback: status === 'Completed' ? pick(['Loved the ride quality', 'Wants to compare with rival', 'Asked about finance options', 'Ready for quotation']) : '',
    source: 'Website',
  };
});

// Quotations
export const quotationStatuses = ['Draft', 'Pending Approval', 'Approved', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Expired'];
export const seedQuotations = Array.from({ length: 14 }, (_, i) => {
  const c = seedCustomers[i * 2];
  const v = pick(allVariants);
  const accessories = pick([0, 150000, 320000, 480000]);
  const discount = pick([0, 100000, 250000, 400000, 600000]);
  const tax = Math.round(v.price * 0.28);
  const charges = 1800000; // registration, insurance + handling
  return {
    id: `QT-${pad(4101 + i)}`,
    customerId: c.id,
    customer: c.name,
    model: v.model,
    variant: v.name,
    base: v.price,
    tax,
    charges,
    accessories,
    discount,
    total: v.price + tax + charges + accessories - discount,
    validTill: dayOffset(Math.floor(rnd() * 20) - 3),
    preparedBy: pick(salesExecs).name,
    status: discount > 300000 && i % 3 === 0 ? 'Pending Approval' : pick(quotationStatuses),
    version: pick([1, 1, 2, 3]),
  };
});

// Purchase bookings
export const bookingStatuses = ['Draft', 'Pending Approval', 'Confirmed', 'Vehicle Awaited', 'Vehicle Allocated', 'Documentation Pending', 'Ready for Delivery', 'Delivered', 'Cancelled'];
const allocatable = seedInventory.filter((v) => v.status === 'Allocated' || v.status === 'Reserved');
export const seedBookings = Array.from({ length: 10 }, (_, i) => {
  const c = seedCustomers[i * 3 + 1];
  const veh = allocatable[i % Math.max(allocatable.length, 1)];
  const total = veh ? Math.round(veh.price * 1.3) : 25000000;
  const paid = Math.round(total * pick([0.05, 0.2, 0.5, 0.8, 1]));
  return {
    id: `BK-${pad(6101 + i)}`,
    customerId: c.id,
    customer: c.name,
    model: veh?.model,
    variant: veh?.variant,
    vehicleId: veh?.id,
    vin: veh?.vin,
    bookingAmount: 1000000,
    total,
    paid,
    expectedDelivery: dayOffset(Math.floor(rnd() * 30) + 2),
    status: pick(bookingStatuses.slice(1, 8)),
    docs: pick(['Complete', 'Pending KYC', 'Pending insurance', 'Pending registration']),
    executive: pick(salesExecs).name,
  };
});

// Service appointments / job cards
export const serviceStatuses = ['Requested', 'Confirmed', 'Vehicle Received', 'Inspection', 'Job Card Created', 'In Progress', 'Quality Check', 'Payment Pending', 'Completed', 'Vehicle Delivered', 'Cancelled'];
export const seedServices = Array.from({ length: 14 }, (_, i) => {
  const c = seedCustomers[35 - i];
  const m = pick(models);
  return {
    id: `SV-${pad(7101 + i)}`,
    jobCard: i % 3 === 0 ? null : `JC-${pad(8101 + i)}`,
    customerId: c.id,
    customer: c.name,
    vehicle: `${m.name} · TN ${pad(Math.ceil(rnd() * 99), 2)} ${pick(['AB', 'CK', 'DZ', 'BM'])} ${pad(Math.floor(rnd() * 9999))}`,
    type: pick(['Periodic service', 'Periodic service', 'Repair', 'Warranty', 'Accident repair', 'Inspection']),
    date: dayOffset(Math.floor(rnd() * 12) - 5),
    advisor: 'Rahul Krishnan',
    complaint: pick(['Brake noise', 'AC not cooling', 'Annual service', 'PCM software update', 'Wheel alignment', 'Brake pad replacement']),
    estimate: pick([45000, 82000, 125000, 189000, 260000]),
    status: pick(serviceStatuses.slice(0, 10)),
  };
});

// Historical monthly sales for charts (units)
export const monthlySales = [
  { month: 'Jun', units: 9, revenue: 17.2 },
  { month: 'Jul', units: 11, revenue: 21.5 },
  { month: 'Aug', units: 10, revenue: 19.8 },
  { month: 'Sep', units: 13, revenue: 26.4 },
  { month: 'Oct', units: 17, revenue: 34.9 },
  { month: 'Nov', units: 5, revenue: 9.6 },
];

export const recentActivity = [
  { who: 'Priya Raman', what: 'sent quotation QT-4106 to Kavya Menon', when: '12 min ago' },
  { who: 'Divya Nair', what: 'approved discount on QT-4104', when: '40 min ago' },
  { who: 'Arjun Mehta', what: 'completed test drive TD-3105 (Cayenne GTS)', when: '1 hr ago' },
  { who: 'Meena Kumari', what: 'recorded ₹25,00,000 payment on BK-6103', when: '2 hr ago' },
  { who: 'Rahul Krishnan', what: 'created job card JC-8102', when: '3 hr ago' },
  { who: 'Sanjay Pillai', what: 'added 4 vehicles to Stockyard A', when: 'Yesterday' },
];
