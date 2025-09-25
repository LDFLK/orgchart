import { configureStore } from '@reduxjs/toolkit';
import presidencyReducer from './presidencySlice';
import gazetteDataReducer from './gazetteDate';
import allPersonReducer from './allPersonData';
import allMinistryDataReducer from './allMinistryData';
import allDepartmentDataReducer from './allDepartmentData';
// import urlState from './urlStateSlice';

const store = configureStore({
  reducer: {
    presidency: presidencyReducer,
    gazettes: gazetteDataReducer,
    allPerson: allPersonReducer,
    allMinistryData: allMinistryDataReducer,
    allDepartmentData: allDepartmentDataReducer,
    // urlState: urlState
  },
});

export default store;