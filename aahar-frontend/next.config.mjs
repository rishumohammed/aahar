/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },   // S3 CDN
      { protocol: "https", hostname: "picsum.photos" },       // Dev placeholders
      { protocol: "https", hostname: "images.unsplash.com" }, // Unsplash
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google OAuth avatars
      { protocol: "http", hostname: "localhost" }, // Local backend
    ],
  },
  async rewrites() {
    return [
      {
        source:      "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/:path*`,
      },
      {
        source:      "/uploads/:path*",
        destination: `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace('/api', '')}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
