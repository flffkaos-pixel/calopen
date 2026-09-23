'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({
    0: { enabled: false, startTime: '09:00', endTime: '17:00' },
    1: { enabled: true, startTime: '09:00', endTime: '17:00' },
    2: { enabled: true, startTime: '09:00', endTime: '17:00' },
    3: { enabled: true, startTime: '09:00', endTime: '17:00' },
    4: { enabled: true, startTime: '09:00', endTime: '17:00' },
    5: { enabled: true, startTime: '09:00', endTime: '17:00' },
    6: { enabled: false, startTime: '09:00', endTime: '17:00' },
  });

  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/availability')
      .then((r) => r.json())
      .then((data) => {
        const rows: { dayOfWeek: number; startTime: string; endTime: string; isActive: boolean }[] =
          data.schedule || [];
        if (rows.length > 0) {
          setSchedule((prev) => {
            const next = { ...prev };
            for (const row of rows) {
              next[row.dayOfWeek] = {
                enabled: row.isActive,
                startTime: row.startTime,
                endTime: row.endTime,
              };
            }
            return next;
          });
        }
      })
      .catch(() => {});
  }, []);

  const updateDay = (day: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(schedule).map(([day, s]) => ({
        dayOfWeek: Number(day),
        startTime: s.startTime,
        endTime: s.endTime,
        enabled: s.enabled,
      }));
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: payload }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      setSavedAt(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Availability</h1>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm text-green-600">Saved {savedAt}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Timezone */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Berlin">Berlin (CET)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
        </select>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Weekly Hours</h2>
        </div>
        <div className="divide-y">
          {DAYS.map((day, index) => (
            <div key={day} className="p-4 flex items-center gap-4">
              <div className="w-24">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule[index].enabled}
                    onChange={(e) => updateDay(index, 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium">{day}</span>
                </label>
              </div>

              {schedule[index].enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={schedule[index].startTime}
                    onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={schedule[index].endTime}
                    onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              ) : (
                <span className="text-gray-500">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buffer Time */}
      <div className="bg-white rounded-xl border p-4 mt-6">
        <h2 className="font-semibold mb-4">Buffer Time</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Before event</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option value={0}>None</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">After event</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option value={0}>None</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
