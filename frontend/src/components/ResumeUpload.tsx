import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types/interview";
import { getApiBase } from "@/lib/api";

interface ResumeUploadProps {
  onUploadComplete: (resume: ResumeData) => void;
  isProcessing: boolean;
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = `${getApiBase()}/upload-resume`;

  const handleFile = async (file: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("Backend error: " + response.status);
        throw new Error("Upload failed");
      }

      const result = await response.json();

      onUploadComplete({
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        extractedSections: result.extracted_sections,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Failed to upload resume. Try again.");
      setUploadedFile(null);
    }

    setIsUploading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div className="w-full max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Upload Your Resume</h2>
        <p className="text-muted-foreground">Upload your resume to personalize your interview</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "glass-card-elevated rounded-2xl p-12 cursor-pointer border-2 border-dashed",
              isDragging ? "border-accent bg-accent/5" : "border-border"
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <Upload className="w-10 h-10 text-muted-foreground" />
              <p className="font-medium">
                {isDragging ? "Drop your resume here" : "Drag & drop your resume"}
              </p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="uploaded" className="glass-card-elevated rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Check className="w-7 h-7 text-green-600" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-medium truncate">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
              </div>

              {!isUploading && (
                <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}>
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
