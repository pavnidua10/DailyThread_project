import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import logo from '../logo/Logo.png';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink: #0f0e17;
    --paper: #faf9f6;
    --cream: #f0ece2;
    --accent: #c8553d;
    --accent2: #e8a87c;
    --muted: #8a8882;
    --border: #e2ddd6;
    --white: #ffffff;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
  }

  @media (max-width: 768px) {
    .auth-root { grid-template-columns: 1fr; }
    .auth-left { display: none; }
  }

  .auth-left {
    position: relative;
    background: var(--ink);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 52px;
  }

  .auth-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,.025) 28px, rgba(255,255,255,.025) 29px),
      repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,.015) 28px, rgba(255,255,255,.015) 29px);
    pointer-events: none;
  }

  .auth-blob {
    position: absolute;
    width: 500px; height: 500px; border-radius: 50%;
    background: radial-gradient(circle, rgba(200,85,61,.4) 0%, transparent 70%);
    bottom: -180px; right: -140px;
    pointer-events: none;
  }

  .auth-blob-2 {
    position: absolute;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(232,168,124,.2) 0%, transparent 70%);
    top: -80px; left: -80px;
    pointer-events: none;
  }

  .auth-left-top { position: relative; z-index: 1; }

  .auth-masthead {
    font-family: 'Playfair Display', serif;
    font-size: 13px; font-weight: 700; letter-spacing: .25em;
    text-transform: uppercase; color: var(--accent2);
    margin-bottom: 48px;
  }

  .auth-headline {
    font-family: 'Playfair Display', serif;
    font-size: 44px; font-weight: 900; line-height: 1.08;
    color: var(--white); margin-bottom: 20px;
  }

  .auth-headline em { font-style: italic; color: var(--accent2); }

  .auth-subline {
    font-size: 15px; color: rgba(255,255,255,.55); line-height: 1.7;
    max-width: 340px;
  }

  .auth-rule {
    display: flex; align-items: center; gap: 12px; margin: 32px 0;
  }

  .auth-rule::before, .auth-rule::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,.12);
  }

  .auth-rule span { font-size: 11px; color: rgba(255,255,255,.25); letter-spacing: .1em; text-transform: uppercase; }

  .auth-features { position: relative; z-index: 1; }

  .auth-feature {
    display: flex; align-items: flex-start; gap: 12px;
    margin-bottom: 18px;
  }

  .auth-feature-icon {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  .auth-feature-text strong {
    display: block; font-size: 13px; font-weight: 600; color: rgba(255,255,255,.9); margin-bottom: 1px;
  }

  .auth-feature-text span { font-size: 12px; color: rgba(255,255,255,.4); line-height: 1.5; }

  .auth-left-bottom { position: relative; z-index: 1; }

  .auth-edition {
    font-size: 11px; color: rgba(255,255,255,.2);
    letter-spacing: .08em; text-transform: uppercase;
    border-top: 1px solid rgba(255,255,255,.08); padding-top: 20px;
  }

  .auth-right {
    display: flex; flex-direction: column;
    justify-content: center; align-items: center;
    padding: 48px 40px;
    background: var(--paper);
    position: relative;
  }

  .auth-right::before {
    content: '';
    position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(0deg, transparent, transparent 40px, var(--border) 40px, var(--border) 41px),
      repeating-linear-gradient(90deg, transparent, transparent 40px, var(--border) 40px, var(--border) 41px);
    opacity: .25;
    pointer-events: none;
  }

  .auth-form-wrap {
    position: relative; z-index: 1;
    width: 100%; max-width: 520px;
  }

  .auth-logo-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-bottom: 44px;
    text-align: center;
  }

  .auth-logo-img {
    width: 180px;
    height: 180px;
    object-fit: contain;
    filter: drop-shadow(0 10px 24px rgba(15,14,23,.12));
  }

  .auth-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 52px;
    font-weight: 900;
    color: var(--ink);
    letter-spacing: -.03em;
    line-height: 0.95;
  }

  .auth-logo-text span { color: var(--accent); }

  @media (max-width: 768px) {
    .auth-form-wrap { max-width: 100%; }
    .auth-logo-img {
      width: 150px;
      height: 150px;
    }
    .auth-logo-text {
      font-size: 42px;
    }
  }

  .auth-form-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .auth-form-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 900;
    color: var(--ink);
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .auth-form-sub {
    font-size: 14px;
    color: var(--muted);
    margin-bottom: 32px;
    line-height: 1.5;
  }

  .auth-field { margin-bottom: 18px; }

  .auth-field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 7px;
  }

  .auth-field input {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--ink);
    background: var(--white);
    transition: border-color .2s, box-shadow .2s;
    outline: none;
  }

  .auth-field input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(200,85,61,.1);
  }

  .auth-field input::placeholder { color: #C4B5A5; }

  .auth-submit {
    width: 100%;
    padding: 13px;
    background: var(--ink);
    color: var(--white);
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s, transform .15s;
    margin-top: 8px;
    position: relative;
    overflow: hidden;
    letter-spacing: .02em;
  }

  .auth-submit:hover:not(:disabled) {
    background: var(--accent);
    transform: translateY(-1px);
  }

  .auth-submit:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .auth-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-toggle {
    text-align: center;
    margin-top: 24px;
    font-size: 13px;
    color: var(--muted);
  }

  .auth-toggle button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    margin-left: 4px;
    padding: 0;
    transition: opacity .15s;
  }

  .auth-toggle button:hover {
    opacity: .75;
    text-decoration: underline;
  }

  @keyframes fieldFadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .auth-field { animation: fieldFadeIn .25s ease both; }
  .auth-field:nth-child(1) { animation-delay: .05s; }
  .auth-field:nth-child(2) { animation-delay: .10s; }
  .auth-field:nth-child(3) { animation-delay: .15s; }

  .auth-trust {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .auth-trust-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--muted);
    font-weight: 500;
  }

  .auth-trust-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #059669;
  }
`;


const FEATURES = [
  { icon: '◆', title: 'Credibility scores', desc: 'Every voice is rated by the community — know who to trust before you read.' },
  { icon: '⚖️', title: 'Structured debate', desc: 'FOR and AGAINST — not comment chaos. Arguments ranked by trust.' },
  { icon: '📎', title: 'Source verification', desc: 'Claims are cross-referenced against verified outlets automatically.' },
  { icon: '🌡️', title: 'Community pulse', desc: 'Live sentiment tracking shows how communities react in real time.' },
];


const SignInForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);

  const { setUser } = useUser();
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password || (isSignUp && !name)) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }
    try {
      if (isSignUp) {
        const res = await axios.post('/auth/register', { name, email, password });
        toast.success('Account created!');
        setUser(res.data);
        navigate('/news');
      } else {
        const res = await axios.post('/auth/login', { email, password });
        toast.success('Welcome back!');
        setUser(res.data);
        navigate('/news');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setIsSignUp(s => !s);
    setEmail(''); setPassword(''); setName('');
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-root">
        <div className="auth-left">
          <div className="auth-blob" />
          <div className="auth-blob-2" />

          <div className="auth-left-top">
            <p className="auth-masthead">Daily Thread</p>

            <h1 className="auth-headline">
              News you can<br /><em>actually trust.</em>
            </h1>
            <p className="auth-subline">
              The platform where credibility is earned, not assumed.
              Every claim, every source, every voice — scored by the community.
            </p>

            <div className="auth-rule"><span>What makes us different</span></div>

            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="auth-feature">
                <div className="auth-feature-icon">{icon}</div>
                <div className="auth-feature-text">
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="auth-left-bottom">
            <p className="auth-edition">Daily Thread · Trusted discourse platform · Est. 2025</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-logo-wrap">
              <img src={logo} alt="Daily Thread" className="auth-logo-img" />
              <span className="auth-logo-text">Daily<span>Thread</span></span>
            </div>

            <p className="auth-form-label">{isSignUp ? 'Create account' : 'Member access'}</p>
            <h2 className="auth-form-title">
              {isSignUp ? 'Join the conversation.' : 'Good to have you back.'}
            </h2>
            <p className="auth-form-sub">
              {isSignUp
                ? 'Your credibility score starts building from day one.'
                : 'Sign in to see your feed, communities & credibility score.'}
            </p>

            <form onSubmit={handleSubmit} aria-label={isSignUp ? 'Sign Up' : 'Sign In'}>
              {isSignUp && (
                <div className="auth-field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name" required />
                </div>
              )}

              <div className="auth-field">
                <label htmlFor="email">Email address</label>
                <input id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required autoComplete="email" />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'} />
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading && <span className="auth-spinner" />}
                {loading
                  ? (isSignUp ? 'Creating account…' : 'Signing in…')
                  : (isSignUp ? 'Create account' : 'Sign in')}
              </button>
            </form>

            <div className="auth-toggle">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" onClick={toggle}>
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </button>
            </div>

            <div className="auth-trust">
              <div className="auth-trust-item">
                <span className="auth-trust-dot" />
                No ads, ever
              </div>
              <div className="auth-trust-item">
                <span className="auth-trust-dot" />
                Community-verified
              </div>
              <div className="auth-trust-item">
                <span className="auth-trust-dot" />
                Source-checked
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;