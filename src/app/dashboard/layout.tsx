'use client';

import Link from 'next/link';
import { Calendar, Settings, Users, BarChart3, LogOut } from 'lucide-react';
import { useLang, LangToggle, type DictKey } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLang();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const links: { href: string; icon: React.ReactNode; label: DictKey }[] = [
    { href: '/dashboard', icon: <BarChart3 className="h-5 w-5" />, label: 'dash.dashboard' },
    { href: '/dashboard/events', icon: <Calendar className="h-5 w-5" />, label: 'dash.events' },
    { href: '/dashboard/availability', icon: <Users className="h-5 w-5" />, label: 'dash.availability' },
    { href: '/dashboard/bookings', icon: <Calendar className="h-5 w-5" />, label: 'dash.bookings' },
    { href: '/dashboard/settings', icon: <Settings className="h-5 w-5" />, label: 'dash.settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">CalOpen</span>
          </div>
          <LangToggle />
        </div>

        <nav className="p-4 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900"
            >
              {l.icon}
              {t(l.label)}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full"
          >
            <LogOut className="h-5 w-5" />
            {t('dash.signout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
