"use client";

import { useEffect, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useSiteDgrStore } from "@/store/useSiteDgrStore";
import { useUnitStore } from "@/store/useSiteUnitsStore";
import { useParams } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ---------------- Helpers ---------------- */

const formatDate = (ts) => {
  if (!ts) return "-";
  const date = new Date(ts * 1000);
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return `${istDate.getFullYear()}-${String(
    istDate.getMonth() + 1
  ).padStart(2, "0")}-${String(istDate.getDate()).padStart(2, "0")}`;
};

const getMetricValue = (value, unitId, metric) =>
  value?.[unitId]?.[metric] ?? null;

const INVERTER_METRICS = ["generation", "dcCapacity", "generationPerKw"];
const METER_METRICS = [
  "totalExport",
  "totalImport",
  "totalReactiveExport",
  "totalReactiveImport",
  "netExport",
  "netImport",
  "netReactiveExport",
  "netReactiveImport",
  "netGeneration",
];
const TOTAL_FIELDS = ["totalGeneration", "site_capacity", "totalGenerationPerKw"];
const FINAL_FIELDS = ["cufGen", "prGen", "cufNetExport", "tlLoss"];
const UNIT_BORDER_CLASS = "border-r border-border";
const metricLabels = {
  generation: "Generation",
  dcCapacity: "DC Capacity",
  generationPerKw: "Generation / kW",
  totalExport: "Total Export",
  totalImport: "Total Import",
  totalReactiveExport: "Total Reactive Export",
  totalReactiveImport: "Total Reactive Import",
  netExport: "Net Export",
  netImport: "Net Import",
  netReactiveExport: "Net Reactive Export",
  netReactiveImport: "Net Reactive Import",
  netGeneration: "Net Generation",
  totalGeneration: "Total Generation",
  site_capacity: "Site Capacity",
  totalGenerationPerKw: "Total Generation / kW",
  cufGen: "CUF (Gen)",
  prGen: "PR (Gen)",
  cufNetExport: "CUF (Net Export)",
  tlLoss: "TL Loss",
};

/* ---------------- Component ---------------- */

export default function SiteTable() {
  const {
    loading,
    pageIndex,
    pageSize,
    totalDays,
    rows: siteDgrRows,
    initializeDefaultRange,
    nextPage,
    prevPage,
    setPageSize,
  } = useSiteDgrStore();

  const units = useUnitStore((s) => s.units);
  const fetchUnits = useUnitStore((s) => s.fetchUnits);
  const { siteId } = useParams();

  const inverterUnits = useMemo(
    () => units.filter((u) => u.unit_type === "Inverter"),
    [units]
  );
  const meterUnits = useMemo(
    () => units.filter((u) => u.unit_type === "Meter"),
    [units]
  );

  /* ---------------- Fetching ---------------- */

  useEffect(() => {
    if (!siteId) return;
    initializeDefaultRange({ siteId });
    fetchUnits(siteId);
  }, [siteId]);

  /* ---------------- Data ---------------- */

  const dataForTable = useMemo(() => {
    if (!siteDgrRows.length) return [];
    const safe = (v) => (v === null || v === undefined ? "-" : v);

    return siteDgrRows.map((row) => {
      const value = row.value || {};
      const r = { date: formatDate(row.timestamp) };

      inverterUnits.forEach((u) => {
        INVERTER_METRICS.forEach((m) => {
          r[`${u.unit_id}__${m}`] = safe(getMetricValue(value, u.unit_id, m));
        });
      });

      TOTAL_FIELDS.forEach((field) => {
        r[field] = safe(value[field]);
      });

      meterUnits.forEach((u) => {
        METER_METRICS.forEach((m) => {
          r[`${u.unit_id}__${m}`] = safe(getMetricValue(value, u.unit_id, m));
        });
      });

      FINAL_FIELDS.forEach((field) => {
        r[field] = safe(value[field]);
      });

      return r;
    });
  }, [siteDgrRows, inverterUnits, meterUnits]);

  /* ---------------- Columns ---------------- */

  const columns = useMemo(() => {
    const cols = [
      { accessorKey: "date", header: "Date", meta: { headerClassName: UNIT_BORDER_CLASS, className: UNIT_BORDER_CLASS } },
    ];

    inverterUnits.forEach((u) => {
      cols.push({
        header: u.unit_name || u.unit_id,
        meta: { headerClassName: UNIT_BORDER_CLASS },
        columns: INVERTER_METRICS.map((m, idx) => ({
          accessorKey: `${u.unit_id}__${m}`,
          header: metricLabels[m] || m,
          meta:
            idx === INVERTER_METRICS.length - 1
              ? { className: UNIT_BORDER_CLASS }
              : {},
        })),
      });
    });

    TOTAL_FIELDS.forEach((field) => {
      cols.push({
        accessorKey: field,
        header: metricLabels[field] || field,
      });
    });

    meterUnits.forEach((u) => {
      // separator before meter group starts
      if (u === meterUnits[0]) {
        cols.push({
          accessorKey: "__separator_meters",
          header: "",
          meta: { headerClassName: UNIT_BORDER_CLASS, className: UNIT_BORDER_CLASS },
          cell: () => null,
        });
      }

      cols.push({
        header: u.unit_name || u.unit_id,
        meta: { headerClassName: UNIT_BORDER_CLASS },
        columns: METER_METRICS.map((m, idx) => ({
          accessorKey: `${u.unit_id}__${m}`,
          header: metricLabels[m] || m,
          meta:
            idx === METER_METRICS.length - 1
              ? { className: UNIT_BORDER_CLASS }
              : {},
        })),
      });
    });

    // Border before final non-unit fields
    if (FINAL_FIELDS.length) {
      cols.push({
        accessorKey: "__separator_final",
        header: "",
        meta: { headerClassName: UNIT_BORDER_CLASS, className: UNIT_BORDER_CLASS },
        cell: () => null,
      });
    }

    FINAL_FIELDS.forEach((field) => {
      cols.push({
        accessorKey: field,
        header: metricLabels[field] || field,
      });
    });

    return cols;
  }, [inverterUnits, meterUnits]);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-4">
      <DataTable
        data={dataForTable}
        columns={columns}
        loading={loading}
        manualPagination
        hidePagination
      />

      <div className="flex justify-between border-t pt-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Page:</span>
          <span>{pageIndex + 1}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => prevPage({ siteId })}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => nextPage({ siteId })}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) =>
                setPageSize({ siteId, newSize: Number(v) })
              }
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue placeholder={`${pageSize} / page`} />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
