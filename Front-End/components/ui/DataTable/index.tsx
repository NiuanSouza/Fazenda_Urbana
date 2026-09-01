"use client";
import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { SkeletonLoader } from "../SkeletonLoader";
import styles from "./DataTable.module.css";

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  isLoading = false,
  itemsPerPage = 10,
  emptyMessage = "Nenhum registro encontrado."
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // @ts-expect-error key is dynamic
        const valA = a[sortConfig.key];
        // @ts-expect-error key is dynamic
        const valB = b[sortConfig.key];
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonLoader key={i} height="48px" className={styles.skeletonRow} />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.empty}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={col.sortable ? "sortable" : ""}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {col.header}
                    {col.sortable && sortConfig?.key === col.key && (
                      sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((col) => (
                  <td key={`${keyExtractor(row)}-${col.key}`}>
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Página {currentPage} de {totalPages}
          </span>
          <div className={styles.pageControls}>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <FiChevronLeft /> Anterior
            </button>
            <button 
              className={styles.pageBtn} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Próxima <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
