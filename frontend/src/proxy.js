import { NextResponse } from "next/server.js";

function acceptsOrigin(request) {
    const site = request.headers.get("sec-fetch-site");
    if (site === "cross-site" || site === "same-site") return false;

    const origin = request.headers.get("origin");
    // Same-origin GETs and non-browser clients can omit Origin.
    if (origin === null) return true;

    const host = request.headers.get("host");
    if (!host) return false;

    try {
        // NextURL normalizes loopback names, so use Host, not X-Forwarded-Host.
        const destination = new URL(`${request.nextUrl.protocol}//${host}`);
        const source = new URL(origin);
        return ["http:", "https:"].includes(destination.protocol)
            && !destination.username && !destination.password
            && destination.pathname === "/" && !destination.search && !destination.hash
            && origin === source.origin
            && source.origin === destination.origin;
    } catch {
        return false;
    }
}

export function proxy(request) {
    if (!acceptsOrigin(request)) {
        return NextResponse.json(
            { code: "ORIGIN_NOT_ALLOWED", message: "A origem desta solicitação não é permitida." },
            { status: 403 },
        );
    }

    // Origin has been checked at the browser-facing boundary. The existing
    // rewrite now forwards a server-to-server request, keeping its Bearer token.
    const headers = new Headers(request.headers);
    headers.delete("origin");
    return NextResponse.next({ request: { headers } });
}

export const config = {
    matcher: "/api/:path*",
};
