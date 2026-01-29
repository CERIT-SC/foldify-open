/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
            {
                source: "/api/:path*",
                destination: process.env.NODE_ENV === "production" ? "http://flask:8080/api/:path*" : process.env.DEV_API_URL + "/api/:path*",
            },
        ];
    },
};

export default nextConfig;
