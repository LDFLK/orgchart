// store/presidencySlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  presidentDict: {},
  presidentRelationDict: {},
  selectedIndex: null,
  selectedPresident: null,
  selectedDate: null,
  initialized: false,
};

const presidencySlice = createSlice({
  name: 'presidency',
  initialState,
  reducers: {
    setPresidentDict(state, action){
      state.presidentDict = action.payload;
    },
    setPresidentRelationDict(state, action){
      state.presidentRelationDict = action.payload;
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
      if (!state.initialized && state.presidentDict.length > 0) {
        // const lastPresidentIndex = presidents.length - 1;
        // const lastPresident = state.presidentList[lastPresidentIndex];
        // const lastDate = lastPresident?.dates[lastPresident.dates.length - 1]?.date ?? null;

        // state.selectedIndex = lastPresidentIndex;
        // state.selectedDate = lastDate;
        state.initialized = true;
      }
    },
    
    setSelectedPresidentById: (state, action) => {
      const presidentId = action.payload;
      const president = state.presidentDict.find(p => p.id === presidentId);
      
      if (president) {
        state.selectedPresident = president;
        const index = state.presidentDict.findIndex(p => p.id === presidentId);
        state.selectedIndex = index;
      }
    },
  },
});

export const { setPresidentDict, setPresidentRelationDict, setSelectedPresident, setSelectedIndex, setSelectedDate, initializeSelection, setSelectedPresidentById } = presidencySlice.actions;
export default presidencySlice.reducer;
