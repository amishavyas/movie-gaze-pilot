// utils/api.js
const BASE = "http://localhost:5001";

export const post = async (path, body = null) => {
    const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
    });

    let data = {};
    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
    }

    if (data?.status === "error") {
        throw new Error(data?.error || data?.message || "Request failed");
    }

    return data;
};