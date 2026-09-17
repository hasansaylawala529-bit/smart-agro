import React, { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wheat,
  CloudSun,
  FlaskConical,
  TrendingUp,
  Bug,
  Store,
  Landmark,
  FileText,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNavItems = [
  { path: "/", icon: LayoutDashboard, label: "nav.dashboard" },
  { path: "/crop", icon: Wheat, label: "nav.crop" },
];

const secondaryNavItems = [
  { path: "/soil", icon: FlaskConical, label: "nav.soil" },
  { path: "/yield", icon: TrendingUp, label: "nav.yield" },
  { path: "/disease", icon: Bug, label: "nav.disease" },
  { path: "/market", icon: Store, label: "nav.market" },
  { path: "/schemes", icon: Landmark, label: "nav.schemes" },
  { path: "/reports", icon: FileText, label: "nav.reports" },
];

const footerNavItems = [
  { path: "/profile", icon: UserCircle, label: "nav.profile" },
  { path: "/settings", icon: Settings, label: "nav.settings" },
];

const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-[#1c3324] dark:bg-[#0f1f15] flex flex-col shrink-0 transition-all duration-300 relative shadow-xl border-r border-emerald-900/30",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {/* Core Priority Navigation (Spec Section 34) */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mb-1">
              Core Platform
            </p>
          )}
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  "hover:bg-white/10 hover:translate-x-0.5",
                  isActive
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-emerald-100/80 hover:text-white"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{t(item.label)}</span>}
            </NavLink>
          ))}
        </div>

        {/* Secondary Farm Tools & Services */}
        <div className="space-y-1 pt-2 border-t border-emerald-800/40">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mb-1">
              Farm Decision Tools
            </p>
          )}
          {secondaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  "hover:bg-white/10 hover:translate-x-0.5",
                  isActive
                    ? "bg-emerald-700/80 text-white shadow-sm"
                    : "text-emerald-200/70 hover:text-white"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{t(item.label)}</span>}
            </NavLink>
          ))}
        </div>

        {/* Account & Settings */}
        <div className="space-y-1 pt-2 border-t border-emerald-800/40">
          {footerNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                  "hover:bg-white/10 hover:translate-x-0.5",
                  isActive
                    ? "bg-emerald-800/60 text-white"
                    : "text-emerald-300/60 hover:text-white"
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{t(item.label)}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-7 bg-emerald-700 border border-emerald-600 text-white rounded-full p-1.5 shadow-lg hover:bg-emerald-600 transition-all z-20"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
