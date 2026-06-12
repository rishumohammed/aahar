import * as React from "react"
import { cn } from "@/lib/utils"

export interface MaterialInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const MaterialInput = React.forwardRef<HTMLInputElement, MaterialInputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const inputId = id || `material-input-${label.replace(/\s+/g, '-').toLowerCase()}`;
    
    return (
      <div className="relative">
        <input
          type={type}
          id={inputId}
          className={cn(
            "block px-4 pb-2.5 pt-6 w-full text-base text-aahar-dark bg-transparent rounded-xl border border-aahar-border appearance-none focus:outline-none focus:ring-0 focus:border-aahar-teal peer transition-colors",
            className
          )}
          placeholder=" "
          ref={ref}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="absolute text-sm text-aahar-body/70 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-aahar-teal peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-4 peer-focus:scale-75 peer-focus:-translate-y-3 left-2 font-medium cursor-text"
        >
          {label}
        </label>
      </div>
    )
  }
)
MaterialInput.displayName = "MaterialInput"

export { MaterialInput }
