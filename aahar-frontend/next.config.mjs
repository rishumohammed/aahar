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
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");
    const backendHost = cleanApiUrl.replace(/\/api$/, "");
    return [
      {
        source:      "/api/:path*",
        destination: `${cleanApiUrl}/:path*`,
      },
      {
        source:      "/uploads/:path*",
        destination: `${backendHost}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
