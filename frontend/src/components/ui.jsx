import { brand } from '../config/brand';

export function Logo({ light = true }) {
  return (
    <span className={`logo ${light ? 'logo-light' : 'logo-dark'}`}>
      <span className="logo-word">{brand.name.toUpperCase()}</span>
    </span>
  );
}

const tone = {
  // neutral
  New: 'blue', Requested: 'blue', Draft: 'grey', Prospect: 'blue',
  // in progress
  Assigned: 'violet', Contacted: 'violet', Interested: 'violet', 'Follow-up Required': 'amber', 'Test Drive Scheduled': 'violet',
  'Quotation Sent': 'violet', Negotiation: 'amber', Confirmed: 'teal', 'In Progress': 'amber', 'Pending Approval': 'amber',
  Approved: 'teal', Sent: 'violet', Viewed: 'violet', Reserved: 'amber', Allocated: 'violet', 'In Transit': 'blue',
  'Vehicle Awaited': 'amber', 'Vehicle Allocated': 'violet', 'Documentation Pending': 'amber', 'Ready for Delivery': 'teal',
  'Vehicle Received': 'violet', Inspection: 'violet', 'Job Card Created': 'violet', 'Quality Check': 'amber', 'Payment Pending': 'amber',
  Active: 'teal', High: 'red', Medium: 'amber', Low: 'grey',
  // done
  Converted: 'green', Completed: 'green', Accepted: 'green', Available: 'green', Sold: 'grey', Delivered: 'green', Customer: 'green',
  'Vehicle Delivered': 'green',
  // negative
  Lost: 'red', 'Not Interested': 'grey', Cancelled: 'grey', Rejected: 'red', 'No Show': 'red', Expired: 'grey', Inactive: 'grey',
};

export function Badge({ children }) {
  return <span className={`badge badge-${tone[children] || 'grey'}`}>{children}</span>;
}
