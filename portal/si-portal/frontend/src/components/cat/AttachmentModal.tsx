import {Modal, Container, Row, Col, Card, ListGroup} from "react-bootstrap";
import downloadIcon from '~assets/download.png';
import closeIcon from '~assets/close.png';
import React, {useState, useEffect, useContext, DragEvent, ChangeEvent} from "react";
import styles from "./AttachmentModal.module.scss";
import receiptEx from '~assets/receipt_ex.png';
import editIcon from '~assets/edit.png';
import axios from "axios";
import {cachedAuthToken} from "~store/AuthSlice";
import {ComAPIContext} from "~components/ComAPIContext";
import FileUploadBox from "~components/cat/FileUploadBox";

interface AttachmentModalProps {
    show: boolean;
    onHide: () => void;
    onSelect: (accountName: string) => void;
    currentValue?: string | null;
    selectedCct: string;
}

interface AttachmentFileData {
    fileName: string;
    filePath: string;
    bucket: string;
    downloadUrl: string;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
    show,
    onHide,
    onSelect,
    currentValue,
    selectedCct
}) => {
    const comAPIContext = useContext(ComAPIContext);
    const [activeTab, setActiveTab] = useState('list'); // "list" 또는 "add"\
    const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFileData[]>([]);
    const [selectedAttachFile, setSelectedAttachFile] = useState<AttachmentFileData>();

    const [fileNameUpdateMode, setFileNameUpdateMode] = useState(0); // 0이면 filename fix, 1이면 filename editable
    const [updateFileName, setUpdateFileName] = useState<string | null>(null) // update 파일 이름 상태 저장

    // 파일 데이터 조회 메서드
    const fetchAttachmentFileList= ()=> {
        axios
            .get(`${process.env.REACT_APP_BACKEND_IP}/cct/${selectedCct}/attach`, {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                },
            })
            .then((response) => {
                if (response.data) {
                    setAttachmentFiles(response.data.body)
                    setSelectedAttachFile(response.data.body[0])
                }
            })
            .catch((error) => {
                console.error('Error fetching Attachment Data:', error);
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_fail',
                        '조회 중 오류가 발생했습니다.'
                    ),
                    'danger'
                );
            })
            .finally(() => {
                console.log("fetching attachment data success")
            });
    }

    // 파일 다운로드 메서드
    const onClickDownloadButton = async (file: AttachmentFileData)=>{
        if (!selectedAttachFile?.downloadUrl) {
            alert('다운로드할 파일이 없습니다.');
            return;
        }

        try {
            const response = await fetch(file.downloadUrl, {
                method: 'GET',
                headers: {
                    // 필요 시 인증 헤더 추가
                    // Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('파일을 불러오지 못했습니다.');
            }

            // Blob으로 변환
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // 다운로드 트리거
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = file.fileName || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 메모리 해제
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error(error);
            alert('다운로드 중 오류가 발생했습니다.');
        }
    }

    // 파일 삭제 메서드
    const onClickCloseButton = (file: AttachmentFileData) => {
        axios
            .delete(`${process.env.REACT_APP_BACKEND_IP}/cct/attach`, {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                },
                params: {
                    "cctId": selectedCct,
                    "fileName": file?.fileName
                }
            })
            .then((response) => {
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_success',
                        '파일이 성공적으로 삭제되었습니다.'
                    ),
                    'success'
                );
            })
            .catch((error) => {
                console.error('Error fetching transactions:', error);
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_fail',
                        '파일 삭제 중 오류가 발생했습니다.'
                    ),
                    'danger'
                );
            })
            .finally(() => {
                console.log("attachment file delete")
                setSelectedAttachFile(undefined)
                fetchAttachmentFileList()
            });
    }

    // 파일 업로드 메서드
    const onFileSelected = (files: File[]) => {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append('files', file); // 서버에서 List<MultipartFile> files 로 받음
        });

        formData.append('cctId', String(selectedCct));
        formData.append('isOverwrite', 'false');

        axios
            .post(`${process.env.REACT_APP_BACKEND_IP}/cct/upload/attaches`, formData, {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                },
            })
            .then((response) => {
                console.log('Upload success:', response.data);
                comAPIContext.showToast(
                    comAPIContext.$msg('message', 'upload_success', `${response.data.length}개의 파일을 업로드 하였습니다.`),
                    'success'
                );
            })
            .catch((error) => {
                console.error('Error fetching transactions:', error);
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_fail',
                        '파일 업로드 중 오류가 발생했습니다.'
                    ),
                    'danger'
                );
            })
            .finally(() => {
                console.log("attachment files upload")
                setSelectedAttachFile(undefined)
                fetchAttachmentFileList()
            });
    }

    // 파일명 수정 메서드
    const onClickEdit = ()=>{
        if (!selectedAttachFile) return;

        if (selectedAttachFile.fileName == updateFileName) {
            return;
        }

        if (updateFileName?.length == 0) {
            comAPIContext.showToast(
                comAPIContext.$msg(
                    'message',
                    'load_failure',
                    '파일명은 최소 1글자 이상이여야합니다.'
                ),
                'danger'
            );
            return;
        }

        const payload = {
            cctId: selectedCct,
            currentFileName: selectedAttachFile?.fileName,
            updateFileName: updateFileName
        };

        axios
            .patch(`${process.env.REACT_APP_BACKEND_IP}/cct/attach`,
                payload,
                {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                },

            })
            .then((response) => {
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_success',
                        '파일명이 수정되었습니다.'
                    ),
                    'success'
                );
            })
            .catch((error) => {
                console.error('Error fetching transactions:', error);
                comAPIContext.showToast(
                    comAPIContext.$msg(
                        'message',
                        'load_fail',
                        '파일명 수정 중 오류가 발생했습니다.'
                    ),
                    'danger'
                );
            })
            .finally(() => {
                console.log("attachment filename update")
                // 입력값 변경 시 selectedAttachFile의 fileName 업데이트
                setSelectedAttachFile(undefined)
                fetchAttachmentFileList()
            });
    }

    useEffect(()=>{
        if (show) {
            fetchAttachmentFileList(); // 데이터 + 자동선택 처리
            console.log("selected cct id debug:", selectedCct);
        } else {
            setSelectedAttachFile(undefined); // 닫힐 때 초기화
        }
    }, [show])

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size={"xl"}
            dialogClassName={styles.attachmentModal}
        >
            <Modal.Header closeButton>
                <Modal.Title>Attachment</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: '80vh', display: 'flex' }}>
                <div style={{ display: 'flex', width: '100%', gap: '16px' }}>
                    {/* 좌측 - 세로 배치 (1:2 비율) */}
                    <div style={{ flex: '0 0 33.33%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* 박스 1 - 문서정보 */}
                        <Card className="rounded-0" style={{ flex: '0 0 10%', display: 'flex', flexDirection: 'column' }}>
                            <Card.Header className="bg-white text-black fw-bold"
                                         style={{height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                문서정보
                            </Card.Header>
                            <ListGroup variant="flush" style={{ flex: 1, overflowY: 'auto' }}>
                                <ListGroup.Item className={styles.customListItem}>
                                    <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
                                        <span style={{fontWeight: 'bold', fontSize: '14px'}}>문서번호</span>
                                        <span style={{fontSize: '14px'}}>{selectedCct}</span>
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card>

                        {/* 박스 2 - 큰 박스 (8 비율) */}
                        <Card className="rounded-0" style={{ flex: '0 0 80%', display: 'flex', flexDirection: 'column' }}>
                            <Card.Header className="bg-white text-black fw-bold"
                                         style={{height: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>증빙리스트</Card.Header>
                            <ListGroup variant="flush" style={{ flex: 1, overflowY: 'auto' }}>
                                {attachmentFiles.map((file, index)=>(
                                    <ListGroup.Item
                                        key={index}
                                        className={styles.customListItem}
                                        onClick={()=>{
                                            setSelectedAttachFile(file)
                                            setActiveTab('list')
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between', // 좌우 끝 정렬
                                                alignItems: 'center',
                                                fontSize: '14px',
                                            }}
                                        >
                                            {/* 왼쪽: 파일 이름 */}
                                            <span>{file.fileName}</span>

                                            {/* 오른쪽: 영수증 + 버튼 세트 */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                                <span style={{fontWeight: 'bold'}}>영수증</span>

                                                {/* 버튼 묶음 (붙어있게) */}
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <img
                                                        src={downloadIcon}
                                                        style={{ width: 28, height: 28, cursor: 'pointer' }}
                                                        onClick={()=>onClickDownloadButton(file)}
                                                    />
                                                    <img
                                                        src={closeIcon}
                                                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                                                        onClick={()=>onClickCloseButton(file)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    </div>

                    {/* 우측 - 1개 박스 (2 비율) */}
                    <div style={{ flex: '0 0 66.67%' }}>
                        <Card className="rounded-0" style={{ flex: '0 0 80%', display: 'flex', flexDirection: 'column' }}>
                            <Card.Header className="bg-white text-black fw-bold"
                                         style={{padding: 0, margin: 0, alignItems: 'center', display: 'flex'}}>
                                {/* 버튼 그룹 */}
                                <button
                                    onClick={() => setActiveTab('list')}
                                    style={{
                                        backgroundColor: activeTab === 'list' ? 'gray' : 'white',
                                        color: activeTab === 'list' ? 'white' : 'black',
                                        border: 'none',
                                        borderRadius: '0',
                                        padding: '8px 16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        height:'56px',
                                    }}
                                >
                                    증빙리스트
                                </button>

                                <button
                                    onClick={() => setActiveTab('add')}
                                    style={{
                                        backgroundColor: activeTab === 'add' ? 'gray' : 'white',
                                        color: activeTab === 'add' ? 'white' : 'black',
                                        border: 'none',
                                        borderRadius: '0',
                                        padding: '8px 16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        height:'56px',
                                    }}
                                >
                                    파일 추가
                                </button>
                            </Card.Header>
                            {/*file 상세보기 tab */}
                            <Card.Body style={{ display: 'flex'}}>
                                { activeTab == 'list' ?
                                    <ListGroup variant="flush" style={{ flex: 1, overflowY: 'auto', maxWidth: '1100px'}}>
                                        <ListGroup.Item className={styles.customListItem}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between', // 좌우 끝 정렬
                                                    alignItems: 'center',
                                                    fontSize: '14px',
                                                }}
                                            >
                                                {fileNameUpdateMode === 1 ? (
                                                    // ✅ 편집 모드일 때: input 표시
                                                    <input
                                                        type="text"
                                                        value={updateFileName || ''}
                                                        onChange={(e) => {
                                                            setUpdateFileName(e.target.value)
                                                        }}
                                                        style={{
                                                            fontSize: '14px',
                                                            padding: '4px 8px',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            width: '250px',
                                                        }}
                                                    />
                                                ) : (
                                                    // ✅ 일반 모드일 때: 텍스트 표시
                                                    <span>
                                                        {selectedAttachFile?.fileName
                                                            ? selectedAttachFile.fileName
                                                            : '파일리스트에서 미리보기할 파일을 선택해주세요'}
                                                    </span>
                                                )}
                                                <img
                                                    src={editIcon}
                                                    style={{ width: 28, height: 28, cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        if (fileNameUpdateMode == 0) {
                                                            e.stopPropagation()
                                                            setFileNameUpdateMode(1)
                                                            setUpdateFileName(selectedAttachFile?.fileName ?? null)
                                                        }else{
                                                            onClickEdit()
                                                            setFileNameUpdateMode(0)
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </ListGroup.Item>
                                        <ListGroup.Item>
                                            <img
                                                src={selectedAttachFile?.downloadUrl}
                                            />
                                        </ListGroup.Item>
                                    </ListGroup>
                                    // file add tab
                                    : <ListGroup variant="flush" style={{ flex: 1, overflowY: 'auto', maxWidth: '1100px'}}>
                                        <ListGroup.Item>
                                            <FileUploadBox
                                                onFilesSelected={onFileSelected}
                                            />
                                        </ListGroup.Item>
                                    </ListGroup>
                                }
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default AttachmentModal;