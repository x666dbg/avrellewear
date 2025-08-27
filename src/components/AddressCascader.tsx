// src/components/AddressCascader.tsx
import React from "react";
import { useIndoWilayah, Opt } from "@/hooks/useIndoWilayah";

type Props = {
  disabled?: boolean;
  defaults?: { province?: string; city?: string; district?: string };
  // kompatibel dengan handleInputChange milikmu
  onFieldChange: (e: { target: { name: string; value: string } }) => void;
};

export default function AddressCascader({ disabled, defaults, onFieldChange }: Props) {
  const A = useIndoWilayah(defaults);

  const last = React.useRef<{ province?: string; city?: string; district?: string }>({});

  React.useEffect(() => {
    if (A.prov?.name && last.current.province !== A.prov.name) {
      onFieldChange({ target: { name: "province", value: A.prov.name } });
      last.current.province = A.prov.name;
    }
  }, [A.prov?.name]); 

  React.useEffect(() => {
    if (A.city?.name && last.current.city !== A.city.name) {
      onFieldChange({ target: { name: "city", value: A.city.name } });
      last.current.city = A.city.name;
    }
  }, [A.city?.name]);

  React.useEffect(() => {
    if (A.dist?.name && last.current.district !== A.dist.name) {
      onFieldChange({ target: { name: "district", value: A.dist.name } });
      last.current.district = A.dist.name;
    }
  }, [A.dist?.name]);

  return (
    <div className="space-y-3">
      {A.error && (
        <div className="text-red-600 text-xs bg-red-50 border border-red-200 p-2 rounded">
          {A.error}
        </div>
      )}

      <SelectWithSearch
        label="Provinsi*"
        placeholder="Cari provinsi…"
        options={A.provinces}
        value={A.prov?.name || ""}
        query={A.qProv}
        onQueryChange={A.setQProv}
        onPick={(o) => {
          A.setProv(o);
          A.setQProv(o.name);   // <<< auto-isi input dengan pilihan
          A.setCity(null);
          A.setDist(null);
          A.setQCity("");       // <<< bersihin query bawahan
          A.setQDist("");
        }}
        disabled={disabled}
        loading={A.loading === "prov"}
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <SelectWithSearch
          label="Kota/Kabupaten*"
          placeholder={A.prov ? "Cari kota/kabupaten…" : "Pilih provinsi dulu"}
          options={A.regencies}
          value={A.city?.name || ""}
          query={A.qCity}
          onQueryChange={A.setQCity}
          onPick={(o) => {
            A.setCity(o);
            A.setQCity(o.name);  // <<< auto-isi
            A.setDist(null);
            A.setQDist("");
          }}
          disabled={disabled || !A.prov}
          loading={A.loading === "reg"}
        />

        <SelectWithSearch
          label="Kecamatan*"
          placeholder={A.city ? "Cari kecamatan…" : "Pilih kota/kabupaten dulu"}
          options={A.districts}
          value={A.dist?.name || ""}
          query={A.qDist}
          onQueryChange={A.setQDist}
          onPick={(o) => {
            A.setDist(o);
            A.setQDist(o.name);  // <<< auto-isi
          }}
          disabled={disabled || !A.city}
          loading={A.loading === "dis"}
        />
      </div>
    </div>
  );
}

function SelectWithSearch(props: {
  label: string;
  placeholder?: string;
  options: Opt[];
  value: string;
  query: string;
  onQueryChange: (q: string) => void;
  onPick: (opt: Opt) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const {
    label, placeholder, options, value,
    query, onQueryChange, onPick, disabled, loading
  } = props;

  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState<number>(-1);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handlePick = (opt: Opt) => {
    onPick(opt);
    onQueryChange(opt.name);
    setOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < options.length) {
        handlePick(options[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-1" ref={wrapRef}>
      <label className="text-xs font-medium">{label}</label>

      <input
        className="ui-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
          setHighlightIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoComplete="off"
      />

      {open && (
        <div
          className="max-h-48 mt-2 overflow-auto border rounded-lg divide-y dark:divide-slate-700"
          role="listbox"
        >
          {loading ? (
            <div className="p-2 text-sm opacity-60">Memuat…</div>
          ) : options.length === 0 ? (
            <div className="p-2 text-sm opacity-60">Tidak ada hasil…</div>
          ) : (
            options.map((opt, i) => {
              const selected = value === opt.name;
              const highlighted = i === highlightIndex;
              return (
                <button
                  type="button"
                  key={opt.id}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between
                    ${selected ? "bg-slate-50 dark:bg-slate-800" : ""}
                    ${highlighted ? "bg-slate-200 dark:bg-slate-700" : ""}
                  `}
                  onClick={() => handlePick(opt)}
                  role="option"
                  aria-selected={selected}
                >
                  <span>{opt.name}</span>
                  {selected && <span className="text-xs opacity-60">✔</span>}
                </button>
              );
            })
          )}
        </div>
      )}

      <input className="ui-input hidden" value={value} readOnly />
    </div>
  );
}