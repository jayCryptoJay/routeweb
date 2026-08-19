import { APIProvider } from "@vis.gl/react-google-maps";
import { ReactNode } from "react";

export const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
export const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function MapWrapper({ children }: { children: ReactNode }) {
  if (!hasValidKey) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-2xl border border-sky-400/20 bg-[#05070b]/60 font-sans text-slate-200">
        <div className="max-w-[520px] text-center p-4">
          <h2 className="text-lg font-bold text-sky-300">Google Maps API Key Required</h2>
          <p className="mt-2 text-sm"><strong>Step 1:</strong> <a className="underline text-sky-400" href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p className="mt-2 text-sm"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul className="mt-2 text-left text-xs space-y-1 bg-black/40 p-3 rounded-xl border border-white/10">
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code className="text-sky-300 font-bold">GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p className="mt-3 text-xs text-slate-400">The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      {children}
    </APIProvider>
  );
}
