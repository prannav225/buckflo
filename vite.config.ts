import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["buckflo_favicon.png", "buckflo_appicon.png"],
      manifest: {
        name: "buckflo",
        short_name: "buckflo",
        description: "Personal expense tracker for daily budgeting",
        theme_color: "#d97757",
        background_color: "#0d0c0b",
        display: "standalone",
        orientation: "portrait",
        start_url: "/home",
        scope: "/",
        icons: [
          {
            src: "buckflo_appicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "buckflo_appicon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "buckflo_appicon.png",
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
