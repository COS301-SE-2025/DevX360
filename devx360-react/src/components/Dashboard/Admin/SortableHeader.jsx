import {ChevronDown, ChevronUp} from "lucide-react";
import React from "react";

const SortableHeader = ({ field, currentField, direction, onClick, children }) => {
  return (
      <th
          className="px-6 py-4 text-left text-sm font-semibold text-[var(--text)] uppercase tracking-wider cursor-pointer hover:bg-[var(--bg)] transition-colors"
          onClick={onClick}
      >
        <div className="flex items-center">
          {children}
          {currentField === field && (
              direction === 'asc' ?
                  <ChevronUp className="w-4 h-4 ml-1"/> :
                  <ChevronDown className="w-4 h-4 ml-1"/>
          )}
        </div>
      </th>
  );
};

export default SortableHeader;