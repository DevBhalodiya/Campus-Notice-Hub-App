
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential, sendEmailVerification, reload, User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/constants/firebase';

export type UserRole = 'student' | 'faculty' | 'admin';

export async function signupUser(
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<void> {
  const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;
  await sendEmailVerification(user);
  console.log('Verification email sent to', user.email);
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email,
    role,
    emailVerified: false,
    createdAt: serverTimestamp(),
  });
  await signOut(auth);
}

export async function loginUser(email: string, password: string): Promise<{ role: UserRole; emailVerified: boolean }> {
  const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  const { user } = userCredential;
  await reload(user); // Ensure latest emailVerified status
  if (!user.emailVerified) {
    await signOut(auth);
    throw new Error('Please verify your email before logging in');
  }
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) throw new Error('User profile not found');
  const data = userDoc.data();
  return { role: data.role as UserRole, emailVerified: user.emailVerified };
}
// Resend verification email for the currently logged-in user
export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error('No user is currently logged in');
  await sendEmailVerification(auth.currentUser);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUserRole(uid: string): Promise<UserRole> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) throw new Error('User profile not found');
  const data = userDoc.data();
  return data.role as UserRole;
}

export async function reloadCurrentUser(): Promise<User | null> {
  if (auth.currentUser) {
    await reload(auth.currentUser);
    return auth.currentUser;
  }
  return null;
}
