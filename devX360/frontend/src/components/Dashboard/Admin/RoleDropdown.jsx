import CustomDropdown from "./Dropdown";


const RoleDropdown = ({ value, onChange, options, disabled = false }) => {
  return (
      <div className="role-dropdown">
        <style jsx>{`
        .role-dropdown .relative button {
          width: 120px !important;
          font-size: 0.75rem !important;
          padding: 0.25rem 0.75rem !important;
        }
        .role-dropdown .relative button span {
          margin-right: 8px;
        }
        .role-dropdown .relative button svg {
          margin-left: auto;
        }
        .role-dropdown .relative button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .role-dropdown .absolute button {
          font-size: 0.75rem !important;
        }
      `}</style>
        <CustomDropdown
            value={value}
            onChange={onChange}
            options={options}
            disabled={disabled}
        />
      </div>
  );
};

export default RoleDropdown;