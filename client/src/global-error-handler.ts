window.addEventListener('error', (event) => {
  console.error("GLOBAL ERROR CATCH:", event.error?.stack || event.error);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error("GLOBAL REJECTION CATCH:", event.reason?.stack || event.reason);
});
