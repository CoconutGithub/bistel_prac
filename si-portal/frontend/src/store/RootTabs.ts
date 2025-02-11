import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";

export type RootTabItem = {
  key: string;
  label: string;
  path: string;
};

interface RootTabsState {
  tabs: RootTabItem[];
  activeKey: string | null;
}

const initialState: RootTabsState = {
  tabs: [],
  activeKey: null,
};

const RootTabs = createSlice({
  name: "root-tabs",
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<RootTabItem>) => {
      if (state.tabs.length >= 8) {
        alert("최대 8개의 탭만 열 수 있습니다.");
        return;
      }

      if (!state.tabs.some((tab) => tab.key === action.payload.key)) {
        state.tabs.push(action.payload);
      }
      state.activeKey = action.payload.key;
    },
    setActiveTab: (state, action: PayloadAction<string | null>) => {
      if (
        state.tabs.length >= 8 &&
        !state.tabs.some((tab) => tab.key === action.payload)
      ) {
        return;
      }
      state.activeKey = action.payload;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((tab) => tab.key !== action.payload);
      if (state.activeKey === action.payload) {
        state.activeKey =
          state.tabs.length > 0 ? state.tabs[state.tabs.length - 1].key : null;
      }
    },
    resetTab: (state) => {
      state.tabs = [];
      state.activeKey = null;
    },
  },
});

const persistConfig = {
  key: "rootTabs",
  storage: storageSession,
};

export const { addTab, setActiveTab, removeTab, resetTab } = RootTabs.actions;
export default persistReducer(persistConfig, RootTabs.reducer);
