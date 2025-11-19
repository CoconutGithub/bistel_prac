import React, { useState, DragEvent, ChangeEvent } from "react";

interface FileUploadBoxPros{
    onFilesSelected: (files: File[]) => void;
}

const FileUploadBox: React.FC<FileUploadBoxPros> = ({
    onFilesSelected
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) onFilesSelected(files);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) onFilesSelected(files);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                border: isDragging ? "2px dashed #007bff" : "2px dashed #ccc",
                borderRadius: "6px",
                padding: "40px",
                textAlign: "center",
                backgroundColor: isDragging ? "#f0f8ff" : "#fff",
                cursor: "pointer",
                transition: "0.2s all ease",
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
        >
            <input
                id="fileInput"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />
            <div style={{ fontSize: "14px", color: "#666" }}>
                {isDragging ? "여기에 파일을 놓으세요 📂" : "파일을 드래그하거나 클릭해서 선택하세요"}
            </div>
        </div>
    );
}

export default FileUploadBox;