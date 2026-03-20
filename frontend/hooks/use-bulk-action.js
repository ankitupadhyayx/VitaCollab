"use client";

import { useMemo, useState } from "react";

export function useBulkAction() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const selectedCount = selectedIds.length;

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setAllPagesSelected(false);
  };

  const togglePage = (ids) => {
    const uniqueIds = [...new Set(ids)];
    const isAllSelected = uniqueIds.every((id) => selectedIds.includes(id));

    setSelectedIds((prev) => {
      if (isAllSelected) {
        return prev.filter((id) => !uniqueIds.includes(id));
      }
      return [...new Set([...prev, ...uniqueIds])];
    });
    setAllPagesSelected(false);
  };

  const selectAllAcrossPages = (ids) => {
    setSelectedIds([...new Set(ids)]);
    setAllPagesSelected(true);
  };

  const clear = () => {
    setSelectedIds([]);
    setAllPagesSelected(false);
  };

  return useMemo(
    () => ({
      selectedIds,
      selectedCount,
      allPagesSelected,
      inProgress,
      setInProgress,
      toggleOne,
      togglePage,
      selectAllAcrossPages,
      clear
    }),
    [selectedIds, selectedCount, allPagesSelected, inProgress]
  );
}
