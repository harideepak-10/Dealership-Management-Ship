import { useParams } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import { PageHead } from '../kit';

const info = {
  payments: ['Payments', 'Booking advances, part payments, receipts, refunds and outstanding balances.', 'Phase 3'],
  deliveries: ['Deliveries', 'Delivery scheduling, document checks and handover checklist. A preview is in Bookings & Delivery.', 'Phase 3'],
  tasks: ['Tasks & Follow-ups', 'Assign tasks, set due dates and reminders, track overdue work.', 'Phase 4'],
  reports: ['Reports', 'Sales, lead, test drive, inventory and service reports with filters and export.', 'Phase 4'],
  employees: ['Employees & Roles', 'Manage employee accounts, departments, roles and permissions.', 'Phase 1'],
  audit: ['Audit Logs', 'A record of every important status change and who made it.', 'Phase 4'],
  settings: ['Settings', 'Brand, dealership details, time slots, discount limits and notification channels.', 'Phase 1'],
};

export default function Upcoming() {
  const { module } = useParams();
  const [title, desc, phase] = info[module] || ['Module', 'Coming soon.', ''];
  return (
    <div className="page">
      <PageHead title={title} sub={desc} />
      <div className="card" style={{ textAlign: 'center', padding: 56 }}>
        <Hammer size={28} style={{ margin: '0 auto 12px', color: '#c8102e' }} />
        <h3>Not part of this demo</h3>
        <p style={{ color: '#6a7280', marginTop: 6 }}>Planned for {phase} of the roadmap.</p>
      </div>
    </div>
  );
}
