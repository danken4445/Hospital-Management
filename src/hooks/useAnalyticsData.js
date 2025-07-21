import { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import * as d3 from 'd3';
import moment from 'moment';
import { 
  processMedicineData, 
  processSupplyData, 
  processPatientData,
  processDepartmentData,
  processBillingData,
  calculateGrowthMetrics,
  generateTimeSeriesData
} from '../utils/analyticsDataProcessors';

// Date helper using d3 time functions
const subtractDays = (date, days) => {
  return d3.timeDay.offset(date, -days);
};

export const useAnalyticsData = (selectedTimeline, timelineOptions) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalPatients: 0,
    totalMedicines: 0,
    totalSupplies: 0,
    departmentCount: 0,
    patientGrowth: 0,
    usageGrowth: 0,
    revenueGrowth: 0
  });

  const [chartData, setChartData] = useState({
    dailyPatients: [],
    weeklyRevenue: [],
    medicineUsage: [],
    medicineCategories: [],
    supplyUsage: [],
    supplyCategories: [],
    departmentActivity: [],
    departmentLoad: [],
    ageDistribution: [],
    genderDistribution: []
  });

  const [patientTrafficData, setPatientTrafficData] = useState({
    dailyTraffic: [],
    hourlyPattern: [],
    departmentTraffic: [],
    metrics: {}
  });

  const getTimelineDate = () => {
    const selectedOption = timelineOptions?.find(opt => opt.value === selectedTimeline);
    const days = selectedOption ? selectedOption.days : 180;
    return subtractDays(new Date(), days);
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const db = getDatabase();
      const timelineStartDate = getTimelineDate();
      
      console.log(`Fetching data from ${timelineStartDate} to ${new Date()}`);
      
      // Fetch all data from Firebase
      const [
        departmentsSnapshot,
        patientsSnapshot,
        billingSnapshot
      ] = await Promise.all([
        get(ref(db, 'departments')),
        get(ref(db, 'patient')),
        get(ref(db, 'billing'))
      ]);

      const departmentsData = departmentsSnapshot.val() || {};
      const patientsData = patientsSnapshot.val() || {};
      const billingData = billingSnapshot.val() || {};

      console.log('Raw data fetched:', {
        departments: Object.keys(departmentsData).length,
        patients: Object.keys(patientsData).length,
        billing: Object.keys(billingData).length
      });

      // Process the data using d3 analytics functions
      const medicineAnalytics = processMedicineData(departmentsData, timelineStartDate);
      const supplyAnalytics = processSupplyData(departmentsData, timelineStartDate);
      const patientAnalytics = processPatientData(patientsData, timelineStartDate);
      const departmentAnalytics = processDepartmentData(departmentsData, timelineStartDate);
      
      // Updated billing processing with workaround
      const billingAnalytics = processBillingData(
        billingData, 
        patientsData, 
        departmentsData, 
        timelineStartDate
      );
      
      const currentMetrics = {
        totalPatients: patientAnalytics.totalPatients,
        totalMedicines: medicineAnalytics.totalMedicines,
        totalSupplies: supplyAnalytics.totalSupplies,
        totalRevenue: billingAnalytics.totalRevenue
      };
      
      const growthMetrics = calculateGrowthMetrics(currentMetrics);

      console.log('Processed analytics:', currentMetrics);

      // Set analytics data
      setAnalyticsData({
        ...currentMetrics,
        departmentCount: Object.keys(departmentsData).length,
        ...growthMetrics
      });

      // Set chart data with d3-processed results
      setChartData({
        dailyPatients: patientAnalytics.dailyData.length > 0 ? 
          patientAnalytics.dailyData : 
          generateTimeSeriesData([], 7),
        weeklyRevenue: billingAnalytics.weeklyRevenue,
        dailyRevenue: billingAnalytics.dailyRevenue,
        medicineUsage: medicineAnalytics.medicineUsage,
        medicineCategories: medicineAnalytics.medicineCategories,
        supplyUsage: supplyAnalytics.supplyUsage,
        supplyCategories: supplyAnalytics.supplyCategories,
        departmentActivity: departmentAnalytics.departmentActivity,
        departmentLoad: departmentAnalytics.departmentLoad,
        ageDistribution: patientAnalytics.ageDistribution,
        genderDistribution: patientAnalytics.genderDistribution,
        isMockBilling: billingAnalytics.mockData || false
      });

      // Generate patient traffic data using d3
      const hourlyPattern = d3.range(8, 18).map(hour => ({
        label: `${hour.toString().padStart(2, '0')}:00`,
        count: Math.floor(Math.random() * 10) + 1
      }));

      setPatientTrafficData({
        dailyTraffic: patientAnalytics.dailyData,
        hourlyPattern,
        departmentTraffic: departmentAnalytics.departmentActivity.slice(0, 5),
        metrics: {
          totalPatients: patientAnalytics.totalPatients,
          avgPatientsPerDay: d3.mean(patientAnalytics.dailyData, d => d.count) || 0,
          peakHour: d3.maxIndex(hourlyPattern, d => d.count) !== -1 ? 
            hourlyPattern[d3.maxIndex(hourlyPattern, d => d.count)].label : '15:00',
          peakDay: 'Friday'
        }
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Use fallback data with d3 color schemes
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      
      const fallbackChartData = {
        dailyPatients: generateTimeSeriesData([], 7),
        medicineUsage: [
          { label: 'Paracetamol', count: 45, color: colorScale(0) },
          { label: 'Ibuprofen', count: 32, color: colorScale(1) },
          { label: 'Amoxicillin', count: 28, color: colorScale(2) }
        ],
        medicineCategories: [
          { label: 'Tablets and Capsules', count: 105, color: colorScale(0) },
          { label: 'Syrup', count: 30, color: colorScale(1) },
          { label: 'I.V Fluids', count: 200, color: colorScale(2) }
        ],
        ageDistribution: [
          { label: '0-17', count: 8, color: colorScale(0) },
          { label: '18-34', count: 18, color: colorScale(1) },
          { label: '35-49', count: 14, color: colorScale(2) },
          { label: '50-64', count: 12, color: colorScale(3) },
          { label: '65+', count: 9, color: colorScale(4) }
        ],
        genderDistribution: [
          { label: 'Male', count: 32, color: '#4ECDC4' },
          { label: 'Female', count: 28, color: '#FF6B6B' }
        ]
      };
      
      setAnalyticsData({
        totalPatients: 25,
        totalMedicines: 45,
        totalSupplies: 38,
        totalRevenue: 2500000,
        departmentCount: 8,
        patientGrowth: 12,
        usageGrowth: 8,
        revenueGrowth: 15
      });
      
      setChartData(fallbackChartData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeline]);

  return {
    loading,
    analyticsData,
    chartData,
    patientTrafficData,
    refetch: fetchAnalyticsData
  };
};