// Automation engine for the demo.
//
// Two kinds of rules:
//  1. Event rules  — run immediately when something happens (lead created, test drive
//     confirmed, quotation sent, payment recorded, vehicle delivered…).
//  2. Scheduled rules — run on a timer (every minute in the demo, a daily/hourly Celery
//     beat job in the real backend): reminders, expiries, escalations, alerts.
//
// Every rule can be switched on/off in Admin → Automations, and everything it does is
// written to the automation log. Approvals (test drives, discounts, refunds, delivery)
// always stay with a person — automation only prepares, reminds and notifies.
import { dayOffset, iso, salesExecs } from '../data/seed';
import { brand } from '../config/brand';

export const ruleDefs = [
  // ---- Leads
  { key: 'leadAssign', group: 'Leads', name: 'Auto-assign new leads', desc: 'New leads go to the sales executive with the fewest open leads (round-robin by workload).' },
  { key: 'leadScore', group: 'Leads', name: 'Lead scoring & priority', desc: 'Scores each lead Hot / Warm / Cold from source, budget and timeline, and sets priority.' },
  { key: 'leadAck', group: 'Leads', name: 'Instant acknowledgement', desc: 'Sends the customer a "we received your request" message with the reference number.' },
  { key: 'leadFirstCall', group: 'Leads', name: 'First-contact task', desc: 'Creates a "contact within 2 hours" task for the assigned executive.' },
  { key: 'leadPipeline', group: 'Leads', name: 'Pipeline auto-progress', desc: 'Moves the lead status when a test drive is confirmed, a quotation is sent or a booking is made.' },
  { key: 'leadEscalate', group: 'Leads', name: 'Overdue follow-up escalation', desc: 'Follow-ups overdue by 2+ days are escalated to the Sales Manager.', scheduled: true },
  { key: 'leadStale', group: 'Leads', name: 'Stale lead re-engagement', desc: 'Leads with no activity for 21 days get a re-engagement task and message.', scheduled: true },
  // ---- Test drives
  { key: 'tdNotify', group: 'Test drives', name: 'Status messages', desc: 'Customer is notified on confirmation, reschedule, rejection or cancellation.' },
  { key: 'tdReminder', group: 'Test drives', name: 'Day-before reminder', desc: 'Reminds the customer and the executive the day before a confirmed test drive.', scheduled: true },
  { key: 'tdFollowUp', group: 'Test drives', name: 'Post-drive follow-up', desc: 'After a completed drive: thank-you message, feedback link and a next-day follow-up task.' },
  { key: 'tdNoShow', group: 'Test drives', name: 'No-show recovery', desc: 'A no-show gets a "shall we reschedule?" message and a call-back task.' },
  // ---- Quotations
  { key: 'quoteApproval', group: 'Quotations', name: 'Approval routing', desc: 'Quotations above the discount limit notify the Sales Manager for approval.' },
  { key: 'quoteSend', group: 'Quotations', name: 'Quotation delivery & follow-up', desc: 'Sent quotations are emailed/WhatsApped and a follow-up task is set for 2 days later.' },
  { key: 'quoteExpiry', group: 'Quotations', name: 'Expiry handling', desc: 'Warns 2 days before a quotation expires and marks it Expired after the validity date.', scheduled: true },
  // ---- Bookings, payments & delivery
  { key: 'bookingConfirm', group: 'Bookings & delivery', name: 'Booking confirmation', desc: 'Customer receives a booking confirmation with the booking number.' },
  { key: 'paymentReceipt', group: 'Bookings & delivery', name: 'Payment receipts', desc: 'A receipt message is sent for every recorded payment; accounts is asked to verify it.' },
  { key: 'paymentReminder', group: 'Bookings & delivery', name: 'Balance reminders', desc: 'Customers with an outstanding balance and delivery within 7 days get a reminder.', scheduled: true },
  { key: 'autoAllocate', group: 'Bookings & delivery', name: 'Auto-allocate arriving stock', desc: 'When a matching vehicle becomes available, it is allocated to the oldest waiting booking.', scheduled: true },
  { key: 'autoReady', group: 'Bookings & delivery', name: 'Ready-for-delivery check', desc: 'Bookings that are fully paid, documented and allocated move to Ready for Delivery.', scheduled: true },
  { key: 'postDelivery', group: 'Bookings & delivery', name: 'After-delivery journey', desc: 'Thank-you message, feedback request and the first service reminder are scheduled on delivery.' },
  // ---- Service
  { key: 'serviceNotify', group: 'Service', name: 'Service status messages', desc: 'Customer is updated when the appointment is confirmed, the estimate is ready and the car is ready.' },
  { key: 'serviceDue', group: 'Service', name: 'Service due reminders', desc: 'Owners whose last service was 11+ months ago get a reminder and a booking link.', scheduled: true },
  { key: 'warrantyExpiry', group: 'Service', name: 'Warranty expiry alerts', desc: 'Owners are told 30 days before warranty ends, with an extended-warranty offer.', scheduled: true },
  // ---- Inventory & tasks
  { key: 'stockAgeing', group: 'Inventory & tasks', name: 'Ageing stock alert', desc: 'Vehicles in stock for 90+ days are flagged to the Inventory and Sales managers.', scheduled: true },
  { key: 'lowStock', group: 'Inventory & tasks', name: 'Low stock alert', desc: 'Notifies the Inventory Manager when a model has no available vehicle.', scheduled: true },
  { key: 'taskOverdue', group: 'Inventory & tasks', name: 'Overdue task reminders', desc: 'Owners of overdue tasks are reminded once a day.', scheduled: true },
  { key: 'dailyDigest', group: 'Inventory & tasks', name: 'Daily manager digest', desc: 'A morning summary of new leads, test drives, bookings, payments and alerts.', scheduled: true },
];

export const defaultAutomations = Object.fromEntries(ruleDefs.map((r) => [r.key, true]));

// Message templates (WhatsApp / SMS / email). {placeholders} are filled per message.
export const templates = {
  ack: 'Hi {name}, thank you for contacting {dealer}. Your reference is {ref}. Our team will get in touch shortly.',
  tdConfirmed: 'Hi {name}, your {model} test drive is confirmed for {date} at {slot}. Your consultant is {exec}. See you at {dealer}!',
  tdRejected: 'Hi {name}, we are unable to offer the requested test drive slot. Our team will call you to arrange another time.',
  tdCancelled: 'Hi {name}, your test drive {ref} has been cancelled. Reply to reschedule any time.',
  tdReminder: 'Reminder: your {model} test drive is tomorrow ({date}) at {slot}. Please carry your driving licence.',
  tdThanks: 'Thank you for driving the {model}, {name}! We would love your feedback: {link}',
  tdNoShow: 'Hi {name}, we missed you today for your {model} test drive. Shall we find another time?',
  quoteSent: 'Hi {name}, your quotation {ref} for the {model} is attached. On-road total {amount}, valid till {date}.',
  quoteExpiring: 'Hi {name}, your quotation {ref} expires on {date}. Reply to lock in the current price.',
  bookingConfirmed: 'Congratulations {name}! Your booking {ref} for the {model} is confirmed. We will keep you updated on allocation and delivery.',
  receipt: 'Hi {name}, we have received {amount} against booking {ref}. Thank you.',
  balanceReminder: 'Hi {name}, your {model} delivery is planned for {date}. Outstanding balance: {amount}.',
  allocated: 'Good news {name} — a {model} (VIN {vin}) has been allocated to your booking {ref}.',
  delivered: 'Welcome to the family, {name}! Enjoy your {model}. Please rate your delivery experience: {link}',
  serviceConfirmed: 'Hi {name}, your service appointment {ref} is confirmed for {date}.',
  serviceReady: 'Hi {name}, your {model} is ready for collection. Estimate: {amount}.',
  serviceDue: 'Hi {name}, your {model} is due for its annual service. Book a slot: {link}',
  warranty: 'Hi {name}, the warranty on your {model} ends on {date}. Ask us about extended warranty.',
  reengage: 'Hi {name}, still thinking about the {model}? We have new offers this month — reply to know more.',
};

const fill = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
const inr = (n) => '₹' + Math.round(Math.abs(n || 0)).toLocaleString('en-IN');
const stamp = () => {
  const d = new Date();
  return `${iso(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

// ---------- helpers that mutate a draft copy of the db ----------
const on = (d, key) => d.automations?.[key] !== false;

function logAuto(d, rule, text, record) {
  d.autoLog = [{ id: Date.now() + Math.random(), when: stamp(), rule, text, record }, ...(d.autoLog || [])].slice(0, 400);
}

function message(d, customerId, tplKey, vars, rule) {
  const c = d.customers.find((x) => x.id === customerId);
  if (!c) return;
  const ch = d.settings.channels;
  const pref = (c.contactPref || 'Phone').toLowerCase();
  // Pick the channel: preferred channel if enabled, else WhatsApp → SMS → Email
  const channel = pref === 'email' && ch.email ? 'Email' : pref === 'whatsapp' && ch.whatsapp ? 'WhatsApp' : ch.whatsapp ? 'WhatsApp' : ch.sms ? 'SMS' : ch.email ? 'Email' : null;
  if (!channel) return;
  const text = fill(templates[tplKey], { name: c.name.split(' ')[0], dealer: brand.dealership, link: 'coastalmotors.in/r/' + (vars.ref || ''), ...vars });
  d.messages = [{ id: `MSG-${(d.messages?.length || 0) + 1001}`, when: stamp(), customerId, customer: c.name, to: channel === 'Email' ? c.email : c.mobile, channel, template: tplKey, text, status: 'Sent (simulated)', rule }, ...(d.messages || [])];
  logAuto(d, rule, `${channel} to ${c.name}: ${tplKey}`, vars.ref);
}

function task(d, title, owner, due, linkedTo, priority, rule) {
  if (d.tasks.some((t) => t.title === title && t.linkedTo === linkedTo && t.status !== 'Completed')) return;
  d.tasks = [{ id: `TSK-${(d.tasks?.length || 0) + 601}`, title, linkedTo, owner: owner || 'Divya Nair', due, priority, status: 'Pending', auto: true }, ...d.tasks];
  logAuto(d, rule, `Task for ${owner || 'Sales Manager'}: ${title}`, linkedTo);
}

function notify(d, text, rule) {
  d.notifications = [{ id: Date.now() + Math.random(), text: `⚙ ${text}`, when: 'Just now', read: false }, ...d.notifications];
  if (rule) logAuto(d, rule, text);
}

const setLeadStatus = (d, customerId, status, onlyFrom) => {
  d.leads = d.leads.map((l) => {
    if (l.customerId !== customerId || l.status === status || ['Converted', 'Lost', 'Not Interested'].includes(l.status) || (onlyFrom && !onlyFrom.includes(l.status))) return l;
    logAuto(d, 'leadPipeline', `${l.id} moved ${l.status} → ${status}`, l.id);
    return { ...l, status, lastActivity: iso(new Date()) };
  });
};

// ---------- scoring ----------
export function scoreLead(l) {
  let s = 0;
  s += { 'Test Drive Request': 30, 'Quotation Request': 30, 'Walk-in': 25, Referral: 20, 'Phone Call': 15, WhatsApp: 15, 'Website Enquiry': 10 }[l.source] || 10;
  s += { Immediate: 35, 'Within 1 month': 25, '1–3 months': 12, '3+ months': 4 }[l.timeline] || 8;
  s += /3 Cr\+|2\.5–3/.test(l.budget || '') ? 20 : /2–2\.5|1\.5–2/.test(l.budget || '') ? 14 : /1–1\.5/.test(l.budget || '') ? 10 : 6;
  if (['Negotiation', 'Quotation Sent', 'Test Drive Scheduled'].includes(l.status)) s += 15;
  return Math.min(100, s);
}
export const scoreLabel = (s) => (s >= 65 ? 'Hot' : s >= 40 ? 'Warm' : 'Cold');

// ---------- EVENT RULES ----------
// Called by the store after a change. `kind` describes what happened.
export function onEvent(db, kind, p) {
  const d = { ...db };
  const today = iso(new Date());

  if (kind === 'lead.created') {
    let lead = d.leads.find((l) => l.id === p.leadId);
    if (!lead) return db;
    if (on(d, 'leadScore')) {
      const score = scoreLead(lead);
      lead = { ...lead, score, priority: score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low' };
      logAuto(d, 'leadScore', `${lead.id} scored ${score} (${scoreLabel(score)})`, lead.id);
    }
    if (on(d, 'leadAssign') && !lead.owner) {
      const load = (name) => d.leads.filter((l) => l.owner === name && !['Converted', 'Lost', 'Not Interested'].includes(l.status)).length;
      const exec = [...salesExecs].sort((a, b) => load(a.name) - load(b.name))[0].name;
      lead = { ...lead, owner: exec, status: 'Assigned' };
      d.customers = d.customers.map((c) => (c.id === lead.customerId && !c.owner ? { ...c, owner: exec } : c));
      logAuto(d, 'leadAssign', `${lead.id} assigned to ${exec} (lowest workload)`, lead.id);
      notify(d, `${lead.id} (${lead.customer}) auto-assigned to ${exec}`);
    }
    d.leads = d.leads.map((l) => (l.id === lead.id ? lead : l));
    if (on(d, 'leadAck') && p.ref) message(d, lead.customerId, 'ack', { ref: p.ref }, 'leadAck');
    if (on(d, 'leadFirstCall')) task(d, `First contact: call ${lead.customer} about ${lead.model}`, lead.owner, today, lead.id, lead.priority === 'High' ? 'High' : 'Medium', 'leadFirstCall');
  }

  if (kind === 'testdrive.status') {
    const t = d.testDrives.find((x) => x.id === p.id);
    const v = { ref: t.id, model: t.variant || t.model, date: t.date, slot: t.slot, exec: t.executive || 'our team' };
    if (on(d, 'tdNotify')) {
      if (p.to === 'Confirmed') message(d, t.customerId, 'tdConfirmed', v, 'tdNotify');
      if (p.to === 'Rejected') message(d, t.customerId, 'tdRejected', v, 'tdNotify');
      if (p.to === 'Cancelled') message(d, t.customerId, 'tdCancelled', v, 'tdNotify');
    }
    if (on(d, 'leadPipeline') && p.to === 'Confirmed') setLeadStatus(d, t.customerId, 'Test Drive Scheduled', ['New', 'Assigned', 'Contacted', 'Interested', 'Follow-up Required']);
    if (p.to === 'Completed' && on(d, 'tdFollowUp')) {
      message(d, t.customerId, 'tdThanks', v, 'tdFollowUp');
      task(d, `Follow up after test drive: ${t.customer} (${t.model})`, t.executive, dayOffset(1), t.id, 'High', 'tdFollowUp');
      setLeadStatus(d, t.customerId, 'Interested', ['Test Drive Scheduled', 'Contacted', 'Assigned']);
    }
    if (p.to === 'No Show' && on(d, 'tdNoShow')) {
      message(d, t.customerId, 'tdNoShow', v, 'tdNoShow');
      task(d, `Call back no-show: ${t.customer}`, t.executive, dayOffset(1), t.id, 'Medium', 'tdNoShow');
    }
  }

  if (kind === 'testdrive.rescheduled' && on(d, 'tdNotify')) {
    const t = d.testDrives.find((x) => x.id === p.id);
    message(d, t.customerId, 'tdConfirmed', { ref: t.id, model: t.variant || t.model, date: t.date, slot: t.slot, exec: t.executive }, 'tdNotify');
  }

  if (kind === 'quotation.status') {
    const q = d.quotations.find((x) => x.id === p.id);
    if (p.to === 'Pending Approval' && on(d, 'quoteApproval')) notify(d, `${q.id} for ${q.customer} needs discount approval (${inr(q.discount)})`, 'quoteApproval');
    if (p.to === 'Sent' && on(d, 'quoteSend')) {
      message(d, q.customerId, 'quoteSent', { ref: q.id, model: q.variant, amount: inr(q.total), date: q.validTill }, 'quoteSend');
      task(d, `Follow up on quotation ${q.id} with ${q.customer}`, q.preparedBy, dayOffset(2), q.id, 'Medium', 'quoteSend');
    }
    if (p.to === 'Sent' && on(d, 'leadPipeline')) setLeadStatus(d, q.customerId, 'Quotation Sent');
    if (p.to === 'Accepted' && on(d, 'leadPipeline')) setLeadStatus(d, q.customerId, 'Negotiation');
  }

  if (kind === 'booking.created') {
    const b = d.bookings.find((x) => x.id === p.id);
    if (on(d, 'bookingConfirm')) message(d, b.customerId, 'bookingConfirmed', { ref: b.id, model: b.variant }, 'bookingConfirm');
    if (on(d, 'leadPipeline')) setLeadStatus(d, b.customerId, 'Converted');
  }

  if (kind === 'payment.added' && on(d, 'paymentReceipt')) {
    const b = d.bookings.find((x) => x.id === p.bookingId);
    if (p.amount > 0) message(d, b.customerId, 'receipt', { ref: b.id, amount: inr(p.amount) }, 'paymentReceipt');
    task(d, `Verify payment ${p.ref} on ${b.id}`, 'Meena Kumari', iso(new Date()), b.id, 'Medium', 'paymentReceipt');
  }

  if (kind === 'booking.delivered' && on(d, 'postDelivery')) {
    const b = d.bookings.find((x) => x.id === p.id);
    message(d, b.customerId, 'delivered', { ref: b.id, model: b.variant }, 'postDelivery');
    task(d, `1-week check-in call: ${b.customer}'s new ${b.model}`, b.executive, dayOffset(7), b.id, 'Low', 'postDelivery');
    d.customerVehicles = d.customerVehicles.map((v) => (v.customerId === b.customerId && !v.nextServiceDue ? { ...v, nextServiceDue: dayOffset(365) } : v));
    logAuto(d, 'postDelivery', `First service scheduled for ${dayOffset(365)}`, b.id);
  }

  if (kind === 'service.requested' && on(d, 'serviceNotify')) {
    const s = d.services.find((x) => x.id === p.id);
    message(d, s.customerId, 'ack', { ref: s.id }, 'serviceNotify');
    task(d, `Confirm service request ${s.id} (${s.customer})`, 'Rahul Krishnan', iso(new Date()), s.id, 'Medium', 'serviceNotify');
  }

  if (kind === 'service.status' && on(d, 'serviceNotify')) {
    const s = d.services.find((x) => x.id === p.id);
    const model = s.vehicle.split(' · ')[0];
    if (p.to === 'Confirmed') message(d, s.customerId, 'serviceConfirmed', { ref: s.id, date: s.date, model }, 'serviceNotify');
    if (['Completed', 'Payment Pending'].includes(p.to)) message(d, s.customerId, 'serviceReady', { ref: s.id, model, amount: inr(s.estimate) }, 'serviceNotify');
    if (p.to === 'Vehicle Delivered') d.customerVehicles = d.customerVehicles.map((v) => (v.customerId === s.customerId && v.model === model ? { ...v, lastService: iso(new Date()), nextServiceDue: dayOffset(365) } : v));
  }

  return d;
}

// ---------- SCHEDULED RULES ----------
// Runs every minute in the demo. `d.autoDone` remembers what already ran today so
// nothing is sent twice.
export function runScheduled(db) {
  const d = { ...db, autoDone: { ...(db.autoDone || {}) } };
  const today = iso(new Date());
  const tomorrow = dayOffset(1);
  const once = (key) => {
    const k = `${today}:${key}`;
    if (d.autoDone[k]) return false;
    d.autoDone[k] = true;
    return true;
  };
  const before = (d.autoLog || []).length;

  if (on(d, 'tdReminder'))
    d.testDrives.filter((t) => t.date === tomorrow && ['Confirmed', 'Assigned'].includes(t.status)).forEach((t) => {
      if (once(`tdrem:${t.id}`)) {
        message(d, t.customerId, 'tdReminder', { ref: t.id, model: t.variant || t.model, date: t.date, slot: t.slot }, 'tdReminder');
        task(d, `Prepare car for tomorrow's test drive (${t.customer}, ${t.slot})`, t.executive, today, t.id, 'Medium', 'tdReminder');
      }
    });

  if (on(d, 'quoteExpiry')) {
    d.quotations = d.quotations.map((q) => {
      if (['Sent', 'Viewed', 'Approved'].includes(q.status) && q.validTill < today) {
        logAuto(d, 'quoteExpiry', `${q.id} marked Expired (valid till ${q.validTill})`, q.id);
        return { ...q, status: 'Expired' };
      }
      return q;
    });
    d.quotations.filter((q) => ['Sent', 'Viewed'].includes(q.status) && q.validTill >= today && days(today, q.validTill) <= 2).forEach((q) => {
      if (once(`qexp:${q.id}`)) message(d, q.customerId, 'quoteExpiring', { ref: q.id, date: q.validTill }, 'quoteExpiry');
    });
  }

  const openLead = (l) => !['Converted', 'Lost', 'Not Interested'].includes(l.status);
  if (on(d, 'leadEscalate')) {
    const overdue = d.leads.filter((l) => openLead(l) && l.nextFollowUp && days(l.nextFollowUp, today) >= 2);
    if (overdue.length && once('escalate')) {
      notify(d, `${overdue.length} lead follow-ups are 2+ days overdue — escalated to Sales Manager`, 'leadEscalate');
      overdue.slice(0, 5).forEach((l) => task(d, `Escalated: overdue follow-up with ${l.customer}`, 'Divya Nair', today, l.id, 'High', 'leadEscalate'));
    }
  }

  if (on(d, 'leadStale'))
    d.leads.filter((l) => openLead(l) && days(l.lastActivity || l.created, today) >= 21).forEach((l) => {
      if (once(`stale:${l.id}`) && !d.autoDone[`stale-ever:${l.id}`]) {
        d.autoDone[`stale-ever:${l.id}`] = true;
        message(d, l.customerId, 'reengage', { ref: l.id, model: l.model }, 'leadStale');
        task(d, `Re-engage ${l.customer} (no activity for 21+ days)`, l.owner, today, l.id, 'Low', 'leadStale');
      }
    });

  if (on(d, 'paymentReminder'))
    d.bookings.filter((b) => !['Delivered', 'Cancelled'].includes(b.status) && b.total - b.paid > 0 && days(today, b.expectedDelivery) <= 7 && days(today, b.expectedDelivery) >= 0).forEach((b) => {
      if (once(`payrem:${b.id}`)) message(d, b.customerId, 'balanceReminder', { ref: b.id, model: b.variant, date: b.expectedDelivery, amount: inr(b.total - b.paid) }, 'paymentReminder');
    });

  if (on(d, 'autoAllocate')) {
    d.bookings
      .filter((b) => !b.vehicleId && ['Vehicle Awaited', 'Confirmed', 'Pending Approval'].includes(b.status))
      .forEach((b) => {
        const v = d.inventory.find((x) => x.variant === b.variant && x.status === 'Available' && !x.testDrive);
        if (!v) return;
        d.inventory = d.inventory.map((x) => (x.id === v.id ? { ...x, status: 'Allocated' } : x));
        d.bookings = d.bookings.map((x) => (x.id === b.id ? { ...x, vehicleId: v.id, vin: v.vin, status: 'Vehicle Allocated' } : x));
        logAuto(d, 'autoAllocate', `${v.id} allocated to ${b.id}`, b.id);
        message(d, b.customerId, 'allocated', { ref: b.id, model: b.variant, vin: v.vin }, 'autoAllocate');
      });
  }

  if (on(d, 'autoReady'))
    d.bookings = d.bookings.map((b) => {
      if (b.vehicleId && b.docs === 'Complete' && b.total - b.paid <= 0 && ['Vehicle Allocated', 'Documentation Pending', 'Confirmed'].includes(b.status)) {
        logAuto(d, 'autoReady', `${b.id} moved to Ready for Delivery`, b.id);
        return { ...b, status: 'Ready for Delivery' };
      }
      return b;
    });

  if (on(d, 'serviceDue'))
    d.customerVehicles.filter((v) => (v.nextServiceDue ? v.nextServiceDue <= today : days(v.lastService || v.purchased, today) >= 335)).forEach((v) => {
      if (!d.autoDone[`svcdue:${v.id}:${v.lastService}`]) {
        d.autoDone[`svcdue:${v.id}:${v.lastService}`] = true;
        message(d, v.customerId, 'serviceDue', { ref: v.id, model: v.model }, 'serviceDue');
        task(d, `Service due: call ${v.customer} (${v.model}, ${v.registration})`, 'Rahul Krishnan', today, v.id, 'Medium', 'serviceDue');
      }
    });

  if (on(d, 'warrantyExpiry'))
    d.customerVehicles.filter((v) => v.warrantyTill >= today && days(today, v.warrantyTill) <= 30).forEach((v) => {
      if (!d.autoDone[`warr:${v.id}`]) {
        d.autoDone[`warr:${v.id}`] = true;
        message(d, v.customerId, 'warranty', { ref: v.id, model: v.model, date: v.warrantyTill }, 'warrantyExpiry');
      }
    });

  if (on(d, 'stockAgeing')) {
    const aged = d.inventory.filter((v) => ['Available', 'Reserved'].includes(v.status) && days(v.acquired, today) > 90);
    if (aged.length && once('ageing')) notify(d, `${aged.length} vehicle(s) in stock for 90+ days: ${aged.slice(0, 3).map((v) => v.id).join(', ')}${aged.length > 3 ? '…' : ''}`, 'stockAgeing');
  }

  if (on(d, 'lowStock') && once('lowstock')) {
    const models = [...new Set(d.inventory.map((v) => v.model))];
    const empty = models.filter((m) => !d.inventory.some((v) => v.model === m && v.status === 'Available' && !v.testDrive));
    if (empty.length) notify(d, `No available stock for: ${empty.join(', ')}`, 'lowStock');
  }

  if (on(d, 'taskOverdue')) {
    const overdue = d.tasks.filter((t) => !['Completed', 'Cancelled'].includes(t.status) && t.due < today);
    if (overdue.length && once('taskoverdue')) notify(d, `${overdue.length} overdue task(s) — owners reminded`, 'taskOverdue');
  }

  if (on(d, 'dailyDigest') && once('digest')) {
    d.digest = buildDigest(d);
    logAuto(d, 'dailyDigest', 'Daily manager digest generated');
  }

  d.lastScheduledRun = stamp();
  // Nothing changed? return the original object so React doesn't re-render.
  if ((d.autoLog || []).length === before && JSON.stringify(d.quotations) === JSON.stringify(db.quotations) && JSON.stringify(d.bookings) === JSON.stringify(db.bookings) && JSON.stringify(d.autoDone) === JSON.stringify(db.autoDone || {})) return db;
  return d;
}

// Plain-language summary for managers (rule-based now; AI-written in Phase 5).
export function buildDigest(d) {
  const today = iso(new Date());
  const open = (l) => !['Converted', 'Lost', 'Not Interested'].includes(l.status);
  const newLeads = d.leads.filter((l) => l.created === today).length;
  const hot = d.leads.filter((l) => open(l) && (l.score ?? scoreLead(l)) >= 65).length;
  const tdsToday = d.testDrives.filter((t) => t.date === today && !['Cancelled', 'Rejected'].includes(t.status)).length;
  const pendingTd = d.testDrives.filter((t) => t.status === 'Requested').length;
  const approvals = d.quotations.filter((q) => q.status === 'Pending Approval').length;
  const overdue = d.leads.filter((l) => open(l) && l.nextFollowUp && l.nextFollowUp < today).length;
  const ready = d.bookings.filter((b) => b.status === 'Ready for Delivery').length;
  const outstanding = d.bookings.filter((b) => !['Cancelled', 'Delivered'].includes(b.status)).reduce((s, b) => s + Math.max(0, b.total - b.paid), 0);
  const unverified = d.payments.filter((p) => !p.verified).length;
  const svc = d.services.filter((s) => ['Vehicle Received', 'Inspection', 'Job Card Created', 'In Progress', 'Quality Check'].includes(s.status)).length;
  return [
    `${newLeads} new lead(s) today; ${hot} hot lead(s) in the pipeline.`,
    `${tdsToday} test drive(s) today and ${pendingTd} request(s) waiting for approval.`,
    approvals ? `${approvals} quotation(s) need discount approval.` : 'No quotations waiting for approval.',
    overdue ? `${overdue} follow-up(s) are overdue.` : 'All follow-ups are on time.',
    `${ready} car(s) ready for delivery; ${inr(outstanding)} outstanding across active bookings; ${unverified} payment(s) to verify.`,
    `${svc} car(s) in the workshop.`,
  ];
}
