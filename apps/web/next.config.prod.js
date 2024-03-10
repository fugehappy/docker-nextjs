const path = require("node:path")
// const packageJSON = require('./package.json')

// const transpilePackages = Object.keys(packageJSON.dependencies).filter((it) => it.includes('@package/'))

module.exports = {
  /**
   * Dynamic configuration available for the browser and server.
   * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
   * @link https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
   */
  // publicRuntimeConfig: {
  //   NODE_ENV: process.env.NODE_ENV,
  // },
  reactStrictMode: true,
  transpilePackages: ['ul'],
  output: 'standalone', // standalone, export
  experimental: {
    /* Fixing file tracking in monorepo setup. Required for CMD node apps/web/server.js to work properly
     * @see https://nextjs.org/docs/advanced-features/output-file-tracing#caveats */
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    config.resolve.alias["@"] = path.resolve(__dirname, "../")

    return config
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.REACT_APP_PROD_URL, // 将此替换为你要请求的目标服务器的URL
      },
    ]
  },
}
