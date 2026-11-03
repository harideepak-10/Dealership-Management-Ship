import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { brand } from '../../config/brand';
import { models } from '../../data/models';
import { dayOffset, timeSlots } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';

// ---------- shared helpers ----------
const validators = {
  name: (v) => (v.trim().length < 2 ? 'Please enter your full name' : ''),
  mobile: (v) => (!/^[6-9]\d{9}$/.test(v.replace(/\s|\+91/g, '')) ? 'Enter a valid 10-digit mobile number' : ''),
  email: (v) => (v && !/^\S+@\S+\.\S+$/.test(v) ? 'Enter a valid email address' : ''),
  model: (v) => (!v ? 'Select a model' : ''),
  date: (v) => (!v ? 'Choose a preferred date' : ''),
  slot: (v) => (!v ? 'Choose a time slot' : ''),
  category: (v) => (!v ? 'Choose a category' : ''),
  consent: (v) => (!v ? 'Consent is required so we can contact you' : ''),
};

const VISITOR_KEY = 'porsche-demo-visitor';
const remembered = () => {
  try {
    return JSON.parse(localStorage.getItem(VISITOR_KEY)) || {};
  } catch {
    return {};
  }
};

function useForm(initial, required) {
  const [form, setForm] = useState(() => {
    const r = remembered();
    return { ...initial, name: initial.name || r.name || '', mobile: initial.mobile || r.mobile || '', email: initial.email || r.email || '' };
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    const v = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [k]: v, ...(k === 'model' ? { variant: '' } : {}) }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: '' }));
  };
  const validate = () => {
    const errs = {};
    required.forEach((k) => {
      const m = validators[k]?.(form[k] ?? '');
      if (m) errs[k] = m;
    });
    if (form.email) {
      const m = validators.email(form.email);
      if (m) errs.email = m;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  return { form, set, errors, validate };
}

const Field = ({ label, error, full, children }) => (
  <div className={`f ${error ? 'err' : ''} ${full ? 'full' : ''}`}>
    <label>{label}</label>
    {children}
    {error && <div className="msg">{error}</div>}
  </div>
);

function ContactFields({ form, set, errors }) {
  return (
    <>
      <Field label="Full name *" error={errors.name}>
        <input value={form.name} onChange={set('name')} placeholder="e.g. Ananya Iyer" autoComplete="name" />
      </Field>
      <Field label="Mobile number *" error={errors.mobile}>
        <input value={form.mobile} onChange={set('mobile')} placeholder="10-digit mobile" inputMode="numeric" autoComplete="tel" />
      </Field>
      <Field label="Email address" error={errors.email} full>
        <input value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
      </Field>
    </>
  );
}

function VehicleFields({ form, set, errors }) {
  const m = models.find((x) => x.name === form.model);
  return (
    <>
      <Field label="Interested vehicle *" error={errors.model}>
        <select value={form.model} onChange={set('model')}>
          <option value="">Select model</option>
          {models.map((x) => (
            <option key={x.slug} value={x.name}>
              {brand.name} {x.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Preferred variant">
        <select value={form.variant} onChange={set('variant')} disabled={!m}>
          <option value="">{m ? 'Any variant' : 'Select a model first'}</option>
          {m?.variants.map((v) => (
            <option key={v.id} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}

const Consent = ({ form, set, errors }) => (
  <div className="full">
    <label className="consent">
      <input type="checkbox" checked={!!form.consent} onChange={set('consent')} />
      <span>I agree to be contacted by {brand.dealership} by phone, SMS, WhatsApp or email about this request. See our Privacy Policy.</span>
    </label>
    {errors.consent && <div className="f"><div className="msg">{errors.consent}</div></div>}
  </div>
);

function Layout({ eyebrow, title, intro, steps, children }) {
  return (
    <div className="wrap form-layout">
      <div className="form-aside">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <div className="steps">
          {steps.map((s, i) => (
            <div key={s}>
              <span>{i + 1}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="form-card">{children}</div>
    </div>
  );
}

function useSubmit(kind) {
  const { submit } = useDemo();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  return [
    busy,
    (form) => {
      if (form.website) return; // honeypot: bots fill hidden field
      setBusy(true);
      setTimeout(() => {
        const mobile = form.mobile.replace(/\s|\+91/g, '');
        try {
          localStorage.setItem(VISITOR_KEY, JSON.stringify({ name: form.name, mobile, email: form.email }));
        } catch {
          /* ignore */
        }
        const ref = submit(kind, { ...form, mobile });
        nav(`/thank-you?kind=${kind}&ref=${ref}&name=${encodeURIComponent(form.name.split(' ')[0])}`);
      }, 500);
    },
  ];
}

const Honeypot = ({ set }) => <input className="hp" tabIndex={-1} autoComplete="off" name="website" onChange={set('website')} aria-hidden="true" />;

// ---------- Test drive ----------
export function TestDriveForm() {
  const [p] = useSearchParams();
  const { form, set, errors, validate } = useForm(
    { name: '', mobile: '', email: '', model: p.get('model') || '', variant: p.get('variant') || '', date: '', slot: '', location: 'Showroom', message: '', consent: false },
    ['name', 'mobile', 'model', 'date', 'slot', 'consent'],
  );
  const [busy, send] = useSubmit('testdrive');
  return (
    <Layout
      eyebrow="Test drive"
      title="Book a test drive"
      intro="Tell us when you'd like to drive. This is a request — our team will confirm the slot and vehicle availability before your visit."
      steps={['Submit your preferred date and time', 'Our team checks vehicle and staff availability', 'You receive a confirmation by SMS / WhatsApp', 'Visit the showroom and enjoy the drive']}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) send(form);
        }}
        noValidate
      >
        <div className="form-grid">
          <ContactFields form={form} set={set} errors={errors} />
          <VehicleFields form={form} set={set} errors={errors} />
          <Field label="Preferred date *" error={errors.date}>
            <input type="date" min={dayOffset(1)} max={dayOffset(30)} value={form.date} onChange={set('date')} />
          </Field>
          <Field label="Location">
            <select value={form.location} onChange={set('location')}>
              <option>Showroom</option>
              <option>Home / office (within city limits)</option>
            </select>
          </Field>
          <Field label="Preferred time slot *" error={errors.slot} full>
            <div className="slots">
              {timeSlots.map((s) => (
                <button type="button" key={s} className={`slot ${form.slot === s ? 'on' : ''}`} onClick={() => set('slot')(s)}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Additional message" full>
            <textarea value={form.message} onChange={set('message')} placeholder="Anything we should know? (optional)" />
          </Field>
          <Consent form={form} set={set} errors={errors} />
        </div>
        <Honeypot set={set} />
        <div className="form-foot">
          <small>Requests are confirmed by the dealership within business hours.</small>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Request test drive'}
          </button>
        </div>
      </form>
    </Layout>
  );
}

// ---------- General enquiry ----------
const categories = ['Vehicle information', 'Pricing', 'Availability', 'Finance enquiry', 'Booking enquiry', 'Existing customer support', 'Other'];

export function EnquiryForm() {
  const [p] = useSearchParams();
  const { form, set, errors, validate } = useForm(
    { name: '', mobile: '', email: '', model: p.get('model') || '', variant: p.get('variant') || '', category: p.get('offer') ? 'Pricing' : '', contactPref: 'Phone', message: p.get('offer') ? `I'd like to know more about the "${p.get('offer')}" offer.` : '', consent: false },
    ['name', 'mobile', 'category', 'consent'],
  );
  const [busy, send] = useSubmit('enquiry');
  return (
    <Layout
      eyebrow="Enquiry"
      title="How can we help?"
      intro="Ask us anything about our vehicles, prices, finance or servicing. A member of our team will get back to you."
      steps={['Send us your question', 'It reaches the right team instantly', 'We contact you on your preferred channel']}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) send(form);
        }}
        noValidate
      >
        <div className="form-grid">
          <ContactFields form={form} set={set} errors={errors} />
          <Field label="Enquiry category *" error={errors.category}>
            <select value={form.category} onChange={set('category')}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Interested model">
            <select value={form.model} onChange={set('model')}>
              <option value="">Not sure yet</option>
              {models.map((x) => (
                <option key={x.slug} value={x.name}>
                  {brand.name} {x.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred contact method" full>
            <div className="slots">
              {['Phone', 'WhatsApp', 'Email'].map((s) => (
                <button type="button" key={s} className={`slot ${form.contactPref === s ? 'on' : ''}`} onClick={() => set('contactPref')(s)}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Message" full>
            <textarea value={form.message} onChange={set('message')} placeholder="Your question" />
          </Field>
          <Consent form={form} set={set} errors={errors} />
        </div>
        <Honeypot set={set} />
        <div className="form-foot">
          <small>We usually reply within 2 business hours.</small>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Sending…' : 'Send enquiry'}
          </button>
        </div>
      </form>
    </Layout>
  );
}

// ---------- Request a quotation ----------
export function QuoteForm() {
  const [p] = useSearchParams();
  const { form, set, errors, validate } = useForm(
    { name: '', mobile: '', email: '', model: p.get('model') || '', variant: p.get('variant') || '', colour: p.get('colour') || '', exchange: 'No', finance: p.get('finance') || 'No', message: p.get('config') || '', consent: false },
    ['name', 'mobile', 'model', 'consent'],
  );
  const [busy, send] = useSubmit('quote');
  const m = models.find((x) => x.name === form.model);
  return (
    <Layout
      eyebrow="Quotation"
      title="Request a quotation"
      intro="Get an itemised on-road price — ex-showroom, taxes, registration, insurance, accessories and any applicable offers."
      steps={['Choose your model and configuration', 'Our sales team prepares your quotation', 'Receive it as a PDF by email / WhatsApp']}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) send(form);
        }}
        noValidate
      >
        <div className="form-grid">
          <ContactFields form={form} set={set} errors={errors} />
          <VehicleFields form={form} set={set} errors={errors} />
          <Field label="Preferred colour">
            <select value={form.colour} onChange={set('colour')} disabled={!m}>
              <option value="">{m ? 'No preference' : 'Select a model first'}</option>
              {m?.colours.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Exchange an existing car?">
            <select value={form.exchange} onChange={set('exchange')}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </Field>
          <Field label="Interested in finance?" full>
            <div className="slots">
              {['No', 'Yes', 'Not sure'].map((s) => (
                <button type="button" key={s} className={`slot ${form.finance === s ? 'on' : ''}`} onClick={() => set('finance')(s)}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Additional requirements" full>
            <textarea value={form.message} onChange={set('message')} placeholder="Accessories, extended warranty, delivery timing…" />
          </Field>
          <Consent form={form} set={set} errors={errors} />
        </div>
        <Honeypot set={set} />
        <div className="form-foot">
          <small>Your quotation is prepared and approved by our sales team.</small>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Request quotation'}
          </button>
        </div>
      </form>
    </Layout>
  );
}

// ---------- Service booking (existing owners) ----------
const serviceTypes = ['Annual / periodic service', 'Repair', 'Warranty work', 'EV battery health check', 'Tyres & alignment', 'Accident repair', 'Other'];

export function ServiceForm() {
  const { form, set, errors, validate } = useForm(
    { name: '', mobile: '', email: '', model: '', registration: '', mileage: '', serviceType: '', date: '', slot: '', pickup: 'No', message: '', consent: false },
    ['name', 'mobile', 'model', 'serviceType', 'date', 'consent'],
  );
  const [busy, send] = useSubmit('service');
  return (
    <Layout
      eyebrow="Service"
      title="Book a service"
      intro="For existing owners. Tell us about your car and when you'd like to come in — our service advisor confirms the appointment."
      steps={['Choose your car, service type and preferred date', 'A service advisor confirms the slot', 'Drop off your car, or use pick-up & drop', 'Track progress and approve any extra work']}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) send(form);
        }}
        noValidate
      >
        <div className="form-grid">
          <ContactFields form={form} set={set} errors={errors} />
          <Field label="Your vehicle *" error={errors.model}>
            <select value={form.model} onChange={set('model')}>
              <option value="">Select model</option>
              {models.map((x) => (
                <option key={x.slug} value={x.name}>
                  {brand.name} {x.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Registration number">
            <input value={form.registration} onChange={set('registration')} placeholder="e.g. TN 09 AB 1234" />
          </Field>
          <Field label="Service type *" error={errors.serviceType}>
            <select value={form.serviceType} onChange={set('serviceType')}>
              <option value="">Select type</option>
              {serviceTypes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Odometer (km)">
            <input value={form.mileage} onChange={set('mileage')} inputMode="numeric" placeholder="e.g. 18,500" />
          </Field>
          <Field label="Preferred date *" error={errors.date}>
            <input type="date" min={dayOffset(1)} max={dayOffset(45)} value={form.date} onChange={set('date')} />
          </Field>
          <Field label="Pick-up & drop">
            <select value={form.pickup} onChange={set('pickup')}>
              <option>No</option>
              <option>Yes, within city limits</option>
            </select>
          </Field>
          <Field label="Describe the issue or request" full>
            <textarea value={form.message} onChange={set('message')} placeholder="Warning lights, noises, anything we should check…" />
          </Field>
          <Consent form={form} set={set} errors={errors} />
        </div>
        <Honeypot set={set} />
        <div className="form-foot">
          <small>Appointments are confirmed by our service advisor.</small>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Submitting…' : 'Request service appointment'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
