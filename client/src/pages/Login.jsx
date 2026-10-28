import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import healthcareTeamImg from '../assets/healthcare_team.jpg';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  X,
  Hospital,
  ShieldCheck,
  Check,
  Activity
} from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState('ADMIN'); // 'ADMIN' or 'STAFF'
  const [email, setEmail] = useState('manager@healthcare.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  // Sync demo credentials when switching tabs
  useEffect(() => {
    if (loginType === 'ADMIN') {
      setEmail('manager@healthcare.com');
      setPassword('password123');
    } else {
      setEmail('arun@hc.com');
      setPassword('password123');
    }
    setError('');
  }, [loginType]);

  const handleQuickFill = (type, demoEmail, demoPass, label) => {
    setLoginType(type);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setFeedbackMsg(`Selected demo profile: ${label}`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password, loginType);
      if (!result.success) {
        setError(result.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please verify backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#c2ebf2] via-[#d6f4f8] to-[#bce6ee] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#00a8b5] selection:text-white relative overflow-hidden">
      {/* Ambient background glow & subtle patterns */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00a8b5]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00828e]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Elevated Card Wrapper (Balanced 50/50 Split) */}
      <div className="relative w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_25px_70px_-15px_rgba(0,110,125,0.22)] border border-white/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[620px]">
        
        {/* Subtle Decorative Pattern in Corners */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(#00a8b5_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-15 pointer-events-none rounded-tr-[36px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[radial-gradient(#00a8b5_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-15 pointer-events-none rounded-bl-[36px]" />

        {/* ================= LEFT PANE: BRAND & MEDICAL TEAM SHOWCASE ================= */}
        <div className="relative flex flex-col items-center justify-center p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-[#ebf9fa] via-[#e2f5f8] to-[#d4f1f5] border-b lg:border-b-0 lg:border-r border-[#cdeef3] overflow-hidden select-none">
          {/* Center Vector Illustration with Circular Glow */}
          <div className="relative w-full max-w-[420px] flex items-center justify-center">
            {/* Background Decorative Rings */}
            <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-[#daf4f8] -z-10 animate-pulse duration-1000 opacity-90" />
            <div className="absolute w-[220px] sm:w-[290px] h-[220px] sm:h-[290px] rounded-full bg-[#c9eff5] -z-10" />

            {/* Medical Team Vector Illustration */}
            <img
              src={healthcareTeamImg}
              alt="Healthcare Professionals Team"
              className="w-full max-w-[380px] h-auto object-contain drop-shadow-xl select-none pointer-events-none rounded-2xl"
            />
          </div>
        </div>

        {/* ================= RIGHT PANE: LOGIN AUTHENTICATION ================= */}
        <div className="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 bg-white relative z-20">
          <div className="w-full max-w-[390px] mx-auto">
            
            {/* Brand Logo & Title */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* Lifeline / Health+ Stylized Logo Icon */}
              <div className="mb-2 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#00a8b5]"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="24" cy="24" r="22" fill="#E6F8FA" />
                  <path
                    d="M17 24C17 20.134 20.134 17 24 17C27.866 17 31 20.134 31 24C31 27.866 27.866 31 24 31C20.134 31 17 27.866 17 24Z"
                    stroke="#00A8B5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 24H20L22.5 19L25.5 29L28 24H34"
                    stroke="#00828E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="14" cy="24" r="2.5" fill="#00A8B5" />
                  <circle cx="34" cy="24" r="2.5" fill="#00A8B5" />
                </svg>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-slate-800 tracking-tight">Health</span>
                <span className="text-xl font-black text-[#00a8b5]">+</span>
              </div>

              <h2 className="mt-2.5 text-2xl font-extrabold text-slate-800 tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 font-medium">
                Please enter your credentials to continue
              </p>
            </div>

            {/* Portal Role Switcher (Management vs Staff Portal) */}
            <div className="bg-[#edf8fa] p-1 rounded-xl mb-4 flex border border-[#d2f0f4]">
              <button
                type="button"
                onClick={() => setLoginType('ADMIN')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginType === 'ADMIN'
                    ? 'bg-white text-[#00828e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Management</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginType('STAFF')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginType === 'STAFF'
                    ? 'bg-white text-[#00828e] shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </button>
            </div>

            {/* Feedback & Error alerts */}
            {feedbackMsg && (
              <div className="mb-3.5 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-3.5 flex items-start gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Institutional ID / Email Field */}
              <div className="relative rounded-xl bg-[#eef9fa] border-l-4 border-[#00a8b5] p-2.5 px-3.5 shadow-xs transition-all focus-within:ring-2 focus-within:ring-[#00a8b5]/20 focus-within:bg-white">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#00828e] mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#00a8b5]" />
                    <span>{loginType === 'ADMIN' ? 'Management ID / Email' : 'Staff ID / Email'}</span>
                  </span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manager@healthcare.com"
                  className="w-full bg-transparent text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Password Field */}
              <div className="relative rounded-xl bg-[#eef9fa] border-l-4 border-[#00a8b5] p-2.5 px-3.5 shadow-xs transition-all focus-within:ring-2 focus-within:ring-[#00a8b5]/20 focus-within:bg-white">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#00828e] mb-0.5">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#00a8b5]" />
                    <span>Password</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-[#00828e] focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-sm text-slate-800 font-semibold placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-[#00a8b5] focus:ring-[#00a8b5] border-slate-300 cursor-pointer accent-[#00a8b5]"
                  />
                  <span className="text-slate-500 font-medium text-[11px]">Remember ID</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-[#00828e] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Cyan/Teal Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#00a8b5] hover:bg-[#00939e] active:scale-[0.99] shadow-md shadow-[#00a8b5]/30 focus:outline-none focus:ring-2 focus:ring-[#00a8b5] focus:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>LOGGING IN...</span>
                  </div>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>
            </form>

            {/* Quick Demo Profiles (Clean 1-Click Buttons) */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Demo Profiles
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill('ADMIN', 'manager@healthcare.com', 'password123', 'Dr. Sarah (Manager)')}
                  className={`p-1.5 px-2 rounded-lg border text-left font-medium transition-all ${
                    loginType === 'ADMIN' && email === 'manager@healthcare.com'
                      ? 'bg-[#e6f8fa] border-[#00a8b5] text-[#00828e]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block text-slate-800">Dr. Sarah</span>
                  <span className="text-[10px] text-slate-500">Manager (ER)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('STAFF', 'arun@hc.com', 'password123', 'Nurse Arun')}
                  className={`p-1.5 px-2 rounded-lg border text-left font-medium transition-all ${
                    loginType === 'STAFF' && email === 'arun@hc.com'
                      ? 'bg-[#e6f8fa] border-[#00a8b5] text-[#00828e]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block text-slate-800">Nurse Arun</span>
                  <span className="text-[10px] text-slate-500">Staff (Nurse)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-[#e6f8fa] text-[#00a8b5]">
                <Hospital className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Credential Recovery</h3>
                <p className="text-xs text-slate-500">Clinical personnel self-service reset</p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="py-4 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 mb-1">Instructions Dispatched</h4>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  If <strong className="text-slate-900">{forgotEmail || email}</strong> matches an active account, verification steps have been sent to your institutional inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSubmitted(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered institutional email or employee ID to receive a secure recovery token.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Hospital Email or Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. manager@healthcare.com or EMP001"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#eef9fa] border-l-4 border-[#00a8b5] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a8b5]/20 transition-all font-medium text-slate-800"
                  />
                </div>

                <div className="bg-[#eef9fa] border border-[#d0f0f4] p-3 rounded-xl text-xs text-[#00828e]">
                  <strong className="block font-semibold mb-0.5">Need Urgent Assistance?</strong>
                  Contact Hospital IT Helpdesk at extension <strong>Ext. 4400</strong> or <strong>#4911</strong>.
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#00a8b5] hover:bg-[#00939e] shadow-md shadow-[#00a8b5]/20 transition-all"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
