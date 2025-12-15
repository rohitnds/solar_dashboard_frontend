import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Formik } from "formik";
import { loginSchema, defaultLoginValues } from "@/schema/login.schema";
import { apiPost } from "@/lib/api";
import PasswordField from "./PasswordField";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

export function LoginForm({ className, ...props }) {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate(); 
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Formik
        initialValues={defaultLoginValues}
        validate={(values) => {
          const result = loginSchema.safeParse(values);
          if (!result.success) {
            return result.error.flatten().fieldErrors;
          }
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const res = await apiPost("/api/auth/login", values);
            console.log("Login Success:", res);
            setAuth(res.data);

            // Save user auth token if backend returns token
            // Cookies.set("user_auth", res.token);

            navigate("/");
          } catch (err) {
            setErrors({ email: "Invalid credentials" });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleSubmit, handleChange, isSubmitting }) => (
          <form noValidate onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a href="#" className="flex flex-col items-center gap-2 font-medium">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">Solar Smart</span>
                </a>
                <h1 className="text-xl font-bold">Welcome to Solar Smart</h1>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    value={values.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
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
                <div className="self-end">
                  <Link to="/forgot-password" className="text-xs text-muted-foreground">Forgot your password?</Link>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Formik>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
