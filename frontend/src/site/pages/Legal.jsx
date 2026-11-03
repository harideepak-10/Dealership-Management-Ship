import { brand } from '../../config/brand';

export function Privacy() {
  return (
    <div className="legal">
      <h1>Privacy Policy</h1>
      <p>Placeholder text for the demo. The final policy will be provided by {brand.dealership}.</p>
      <h2>What we collect</h2>
      <p>Your name, contact details and vehicle preferences when you submit an enquiry, test drive or quotation request.</p>
      <h2>How we use it</h2>
      <p>Only to respond to your request and, with your consent, to keep you informed about relevant offers and services.</p>
      <h2>Who can see it</h2>
      <p>Access is limited to authorised dealership employees based on their role.</p>
      <h2>Your choices</h2>
      <p>You can ask us to update or delete your information, or change how we contact you, at any time.</p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="legal">
      <h1>Terms & Conditions</h1>
      <p>Placeholder text for the demo. The final terms will be provided by {brand.dealership}.</p>
      <h2>Prices and offers</h2>
      <p>Prices shown are indicative ex-showroom prices and may change without notice. Offers are subject to stock and eligibility.</p>
      <h2>Requests</h2>
      <p>Submitting a test drive or quotation request does not create a booking or contract. All requests are confirmed by the dealership.</p>
    </div>
  );
}
