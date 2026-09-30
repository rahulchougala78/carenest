import { useCallback, useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
  return body;
}

const navItems = [
  ['home', 'Overview', 'grid'],
  ['appointments', 'Visits', 'calendar'],
  ['medications', 'Medications', 'pill'],
  ['results', 'Results', 'flask'],
  ['billing', 'Billing', 'receipt'],
  ['messages', 'Messages', 'message']
];

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    pill: <path d="M10.5 4.5a4.25 4.25 0 0 1 6 6L10 17a4.25 4.25 0 1 1-6-6l6.5-6.5ZM7 8l9 9"/>,
    flask: <><path d="M9 3h6M10 3v7l-5.3 8.4A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.7-2.6L14 10V3"/><path d="M8 15h8"/></>,
    receipt: <><path d="M5 3h14v18l-2.5-1.5L14 21l-2.5-1.5L9 21l-2.5-1.5L5 21V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    message: <path d="M20 15a4 4 0 0 1-4 4H8l-4 3v-3.7A4 4 0 0 1 2 15V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>,
    spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/></>,
    shield: <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"/>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    send: <path d="m21 3-7.5 18-3.7-7.8L3 9.5 21 3ZM9.8 13.2 15 8"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4.2 4.2L19 6.5"/>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6"/>
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const formatDate = (date, options = { month: 'short', day: 'numeric', year: 'numeric' }) => new Intl.DateTimeFormat('en-US', options).format(new Date(date));
const formatTime = (date) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));

function Mark() {
  return <div className="mark"><span className="mark-dot"/><span className="mark-line"/><span className="mark-dot"/></div>;
}

function Toast({ notice, onDismiss }) {
  if (!notice) return null;
  return <button className={`toast ${notice.type || ''}`} onClick={onDismiss}><Icon name={notice.type === 'error' ? 'close' : 'check'} size={16}/><span>{notice.text}</span></button>;
}

function Login({ onLogin, error, busy }) {
  const [email, setEmail] = useState('maya.rivera@example.com');
  const [password, setPassword] = useState('Demo2026!');
  const submit = (event) => { event.preventDefault(); onLogin({ email, password }); };
  return <main className="login-shell">
    <section className="login-story">
      <div className="brand"><Mark/><span>CareNest</span></div>
      <div className="story-copy">
        <p className="eyebrow light">A calmer way to stay connected</p>
        <h1>Your health has a home here.</h1>
        <p>Keep visits, results, prescriptions and care-team messages close—without the clutter.</p>
      </div>
      <div className="story-card"><span className="story-icon"><Icon name="heart"/></span><div><strong>Built around your day</strong><p>Know what is next, prepare early, and spend less time waiting.</p></div></div>
      <p className="story-foot"><Icon name="shield" size={15}/> Private by design · Demo environment</p>
    </section>
    <section className="login-panel">
      <form className="login-form" onSubmit={submit}>
        <div className="mobile-brand brand"><Mark/><span>CareNest</span></div>
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to your space</h2>
        <p className="form-intro">Use the demo account to explore the patient portal.</p>
        {error && <div className="form-error">{error}</div>}
        <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></label>
        <button className="primary wide" disabled={busy}>{busy ? 'Signing you in…' : 'Sign in securely'} <Icon name="arrow" size={17}/></button>
        <div className="demo-lockup"><Icon name="shield" size={17}/><span><strong>Demo access</strong><br/>maya.rivera@example.com · Demo2026!</span></div>
      </form>
    </section>
  </main>;
}

function Sidebar({ view, setView, user, unread, onLogout }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`;
  return <aside className="sidebar">
    <div className="brand side-brand"><Mark/><span>CareNest</span></div>
    <nav aria-label="Main navigation">
      <p className="nav-label">Your space</p>
      {navItems.map(([id, label, icon]) => <button key={id} className={`nav-item ${view === id ? 'selected' : ''}`} onClick={() => setView(id)}><Icon name={icon}/><span>{label}</span>{id === 'messages' && unread > 0 && <b className="unread">{unread}</b>}</button>)}
    </nav>
    <button className={`guide-link ${view === 'guide' ? 'selected' : ''}`} onClick={() => setView('guide')}><span className="guide-icon"><Icon name="spark" size={17}/></span><span><b>Care guide</b><small>Find a good starting point</small></span><Icon name="chevron" size={16}/></button>
    <div className="sidebar-bottom"><button className="profile-button" onClick={() => setView('profile')}><span className="avatar">{initials}</span><span><b>{user.firstName} {user.lastName}</b><small>My profile</small></span><Icon name="chevron" size={16}/></button><button className="signout" onClick={onLogout} title="Sign out"><Icon name="logout" size={18}/></button></div>
  </aside>;
}

function Topbar({ title, user, unread, setView }) {
  return <header className="topbar"><div><p className="eyebrow">Good morning, {user.firstName}</p><h1>{title}</h1></div><div className="top-actions"><button className="icon-button notification" onClick={() => setView('messages')} aria-label="Open messages"><Icon name="bell"/>{unread > 0 && <span/>}</button><button className="user-chip" onClick={() => setView('profile')}><span className="avatar small">{user.firstName[0]}{user.lastName[0]}</span><Icon name="chevron" size={15}/></button></div></header>;
}

function AppointmentsList({ appointments, compact = false, onCancel, onCheckin }) {
  if (!appointments?.length) return <div className="empty-state">No upcoming visits yet.</div>;
  return <div className={`appointments-list ${compact ? 'compact' : ''}`}>{appointments.map((appointment) => <article className="appointment-row" key={appointment.id}>
    <div className="date-tile"><b>{formatDate(appointment.appointmentAt, { day: '2-digit' })}</b><span>{formatDate(appointment.appointmentAt, { month: 'short' }).toUpperCase()}</span></div>
    <div className="appointment-main"><div className="row-title"><h3>{appointment.clinicianName}</h3><span className={`status ${appointment.type.toLowerCase().includes('video') ? 'violet' : ''}`}>{appointment.type}</span></div><p>{appointment.specialty} <i/> {formatDate(appointment.appointmentAt, { weekday: 'short', month: 'short', day: 'numeric' })} · {formatTime(appointment.appointmentAt)}</p><span className="location"><Icon name="pin" size={14}/>{appointment.location}</span></div>
    {!compact && <div className="appointment-actions">{appointment.status === 'scheduled' && <><button className="quiet-button" onClick={() => onCheckin(appointment)}>Visit check-in</button><button className="more-button" onClick={() => onCancel(appointment)}>Cancel</button></>}</div>}
  </article>)}</div>;
}

function Overview({ data, setView, setBookOpen, setIntakeAppointment }) {
  const { nextAppointment, upcoming, stats, welcomeNote } = data;
  return <div className="page overview-page">
    <section className="welcome-card"><div><p className="eyebrow light">Your care, at a glance</p><h2>Everything you need,<br/>right when you need it.</h2><p>{welcomeNote}</p><button className="light-button" onClick={() => setBookOpen(true)}>Book a visit <Icon name="arrow" size={17}/></button></div><div className="orbital" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="orbit-core"><Icon name="heart" size={27}/></span></div></section>
    <section className="overview-grid">
      <article className="next-visit card">{nextAppointment ? <><div className="card-label"><span><Icon name="calendar" size={17}/> Next visit</span><button onClick={() => setView('appointments')}>View all</button></div><div className="visit-date"><b>{formatDate(nextAppointment.appointmentAt, { weekday: 'long', month: 'long', day: 'numeric' })}</b><span>{formatTime(nextAppointment.appointmentAt)}</span></div><h3>{nextAppointment.clinicianName}</h3><p>{nextAppointment.specialty} · {nextAppointment.type}</p><div className="visit-footer"><span><Icon name="pin" size={15}/>{nextAppointment.location}</span>{nextAppointment.queueNumber && <span className="queue-chip">Queue {nextAppointment.queueNumber}</span>}</div><button className="checkin-button" onClick={() => setIntakeAppointment(nextAppointment)}>Complete visit check-in <Icon name="arrow" size={16}/></button></> : <p>There are no scheduled visits.</p>}</article>
      <article className="care-prompt card"><span className="soft-icon mint"><Icon name="spark"/></span><p className="eyebrow">Not sure where to start?</p><h3>Tell us what is on your mind.</h3><p>Our care guide can help you choose a clinic or service.</p><button className="text-link" onClick={() => setView('guide')}>Open care guide <Icon name="arrow" size={16}/></button></article>
    </section>
    <section className="stat-grid"><button className="stat-card" onClick={() => setView('medications')}><span className="soft-icon peach"><Icon name="pill"/></span><span><b>{stats.activePrescriptions}</b><small>Active medications</small></span><Icon name="chevron" size={17}/></button><button className="stat-card" onClick={() => setView('results')}><span className="soft-icon sky"><Icon name="flask"/></span><span><b>{stats.attentionLabs ? `${stats.attentionLabs} to review` : 'All clear'}</b><small>Latest results</small></span><Icon name="chevron" size={17}/></button><button className="stat-card" onClick={() => setView('billing')}><span className="soft-icon lilac"><Icon name="receipt"/></span><span><b>{stats.amountDue ? `$${stats.amountDue.toFixed(2)}` : 'Nothing due'}</b><small>Balance due</small></span><Icon name="chevron" size={17}/></button></section>
    <section className="section-block"><div className="section-heading"><div><p className="eyebrow">Plan ahead</p><h2>Upcoming visits</h2></div><button className="quiet-button" onClick={() => setView('appointments')}>Manage visits</button></div><div className="card"><AppointmentsList appointments={upcoming} compact /></div></section>
  </div>;
}

function AppointmentsPage({ appointments, setBookOpen, onCancel, setIntakeAppointment }) {
  return <div className="page"><section className="page-intro"><div><p>Book, prepare for, or adjust your care visits.</p></div><button className="primary" onClick={() => setBookOpen(true)}><Icon name="plus" size={17}/> Book a visit</button></section><section className="card full-card"><div className="section-heading"><div><p className="eyebrow">Your schedule</p><h2>Visits</h2></div><span className="subtle-count">{appointments.length} upcoming</span></div><AppointmentsList appointments={appointments.filter((appointment) => appointment.status === 'scheduled')} onCancel={onCancel} onCheckin={setIntakeAppointment}/></section></div>;
}

function MedicationsPage({ prescriptions, onRefill }) {
  return <div className="page"><section className="page-intro"><div><p>See active medications and request eligible refills.</p></div></section><section className="card full-card"><div className="section-heading"><div><p className="eyebrow">Pharmacy</p><h2>Medications</h2></div><span className="privacy-note"><Icon name="shield" size={14}/> Your medication list is private</span></div><div className="med-grid">{prescriptions.map((medicine) => <article className="med-card" key={medicine.id}><div className="med-top"><span className="soft-icon peach"><Icon name="pill"/></span><span className="status green">Active</span></div><h3>{medicine.medication}</h3><p>{medicine.instructions}</p><div className="medicine-meta"><span><small>Last filled</small><b>{formatDate(medicine.lastFilled)}</b></span><span><small>Refills left</small><b>{medicine.refillsRemaining}</b></span><span><small>Eligible from</small><b>{formatDate(medicine.nextRefill)}</b></span></div><button className="outline-button wide" onClick={() => onRefill(medicine.id)} disabled={!medicine.refillsRemaining}>Request refill <Icon name="arrow" size={16}/></button></article>)}</div></section></div>;
}

function ResultsPage({ labs }) {
  return <div className="page"><section className="page-intro"><div><p>Your recent lab results. A result marked “review” is not an emergency—your clinician can discuss it with you.</p></div></section><section className="card full-card"><div className="section-heading"><div><p className="eyebrow">Health records</p><h2>Lab results</h2></div><button className="quiet-button" onClick={() => window.print()}>Print results</button></div><div className="results-table"><div className="result-head"><span>Test</span><span>Result</span><span>Expected range</span><span>Reported</span></div>{labs.map((lab) => <article className="result-row" key={lab.id}><div><b>{lab.testName}</b><small>{lab.note}</small></div><div><strong>{lab.value} <small>{lab.unit}</small></strong><span className={`status ${lab.status === 'attention' ? 'amber' : 'green'}`}>{lab.status === 'attention' ? 'Review' : 'In range'}</span></div><span>{lab.range}</span><span>{formatDate(lab.reportedAt)}</span></article>)}</div></section></div>;
}

function BillingPage({ invoices, onPay }) {
  const due = invoices.filter((invoice) => invoice.status === 'open').reduce((sum, invoice) => sum + invoice.amount, 0);
  return <div className="page"><section className="balance-card"><div><p className="eyebrow light">Current balance</p><h2>${due.toFixed(2)}</h2><p>{due ? 'Due by the date shown below' : 'You are all caught up.'}</p></div><span className="balance-icon"><Icon name="receipt" size={30}/></span></section><section className="card full-card"><div className="section-heading"><div><p className="eyebrow">Billing history</p><h2>Invoices</h2></div><span className="privacy-note"><Icon name="shield" size={14}/> Secure payment experience</span></div><div className="invoice-list">{invoices.map((invoice) => <article className="invoice-row" key={invoice.id}><span className="invoice-symbol"><Icon name="receipt" size={19}/></span><div><h3>{invoice.description}</h3><p>{invoice.visitRef} · {invoice.status === 'open' ? `Due ${formatDate(invoice.dueAt)}` : 'Paid'}</p></div><div className="invoice-amount"><b>${invoice.amount.toFixed(2)}</b><span className={`status ${invoice.status === 'paid' ? 'green' : 'amber'}`}>{invoice.status === 'paid' ? 'Paid' : 'Payment due'}</span></div>{invoice.status === 'open' ? <button className="primary small-action" onClick={() => onPay(invoice.id)}>Pay now</button> : <button className="quiet-button">Receipt</button>}</article>)}</div></section></div>;
}

function MessagesPage({ messages, sendMessage }) {
  const [message, setMessage] = useState('');
  const submit = async (event) => { event.preventDefault(); if (!message.trim()) return; const sent = await sendMessage(message); if (sent) setMessage(''); };
  return <div className="page messages-page"><section className="card full-card"><div className="section-heading"><div><p className="eyebrow">Care team</p><h2>Messages</h2></div><span className="privacy-note"><Icon name="shield" size={14}/> Not for urgent care</span></div><div className="message-thread">{messages.map((item) => <article className={`message ${item.sender === 'You' ? 'from-me' : ''}`} key={item.id}><span className="message-avatar">{item.sender === 'You' ? 'M' : 'W'}</span><div><div className="message-sender"><b>{item.sender}</b><time>{formatDate(item.createdAt, { month: 'short', day: 'numeric' })} · {formatTime(item.createdAt)}</time></div><p>{item.body}</p></div></article>)}</div><form className="message-compose" onSubmit={submit}><textarea aria-label="Message your care team" value={message} maxLength="1000" onChange={(event) => setMessage(event.target.value)} placeholder="Write a non-urgent message to your care team…"/><button className="primary" disabled={!message.trim()}>Send <Icon name="send" size={16}/></button></form></section></div>;
}

function GuidePage({ onTriage, result }) {
  const [concern, setConcern] = useState('');
  const submit = async (event) => { event.preventDefault(); await onTriage(concern); };
  return <div className="page"><section className="guide-hero"><span className="guide-hero-icon"><Icon name="spark" size={25}/></span><p className="eyebrow light">Care guide</p><h2>Find a helpful next step.</h2><p>Describe your concern in a few words. This is general guidance, not a diagnosis.</p></section><section className="card guide-card"><form onSubmit={submit}><label>What would you like help with?<textarea value={concern} onChange={(event) => setConcern(event.target.value)} placeholder="For example: I have a new rash on my arm" required /></label><button className="primary">Suggest a starting point <Icon name="arrow" size={17}/></button></form>{result && <div className={`guide-result ${result.urgency}`}><span className="soft-icon"><Icon name={result.urgency === 'emergency' ? 'heart' : 'check'}/></span><div><p className="eyebrow">{result.department}</p><h3>{result.urgency === 'emergency' ? 'Seek urgent help now' : 'A sensible place to begin'}</h3><p>{result.message}</p></div></div>}<p className="disclaimer">If you think you may have an emergency, call your local emergency number now. Do not use the portal for urgent care.</p></section></div>;
}

function ProfilePage({ user }) {
  return <div className="page"><section className="profile-hero"><span className="profile-large-avatar">{user.firstName[0]}{user.lastName[0]}</span><div><p className="eyebrow light">Personal details</p><h2>{user.firstName} {user.lastName}</h2><p>Care ID {user.careId}</p></div></section><section className="card profile-card"><div><p className="eyebrow">Account</p><h2>Contact information</h2></div><dl><div><dt>Email</dt><dd>{user.email}</dd></div><div><dt>Mobile</dt><dd>{user.phone}</dd></div><div><dt>Date of birth</dt><dd>{formatDate(user.dateOfBirth)}</dd></div><div><dt>Care ID</dt><dd>{user.careId}</dd></div></dl><p className="profile-help">Need to update your details? Send a message to your care team and they can help.</p></section></div>;
}

function BookingModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ clinicianName: 'Dr. Elena Park', specialty: 'Family medicine', location: 'Willow Clinic · 2nd floor', appointmentAt: '2026-10-30T10:00', type: 'In person', reason: '' });
  const submit = async (event) => { event.preventDefault(); await onCreate(form); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="booking-title"><section className="modal"><button className="modal-close" onClick={onClose} aria-label="Close booking"><Icon name="close"/></button><p className="eyebrow">New appointment</p><h2 id="booking-title">Book a visit</h2><p className="form-intro">Choose a care type, time and a brief reason for the visit.</p><form className="booking-form" onSubmit={submit}><div className="field-pair"><label>Clinician<input value={form.clinicianName} onChange={(e) => setForm({ ...form, clinicianName: e.target.value })} required /></label><label>Specialty<select value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })}><option>Family medicine</option><option>Cardiology</option><option>Dermatology</option><option>Physical therapy</option></select></label></div><label>Location<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label><div className="field-pair"><label>Date and time<input type="datetime-local" value={form.appointmentAt} onChange={(e) => setForm({ ...form, appointmentAt: e.target.value })} required /></label><label>Visit type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>In person</option><option>Video</option></select></label></div><label>What would you like help with?<textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required /></label><button className="primary wide">Request appointment <Icon name="arrow" size={17}/></button></form></section></div>;
}

function IntakeModal({ appointment, onClose, onSubmit }) {
  const [form, setForm] = useState({ symptoms: '', duration: '', severity: 'Mild' });
  const [summary, setSummary] = useState('');
  const submit = async (event) => { event.preventDefault(); const response = await onSubmit(appointment.id, form); if (response) setSummary(response.summary); };
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="intake-title"><section className="modal"><button className="modal-close" onClick={onClose} aria-label="Close check-in"><Icon name="close"/></button>{summary ? <div className="intake-done"><span className="soft-icon mint"><Icon name="check"/></span><p className="eyebrow">Saved for your care team</p><h2>Check-in complete</h2><p>Your visit note: “{summary}”</p><button className="primary wide" onClick={onClose}>Done</button></div> : <><p className="eyebrow">Before your visit</p><h2 id="intake-title">A quick check-in</h2><p className="form-intro">This gives {appointment.clinicianName} a short starting point. It does not replace urgent care.</p><form className="booking-form" onSubmit={submit}><label>What would you like to discuss?<textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} required /></label><div className="field-pair"><label>How long has this been happening?<input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="For example, 3 days" required /></label><label>How is it affecting you?<select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option>Mild</option><option>Moderate</option><option>Severe</option></select></label></div><button className="primary wide">Save check-in <Icon name="check" size={17}/></button></form></>}</section></div>;
}

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('carenest_token'));
  const [user, setUser] = useState(() => JSON.parse(sessionStorage.getItem('carenest_user') || 'null'));
  const [view, setView] = useState('home');
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [notice, setNotice] = useState(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [intakeAppointment, setIntakeAppointment] = useState(null);
  const [guideResult, setGuideResult] = useState(null);

  const notify = (text, type = 'success') => { setNotice({ text, type }); window.setTimeout(() => setNotice(null), 4200); };
  const loadCore = useCallback(async (activeToken = token) => {
    if (!activeToken) return;
    try {
      const [dashboard, appointments, prescriptions, labs, invoices] = await Promise.all([
        request('/dashboard', { token: activeToken }), request('/appointments', { token: activeToken }), request('/prescriptions', { token: activeToken }), request('/labs', { token: activeToken }), request('/invoices', { token: activeToken })
      ]);
      setData({ ...dashboard, appointments: appointments.appointments, prescriptions: prescriptions.prescriptions, labs: labs.labs, invoices: invoices.invoices });
    } catch (error) {
      if (error.message.includes('session')) logout(); else notify(error.message, 'error');
    }
  }, [token]);
  useEffect(() => { loadCore(); }, [loadCore]);
  useEffect(() => { if (token && view === 'messages') request('/messages', { token }).then((response) => setMessages(response.messages)).catch((error) => notify(error.message, 'error')); }, [token, view]);

  const logout = () => { sessionStorage.removeItem('carenest_token'); sessionStorage.removeItem('carenest_user'); setToken(null); setUser(null); setData(null); setView('home'); };
  const login = async ({ email, password }) => { setBusy(true); setLoginError(''); try { const response = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); sessionStorage.setItem('carenest_token', response.token); sessionStorage.setItem('carenest_user', JSON.stringify(response.user)); setToken(response.token); setUser(response.user); } catch (error) { setLoginError(error.message); } finally { setBusy(false); } };
  const createAppointment = async (form) => { try { await request('/appointments', { token, method: 'POST', body: JSON.stringify({ ...form, appointmentAt: new Date(form.appointmentAt).toISOString() }) }); setBookOpen(false); await loadCore(); notify('Your appointment request is on your schedule.'); } catch (error) { notify(error.message, 'error'); } };
  const cancelAppointment = async (appointment) => { if (!window.confirm(`Cancel your ${formatDate(appointment.appointmentAt)} visit with ${appointment.clinicianName}?`)) return; try { await request(`/appointments/${appointment.id}/cancel`, { token, method: 'POST' }); await loadCore(); notify('Your visit was cancelled.'); } catch (error) { notify(error.message, 'error'); } };
  const submitIntake = async (id, form) => { try { return await request(`/appointments/${id}/intake`, { token, method: 'POST', body: JSON.stringify(form) }); } catch (error) { notify(error.message, 'error'); return null; } };
  const requestRefill = async (id) => { try { const response = await request(`/prescriptions/${id}/refill`, { token, method: 'POST' }); await loadCore(); notify(response.message); } catch (error) { notify(error.message, 'error'); } };
  const payInvoice = async (id) => { try { const response = await request(`/invoices/${id}/pay`, { token, method: 'POST' }); await loadCore(); notify(response.message); } catch (error) { notify(error.message, 'error'); } };
  const sendMessage = async (body) => { try { const response = await request('/messages', { token, method: 'POST', body: JSON.stringify({ body }) }); setMessages((items) => [response.message, ...items]); notify('Your message was sent.'); return true; } catch (error) { notify(error.message, 'error'); return false; } };
  const triage = async (concern) => { try { const response = await request('/triage', { token, method: 'POST', body: JSON.stringify({ concern }) }); setGuideResult(response); } catch (error) { notify(error.message, 'error'); } };

  if (!token || !user) return <Login onLogin={login} error={loginError} busy={busy}/>;
  if (!data) return <div className="loading-screen"><div className="brand"><Mark/><span>CareNest</span></div><span className="loader"/>Preparing your care space…</div>;
  const titles = { home: 'Your overview', appointments: 'Your visits', medications: 'Medications', results: 'Results', billing: 'Billing', messages: 'Messages', guide: 'Care guide', profile: 'Your profile' };
  let page = <Overview data={data} setView={setView} setBookOpen={setBookOpen} setIntakeAppointment={setIntakeAppointment}/>;
  if (view === 'appointments') page = <AppointmentsPage appointments={data.appointments} setBookOpen={setBookOpen} onCancel={cancelAppointment} setIntakeAppointment={setIntakeAppointment}/>;
  if (view === 'medications') page = <MedicationsPage prescriptions={data.prescriptions} onRefill={requestRefill}/>;
  if (view === 'results') page = <ResultsPage labs={data.labs}/>;
  if (view === 'billing') page = <BillingPage invoices={data.invoices} onPay={payInvoice}/>;
  if (view === 'messages') page = <MessagesPage messages={messages} sendMessage={sendMessage}/>;
  if (view === 'guide') page = <GuidePage onTriage={triage} result={guideResult}/>;
  if (view === 'profile') page = <ProfilePage user={user}/>;
  return <div className="app-shell"><Sidebar view={view} setView={setView} user={user} unread={data.stats.unreadMessages} onLogout={logout}/><main className="content"><Topbar title={titles[view]} user={user} unread={data.stats.unreadMessages} setView={setView}/>{page}</main><nav className="mobile-nav">{navItems.slice(0, 5).map(([id, label, icon]) => <button className={view === id ? 'selected' : ''} onClick={() => setView(id)} key={id}><Icon name={icon} size={19}/><span>{label}</span></button>)}</nav>{bookOpen && <BookingModal onClose={() => setBookOpen(false)} onCreate={createAppointment}/>} {intakeAppointment && <IntakeModal appointment={intakeAppointment} onClose={() => setIntakeAppointment(null)} onSubmit={submitIntake}/>}<Toast notice={notice} onDismiss={() => setNotice(null)}/></div>;
}
