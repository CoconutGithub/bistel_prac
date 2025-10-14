import React, { useState, useMemo, FC, ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import axios from 'axios'; // API 통신을 위한 axios import
// [수정] 'xlsx' 라이브러리는 전역(global)으로 로드된 것으로 가정하고, 직접 import 구문을 제거합니다.
import * as XLSX from 'xlsx';

// [추가] TypeScript 환경에서 전역 변수 XLSX를 인식할 수 있도록 선언합니다.
// declare const XLSX: any;


// 임시 토큰 변수
const cachedAuthToken = sessionStorage.getItem('authToken');

const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // 백엔드 서버 주소
});


// --- 타입 정의 ---
interface Skill {
  category: string;
  id: string;
  name:string;
  definition: string;
}

interface Ability {
  id: number | string;
  category: string;
  name: string;
  type: string;
  offJt: number;
  ojt: number;
}

interface RequiredAbility extends Ability {
  code: string;
  task: number;
  baseTime: number;
}

interface SelectiveAbility extends Ability {
  code: string;
  description: string;
}

interface CompanySpecificAbility extends Ability {
  include: 'include' | 'exclude';
  description: string;
}

type AnyAbility = RequiredAbility | SelectiveAbility | CompanySpecificAbility;


// --- 컴포넌트 ---

// 아이콘 컴포넌트
const QuestionCircleIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill inline-block text-gray-400 ms-1" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.226-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
  </svg>
);

// 모달 컴포넌트 Props 타입
interface JobSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: Skill) => void;
}

const JobSkillModal: FC<JobSkillModalProps> = ({ isOpen, onClose, onAddSkill }) => {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchBasicCompetencies = async () => {
      if (isOpen) {
        try {
          const response = await apiClient.get('/api/train-ability/basic-competency', {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
          });

          // 백엔드(BasicCompetency)와 프론트엔드(Skill)의 필드 이름이 다르므로 매핑합니다.
          const formattedSkills = response.data.map((item: any) => ({
            id: item.id.toString(), // id는 string 타입으로 변환
            name: item.competency, // competency -> name
            definition: item.competencyDescription, // competencyDescription -> definition
            category: "직업기초능력", // category는 백엔드에 없으므로 직접 추가
          }));

          setSkills(formattedSkills);

        } catch (error) {
          console.error("직업기초능력 목록 조회 실패:", error);
        }
      }
    };

    fetchBasicCompetencies();
  }, [isOpen]);

  return (
    <Modal show={isOpen} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>직업기초능력 조회 및 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <table className="table table-hover">
          <thead className="table-light sticky-top">
          <tr>
            <th style={{width: '5%'}}>No</th>
            <th style={{width: '15%'}}>직업기초능력</th>
            <th>직업기초능력 정의</th>
            <th style={{width: '10%'}}>선택</th>
          </tr>
          </thead>
          <tbody>
          {skills.map((skill, index) => (
            <tr key={skill.id}>
              <td className="text-center">{index + 1}</td>
              <td>{skill.name}</td>
              <td className="text-start small">{skill.definition}</td>
              <td className="text-center">
                <Button variant="primary" size="sm" onClick={() => onAddSkill(skill)}>
                  선택
                </Button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// 메인 컴포넌트
const TrainAbilityUnitSelection = () => {
  const [requiredAbilities, setRequiredAbilities] = useState<RequiredAbility[]>([]);

  useEffect(() => {
    const fetchRequiredAbilities = async () => {
      try {
        const response = await apiClient.get('/api/train-ability/ability-unit', {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        });

        // 백엔드(AbilityUnit)와 프론트엔드(RequiredAbility)의 필드 이름이 다르므로 매핑합니다.
        const formattedData = response.data.map((item: any) => ({
          id: item.id,
          category: item.detailClassification, // detailClassification -> category (세분류)
          name: item.unitName, // unitName -> name (능력단위명)
          code: item.id, // id -> code (능력단위 분류번호)
          task: parseInt(item.task, 10) || 0, // task는 String 타입이므로 숫자로 변환
          type: item.category, // category -> type (유형)
          baseTime: item.standardTrainingTime, // standardTrainingTime -> baseTime (기존 훈련시간)
          offJt: item.offJt || 0,
          ojt: item.ojt || 0,
        }));

        setRequiredAbilities(formattedData);

      } catch (error) {
        console.error("필수 능력단위 목록 조회 실패:", error);
      }
    };

    fetchRequiredAbilities();
  }, []);

  const [selectiveAbilities, setSelectiveAbilities] = useState<SelectiveAbility[]>([]);
  const [companySpecific, setCompanySpecific] = useState<CompanySpecificAbility[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTimeChange = <T extends AnyAbility>(setter: Dispatch<SetStateAction<T[]>>, id: number | string, field: 'offJt' | 'ojt', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: numValue } : item));
  };

  const handleDeleteRow = <T extends AnyAbility>(setter: Dispatch<SetStateAction<T[]>>, id: number | string) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  const addCompanySpecificRow = () => {
    const newRow: CompanySpecificAbility = {
      id: Date.now(),
      category: '',
      include: 'exclude',
      name: '',
      type: '',
      description: '',
      offJt: 0,
      ojt: 0,
    };
    setCompanySpecific(prev => [...prev, newRow]);
  };

  const addSkillFromModal = (skill: Skill) => {
    if (selectiveAbilities.some(ability => ability.code === skill.id)) {
      alert("이미 추가된 항목입니다.");
      return;
    }

    const newSkill: SelectiveAbility = {
      id: `${skill.id}-${Date.now()}`,
      category: skill.category,
      code: skill.id,
      name: skill.name,
      type: '-',
      description: '',
      offJt: 0,
      ojt: 0,
    };
    setSelectiveAbilities(prev => [...prev, newSkill]);
  };

  const handleCompanyInputChange = (id: number | string, field: keyof CompanySpecificAbility, value: string) => {
    setCompanySpecific(prev => prev.map(item => item.id === id ? {...item, [field]: value} : item));
  };

  const totals = useMemo(() => {
    const calculate = (items: AnyAbility[]) => items.reduce((acc, item) => {
      acc.offJt += item.offJt || 0;
      acc.ojt += item.ojt || 0;
      return acc;
    }, { offJt: 0, ojt: 0 });

    const required = calculate(requiredAbilities);
    const selective = calculate(selectiveAbilities);
    const company = calculate(companySpecific);

    const grandTotalOffJt = required.offJt + selective.offJt + company.offJt;
    const grandTotalOjt = required.ojt + selective.ojt + company.ojt;
    const grandTotal = grandTotalOffJt + grandTotalOjt;

    return {
      required: { ...required, sum: required.offJt + required.ojt },
      selective: { ...selective, sum: selective.offJt + selective.ojt },
      company: { ...company, sum: company.offJt + company.ojt },
      grandTotal,
      grandTotalOffJt,
      grandTotalOjt
    };
  }, [requiredAbilities, selectiveAbilities, companySpecific]);

  // 엑셀 파일로 저장하는 함수
  const handleExcelExport = () => {
    // 1. 새로운 워크북(엑셀 파일) 생성
    const wb = XLSX.utils.book_new();

    // 2. "총 훈련시간" 시트 데이터 준비
    const summarySheetData = [
      ["구분", "OFF-JT", "OJT", "계"],
      ["필수능력단위", `${totals.required.offJt}시간`, `${totals.required.ojt}시간`, `${totals.required.sum}시간`],
      ["선택능력단위", `${totals.selective.offJt}시간`, `${totals.selective.ojt}시간`, `${totals.selective.sum}시간`],
      ["기업특화훈련", `${totals.company.offJt}시간`, `${totals.company.ojt}시간`, `${totals.company.sum}시간`],
      ["합계",
        `${totals.grandTotalOffJt}시간 (${(totals.grandTotal > 0 ? (totals.grandTotalOffJt / totals.grandTotal * 100) : 0).toFixed(2)}%)`,
        `${totals.grandTotalOjt}시간 (${(totals.grandTotal > 0 ? (totals.grandTotalOjt / totals.grandTotal * 100) : 0).toFixed(2)}%)`,
        `${totals.grandTotal}시간`
      ]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "총 훈련시간");

    // 3. "필수 능력단위" 시트 데이터 준비
    const requiredHeader = ["세분류", "능력단위 분류번호", "수행업무", "능력단위명", "유형", "기존 훈련시간", "OFF-JT", "OJT", "합계", "기준대비 반영비율"];
    const requiredBody = requiredAbilities.map(item => {
      const sum = item.offJt + item.ojt;
      const ratio = item.baseTime > 0 ? (sum / item.baseTime * 100).toFixed(2) : "0.00";
      return [item.category, item.code, item.task, item.name, item.type, item.baseTime, item.offJt, item.ojt, sum, `${ratio}%`];
    });
    const requiredFooter = new Array(requiredHeader.length).fill(null);
    requiredFooter[0] = "반영시간 합계 (총 400시간 이상)";
    requiredFooter[8] = totals.required.sum;
    const requiredData = [requiredHeader, ...requiredBody, requiredFooter];
    const wsRequired = XLSX.utils.aoa_to_sheet(requiredData);
    XLSX.utils.book_append_sheet(wb, wsRequired, "필수 능력단위");

    // 4. "선택 능력단위" 시트 데이터 준비
    const selectiveHeader = ["세분류", "능력단위 분류번호", "능력단위명", "유형", "적용직무 개요입력", "OFF-JT", "OJT", "합계"];
    const selectiveBody = selectiveAbilities.map(item => [item.category, item.code, item.name, item.type, item.description, item.offJt, item.ojt, item.offJt + item.ojt]);
    const selectiveFooter = new Array(selectiveHeader.length).fill(null);
    selectiveFooter[0] = "반영시간 합계";
    selectiveFooter[7] = totals.selective.sum;
    const selectiveData = [selectiveHeader, ...selectiveBody, selectiveFooter];
    const wsSelective = XLSX.utils.aoa_to_sheet(selectiveData);
    XLSX.utils.book_append_sheet(wb, wsSelective, "선택 능력단위");

    // 5. "기업특화" 시트 데이터 준비
    const companyHeader = ["세분류", "직업기초시간 포함여부", "능력단위명", "유형", "적용직무 개요입력", "OFF-JT", "OJT", "합계"];
    const companyBody = companySpecific.map(item => [item.category, item.include === 'include' ? '포함' : '미포함', item.name, item.type, item.description, item.offJt, item.ojt, item.offJt + item.ojt]);
    const companyFooter = new Array(companyHeader.length).fill(null);
    companyFooter[0] = "반영시간 합계";
    companyFooter[7] = totals.company.sum;
    const companyData = [companyHeader, ...companyBody, companyFooter];
    const wsCompany = XLSX.utils.aoa_to_sheet(companyData);
    XLSX.utils.book_append_sheet(wb, wsCompany, "기업특화");

    // 6. 엑셀 파일 다운로드 트리거
    XLSX.writeFile(wb, "훈련_능력단위_선정.xlsx");
  };

  return (
    <>
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <Container fluid className="h-100 p-4">
        <Row>
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="h4 mb-0">훈련 능력단위 선정 <QuestionCircleIcon /></h2>
            </div>
            <hr/>
          </Col>
        </Row>

        <Row className="py-3">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-muted small mb-0">훈련과정 편성 &gt; 훈련 능력단위 선정 화면에 나오는 항목을 편집하는 화면입니다.</p>
              <div>
                {/*<Button variant="primary">임시저장</Button>*/}
                {/* [수정] "저장" 버튼의 기능을 엑셀 내보내기로 변경하고, 버튼 텍스트도 수정 */}
                <Button variant="success" className="ms-2" onClick={handleExcelExport}>엑셀로 저장</Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            {/* 총 훈련시간 */}
            <div className="mb-5">
              <h3 className="h5 mb-3">● 총 훈련시간</h3>
              <table className="table table-bordered text-center">
                <thead className="table-light">
                <tr>
                  <th>구분</th><th>OFF-JT</th><th>OJT</th><th>계</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <th className="table-light">필수능력단위</th>
                  <td>{totals.required.offJt}시간</td>
                  <td>{totals.required.ojt}시간</td>
                  <td>{totals.required.sum}시간</td>
                </tr>
                <tr>
                  <th className="table-light">선택능력단위</th>
                  <td>{totals.selective.offJt}시간</td>
                  <td>{totals.selective.ojt}시간</td>
                  <td>{totals.selective.sum}시간</td>
                </tr>
                <tr>
                  <th className="table-light">기업특화훈련</th>
                  <td>{totals.company.offJt}시간</td>
                  <td>{totals.company.ojt}시간</td>
                  <td>{totals.company.sum}시간</td>
                </tr>
                </tbody>
                <tfoot>
                <tr className="table-secondary fw-bold">
                  <td>합계</td>
                  <td>{totals.grandTotalOffJt}시간 ({(totals.grandTotal > 0 ? (totals.grandTotalOffJt / totals.grandTotal * 100) : 0).toFixed(2)}%)</td>
                  <td>{totals.grandTotalOjt}시간 ({(totals.grandTotal > 0 ? (totals.grandTotalOjt / totals.grandTotal * 100) : 0).toFixed(2)}%)</td>
                  <td>{totals.grandTotal}시간</td>
                </tr>
                </tfoot>
              </table>
            </div>

            {/* 필수 능력단위 */}
            <div className="mb-5">
              <h3 className="h5 mb-3">● 필수 능력단위</h3>
              <table className="table table-bordered text-center align-middle">
                <thead className="table-light">
                <tr>
                  <th>세분류</th>
                  <th>능력단위 분류번호<br/>수행업무</th>
                  <th>능력단위명</th>
                  <th>유형</th>
                  <th>기존<br/>훈련시간</th>
                  <th>반영시간<br/>OFF-JT</th>
                  <th>반영시간<br/>OJT</th>
                  <th>합계</th>
                  <th>기준대비<br/>반영비율</th>
                </tr>
                </thead>
                <tbody>
                {requiredAbilities.map(item => {
                  const sum = item.offJt + item.ojt;
                  const ratio = item.baseTime > 0 ? (sum / item.baseTime * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td className="text-start small">{item.code}<br/><span className="text-muted">수행업무: {item.task}</span></td>
                      <td className="text-start">{item.name}</td>
                      <td><span className="badge bg-primary">{item.type}</span></td>
                      <td>{item.baseTime}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          placeholder="0"
                          value={item.offJt || ''}
                          onChange={(e) => handleTimeChange(setRequiredAbilities, item.id, 'offJt', e.target.value)}
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm text-center"
                          placeholder="0"
                          value={item.ojt || ''}
                          onChange={(e) => handleTimeChange(setRequiredAbilities, item.id, 'ojt', e.target.value)}
                          min="0"
                        />
                      </td>
                      <td>{sum}</td>
                      <td className={parseFloat(ratio) > 100 ? 'text-danger fw-bold' : ''}>
                        {ratio}%
                      </td>
                    </tr>
                  )
                })}
                </tbody>
                <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan={7}>반영시간 합계 (총 400시간 이상)</td>
                  <td>{totals.required.sum}</td>
                  <td></td>
                </tr>
                </tfoot>
              </table>
            </div>

            {/* 선택 능력단위 */}
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h5 mb-0">● 선택 능력단위</h3>
                <Button variant="info" size="sm" onClick={() => setIsModalOpen(true)}>직업기초능력 추가</Button>
              </div>
              <table className="table table-bordered text-center align-middle">
                <thead className="table-light">
                <tr>
                  <th>세분류</th>
                  <th>능력단위 분류번호</th>
                  <th>능력단위명</th>
                  <th>유형</th>
                  <th>적용직무 개요입력</th>
                  <th>OFF-JT</th>
                  <th>OJT</th>
                  <th>합계</th>
                  <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {selectiveAbilities.map(item => (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.code}</td>
                    <td className="text-start">{item.name}</td>
                    <td>{item.type}</td>
                    <td><input type="text" className="form-control form-control-sm" value={item.description} onChange={e => setSelectiveAbilities(prev => prev.map(i => i.id === item.id ? {...i, description: e.target.value} : i))} /></td>
                    <td><input type="number" className="form-control form-control-sm text-center" value={item.offJt} onChange={(e) => handleTimeChange(setSelectiveAbilities, item.id, 'offJt', e.target.value)} min="0" /></td>
                    <td><input type="number" className="form-control form-control-sm text-center" value={item.ojt} onChange={(e) => handleTimeChange(setSelectiveAbilities, item.id, 'ojt', e.target.value)} min="0" /></td>
                    <td>{item.offJt + item.ojt}</td>
                    <td><Button variant="danger" size="sm" onClick={() => handleDeleteRow(setSelectiveAbilities, item.id)}>-</Button></td>
                  </tr>
                ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan={7}>반영시간 합계</td>
                  <td>{totals.selective.sum}</td>
                  <td></td>
                </tr>
                </tfoot>
              </table>
            </div>

            {/* 기업특화 */}
            <div>
              <h3 className="h5 mb-3">● 기업특화</h3>
              <table className="table table-bordered text-center align-middle">
                <thead className="table-light">
                <tr>
                  <th>세분류</th>
                  <th>직업기초시간<br/>포함여부</th>
                  <th>능력단위명</th>
                  <th>유형</th>
                  <th>적용직무 개요입력</th>
                  <th>OFF-JT</th>
                  <th>OJT</th>
                  <th>합계</th>
                  <th>삭제</th>
                </tr>
                </thead>
                <tbody>
                {companySpecific.map(item => (
                  <tr key={item.id}>
                    <td><input type="text" className="form-control form-control-sm" placeholder="세분류" value={item.category} onChange={(e) => handleCompanyInputChange(item.id, 'category', e.target.value)} /></td>
                    <td>
                      <select className="form-select form-select-sm" value={item.include} onChange={(e) => handleCompanyInputChange(item.id, 'include', e.target.value as 'include' | 'exclude')}>
                        <option value="include">포함</option>
                        <option value="exclude">미포함</option>
                      </select>
                    </td>
                    <td><input type="text" className="form-control form-control-sm" placeholder="능력단위명" value={item.name} onChange={(e) => handleCompanyInputChange(item.id, 'name', e.target.value)} /></td>
                    <td><input type="text" className="form-control form-control-sm" placeholder="유형" value={item.type} onChange={(e) => handleCompanyInputChange(item.id, 'type', e.target.value)} /></td>
                    <td><input type="text" className="form-control form-control-sm" placeholder="개요" value={item.description} onChange={(e) => handleCompanyInputChange(item.id, 'description', e.target.value)} /></td>
                    <td><input type="number" className="form-control form-control-sm text-center" value={item.offJt} onChange={(e) => handleTimeChange(setCompanySpecific, item.id, 'offJt', e.target.value)} min="0" /></td>
                    <td><input type="number" className="form-control form-control-sm text-center" value={item.ojt} onChange={(e) => handleTimeChange(setCompanySpecific, item.id, 'ojt', e.target.value)} min="0" /></td>
                    <td>{item.offJt + item.ojt}</td>
                    <td><Button variant="danger" size="sm" onClick={() => handleDeleteRow(setCompanySpecific, item.id)}>-</Button></td>
                  </tr>
                ))}
                </tbody>
                <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan={7}>반영시간 합계</td>
                  <td>{totals.company.sum}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={addCompanySpecificRow}>+</Button>
                  </td>
                </tr>
                </tfoot>
              </table>
            </div>
          </Col>
        </Row>
      </Container>

      <JobSkillModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddSkill={addSkillFromModal} />
    </>
  );
}

export default TrainAbilityUnitSelection;

