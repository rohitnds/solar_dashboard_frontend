import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function EditableDataTable({ columns, data }) {
  const [editMode, setEditMode] = useState(false);
  const [tableData, setTableData] = useState(data);

  // 🔥 Stable column definitions (important!)
  const columnDefs = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      cell: ({ row, column, getValue }) => {
        const rowIndex = row.index;
        const colId = column.id;
        const value = getValue();

        if (editMode && column.columnDef.meta?.editable) {
          return (
            <Input
              className="h-8"
              value={tableData[rowIndex][colId] ?? ""}
              onChange={(e) => {
                const newData = [...tableData];
                newData[rowIndex][colId] = e.target.value;
                setTableData(newData);
              }}
            />
          );
        }

        return value;
      },
    }));
  }, [columns, editMode, tableData]);

  const table = useReactTable({
    data: tableData,
    columns: columnDefs,
    state: {
      sorting: editMode ? [] : undefined,
      columnFilters: editMode ? [] : undefined,
    },
    enableSorting: !editMode,
    enableFilters: !editMode,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleEditClick = () => {
    if (editMode) {
      console.log("Edited data:", tableData);
    }
    setEditMode(!editMode);
  };

  return (
    <div className="space-y-4">

      {/* EDIT BUTTON */}
      <div className="flex justify-end">
        <Button onClick={handleEditClick}>
          {editMode ? "Save Changes" : "Edit Table"}
        </Button>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={!editMode ? "cursor-pointer" : ""}
                      onClick={
                        !editMode ? header.column.getToggleSortingHandler() : undefined
                      }
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {!editMode && isSorted === "asc" && <ChevronUp size={14} />}
                        {!editMode && isSorted === "desc" && <ChevronDown size={14} />}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
