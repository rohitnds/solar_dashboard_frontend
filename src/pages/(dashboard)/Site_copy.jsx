"use client";

import { use, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useSiteDgrStore } from "@/store/useSiteDgrStore";
import { useUnitStore } from "@/store/useSiteUnitsStore";
import { useParams } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const formatDate = (ts) => {
  if (!ts) return "-"; // fallback for missing timestamp
  const date = new Date(ts * 1000);
  if (isNaN(date)) return "-";
  return date.toISOString().split("T")[0];
};

function getMetricValue(row, unitId, metric) {
  const value = row.value?.[unitId]?.[metric];
  return value != null ? value : "-"; // replace null with "-" or 0
}

export default function SiteTable() {
  const siteDgrRows = useSiteDgrStore((s) => s.rows);
  const loading = useSiteDgrStore((s) => s.loading);
  const units = useUnitStore((s) => s.units);
  const fetchSiteDgr = useSiteDgrStore((s) => s.fetchSiteDgr);
  const fetchUnits = useUnitStore((s) => s.fetchUnits);
  const params = useParams(); 
  const siteId = params.siteId; 

  useEffect(() => {
    if (!siteId) return;
    fetchSiteDgr({siteId:siteId, from: null, to: null, page: 1, per: 1000 });
  }, [fetchSiteDgr, siteId]);

  useEffect(() => {
    if (!siteId) return;
    fetchUnits(siteId);
  }, [fetchUnits, siteId]);
    console.log('fetching dgr for site:', siteId);

    console.log('siteDgrRows:', siteDgrRows);


  /* ---------------- Metrics ---------------- */
const metrics = useMemo(() => {
  const metricSet = new Set();
  siteDgrRows.forEach((row) => {
    Object.values(row.value || {}).forEach((unitMetrics) => {
      if (unitMetrics && typeof unitMetrics === "object") {
        Object.keys(unitMetrics)
          .filter((k) => isNaN(k)) // ignore numeric keys
          .forEach((metric) => metricSet.add(metric));
      }
    });
  });
  return Array.from(metricSet);
}, [siteDgrRows]);



  console.log('metrics:', metrics);

  /* ---------------- View State ---------------- */
  const [viewMode, setViewMode] = useState("SINGLE_METRIC_ALL_UNITS");
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);

  useEffect(() => {
    if (!selectedMetric && metrics.length > 0) setSelectedMetric(metrics[0]);
  }, [metrics, selectedMetric]);

  useEffect(() => {
    if (!selectedUnitId && units.length > 0) setSelectedUnitId(units[0].unit_id);
  }, [units, selectedUnitId]);

  /* ---------------- Prepare Data ---------------- */
const dataForTable = useMemo(() => {
  if (!siteDgrRows?.length) return [];

  // 🔹 SINGLE_METRIC_ALL_UNITS
  if (viewMode === "SINGLE_METRIC_ALL_UNITS") {
    if (!selectedMetric) return [];
    return siteDgrRows.map((row) => {
      const newRow = { date: formatDate(row.timestamp) };
      units.forEach((unit) => {
        newRow[unit.unit_name] = getMetricValue(row, unit.unit_id, selectedMetric);
      });
      return newRow;
    });
  }

  // 🔹 SINGLE_UNIT_ALL_METRICS
  if (viewMode === "SINGLE_UNIT_ALL_METRICS") {
    if (!selectedUnitId) return [];
    return siteDgrRows.map((row) => {
      const newRow = { date: formatDate(row.timestamp) };
      metrics.forEach((metric) => {
        newRow[metric] = getMetricValue(row, selectedUnitId, metric);
      });
      return newRow;
    });
  }

  // 🔹 ALL_METRICS_ALL_UNITS
  return siteDgrRows.map((row) => {
    const newRow = { date: formatDate(row.timestamp) };
    Object.entries(row.value || {}).forEach(([unitId, unitMetrics]) => {
      if (unitMetrics && typeof unitMetrics === "object") {
        Object.entries(unitMetrics).forEach(([metric, val]) => {
          if (isNaN(metric)) { // ignore numeric keys
            newRow[`${unitId}_${metric}`] = val != null ? val : "-";
          }
        });
      }
    });
    return newRow;
  });
}, [siteDgrRows, units, metrics, selectedMetric, selectedUnitId, viewMode]);

  /* ---------------- Columns ---------------- */
  const columns = useMemo(() => {
    if (!units.length || !metrics.length) return [];

    if (viewMode === "SINGLE_METRIC_ALL_UNITS") {
      if (!selectedMetric) return [];
      return [
        { accessorKey: "date", header: "Date" },
        ...units.map((unit) => ({
          accessorKey: unit.unit_name,
          header: unit.unit_name,
        })),
      ];
    }

    if (viewMode === "SINGLE_UNIT_ALL_METRICS") {
      if (!selectedUnitId) return [];
      return [
        { accessorKey: "date", header: "Date" },
        ...metrics.map((metric) => ({
          accessorKey: metric,
          header: metric,
        })),
      ];
    }

    // ALL_METRICS_ALL_UNITS grouped
    return [
      { accessorKey: "date", header: "Date" },
      ...metrics.map((metric) => ({
        header: metric,
        columns: units.map((unit) => ({
          accessorKey: `${metric}_${unit.unit_id}`,
          header: unit.unit_name,
          accessorFn: (row) => getMetricValue(row, unit.unit_id, metric),
        })),
      })),
    ];
  }, [viewMode, units, metrics, selectedMetric, selectedUnitId]);

  console.log('table Data:', dataForTable);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* View Mode */}
        <Select value={viewMode} onValueChange={setViewMode}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select View" />
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

        {/* Metric Selector */}
        {viewMode === "SINGLE_METRIC_ALL_UNITS" && selectedMetric && (
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              {metrics?.map((metric) => (
                <SelectItem key={metric} value={metric}>
                  {metric}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Unit Selector */}
        {viewMode === "SINGLE_UNIT_ALL_METRICS" && selectedUnitId && (
          <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Unit" />
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

      {siteDgrRows.length > 0 && <DataTable data={dataForTable} columns={columns} loading={loading} />}
    </div>
  );
}
