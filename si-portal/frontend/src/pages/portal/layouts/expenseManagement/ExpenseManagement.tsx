import axios from 'axios';
import SiTableIcon from '~components/icons/SiTableIcon';
import styles from './ExpenseManagement.module.scss';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import FileCellRenderer from '~components/fileCellRenderer/FileCellRenderer';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import { useContext, useRef, useState } from 'react';
import { ComAPIContext } from '~components/ComAPIContext';

const cachedAuthToken: string | null = sessionStorage.getItem('authToken');

async function getPresignedUrl(file: File): Promise<{ presignedUrl: string }> {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_IP}/api/minio/get-presigned-url`,
      null,
      {
        params: { fileName: encodeURIComponent(file.name) },
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Presigned URL 요청 중 오류가 발생했습니다', error);
    throw error;
  }
}

async function uploadFileToMinIO(
  file: File,
  presignedUrl: string
): Promise<void> {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });

    console.log('스토리지에 파일을 정상적으로 업로드하였습니다.');
  } catch (error) {
    console.log('스토리지에 파일을 업로드하지 못했습니다.', error);
    throw error;
  }
}

const ExpenseManagement: React.FC = () => {
  const gridRef = useRef<AgGridWrapperHandle>(null);
  const comAPIContext = useContext(ComAPIContext);
  const [selectedFilesMap, setSelectedFilesMap] = useState<any>({});

  const searchGrid = () => {
    gridRef.current!.setRowData([
      {
        gridRowId: '1',
        user: '김민수',
        category: '사무용품',
        item: '가위',
        price: '10,000원',
      },
    ]);
  };

  const handleSave = async (props: any) => {
    const { deleteList, updateList, createList } = props;

    const requiredFields = ['user', 'category', 'item', 'price'];
    const invalidRows = Object.values(createList).filter((row: any) =>
      requiredFields.some((field) => !row[field] || row[field].trim() === '')
    );

    if (invalidRows.length > 0) {
      comAPIContext.showToast(
        '파일 첨부를 제외한 모든 필드 값을 입력해야 합니다.',
        'danger'
      );
      return;
    }

    const createData = await Promise.all(
      Object.entries(createList).map(async ([key, value]: [any, any]) => {
        let files: {
          fileName: string;
          fileSize: any;
          filePath: string;
        }[] = [];

        if (selectedFilesMap[value.gridRowId]) {
          const uploadedFiles = selectedFilesMap[value.gridRowId];

          files = await Promise.all(
            uploadedFiles.map(async (file: any) => {
              const { presignedUrl } = await getPresignedUrl(file);
              await uploadFileToMinIO(file, presignedUrl);

              return {
                fileName: file.name,
                fileSize: file.size,
                filePath: `http://localhost:9000/siportal/${file.name}`,
              };
            })
          );
        }

        return {
          userName: value.user,
          category: value.category,
          item: value.item,
          price: value.price,
          files,
        };
      })
    );

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/api/expense/create`,
        createData,
        {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('신규 데이터를 저장하였습니다.', response.data);
    } catch (error) {
      console.error('신규 데이터를 저장하지 못했습니다.', error);
    }
  };

  const columns = [
    {
      field: 'user',
      headerName: 'User',
      editable: true,
      flex: 1,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
      cellClassRules: {
        'expense-table-required-cell': (params: any) =>
          !params.value || params.value.trim() === '',
      },
    },
    {
      field: 'category',
      headerName: 'Category',
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
      cellClassRules: {
        'expense-table-required-cell': (params: any) =>
          !params.value || params.value.trim() === '',
      },
    },
    {
      field: 'item',
      headerName: 'Item',
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
      cellClassRules: {
        'expense-table-required-cell': (params: any) =>
          !params.value || params.value.trim() === '',
      },
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      autoHeight: true,
      flex: 1,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
      cellClassRules: {
        'expense-table-required-cell': (params: any) =>
          !params.value || params.value.trim() === '',
      },
      valueSetter: (params: any) => {
        const value = params.newValue.trim();

        if (!/^\d+(\.\d+)?$/.test(value)) {
          comAPIContext.showToast('숫자만 입력 가능합니다.', 'danger');
          return false;
        }

        params.data.price = value;
        return true;
      },
    },
    {
      field: 'fileAttachment',
      headerName: 'File Attachment',
      cellRenderer: (params: any) => {
        return (
          <FileCellRenderer
            {...params}
            rowId={params.data?.gridRowId}
            selectedFilesMap={selectedFilesMap}
            setSelectedFilesMap={setSelectedFilesMap}
          />
        );
      },
      editable: false,
      autoHeight: true,
      flex: 3,
      wrapText: true,
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
  ];

  return (
    <div className={`${styles.start} container_bg`}>
      <header className={styles.header}>
        {/* <SiTableIcon width={12} height={12} fillColor="#00000073" /> */}
        <p className={styles.title}>Expense Management</p>
      </header>
      <main className={styles.main}>
        <AgGridWrapper
          ref={gridRef}
          enableCheckbox={true}
          showButtonArea={true}
          canCreate={true}
          canDelete={true}
          canUpdate={true}
          columnDefs={columns}
          tableHeight={'calc(100% - 35px)'}
          onSave={handleSave}
        />
      </main>
    </div>
  );
};

export default ExpenseManagement;
