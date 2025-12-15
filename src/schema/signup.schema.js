// src/schema/signup.schema.js
import { z } from "zod";

export const signupSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_code: z.string().nonempty("Select country code"),
    phone_number: z
      .string()
      .min(5, "Phone number is too short")
      .max(15, "Phone number is too long")
      .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/,
        "Password must contain letters, numbers and a special character"
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export const defaultSignupValues = {
  full_name: "",
  email: "",
  phone_code: "+91",
  phone_number: "",
  password: "",
  confirm_password: "",
};
