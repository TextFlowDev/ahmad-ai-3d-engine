/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.amazonaws.com'
            },
            {
                protocol: 'https',
                hostname: '*.r2.cloudflarestorage.com'
            }
        ]
    },
    webpack: (config) => {
        // PlayCanvas needs canvas to be external in SSR
        config.externals = config.externals || [];
        if (typeof config.externals === 'object' && !Array.isArray(config.externals)) {
            config.externals = [config.externals];
        }
        return config;
    }
};

module.exports = nextConfig;
