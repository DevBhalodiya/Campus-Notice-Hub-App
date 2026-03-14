import { auth, db } from '@/constants/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function useSavedNoticeIds() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsubscribe = onSnapshot(
      collection(db, 'users', auth.currentUser.uid, 'savedNotices'),
      (snapshot) => {
        setSavedIds(snapshot.docs.map((doc) => doc.id));
      }
    );
    return unsubscribe;
  }, []);

  return savedIds;
}
