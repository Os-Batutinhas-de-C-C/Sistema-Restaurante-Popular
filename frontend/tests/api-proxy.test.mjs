import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";
import { proxy } from "../src/proxy.js";

function request(headers = {}, url = "http://localhost:3000/api/auth/login") {
    return new NextRequest(url, { headers: { host: "localhost:3000", ...headers } });
}

test("same-origin requests remove Origin upstream and retain authentication headers", () => {
    const response = proxy(request({
        origin: "http://localhost:3000",
        "sec-fetch-site": "same-origin",
        authorization: "Bearer test-token",
        "content-type": "application/json",
    }));
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.has("x-middleware-request-origin"), false);
    assert.equal(response.headers.get("x-middleware-request-authorization"), "Bearer test-token");
    assert.equal(response.headers.get("x-middleware-request-content-type"), "application/json");
    assert.equal(response.headers.has("authorization"), false);
});

test("uses the actual Host for numeric loopback and IPv6 origins", () => {
    for (const host of ["127.0.0.1:3000", "[::1]:3000"]) {
        const response = proxy(request({ host, origin: `http://${host}` }));
        assert.equal(response.headers.get("x-middleware-next"), "1");
    }
});

test("accepts an HTTPS origin only for an HTTPS request", () => {
    const response = proxy(request(
        { host: "restaurant.example", origin: "https://restaurant.example" },
        "https://restaurant.example/api/auth/login",
    ));
    assert.equal(response.headers.get("x-middleware-next"), "1");
});

for (const origin of [
    "https://unrelated.example", "http://localhost:5173", "https://localhost:3000",
    "http://localhost:3000.unrelated.example", "http://127.0.0.1:3000",
    "null", "", "malformed", "http://localhost:3000/", "http://localhost:3000/path",
    "http://localhost:3000?query=1", "http://localhost:3000#fragment",
    "http://user@localhost:3000", "http://localhost:3000, https://unrelated.example",
]) {
    test(`rejects a mismatched or invalid Origin: ${JSON.stringify(origin)}`, async () => {
        const response = proxy(request({ origin }));
        assert.equal(response.status, 403);
        assert.equal((await response.json()).code, "ORIGIN_NOT_ALLOWED");
        assert.equal(response.headers.has("x-middleware-next"), false);
    });
}

test("does not trust X-Forwarded-Host to authorize an unrelated origin", () => {
    const response = proxy(request({
        origin: "https://unrelated.example",
        "x-forwarded-host": "unrelated.example",
    }));
    assert.equal(response.status, 403);
});

test("keeps requests without Origin working for same-origin GETs and API clients", () => {
    for (const site of [undefined, "same-origin", "none"]) {
        const headers = site ? { "sec-fetch-site": site } : {};
        assert.equal(proxy(request(headers)).headers.get("x-middleware-next"), "1");
    }
});

test("rejects cross-origin Fetch Metadata even when Origin is absent", () => {
    for (const site of ["cross-site", "same-site"]) {
        assert.equal(proxy(request({ "sec-fetch-site": site })).status, 403);
    }
});

test("rejects a supplied Origin when Host is absent or malformed", () => {
    const withoutHost = request({ origin: "http://localhost:3000" });
    withoutHost.headers.delete("host");
    assert.equal(proxy(withoutHost).status, 403);
    for (const host of ["", "bad host", "user@localhost:3000", "localhost:3000/path"]) {
        assert.equal(proxy(request({ host, origin: "http://localhost:3000" })).status, 403);
    }
});
