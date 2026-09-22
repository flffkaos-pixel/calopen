import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Total Bookings"
          value="0"
          change="+0%"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Active Event Types"
          value="0"
          change="+0%"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Revenue"
          value="$0"
          change="+0%"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Conversion Rate"
          value="0%"
          change="+0%"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <div className="grid grid-cols-3 gap-4">
          <QuickAction
            title="Create Event Type"
            description="Set up your first bookable event"
            href="/dashboard/events/new"
          />
          <QuickAction
            title="Set Availability"
            description="Configure your working hours"
            href="/dashboard/availability"
          />
          <QuickAction
            title="Share Booking Link"
            description="Let others book time with you"
            href="/dashboard/settings"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500">{icon}</span>
        <span className="text-green-500 text-sm">{change}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </a>
  );
}
