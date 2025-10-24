// import {useAvatar} from "../../../hooks/useAvatar";
import {useRef, useState, useEffect} from "react";

const CustomDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
      <div className="relative" ref={dropdownRef}>
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)] flex items-center justify-between w-40 cursor-pointer"
        >
          <span>{selectedOption?.label}</span>
          <svg
              className={`w-4 h-4 text-[var(--text)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-[var(--bg-container)] border border-[var(--border)] rounded-lg shadow-lg">
              {options.map((option) => (
                  <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[var(--text)] hover:bg-[var(--bg)] first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                  >
                    {option.label}
                  </button>
              ))}
            </div>
        )}
      </div>
  );
};

export default CustomDropdown;