export const getAdminDashboardFeatures = (handleFeaturePress, criticalAlerts) => [
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
    onPress: () => handleFeaturePress('PatientScanner')
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
    badge: criticalAlerts,
    onPress: () => handleFeaturePress('InventoryHistory')
  }
];

export const getAdminStatsConfig = (dashboardStats) => [
  {
    icon: "account-group",
    value: dashboardStats.totalUsers,
    label: "Total Users",
    color: "#3498db",
    trend: 5
  },
  {
    icon: "account-heart",
    value: dashboardStats.totalPatients,
    label: "Patients",
    color: "#e74c3c",
    trend: 2
  },
  {
    icon: "package-variant",
    value: dashboardStats.totalInventoryItems,
    label: "Inventory Items",
    color: "#2ecc71",
    trend: -1
  },
  {
    icon: "hospital-building",
    value: dashboardStats.totalDepartments,
    label: "Departments",
    color: "#9b59b6"
  },
  {
    icon: "qrcode-scan",
    value: dashboardStats.activeScans,
    label: "Recent Scans",
    color: "#f39c12"
  },
  {
    icon: "chart-line",
    value: `${dashboardStats.systemEfficiency}%`,
    label: "Efficiency",
    color: "#1abc9c",
    trend: 3
  }
];
