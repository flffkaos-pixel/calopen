'use client';

import { useState } from 'react';
import { Save, Copy, Check, ExternalLink } from 'lucide-react';
import { PayPalCheckout } from '@/components/paypal-checkout';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/username`;

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
        <h2 className="font-semibold mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Timezone</label>
            <select className="w-full px-4 py-2 border rounded-lg">
              <option>UTC</option>
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
              <option>Europe/London</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Week Starts</label>
            <select className="w-full px-4 py-2 border rounded-lg">
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Link */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">Your Booking Link</h2>
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
        <h2 className="font-semibold mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Free Plan</p>
            <p className="text-sm text-gray-500">1 user, unlimited event types</p>
          </div>
          <div className="w-64">
            <PayPalCheckout
              planId={process.env.NEXT_PUBLIC_PAYPAL_TEAMS_PLAN_ID || ''}
              userId="current-user-id"
              onSuccess={() => window.location.reload()}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
