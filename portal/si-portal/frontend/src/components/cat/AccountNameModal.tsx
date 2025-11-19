import React, {useState, useEffect, useContext} from 'react';
import { Modal, ListGroup, Form } from 'react-bootstrap';
import {ComAPIContext} from "~components/ComAPIContext";
import axios from "axios";
import {cachedAuthToken} from "~store/AuthSlice";

interface AccountNameModalProps {
  show: boolean;
  onHide: () => void;
  onSelect: (accountName: string) => void;
  currentValue?: string | null;
}

interface AccountNameCategoryData {
    categoryId: number;
    categoryName: string;
    categoryCode: number | null;
    level: number;
    parentId: number | null;
    children: AccountNameCategoryData[]
}

const AccountNameModal: React.FC<AccountNameModalProps> = ({
  show,
  onHide,
  onSelect,
  currentValue,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const comAPIContext = useContext(ComAPIContext);
  const [accountNameCategory, setAccountNameCategory] = useState<AccountNameCategoryData[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const fetchAccountNames = ()=> {
    axios
        .get(`${process.env.REACT_APP_BACKEND_IP}/cct/account-names`, {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
          },
        })
        .then((response) => {
          if (response.data) {
            setAccountNameCategory(response.data)
          }
        })
        .catch((error) => {
          console.error('Error fetching transactions:', error);
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
            console.log("account name list 조회")
        });
  }

  useEffect(()=>{
      if (show) {
          fetchAccountNames();
      }
  }, [show]);

  useEffect(() => {
    if (searchTerm && accountNameCategory.length > 0) {
        const newExpanded = new Set<number>();

        // 재귀 함수: 매칭되는 노드 찾고 부모 ID 수집
        const findMatches = (
            categories: AccountNameCategoryData[],
            parentIds: number[] = []
        ): boolean => {
            let hasMatch = false;

            categories.forEach(category => {
                const matches = category.categoryName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                const childMatches = category.children?.length > 0
                    ? findMatches(category.children, [...parentIds, category.categoryId])
                    : false;

                if (matches || childMatches) {
                    hasMatch = true;
                    // 모든 부모 노드 펼치기
                    parentIds.forEach(id => newExpanded.add(id));
                    if (category.children?.length > 0) {
                        newExpanded.add(category.categoryId);
                    }
                }
            });

            return hasMatch;
        };

        findMatches(accountNameCategory);
        setExpandedNodes(newExpanded);
    } else {
        setExpandedNodes(new Set()); // 검색어 없으면 모두 접기
    }
  }, [searchTerm, accountNameCategory]);

  const highlightText = (text: string, search: string): JSX.Element => {
    if (!search) return <>{text}</>;

    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <mark key={index} style={{
                        backgroundColor: '#ffeb3b',
                        fontWeight: 'bold',
                        padding: '2px 4px',
                        borderRadius: '3px'
                    }}>
                        {part}
                    </mark>
                ) : (
                    <span key={index}>{part}</span>
                )
            )}
        </>
    );
  };


  const handleSelect = (accountName: string) => {
    onSelect(accountName);
    onHide();
    setSearchTerm(''); // 검색어 초기화
  };

  // 노드 토글 (펼치기/접기)
  const toggleNode = (categoryId: number) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // 최하위 레벨인지 확인 (자식이 없으면 최하위)
  const isLeafNode = (category: AccountNameCategoryData): boolean => {
    return !category.children || category.children.length === 0;
  };

  const hasMatchInSubtree = (category: AccountNameCategoryData): boolean => {
        const selfMatches = category.categoryName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        if (selfMatches) return true;

        if (category.children && category.children.length > 0) {
            return category.children.some(child => hasMatchInSubtree(child));
        }

        return false;
  };

  // 재귀적으로 트리 렌더링
  const renderTreeNode = (category: AccountNameCategoryData): JSX.Element => {
    const isLeaf = isLeafNode(category);
    const isExpanded = expandedNodes.has(category.categoryId);
    const hasChildren = category.children && category.children.length > 0;

    // 검색어 필터링
    const shouldShow = searchTerm === '' || hasMatchInSubtree(category);


      return (
      <div key={category.categoryId}>
        <ListGroup.Item
          action={isLeaf} // 최하위만 클릭 가능
          onClick={() => {
            if (isLeaf) {
              handleSelect(category.categoryName);
            } else {
              toggleNode(category.categoryId);
            }
          }}
          active={category.categoryName === currentValue}
          style={{
            cursor: isLeaf ? 'pointer' : 'default',
            paddingLeft: `${category.level * 20}px`,
            backgroundColor: isLeaf ? undefined : '#f8f9fa',
            fontWeight: isLeaf ? 'normal' : 'bold',
            display: shouldShow ? 'block' : 'none'
          }}
        >
          {/* 토글 아이콘 (자식이 있을 때만) */}
          {hasChildren && (
            <span style={{ marginRight: '8px' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
          )}

          {highlightText(category.categoryName, searchTerm)}

          {/* 코드 표시 (있을 경우) */}
          {category.categoryCode && (
            <span style={{ color: '#6c757d', marginLeft: '8px' }}>
              ({category.categoryCode})
            </span>
          )}
        </ListGroup.Item>

        {/* 자식 노드 렌더링 (펼쳐져 있을 때만) */}
        {hasChildren && isExpanded && (
          <div>
            {category.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>계정명 선택</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* 검색 입력 */}
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="계정명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </Form.Group>

        {/* 계정 목록 */}
        <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {accountNameCategory.length > 0 ? (
            accountNameCategory.map(category => renderTreeNode(category))
          ) : (
            <ListGroup.Item disabled>
              {searchTerm ? '검색 결과가 없습니다.' : '데이터를 불러오는 중...'}
            </ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>
    </Modal>
  );
};

export default AccountNameModal;