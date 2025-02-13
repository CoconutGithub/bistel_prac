export interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}


// 외부에서 사용할 메서드 타입 정의
export interface AgGridWrapperHandle {
  setRowData: (data: any[]) => void;
  getRowData: () => any[];
  getApi: () => any;
}
