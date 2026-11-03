// In-browser demo store. Website form submissions flow into the dashboard
// through this store, so the demo shows the end-to-end enquiry -> lead flow.
// Data is kept in localStorage; "Reset demo data" restores the seed.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as seed from '../data/seed';

const KEY = 'solenne-demo-v1';
const Ctx = createContext(null);

const initial = () => ({
  customers: seed.seedCustomers,
  leads: seed.seedLeads,
  testDrives: seed.seedTestDrives,
  inventory: seed.seedInventory,
  quotations: seed.seedQuotations,
  bookings: seed.seedBookings,
  services: seed.seedServices,
  enquiries: [],
  notifications: [
    { id: 1, text: '3 test drive requests are awaiting approval', when: 'Today', read: false },
    { id: 2, text: 'QT-4101 needs discount approval', when: 'Today', read: false },
  ],
  counter: 100,
});

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return initial();
};

export const roles = {
  'Super Admin': ['overview', 'leads', 'customers', 'testdrives', 'inventory', 'quotations', 'bookings', 'payments', 'service', 'employees', 'reports'],
  'Dealership Manager': ['overview', 'leads', 'customers', 'testdrives', 'inventory', 'quotations', 'bookings', 'payments', 'service', 'employees', 'reports'],
  'Sales Manager': ['overview', 'leads', 'customers', 'testdrives', 'inventory', 'quotations', 'bookings', 'reports'],
  'Sales Executive': ['overview', 'leads', 'customers', 'testdrives', 'quotations', 'bookings'],
  'Inventory Manager': ['overview', 'inventory', 'bookings'],
  'Service Manager': ['overview', 'customers', 'service', 'reports'],
  'Service Advisor': ['overview', 'customers', 'service'],
  Accountant: ['overview', 'bookings', 'payments', 'reports'],
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
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY + '-user', JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }, [user]);

  const api = useMemo(() => {
    const today = seed.iso(new Date());

    // Find a customer by mobile/email or create a new one (PRD 6.2: create or match)
    const matchOrCreate = (d, form) => {
      const existing = d.customers.find((c) => c.mobile === form.mobile || (form.email && c.email === form.email));
      if (existing) return { d, customer: existing, matched: true };
      const n = d.customers.length + 1001;
      const customer = {
        id: `CUS-${String(n).padStart(4, '0')}`,
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        address: '—',
        registered: today,
        contactPref: form.contactPref || 'Phone',
        interested: [form.model],
        budget: '—',
        timeline: '—',
        owner: null,
        status: 'Prospect',
      };
      return { d: { ...d, customers: [customer, ...d.customers] }, customer, matched: false };
    };

    const addLead = (d, customer, form, source) => {
      const lead = {
        id: `LD-${2201 + d.leads.length}`,
        customerId: customer.id,
        customer: customer.name,
        mobile: customer.mobile,
        model: form.model,
        variant: form.variant || '—',
        source,
        budget: customer.budget,
        timeline: customer.timeline,
        owner: null,
        priority: 'Medium',
        status: 'New',
        created: today,
        nextFollowUp: today,
        notes: form.message || '',
        fresh: true,
      };
      return { ...d, leads: [lead, ...d.leads] };
    };

    const notify = (d, text) => ({
      ...d,
      notifications: [{ id: Date.now(), text, when: 'Just now', read: false }, ...d.notifications],
    });

    const submit = (kind, form) => {
      const prefix = kind === 'testdrive' ? 'TD' : kind === 'quote' ? 'RQ' : 'EQ';
      const ref = `${prefix}-${String(db.counter + 1).padStart(4, '0')}`;
      setDb((prev) => {
        let { d, customer } = matchOrCreate({ ...prev, counter: prev.counter + 1 }, form);
        if (kind === 'testdrive') {
          const td = {
            id: ref,
            customerId: customer.id,
            customer: customer.name,
            mobile: customer.mobile,
            model: form.model,
            variant: form.variant,
            date: form.date,
            slot: form.slot,
            status: 'Requested',
            vehicleId: null,
            executive: null,
            feedback: '',
            source: 'Website',
            message: form.message,
            fresh: true,
          };
          d = { ...d, testDrives: [td, ...d.testDrives] };
          d = addLead(d, customer, form, 'Test Drive Request');
          d = notify(d, `New test drive request ${ref} from ${customer.name} (${form.model})`);
        } else {
          d = { ...d, enquiries: [{ id: ref, kind, ...form, customerId: customer.id, date: today }, ...d.enquiries] };
          d = addLead(d, customer, form, kind === 'quote' ? 'Quotation Request' : 'Website Enquiry');
          d = notify(d, `New ${kind === 'quote' ? 'quotation request' : 'website enquiry'} ${ref} from ${customer.name}`);
        }
        return d;
      });
      return ref;
    };

    const update = (collection, id, patch) =>
      setDb((d) => ({ ...d, [collection]: d[collection].map((r) => (r.id === id ? { ...r, ...patch, fresh: false } : r)) }));

    // PRD 6.4 business rules: no overlapping vehicle or employee bookings
    const testDriveConflict = (td, vehicleId, executive) => {
      const active = ['Confirmed', 'Assigned', 'In Progress'];
      return db.testDrives.find(
        (x) =>
          x.id !== td.id &&
          active.includes(x.status) &&
          x.date === td.date &&
          x.slot === td.slot &&
          ((vehicleId && x.vehicleId === vehicleId) || (executive && x.executive === executive)),
      );
    };

    return {
      submit,
      update,
      testDriveConflict,
      markAllRead: () => setDb((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })),
      reset: () => setDb(initial()),
      login: (name, role) => setUser({ name, role }),
      logout: () => setUser(null),
    };
  }, [db]);

  return <Ctx.Provider value={{ db, user, can: (m) => !!user && roles[user.role]?.includes(m), ...api }}>{children}</Ctx.Provider>;
}

export const useDemo = () => useContext(Ctx);
