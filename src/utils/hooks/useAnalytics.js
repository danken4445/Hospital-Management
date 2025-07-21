import { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../services/firebase';

const useAnalytics = () => {
  const [footTrafficData, setFootTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFootTrafficData = async () => {
      setLoading(true);
      try {
        const footTrafficRef = ref(database, 'footTraffic');
        const snapshot = await get(footTrafficRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedData = Object.keys(data).map(key => ({
            dateTime: key,
            count: data[key].count,
          }));
          setFootTrafficData(formattedData);
        } else {
          setFootTrafficData([]);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFootTrafficData();
  }, []);

  return { footTrafficData, loading, error };
};

export default useAnalytics;