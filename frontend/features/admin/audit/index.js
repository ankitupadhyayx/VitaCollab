export const toAuditExportRow = (entry) => ({
  ...entry,
  timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : "",
  metadata: entry.metadata ? JSON.stringify(entry.metadata) : ""
});

export const toActivityExportRow = (entry) => ({
  ...entry,
  timestamp: entry.timestamp ? new Date(entry.timestamp).toISOString() : ""
});
