import React from 'react';
import { Modal, Button, Card, ListGroup, Badge } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


interface YoonResumePopupProps {
  show: boolean,
  rowData: RowData,
  // setRowData: () => void,
  onSave: () => void,
  onClose: () => void,
}

interface RowData{
  id: number,
  content: string,
  title: string,
  noticeStart: Date|null,
  noticeEnd: Date|null,
}

const ManageNoticePopup: React.FC<YoonResumePopupProps> = ({show, rowData, onSave, onClose}) => {

    console.log("manageNoticePopup 렌더링")
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>{rowData.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="container py-4">
            <ReactQuill 
                  theme="snow"
                  value={rowData.content}
                  style={{ width: "800px", height: "600px"}} 
                  // modules={modules}
                  // onChange={setRowData}//수정방법이 있을 것임. 함수를 만들어서 넘겨? 
                   /> 
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onSave}>
          저장
        </Button>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageNoticePopup;
