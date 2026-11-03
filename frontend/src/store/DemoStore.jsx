// In-browser demo store. Website form submissions flow into the dashboard
// through this store, so the demo shows the end-to-end enquiry -> lead flow.
// Data is kept in localStorage; "Reset demo data" restores the seed.
// When the Django/DRF API is ready, these functions become API calls.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as seed from '../data/seed';
import { defaultAutomations, onEvent, runScheduled } from './automation';

const KEY = 'porsche-demo-v3';
const Ctx = createContext(null);

export const defaultSettings = {
  discountLimit: 300000, // discounts above this need manager approval
  quoteValidityDays: 15,
  gstRate: 0.28,
  cessRate: 0.22,
  registrationCharges: 1800000,
  bookingAmount: 1000000,
  channels: { email: true, sms: true, whatsapp: true },
  timeSlots: seed.timeSlots,
};

const initial = () => ({
  customers: seed.seedCustomers,
  leads: seed.seedLeads,
  testDrives: seed.seedTestDrives,
  inventory: seed.seedInventory,
  quotations: seed.seedQuotations,
  bookings: seed.seedBookings,
  payments: seed.seedPayments,
  services: seed.seedServices,
  customerVehicles: seed.seedCustomerVehicles,
  tasks: seed.seedTasks,
  audit: seed.seedAudit,
  enquiries: [],
  settings: defaultSettings,
  automations: defaultAutomations,
  messages: [],
  autoLog: [],
  autoDone: {},
  digest: null,
  notifications: [
    { id: 1, text: '3 test drive requests are awaiting approval', when: 'Today', read: false },
    { id: 2, text: 'QT-4101 needs discount approval', when: 'Today', read: false },
  ],
  counter: 100,
});

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return initial();
};

export const modules = ['overview', 'leads', 'customers', 'testdrives', 'inventory', 'quotations', 'bookings', 'payments', 'service', 'tasks', 'reports', 'automations', 'employees', 'settings'];

export const roles = {
  'Super Admin': modules,
  'Dealership Manager': modules.filter((m) => m !== 'settings'),
  'Sales Manager': ['overview', 'leads', 'customers', 'testdrives', 'inventory', 'quotations', 'bookings', 'tasks', 'reports', 'automations'],
  'Sales Executive': ['overview', 'leads', 'customers', 'testdrives', 'quotations', 'bookings', 'tasks'],
  'Inventory Manager': ['overview', 'inventory', 'bookings', 'tasks'],
  'Service Manager': ['overview', 'customers', 'service', 'tasks', 'reports'],
  'Service Advisor': ['overview', 'customers', 'service', 'tasks'],
  Accountant: ['overview', 'bookings', 'payments', 'reports'],
};

const stamp = () => {
  const d = new Date();
  return `${seed.iso(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export function DemoStoreProvider({ children }) {
  const [db, setDb] = useState(load);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(KEY + '-user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* ignore */
    }
  }, [db]);
  // Scheduled automations: run on load and every minute (Celery beat in the real backend)
  useEffect(() => {
    setDb((d) => runScheduled(d));
    const t = setInterval(() => setDb((d) => runScheduled(d)), 60000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY + '-user', JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }, [user]);

  const api = useMemo(() => {
    const today = seed.iso(new Date());
    const who = user?.name || 'Website';
    const log = (d, action, record) => ({ ...d, audit: [{ id: Date.now() + Math.random(), when: stamp(), who, action, record }, ...d.audit] });
    const notify = (d, text) => ({ ...d, notifications: [{ id: Date.now() + Math.random(), text, when: 'Just now', read: false }, ...d.notifications] });
    const num = (d) => String(d.counter + 1).padStart(4, '0');

    // Find a customer by mobile/email or create a new one (PRD 6.2: create or match)
    const matchOrCreate = (d, form) => {
      const existing = d.customers.find((c) => c.mobile === form.mobile || (form.email && c.email === form.email));
      if (existing) return { d, customer: existing };
      const customer = {
        id: `CUS-${String(d.customers.length + 1001).padStart(4, '0')}`,
        name: form.name,
        mobile: form.mobile,
        email: form.email || '',
        address: form.address || '—',
        registered: today,
        contactPref: form.contactPref || 'Phone',
        interested: form.model ? [form.model] : [],
        budget: form.budget || '—',
        timeline: form.timeline || '—',
        owner: form.owner || null,
        status: 'Prospect',
        fresh: true,
      };
      return { d: { ...d, customers: [customer, ...d.customers] }, customer };
    };

    const addLead = (d, customer, form, source) => {
      const lead = {
        id: `LD-${2201 + d.leads.length}`,
        customerId: customer.id,
        customer: customer.name,
        mobile: customer.mobile,
        model: form.model || '—',
        variant: form.variant || '—',
        source,
        budget: customer.budget,
        timeline: customer.timeline,
        owner: form.owner || null,
        priority: form.priority || 'Medium',
        status: form.owner ? 'Assigned' : 'New',
        created: today,
        nextFollowUp: today,
        notes: form.message || '',
        fresh: true,
      };
      return { ...d, leads: [lead, ...d.leads] };
    };

    // Website form submissions
    const submit = (kind, form) => {
      const prefix = { testdrive: 'TD', quote: 'RQ', service: 'SR' }[kind] || 'EQ';
      const ref = `${prefix}-${num(db)}`;
      setDb((prev) => {
        let { d, customer } = matchOrCreate({ ...prev, counter: prev.counter + 1 }, form);
        const leadId = `LD-${2201 + d.leads.length}`;
        if (kind === 'testdrive') {
          const td = { id: ref, customerId: customer.id, customer: customer.name, mobile: customer.mobile, model: form.model, variant: form.variant, date: form.date, slot: form.slot, status: 'Requested', vehicleId: null, executive: null, feedback: '', source: 'Website', message: form.message, fresh: true };
          d = { ...d, testDrives: [td, ...d.testDrives] };
          d = addLead(d, customer, form, 'Test Drive Request');
          d = notify(d, `New test drive request ${ref} from ${customer.name} (${form.model})`);
        } else if (kind === 'service') {
          const sv = { id: ref, jobCard: null, customerId: customer.id, customer: customer.name, vehicle: `${form.model} · ${form.registration || 'Reg. pending'}`, type: form.serviceType, date: form.date, advisor: 'Unassigned', complaint: form.message || form.serviceType, estimate: 0, status: 'Requested', fresh: true };
          d = { ...d, services: [sv, ...d.services] };
          d = notify(d, `New service request ${ref} from ${customer.name} (${form.model})`);
          d = onEvent(d, 'service.requested', { id: ref });
        } else {
          d = { ...d, enquiries: [{ id: ref, kind, ...form, customerId: customer.id, date: today }, ...d.enquiries] };
          d = addLead(d, customer, form, kind === 'quote' ? 'Quotation Request' : 'Website Enquiry');
          d = notify(d, `New ${kind === 'quote' ? 'quotation request' : 'website enquiry'} ${ref} from ${customer.name}`);
        }
        if (kind !== 'service') d = onEvent(d, 'lead.created', { leadId, ref });
        return log(d, `Website ${kind} submitted`, ref);
      });
      return ref;
    };

    const update = (collection, id, patch, action) =>
      setDb((d) => {
        const before = d[collection].find((r) => r.id === id);
        const next = { ...d, [collection]: d[collection].map((r) => (r.id === id ? { ...r, ...patch, fresh: false } : r)) };
        const desc = action || (patch.status && before?.status !== patch.status ? `Status ${before?.status} → ${patch.status}` : `Updated ${Object.keys(patch).join(', ')}`);
        let out = log(next, desc, id);
        if (collection === 'leads') out.leads = out.leads.map((l) => (l.id === id ? { ...l, lastActivity: today } : l));
        const statusChanged = patch.status && before?.status !== patch.status;
        const ev = { testDrives: 'testdrive.status', quotations: 'quotation.status', services: 'service.status' }[collection];
        if (ev && statusChanged) out = onEvent(out, ev, { id, from: before?.status, to: patch.status });
        if (collection === 'testDrives' && !statusChanged && before?.status === 'Confirmed' && (patch.date !== before.date || patch.slot !== before.slot) && (patch.date || patch.slot))
          out = onEvent(out, 'testdrive.rescheduled', { id });
        return out;
      });

    // Generic create used by dashboard "New ..." forms
    const create = (collection, prefix, record, action) => {
      const id = `${prefix}-${num(db)}`;
      setDb((d) => {
        let out = log({ ...d, counter: d.counter + 1, [collection]: [{ id, ...record, fresh: true }, ...d[collection]] }, action || `Created ${prefix}`, id);
        if (collection === 'quotations' && record.status === 'Pending Approval') out = onEvent(out, 'quotation.status', { id, to: 'Pending Approval' });
        if (collection === 'services' && record.status === 'Confirmed') out = onEvent(out, 'service.status', { id, to: 'Confirmed' });
        return out;
      });
      return id;
    };

    const createLead = (form) => {
      const id = `LD-${2201 + db.leads.length}`;
      setDb((prev) => {
        let { d, customer } = matchOrCreate(prev, form);
        d = addLead(d, customer, form, form.source);
        d = onEvent(d, 'lead.created', { leadId: id, ref: id });
        return log(d, `Created lead (${form.source})`, id);
      });
      return id;
    };

    const createCustomer = (form) => {
      const existing = db.customers.find((c) => c.mobile === form.mobile || (form.email && c.email === form.email));
      const id = existing?.id || `CUS-${String(db.customers.length + 1001).padStart(4, '0')}`;
      setDb((prev) => {
        const { d } = matchOrCreate(prev, form);
        return log(d, existing ? 'Matched existing customer' : 'Created customer', id);
      });
      return { id, existing: !!existing };
    };

    const addPayment = (bookingId, p) =>
      setDb((d) => {
        const b = d.bookings.find((x) => x.id === bookingId);
        const amount = p.type === 'Refund' ? -Math.abs(p.amount) : Math.abs(p.amount);
        const pay = { id: `PAY-${num(d)}`, bookingId, customer: b.customer, date: today, verified: false, ...p, amount };
        let next = { ...d, counter: d.counter + 1, payments: [pay, ...d.payments], bookings: d.bookings.map((x) => (x.id === bookingId ? { ...x, paid: x.paid + amount } : x)) };
        next = notify(next, `Payment of ₹${Math.abs(amount).toLocaleString('en-IN')} recorded on ${bookingId}`);
        next = onEvent(next, 'payment.added', { bookingId, amount, ref: p.ref });
        return log(next, `${p.type} ₹${Math.abs(amount).toLocaleString('en-IN')} (${p.method})`, bookingId);
      });

    // Accepted quotation -> purchase booking, reserving a matching available vehicle
    const convertQuote = (q) => {
      const id = `BK-${num(db)}`;
      setDb((d) => {
        const veh = d.inventory.find((v) => v.variant === q.variant && v.status === 'Available' && !v.testDrive);
        const booking = {
          id, customerId: q.customerId, customer: q.customer, model: q.model, variant: q.variant, vehicleId: veh?.id || null, vin: veh?.vin || 'To be allocated',
          bookingAmount: d.settings.bookingAmount, total: q.total, paid: 0, expectedDelivery: seed.dayOffset(veh ? 14 : 45),
          status: veh ? 'Pending Approval' : 'Vehicle Awaited', docs: 'Pending KYC', executive: q.preparedBy, quotationId: q.id, fresh: true,
        };
        let next = { ...d, counter: d.counter + 1, bookings: [booking, ...d.bookings], quotations: d.quotations.map((x) => (x.id === q.id ? { ...x, status: 'Accepted', bookingId: id } : x)) };
        if (veh) next.inventory = next.inventory.map((v) => (v.id === veh.id ? { ...v, status: 'Reserved' } : v));
        next = onEvent(next, 'booking.created', { id });
        return log(next, `Converted ${q.id} to booking${veh ? `, reserved ${veh.id}` : ''}`, id);
      });
      return id;
    };

    // Cancelling a booking releases its vehicle (PRD rule 19)
    const cancelBooking = (b) =>
      setDb((d) =>
        log(
          {
            ...d,
            bookings: d.bookings.map((x) => (x.id === b.id ? { ...x, status: 'Cancelled' } : x)),
            inventory: d.inventory.map((v) => (v.id === b.vehicleId && ['Reserved', 'Allocated'].includes(v.status) ? { ...v, status: 'Available' } : v)),
          },
          `Cancelled booking${b.vehicleId ? `, released ${b.vehicleId}` : ''}`,
          b.id,
        ),
      );

    // Delivery: booking delivered, vehicle delivered, added to customer ownership
    const deliver = (b) =>
      setDb((d) => {
        const cv = { id: `CV-${num(d)}`, customerId: b.customerId, customer: b.customer, model: b.model, registration: 'TN 09 Reg. pending', vin: b.vin, purchased: today, warrantyTill: seed.dayOffset(730), lastService: null, fresh: true };
        const next = {
          ...d,
          counter: d.counter + 1,
          bookings: d.bookings.map((x) => (x.id === b.id ? { ...x, status: 'Delivered' } : x)),
          inventory: d.inventory.map((v) => (v.id === b.vehicleId ? { ...v, status: 'Delivered' } : v)),
          customerVehicles: [cv, ...d.customerVehicles],
          customers: d.customers.map((c) => (c.id === b.customerId ? { ...c, status: 'Customer' } : c)),
        };
        return log(onEvent(notify(next, `${b.customer}'s ${b.variant} delivered`), 'booking.delivered', { id: b.id }), 'Vehicle delivered, ownership record created', b.id);
      });

    // PRD 6.4 business rules: no overlapping vehicle or employee bookings
    const testDriveConflict = (td, vehicleId, executive) => {
      const active = ['Confirmed', 'Assigned', 'In Progress'];
      return db.testDrives.find(
        (x) => x.id !== td.id && active.includes(x.status) && x.date === td.date && x.slot === td.slot && ((vehicleId && x.vehicleId === vehicleId) || (executive && x.executive === executive)),
      );
    };

    return {
      submit,
      update,
      create,
      createLead,
      createCustomer,
      addPayment,
      convertQuote,
      cancelBooking,
      deliver,
      testDriveConflict,
      runAutomationsNow: () => setDb((d) => runScheduled({ ...d, autoDone: {} })),
      toggleAutomation: (key) => setDb((d) => log({ ...d, automations: { ...d.automations, [key]: d.automations?.[key] === false } }, `${d.automations?.[key] === false ? 'Enabled' : 'Disabled'} automation ${key}`, 'Automations')),
      saveSettings: (s) => setDb((d) => log({ ...d, settings: { ...d.settings, ...s } }, 'Updated settings', 'Settings')),
      markAllRead: () => setDb((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })),
      reset: () => setDb(initial()),
      login: (name, role) => setUser({ name, role }),
      logout: () => setUser(null),
    };
  }, [db, user]);

  return <Ctx.Provider value={{ db, user, can: (m) => !!user && roles[user.role]?.includes(m), ...api }}>{children}</Ctx.Provider>;
}

export const useDemo = () => useContext(Ctx);
