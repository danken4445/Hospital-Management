export const initialDeptPatientState = {
  personalInfo: {
    firstName: '',
    lastName: '',
    birth: '',
    age: '',
    dateTime: '',
    contact: '',
    diagnosis: '',
    roomType: '',
    status: '',
    qrData: '',
    gender: ''
  },
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
    suppliesSearchTerm: '',
    medSearchTerm: '',
    snackbar: {
      visible: false,
      message: ''
    }
  },
  userDepartment: null
};

export const deptPatientReducer = (state, action) => {
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
    case 'SET_USER_DEPARTMENT':
      return {
        ...state,
        userDepartment: action.payload
      };
    default:
      return state;
  }
};
