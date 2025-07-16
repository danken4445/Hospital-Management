export const initialPatientState = {
  personalInfo: {},
  inventory: {
    suppliesUsed: [],
    medUse: [],
    scannedItems: []
  },
  prescriptions: {},
  ui: {
    loading: false,
    scanning: false,
    scanType: null,
    currentScannedItem: null,
    quantityModalVisible: false,
    prescriptionModalVisible: false,
    showDatePicker: false,
    snackbar: {
      visible: false,
      message: ''
    }
  }
};

export const patientReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload }
      };
    case 'UPDATE_INVENTORY':
      return {
        ...state,
        inventory: { ...state.inventory, ...action.payload }
      };
    case 'ADD_PRESCRIPTION':
      return {
        ...state,
        prescriptions: { ...state.prescriptions, ...action.payload }
      };
    case 'SET_UI_STATE':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };
    default:
      return state;
  }
};