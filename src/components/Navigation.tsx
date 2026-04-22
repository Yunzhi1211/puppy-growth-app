import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Heart, MessageCircle, PawPrint } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/timeline', icon: PawPrint, label: '成长' },
    { path: '/health', icon: Heart, label: '健康' },
    { path: '/calendar', icon: Calendar, label: '日历' },
    { path: '/chat', icon: MessageCircle, label: '聊天' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
