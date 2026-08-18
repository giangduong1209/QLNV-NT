"use client";

import React, { useState, useCallback } from "react";

export interface DatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  max?: string;
  size?: "sm" | "md";
  className?: string;
  id?: string;
  name?: string;
}

/**
 * Tự động phân tách và định dạng chuỗi ngày thành dd/mm/yyyy
 */
function formatInputToDate(raw: string): string {
  if (!raw) return "";

  // Nếu chuỗi có chứa dấu gạch chéo hoặc gạch ngang
  if (raw.includes("/") || raw.includes("-")) {
    const parts = raw.split(/[/ -]/);
    const dayPart = parts[0]?.replace(/\D/g, "").slice(0, 2) || "";

    if (parts.length === 1) {
      return dayPart;
    }

    if (parts.length === 2) {
      const allMonthDigits = parts[1]?.replace(/\D/g, "") || "";
      // Nếu người dùng gõ số thứ 3 vào tháng (VD: "18/082" -> tự động chuyển sang "18/08/2")
      if (allMonthDigits.length > 2) {
        const actualMonth = allMonthDigits.slice(0, 2);
        const actualYear = allMonthDigits.slice(2, 6);
        return `${dayPart}/${actualMonth}/${actualYear}`;
      }
      if (raw.endsWith("/") && !allMonthDigits) {
        return `${dayPart}/`;
      }
      return `${dayPart}/${allMonthDigits}`;
    }

    // parts.length >= 3: có ngày, tháng, năm
    const monthPart = parts[1]?.replace(/\D/g, "").slice(0, 2) || "";
    const yearPart = parts.slice(2).join("").replace(/\D/g, "").slice(0, 4);

    if (raw.endsWith("/") && !yearPart) {
      return `${dayPart}/${monthPart}/`;
    }
    return `${dayPart}/${monthPart}/${yearPart}`;
  }

  // Người dùng gõ toàn bộ là số liên tiếp (không gõ dấu /)
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (!digits) return "";

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

/**
 * Component DatePicker cho định dạng ngày dd/mm/yyyy
 */
export function DatePicker({
  value = "",
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  readOnly = false,
  error = false,
  size = "md",
  className = "",
  id,
  name,
}: DatePickerProps) {
  const [text, setText] = useState<string>(value || "");
  const [prevValue, setPrevValue] = useState<string>(value || "");

  if (value !== prevValue) {
    setPrevValue(value || "");
    setText(value || "");
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly) return;
    const rawVal = e.target.value;

    // Tự động phân tách ngày/tháng/năm
    const formatted = formatInputToDate(rawVal);

    setText(formatted);
    onChange?.(formatted);
  };

  const handleBlur = useCallback(() => {
    if (disabled || readOnly) return;
    const trimmed = text.trim();
    if (!trimmed) {
      onChange?.("");
      return;
    }

    // Chuẩn hóa định dạng khi rời khỏi ô nhập (Blur)
    if (trimmed.includes("/")) {
      const parts = trimmed.split("/").map((p) => p.trim());
      if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
        let d = parseInt(parts[0], 10);
        let m = parseInt(parts[1], 10);
        let y = parseInt(parts[2], 10);

        if (d > 31) d = 31;
        if (d < 1) d = 1;
        if (m > 12) m = 12;
        if (m < 1) m = 1;
        if (y < 100) {
          y = y < 70 ? 2000 + y : 1900 + y;
        }

        const ddStr = String(d).padStart(2, "0");
        const mmStr = String(m).padStart(2, "0");
        const yyyyStr = String(y).padStart(4, "0");

        const normalized = `${ddStr}/${mmStr}/${yyyyStr}`;
        setText(normalized);
        onChange?.(normalized);
        return;
      }
    } else if (/^\d{8}$/.test(trimmed)) {
      const dd = trimmed.slice(0, 2);
      const mm = trimmed.slice(2, 4);
      const yyyy = trimmed.slice(4, 8);
      const normalized = `${dd}/${mm}/${yyyy}`;
      setText(normalized);
      onChange?.(normalized);
      return;
    } else if (/^\d{6}$/.test(trimmed)) {
      const dd = trimmed.slice(0, 2);
      const mm = trimmed.slice(2, 4);
      const yy = parseInt(trimmed.slice(4, 6), 10);
      const yyyy = yy < 70 ? 2000 + yy : 1900 + yy;
      const normalized = `${dd}/${mm}/${yyyy}`;
      setText(normalized);
      onChange?.(normalized);
      return;
    }

    onChange?.(text);
  }, [text, disabled, readOnly, onChange]);

  const sizeClass = size === "sm" ? "text-xs h-[34px] px-2 min-w-0" : "";
  const errorClass = error ? "ql-input-error" : "";

  return (
    <input
      type="text"
      id={id}
      name={name}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      maxLength={10}
      className={`text-left font-medium ${sizeClass} ${errorClass} ${className}`.trim()}
      suppressHydrationWarning
    />
  );
}
