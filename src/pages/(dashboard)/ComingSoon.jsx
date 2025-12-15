import React from "react";
import { Hourglass, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md shadow-xl border border-slate-200/70">
        <CardContent className="flex flex-col items-center gap-5 pt-10 pb-8 text-center">
          
          {/* Icon */}
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Hourglass className="h-10 w-10 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Coming Soon
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 max-w-xs text-sm">
            We're working hard to bring this feature to you.  
            Please check back again shortly!
          </p>

          {/* Button */}
          <Link to="/" className="bg-muted px-4 py-2 rounded-sm text-sm font-semibold">Go To Home</Link>
        </CardContent>
      </Card>
    </div>
  );
}
