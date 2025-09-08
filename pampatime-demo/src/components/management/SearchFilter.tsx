import React, { useState } from 'react';

interface SearchFilterProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string; 
}

const SearchFilter = ({ onSearch, placeholder = "Pesquisar...", className }: SearchFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  return (
    <div className={`relative ${className || ''}`}> 
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
     
        className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
   
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};

export default SearchFilter;