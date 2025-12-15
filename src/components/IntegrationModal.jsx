import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Formik, Form } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import * as z from "zod";
import { apiPost } from "@/lib/api";

export default function IntegrationModal({ integration, onClose }) {
  if (!integration) return null;

  const fields = integration.integration_requirements.fields;

  // --------------------------
  // Build Zod Schema
  // --------------------------
  const formSchemaObj = {};

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    let validator = z.string().trim();

    if (field.required === true || field.required === "true") {
      validator = validator.min(1, `${field.label} is required`);
    }

    if (field.regex) {
      validator = validator.regex(
        new RegExp(field.regex),
        `${field.label} is invalid`
      );
    }

    formSchemaObj[field.form_name] = validator;
  });

  const formSchema = z.object(formSchemaObj);

  // --------------------------
  // Initial Values
  // --------------------------
  const initialValues = {};
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    initialValues[field.form_name] = "";
  });

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
    };
    
    try {
        const res = await apiPost(`/api/integrations/link/${integration.integration_id}`, payload);
        if (res) {
            onClose();
        }
    } catch (error) {
        
    }
    console.log("Final Integration Payload:", payload);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()} // Block backdrop close
        onEscapeKeyDown={(e) => e.preventDefault()}   // Block ESC close
      >
        <DialogHeader>
          <DialogTitle>Configure {integration.integration_name}</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validateOnBlur={true}
          validateOnChange={false}
          validationSchema={toFormikValidationSchema(formSchema)}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, handleChange, handleBlur }) => (
            <Form className="space-y-4">
              {Object.keys(fields).map((key) => {
                const field = fields[key];

                return (
                  <div key={key} className="space-y-2">
                    <Label>{field.label}</Label>

                    <Input
                      name={field.form_name}
                      type={field.type || "text"}
                      placeholder={field.instructions}
                      autoComplete="off"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {errors[field.form_name] && touched[field.form_name] && (
                      <p className="text-red-500 text-sm">
                        {errors[field.form_name]}
                      </p>
                    )}
                  </div>
                );
              })}

              {integration.integration_requirements.Instructions && (
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  {integration.integration_requirements.Instructions}
                </p>
              )}

              <Button type="submit" className="w-full">
                Save Integration
              </Button>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
