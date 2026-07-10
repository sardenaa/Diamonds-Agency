import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Globe, Languages, Sparkles, ArrowRight, Loader2, HelpCircle, Shield, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { tokens } from '../theme/tokens.js';

// @ts-ignore
import masLogo from '../assets/images/mas_logo_1783692800212.jpg';

interface CustomerAuthProps {
  lang: string;
}

export default function CustomerAuth({ lang }: CustomerAuthProps) {
  const {
    setCustomerUser,
    setRole,
    customerAuthView: view,
    setCustomerAuthView: setView,
    fetchSecurityQuestion: fetchSeqQuestion,
    resetPassword: apiResetPassword
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Common fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('United States');
  const [userLang, setUserLang] = useState(lang || 'en');
  const [biography, setBiography] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What is your favorite historical Egyptian monument?');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Real-time validation states
  const [emailValidationError, setEmailValidationError] = useState<string | null>(null);
  const [passwordValidationError, setPasswordValidationError] = useState<string | null>(null);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailValidationError(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailValidationError(
        isAr 
          ? 'الرجاء إدخال بريد إلكتروني صالح (مثال: user@example.com)' 
          : 'Please enter a valid email address (e.g., user@example.com)'
      );
    } else {
      setEmailValidationError(null);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordValidationError(null);
      return;
    }
    if (val.length < 8) {
      setPasswordValidationError(
        isAr 
          ? 'يجب أن تتكون كلمة المرور من ٨ أحرف على الأقل.' 
          : 'Password must be at least 8 characters long.'
      );
    } else if (!/[A-Z]/.test(val)) {
      setPasswordValidationError(
        isAr 
          ? 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل.' 
          : 'Password must contain at least one uppercase letter.'
      );
    } else if (!/[0-9]/.test(val)) {
      setPasswordValidationError(
        isAr 
          ? 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.' 
          : 'Password must contain at least one number.'
      );
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(val)) {
      setPasswordValidationError(
        isAr 
          ? 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.' 
          : 'Password must contain at least one special character.'
      );
    } else {
      setPasswordValidationError(null);
    }
  };

  // Forgot password fields
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [fetchedQuestion, setFetchedQuestion] = useState<string | null>(null);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isAr = lang === 'ar';

  const securityQuestionsList = [
    'What was the name of your first school?',
    'What is your mother\'s maiden name?',
    'What was the name of your childhood pet?',
    'What is your favorite historical Egyptian monument?',
    'What was the destination of your first luxury tour?'
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerUser(data.user);
        setRole('customer');
      } else {
        setError(data.message || (isAr ? 'بريد إلكتروني أو كلمة مرور غير صالحة.' : 'Invalid email or password.'));
      }
    } catch (err) {
      setError(isAr ? 'حدث خطأ في الاتصال بالخادم.' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !email || !password || !securityAnswer) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Client-side real-time error validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(isAr ? 'الرجاء إدخال بريد إلكتروني صالح.' : 'Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError(isAr ? 'كلمة المرور لا تلبي المتطلبات الأمنية.' : 'Password does not meet the security requirements.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          nationality,
          language: userLang,
          password,
          securityQuestion,
          securityAnswer,
          biography
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerUser(data.user);
        setRole('customer');
      } else {
        setError(data.message || (isAr ? 'فشلت عملية التسجيل.' : 'Registration failed.'));
      }
    } catch (err) {
      setError(isAr ? 'حدث خطأ في الاتصال بالخادم.' : 'Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await fetchSeqQuestion(email);
    if (result.success) {
      setFetchedQuestion(result.securityQuestion || null);
      setForgotStep(2);
    } else {
      setError(result.message || (isAr ? 'لم يتم العثور على حساب بهذا البريد الإلكتروني.' : 'Account not found with this email.'));
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await apiResetPassword(email, forgotAnswer, newPassword);
    if (result.success) {
      setSuccess(isAr ? 'تم إعادة تعيين كلمة المرور بنجاح! يرجى تسجيل الدخول.' : 'Password reset successful! Please log in.');
      setView('login');
      setForgotStep(1);
      setForgotAnswer('');
      setNewPassword('');
    } else {
      setError(result.message || (isAr ? 'إجابة الأمان غير صحيحة.' : 'Incorrect security answer.'));
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-scale-in" id="customer-auth-card">
      {/* Decorative Brand Header */}
      <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white border border-slate-800 p-1 rounded-2xl flex items-center justify-center overflow-hidden w-16 h-16 mb-4 shadow-lg shadow-emerald-500/10">
            <img
              src={masLogo}
              alt="MAS Logo"
              className="w-full h-full object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase font-sans">
            {isAr ? 'بوابة العميل VIP' : 'Sovereign VIP Gate'}
          </h2>
          <p className="text-xs text-slate-400 font-medium tracking-wider mt-1 uppercase">
            {isAr ? 'سجل دخولك للوصول إلى حجوزاتك الاستثنائية' : 'Access your royal expedition credentials'}
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold flex items-start gap-2.5 animate-fade-in" id="auth-error-alert">
            <span className="mt-0.5 font-bold">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-start gap-2.5 animate-fade-in" id="auth-success-alert">
            <span className="mt-0.5 font-bold">✨</span>
            <span>{success}</span>
          </div>
        )}

        {/* View 1: LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5" id="login-form">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {isAr ? 'البريد الإلكتروني' : 'VIP Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@luxury.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(null); }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3.5 px-6 rounded-2xl transition-all cursor-pointer shadow-lg shadow-slate-900/10"
              id="login-submit-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isAr ? 'تسجيل الدخول الآمن' : 'Authorize VIP Entry'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {isAr ? 'ليس لديك حساب VIP حتى الآن؟' : 'New to Sovereign Expeditions?'}
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(null); }}
                  className="ml-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {isAr ? 'إنشاء حساب جديد' : 'Register Credentials'}
                </button>
              </p>
            </div>
          </form>
        )}

        {/* View 2: REGISTER */}
        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" id="register-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'الاسم الكامل' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Lord Byron"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'VIP Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="guest@sovereign.com"
                    className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 ${
                      emailValidationError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {emailValidationError && (
                  <p className="text-[10px] font-semibold text-rose-500 mt-1" id="email-validation-error">
                    {emailValidationError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'رقم الهاتف' : 'Contact Phone'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'الجنسية' : 'Nationality'}
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="British / American"
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'اللغة المفضلة' : 'Preferred Language'}
                </label>
                <div className="relative">
                  <Languages className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={userLang}
                    onChange={(e) => setUserLang(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 appearance-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="pl">Polski (Polish)</option>
                    <option value="cs">Čeština (Czech)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {isAr ? 'كلمة المرور' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Secret Passphrase"
                    className={`w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 ${
                      passwordValidationError ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {passwordValidationError && (
                  <p className="text-[10px] font-semibold text-rose-500 mt-1" id="password-validation-error">
                    {passwordValidationError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {isAr ? 'سيرة ذاتية مختصرة / اهتمامات السفر' : 'Biography / Travel Preferences'}
              </label>
              <textarea
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={2}
                placeholder={isAr ? 'مثال: مهتم بالآثار الفرعونية القديمة، أفضل الرحلات الهادئة والخاصة.' : 'E.g. Ancient history enthusiast, preferring private scholar-guided tours with plant-based dining.'}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 space-y-3">
                <span className="text-[10px] font-black text-amber-600 tracking-wider uppercase block">
                  🛡️ {isAr ? 'استرداد كلمة المرور الفاخر والآمن' : 'Royal Recovery Protection'}
                </span>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isAr ? 'سؤال الأمان' : 'Security Question *'}
                  </label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                  >
                    {securityQuestionsList.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {isAr ? 'إجابة الأمان' : 'Security Answer *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Your Answer (Case-insensitive)"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer shadow-lg mt-2"
              id="register-submit-btn"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isAr ? 'إنشاء حساب العميل VIP' : 'Register VIP Credentials'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400">
                {isAr ? 'لديك حساب بالفعل؟' : 'Already have credentials?'}
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); }}
                  className="ml-1 text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        )}

        {/* View 3: FORGOT PASSWORD */}
        {view === 'forgot' && (
          <div className="space-y-5" id="forgot-password-module">
            {forgotStep === 1 ? (
              <form onSubmit={fetchSecurityQuestion} className="space-y-5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isAr 
                    ? 'أدخل بريدك الإلكتروني المسجل وسنقوم بسحب سؤال الأمان الذي قمت بإعداده لاسترداد حسابك بشكل آمن.' 
                    : 'Provide your registered VIP email address. We will retrieve your custom security question to authenticate password reset safely.'}
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {isAr ? 'البريد الإلكتروني' : 'VIP Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guest@sovereign.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setView('login'); setError(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-2xl transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isAr ? 'عودة' : 'Back'}</span>
                  </button>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3 px-6 rounded-2xl transition-all cursor-pointer shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{isAr ? 'استرداد سؤال الأمان' : 'Fetch Security Question'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <span className="text-[10px] font-black text-emerald-600 tracking-wider uppercase block mb-1">
                    🔒 {isAr ? 'سؤال الأمان الخاص بك' : 'Your Security Question'}
                  </span>
                  <p className="text-sm font-bold text-slate-800">{fetchedQuestion}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {isAr ? 'إجابتك للأمان' : 'Security Answer'}
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotAnswer}
                    onChange={(e) => setForgotAnswer(e.target.value)}
                    placeholder="Your Answer (Case-insensitive)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {isAr ? 'كلمة المرور الجديدة' : 'New VIP Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setFetchedQuestion(null); setError(null); }}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-6 rounded-2xl transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{isAr ? 'السابق' : 'Change Email'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-3 px-6 rounded-2xl transition-all cursor-pointer shadow-lg"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{isAr ? 'تأكيد تغيير كلمة المرور' : 'Confirm New Password'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
