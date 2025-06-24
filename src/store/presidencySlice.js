// store/presidencySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  presidentList: [],
  presidentRelationList: [],
  selectedIndex: null,
  selectedPresident: null,
  selectedDate: null,
  initialized: false,
};

const presidencySlice = createSlice({
  name: 'presidency',
  initialState,
  reducers: {
    setPresidentList(state, action){
      state.presidentList = action.payload;
    },
    setPresidentRelationList(state, action){
      state.presidentRelationList = action.payload;
    },
    setSelectedPresident(state, action){
      state.selectedPresident = action.payload;
    },
    setSelectedIndex(state, action) {
      state.selectedIndex = action.payload;
      state.selectedDate = null;
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload;
    },
    initializeSelection(state) {
      if (!state.initialized && state.presidentList.length > 0) {
        // const lastPresidentIndex = presidents.length - 1;
        // const lastPresident = state.presidentList[lastPresidentIndex];
        // const lastDate = lastPresident?.dates[lastPresident.dates.length - 1]?.date ?? null;

        // state.selectedIndex = lastPresidentIndex;
        // state.selectedDate = lastDate;
        state.initialized = true;
      }
    },
  },
});

export const { setPresidentList, setPresidentRelationList, setSelectedPresident, setSelectedIndex, setSelectedDate, initializeSelection } = presidencySlice.actions;
export default presidencySlice.reducer;
