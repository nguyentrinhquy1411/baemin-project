/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
          {
            source: '/',
            destination: '/dashboard',
            permanent: true, // Đặt là false nếu bạn muốn điều hướng tạm thời (HTTP 302)
          },
        ]
      },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'via.placeholder.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'picsum.photos',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'source.unsplash.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'img.freepik.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'cdn.pixabay.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '8080',
            pathname: '/**',
          },
        ],
        domains: ['images.unsplash.com', 'via.placeholder.com', 'picsum.photos', 'source.unsplash.com', 'img.freepik.com', 'cdn.pixabay.com', 'localhost'],
    },
 };

export default nextConfig;
