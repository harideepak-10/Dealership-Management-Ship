# Porsche Dealership — Static Demo (Coastal Motors Chennai)

Static React (Vite) demo of the Automotive Dealership Management Platform:
the public showcase website plus a preview of the employee dashboard.
All data is sample data held in the browser (localStorage). No backend.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/ (deploy dist/ to Netlify)
```

## Demo flow
1. Website → **Book a Test Drive** → submit the form → note the reference number.
2. Click **See it in the dashboard** → sign in as any employee (role picker = RBAC demo).
3. Test Drives → the new request is highlighted under *Awaiting approval* →
   assign vehicle + executive → **Approve & confirm** (overlap rules are enforced).
4. The same submission also created a **customer** and a **lead** (Leads → New).
5. **Reset demo data** in the top bar restores the original sample data.

## Automation
Admin → **Automations** lists 27 rules (lead assignment, scoring, reminders, follow-ups,
expiries, allocation, service due, alerts, daily digest) with on/off switches and an activity
log. Admin → **Communications** shows every simulated email / SMS / WhatsApp message.
Scheduled rules run every minute in the demo. See `../docs/AUTOMATION.md` for the backend plan.

## Structure
- `src/config/brand.js` – brand / dealership settings (change name, address, accent colour here)
- `src/data/models.js` – catalogue: models, variants, specs, colours, offers
- `src/data/seed.js` – sample customers, leads, test drives, inventory, quotes, bookings, service
- `src/store/DemoStore.jsx` – in-browser store, role permissions, form submissions
- `src/store/automation.js` – automation rules, message templates, daily digest
- `src/site/` – public website pages
- `src/admin/` – dashboard pages

When the Django/DRF backend is ready, replace `DemoStore` calls with API calls;
the page components can stay largely as they are.

Vehicle images are SVG placeholders — swap in brand photography later.
Uses HashRouter so it works on any static host without redirect rules.
