# Automation Plan

This document lists every automation in the Dealership Management Platform: what the
frontend demo already simulates, and how each one is built in the Django/DRF backend.

**Principle:** automation prepares, reminds, notifies and moves records forward. Decisions
with money or commitments attached stay with a person: test drive approval, discount approval,
refunds, delivery sign-off, and any AI suggestion that would create a booking or change a payment.

## 1. Two kinds of rules

| Kind | Demo (frontend) | Backend |
|---|---|---|
| **Event rules**: run when something happens | `onEvent()` in `frontend/src/store/automation.js` | Service-layer hooks / Django signals → Celery task |
| **Scheduled rules**: run on a timer | `runScheduled()`, every minute in the browser | Celery Beat (hourly / daily jobs) |

Every rule can be switched on or off (Admin → Automations), and every action it takes is
written to the automation log and the audit log.

## 2. Rule catalogue

| # | Rule | Trigger | What it does | Demo |
|---|---|---|---|---|
| 1 | Auto-assign new leads | Lead created | Assigns to the sales executive with the fewest open leads | ✅ |
| 2 | Lead scoring & priority | Lead created | Hot / Warm / Cold score from source, budget and timeline; sets priority | ✅ |
| 3 | Instant acknowledgement | Website form | Message with reference number | ✅ |
| 4 | First-contact task | Lead created | "Contact within 2 hours" task for the owner | ✅ |
| 5 | Pipeline auto-progress | TD confirmed / quote sent / booking | Moves the lead status | ✅ |
| 6 | Overdue follow-up escalation | Daily | 2+ days overdue → Sales Manager task and notification | ✅ |
| 7 | Stale lead re-engagement | Daily | 21 days with no activity → message and task | ✅ |
| 8 | Test drive status messages | Confirm / reschedule / reject / cancel | Customer message | ✅ |
| 9 | Day-before test drive reminder | Daily | Customer reminder plus an executive "prepare car" task | ✅ |
| 10 | Post-drive follow-up | TD completed | Thank-you, feedback link, next-day task | ✅ |
| 11 | No-show recovery | TD no-show | "Reschedule?" message and call-back task | ✅ |
| 12 | Test drive auto-suggest | Reviewer clicks | Proposes a free car and the least-busy executive (person approves) | ✅ |
| 13 | Quotation approval routing | Discount > limit | Notifies Sales Manager | ✅ |
| 14 | Quotation delivery & follow-up | Quote sent | Message and 2-day follow-up task | ✅ |
| 15 | Quotation expiry | Daily | Warning 2 days before; marks Expired after | ✅ |
| 16 | Booking confirmation | Booking created | Customer message; lead → Converted | ✅ |
| 17 | Payment receipt | Payment recorded | Receipt message; "verify payment" task for Accounts | ✅ |
| 18 | Balance reminder | Daily | Outstanding balance with delivery ≤ 7 days | ✅ |
| 19 | Auto-allocate arriving stock | Daily / stock change | Matching available car → oldest waiting booking | ✅ |
| 20 | Ready-for-delivery check | Daily | Paid + documented + allocated → Ready for Delivery | ✅ |
| 21 | After-delivery journey | Delivered | Thank-you, feedback, 1-week call task, first service date | ✅ |
| 22 | Service status messages | Service status change | Confirmed / ready for collection | ✅ |
| 23 | Service due reminders | Daily | 11+ months since last service → message and advisor task | ✅ |
| 24 | Warranty expiry alerts | Daily | 30 days before expiry, extended-warranty offer | ✅ |
| 25 | Ageing stock alert | Daily | 90+ days in stock → managers | ✅ |
| 26 | Low stock alert | Daily | Model with no available car → Inventory Manager | ✅ |
| 27 | Overdue task reminders | Daily | Owners reminded | ✅ |
| 28 | Daily manager digest | Daily 8:30 AM | Plain-language briefing on the dashboard (and by email in the backend) | ✅ |
| 29 | Customer match / duplicate detection | Any form | Matches by mobile / email instead of creating duplicates | ✅ |
| 30 | Booking cancel → release vehicle | Booking cancelled | Vehicle back to Available | ✅ |
| 31 | Delivery → ownership record | Delivered | Customer vehicle created, warranty set | ✅ |
| 32 | Website model finder | Visitor answers 4 questions | Recommends 3 models (AI consultant in Phase 5) | ✅ |
| 33 | Returning visitor prefill | Website forms | Remembers name / mobile / email in that browser | ✅ |

### Backend-only automations (need a server or third-party service)

| Rule | How |
|---|---|
| Real email / SMS / WhatsApp sending | Email: Amazon SES or SendGrid. SMS: MSG91 / Twilio (DLT-registered templates for India). WhatsApp: WhatsApp Business Platform (Meta Cloud API or a BSP such as Gupshup) with pre-approved templates |
| Delivery status & retries | Provider webhooks update each message (sent / delivered / read / failed); failed sends retried with back-off (Celery `autoretry_for`) |
| Opt-out handling | "STOP" replies and unsubscribe links update the customer's consent; rules skip customers without consent |
| Online payment reconciliation | Razorpay / payment-gateway webhooks create payment records automatically and mark them verified |
| Incoming WhatsApp → lead | Inbound webhook creates or matches the customer and opens a lead (source: WhatsApp) |
| Quotation PDF & e-mail attachment | Server-side PDF (WeasyPrint) attached to the quotation message |
| Calendar invites | `.ics` invite for confirmed test drives and service appointments |
| Document reminders | Missing KYC / insurance documents → reminder every 3 days |
| Data retention | Scheduled job anonymises lost / inactive leads after the configured retention period |
| Backups & monitoring | Nightly database backup; error monitoring (Sentry); alert if a scheduled job fails |

## 3. Backend design

```
backend/
  automation/
    models.py      AutomationRule (key, enabled), AutomationLog, MessageTemplate, Message
    events.py      emit(event, **payload) → runs matching event rules via Celery
    rules/         one module per area: leads.py, testdrives.py, quotations.py, bookings.py, service.py, inventory.py
    tasks.py       Celery tasks: send_message, run_scheduled_rules, daily_digest
    channels/      email.py, sms.py, whatsapp.py (one interface: send(to, template, vars))
  celery.py        Beat schedule (below)
```

**Celery Beat schedule (Asia/Kolkata):**

| Job | When |
|---|---|
| Test drive reminders, document reminders | Daily 9:00 AM |
| Daily manager digest | Daily 8:30 AM |
| Quote expiry, escalations, stale leads, overdue tasks | Daily 10:00 AM |
| Service due, warranty expiry | Daily 11:00 AM |
| Balance reminders | Daily 12:00 PM |
| Auto-allocate stock, ready-for-delivery check | Every 30 minutes |
| Ageing / low stock alerts | Monday 9:00 AM |

**Safety rules:**

- **Idempotency:** each (rule, record, day) runs once. Store a unique key in `AutomationLog`, which is the same idea the demo uses with `autoDone`.
- **Quiet hours:** no customer messages between 9 PM and 9 AM. Messages due then are queued for the morning.
- **Consent:** only message customers who gave consent, on channels they allow.
- **Human approval:** rules never approve, refund, deliver or change prices.
- **Audit:** every automated change is logged with `actor = "Automation: <rule>"`.

## 4. Phase 5: AI on top of the rules

| Assistant | Builds on |
|---|---|
| AI Sales / Customer Consultant | Model finder (#32) and the vehicle catalogue as its knowledge base |
| AI Lead Assistant | Lead scoring (#2), summaries of each lead's history, suggested next action, drafted messages (a person sends them) |
| AI Follow-up Assistant | Follow-up and re-engagement rules (#6, #7, #10, #14); writes personalised messages instead of templates |
| AI Management Assistant | Daily digest (#28); answers questions such as "which leads are hot this week?" |

AI actions that create bookings, change allocations or touch payments always go to an
employee for approval.
