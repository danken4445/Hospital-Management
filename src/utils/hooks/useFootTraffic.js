import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../services/firebase';

const useFootTraffic = () => {
  const [footTrafficData, setFootTrafficData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const footTrafficRef = ref(database, 'footTraffic');

    const unsubscribe = onValue(footTrafficRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.entries(data).map(([key, value]) => ({
          dateTime: key,
          count: value.count,
        }));
        setFootTrafficData(formattedData);
      } else {
        setFootTrafficData([]);
      }
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });

    return () => off(footTrafficRef, 'value', unsubscribe);
  }, []);

  return { footTrafficData, loading, error };
};

export default useFootTraffic;