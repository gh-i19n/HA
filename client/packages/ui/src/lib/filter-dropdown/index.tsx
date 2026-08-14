import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/select";
import type { ReactNode } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProperties {
  value: string;
  onValueChange: (value: string) => void;
  options?: FilterOption[];
  placeholder?: string;
  width?: string;
  disabled?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
  size?: "sm" | "default" | "lg";
}

export const FilterDropdown = ({
  value,
  onValueChange,
  options,
  placeholder = "Filter",
  width = "w-28",
  disabled = false,
  icon,
  ariaLabel,
  size = "default",
}: FilterDropdownProperties) => {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={width} aria-label={ariaLabel} size={size}>
        {icon}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
