import { auth, db } from '@/constants/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (userDoc) => {
      if (userDoc.exists()) {
        setProfile(userDoc.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (err) => {
      setError(err.message || 'Failed to fetch user profile');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { profile, loading, error };
}
