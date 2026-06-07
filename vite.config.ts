import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["buckflo_favicon.svg", "buckflo_appicon.svg"],
      manifest: {
        name: "Buckflo",
        short_name: "Buckflo",
        description: "Personal expense tracker for daily budgeting",
        theme_color: "#1f1f1e",
        background_color: "#1f1f1e",
        display: "standalone",
        display_override: ["standalone"],
        orientation: "portrait",
        start_url: "/home",
        scope: "/",
        shortcuts: [
          {
            name: "Add Transaction",
            short_name: "Add",
            url: "/add",
            icons: [{ src: "buckflo_favicon.svg", sizes: "96x96", type: "image/svg+xml" }],
          },
          {
            name: "View Insights",
            short_name: "Insights",
            url: "/insights",
            icons: [{ src: "buckflo_favicon.svg", sizes: "96x96", type: "image/svg+xml" }],
          },
          {
            name: "Monthly Budget",
            short_name: "Budget",
            url: "/monthly",
            icons: [{ src: "buckflo_favicon.svg", sizes: "96x96", type: "image/svg+xml" }],
          },
        ],
        icons: [
          {
            src: "buckflo_appicon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "buckflo_appicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "buckflo_appicon.svg",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        importScripts: ["/sw-click-handler.js"],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
