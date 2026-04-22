import React from 'react';
import { ChevronDownIcon } from '../Icon';
import './Select.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div className="select-container">
      {label && <label className="select-label">{label}</label>}
      <div className="select-wrapper">
        <select className="select-field" {...props}>
          <option value="" disabled>Selecione uma opção</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="select-icon">
          <ChevronDownIcon size={18} />
        </div>
      </div>
    </div>
  );
};
