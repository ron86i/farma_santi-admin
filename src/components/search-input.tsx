import { Search as SearchIcon } from "lucide-react";
import { Input } from "./ui";

type SearchProps = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ placeholder = "Buscar...", value, onChange }: SearchProps) {
  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2  border"
      />
    </div>
  );
}

