/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  },
  experimental: {
    largePageDataBytes: 128 * 100000 // 128 KB
  }
}

module.exports = nextConfig