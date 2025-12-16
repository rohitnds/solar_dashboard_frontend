"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableToolbar } from "./data-table-toolbar";
import { DataTablePagination } from "./data-table-pagination";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
export const DataTable = ({
  columns = [],
  data = [],
  searchKey,
  toolbarSlot,
  emptyState = "No records found.",
  initialPageSize = 10,
  hideColumnVisibility = false,

  /* 🔥 NEW */
  manualPagination = false,
  hidePagination = false,
}) => {
  const hasDateColumn = columns.some(
    (col) => col.accessorKey === "date" || col.id === "date"
  );

  const [sorting, setSorting] = useState(
    hasDateColumn ? [{ id: "date", desc: true }] : []
  );
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

    const { open } = useSidebar();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(manualPagination ? {} : { pagination }),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    ...(manualPagination
      ? {}
      : {
          onPaginationChange: setPagination,
          getPaginationRowModel: getPaginationRowModel(),
        }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3 w-full max-w-full w-[calc(100%-20rem)] min-w-0 overflow-hidden">
      <DataTableToolbar table={table} searchKey={searchKey} hideColumnVisibility={hideColumnVisibility}>
        {toolbarSlot}
      </DataTableToolbar>

      <div className="rounded-xl border bg-card overflow-x-auto overflow-y-hidden w-full max-w-full min-w-0">
        <Table className="w-full min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  const meta = header.column.columnDef.meta || {};
                  const headerClass =
                    meta.headerClassName || meta.className || "";
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`cursor-pointer select-none ${headerClass}`}
                    >
                      {!header.isPlaceholder && (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSorted === "asc" && <ChevronUp size={14} />}
                          {isSorted === "desc" && <ChevronDown size={14} />}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta || {};
                    const cellClass = meta.cellClassName || meta.className || "";
                    return (
                      <TableCell key={cell.id} className={cellClass}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!hidePagination && !manualPagination && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
};
