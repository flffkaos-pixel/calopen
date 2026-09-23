'use client';

import { useEffect, useState } from 'react';
import { Save, Copy, Check, ExternalLink } from 'lucide-react';
import { PayPalCheckout } from '@/components/paypal-checkout';
import { createClient } from '@/lib/supabase/client';
import { useLang } from '@/lib/i18n';

const TEAMS_PLAN_ID = process.env.NEXT_PUBLIC_PAYPAL_TEAMS_PLAN_ID || '';

export default function SettingsPage() {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileTimezone, setProfileTimezone] = useState('UTC');
  const [profileWeekStart, setProfileWeekStart] = useState(1);
  const [profileUsername, setProfileUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${profileUsername || 'username'}`;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.profile) {
          setProfileName(data.profile.name || '');
          setProfileEmail(data.profile.email || '');
          setProfileTimezone(data.profile.timezone || 'UTC');
          setProfileWeekStart(data.profile.weekStart ?? 1);
          setProfileUsername(data.profile.username || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          timezone: profileTimezone,
          weekStart: profileWeekStart,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setProfileMsg(t('sub.saved'));
    } catch (err: unknown) {
      setProfileMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Profile */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">{t('sub.profile')}</h2>
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.name')}</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              value={profileEmail}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Timezone</label>
            <select
              value={profileTimezone}
              onChange={(e) => setProfileTimezone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Seoul">Seoul (KST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Berlin">Berlin (CET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Week Starts</label>
            <select
              value={profileWeekStart}
              onChange={(e) => setProfileWeekStart(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {savingProfile ? t('sub.saving') : t('sub.save')}
          </button>
          {profileMsg && <span className="text-sm text-green-600">{profileMsg}</span>}
        </div>
      </div>

      {/* Booking Link */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">{t('sub.bookingLink')}</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={bookingUrl}
            readOnly
            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Calendar Integrations */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">Calendar Integrations</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                G
              </div>
              <div>
                <p className="font-medium">Google Calendar</p>
                <p className="text-sm text-gray-500">Sync your Google Calendar</p>
              </div>
            </div>
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              Connect
            </button>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                O
              </div>
              <div>
                <p className="font-medium">Outlook Calendar</p>
                <p className="text-sm text-gray-500">Sync your Outlook Calendar</p>
              </div>
            </div>
            <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              Connect
            </button>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">{t('sub.title')}</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{t('sub.current')}</p>
            <p className="font-medium">{t('sub.freeName')}</p>
            <p className="text-sm text-gray-500">{t('sub.freeDesc')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('sub.upgradeDesc')}</p>
          </div>
          <div className="w-64">
            <p className="text-sm font-medium mb-2">{t('sub.teamsName')}</p>
            {userId ? (
              <PayPalCheckout
                planId={TEAMS_PLAN_ID}
                userId={userId}
                onSuccess={() => window.location.reload()}
              />
            ) : (
              <p className="text-sm text-gray-500">{t('sub.loading')}</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
