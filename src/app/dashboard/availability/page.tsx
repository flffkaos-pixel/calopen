'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useLang, type DictKey } from '@/lib/i18n';

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

// 30-minute options, locale-independent 24h display (no AM/PM confusion)
const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const DAY_KEYS: DictKey[] = [
  'avail.day.0',
  'avail.day.1',
  'avail.day.2',
  'avail.day.3',
  'avail.day.4',
  'avail.day.5',
  'avail.day.6',
];

/** Options always include the stored value (DB may hold off-grid times). */
function optionsFor(stored: string): string[] {
  return TIME_OPTIONS.includes(stored) ? TIME_OPTIONS : [stored, ...TIME_OPTIONS];
}

export default function AvailabilityPage() {
  const { t } = useLang();
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
        <h1 className="text-2xl font-bold">{t('avail.title')}</h1>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm text-green-600">{t('avail.saved')} {savedAt}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? t('avail.saving') : t('avail.save')}
          </button>
        </div>
      </div>

      {/* Timezone */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('avail.timezone')}
        </label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg"
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

      {/* Weekly Schedule */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{t('avail.weekly')}</h2>
        </div>
        <div className="divide-y">
          {DAY_KEYS.map((key, index) => (
            <div key={key} className="p-4 flex items-center gap-4">
              <div className="w-24">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={schedule[index].enabled}
                    onChange={(e) => updateDay(index, 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium">{t(key)}</span>
                </label>
              </div>

              {schedule[index].enabled ? (
                <div className="flex items-center gap-2">
                  <select
                    value={schedule[index].startTime}
                    onChange={(e) => updateDay(index, 'startTime', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {optionsFor(schedule[index].startTime).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">{t('avail.to')}</span>
                  <select
                    value={schedule[index].endTime}
                    onChange={(e) => updateDay(index, 'endTime', e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {optionsFor(schedule[index].endTime).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-gray-500">{t('avail.unavailable')}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buffer Time */}
      <div className="bg-white rounded-xl border p-4 mt-6">
        <h2 className="font-semibold mb-4">{t('avail.buffer')}</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('avail.before')}</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option value={0}>{t('avail.none')}</option>
              <option value={5}>5 {t('avail.minutes')}</option>
              <option value={10}>10 {t('avail.minutes')}</option>
              <option value={15}>15 {t('avail.minutes')}</option>
              <option value={30}>30 {t('avail.minutes')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('avail.after')}</label>
            <select className="w-full px-3 py-2 border rounded-lg">
              <option value={0}>{t('avail.none')}</option>
              <option value={5}>5 {t('avail.minutes')}</option>
              <option value={10}>10 {t('avail.minutes')}</option>
              <option value={15}>15 {t('avail.minutes')}</option>
              <option value={30}>30 {t('avail.minutes')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
