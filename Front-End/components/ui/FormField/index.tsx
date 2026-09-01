import React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: string;
  as?: "input" | "select" | "textarea";
  options?: { value: string | number; label: string }[];
}

export const FormField = React.forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, FormFieldProps>(
  ({ label, error, as = "input", options, className = "", ...props }, ref) => {
    return (
      <div className={`form-group ${className}`}>
        <label className="form-label">{label}</label>
        
        {as === "select" ? (
          <select className="form-input" ref={ref as React.Ref<HTMLSelectElement>} {...props}>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : as === "textarea" ? (
          <textarea 
            className="form-input" 
            ref={ref as React.Ref<HTMLTextAreaElement>} 
            rows={3}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} 
          />
        ) : (
          <input className="form-input" ref={ref as React.Ref<HTMLInputElement>} {...props} />
        )}

        {error && <span style={{ color: "var(--red-400)", fontSize: "12px", marginTop: "4px" }}>{error}</span>}
      </div>
    );
  }
);
FormField.displayName = "FormField";
