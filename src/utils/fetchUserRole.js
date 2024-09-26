import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const fetchUserRole = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
  }
  return null;
};

export default fetchUserRole;
