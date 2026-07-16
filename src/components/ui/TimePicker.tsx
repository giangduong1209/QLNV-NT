"use client";

interface TimePickerProps {
  value: string; // "HH:MM" — 24h format
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function TimePicker({
  value,
  onChange,
  className = "",
  size = "md",
}: TimePickerProps) {
  const [hh, mm] = value ? value.split(":") : ["", ""];

  const handleHour = (h: string) => onChange(`${h}:${mm || "00"}`);
  const handleMinute = (m: string) => onChange(`${hh || "00"}:${m}`);

  return (
    <div className={`ql-timepicker ql-timepicker--${size} ${className}`}>
      <select
        value={hh ?? ""}
        onChange={(e) => handleHour(e.target.value)}
        aria-label="Giờ"
      >
        {!hh && <option value="" disabled></option>}
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="ql-timepicker-sep">:</span>
      <select
        value={mm ?? ""}
        onChange={(e) => handleMinute(e.target.value)}
        aria-label="Phút"
      >
        {!mm && <option value="" disabled></option>}
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
