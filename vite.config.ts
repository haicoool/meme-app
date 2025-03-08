import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            devOptions: {
                enabled: true,
            },
            manifest: {
                name: "MemeApp",
                short_name: "MemeApp",
                description: "A fun meme app to view and save memes",
                theme_color: "#ffffff",
                background_color: "#ffffff",
                display: "standalone",
                icons: [
                    {
                        src: "/icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/icons/icon-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                ],
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^http:\/\/192\.168\.0\.9:3000\/.*/, // Update with your meme API
                        handler: "CacheFirst",
                        options: {
                            cacheName: "meme-api-cache",
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 86400, // 1 day
                            },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 3000,
    },
});
