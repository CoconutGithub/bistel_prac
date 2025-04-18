import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './informationList.module.scss';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import axios from 'axios';
import { cachedAuthToken } from '~store/AuthSlice';
import ComButton from '~pages/portal/buttons/ComButton';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { addTab, setActiveTab } from '~store/RootTabs';

const fetchInfo = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_IP}/biz/information`,
      {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch', error);
    return [];
  }
};

const InformationList = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [aiResponse, setAiResponse] = useState<any>(null);
  const columns = [
    {
      field: 'title',
      headerName: 'title',
      editable: false,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },

    {
      field: 'description',
      headerName: 'Description',
      editable: false,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      editable: false,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleSelectTab = useCallback(
    (tab: { key: string; label: string; path: string }) => {
      const rootTabsData = sessionStorage.getItem('persist:rootTabs');
      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length === 8) {
          alert('최대 8개의 탭만 열 수 있습니다.');
          return;
        } else {
          dispatch(addTab(tab));
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
        }
      }
    },
    []
  );

  // const handleRefresh = useCallback(() => {
  //   window.location.reload();
  // }, []);

  const analyzeSentiment = async (text: string) => {
    const response = await fetch("http://localhost:8000/analyze-sentiment", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cachedAuthToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    setAiResponse(data);
    console.log("감정 분석 결과:", data);
  };

  const handleRowClick = (event: any) => {

    handleSelectTab({
      key: `detail-flora-resume-${event.data.id}`,
      label: `Detail resume ${event.data.id}`,
      path: `/main/flora-resume/detail/${event.data.id}`,
    });
  };

  useEffect(() => {
    const loadResumes = async () => {
      const raw = await fetchInfo();
      if (gridRef.current) {
        const data = raw.map((row: any, index: any) => ({
          gridRowId: row.id,
          ...row,
        }));
        gridRef.current.setRowData(data);
      }
    };
    loadResumes();
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("입력된 텍스트:", text);
    // 여기에 fetch 또는 axios로 FastAPI API 호출하면 돼
    analyzeSentiment(text)
  };

  return (
     <div className={styles.start}>
      <header className={styles.header}>
        <div className={styles.title_area}>
          <p className={styles.title}>Information</p>
        </div>
        <div className={styles.button_area}>
          <ComButton
            onClick={() => console.log('')}
            size="sm"
            className={styles.button}
          >
            New
          </ComButton>
        </div>
      </header>
      <main className={styles.main}>
       {/* <AgGridWrapper
          ref={gridRef}
          enableCheckbox={false}
          showButtonArea={false}
          canCreate={true}
          canDelete={false}
          canUpdate={false}
          columnDefs={columns}
          tableHeight={'calc(100% - 35px)'}
          useNoColumn={true}
          onRowClicked={handleRowClick}
        />*/}
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Test</Form.Label>
            <Form.Control
              type="text"
              placeholder="Input Word"
              value={text}
              onChange={handleChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
        <div>
          <span>{JSON.stringify(aiResponse.sentiment)}</span>
        </div>
      </main>
    </div>
  );
};

export default InformationList;
