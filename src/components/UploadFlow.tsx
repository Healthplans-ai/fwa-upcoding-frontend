import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileSpreadsheet, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";

import { UploadResult, uploadFile } from "../lib/api";

interface Props {
  onUploaded: (r: UploadResult) => void;
}

export default function UploadFlow({ onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setErr(null);
    setBusy(true);
    try {
      const r = await uploadFile(file);
      onUploaded(r);
    } catch (e: any) {
      setErr(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }, [onUploaded]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="hp-eyebrow">Upload</span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
          Upload a <span className="hp-underline">provider claims file</span>
        </h2>
        <p className="mt-3 text-hp-text/70 max-w-prose">
          The engine accepts the aggregated provider CSV (the
          {" "}<span className="font-mono text-sm">upcoding_dataset2C.csv</span> shape)
          or the raw Kaggle inpatient CSV
          ({" "}<span className="font-mono text-sm">Train_Inpatientdata.csv</span>).
          Schema is detected automatically.
        </p>
      </div>

      <motion.label
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card block p-12 cursor-pointer border-2 transition-colors
          ${dragging ? "border-hp-mint bg-hp-light/50"
                     : "border-dashed border-hp-text/15 hover:border-hp-deep/40"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-hp-light grid place-items-center text-hp-deep">
            <FileSpreadsheet className="w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <div className="text-lg font-bold">Drop a .csv or .xlsx file here</div>
            <div className="text-sm text-hp-text/60">or click to choose from your computer</div>
          </div>
          <button
            type="button"
            disabled={busy}
            className="btn-primary mt-2"
            onClick={(e) => { e.preventDefault(); inputRef.current?.click(); }}
          >
            <Upload className="w-4 h-4" /> {busy ? "Evaluating…" : "Choose file"}
          </button>
        </div>
      </motion.label>

      {err && (
        <div className="mt-4 card border border-rose-200 bg-rose-50 px-4 py-3 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5" />
          <div>
            <div className="font-bold text-rose-700">Upload failed</div>
            <div className="text-sm text-rose-700/80 break-all">{err}</div>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="card p-4 flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <div className="font-bold">Aggregated CSV</div>
            <div className="text-hp-text/70">
              One row per provider. Runs A1–A3, U1 (proxy), U2, U5, U6, U10.
            </div>
          </div>
        </div>
        <div className="card p-4 flex gap-3 items-start">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <div className="font-bold">Raw inpatient CSV</div>
            <div className="text-hp-text/70">
              One row per IP claim. Builds the Provider Profile and runs all rules
              including claim-level U7 and U8.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
