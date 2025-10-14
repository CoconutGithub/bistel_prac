import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from 'react';
import { Col, Container, Form, Row, Modal } from 'react-bootstrap';
import { ChooseCodeData, MsgProps } from '~types/ChooseCodeData';
import ComButton from '~pages/portal/buttons/ComButton';
import { RootState } from '~store/Store';
import { useSelector } from 'react-redux';
import { ComAPIContext } from '~components/ComAPIContext';
import ManageMessage from '~pages/portal/admin/ManageMessage';
import axios from 'axios';
import { cachedAuthToken } from '~store/AuthSlice';

interface ManageMenuContentProps {
  chooseCodeData: ChooseCodeData | null;
}

const ManageCodeContent: React.FC<{
  chooseCodeData: ChooseCodeData | null;
  onSave: () => void;
}> = ({ chooseCodeData, onSave }) => {
  console.log('ManageCodeContent 생성됨.');
  const [isActive, setIsActive] = useState<string>('ACTIVE');
  const [codeOrder, setCodeOrder] = useState<number>(0);
  const [codeName, setCodeName] = useState<string | any>('');
  const [defaultText, setDefaultText] = useState<string | any>('');
  const [aCode, setACode] = useState<string | any>('');
  const [bCode, setBCode] = useState<string | any>('');
  const [cCode, setCCode] = useState<string | any>('');
  const [dCode, setDCode] = useState<string | any>('');
  const [eCode, setECode] = useState<string | any>('');
  const msgIdRef = useRef<number>(-1);
  const state = useSelector((state: RootState) => state.auth);
  const comAPIContext = useContext(ComAPIContext);
  // 모달 창의 상태를 관리하기 위한 useState
  const [showModal, setShowModal] = useState(false);

  //chooseCodeData가 변경될 때마다 상태를 업데이트
  useEffect(() => {
    console.log('chooseCodeData', chooseCodeData);
    if (chooseCodeData) {
      setCodeName(chooseCodeData?.codeName);
      setDefaultText(chooseCodeData?.defaultText);
      setACode(chooseCodeData?.acode);
      setCodeOrder(chooseCodeData?.codeOrder ?? 0);
      setIsActive(chooseCodeData?.status ?? 'ACTIVE');
      msgIdRef.current = chooseCodeData?.msgId;
    }
  }, [chooseCodeData]);

  const handleSave = async () => {
    console.log('추가된 메뉴 저장');
    const data = {
      codeId: chooseCodeData?.codeId,
      parentId: chooseCodeData?.parentId,
      codeName: codeName,
      defaultText: defaultText,
      msgId: msgIdRef.current,
      level: chooseCodeData?.level,
      codeOrder: codeOrder,
      status: isActive,
      updateBy: state.user?.userId,
      acode: aCode,
      bcode: bCode,
      ccode: cCode,
      dcode: dCode,
      ecode: eCode,
    };
    console.log('data : ', data);
    try {
      comAPIContext.showProgressBar();
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/update-code`,
        data,
        {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
          },
        }
      );
      comAPIContext.showToast(
        comAPIContext.$msg('message', 'save_complete', '저장이 완료됐습니다.'),
        'success'
      );
      onSave();
    } catch (err) {
      comAPIContext.showToast(
        comAPIContext.$msg('message', 'save_fail', '저장이 실패했습니다.'),
        'warning'
      );
    } finally {
      comAPIContext.hideProgressBar();
    }
  };

  // 모달 열기
  const handleShow = () => setShowModal(true);

  // 모달 닫기
  const handleClose = () => setShowModal(false);

  // 모달이 값을 반환하면 호출되는 콜백 함수
  const handleModalClose = (value: MsgProps) => {
    // setReceivedValue(value);  // 모달에서 반환된 값을 상태로 저장
    console.log('Received value from modal:', value);
    msgIdRef.current = value.msgId;
    setDefaultText(value.defaultText);
    setShowModal(false);
  };

  return (
    <Container fluid>
      {chooseCodeData && chooseCodeData.defaultText !== 'Root' ? (
        <>
          <h4 className="cnt_title">
            {chooseCodeData.isAdd === true ? 'Add Code' : 'Selected Code'}
          </h4>
          <Form>
            {/* Code ID */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                Code ID:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="number"
                  value={chooseCodeData.codeId}
                  size="sm"
                  disabled
                  readOnly
                />
              </Col>
            </Form.Group>
            {/* Parent Code ID */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                Parent Code ID:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="number"
                  value={chooseCodeData.parentId}
                  size="sm"
                  disabled
                  readOnly
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                Code Order:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="number"
                  value={codeOrder || 0}
                  max={9999}
                  size="sm"
                  onChange={(e) => setCodeOrder(Number(e.target.value))}
                />
              </Col>
            </Form.Group>

            {/* code Name */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                Code Name:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={codeName || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setCodeName(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* default Text */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                Default Text:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={defaultText || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setDefaultText(e.target.value)}
                />
              </Col>
              <Col sm={3}>
                <ComButton onClick={handleShow}>
                  {comAPIContext.$msg('label', 'msg_manage', '메세지관리')}
                </ComButton>
              </Col>
            </Form.Group>

            {/* A Code Text */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                A Code:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={aCode || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setACode(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* B Code Text */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                B Code:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={bCode || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setBCode(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* C Code Text */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                C Code:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={cCode || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setCCode(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* D Code Text */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                D Code:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={dCode || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setDCode(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* E Code Text */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                E Code:
              </Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="text"
                  value={eCode || ''}
                  size="sm"
                  style={{
                    backgroundColor: '#f0f8ff', // 연한 파란색
                  }}
                  onChange={(e) => setECode(e.target.value)}
                />
              </Col>
            </Form.Group>

            {/* Status */}
            <Form.Group as={Row} className="form_group align-items-center">
              <Form.Label column sm={2}>
                Status:
              </Form.Label>
              <Col sm={4}>
                <div>
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label={isActive ? 'Active ON' : 'Active OFF'}
                    checked={isActive === 'INACTIVE' ? false : true}
                    onChange={() => {
                      const newValue = isActive === 'INACTIVE' ? true : false;
                      const status = newValue ? 'ACTIVE' : 'INACTIVE';
                      setIsActive(status);
                    }}
                  />
                </div>
              </Col>
            </Form.Group>
            {/* 저장 버튼 */}
            <Form.Group className="form_group">
              <Col sm={{ span: 4, offset: 2 }} className="btn_wrap">
                <ComButton onClick={handleSave} className="w-100">
                  {comAPIContext.$msg('label', 'save', '저장')}
                </ComButton>
              </Col>
            </Form.Group>
          </Form>
          {/* 모달 컴포넌트 */}
          <ManageMessage
            show={showModal}
            onClose={handleModalClose}
            isModal={true}
          />
        </>
      ) : (
        <div>
          <h5>No Code Selected</h5>
          <p>Please select a code to see the details.</p>
        </div>
      )}
    </Container>
  );
};

export default ManageCodeContent;
