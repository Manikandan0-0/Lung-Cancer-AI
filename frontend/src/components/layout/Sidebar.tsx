import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  History,
  Binary,
  Settings,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { BackendConnectionStatus } from '../../types/api';

interface SidebarProps {
  backendStatus: BackendConnectionStatus;
  onOpenSettings: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  backendStatus,
  onOpenSettings,
  className = '',
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');

  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      tab: null,
      icon: LayoutDashboard,
      active: location.pathname === '/dashboard' && !currentTab,
    },
    {
      name: 'CT Scan Analyzer',
      path: '/analyzer',
      tab: null,
      icon: ScanLine,
      active: location.pathname === '/analyzer',
    },
    {
      name: 'Analysis History',
      path: '/dashboard?tab=history',
      tab: 'history',
      icon: History,
      active: location.pathname === '/dashboard' && currentTab === 'history',
    },
    {
      name: 'Model Information',
      path: '/model',
      tab: null,
      icon: Binary,
      active: location.pathname === '/model',
    },
    {
      name: 'About Project',
      path: '/about',
      tab: null,
      icon: HelpCircle,
      active: location.pathname === '/about',
    },
  ];

  return (
    <aside
      className={`w-64 shrink-0 bg-[#253237] border-r border-[#5C6B73]/30 flex flex-col justify-between p-4 ${className}`}
    >
      <div className="space-y-6">
        {/* Navigation Section */}
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-semibold text-[#C2DFE3] uppercase tracking-wider mb-2">
            Clinical AI Platform
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  item.active
                    ? 'bg-[#5C6B73] text-white shadow-md shadow-[#5C6B73]/30 border-l-4 border-[#9DB4C0]'
                    : 'text-[#E0FBFC] hover:text-white hover:bg-[#5C6B73]/20'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? 'text-[#9DB4C0]' : 'text-[#C2DFE3]'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              location.pathname === '/dashboard' && currentTab === 'settings'
                ? 'bg-[#5C6B73] text-white'
                : 'text-[#E0FBFC] hover:text-white hover:bg-[#5C6B73]/20'
            }`}
          >
            <Settings className="w-4 h-4 text-[#C2DFE3]" />
            <span>FastAPI Settings</span>
          </button>
        </div>

        {/* Backend Quick Status */}
        <div className="p-3.5 rounded-xl bg-[#1b2529] border border-[#5C6B73]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#C2DFE3]">ML Engine</span>
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : backendStatus === 'checking'
                  ? 'bg-[#9DB4C0] animate-ping'
                  : 'bg-rose-400'
              }`}
            />
          </div>
          <div className="text-xs font-semibold text-white">
            ResNet50 + Grad-CAM
          </div>
          <div className="text-[11px] text-[#E0FBFC]/80 flex items-center justify-between">
            <span>Status:</span>
            <span
              className={`font-medium ${
                backendStatus === 'connected'
                  ? 'text-emerald-300'
                  : backendStatus === 'checking'
                  ? 'text-[#9DB4C0]'
                  : 'text-rose-300'
              }`}
            >
              {backendStatus === 'connected'
                ? 'Online'
                : backendStatus === 'checking'
                ? 'Connecting...'
                : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="pt-4 border-t border-[#5C6B73]/30">
        <div className="p-3 rounded-xl bg-[#5C6B73]/15 border border-[#9DB4C0]/20 text-[11px] text-[#E0FBFC] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#9DB4C0]">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Research Prototype</span>
          </div>
          <p className="text-[10px] text-[#C2DFE3] leading-snug">
            Not for clinical decisions. In-memory processing only.
          </p>
        </div>
      </div>
    </aside>
  );
};
