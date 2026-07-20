"use client";

import { useRef } from "react";

interface TimePickerProps {
  value: string; // "HH:MM" — 24h format
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function TimePicker({
  value,
  onChange,
  className = "",
  size = "md",
}: TimePickerProps) {
  const [hh, mm] = value ? value.split(":") : ["", ""];
  const minuteInputRef = useRef<HTMLInputElement>(null);

  const handleHour = (h: string) => {
    let clean = h.replace(/\D/g, "").slice(0, 2);
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 23) {
      clean = "23";
    }
    onChange(`${clean}:${mm || "00"}`);

    // Auto-focus minutes if 2 digits are entered
    if (clean.length === 2 && minuteInputRef.current) {
      minuteInputRef.current.focus();
      minuteInputRef.current.select();
    }
  };

  const handleMinute = (m: string) => {
    let clean = m.replace(/\D/g, "").slice(0, 2);
    const num = parseInt(clean, 10);
    if (!isNaN(num) && num > 59) {
      clean = "59";
    }
    onChange(`${hh || "00"}:${clean}`);
  };

  const padValue = (val: string, max: number) => {
    if (!val) return "00";
    let clean = val.replace(/\D/g, "");
    let num = parseInt(clean, 10);
    if (isNaN(num)) return "00";
    if (num > max) num = max;
    return String(num).padStart(2, "0");
  };

  const handleHourBlur = (currentVal: string) => {
    const padded = padValue(currentVal, 23);
    onChange(`${padded}:${mm || "00"}`);
  };

  const handleMinuteBlur = (currentVal: string) => {
    const padded = padValue(currentVal, 59);
    onChange(`${hh || "00"}:${padded}`);
  };

  return (
    <div className={`ql-timepicker ql-timepicker--${size} ${className}`}>
      <input
        type="text"
        value={hh}
        onChange={(e) => handleHour(e.target.value)}
        onBlur={(e) => handleHourBlur(e.target.value)}
        placeholder="--"
        maxLength={2}
        aria-label="Giờ"
      />
      <span className="ql-timepicker-sep">:</span>
      <input
        ref={minuteInputRef}
        type="text"
        value={mm}
        onChange={(e) => handleMinute(e.target.value)}
        onBlur={(e) => handleMinuteBlur(e.target.value)}
        placeholder="--"
        maxLength={2}
        aria-label="Phút"
      />
    </div>
  );
}
