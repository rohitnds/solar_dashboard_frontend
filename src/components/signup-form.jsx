// src/components/auth/SignupForm.jsx
"use client";

import { useState } from "react";
import { Formik } from "formik";
import { signupSchema, defaultSignupValues } from "@/schema/signup.schema";
import { apiPost } from "@/lib/api";
import { COUNTRIES } from "@/lib/COUNTRIES";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/PasswordField";
import { GalleryVerticalEnd } from "lucide-react";

/* shadcn Select imports (adjust paths if your setup differs) */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

export function SignupForm({ className, ...props }) {
  const [serverError, setServerError] = useState(null);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Formik
        initialValues={defaultSignupValues}
        validate={(values) => {
          const result = signupSchema.safeParse(values);
          if (!result.success) {
            return result.error.flatten().fieldErrors;
          }
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setServerError(null);
          try {
            // Build payload according to your API expectations
            const payload = {
              full_name: values.full_name,
              email: values.email,
              phone_code: values.phone_code,
              phone_number: values.phone_number,
              password: values.password,
            };

            const res = await apiPost("/api/auth/signup", payload);
            // handle success (example: redirect to login)
            // Cookies.set("user_auth", res.token) // if backend returns token
            window.location.href = "/login";
          } catch (err) {
            // Prefer inspecting err.response.data for structured messages
            const msg =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              "Signup failed. Please check your details.";
            setServerError(msg);

            // Example: map backend field errors to formik
            const fieldErrors = err?.response?.data?.errors;
            if (fieldErrors && typeof fieldErrors === "object") {
              setErrors(fieldErrors);
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleSubmit,
          handleChange,
          setFieldValue,
          isSubmitting,
        }) => (
          <form noValidate onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a href="#" className="flex flex-col items-center gap-2 font-medium">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">Solor Smart</span>
                </a>
                <h1 className="text-xl font-bold">Create an account</h1>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Full name */}
                <div className="grid gap-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Jane Doe"
                    value={values.full_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.full_name && touched.full_name && (
                    <p className="text-red-500 text-sm">{errors.full_name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    value={values.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Phone: country code select + number */}
                <div className="grid gap-2">
                  <Label>Phone</Label>

                  <div className="flex gap-2">
                    {/* Country code select (shadcn) */}
                    <div style={{ minWidth: 140 }}>
                      <Select
                        value={values.phone_code}
                        onValueChange={(val) => setFieldValue("phone_code", val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.id} value={c.code}>
                              <span className="mr-2">{c.flag}</span>
                              <span className="mr-2">{c.code}</span>
                              <span className="text-sm text-muted-foreground">{c.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Phone number */}
                    <div className="flex-1">
                      <Input
                        id="phone_number"
                        name="phone_number"
                        placeholder="2112322343"
                        value={values.phone_number}
                        onChange={handleChange}
                        required
                      />
                      
                    </div>
                  </div>
                  {errors.phone_number && touched.phone_number && (
                        <p className="text-red-500 text-sm">{errors.phone_number}</p>
                      )}
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <PasswordField
                    value={values.password}
                    onChange={handleChange}
                    error={touched.password && errors.password}
                  />
                </div>

                {/* Confirm password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="Confirm password"
                    value={values.confirm_password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                  />
                  {errors.confirm_password && touched.confirm_password && (
                    <p className="text-red-500 text-sm">{errors.confirm_password}</p>
                  )}
                </div>

                {serverError && (
                  <div className="text-red-600 text-sm text-center">{serverError}</div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create account"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Formik>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By creating an account, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}

export default SignupForm;
