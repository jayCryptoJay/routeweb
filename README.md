# RouteWeb Delivery

RouteWeb is a **local-first iPhone delivery companion** for the fixed Belleair Bluffs / Largo newspaper route. Its default release build opens directly without a platform login, preserves the published delivery order, hands each stop to Apple Maps or Google Maps, and saves delivery progress in the browser on the driver’s phone.

## Use on iPhone

Open the deployed URL in **Safari**, then choose **Share → Add to Home Screen**. Open the RouteWeb icon before a route, choose **Drive Mode**, use Apple Maps for turn-by-turn navigation, and mark each delivery only when safely parked or stopped.

The route includes **162 stops** in a locked sequence. Progress is saved only in the iPhone’s browser storage. It is retained after closing the app, but it is cleared if Safari website data is cleared or if the in-app **Reset this phone’s route progress** action is used.

## Release build

The default scripts produce the standalone static app suitable for secure static hosting:

```bash
npm install --legacy-peer-deps
npm run build
npm run preview
```

Vercel uses the included `vercel.json` rewrite so home-screen launches and direct links reach the app. The repository also retains the former full-stack development commands as `npm run dev:full` and `npm run build:full` for future backend work.

## Validation

The release has passed TypeScript checks, automated route tests, production build verification, and a browser workflow check confirming that marking a stop delivered advances the fixed sequence and persists after refresh.
