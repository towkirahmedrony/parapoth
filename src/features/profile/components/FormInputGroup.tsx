import React from 'react';

interface FormInputGroupProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  isTextArea?: boolean;
  type?: string;
}

const FormInputGroup: React.FC<FormInputGroupProps> = React.memo(({ 
  label, name, value, onChange, placeholder, disabled, icon, isTextArea, type 
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
      {label}
    </label>
    <div className="relative">
      {isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full rounded-xl p-3 text-sm focus:ring-2 focus:outline-none transition-all focus:ring-[var(--dyn-primary)] disabled:opacity-50"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)',
            color: 'var(--dyn-text)'
          }}
        />
      ) : (
        <input 
          type={type || "text"} 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-xl p-3.5 text-sm focus:ring-2 focus:outline-none disabled:opacity-50 transition-all focus:ring-[var(--dyn-primary)]"
          style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dyn-text) 3%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dyn-text) 15%, transparent)',
            color: 'var(--dyn-text)',
            colorScheme: 'var(--dyn-color-scheme, light)'
          }}
        />
      )}
      {icon && <span className="absolute right-4 top-3.5 text-lg">{icon}</span>}
    </div>
  </div>
));

FormInputGroup.displayName = 'FormInputGroup';
export default FormInputGroup;
