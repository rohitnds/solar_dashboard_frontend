"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";

import { useFleetOverviewStore } from "@/store/useFleetOverviewStore";
import { useSiteDgrStore } from "@/store/useSiteDgrStore";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

/* ---------------- Helpers ---------------- */

const toUnix = (d) => Math.floor(d.getTime() / 1000);

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const normalizeDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getLastWeekRange = () => {
  const to = getYesterday();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return { from: normalizeDate(from), to };
};

/* ---------------- Component ---------------- */

export default function HeaderDatePicker() {
  const { pathname } = useLocation();
  const { siteId } = useParams();

  const { fetchFleetData, initializeDefaultRange } =
    useFleetOverviewStore();

  const fetchSiteDgr = useSiteDgrStore((s) => s.fetchSiteDgr);

  const YESTERDAY = getYesterday();

  // 🔹 UI-only state
  const [range, setRange] = useState(null);

  /* ---------------- Init ---------------- */

  useEffect(() => {
    // FLEET PAGE
    if (pathname === "/" && !siteId) {
      const y = getYesterday();
      setRange({ from: y, to: y });

      // ❗ DO NOT change this
      initializeDefaultRange();
      return;
    }

    // DGR PAGE
    if (siteId) {
      const r = getLastWeekRange();
      setRange(r);

      fetchSiteDgr({
        siteId,
        from: toUnix(r.from),
        to: toUnix(r.to),
      });
    }
  }, [pathname, siteId]);

  /* ---------------- Calendar select ---------------- */

  const handleSelect = (value) => {
    if (!value?.from || !value?.to) return;

    const normalized = {
      from: normalizeDate(value.from),
      to: normalizeDate(value.to),
    };

    setRange(normalized);

    if (siteId) {
      fetchSiteDgr({
        siteId,
        from: toUnix(normalized.from),
        to: toUnix(normalized.to),
      });
    } else {
      // ❗ DO NOT change this
      fetchFleetData(normalized.from, normalized.to);
    }
  };

  /* ---------------- Shift range ---------------- */

  const shiftRange = (days) => {
    if (!range?.from || !range?.to) return;

    // Normalize to start-of-day and move strictly by 86400s to avoid DST drift
    const baseFrom = normalizeDate(range.from);
    const baseTo = normalizeDate(range.to);

    const shiftSeconds = days * 86400;
    const fromSeconds = toUnix(baseFrom) + shiftSeconds;
    const toSeconds = toUnix(baseTo) + shiftSeconds;

    const from = new Date(fromSeconds * 1000);
    const to = new Date(toSeconds * 1000);

    if (to > YESTERDAY) return;

    const newRange = { from, to };
    setRange(newRange);

    if (siteId) {
      fetchSiteDgr({
        siteId,
        from: fromSeconds,
        to: toSeconds,
      });
    } else {
      // ❗ DO NOT change this
      fetchFleetData(from, to);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex items-center gap-2 justify-center">
      <ChevronLeft
        className="h-9 w-9 p-2 rounded-md border cursor-pointer"
        onClick={() => shiftRange(-1)}
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-56 flex gap-2">
            <CalendarIcon size={16} />
            {range?.from && range?.to
              ? `${format(range.from, "dd-MM-yyyy")} → ${format(
                  range.to,
                  "dd-MM-yyyy"
                )}`
              : "Select Range"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0 bg-white">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleSelect}
            disabled={(date) => date > YESTERDAY}
          />
        </PopoverContent>
      </Popover>

      <ChevronRight
        className={`h-9 w-9 p-2 rounded-md border cursor-pointer ${
          range?.to >= YESTERDAY ? "opacity-30 pointer-events-none" : ""
        }`}
        onClick={() => shiftRange(1)}
      />
    </div>
  );
}
