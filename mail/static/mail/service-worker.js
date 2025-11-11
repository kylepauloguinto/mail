self.addEventListener("install", () => {
  console.log("Service worker installed.");
});

self.addEventListener("fetch", () => {});
self.addEventListener("activate", () => {
  console.log("Service worker activated.");
});
