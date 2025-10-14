import React, { useEffect, useState } from 'react';
import {
  Button,
  ProgressBar,
  ListGroup,
  Alert,
  Container,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { cachedAuthToken } from '~store/AuthSlice';
import styles from './FileUpload.module.scss';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

const FileUpload = ({ onUploadSuccess }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = Array.from(event.target.files || []).filter((f: any) =>
      allowedTypes.includes(f.type)
    );
    setFiles(selectedFile);
    setUploadStatus(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files).filter((f: any) =>
      allowedTypes.includes(f.type)
    );
    setFiles(droppedFiles);
    setUploadStatus(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({ type: 'error', message: '업로드할 파일을 선택하세요' });
      return;
    }

    const formData = new FormData();
    files.forEach((f: any) => formData.append('files', f));

    try {
      await axios.post('http://localhost:8080/biz/chatbot/upload', formData, {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            progressEvent.loaded / progressEvent.total!
          );
          setUploadProgress(percentCompleted);
        },
      });
      setUploadStatus({
        type: 'success',
        message: '파일이 성공적으로 업로드되었습니다.',
      });
      setFiles([]);
      setUploadProgress(0);
      onUploadSuccess?.();
    } catch (error: any) {
      console.log(error);
      setUploadStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <Container className={styles.fileUpload}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`${styles.dropZone} p-4 mb-3 text-center border border-primary rounded`}
      >
        <FontAwesomeIcon
          icon={faFile}
          size="2x"
          className="text-primary mb-2"
        />
        <p>파일을 여기에 드래그하거나 클릭하여 선택하세요</p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <Button variant="outline-primary" as="span">
            파일 선택
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mb-3">
          <h6>선택된 파일:</h6>
          <ListGroup>
            {files.map((file, index) => (
              <ListGroup.Item key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleUpload}
        disabled={files.length === 0}
        className="w-100 mb-3"
      >
        업로드
      </Button>

      {uploadProgress > 0 && (
        <div className="mb-3">
          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
        </div>
      )}

      {uploadStatus && (
        <Alert variant={uploadStatus.type === 'success' ? 'success' : 'danger'}>
          {uploadStatus.message}
        </Alert>
      )}
    </Container>
  );
};

export default FileUpload;
