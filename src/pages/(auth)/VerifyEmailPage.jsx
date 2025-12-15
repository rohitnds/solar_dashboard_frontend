import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Mail, Timer } from "lucide-react";
import { apiGet } from "@/lib/api";

export default function VerifyEmailPage() {
  const [params, setParams] = useSearchParams();
  const [remaining, setRemaining] = useState(0);

  // Read timestamp from URL
  const ts = parseInt(params.get("ts"));

  // Calculate remaining time
  useEffect(() => {
    const timer = setInterval(() => {
      if (ts) {
        const now = Math.floor(Date.now() / 1000);
        const diff = 120 - (now - ts); // 120 seconds = 2 minutes
        setRemaining(diff > 0 ? diff : 0);
      } else {
        setRemaining(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ts]);

  // Handle resend
  const handleResend = async () => {
    const newTimestamp = Math.floor(Date.now() / 1000);
    try {
      const res = await apiGet("/api/auth/email-verification");
      
    } catch (error) {
      console.log(error.message);
    }
    // Simulate API call — replace with your API
    console.log("Resending verification email...");

    // Update timestamp in URL
    setParams({ ts: newTimestamp });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Verify Your Email
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-col items-center text-center">
            <Mail className="w-12 h-12 text-primary mb-3" />
            <p className="text-gray-600">
              We’ve sent a verification link to your email.
              <br />
              Please verify your email to continue.
            </p>
          </div>

          {/* TIMER */}
          {remaining > 0 && (
            <div className="flex items-center justify-center gap-2 text-orange-600 font-medium">
              <Timer className="w-4 h-4" />
              Resend available in {remaining}s
            </div>
          )}

          {/* RESEND BUTTON */}
          <Button
            className="w-full"
            disabled={remaining > 0}
            onClick={handleResend}
          >
            Resend Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
