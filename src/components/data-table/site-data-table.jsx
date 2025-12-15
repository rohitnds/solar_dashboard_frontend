"use client";

import { useMemo, useState } from "react";
import { useSiteDgrStore } from "@/store/useSiteDgrStore";
import { useUnitStore } from "@/store/useSiteUnitsStore";

/* ---------------- Helpers ---------------- */

const formatDate = (ts) =>
  new Date(ts * 1000).toISOString().split("T")[0];

const getMetricValue = (row, unitId, metric) =>
  row?.value?.[unitId]?.[metric] ?? "-";

/* ---------------- Component ---------------- */

export default function SiteDataTable({
  viewMode,
  selectedMetric,
  selectedUnitId,
}) {
  const siteDgrRows = useSiteDgrStore((s) => s.rows);
  const loading = useSiteDgrStore((s) => s.loading);
  const units = useUnitStore((s) => s.units);

  /* ---------------- State ---------------- */

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "asc" });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  /* ---------------- Metrics ---------------- */

  const metrics = useMemo(() => {
    const set = new Set();
    siteDgrRows.forEach((row) =>
      Object.values(row.value || {}).forEach((m) =>
        Object.keys(m || {}).forEach((k) => set.add(k))
      )
    );
    return [...set];
  }, [siteDgrRows]);

  /* ---------------- Data ---------------- */

  const data = useMemo(() => {
    return siteDgrRows.map((row) => ({
      ...row,
      date: formatDate(row.timestamp),
    }));
  }, [siteDgrRows]);

  /* ---------------- Search ---------------- */

  const filtered = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  /* ---------------- Sorting ---------------- */

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === bv) return 0;
      return sort.dir === "asc" ? (av > bv ? 1 : -1) : av < bv ? 1 : -1;
    });
  }, [filtered, sort]);

  /* ---------------- Pagination ---------------- */

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  /* ---------------- Inline Cell ---------------- */

  const EditableCell = ({ value, onChange }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);

    return editing ? (
      <input
        className="border px-1 w-full"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onChange(val);
        }}
        autoFocus
      />
    ) : (
      <div onClick={() => setEditing(true)} className="cursor-pointer">
        {value}
      </div>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (!data.length) return <p>No records found.</p>;

  /* ---------------- Render ---------------- */

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        className="border px-3 py-2 rounded w-64"
        placeholder="Search..."
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      <div className="overflow-auto rounded-xl border bg-card">
        <table className="min-w-full border-collapse">
          <thead className="bg-muted text-muted-foreground">
            {/* -------- SINGLE METRIC · ALL UNITS -------- */}
            {viewMode === "SINGLE_METRIC_ALL_UNITS" && (
              <tr>
                <th onClick={() => setSort({ key: "date", dir: sort.dir === "asc" ? "desc" : "asc" })}>
                  Date ↕
                </th>
                {units.map((u) => (
                  <th key={u.unit_id}>{u.unit_name}</th>
                ))}
              </tr>
            )}

            {/* -------- ALL METRICS · ALL UNITS -------- */}
            {viewMode === "ALL_METRICS_ALL_UNITS" && (
              <>
                <tr>
                  <th rowSpan={2}>Date</th>
                  {metrics.map((m) => (
                    <th key={m} colSpan={units.length} className="text-center">
                      {m}
                    </th>
                  ))}
                </tr>
                <tr>
                  {metrics.flatMap((m) =>
                    units.map((u) => (
                      <th key={m + u.unit_id}>{u.unit_name}</th>
                    ))
                  )}
                </tr>
              </>
            )}
          </thead>

          <tbody>
            {/* -------- SINGLE METRIC · ALL UNITS -------- */}
            {viewMode === "SINGLE_METRIC_ALL_UNITS" &&
              paged.map((row) => (
                <tr key={row.timestamp}>
                  <td>{row.date}</td>
                  {units.map((u) => (
                    <td key={u.unit_id}>
                      <EditableCell
                        value={getMetricValue(row, u.unit_id, selectedMetric)}
                        onChange={(v) =>
                          (row.value[u.unit_id][selectedMetric] = v)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}

            {/* -------- ALL METRICS · ALL UNITS -------- */}
            {viewMode === "ALL_METRICS_ALL_UNITS" &&
              paged.map((row) => (
                <tr key={row.timestamp}>
                  <td>{row.date}</td>
                  {metrics.flatMap((m) =>
                    units.map((u) => (
                      <td key={m + u.unit_id}>
                        <EditableCell
                          value={getMetricValue(row, u.unit_id, m)}
                          onChange={(v) => (row.value[u.unit_id][m] = v)}
                        />
                      </td>
                    ))
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-3">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
