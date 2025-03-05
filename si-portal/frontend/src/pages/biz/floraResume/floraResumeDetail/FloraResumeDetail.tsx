import SiTableIcon from '~components/icons/SiTableIcon';
import styles from './FloraResumeDetail.module.scss';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import ComButton from '~pages/portal/buttons/ComButton';
import SiCheckIcon from '~components/icons/SiCheckIcon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import cn from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';
import axios from 'axios';

let cachedAuthToken: string | null = sessionStorage.getItem('authToken');

interface IEducationType {
  gridRowId: string;
  schoolName: string;
  educationLevel: string;
  period: string;
  status: string;
}

interface IExperienceType {
  gridRowId: string;
  companyName: string;
  workPeriod: string;
  workDetail: string;
}

interface ISkillType {
  gridRowId: string;
  certificationName: string;
  certificationDate: string;
}

interface FormDataType {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  company: string;
  department: string;
  position: string;
  jobTitle: string;
  education: IEducationType[];
  experience: IExperienceType[];
  skills: ISkillType[];
}

const fetchResume = async (id: any) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_IP}/biz/flora-resumes/detail/${id}`,
      {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch resume', error);
    return [];
  }
};

const FloraResumeDetail = () => {
  const [formData, setFormData] = useState<FormDataType>({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    company: '',
    department: '',
    position: '',
    jobTitle: '',
    experience: [],
    education: [],
    skills: [],
  });
  const { id } = useParams();
  const eduGridRef = useRef<AgGridWrapperHandle>(null);
  const skillGridRef = useRef<AgGridWrapperHandle>(null);
  const workGridRef = useRef<AgGridWrapperHandle>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const eduColumns = useMemo(
    () => [
      {
        field: 'schoolName',
        headerName: '학교명',
        editable: true,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'educationLevel',
        headerName: '학교 유형',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'period',
        headerName: '재학 기간',
        editable: true,
        autoHeight: true,
        flex: 3,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'status',
        headerName: '졸업 상태',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  const certificationColumns = useMemo(
    () => [
      {
        field: 'certificationName',
        headerName: '자격증명',
        editable: true,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'certificationDate',
        headerName: '취득일',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  const workColumns = useMemo(
    () => [
      {
        field: 'companyName',
        headerName: '회사명',
        editable: true,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'workPeriod',
        headerName: '기간',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'workDetail',
        headerName: '담당 업무',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  const handleInputChange = useCallback((e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleCellValueChange = useCallback((event: any, type: any) => {
    const { data } = event;

    const updatedData: Record<string, any> = {};

    if (type === 'education') {
      const eduValidFields = new Set(eduColumns.map((col) => col.field));

      eduValidFields.forEach((key) => {
        if (!key) return;

        updatedData[key] = data.hasOwnProperty(key) ? data[key] ?? '' : '';
      });

      setFormData((prev) => {
        const updatedEducation = [...prev.education];

        const index = updatedEducation.findIndex(
          (edu) => edu.gridRowId === data.gridRowId
        );

        const newEducationItem: IEducationType = {
          gridRowId: data.gridRowId ?? Date.now().toString(),
          schoolName: updatedData.schoolName ?? '', // 필수 필드 추가
          educationLevel: updatedData.educationLevel ?? '',
          period: updatedData.period ?? '',
          status: updatedData.status ?? '',
        };

        if (index !== -1) {
          updatedEducation[index] = {
            ...updatedEducation[index],
            ...updatedData,
          };
        } else {
          updatedEducation.push(newEducationItem);
        }

        return { ...prev, education: updatedEducation };
      });
    }

    if (type === 'skills') {
      const skillsValidFields = new Set(
        certificationColumns.map((col) => col.field)
      );
      skillsValidFields.forEach((key) => {
        if (!key) return;

        updatedData[key] = data.hasOwnProperty(key) ? data[key] ?? '' : '';
      });

      setFormData((prev) => {
        const updatedSkills = [...prev.skills];

        const index = updatedSkills.findIndex(
          (skill) => skill.gridRowId === data.gridRowId
        );

        const newSkillItem: ISkillType = {
          gridRowId: data.gridRowId ?? Date.now().toString(),
          certificationName: updatedData.certificationName ?? '',
          certificationDate: updatedData.certificationDate ?? '',
        };

        if (index !== -1) {
          updatedSkills[index] = {
            ...updatedSkills[index],
            ...updatedData,
          };
        } else {
          updatedSkills.push(newSkillItem);
        }

        return { ...prev, skills: updatedSkills };
      });
    }

    if (type === 'experience') {
      const experienceValidFields = new Set(
        workColumns.map((col) => col.field)
      );
      experienceValidFields.forEach((key) => {
        if (!key) return;

        updatedData[key] = data.hasOwnProperty(key) ? data[key] ?? '' : '';
      });

      setFormData((prev) => {
        const updatedExperience = [...prev.experience];

        const index = updatedExperience.findIndex(
          (experience) => experience.gridRowId === data.gridRowId
        );

        const newExperienceItem: IExperienceType = {
          gridRowId: data.gridRowId ?? Date.now().toString(),
          companyName: updatedData.companyName ?? '',
          workPeriod: updatedData.workPeriod ?? '',
          workDetail: updatedData.workDetail ?? '',
        };

        if (index !== -1) {
          updatedExperience[index] = {
            ...updatedExperience[index],
            ...updatedData,
          };
        } else {
          updatedExperience.push(newExperienceItem);
        }

        return { ...prev, experience: updatedExperience };
      });
    }
  }, []);

  const handleEducationCellChange = useCallback(
    (e: any) => handleCellValueChange(e, 'education'),
    [handleCellValueChange]
  );
  const handleSkillsCellChange = useCallback(
    (e: any) => handleCellValueChange(e, 'skills'),
    [handleCellValueChange]
  );
  const handleExperienceCellChange = useCallback(
    (e: any) => handleCellValueChange(e, 'experience'),
    [handleCellValueChange]
  );

  const handleDeleteRow = (deletedRows: any[], type: string) => {
    console.log('삭제된 데이터', deletedRows);

    if (!deletedRows || deletedRows.length === 0) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      education:
        type === 'education'
          ? prev.education.filter(
              (edu) =>
                !deletedRows.some((row) => row.gridRowId === edu.gridRowId)
            )
          : prev.education,
      skills:
        type === 'skills'
          ? prev.skills.filter(
              (skill) =>
                !deletedRows.some((row) => row.gridRowId === skill.gridRowId)
            )
          : prev.skills,
      experience:
        type === 'experience'
          ? prev.experience.filter(
              (exp) =>
                !deletedRows.some((row) => row.gridRowId === exp.gridRowId)
            )
          : prev.experience,
    }));
  };

  const handleUpdate = async () => {
    if (!formData.fullName.trim()) {
      alert('성명을 입력해주세요.');
      return;
    }
    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    const jsonEduData = formData.education.map(
      ({ gridRowId, ...rest }) => rest
    );

    const jsonSkillsData = formData.skills.map(
      ({ gridRowId, ...rest }) => rest
    );

    const jsonWorkData = formData.experience.map(
      ({ gridRowId, ...rest }) => rest
    );

    const resumeData = {
      ...formData,
      education: jsonEduData,
      experience: jsonWorkData,
      skills: jsonSkillsData,
    };

    console.log('resumeData', resumeData);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_IP}/biz/flora-resumes/update/${id}`,
        resumeData,
        {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
          },
        }
      );
      window.location.reload();
    } catch (error) {
      console.error('이력서 수정에 실패했습니다.', error);
      alert('이력서 수정에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (
      !hasInitialized &&
      (formData.education.length > 0 ||
        formData.experience.length > 0 ||
        formData.skills.length > 0)
    ) {
      if (eduGridRef.current) {
        const updatedEducation = formData.education.map((item, index) => ({
          ...item,
          gridRowId: index.toString(),
        }));
        eduGridRef.current.setRowData(updatedEducation);
      }

      if (workGridRef.current) {
        const updatedExperience = formData.experience.map((item, index) => ({
          ...item,
          gridRowId: index.toString(),
        }));
        workGridRef.current.setRowData(updatedExperience);
      }

      if (skillGridRef.current) {
        const updatedSkills = formData.skills.map((item, index) => ({
          ...item,
          gridRowId: index.toString(),
        }));
        skillGridRef.current.setRowData(updatedSkills);
      }

      setHasInitialized(true);
    }
  }, [formData]);

  useEffect(() => {
    const loadInitData = async () => {
      const initData = await fetchResume(id);
      if (initData) {
        setFormData((prev) => ({
          ...prev,
          ...Object.keys(prev).reduce((acc, key) => {
            const typedKey = key as keyof typeof prev;

            if (typedKey === 'education' && initData['education']) {
              const jsonArray = initData[typedKey];

              const formattedEducation = jsonArray.map(
                (item: any, index: any) => ({
                  gridRowId: item.gridRowId || index.toString(),
                  ...eduColumns.reduce((eduAcc: any, eduCol) => {
                    if (!eduCol.field) return eduAcc;

                    eduAcc[eduCol.field] = item[eduCol.field] || '';
                    return eduAcc;
                  }, {}),
                })
              );

              acc[typedKey] = formattedEducation;
            } else if (typedKey === 'skills' && initData['skills']) {
              const jsonArray = initData[typedKey];

              const formattedSkills = jsonArray.map(
                (item: any, index: any) => ({
                  gridRowId: item.gridRowId || index.toString(),
                  ...certificationColumns.reduce((certiAcc: any, certiCol) => {
                    if (!certiCol.field) return certiAcc;

                    certiAcc[certiCol.field] = item[certiCol.field] || '';
                    return certiAcc;
                  }, {}),
                })
              );

              acc[typedKey] = formattedSkills;
            } else if (typedKey === 'experience' && initData['experience']) {
              const jsonArray = initData[typedKey];

              const formattedExperience = jsonArray.map(
                (item: any, index: any) => ({
                  gridRowId: item.gridRowId || index.toString(),
                  ...workColumns.reduce((workAcc: any, workCol) => {
                    if (!workCol.field) return workAcc;

                    workAcc[workCol.field] = item[workCol.field] || '';
                    return workAcc;
                  }, {}),
                })
              );

              acc[typedKey] = formattedExperience;
            } else if (initData.hasOwnProperty(typedKey)) {
              acc[typedKey] = initData[typedKey];
            }
            return acc;
          }, {} as typeof prev),
        }));
      }
    };

    loadInitData();
  }, [id]);

  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <div className={styles.title_area}>
          <SiTableIcon width={12} height={12} fillColor="#00000073" />
          <p className={styles.title}>Detail Resume</p>
        </div>
        <div className={styles.button_area}>
          <ComButton
            onClick={() => {}}
            size="sm"
            className={styles.button}
            variant="outline-secondary"
          >
            Delete
          </ComButton>
          <ComButton
            onClick={handleUpdate}
            size="sm"
            className={styles.button}
            variant="outline-primary"
          >
            Update
          </ComButton>
        </div>
      </header>
      <main className={styles.main}>
        <div className={styles.form}>
          <div className={styles.form_row}>
            <div className={styles.form_item}>
              <label htmlFor="fullName" className={styles.label}>
                성명
              </label>
              <input
                id="fullName"
                required
                className={styles.input}
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="phone" className={styles.label}>
                전화번호
              </label>
              <input
                id="phone"
                className={styles.input}
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label className={styles.label}>주민등록번호</label>
              <input disabled className={styles.input} />
            </div>
          </div>
          <div className={styles.form_row}>
            <div className={styles.form_item}>
              <label htmlFor="email" className={styles.label}>
                이메일
              </label>
              <input
                id="email"
                required
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="gender" className={styles.label}>
                성별
              </label>
              <input
                id="gender"
                className={styles.input}
                value={formData.gender}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="company" className={styles.label}>
                회사
              </label>
              <input
                id="company"
                className={styles.input}
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={styles.form_row}>
            <div className={styles.form_item}>
              <label htmlFor="department" className={styles.label}>
                부서
              </label>
              <input
                id="department"
                className={styles.input}
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="position" className={styles.label}>
                직위
              </label>
              <input
                id="position"
                className={styles.input}
                value={formData.position}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="jobTitle" className={styles.label}>
                직무
              </label>
              <input
                id="jobTitle"
                className={styles.input}
                value={formData.position}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className={styles.table_form_wrap}>
          <div className={styles.table_form}>
            <label className={styles.label}>학력 사항</label>
            <AgGridWrapper
              ref={eduGridRef}
              enableCheckbox={false}
              showButtonArea={true}
              canCreate={true}
              canDelete={true}
              canUpdate={false}
              columnDefs={eduColumns}
              tableHeight="400px"
              useNoColumn={true}
              onCellValueChanged={handleEducationCellChange}
              onDelete={(deletedRows) =>
                handleDeleteRow(deletedRows, 'education')
              }
            />
          </div>
          <div className={styles.table_form}>
            <label className={styles.label}>자격증</label>
            <AgGridWrapper
              ref={skillGridRef}
              enableCheckbox={false}
              showButtonArea={true}
              canCreate={true}
              canDelete={true}
              canUpdate={false}
              columnDefs={certificationColumns}
              tableHeight="400px"
              useNoColumn={true}
              onCellValueChanged={handleSkillsCellChange}
              onDelete={(deletedRows) => handleDeleteRow(deletedRows, 'skills')}
            />
          </div>
        </div>
        <div className={cn(styles.table_form, styles.wide)}>
          <label className={styles.label}>프로젝트 경험(경력 사항)</label>
          <AgGridWrapper
            ref={workGridRef}
            enableCheckbox={false}
            showButtonArea={true}
            canCreate={true}
            canDelete={true}
            canUpdate={false}
            columnDefs={workColumns}
            tableHeight={'600px'}
            useNoColumn={true}
            onCellValueChanged={handleExperienceCellChange}
            onDelete={(deletedRows) =>
              handleDeleteRow(deletedRows, 'experience')
            }
          />
        </div>
      </main>
    </div>
  );
};

export default FloraResumeDetail;
