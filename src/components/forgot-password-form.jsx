import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { apiPost } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ----------------------------
// ZOD VALIDATION SCHEMA
// ----------------------------
const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

// ----------------------------
// COMPONENT
// ----------------------------
export default function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className="flex items-center shaddow shadow-xl rounded-xl p-5 justify-center">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <h1 className="text-xl font-bold">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we’ll send you reset instructions.
          </p>
        </div>

        {/* SUCCESS UI */}
        {successMessage && (
          <div className="p-3 text-sm text-green-600 bg-green-100 rounded-md">
            {successMessage}
          </div>
        )}

        <Formik
          initialValues={{ email: "" }}
          validationSchema={toFormikValidationSchema(ForgotPasswordSchema)}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const res = await apiPost("/api/auth/forgot-password", values);
              setSuccessMessage(res.message || "Reset link sent to your email!");
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">

              {/* EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-xs text-red-500"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>

            </Form>
          )}
        </Formik>

        <div className="text-center text-sm">
          <a href="/login" className="underline text-primary underline-offset-4">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
