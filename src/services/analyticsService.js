import { ref, get } from 'firebase/database';
import { database } from '../services/firebase';

// Function to fetch foot traffic data from the database
export const fetchFootTrafficData = async (startDate, endDate) => {
  try {
    const footTrafficRef = ref(database, 'footTraffic');
    const snapshot = await get(footTrafficRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const filteredData = Object.entries(data)
        .filter(([dateTime]) => {
          const date = new Date(dateTime);
          return date >= new Date(startDate) && date <= new Date(endDate);
        })
        .map(([dateTime, count]) => ({
          dateTime: new Date(dateTime).toISOString(),
          count,
        }));
      return filteredData;
    } else {
      throw new Error('No foot traffic data available');
    }
  } catch (error) {
    console.error('Error fetching foot traffic data:', error);
    throw error;
  }
};

// Function to process foot traffic data for visualization
export const processFootTrafficData = (data) => {
  return data.map(entry => ({
    dateTime: new Date(entry.dateTime),
    count: entry.count,
  }));
};