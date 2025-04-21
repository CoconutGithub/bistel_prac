import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ResumeData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  createDate: string;
  experience: string;
  education: string;
  skills: string;
  resumeFilename: string;
  gender: string;
  company: string;
  department: string;
  position: string;
  jobTitle: string;
}

interface ResumeState {
  data: ResumeData[]; // ✅ Redux state 필드명 수정
  loading: boolean;
  error: string | null;
}

const initialState: ResumeState = {
  data: [], // ✅ Redux state 필드명 수정
  loading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setResumeData: (state, action: PayloadAction<ResumeData[]>) => {
      state.data = action.payload;
    },
  },
});

export const { setResumeData } = resumeSlice.actions; // ✅ 액션 export 추가
export default resumeSlice.reducer;
