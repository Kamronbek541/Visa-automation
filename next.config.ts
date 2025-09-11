// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;



// import type { NextConfig } from "next";
// const withNextIntl = require('next-intl/plugin')();

// const nextConfig: NextConfig = {
//   /* ваши текущие опции конфигурации */
// };

// // Экспортируем с настройкой next-intl
// export default withNextIntl(nextConfig);



import type { NextConfig } from "next";
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);