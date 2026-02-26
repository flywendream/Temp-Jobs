import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  authDisplay?: {
    loggedIn: boolean;
    name?: string;
    roleLabel?: string;
  };
  onAuthClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, authDisplay, onAuthClick }) => {
  const loggedIn = authDisplay?.loggedIn;
  const displayName = authDisplay?.name || (loggedIn ? '已登录用户' : '');
  const roleLabel = authDisplay?.roleLabel;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold tracking-tight shadow-sm">
              T
            </div>
            <div>
              <div className="font-semibold text-slate-900">灵活 Temp-Jobs</div>
              <div className="text-xs text-slate-500">按小时计费的灵活用工平台</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-600">
            <span>企业招人</span>
            <span>灵活用工</span>
            <button
              type="button"
              onClick={onAuthClick}
              className="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-50 text-xs"
            >
              {loggedIn ? `${displayName}${roleLabel ? ` · ${roleLabel}` : ''}` : '登录 / 注册'}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-slate-400 flex justify-between">
          <span>© {new Date().getFullYear()} 灵活 Temp-Jobs</span>
          <span>本 Demo 为前端原型，数据为模拟数据</span>
        </div>
      </footer>
    </div>
  );
};

