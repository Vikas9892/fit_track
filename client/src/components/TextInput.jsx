import { CloseRounded, Visibility, VisibilityOff } from "@mui/icons-material";
import React, { useState } from "react";

const TextInput = ({
  label,
  placeholder,
  name,
  value,
  error,
  handelChange,
  textArea,
  rows,
  columns,
  chipableInput,
  chipableArray,
  removeChip,
  height,
  small,
  popup,
  password,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 flex-1 ${small ? "gap-1" : ""}`}>
      {label && (
        <label className={`
          px-1 font-medium
          ${small ? "text-[10px]" : "text-xs"}
          ${error ? "text-red-500" : "text-neutral-800"}
          ${popup ? "text-neutral-400" : ""}
        `}>
          {label}
        </label>
      )}
      
      <div className={`
        rounded-lg border bg-transparent text-neutral-800 flex items-center gap-3 transition-all duration-300
        focus-within:border-secondary
        ${small ? "px-2.5 py-2 rounded-md" : "p-4"}
        ${error ? "border-red-500" : "border-neutral-400"}
        ${chipableInput ? "flex-col items-start min-h-[100px] bg-white" : ""}
        ${popup ? "border-neutral-500 text-neutral-300" : ""}
      `} style={height ? { minHeight: height } : {}}>
        
        {chipableInput ? (
          <div className="flex flex-wrap gap-1.5 w-full">
            {chipableArray?.map((chip, index) => (
              <div key={index} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs flex items-center gap-1 cursor-pointer transition-all duration-300 hover:bg-primary/20">
                <span>{chip}</span>
                <CloseRounded
                  className="!text-sm"
                  onClick={() => removeChip(name, index)}
                />
              </div>
            ))}
            <input
              className="w-full bg-transparent outline-none border-none text-sm placeholder:text-neutral-400"
              placeholder={placeholder}
              name={name}
              value={value}
              onChange={(e) => handelChange(e)}
            />
          </div>
        ) : (
          <>
            {textArea ? (
              <textarea
                className={`w-full bg-transparent outline-none border-none placeholder:text-neutral-400 resize-none ${small ? "text-xs" : "text-sm"}`}
                name={name}
                rows={rows || 3}
                placeholder={placeholder}
                value={value}
                onChange={(e) => handelChange(e)}
              />
            ) : (
              <input
                className={`w-full bg-transparent outline-none border-none placeholder:text-neutral-400 ${small ? "text-xs" : "text-sm"}`}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={(e) => handelChange(e)}
                type={password && !showPassword ? "password" : "text"}
              />
            )}
            
            {password && (
              <div className="cursor-pointer text-neutral-500 hover:text-neutral-800 transition-colors">
                {showPassword ? (
                  <Visibility className="!text-xl" onClick={() => setShowPassword(false)} />
                ) : (
                  <VisibilityOff className="!text-xl" onClick={() => setShowPassword(true)} />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <p className={`px-1 text-red-500 ${small ? "text-[10px]" : "text-xs"}`}>
          {error}
        </p>
      )}
    </div>
  );
};


export default TextInput;
