"use client";

import * as React from "react";
import { getTimezoneOptions } from "@/lib/timezones";

export function TimezoneSelect({
  value,
  onChange,
  className = "",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  id?: string;
}) {
  const options = React.useMemo(() => getTimezoneOptions(), []);
  const merged = React.useMemo(() => {
    if (value && !options.includes(value)) {
      return [value, ...options].sort((a, b) => a.localeCompare(b));
    }
    return options;
  }, [options, value]);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-300 ${className}`}
    >
      {merged.map((tz) => (
        <option key={tz} value={tz}>
          {tz}
        </option>
      ))}
    </select>
  );
}
