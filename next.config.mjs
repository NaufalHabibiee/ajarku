/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push({
      '@supabase/supabase-js': '@supabase/supabase-js',
    });
    return config;
  },
};

module.exports = nextConfig;