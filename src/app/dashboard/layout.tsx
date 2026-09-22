import Link from 'next/link';
import { Calendar, Settings, Users, BarChart3, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex items-center gap-2 p-4 border-b">
          <Calendar className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold">CalOpen</span>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink href="/dashboard" icon={<BarChart3 className="h-5 w-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/events" icon={<Calendar className="h-5 w-5" />}>
            Event Types
          </NavLink>
          <NavLink href="/dashboard/availability" icon={<Users className="h-5 w-5" />}>
            Availability
          </NavLink>
          <NavLink href="/dashboard/bookings" icon={<Calendar className="h-5 w-5" />}>
            Bookings
          </NavLink>
          <NavLink href="/dashboard/settings" icon={<Settings className="h-5 w-5" />}>
            Settings
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full">
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
    >
      {icon}
      {children}
    </Link>
  );
}
