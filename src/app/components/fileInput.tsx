"use client";

import React from 'react';
import { Upload, X, FileImage } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ file, setFile, handleFileChange }: FileUploadProps) {
  
  const removeFile = () => setFile(null);

  return (
    <div className="w-full">
      <label className="block text-xs font-black uppercase tracking-[0.2em] mb-3 opacity-50">
        Anexar Arquivo (Opcional)
      </label>

      {!file ? (
        <div className="relative group">
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div 
            className="w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)]/5"
            style={{ 
              backgroundColor: "var(--surface-elevated)", 
              borderColor: "var(--border-subtle)" 
            }}
          >
            <div className="p-3 rounded-full bg-[var(--background)] border border-[var(--border-subtle)] text-[var(--primary)] group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold">Clique ou arraste a imagem</p>
              <p className="text-[10px] opacity-40 uppercase font-black mt-1">PNG, JPG até 5MB</p>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="w-full p-4 border rounded-2xl flex items-center justify-between animate-in fade-in zoom-in duration-200"
          style={{ 
            backgroundColor: "var(--surface-elevated)", 
            borderColor: "var(--primary)" 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
              <FileImage size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate max-w-[200px]">{file.name}</span>
              <span className="text-[10px] opacity-50 font-mono">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={removeFile}
            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}