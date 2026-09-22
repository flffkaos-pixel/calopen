'use client';

import { useState } from 'react';
import { Check, X, Clock, User } from 'lucide-react';

interface Booking {
  id: string;
  eventTitle: string;
  bookerName: string;
  bookerEmail: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export default function BookingsPage() {
  const [bookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
          <p className="text-gray-600">
            Bookings will appear here once people start scheduling with you
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Event</th>
                <th className="text-left p-4 font-medium text-gray-600">Booker</th>
                <th className="text-left p-4 font-medium text-gray-600">Time</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-right p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="p-4">{booking.eventTitle}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{booking.bookerName}</p>
                      <p className="text-sm text-gray-500">{booking.bookerEmail}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p>{booking.startTime}</p>
                    <p className="text-sm text-gray-500">{booking.endTime}</p>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="p-4 text-right">
                    {booking.status === 'pending' && (
                      <div className="flex gap-1 justify-end">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                          <Check className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || ''}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
