'use client';

import { useState, use, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { useLang } from '@/lib/i18n';

interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration: number;
  price: number;
  currency: string;
}

interface Slot {
  start: string;
  end: string;
}

function toLocal(d: Date): string {
  return `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { t } = useLang();
  const [hostName, setHostName] = useState<string>(username);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState<'date' | 'details' | 'confirm'>('date');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  useEffect(() => {
    fetch(`/api/public/${encodeURIComponent(username)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Host not found' : 'Failed to load');
        return r.json();
      })
      .then((data) => {
        setHostName(data.host?.name || username);
        setEventTypes(data.eventTypes || []);
        setSelectedEvent((data.eventTypes || [])[0] || null);
        if ((data.eventTypes || []).length === 0) {
          setLoadError('This host has no bookable events yet.');
        }
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoadingEvents(false));
  }, [username]);

  useEffect(() => {
    if (!selectedDate || !selectedEvent) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    fetch(
      `/api/public/${encodeURIComponent(username)}/slots?eventId=${selectedEvent.id}&date=${toLocal(selectedDate)}`
    )
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedEvent, username]);

  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedSlot) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/public/${encodeURIComponent(username)}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          bookerName: formData.name,
          bookerEmail: formData.email,
          bookerNotes: formData.notes,
          startTime: selectedSlot.start,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setStep('confirm');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t('book.loading')}</p>
      </div>
    );
  }

  if (loadError || !selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-2">{t('book.unavailable')}</h1>
          <p className="text-gray-600">{loadError || t('book.noTimes')}</p>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('book.confirmed')}</h1>
          <p className="text-gray-600 mb-6">
            You&apos;ve booked {selectedEvent.title} on{' '}
            {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at{' '}
            {selectedSlot && format(new Date(selectedSlot.start), 'HH:mm')}.
          </p>
          <p className="text-sm text-gray-500">
            A confirmation email has been sent to {formData.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">{hostName}</h1>
          <p className="text-gray-600">{t('book.dateTime')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Type Selection */}
        {step === 'date' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">{t('book.selectEvent')}</h2>
            <div className="grid gap-4">
              {eventTypes.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setSelectedSlot(null);
                  }}
                  className={`text-left p-4 border rounded-lg ${
                    selectedEvent.id === event.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {event.duration} {t('common.minutes')}
                    {event.price > 0 && (
                      <span className="ml-2 font-semibold">
                        {(event.price / 100).toFixed(2)} {event.currency.toUpperCase()}
                      </span>
                    )}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5" />
              Back
            </button>
            <h3 className="font-semibold">
              {format(weekStart, 'MMMM yyyy')}
            </h3>
            <button className="text-gray-600 hover:text-gray-900">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {weekDays.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setSelectedSlot(null);
                }}
                className={`py-3 rounded-lg text-center ${
                  selectedDate && isSameDay(day, selectedDate)
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">
              {t('book.availableTimes')} {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            {loadingSlots ? (
              <p className="text-gray-500 text-sm">{t('book.loadingTimes')}</p>
            ) : slots.length === 0 ? (
              <p className="text-gray-500 text-sm">{t('book.noTimes')}</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => {
                  const label = format(new Date(slot.start), 'HH:mm');
                  const active = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setStep('details');
                      }}
                      className={`py-2 px-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 ${
                        active ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Booking Form */}
        {step === 'details' && selectedDate && selectedSlot && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">{t('book.details')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('book.name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('book.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{t('book.notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>{selectedEvent.title}</strong> on{' '}
                  {format(selectedDate, 'MMMM d, yyyy')} at{' '}
                  {format(new Date(selectedSlot.start), 'HH:mm')}
                </p>
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? t('book.booking') : t('book.confirm')}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
