import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  modals: {
    [key: string]: boolean;
  };
  drawers: {
    [key: string]: boolean;
  };
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'system',
  modals: {},
  drawers: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    openDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = true;
    },
    closeDrawer: (state, action: PayloadAction<string>) => {
      state.drawers[action.payload] = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
} = uiSlice.actions;

export default uiSlice.reducer;
