'use client';

import { useState, use } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'date' | 'time' | 'details' | 'confirm'>('date');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: '',
  });

  // Mock data - in real app, fetch from API
  const eventTypes = [
    { id: '1', title: '30 Minute Meeting', duration: 30, description: 'A quick 30-minute meeting' },
    { id: '2', title: '60 Minute Consultation', duration: 60, description: 'A full hour consultation' },
  ];

  const [selectedEvent, setSelectedEvent] = useState(eventTypes[0]);

  // Generate time slots for selected date
  const timeSlots: TimeSlot[] = selectedDate
    ? Array.from({ length: 18 }, (_, i) => {
        const hour = 9 + Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        return {
          time: `${hour.toString().padStart(2, '0')}:${minute}`,
          available: Math.random() > 0.3, // Mock availability
        };
      })
    : [];

  const weekStart = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Create booking
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            You've booked {selectedEvent.title} on {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}.
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
          <h1 className="text-2xl font-bold">{username}'s Booking Page</h1>
          <p className="text-gray-600">Select a date and time for your appointment</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Event Type Selection */}
        {step === 'date' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Select Event Type</h2>
            <div className="grid gap-4">
              {eventTypes.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setStep('date');
                  }}
                  className={`text-left p-4 border rounded-lg ${
                    selectedEvent.id === event.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {event.duration} minutes
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
              onClick={() => setSelectedDate(null)}
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
                onClick={() => setSelectedDate(day)}
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
              Available times for {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  disabled={!slot.available}
                  onClick={() => {
                    setSelectedTime(slot.time);
                    setStep('details');
                  }}
                  className={`py-2 px-4 rounded-lg border ${
                    slot.available
                      ? 'hover:border-blue-500 hover:bg-blue-50'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  } ${selectedTime === slot.time ? 'border-blue-500 bg-blue-50' : ''}`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking Form */}
        {step === 'details' && selectedDate && selectedTime && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">Enter your details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
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
                  {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
