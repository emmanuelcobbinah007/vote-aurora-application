import { useMemo } from "react";
import { AuditLog, FilterOptions } from "./api";

export const useFilteredLogs = (
  auditLogs: AuditLog[] | undefined,
  searchTerm: string,
  filters: FilterOptions
) => {
  return useMemo(() => {
    if (!auditLogs) return [];

    let filtered = auditLogs;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.action.toLowerCase().includes(searchLower) ||
          log.userName.toLowerCase().includes(searchLower) ||
          log.userEmail.toLowerCase().includes(searchLower) ||
          log.details?.toLowerCase().includes(searchLower) ||
          log.entityType.toLowerCase().includes(searchLower) ||
          log.action
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .toLowerCase()
            .includes(searchLower)
      );
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo + "T23:59:59");
      filtered = filtered.filter((log) => new Date(log.timestamp) <= toDate);
    }

    // Apply user filter
    if (filters.userId) {
      filtered = filtered.filter(
        (log) =>
          log.userId.includes(filters.userId) ||
          log.userName.toLowerCase().includes(filters.userId.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(filters.userId.toLowerCase())
      );
    }

    // Apply action filter
    if (filters.action) {
      filtered = filtered.filter((log) => log.action === filters.action);
    }

    // Apply entity type filter
    if (filters.entityType) {
      filtered = filtered.filter(
        (log) => log.entityType === filters.entityType
      );
    }

    // Apply entity ID filter
    if (filters.entityId) {
      filtered = filtered.filter((log) =>
        log.entityId?.includes(filters.entityId)
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [auditLogs, searchTerm, filters]);
};

export const countActiveFilters = (filters: FilterOptions): number => {
  let count = 0;
  if (filters.dateFrom) count++;
  if (filters.dateTo) count++;
  if (filters.userId) count++;
  if (filters.action) count++;
  if (filters.entityType) count++;
  if (filters.entityId) count++;
  return count;
};
