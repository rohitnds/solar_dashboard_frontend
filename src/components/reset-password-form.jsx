import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useSearchParams } from "react-router-dom";
import { apiPatch, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import PasswordField from "@/components/PasswordField"; // update path if needed

// ----------------------------
// ZOD VALIDATION
// ----------------------------
const ResetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password too long"),
confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

// ----------------------------
// PAGE COMPONENT
// ----------------------------
export default function ResetPasswordForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [payload, setPayload] = useState(null);
  const [params] = useSearchParams();

    useEffect(() => {
    const encoded = params.get("payload");

    if (!encoded) return;

    try {
      const decoded = decodeURIComponent(encoded);
      const parsed = JSON.parse(decoded);
      setPayload(parsed);
    } catch (error) {
      console.error("Failed to decode payload:", error);
    }
  }, [params]);

  return (
    <div className="flex items-center shaddow shadow-xl rounded-xl p-5 justify-center">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <h1 className="text-xl font-bold">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password to continue.
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {successMessage && (
          <div className="p-3 text-sm bg-green-100 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        <Formik
          initialValues={{ new_password: "", confirm_password: "" }}
          validationSchema={toFormikValidationSchema(ResetPasswordSchema)}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // Add token later if needed
              const response = await apiPatch("/api/auth/forgot-password/set", {password: values.new_password}, false, {'fpid': payload.fpid, 'fpt': payload.fpt}, true );
              setSuccessMessage(response.message || "Password updated successfully!");
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, values, handleChange }) => (
            <Form className="space-y-4">

              {/* NEW PASSWORD */}
              <div className="space-y-2">

                <div>
                    <Field
                  name="new_password"
                  as={PasswordField}
                  id="new_password"
                  label="New Password"
                  placeholder="Enter new password"
                  value={values.new_password}
                  onChange={handleChange}
                />

                <ErrorMessage
                  name="new_password"
                  component="div"
                  className="text-xs text-red-500"
                />
                </div>
                {/* Confirm password */}
                <Field
                  name="confirm_password"
                  as={PasswordField}
                  id="confirm_password"
                  label="Confirm Password"
                  placeholder="Enter confirm password"
                  value={values.confirm_password}
                  onChange={handleChange}
                />

                <ErrorMessage
                  name="confirm_password"
                  component="div"
                  className="text-xs text-red-500"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>

            </Form>
          )}
        </Formik>

      </div>
    </div>
  );
}
