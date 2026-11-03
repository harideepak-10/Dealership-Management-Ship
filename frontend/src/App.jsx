import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import SiteLayout from './site/SiteLayout';
import Home from './site/pages/Home';
import Catalogue from './site/pages/Catalogue';
import ModelDetail from './site/pages/ModelDetail';
import Compare from './site/pages/Compare';
import Offers from './site/pages/Offers';
import { TestDriveForm, EnquiryForm, QuoteForm, ServiceForm } from './site/pages/Forms';
import Electric from './site/pages/Electric';
import Build from './site/pages/Build';
import Finance from './site/pages/Finance';
import About from './site/pages/About';
import Finder from './site/pages/Finder';
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
import Quotations, { QuotationBuilder, QuotationPrint } from './admin/pages/Quotations';
import { Automations, Communications } from './admin/pages/Automation';
import { Audit, CustomerVehicles, Employees, Notifications, Payments, ReceiptPrint, Reports, Settings, Tasks } from './admin/pages/Modules';
import Bookings from './admin/pages/Bookings';
import Service from './admin/pages/Service';

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
        <Route path="electric" element={<Electric />} />
        <Route path="build" element={<Build />} />
        <Route path="build/:slug" element={<Build />} />
        <Route path="finance" element={<Finance />} />
        <Route path="service" element={<ServiceForm />} />
        <Route path="about" element={<About />} />
        <Route path="finder" element={<Finder />} />
        <Route path="thank-you" element={<Confirmation />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
      </Route>
      <Route path="admin/login" element={<Login />} />
      <Route path="quote-print/:id" element={<QuotationPrint />} />
      <Route path="receipt/:id" element={<Receipt />} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="leads" element={<Leads />} />
        <Route path="customers" element={<Customers />} />
        <Route path="test-drives" element={<TestDrives />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="quotations/new" element={<QuotationBuilder />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="deliveries" element={<Bookings key="deliveries" mode="deliveries" />} />
        <Route path="payments" element={<Payments />} />
        <Route path="service" element={<Service />} />
        <Route path="customer-vehicles" element={<CustomerVehicles />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="reports" element={<Reports />} />
        <Route path="employees" element={<Employees />} />
        <Route path="audit" element={<Audit />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="automations" element={<Automations />} />
        <Route path="communications" element={<Communications />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Receipt() {
  const { id } = useParams();
  return <ReceiptPrint id={id} />;
}
