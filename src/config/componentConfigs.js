export const componentConfigs = {
  // Example configurations for different component types
  ModernView: {
    id: 'ModernView',
    shareableKeys: ['selectedPresident', 'selectedDate', 'selectedMinistry', 'profileOpen', 'drawerOpen'],
    getStateValue: (key, reduxState) => {
      switch (key) {
        case 'selectedPresident':
          return reduxState.presidency?.selectedPresident?.id;
        case 'selectedDate':
          return reduxState.presidency?.selectedDate;
        case 'selectedMinistry':
          return reduxState.allMinistryData?.selectedMinistry;
        case 'profileOpen':
        case 'drawerOpen':
          return reduxState.ui?.[key];
        default:
          return undefined;
      }
    },
    applyStateUpdate: (urlState, dispatch) => {
      if (urlState.selectedPresident) {
        dispatch({ type: 'presidency/selectPresident', payload: urlState.selectedPresident });
      }
      if (urlState.selectedDate) {
        dispatch({ type: 'presidency/selectDate', payload: urlState.selectedDate });
      }
      if (urlState.selectedMinistry) {
        dispatch({ type: 'allMinistryData/selectMinistry', payload: urlState.selectedMinistry });
      }
      if (urlState.profileOpen !== undefined) {
        dispatch({ type: 'ui/setProfileOpen', payload: urlState.profileOpen });
      }
      if (urlState.drawerOpen !== undefined) {
        dispatch({ type: 'ui/setDrawerOpen', payload: urlState.drawerOpen });
      }
    }
  },

  MinistryDrawer: {
    id: 'MinistryDrawer',
    shareableKeys: ['selectedMinistry'],
    getStateValue: (key, reduxState) => {
      switch(key){
        case 'selectedMinistry':
          return reduxState.allMinistryData?.selectedMinistry;
      }
    },
    applyStateUpdate: (urlState, dispatch) => {
      if(urlState.selectedMinistry){
        dispatch({
          type: 'allMinistryData/setSelectedMinistry',
          payload: urlState.selectedMinistry
        })
      }
    }
  },

  PresidencyTimeline: {
    id: 'PresidencyTimeline',
    shareableKeys: ['selectedPresident','selectedDate'],
    getStateValue: (key, reduxState) => {
      switch (key) {
        case 'selectedPresident':
          return reduxState.presidency?.selectedPresident?.id;
        case 'selectedDate':
          return reduxState.presidency?.selectedDate?.date;
        default:
          return undefined;
      }
    },
    applyStateUpdate: (urlState, dispatch) => {
      console.log('Applying URL state to PresidencyTimeline:', urlState);
      
      if (urlState.selectedPresident) {
        dispatch({ 
          type: 'presidency/setSelectedPresidentById', 
          payload: urlState.selectedPresident 
        });
      }
      
      if (urlState.selectedIndex !== undefined) {
        dispatch({ 
          type: 'presidency/setSelectedIndex', 
          payload: parseInt(urlState.selectedIndex) 
        });
      }
      
      if (urlState.selectedDate) {
        dispatch({ 
          type: 'presidency/setSelectedDate', 
          payload: { date: urlState.selectedDate } 
        });
      }
      
      if (urlState.mode) {
        dispatch({ 
          type: 'ui/setTimelineMode', 
          payload: urlState.mode 
        });
      }
    }
  },

  MinistryCardGrid: {
    id: 'MinistryCardGrid',
    shareableKeys: ['selectedDate', 'selectedMinistry', 'gridView', 'sortBy'],
    getStateValue: (key, reduxState) => {
      switch (key) {
        case 'selectedDate':
          return reduxState.presidency?.selectedDate;
        case 'selectedMinistry':
          return reduxState.allMinistryData?.selectedMinistry;
        case 'gridView':
          return reduxState.ui?.gridView;
        case 'sortBy':
          return reduxState.ui?.sortBy;
        default:
          return undefined;
      }
    },
    applyStateUpdate: (urlState, dispatch) => {
      if (urlState.selectedDate) {
        dispatch({ type: 'presidency/selectDate', payload: urlState.selectedDate });
      }
      if (urlState.selectedMinistry) {
        dispatch({ type: 'allMinistryData/selectMinistry', payload: urlState.selectedMinistry });
      }
      if (urlState.gridView) {
        dispatch({ type: 'ui/setGridView', payload: urlState.gridView });
      }
      if (urlState.sortBy) {
        dispatch({ type: 'ui/setSortBy', payload: urlState.sortBy });
      }
    }
  },

  PersonProfile: {
    id: 'PersonProfile',
    shareableKeys: ['selectedPerson', 'profileTab'],
    getStateValue: (key, reduxState) => {
      switch (key) {
        case 'selectedPerson':
          return reduxState.selectedPerson?.id;
        case 'profileTab':
          return reduxState.ui?.profileTab;
        default:
          return undefined;
      }
    },
    applyStateUpdate: (urlState, dispatch) => {
      if (urlState.selectedPerson) {
        dispatch({ type: 'selectPerson', payload: urlState.selectedPerson });
      }
      if (urlState.profileTab) {
        dispatch({ type: 'ui/setProfileTab', payload: urlState.profileTab });
      }
    }
  }

  // Add configurations for all your components...
};
