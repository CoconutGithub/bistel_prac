import React from 'react';
import { Modal, Button, Card, ListGroup, Badge } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import {useState, useEffect} from 'react';
import { cachedAuthToken } from '~store/AuthSlice';
import { useRef } from 'react';
import { NumberFilterModule } from 'ag-grid-community';

interface YoonResumePopupProps {
  show: boolean,
  rowData: RowData,
  // setRowData: () => void,
  // onSave: () => void,
  onClose: () => void,
}

interface RowData{
  id: number,
  content: string,
  title: string,
  noticeStart: string,
  noticeEnd: string,
}

const ManageNoticePopup: React.FC<YoonResumePopupProps> = ({show, rowData, onClose}) => {

  const [ content, setContent] = useState<string>(rowData.content);
  const [ title, setTitle] = useState<string>(rowData.title);
  const [ startDate,setStartDate] = useState<string>(rowData.noticeStart)
  const [ endDate,setEndDate] = useState<string>(rowData.noticeEnd)
  //const buttonRef = useRef(null); 버튼 값 수정에 처음에는 ref를 사용하려 헀는데, AI가 더 나은 방법을 제시해주어서..
  const [editMode, setEditMode] = useState(false);



  useEffect(() => {
    setContent(rowData.content);
    setTitle(rowData.title);//
    setStartDate(rowData.noticeStart)
    setEndDate(rowData.noticeEnd)
  },[rowData]);

  const updateSaveButtonHandler =() => {

  }

  const handleClick= () => {
    if(!editMode){
      setEditMode(true);

    } else {
      handleSave();
    }
  }

  const toInputDateTime= (dateString: string)=> {
    if (!dateString) return '';
    // 날짜 문자열을 Date 객체로 변환
    const date = new Date(dateString);
    // 브라우저의 로컬 타임존 기준으로 yyyy-MM-ddTHH:mm 포맷 만들기
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
}




  const handleSave= async () => {
      alert("저장합니다");

      // const flag= confirm("저장하시겠습니까?");

      

      const updateList = {
        ...rowData,
        content:content,
        title: title,
        noticeStart: startDate ? new Date(startDate): null,
        noticeEnd: endDate ? new Date(endDate) : null,
      };
      
      const payload= {
        updateList:[updateList]
      }

      console.log(updateList);

      await axios({
        method:'post',
        url: `${process.env.REACT_APP_BACKEND_IP}/notice/api/update-notices`,
        data: payload,
        headers: { Authorization: `Bearer ${cachedAuthToken}` }
      })

      onClose();
    
  }

    console.log("manageNoticePopup 렌더링")
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="modal-lg">
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="container py-4">
          <div className="mb-2">
            <label>시작일: </label>
            {editMode ? (
              <input
                type="date"
                className="form-control"
                value={toInputDateTime(startDate)}
                onChange={e => setStartDate(e.target.value)}
                style={{ maxWidth: 250, display: 'inline-block', marginLeft: 8}}
                step="60"
              />
            ) : (
              <span style={{marginLeft: 8}}>{startDate ? startDate.toLocaleString() : ''}</span>
            )}
          </div>

            <div className="mb-2">
          <label>종료일: </label>
          {editMode ? (
            <input
              type="date"
              className="form-control"
              value={toInputDateTime(endDate)}
              onChange={e => setEndDate(e.target.value)}
              style={{ maxWidth: 250, display: 'inline-block', marginLeft: 8 }}
              step="60"
            />
          ) : (
            <span style={{ marginLeft: 8 }}>{endDate ? endDate.toLocaleString(): ''}</span>
          )}
        </div>
          {/* <div> 시작일: {startDate ? startDate.toLocaleString() : ''} </div>
          <div> 종료일: {endDate ? endDate.toLocaleString() : ''}</div> */}
            <ReactQuill
                  theme="snow"
                  value={content}
                  style={{ width: "auto", height: "500px"}} 
                  onChange={setContent}
                  readOnly={!editMode}
                  //modules={{toolbar:editMode}} 이건 추후에 고민. 
                   /> 
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClick}>
          {editMode? '저장':'수정'}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageNoticePopup;
