import { Navigate, Route, Routes } from 'react-router-dom';
import SiteLayout from './site/SiteLayout';
import Home from './site/pages/Home';
import Catalogue from './site/pages/Catalogue';
import ModelDetail from './site/pages/ModelDetail';
import Compare from './site/pages/Compare';
import Offers from './site/pages/Offers';
import { TestDriveForm, EnquiryForm, QuoteForm } from './site/pages/Forms';
import Contact from './site/pages/Contact';
import Confirmation from './site/pages/Confirmation';
import { Privacy, Terms } from './site/pages/Legal';
import AdminLayout from './admin/AdminLayout';
import Login from './admin/pages/Login';
import Overview from './admin/pages/Overview';
import Leads from './admin/pages/Leads';
import Customers from './admin/pages/Customers';
import TestDrives from './admin/pages/TestDrives';
import Inventory from './admin/pages/Inventory';
import Quotations from './admin/pages/Quotations';
import Bookings from './admin/pages/Bookings';
import Service from './admin/pages/Service';
import Upcoming from './admin/pages/Upcoming';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="models" element={<Catalogue />} />
        <Route path="models/:slug" element={<ModelDetail />} />
        <Route path="compare" element={<Compare />} />
        <Route path="offers" element={<Offers />} />
        <Route path="test-drive" element={<TestDriveForm />} />
        <Route path="enquiry" element={<EnquiryForm />} />
        <Route path="quote" element={<QuoteForm />} />
        <Route path="contact" element={<Contact />} />
        <Route path="thank-you" element={<Confirmation />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
      </Route>
      <Route path="admin/login" element={<Login />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="leads" element={<Leads />} />
        <Route path="customers" element={<Customers />} />
        <Route path="test-drives" element={<TestDrives />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="service" element={<Service />} />
        <Route path=":module" element={<Upcoming />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
