/** @type {import('next').NextConfig} */
const configuredBackendOrigin = process.env.BACKEND_API_BASE_URL;
const backendOrigin = configuredBackendOrigin || (
    process.env.NODE_ENV === "development" ? "http://localhost:8080" : ""
);

if (!backendOrigin) {
    throw new Error("Configure BACKEND_API_BASE_URL for the Next.js backend proxy.");
}

const parsedBackendOrigin = new URL(backendOrigin);
if (parsedBackendOrigin.pathname !== "/" || parsedBackendOrigin.search || parsedBackendOrigin.hash) {
    throw new Error("BACKEND_API_BASE_URL must be an origin without a path, query, or fragment.");
}
if (configuredBackendOrigin && configuredBackendOrigin !== parsedBackendOrigin.origin) {
    throw new Error("BACKEND_API_BASE_URL must not include a trailing slash or URL credentials.");
}

const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${parsedBackendOrigin.origin}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
