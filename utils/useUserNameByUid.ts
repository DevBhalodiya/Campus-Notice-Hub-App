import { db } from '@/constants/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useUserNameByUid(uid?: string) {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!uid);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setName(null);
      setLoading(false);
      return;
    }
    async function fetchName() {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setName(userDoc.data().name || null);
        } else {
          setName(null);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to fetch user name');
      } finally {
        setLoading(false);
      }
    }
    fetchName();
  }, [uid]);

  return { name, loading, error };
}
