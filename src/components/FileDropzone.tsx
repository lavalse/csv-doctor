import { useRef, useState } from "react";

type Props = {
  onFileSelected: (file: File) => void;
};

export function FileDropzone({ onFileSelected }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (file) onFileSelected(file);
  };

  return (
    <div
      className={`dropzone${isDragOver ? " drag-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="dropzone-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="dropzone-primary">CSVファイルをドロップ、またはクリックして選択</p>
        <p className="dropzone-secondary">Shift_JIS・CP932・UTF-8 対応 / .csv .txt</p>
      </div>
    </div>
  );
}
