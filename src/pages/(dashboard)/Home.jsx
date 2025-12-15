"use client";

import { useEffect, useMemo } from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card.jsx";
import { DataTable } from "@/components/data-table/data-table.jsx";

import { useFleetOverviewStore } from "@/store/useFleetOverviewStore";
import StatsCard from "@/components/StatsCard";
import useSitesStore from "@/store/useSitesStore";
export default function Home() {
  const {
    loading,
    data,
    error,
    range,
    setRange,
    fetchFleetData
  } = useFleetOverviewStore();

  useEffect(() => {
  if (!range || !range.from || !range.to) {
const d = new Date();
d.setDate(d.getDate() - 1);        // go to yesterday
d.setHours(0, 0, 0, 0);

    setRange({ from: d, to: d });
    fetchFleetData(d, d);
  }
}, [])

  // Auto-load data on first mount (today)
  useEffect(() => {

    if (!range || !range.from || !range.to) {
  // no API call if user has not selected both dates
  return;
}
    if (!range.from || !range.to) {
      const today = new Date();
      setRange({ from: today, to: today });
      fetchFleetData(today, today);
    }
  }, [range]);

  // When user selects range
  const handleRangeChange = (value) => {
    setRange(value);
    if (value?.from && value?.to) {
      fetchFleetData(value.from, value.to);
    }
  };

    const availableSites = useSitesStore((state) => state.availableSites);

  // ----------------------
  // SUM for Cards
  // ----------------------
// First, sum the raw values
const totals = data?.reduce(
  (acc, item) => {
    const site = item;
    acc.generation += Number(site.generation) || 0;
    acc.netExport += Number(site.netExport) || 0;
    acc.siteCapacity += Number(site.site_capacity) || 0;
    acc.totalDays += 1; // count number of sites / days
    return acc;
  },
  {
    generation: 0,
    netExport: 0,
    siteCapacity: 0,
    totalDays: 0
  }
);

// Then calculate percentages using formulas
const cufGen = totals?.totalDays
  ? ((totals.generation / (totals?.siteCapacity * 24 * totals?.totalDays)) * 100)
  : 0;

const cufExport = totals?.totalDays
  ? ((totals?.netExport / (totals?.siteCapacity * 24 * totals?.totalDays)) * 100)
  : 0;

const tlLoss = totals?.generation
  ? (((totals?.generation - totals?.netExport) / totals?.generation) * 100)
  : 0;

// Round to 2 decimals if needed
const formattedTotals = {
  ...totals,
  cufGen: cufGen?.toFixed(2),
  cufExport: cufExport?.toFixed(2),
  tlLoss: tlLoss?.toFixed(2)
};

  // ----------------------
  // Table Columns
  // ----------------------

const siteMap = useMemo(() => {
  const allSites = [
    ...(availableSites?.active ?? []),
    ...(availableSites?.inactive ?? [])
  ];

  return Object.fromEntries(
    allSites.map(site => [
      site.site_id,
      site.site_details?.name
    ])
  );
}, [availableSites]);

  
const columns = [
  {
  id: "serial",
  header: "#",
  enableSorting: false,
  cell: ({ row, table }) => {
    // Compute the current row's position in the displayed rows
    const visibleRows = table.getRowModel().rows;
    const rowIndex = visibleRows.findIndex(r => r.id === row.id);
    return rowIndex + 1; // 1-based numbering
  },
},
{
  accessorKey: "site_name",
  header: "Project"
},

  {
    accessorKey: "site_capacity",
    header: "Capacity (kWp)",
    cell: (info) => info.getValue() ?? "-",
  },
  {
    accessorKey: "generation",
    header: "Generation (kWh)",
    cell: (info) => info.getValue() ?? "-",
  },
  {
    accessorKey: "netExport",
    header: "Net Export (kWh)",
    cell: (info) => info.getValue() ?? "-",
  },
  {
    accessorKey: "cufGen",
    header: "CUF Gen (%)",
    cell: (info) => info.getValue() ? `${info.getValue()} %` : "-",
  },
  {
    accessorKey: "cufExport",
    header: "CUF Export (%)",
    cell: (info) => info.getValue() ? `${info.getValue()} %` : "-",
  },
  {
    accessorKey: "tlLoss",
    header: "TL Loss (%)",
    cell: (info) => info.getValue() ? `${info.getValue()} %` : "-",
  },
];


const tableRows = useMemo(() => {
  return data?.map(item => ({
    ...item,
    site_name: siteMap[item.site_id] ?? "-", // for search/filter
  })) ?? [];
}, [data, siteMap]);


  return (
    <div className="space-y-10">

      {/* Date Picker */}
      {/* <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon size={16} />
            {range?.from && range?.to
              ? `${format(range?.from, "dd-MM-yyyy")} → ${format(range?.to, "dd-MM-yyyy")}`
              : "Select Range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-white">
          <Calendar mode="range" selected={range} onSelect={handleRangeChange}  disabled={(date) => date > new Date(new Date().setDate(new Date().getDate() - 1))} />
        </PopoverContent>
      </Popover> */}

<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
      <StatsCard title="Total Capacity" value={`${formattedTotals?.siteCapacity?.toFixed(2)} kWp`} diffrence="+" />
      <StatsCard title="Generation" value={`${formattedTotals.generation?.toFixed(2)} kWh`} diffrence="+" />
      <StatsCard title="Net Export" value={`${formattedTotals.netExport?.toFixed(2)} kWh`} diffrence="+" />
      <StatsCard title="CUF (Gen)" value={`${formattedTotals.cufGen}%`} diffrence="+" />
      <StatsCard title="CUF (Export)" value={`${formattedTotals.cufExport}%`} diffrence="+" />
      <StatsCard title="TL Losses" value={`${formattedTotals.tlLoss} %`} diffrence="+" />
</div>

      {/* Table */}
      <DataTable columns={columns} data={tableRows} searchKey="site_name" />
    </div>
  );
}
