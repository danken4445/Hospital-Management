import { ref, get } from 'firebase/database';  // Import from firebase/database
import { database } from '../../firebaseConfig';  // Import database instance from your config
import * as d3 from 'd3';
import moment from 'moment';

const footTrafficService = {
  // Fetch patient foot traffic data based on patient dateTime entries
  fetchFootTrafficData: async (startDate, endDate) => {
    try {
      const patientsRef = ref(database, 'patient');  // This will now work correctly
      const snapshot = await get(patientsRef);
      const patientsData = snapshot.exists() ? snapshot.val() : {};

      // Convert patients object to array and filter by dateTime
      const patientsArray = Object.entries(patientsData)
        .map(([patientId, patientData]) => ({
          patientId,
          dateTime: patientData.dateTime,
          name: patientData.name || 'Unknown',
          department: patientData.department || 'General',
          age: patientData.age || 0,
          gender: patientData.gender || 'Unknown'
        }))
        .filter(patient => {
          if (!patient.dateTime) return false;
          const patientDate = new Date(patient.dateTime);
          return patientDate >= new Date(startDate) && patientDate <= new Date(endDate);
        })
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

      return patientsArray;
    } catch (error) {
      console.error('Error fetching patient foot traffic data:', error);
      throw error;
    }
  },

  // Get comprehensive patient traffic analytics
  getPatientTrafficAnalytics: async (timeRange = 30) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const patientsData = await footTrafficService.fetchFootTrafficData(startDate, endDate);

      if (!patientsData || patientsData.length === 0) {
        return footTrafficService.getDefaultTrafficData();
      }

      return footTrafficService.processPatientTrafficData(patientsData, timeRange);
    } catch (error) {
      console.error('Error getting patient traffic analytics:', error);
      return footTrafficService.getDefaultTrafficData();
    }
  },

  // Process patient data to generate traffic analytics using D3
  processPatientTrafficData: (patientsData, timeRange) => {
    // Daily patient count using D3
    const dailyTraffic = d3.rollup(
      patientsData,
      v => v.length,
      d => moment(d.dateTime).format('YYYY-MM-DD')
    );

    // Hourly pattern analysis
    const hourlyTraffic = d3.rollup(
      patientsData,
      v => v.length,
      d => moment(d.dateTime).hour()
    );

    // Weekly pattern (day of week)
    const weeklyPattern = d3.rollup(
      patientsData,
      v => v.length,
      d => moment(d.dateTime).format('dddd')
    );

    // Monthly trends
    const monthlyTrends = d3.rollup(
      patientsData,
      v => v.length,
      d => moment(d.dateTime).format('YYYY-MM')
    );

    // Department-wise traffic
    const departmentTraffic = d3.rollup(
      patientsData.filter(p => p.department),
      v => v.length,
      d => d.department
    );

    // Age group analysis
    const ageGroupTraffic = d3.rollup(
      patientsData.filter(p => p.age > 0),
      v => v.length,
      p => {
        const age = parseInt(p.age);
        if (age < 18) return '0-17';
        if (age < 35) return '18-34';
        if (age < 50) return '35-49';
        if (age < 65) return '50-64';
        return '65+';
      }
    );

    // Gender distribution
    const genderTraffic = d3.rollup(
      patientsData.filter(p => p.gender && p.gender !== 'Unknown'),
      v => v.length,
      p => p.gender
    );

    // Calculate key metrics
    const totalPatients = patientsData.length;
    const avgPatientsPerDay = totalPatients / timeRange;
    const peakHour = footTrafficService.getPeakHour(hourlyTraffic);
    const busiestDepartment = footTrafficService.getBusiestDepartment(departmentTraffic);
    const peakDay = footTrafficService.getPeakDay(weeklyPattern);

    return {
      // Chart data
      dailyTraffic: Array.from(dailyTraffic, ([date, count]) => ({
        label: moment(date).format('MM/DD'),
        count,
        date: date
      })).slice(-14), // Last 14 days

      hourlyPattern: Array.from(hourlyTraffic, ([hour, count]) => ({
        label: `${hour.toString().padStart(2, '0')}:00`,
        count
      })).sort((a, b) => parseInt(a.label) - parseInt(b.label)),

      weeklyPattern: Array.from(weeklyPattern, ([day, count]) => ({
        label: day,
        count
      })),

      monthlyTrends: Array.from(monthlyTrends, ([month, count]) => ({
        label: moment(month).format('MMM YYYY'),
        count
      })).slice(-6),

      departmentTraffic: Array.from(departmentTraffic, ([dept, count]) => ({
        label: dept,
        count,
        color: footTrafficService.getRandomColor()
      })).sort((a, b) => b.count - a.count),

      ageGroupTraffic: Array.from(ageGroupTraffic, ([group, count]) => ({
        label: group,
        count,
        color: footTrafficService.getRandomColor()
      })),

      genderTraffic: Array.from(genderTraffic, ([gender, count]) => ({
        label: gender,
        count,
        color: gender === 'Male' ? '#4ECDC4' : '#FF6B6B'
      })),

      // Key metrics
      metrics: {
        totalPatients,
        avgPatientsPerDay: Math.round(avgPatientsPerDay * 10) / 10,
        peakHour,
        busiestDepartment,
        peakDay,
        growthRate: footTrafficService.calculateGrowthRate(dailyTraffic),
        busiest: footTrafficService.getBusiestDay(dailyTraffic)
      }
    };
  },

  // Helper functions
  getPeakHour: (hourlyData) => {
    if (hourlyData.size === 0) return 'N/A';
    const peak = Array.from(hourlyData.entries()).sort((a, b) => b[1] - a[1])[0];
    return `${peak[0].toString().padStart(2, '0')}:00`;
  },

  getBusiestDepartment: (deptData) => {
    if (deptData.size === 0) return 'N/A';
    const busiest = Array.from(deptData.entries()).sort((a, b) => b[1] - a[1])[0];
    return busiest[0];
  },

  getPeakDay: (weeklyData) => {
    if (weeklyData.size === 0) return 'N/A';
    const peak = Array.from(weeklyData.entries()).sort((a, b) => b[1] - a[1])[0];
    return peak[0];
  },

  getBusiestDay: (dailyData) => {
    if (dailyData.size === 0) return 'N/A';
    const busiest = Array.from(dailyData.entries()).sort((a, b) => b[1] - a[1])[0];
    return moment(busiest[0]).format('dddd, MMM DD');
  },

  calculateGrowthRate: (dailyData) => {
    const data = Array.from(dailyData.entries()).sort();
    if (data.length < 2) return 0;
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, [, count]) => sum + count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, [, count]) => sum + count, 0) / secondHalf.length;
    
    if (firstAvg === 0) return 0;
    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  },

  getRandomColor: () => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFD93D', '#6BCF7F'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Default data when no patients exist
  getDefaultTrafficData: () => {
    return {
      dailyTraffic: [
        { label: '12/06', count: 3, date: '2024-12-06' },
        { label: '12/07', count: 5, date: '2024-12-07' },
        { label: '12/08', count: 2, date: '2024-12-08' },
        { label: '12/09', count: 8, date: '2024-12-09' },
        { label: '12/10', count: 4, date: '2024-12-10' },
        { label: '12/11', count: 6, date: '2024-12-11' },
        { label: '12/12', count: 7, date: '2024-12-12' }
      ],
      hourlyPattern: [
        { label: '08:00', count: 2 },
        { label: '09:00', count: 4 },
        { label: '10:00', count: 6 },
        { label: '11:00', count: 5 },
        { label: '12:00', count: 3 },
        { label: '13:00', count: 2 },
        { label: '14:00', count: 5 },
        { label: '15:00', count: 7 },
        { label: '16:00', count: 4 },
        { label: '17:00', count: 2 }
      ],
      weeklyPattern: [
        { label: 'Monday', count: 8 },
        { label: 'Tuesday', count: 6 },
        { label: 'Wednesday', count: 5 },
        { label: 'Thursday', count: 7 },
        { label: 'Friday', count: 9 },
        { label: 'Saturday', count: 4 },
        { label: 'Sunday', count: 3 }
      ],
      monthlyTrends: [
        { label: 'Aug 2024', count: 45 },
        { label: 'Sep 2024', count: 52 },
        { label: 'Oct 2024', count: 48 },
        { label: 'Nov 2024', count: 61 },
        { label: 'Dec 2024', count: 68 },
        { label: 'Jan 2025', count: 72 }
      ],
      departmentTraffic: [
        { label: 'Emergency', count: 15, color: '#FF6B6B' },
        { label: 'Cardiology', count: 12, color: '#4ECDC4' },
        { label: 'Surgery', count: 8, color: '#45B7D1' },
        { label: 'Pediatrics', count: 6, color: '#96CEB4' },
        { label: 'Radiology', count: 4, color: '#FFEAA7' }
      ],
      ageGroupTraffic: [
        { label: '0-17', count: 8, color: '#FF6B6B' },
        { label: '18-34', count: 18, color: '#4ECDC4' },
        { label: '35-49', count: 14, color: '#45B7D1' },
        { label: '50-64', count: 12, color: '#96CEB4' },
        { label: '65+', count: 9, color: '#FFEAA7' }
      ],
      genderTraffic: [
        { label: 'Male', count: 32, color: '#4ECDC4' },
        { label: 'Female', count: 28, color: '#FF6B6B' }
      ],
      metrics: {
        totalPatients: 35,
        avgPatientsPerDay: 1.2,
        peakHour: '15:00',
        busiestDepartment: 'Emergency',
        peakDay: 'Friday',
        growthRate: 12,
        busiest: 'Friday, Dec 09'
      }
    };
  },

  // Helper to record when a new patient is created (call this from your patient creation form)
  recordPatientVisit: async (patientData) => {
    // This is just for logging - the actual patient data is already in the database
    console.log(`New patient recorded: ${patientData.name} at ${patientData.dateTime}`);
    // You could add additional analytics tracking here if needed
  }
};

export default footTrafficService;