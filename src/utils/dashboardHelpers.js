export const getDepartmentColor = (dept) => {
  const colors = {
    'ICU': '#e74c3c',
    'ER': '#e67e22',
    'COVID UNIT': '#9b59b6',
    'Outpatient': '#3498db',
    'admin': '#2c3e50'
  };
  return colors[dept] || '#3498db';
};

export const getDepartmentIcon = (dept) => {
  const icons = {
    'ICU': 'heart-pulse',
    'ER': 'ambulance',
    'COVID UNIT': 'virus',
    'Outpatient': 'account-group',
    'admin': 'shield-crown'
  };
  return icons[dept] || 'hospital-building';
};

export const getAdminFeatures = (handleFeaturePress) => [
  {
    title: "Inventory Management",
    subtitle: "Monitor stock levels",
    icon: "package-variant",
    color: "#3498db",
    onPress: () => handleFeaturePress('InventoryScreen')
  },
  {
    title: "Account Creation",
    subtitle: "User management",
    icon: "account-plus",
    color: "#2ecc71",
    onPress: () => handleFeaturePress('CreateAccountScreen')
  },
  {
    title: "Patient Scanner",
    subtitle: "QR code scanning",
    icon: "qrcode-scan",
    color: "#e74c3c",
    onPress: () => handleFeaturePress('DeptPatientScanner')
  },
  {
    title: "Inventory Scanner",
    subtitle: "Stock scanning",
    icon: "barcode-scan",
    color: "#f39c12",
    onPress: () => handleFeaturePress('InventoryScanner')
  },
  {
    title: "Department Access",
    subtitle: "View all departments",
    icon: "hospital-building",
    color: "#9b59b6",
    onPress: () => handleFeaturePress('AccessDepartment')
  },
  {
    title: "Usage Analytics",
    subtitle: "Historical data",
    icon: "chart-line",
    color: "#1abc9c",
    onPress: () => handleFeaturePress('InventoryHistory')
  }
];

export const getDepartmentFeatures = (userRole, handleFeaturePress, navigation, departmentStats) => [
  {
    title: "Patient Scanner",
    subtitle: "Scan patient codes",
    icon: "qrcode-scan",
    color: "#e74c3c",
    onPress: () => handleFeaturePress('DeptPatientScanner', userRole, { department: userRole })
  },
  {
    title: "Transfer History",
    subtitle: "Track transfers",
    icon: "swap-horizontal",
    color: "#3498db",
    onPress: () => navigation.navigate('DeptTransferHistory')
  },
  {
    title: "Local Inventory",
    subtitle: "Department stock",
    icon: "package-variant",
    color: "#2ecc71",
    badge: departmentStats.criticalAlerts,
    onPress: () => handleFeaturePress('DeptLocalInventory', userRole, { department: userRole })
  },
  {
    title: "Usage History",
    subtitle: "Track consumption",
    icon: "history",
    color: "#f39c12",
    onPress: () => handleFeaturePress('DeptUsageHistory', userRole, { department: userRole })
  }
];
