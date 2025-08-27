// src/app/api/wilayah/route.ts
import { NextResponse } from "next/server";

const UPSTREAM = {
  provinces: [
    "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json",
    "https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/api/provinces.json",
    "https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/provinces.json",
    "https://fastly.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/provinces.json",
  ],
  regencies: (provId: string) => [
    `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provId}.json`,
    `https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/api/regencies/${provId}.json`,
    `https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/regencies/${provId}.json`,
    `https://fastly.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/regencies/${provId}.json`,
  ],
  districts: (regId: string) => [
    `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regId}.json`,
    `https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/api/districts/${regId}.json`,
    `https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/districts/${regId}.json`,
    `https://fastly.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/districts/${regId}.json`,
  ],
};

async function fetchWithFallback(urls: string[], timeoutMs = 8000) {
  let lastErr: unknown = null;
  for (const url of urls) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "Cache-Control": "max-age=600" },
        // server-side fetch => CORS aman
        next: { revalidate: 60 * 60 * 24 }, // cache 1 hari di Next cache
      });
      clearTimeout(to);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return NextResponse.json(await res.json(), {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=600",
        },
      });
    } catch (e) {
      clearTimeout(to);
      lastErr = e;
    }
  }
  return NextResponse.json(
    { error: "Upstream wilayah tidak bisa diakses." },
    { status: 502 }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (type === "provinces") {
    return fetchWithFallback(UPSTREAM.provinces);
  }
  if (type === "regencies" && id) {
    return fetchWithFallback(UPSTREAM.regencies(id));
  }
  if (type === "districts" && id) {
    return fetchWithFallback(UPSTREAM.districts(id));
  }

  return NextResponse.json(
    { error: "Param tidak valid. Gunakan type=provinces|regencies|districts (+ id)." },
    { status: 400 }
  );
}
