"use client";

import { useState, useRef, useEffect } from "react";

export interface MultiSelectOption {
  id: number;
  name: string;
}

interface MultiSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  options: MultiSelectOption[];
  totalMax?: number;
  placeholder?: string;
}

export const MultiSelect = ({
  value,
  onChange,
  options,
  totalMax,
  placeholder = "Không chọn",
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse chuỗi các ID được chọn (ngăn cách bởi dấu phẩy)
  const selectedIds = value
    ? value
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  const selectedCount = selectedIds.length;
  const maxCount = totalMax ?? options.length;

  // Lấy nhãn hiển thị của các mục đã chọn
  const selectedNames = options
    .filter((item) => selectedIds.includes(String(item.id)))
    .map((item) => item.name);

  const displayText =
    selectedNames.length > 0 ? selectedNames.join(", ") : placeholder;

  // Đóng popover khi click ngoài component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOption = (itemId: number) => {
    const strId = String(itemId);
    let updatedIds: string[];
    if (selectedIds.includes(strId)) {
      updatedIds = selectedIds.filter((id) => id !== strId);
    } else {
      updatedIds = [...selectedIds, strId];
    }
    onChange(updatedIds.join(","));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative flex items-center" ref={containerRef}>
      {/* Nút bấm hiển thị Multi Select Box */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-36 text-xs pl-2 pr-11 py-1 bg-white border border-[#bbb] rounded cursor-pointer focus:outline-none focus:border-red-500 flex items-center justify-between text-left truncate"
        title={displayText}
      >
        <span className="truncate flex-1 text-slate-700">{displayText}</span>
      </button>

      {/* Badge đỏ hiển thị chỉ số k/N ở góc phải */}
      <div
        className="absolute right-1.5 pointer-events-none flex items-center gap-0.5 text-xs"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="text-red-600 font-bold">
          {selectedCount}/{maxCount}
        </span>
        <span className="text-slate-500 text-[9px]">▼</span>
      </div>

      {/* Dropdown Popover chứa danh sách tùy chọn kèm Checkbox */}
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 w-64 bg-white border border-slate-300 rounded shadow-lg p-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200">
            <span className="font-semibold text-slate-700">Lựa chọn:</span>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-red-600 hover:underline font-medium"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {options.map((optionItem) => {
              const isOptionChecked = selectedIds.includes(String(optionItem.id));
              return (
                <label
                  key={optionItem.id}
                  className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-100 cursor-pointer select-none text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={isOptionChecked}
                    onChange={() => handleToggleOption(optionItem.id)}
                    className="w-3.5 h-3.5 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer"
                  />
                  <span className="flex-1 leading-snug">{optionItem.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
