import { Link } from 'react-router-dom';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { brand } from '../../config/brand';

export default function Contact() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-head">
          <div>
            <span className="eyebrow">Contact us</span>
            <h2>{brand.dealership}</h2>
            <p>Drop by the showroom, call us, or send a message. We're happy to help.</p>
          </div>
        </div>
        <div className="contact-grid">
          <div>
            <div className="contact-item">
              <MapPin size={18} />
              <div>
                <small>Address</small>
                {brand.address}
              </div>
            </div>
            <div className="contact-item">
              <Phone size={18} />
              <div>
                <small>Phone</small>
                {brand.phone}
              </div>
            </div>
            <div className="contact-item">
              <Mail size={18} />
              <div>
                <small>Email</small>
                {brand.email}
              </div>
            </div>
            <div className="contact-item">
              <Clock size={18} />
              <div>
                <small>Operating hours</small>
                {brand.hours.map((h) => (
                  <div key={h.day}>
                    {h.day}: {h.time}
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-cta">
              <Link to="/enquiry" className="btn btn-primary">
                Send a message
              </Link>
              <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <MessageCircle size={16} /> WhatsApp us
              </a>
            </div>
          </div>
          <div className="map">
            <div className="pin">
              <MapPin size={30} style={{ margin: '0 auto' }} />
              <span>{brand.dealership}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
