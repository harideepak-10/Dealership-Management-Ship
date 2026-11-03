import { useState } from 'react';
import { FileDown, Plus, Send } from 'lucide-react';
import { Badge } from '../../components/ui';
import { brand, formatINR } from '../../config/brand';
import { quotationStatuses } from '../../data/seed';
import { useDemo } from '../../store/DemoStore';
import { DataTable, Drawer, Guard, PageHead, fmtDate } from '../kit';

const DISCOUNT_LIMIT = 40000; // discounts above this need Sales Manager approval

export default function Quotations() {
  const { db, update, user } = useDemo();
  const [sel, setSel] = useState(null);
  const q = sel && db.quotations.find((x) => x.id === sel);
  const canApprove = ['Sales Manager', 'Dealership Manager', 'Super Admin'].includes(user.role);

  return (
    <Guard module="quotations">
      <div className="page">
        <PageHead title="Quotations" sub={`Prepare, approve and send itemised quotations. Discounts above ${formatINR(DISCOUNT_LIMIT)} need manager approval.`}>
          <button className="abtn abtn-primary">
            <Plus size={15} /> New quotation
          </button>
        </PageHead>
        <DataTable
          rows={db.quotations}
          search={['id', 'customer', 'variant']}
          filters={[{ key: 'status', label: 'Status', options: quotationStatuses }]}
          onRow={(r) => setSel(r.id)}
          columns={[
            { label: 'Quote', render: (r) => <span className="mono">{r.id} <span className="muted">v{r.version}</span></span> },
            { label: 'Customer', render: (r) => <b>{r.customer}</b> },
            { label: 'Vehicle', key: 'variant' },
            { label: 'Discount', render: (r) => (r.discount ? formatINR(r.discount) : '—'), num: true },
            { label: 'Total', render: (r) => <b>{formatINR(r.total)}</b>, num: true },
            { label: 'Valid till', render: (r) => fmtDate(r.validTill) },
            { label: 'Prepared by', key: 'preparedBy', cls: 'muted' },
            { label: 'Status', render: (r) => <Badge>{r.status}</Badge> },
          ]}
        />
        {q && (
          <Drawer title={`Quotation ${q.id}`} sub={`${q.customer} · version ${q.version} · prepared by ${q.preparedBy}`} onClose={() => setSel(null)}>
            <div style={{ marginBottom: 14 }}>
              <Badge>{q.status}</Badge>
            </div>
            {q.discount > DISCOUNT_LIMIT && q.status === 'Pending Approval' && (
              <div className="alert alert-warn">Discount of {formatINR(q.discount)} exceeds the {formatINR(DISCOUNT_LIMIT)} limit and needs Sales Manager approval.</div>
            )}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <b>
                  {brand.name} {q.variant}
                </b>
                <small style={{ color: '#6a7280' }}>Valid till {fmtDate(q.validTill)}</small>
              </div>
              <table className="atable">
                <tbody>
                  <tr><td>Ex-showroom price</td><td className="num">{formatINR(q.base)}</td></tr>
                  <tr><td>GST & cess</td><td className="num">{formatINR(q.tax)}</td></tr>
                  <tr><td>Registration, insurance & handling</td><td className="num">{formatINR(q.charges)}</td></tr>
                  <tr><td>Accessories</td><td className="num">{formatINR(q.accessories)}</td></tr>
                  <tr><td>Discount</td><td className="num" style={{ color: '#1d7a3a' }}>− {formatINR(q.discount)}</td></tr>
                  <tr><td><b>On-road total</b></td><td className="num"><b>{formatINR(q.total)}</b></td></tr>
                </tbody>
              </table>
            </div>
            <div className="actions">
              {q.status === 'Pending Approval' && (
                <button className="abtn abtn-ok" disabled={!canApprove} title={canApprove ? '' : 'Only managers can approve'} onClick={() => update('quotations', q.id, { status: 'Approved' })}>
                  Approve discount
                </button>
              )}
              {['Approved', 'Draft'].includes(q.status) && !(q.status === 'Draft' && q.discount > DISCOUNT_LIMIT) && (
                <button className="abtn abtn-primary" onClick={() => update('quotations', q.id, { status: 'Sent' })}>
                  <Send size={14} /> Send to customer
                </button>
              )}
              {q.status === 'Draft' && q.discount > DISCOUNT_LIMIT && (
                <button className="abtn" onClick={() => update('quotations', q.id, { status: 'Pending Approval' })}>
                  Request approval
                </button>
              )}
              {['Sent', 'Viewed'].includes(q.status) && (
                <>
                  <button className="abtn abtn-ok" onClick={() => update('quotations', q.id, { status: 'Accepted' })}>
                    Mark accepted
                  </button>
                  <button className="abtn abtn-danger" onClick={() => update('quotations', q.id, { status: 'Rejected' })}>
                    Mark rejected
                  </button>
                </>
              )}
              {q.status === 'Accepted' && <button className="abtn abtn-primary">Convert to booking</button>}
              <button className="abtn">
                <FileDown size={14} /> PDF
              </button>
            </div>
            {!canApprove && q.status === 'Pending Approval' && <p style={{ fontSize: 12, color: '#6a7280', marginTop: 8 }}>Sign in as a Sales Manager to approve.</p>}
          </Drawer>
        )}
      </div>
    </Guard>
  );
}
