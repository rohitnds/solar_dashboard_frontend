"use client";

import { useEffect, useMemo, useState } from "react";
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

const getMetricValue = (row, unitId, metric) =>
  row?.value?.[unitId]?.[metric] ?? null;

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

  /* ---------------- Fetching ---------------- */

  useEffect(() => {
    if (!siteId) return;
    initializeDefaultRange({ siteId });
    fetchUnits(siteId);
  }, [siteId]);

  /* ---------------- Metrics ---------------- */

  const metrics = useMemo(() => {
    const set = new Set();
    siteDgrRows.forEach((row) => {
      Object.values(row.value || {}).forEach((m) => {
        if (m && typeof m === "object") {
          Object.keys(m)
            .filter((k) => isNaN(k))
            .forEach((k) => set.add(k));
        }
      });
    });
    return Array.from(set);
  }, [siteDgrRows]);

  /* ---------------- View State ---------------- */

  const [viewMode, setViewMode] = useState("SINGLE_METRIC_ALL_UNITS");
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  useEffect(() => {
    if (!selectedMetric && metrics.length) {
      setSelectedMetric(metrics[0]);
    }
  }, [metrics]);

  useEffect(() => {
    if (!selectedUnitId && units.length) {
      setSelectedUnitId(units[0].unit_id);
    }
  }, [units]);

  /* ---------------- Unit type maps ---------------- */

  const unitTypeById = useMemo(() => {
    const map = {};
    units.forEach((u) => (map[u.unit_id] = u.unit_type));
    return map;
  }, [units]);

  const METRIC_UNIT_TYPE_MAP = useMemo(() => {
    const map = {};
    siteDgrRows.forEach((row) => {
      Object.entries(row.value || {}).forEach(([unitId, metricsObj]) => {
        const type = unitTypeById[unitId];
        if (!type || !metricsObj) return;

        Object.keys(metricsObj)
          .filter((k) => isNaN(k))
          .forEach((metric) => {
            if (!map[metric]) map[metric] = new Set();
            map[metric].add(type);
          });
      });
    });

    return Object.fromEntries(
      Object.entries(map).map(([k, v]) => [k, Array.from(v)])
    );
  }, [siteDgrRows, unitTypeById]);

  const siteUnitTypes = useMemo(
    () => Array.from(new Set(units.map((u) => u.unit_type))),
    [units]
  );

  /* ---------------- Filtered metrics (FIXED) ---------------- */

  const filteredMetrics = useMemo(() => {
    return metrics.filter((m) =>
      METRIC_UNIT_TYPE_MAP[m]?.some((t) => siteUnitTypes.includes(t))
    );
  }, [metrics, METRIC_UNIT_TYPE_MAP, siteUnitTypes]);

  /* ---------------- Data ---------------- */

  const dataForTable = useMemo(() => {
    if (!siteDgrRows.length) return [];
    const safe = (v) => (v === null || v === undefined ? "-" : v);

    // SINGLE METRIC · ALL UNITS
    if (viewMode === "SINGLE_METRIC_ALL_UNITS") {
      const compatibleUnits = units.filter((u) =>
        METRIC_UNIT_TYPE_MAP[selectedMetric]?.includes(u.unit_type)
      );

      return siteDgrRows.map((row) => {
        const r = { date: formatDate(row.timestamp) };
        compatibleUnits.forEach((u) => {
          r[u.unit_name] = safe(
            getMetricValue(row, u.unit_id, selectedMetric)
          );
        });
        return r;
      });
    }

    // SINGLE UNIT · ALL METRICS
    if (viewMode === "SINGLE_UNIT_ALL_METRICS") {
      const unitType = unitTypeById[selectedUnitId];
      const compatibleMetrics = filteredMetrics.filter((m) =>
        METRIC_UNIT_TYPE_MAP[m]?.includes(unitType)
      );

      return siteDgrRows.map((row) => {
        const r = { date: formatDate(row.timestamp) };
        compatibleMetrics.forEach((m) => {
          r[m] = safe(getMetricValue(row, selectedUnitId, m));
        });
        return r;
      });
    }

    // ALL METRICS · ALL UNITS
    return siteDgrRows.map((row) => {
      const r = { date: formatDate(row.timestamp) };
      units.forEach((u) => {
        filteredMetrics.forEach((m) => {
          if (METRIC_UNIT_TYPE_MAP[m]?.includes(u.unit_type)) {
            r[`${u.unit_id}_${m}`] = safe(
              getMetricValue(row, u.unit_id, m)
            );
          }
        });
      });
      return r;
    });
  }, [
    siteDgrRows,
    units,
    filteredMetrics,
    selectedMetric,
    selectedUnitId,
    viewMode,
  ]);

  /* ---------------- Columns ---------------- */

  const columns = useMemo(() => {
    if (!units.length) return [];

    if (viewMode === "SINGLE_METRIC_ALL_UNITS") {
      const compatibleUnits = units.filter((u) =>
        METRIC_UNIT_TYPE_MAP[selectedMetric]?.includes(u.unit_type)
      );

      return [
        { accessorKey: "date", header: "Date" },
        ...compatibleUnits.map((u) => ({
          accessorKey: u.unit_name,
          header: u.unit_name,
        })),
      ];
    }

    if (viewMode === "SINGLE_UNIT_ALL_METRICS") {
      const unitType = unitTypeById[selectedUnitId];
      return [
        { accessorKey: "date", header: "Date" },
        ...filteredMetrics
          .filter((m) => METRIC_UNIT_TYPE_MAP[m]?.includes(unitType))
          .map((m) => ({ accessorKey: m, header: m })),
      ];
    }

    return [
      { accessorKey: "date", header: "Date" },
      ...filteredMetrics.map((m) => ({
        header: m,
        columns: units
          .filter((u) => METRIC_UNIT_TYPE_MAP[m]?.includes(u.unit_type))
          .map((u) => ({
            accessorKey: `${u.unit_id}_${m}`,
            header: u.unit_name,
          })),
      })),
    ];
  }, [
    viewMode,
    units,
    filteredMetrics,
    selectedMetric,
    selectedUnitId,
  ]);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={viewMode} onValueChange={setViewMode}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SINGLE_METRIC_ALL_UNITS">
              Single Metric · All Units
            </SelectItem>
            <SelectItem value="SINGLE_UNIT_ALL_METRICS">
              Single Unit · All Metrics
            </SelectItem>
            <SelectItem value="ALL_METRICS_ALL_UNITS">
              All Metrics · All Units
            </SelectItem>
          </SelectContent>
        </Select>

{viewMode === "SINGLE_METRIC_ALL_UNITS" && (
  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
    <SelectTrigger className="w-[220px]">
      <SelectValue placeholder="Select Metric" />
    </SelectTrigger>
    <SelectContent>
      {filteredMetrics.map((m) => (
        <SelectItem key={m} value={m}>
          {m}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}

{viewMode === "SINGLE_UNIT_ALL_METRICS" && (
  <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
    <SelectTrigger className="w-[220px]">
      <SelectValue placeholder="Select Unit" />
    </SelectTrigger>
    <SelectContent>
      {units.map((u) => (
        <SelectItem key={u.unit_id} value={u.unit_id}>
          {u.unit_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}

      </div>

      <DataTable
        data={dataForTable}
        columns={columns}
        loading={loading}
        manualPagination
        hidePagination
      />

      <div className="flex justify-between border-t pt-3">
        <div>Page {pageIndex + 1}</div>
        <div className="flex gap-2">
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
            disabled={(pageIndex + 1) * pageSize >= totalDays}
            onClick={() => nextPage({ siteId })}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

          <Select
            value={String(pageSize)}
            onValueChange={(v) =>
              setPageSize({ siteId, newSize: Number(v) })
            }
          >
            <SelectTrigger className="h-8 w-[100px]" />
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
  );
}
