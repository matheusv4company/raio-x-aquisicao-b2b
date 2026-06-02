"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { searchSegments, normalizeText } from "@/lib/segments";

interface SegmentComboboxProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SegmentCombobox({ value, onChange, error }: SegmentComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const results = useMemo(() => searchSegments(query, 40), [query]);

  const hasExact = results.some(
    (r) => normalizeText(r.label) === normalizeText(query),
  );
  const showCustom = query.trim().length >= 2 && !hasExact;

  const items: { label: string; group?: string; custom?: boolean }[] = [
    ...results,
    ...(showCustom ? [{ label: query.trim(), custom: true }] : []),
  ];

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(label: string) {
    onChange(label);
    setQuery(label);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (open && items[highlight]) {
        e.preventDefault();
        select(items[highlight].label);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Busque: oftalmologia, advogado tributário, contabilidade…"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 ${
          error ? "border-red-400" : "border-zinc-300"
        }`}
      />
      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
          {items.map((it, i) => (
            <li key={`${it.label}-${i}`}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(it.label)}
                className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm ${
                  i === highlight ? "bg-zinc-100" : ""
                }`}
              >
                {it.custom ? (
                  <span className="text-zinc-700">
                    Usar “<strong>{it.label}</strong>”
                  </span>
                ) : (
                  <>
                    <span className="text-zinc-900">{it.label}</span>
                    {it.group && (
                      <span className="text-xs text-zinc-400">{it.group}</span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
