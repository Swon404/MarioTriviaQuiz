type Status = { update: boolean; offline: boolean; error: boolean };
let status: Status = { update: false, offline: false, error: false };
const listeners = new Set<() => void>();
function change(values: Partial<Status>) {
  status = { ...status, ...values };
  listeners.forEach(listener => listener());
}
export const pwaLifecycle = {
  onNeedRefresh: () => change({ update: true, error: false }),
  onOfflineReady: () => change({ offline: true, error: false }),
  onRegisterError: () => change({ error: true }),
};
export const pwaStatus = () => status;
export const subscribePwa = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
let registration: Promise<ServiceWorkerRegistration> | undefined;
let safeScreen = false;
let requestedHere = false;
export const setPwaSafe = (safe: boolean) => { safeScreen = safe; };
export function startPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator) || registration) return;
  // Reload only the tab that requested the update, and only at a safe screen.
  // A different tab activating a worker must not interrupt an active board.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (requestedHere && safeScreen) window.location.reload();
    else pwaLifecycle.onNeedRefresh();
  });
  registration = navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL, updateViaCache: 'none' });
  void registration.then(reg => {
    if (reg.waiting) pwaLifecycle.onNeedRefresh();
    const watch = () => {
      const worker = reg.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed') {
          if (navigator.serviceWorker.controller) pwaLifecycle.onNeedRefresh();
          else pwaLifecycle.onOfflineReady();
        }
      });
    };
    reg.addEventListener('updatefound', watch);
    watch();
  }).catch(pwaLifecycle.onRegisterError);
}
export async function applyPwaUpdate(safe: boolean) {
  if (!safe || !safeScreen || !status.update || !registration) return;
  try {
    const reg = await registration;
    if (!safeScreen) return;
    requestedHere = true;
    if (reg.waiting) {
      const worker = reg.waiting;
      worker.addEventListener('statechange', () => {
        // Prompt-mode workers need not claim existing clients on activation.
        if (worker.state === 'activated' && requestedHere && safeScreen) {
          requestedHere = false;
          window.location.reload();
        }
      });
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
    else window.location.reload(); // Another tab has already activated it.
  } catch { requestedHere = false; change({ error: true }); }
}
