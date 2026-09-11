import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Разрешаем dev-серверу отдавать JS с этих адресов — иначе Next.js
  // блокирует cross-origin запросы к /_next/* и страница не гидрируется
  // (кнопки визуально есть, но не реагируют на клики) при заходе не через localhost.
  allowedDevOrigins: ["127.0.0.1", "192.168.0.198"],
};

export default nextConfig;
