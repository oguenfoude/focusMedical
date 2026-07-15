"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  searchKeys?: string[];
  actions?: (row: T) => React.ReactNode;
  dict: import("@/lib/i18n/types").Dictionary;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage,
  searchKeys = [],
  actions,
  dict,
}: DataTableProps<T>) {
  const displayEmptyMessage = emptyMessage ?? dict.common.noData;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    return search
      ? data.filter((row) =>
          searchKeys.some((key) => {
            const val = row[key];
            return val && String(val).toLowerCase().includes(search.toLowerCase());
          })
        )
      : data;
  }, [data, search, searchKeys]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    return filteredData.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredData, page, pageSize]);

  const renderCellValue = (col: Column<T>, row: T) =>
    col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "");

  return (
    <div className="space-y-6">
      {searchKeys.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={dict.common.search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-12 ps-11"
          />
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50 glass-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-start text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className="px-5 py-4 text-end text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  {dict.common.actions}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 bg-background/30 backdrop-blur-sm">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-base font-medium text-foreground">{displayEmptyMessage}</p>
                    {search && (
                      <p className="text-sm text-muted-foreground">
                        {dict.common.adjustSearch}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={i} className="hover:bg-muted/40 transition-colors duration-150 group">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-5 py-4 text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors"
                    >
                      {renderCellValue(col, row)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-4 text-end text-sm whitespace-nowrap">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <div className="rounded-2xl border border-border/50 glass-card px-6 py-16 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <p className="text-base font-medium text-foreground">{displayEmptyMessage}</p>
              {search && (
                <p className="text-sm text-muted-foreground">
                  {dict.common.adjustSearch}
                </p>
              )}
            </div>
          </div>
        ) : (
          paginatedData.map((row, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 glass-card p-4 space-y-3"
            >
              {/* First column as title */}
              {columns.length > 0 && (
                <div className="text-base font-bold text-foreground">
                  {renderCellValue(columns[0], row)}
                </div>
              )}
              {/* Remaining columns as key-value pairs */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {columns.slice(1).map((col) => (
                  <div key={col.key}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {col.label}
                    </p>
                    <div className="text-sm font-medium text-foreground/90">
                      {renderCellValue(col, row)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              {actions && (
                <div className="flex justify-end pt-2 border-t border-border/30">
                  {actions(row)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{dict.common.show}</span>
            <select
              className="h-10 rounded-md border border-border/50 bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>{dict.common.entries}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {dict.common.page} {page} {dict.common.of} {totalPages} ({filteredData.length} {dict.common.total})
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2.5 rounded-md hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
