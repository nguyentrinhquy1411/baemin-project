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

 };

export default nextConfig;
