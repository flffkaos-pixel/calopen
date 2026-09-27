'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, XCircle, CheckCircle } from 'lucide-react';
import { useLang } from '@/lib/i18n';

interface BookingInfo {
  id: string;
  eventTitle: string;
  startTime: string;
  endTime: string;
  status: string;
  bookerName: string;
}

function ManageContent() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t('manage.invalid'));
      setLoading(false);
      return;
    }
    fetch(`/api/public/bookings/manage?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load');
        setBooking(data.booking);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleCancel = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch('/api/public/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancel failed');
      setCancelled(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t('book.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border p-8 max-w-md w-full">
        {error || !booking ? (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">{t('manage.unavailable')}</h1>
            <p className="text-gray-600 text-sm">{error || t('manage.invalid')}</p>
          </div>
        ) : cancelled || booking.status === 'cancelled' ? (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">{t('manage.cancelled')}</h1>
            <p className="text-gray-600 text-sm">{booking.eventTitle}</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{booking.eventTitle}</h1>
                <p className="text-sm text-gray-500">{booking.bookerName}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <p>
                <strong>{t('manage.when')}:</strong>{' '}
                {new Date(booking.startTime).toLocaleString()} –{' '}
                {new Date(booking.endTime).toLocaleTimeString()}
              </p>
              <p className="mt-1">
                <strong>{t('manage.status')}:</strong> {booking.status}
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={`w-full py-3 rounded-lg font-semibold disabled:opacity-50 ${
                confirming
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-red-600 text-red-600 hover:bg-red-50'
              }`}
            >
              {cancelling
                ? t('manage.cancelling')
                : confirming
                  ? t('manage.confirmCancel')
                  : t('manage.cancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ManageContent />
    </Suspense>
  );
}
