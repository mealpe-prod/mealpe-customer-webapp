import React, { useState } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const CustomInput = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  showPasswordToggle = false,
  readOnly = false
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = showPasswordToggle && showPassword ? 'text' : type;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 ${showPasswordToggle ? 'pr-10' : ''} ${!readOnly ? 'border border-gray-300 rounded-lg focus:outline-none focus:ring-[#FF583A] focus:border-[#FF583A]' : 'rounded-lg outline-none focus:outline-none focus:ring-0'} ${className}`}
          style={{ borderRadius: '0.5rem' }}
          required={required}
          readOnly={readOnly}
        />
        {showPasswordToggle && type === 'password' && (
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <VisibilityOffIcon fontSize="small" />
            ) : (
              <VisibilityIcon fontSize="small" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomInput; 