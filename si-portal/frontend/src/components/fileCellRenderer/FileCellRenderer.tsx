import React, { useState } from "react";

import styles from "./FileCellRenderer.module.scss";
import ComButton from "~pages/portal/buttons/ComButton";
import SiCancelIcon from "~components/icons/SiCancelIcon";

interface FileCellRendererProps {
  value: string | undefined; // 초기 값
  data: any; // 셀의 전체 행 데이터
  column: any; // ag-Grid 컬럼 정보
  rowId: string;
  selectedFilesMap: Record<string, File[]>;
  setSelectedFilesMap: React.Dispatch<
    React.SetStateAction<Record<string, File[]>>
  >;
}

const FileCellRenderer: React.FC<FileCellRendererProps> = (props) => {
  console.log("FileCellRender....재랜더링.");
  const { data, column, rowId, selectedFilesMap, setSelectedFilesMap } = props;
  let selectedFiles: any[] = [];
  if (!rowId) {
    selectedFiles = [];
  } else {
    selectedFiles = selectedFilesMap[rowId] || [];
  }

  const handleFileChange = (event: any) => {
    if (!event.target.files || event.target.files.length < 1) return;

    const newFiles = Array.from(event.target.files);

    if (selectedFiles.length + newFiles.length > 3) {
      alert("최대 3개의 파일만 업로드할 수 있습니다.");
      return;
    }

    setSelectedFilesMap((prev: any) => ({
      ...prev,
      [rowId]: [...(prev[rowId] || []), ...newFiles],
    }));
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFilesMap((prev: any) => ({
      ...prev,
      [rowId]: prev[rowId].filter((_: any, i: any) => i !== index),
    }));
  };

  return (
    <div className={styles.start}>
      <label className={styles.label}>
        파일첨부
        <input
          type="file"
          onChange={handleFileChange}
          className={styles.input}
          multiple
          id="fileCellInput"
        />
      </label>
      <ul className={styles.filename_wrap}>
        {selectedFiles.map((file, index) => {
          return (
            <li key={index} className={styles.file}>
              {file.name}
              <ComButton
                onClick={() => handleRemoveFile(index)}
                className={styles.button}
              >
                <SiCancelIcon fillColor="#6c757d" width={14} height={14} />
              </ComButton>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FileCellRenderer;
