"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({ value, onChange, error, label, placeholder, id, name, ...rest }) {
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id ?? name ?? "password";
  const inputName = name ?? id ?? "password";

  return (
    <div className="w-full">
      <Label htmlFor={inputId}>{label ? label : "Password"}</Label>

      <div className="relative mt-2">
        <Input
          id={inputId}
          name={inputName}
          type={showPassword ? "text" : "password"}
          className="pr-10"
          placeholder={placeholder ? placeholder : "Enter your password"}
          value={value}
          onChange={onChange}
          {...rest}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
