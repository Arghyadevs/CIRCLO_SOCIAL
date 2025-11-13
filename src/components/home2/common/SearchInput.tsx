// src/components/home2/common/SearchInput.tsx
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  onChange,
  value,
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white/80 backdrop-blur-md outline-none focus:ring-2 focus:ring-purple-500 transition"
      />
    </div>
  );
}
