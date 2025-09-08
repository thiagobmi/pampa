
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  className?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, className }) => {
  return (
    <Button 
      variant="outline" 
      className={`flex items-center justify-between bg-white border-gray-300 h-9 text-sm font-normal hover:bg-gray-50 ${className}`}
    >
      <span>{label}</span>
      <ChevronDown size={16} className="text-gray-500" />
    </Button>
  );
};

export default FilterDropdown;
