import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sliders,
  Bell,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { AppUser, ResidentPreferences, UserRole } from '../../types/firebase.ts';
import {
  signInAsGuest,
  loginWithEmail,
  registerWithEmail,
  logOut,
  updateUserPreferences,
  toggleUserRole,
} from '../../services/firebase.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onUserChange: (user: AppUser | null) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [tab, setTab] = useState<'signin' | 'register' | 'preferences'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('resident');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Preferences form state
  const [alertHeat, setAlertHeat] = useState(currentUser?.preferences.alertHeat ?? true);
  const [alertRain, setAlertRain] = useState(currentUser?.preferences.alertRain ?? true);
  const [alertAqi, setAlertAqi] = useState(currentUser?.preferences.alertAqi ?? true);
  const [preferredZone, setPreferredZone] = useState(
    currentUser?.preferences.preferredZone ?? 'Elmina Central Park'
  );

  if (!isOpen) return null;

  const handleGuestSignIn = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const user = await signInAsGuest(role);
      onUserChange(user);
      setSuccessMsg(`Signed in as ${role === 'township_manager' ? 'Township Manager' : 'Resident'}`);
      setTimeout(() => onClose(), 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sign in as guest');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let user: AppUser;
      if (tab === 'register') {
        if (!email || !password || !displayName) {
          throw new Error('Please fill all required fields');
        }
        user = await registerWithEmail(email, password, displayName, selectedRole);
        setSuccessMsg('Account created and logged in successfully!');
      } else {
        if (!email || !password) {
          throw new Error('Please enter email and password');
        }
        user = await loginWithEmail(email, password);
        setSuccessMsg('Logged in successfully!');
      }
      onUserChange(user);
      setTimeout(() => onClose(), 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const updated: ResidentPreferences = {
      alertHeat,
      alertRain,
      alertAqi,
      preferredZone,
    };

    try {
      await updateUserPreferences(currentUser.uid, updated);
      onUserChange({
        ...currentUser,
        preferences: updated,
      });
      setSuccessMsg('Preferences saved and synced to Cloud Firestore!');
      setTimeout(() => onClose(), 1000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchRole = async (nextRole: UserRole) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await toggleUserRole(currentUser.uid, nextRole);
      onUserChange({
        ...currentUser,
        role: nextRole,
        displayName: nextRole === 'township_manager' ? 'Elmina Township Manager' : 'Elmina Resident',
      });
      setSuccessMsg(`Role switched to ${nextRole === 'township_manager' ? 'Township Manager' : 'Resident'}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to switch role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logOut();
      onUserChange(null);
      setSuccessMsg('Signed out successfully.');
      setTimeout(() => onClose(), 600);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 bg-[#0C121E] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8102E] to-[#8C0B20] p-0.5 shadow-md flex items-center justify-center text-white">
              <div className="w-full h-full bg-[#0C121E] rounded-[10px] flex items-center justify-center">
                {currentUser?.role === 'township_manager' ? (
                  <ShieldCheck className="w-5 h-5 text-[#C8102E]" />
                ) : (
                  <User className="w-5 h-5 text-[#EAAA08]" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {currentUser ? 'Resident & Manager Profile' : 'ClimaSense Authentication'}
              </h3>
              <p className="text-xs text-slate-400">
                Firebase Authentication & Cloud Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation if logged in */}
        {currentUser && (
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setTab('preferences')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                tab === 'preferences'
                  ? 'border-[#C8102E] text-[#C8102E] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Preferences & Alerts
            </button>
            <button
              onClick={() => setTab('signin')}
              className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
                tab === 'signin'
                  ? 'border-[#C8102E] text-[#C8102E] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Account & RBAC Role
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* If Logged In: Profile & Role Switcher */}
          {currentUser && tab === 'signin' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Current User</span>
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {currentUser.role === 'township_manager' ? 'Township Manager' : 'Resident'}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{currentUser.displayName}</div>
                <div className="text-xs text-slate-500 font-mono">UID: {currentUser.uid}</div>
                <div className="text-xs text-slate-500">
                  Township: <span className="font-semibold text-slate-700 capitalize">{currentUser.townshipId}</span>
                </div>
              </div>

              {/* Hackathon RBAC Persona Switcher */}
              <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Instant Persona Switcher (Hackathon Evaluation)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Switch between Resident and Township Manager to test role-based permissions and Firestore access controls live.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchRole('resident')}
                    disabled={isLoading || currentUser.role === 'resident'}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      currentUser.role === 'resident'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">Resident Persona</div>
                    <div className="text-[10px] opacity-80">Log habits, earn points</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchRole('township_manager')}
                    disabled={isLoading || currentUser.role === 'township_manager'}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      currentUser.role === 'township_manager'
                        ? 'border-teal-700 bg-teal-700 text-white shadow-xs'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold">Township Manager</div>
                    <div className="text-[10px] opacity-80">Manage alerts & notes</div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Preferences Tab */}
          {currentUser && tab === 'preferences' && (
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Climate Alert Subscriptions</span>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Heat Stress Advisories</div>
                    <div className="text-[11px] text-slate-500">Alert when apparent heat index reaches Elevated / High</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertHeat}
                    onChange={(e) => setAlertHeat(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Flash Rain & Runoff Alerts</div>
                    <div className="text-[11px] text-slate-500">Notify during heavy convective thunderstorm surges</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertRain}
                    onChange={(e) => setAlertRain(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Particulate & Air Quality Warnings</div>
                    <div className="text-[11px] text-slate-500">Notify when modelled AQI or PM2.5 exceeds healthy ranges</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertAqi}
                    onChange={(e) => setAlertAqi(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Preferred Micro-Zone</span>
                </label>
                <select
                  value={preferredZone}
                  onChange={(e) => setPreferredZone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Elmina Central Park">Elmina Central Park (300-acre core)</option>
                  <option value="Elmina West Residential Precinct">Elmina West Residential Precinct</option>
                  <option value="Elmina Valley Lakeside">Elmina Valley Lakeside</option>
                  <option value="Denai Alam Active Spine">Denai Alam Active Spine</option>
                  <option value="Elmina East Commercial Hub">Elmina East Commercial Hub</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                <span>Save Preferences to Firestore</span>
              </button>
            </form>
          )}

          {/* Not Logged In: Quick Guest Review or Email Auth */}
          {!currentUser && (
            <div className="space-y-5">
              {/* One-Click Reviewer Access */}
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>One-Click Prototype Evaluation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign in instantly via anonymous Firebase Authentication with pre-configured permissions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGuestSignIn('resident')}
                    disabled={isLoading}
                    className="p-3 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-xl text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="text-xs font-bold text-emerald-900 group-hover:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                      <span>Elmina Resident</span>
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-emerald-100 mt-1">
                      Log habits, earn reward points, save preferences
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGuestSignIn('township_manager')}
                    disabled={isLoading}
                    className="p-3 bg-white hover:bg-teal-700 hover:text-white border border-teal-300 rounded-xl text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="text-xs font-bold text-teal-900 group-hover:text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 group-hover:text-white" />
                      <span>Township Manager</span>
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-teal-100 mt-1">
                      Manage micro-zone alerts, notes & thresholds
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-semibold">Or Email Sign In</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="flex border-b border-slate-200 text-xs font-semibold mb-2">
                  <button
                    type="button"
                    onClick={() => setTab('signin')}
                    className={`flex-1 pb-2 border-b-2 text-center ${
                      tab === 'signin' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className={`flex-1 pb-2 border-b-2 text-center ${
                      tab === 'register' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {tab === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Aisyah Rahman"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@elmina.my"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {tab === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Assign Initial Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                    >
                      <option value="resident">Resident</option>
                      <option value="township_manager">Township Manager</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>{tab === 'register' ? 'Create Account' : 'Sign In'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
