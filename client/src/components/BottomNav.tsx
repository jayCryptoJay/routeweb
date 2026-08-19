import { Home, List, MapPinned } from "lucide-react";
import { useLocation } from "wouter";

const tabs = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/stops", label: "Stops", icon: List },
  { path: "/map", label: "Map", icon: MapPinned },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();
  return (
    <nav className="border-t border-white/10 bg-[#0b111b]/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)] shrink-0">
      <div className="mx-auto flex max-w-lg">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? location === "/" : location.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all active:scale-95 ${active ? "text-sky-300" : "text-slate-500"}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={21} strokeWidth={active ? 2.6 : 2} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
