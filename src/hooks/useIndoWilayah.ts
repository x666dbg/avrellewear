// src/hooks/useIndoWilayah.ts
import { useEffect, useMemo, useRef, useState } from "react";

export type Opt = { id: string; name: string };

type Defaults = { province?: string; city?: string; district?: string };

// Endpoints utama + mirror (urutan dicoba satu per satu)
const EP = {
  provinces: [
    "/api/wilayah?type=provinces",
    "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json",
    "https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/api/provinces.json",
    "https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/provinces.json",
    "https://fastly.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/provinces.json",
  ],
  regencies: (provId: string) => [
    `/api/wilayah?type=regencies&id=${provId}`,
    `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provId}.json`,
    `https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/api/regencies/${provId}.json`,
    `https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/regencies/${provId}.json`,
    `https://fastly.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/regencies/${provId}.json`,
  ],
  districts: (regId: string) => [
    `/api/wilayah?type=districts&id=${regId}`,
    `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regId}.json`,
    `https://raw.githubusercontent.com/emsifa/api-wilayah-indonesia/master/api/districts/${regId}.json`,
    `https://cdn.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/districts/${regId}.json`,
    `https://fastly.jsdelivr.net/gh/emsifa/api-wilayah-indonesia@master/api/districts/${regId}.json`,
  ],
};

// session cache biar hemat request
const getCache = <T,>(k: string): T | null => {
  try { const v = sessionStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch {}
  return null;
};
const setCache = (k: string, v: unknown) => {
  try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {}
};

// fetch dengan timeout & fallback ke mirror lain
async function fetchJsonWithFallback<T>(urls: string[], cacheKey: string, timeoutMs = 8000): Promise<T> {
  const cached = getCache<T>(cacheKey);
  if (cached) return cached;

  let lastErr: unknown = null;
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, { signal: ctrl.signal, headers: { "Cache-Control": "max-age=300" } });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as T;
      setCache(cacheKey, data);
      return data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Semua endpoint gagal.");
}

// normalizer & filter
const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/\s+/g, " ").trim();
const equalsLoose = (a: string, b: string) => {
  const A = norm(a), B = norm(b);
  return A === B || A.includes(B) || B.includes(A);
};
const findBest = (list: Opt[], name?: string) =>
  name ? list.find((x) => equalsLoose(x.name, name)) ?? null : null;
const filterList = (list: Opt[], q: string) => {
  const k = norm(q);
  if (!k) return list;
  return list.filter((x) => norm(x.name).includes(k));
};

export function useIndoWilayah(defaults?: Defaults) {
  const [provinces, setProvinces] = useState<Opt[]>([]);
  const [regencies, setRegencies] = useState<Opt[]>([]);
  const [districts, setDistricts] = useState<Opt[]>([]);

  const [prov, setProv] = useState<Opt | null>(null);
  const [city, setCity] = useState<Opt | null>(null);
  const [dist, setDist] = useState<Opt | null>(null);

  const [qProv, setQProv] = useState("");
  const [qCity, setQCity] = useState("");
  const [qDist, setQDist] = useState("");

  const [loading, setLoading] = useState<"prov" | "reg" | "dis" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const appliedDefaults = useRef(false);

  // Load provinces (pakai fallback)
  useEffect(() => {
    let canceled = false;
    (async () => {
      setLoading("prov");
      setError(null);
      try {
        const list = await fetchJsonWithFallback<Opt[]>(EP.provinces, "wilayah:provinces");
        if (!canceled) {
          setProvinces(list);
          if (!appliedDefaults.current && defaults?.province) {
            const p = findBest(list, defaults.province);
            if (p) setProv(p);
          }
        }
      } catch {
        if (!canceled) setError("Gagal memuat daftar provinsi.");
      } finally {
        if (!canceled) setLoading(null);
      }
    })();
    return () => { canceled = true; };
  }, [defaults?.province]);

  // Load regencies
  useEffect(() => {
    let canceled = false;
    if (!prov) {
      setRegencies([]); setCity(null);
      setDistricts([]); setDist(null);
      return;
    }
    (async () => {
      setLoading("reg");
      setError(null);
      const key = `wilayah:regencies:${prov.id}`;
      try {
        const list = await fetchJsonWithFallback<Opt[]>(EP.regencies(prov.id), key);
        if (!canceled) {
          setRegencies(list);
          if (!appliedDefaults.current && defaults?.city) {
            const c = findBest(list, defaults.city);
            if (c) setCity(c);
          } else {
            setCity(null);
          }
        }
      } catch {
        if (!canceled) setError("Gagal memuat daftar kota/kabupaten.");
      } finally {
        if (!canceled) setLoading(null);
      }
    })();
    return () => { canceled = true; };
  }, [prov?.id, defaults?.city]);

  // Load districts
  useEffect(() => {
    let canceled = false;
    if (!city) { setDistricts([]); setDist(null); return; }
    (async () => {
      setLoading("dis");
      setError(null);
      const key = `wilayah:districts:${city.id}`;
      try {
        const list = await fetchJsonWithFallback<Opt[]>(EP.districts(city.id), key);
        if (!canceled) {
          setDistricts(list);
          if (!appliedDefaults.current && defaults?.district) {
            const d = findBest(list, defaults.district);
            if (d) setDist(d);
            appliedDefaults.current = true;
          } else {
            setDist(null);
          }
        }
      } catch {
        if (!canceled) setError("Gagal memuat daftar kecamatan.");
      } finally {
        if (!canceled) setLoading(null);
      }
    })();
    return () => { canceled = true; };
  }, [city?.id, defaults?.district]);

  const provincesF = useMemo(() => filterList(provinces, qProv).slice(0, 100), [provinces, qProv]);
  const regenciesF = useMemo(() => filterList(regencies, qCity).slice(0, 100), [regencies, qCity]);
  const districtsF = useMemo(() => filterList(districts, qDist).slice(0, 100), [districts, qDist]);

  return {
    // data
    provinces: provincesF,
    regencies: regenciesF,
    districts: districtsF,
    // selected
    prov, setProv,
    city, setCity,
    dist, setDist,
    // queries
    qProv, setQProv,
    qCity, setQCity,
    qDist, setQDist,
    // ui
    loading, error, setError,
  };
}
