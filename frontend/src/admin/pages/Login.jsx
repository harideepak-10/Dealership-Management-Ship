import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/ui';
import { brand } from '../../config/brand';
import { employees } from '../../data/seed';
import { roles, useDemo } from '../../store/DemoStore';

export default function Login() {
  const { login } = useDemo();
  const nav = useNavigate();
  const loc = useLocation();
  const [empId, setEmpId] = useState('E01');
  const emp = employees.find((e) => e.id === empId);

  return (
    <div className="login">
      <div className="login-art">
        <Logo />
        <div>
          <span className="eyebrow">Dealer Management System</span>
          <h2>Every customer, vehicle and booking — in one place.</h2>
          <p>Leads, test drives, inventory, quotations, bookings, deliveries and service for {brand.dealership}.</p>
        </div>
        <small style={{ color: '#6b727c' }}>Demo build · sample data only</small>
      </div>
      <div className="login-form">
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault();
            login(emp.name, emp.role);
            nav(loc.state?.from || '/admin');
          }}
        >
          <h1>Employee sign in</h1>
          <p>For the demo, pick any employee — each role sees only the modules it's allowed to.</p>
          <label>Sign in as</label>
          <select className="aselect" value={empId} onChange={(e) => setEmpId(e.target.value)}>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} — {e.role}
              </option>
            ))}
          </select>
          <label>Password</label>
          <input className="ainput" type="password" defaultValue="demo1234" />
          <div className="role-hint">
            <b>{emp.role}</b> can access: {roles[emp.role].join(', ')}
          </div>
          <button className="abtn abtn-primary" style={{ width: '100%', height: 44, marginTop: 18, justifyContent: 'center' }}>
            Sign in
          </button>
          <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center' }}>
            <Link to="/" style={{ color: '#c8102e' }}>
              ← Back to public website
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
