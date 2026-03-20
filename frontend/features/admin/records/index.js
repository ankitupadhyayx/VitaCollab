export const toRecordExportRow = (record) => ({
  ...record,
  createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : ""
});

export const isRiskyRecord = (record) => Boolean(record?.flaggedSuspicious);
