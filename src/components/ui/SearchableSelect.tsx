"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export function SearchableSelect({
  value = "",
  onChange,
  options,
  placeholder = "-- Chọn --",
  disabled = false,
  className = "",
  error = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tự động focus ô tìm kiếm khi mở popover
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const buttonClasses = [
    "ql-searchable-select-btn",
    isOpen ? "is-open" : "",
    error ? "ql-input-error" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={`ql-searchable-select ${isOpen ? "is-open" : ""} ${className}`}
      ref={containerRef}
    >
      {/* Nút bấm Combobox */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={buttonClasses}
        title={selectedOption ? selectedOption.label : placeholder}
      >
        <span className="truncate flex-1">
          {selectedOption ? (
            selectedOption.label
          ) : (
            <span className="opacity-60">{placeholder}</span>
          )}
        </span>
        <span className="ml-1 text-[10px] opacity-50 shrink-0">&#9660;</span>
      </button>

      {/* Popover chứa ô nhập từ khóa & danh sách tùy chọn */}
      {isOpen && !disabled && (
        <div className="ql-searchable-select-popover">
          <div className="ql-searchable-select-search-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Nhập để tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ql-searchable-select-search"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="ql-searchable-select-clear-btn"
              >
                &#10005;
              </button>
            )}
          </div>

          <div className="ql-searchable-select-list">
            {filteredOptions.length === 0 ? (
              <div className="ql-searchable-select-empty">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={`${opt.value}-${opt.label}`}
                    onClick={() => handleSelect(opt.value)}
                    className={`ql-searchable-select-option ${
                      isSelected ? "is-selected" : ""
                    }`}
                  >
                    {opt.label}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
