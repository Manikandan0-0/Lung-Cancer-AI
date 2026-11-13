import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, ArrowRight, Shield, Layers, Info } from 'lucide-react';
import { BackendStatus } from '../common/BackendStatus';
import { BackendConnectionStatus } from '../../types/api';

interface NavbarProps {
  backendStatus: BackendConnectionStatus;
  baseUrl: string;
  onRecheckBackend: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  backendStatus,
  baseUrl,
  onRecheckBackend,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'CT Scan Analyzer', href: '/analyzer' },
    { name: 'Model Info', href: '/model' },
    { name: 'About', href: '/about' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#253237]/90 backdrop-blur-md border-b border-[#5C6B73]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5C6B73] to-[#9DB4C0] flex items-center justify-center shadow-lg shadow-[#9DB4C0]/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Pulmo<span className="text-[#9DB4C0]">Vision</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#5C6B73]/40 text-[#C2DFE3] border border-[#9DB4C0]/40 tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-[#C2DFE3] tracking-wider uppercase font-medium">
                ResNet50 • Grad-CAM Interpretability
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? 'bg-[#5C6B73] text-white shadow-sm shadow-[#5C6B73]/40'
                    : 'text-[#E0FBFC] hover:text-white hover:bg-[#5C6B73]/20'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action / Backend Status */}
          <div className="hidden md:flex items-center gap-3">
            <BackendStatus
              status={backendStatus}
              baseUrl={baseUrl}
              onRecheck={onRecheckBackend}
              compact
            />

            <Link
              to="/analyzer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#5C6B73] to-[#9DB4C0] text-white hover:from-[#475359] hover:to-[#C2DFE3] shadow-md shadow-[#9DB4C0]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <BackendStatus
              status={backendStatus}
              baseUrl={baseUrl}
              onRecheck={onRecheckBackend}
              compact
            />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#C2DFE3] hover:text-white hover:bg-[#5C6B73]/30 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#5C6B73]/40 bg-[#253237] px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#5C6B73] text-white'
                    : 'text-[#E0FBFC] hover:text-white hover:bg-[#5C6B73]/20'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10">
            <Link
              to="/analyzer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#5C6B73] to-[#9DB4C0] text-white shadow-md"
            >
              <span>Launch CT Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
