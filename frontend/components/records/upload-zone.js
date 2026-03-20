"use client";

import { useRef, useState } from "react";
import { FileImage, FileText, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone({ file, onFileChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (selected) => {
    if (!selected) {
      return;
    }
    onFileChange(selected);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const selected = event.dataTransfer.files?.[0];
    handleFile(selected);
  };

  const icon = file?.type?.includes("pdf") ? FileText : FileImage;
  const PreviewIcon = icon;

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border/80 bg-background/65 p-4 transition",
        dragging ? "border-primary bg-primary/5" : ""
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {!file ? (
        <button
          type="button"
          className="grid w-full place-items-center gap-2 rounded-2xl py-8 text-muted-foreground hover:text-foreground"
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="h-8 w-8" />
          <span className="text-sm font-medium">Drag and drop or click to upload</span>
          <span className="text-xs">PDF, scans, reports, bills, imaging</span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <PreviewIcon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">{file.name}</p>
              <p className="text-xs text-muted-foreground">{Math.max(1, Math.round(file.size / 1024))} KB</p>
            </div>
          </div>
          <button type="button" className="text-xs font-semibold text-primary" onClick={() => onFileChange(null)}>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
