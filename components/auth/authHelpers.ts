import { auth, db } from "@/constants/firebase";
import {
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export type UserRole = "student" | "faculty" | "admin";

export async function signupUser(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<void> {
  let userCredential: UserCredential | null = null;

  try {
    // Step 1: Create the user account
    userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const { user } = userCredential;

    console.log("User created:", user.uid);

    // Step 2: Create Firestore document BEFORE sending verification email
    // This must happen while the user is still authenticated
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          name,
          email,
          role,
          emailVerified: false,
          createdAt: serverTimestamp(),
        },
        { merge: false },
      ); // Use merge: false to ensure we're creating, not updating

      console.log("Firestore document created successfully");
    } catch (firestoreError: any) {
      console.error("Firestore creation error:", firestoreError);
      console.error("Error code:", firestoreError.code);
      console.error("Error message:", firestoreError.message);

      // If Firestore fails, we should delete the auth user to keep things clean
      // But we'll let the outer catch handle the cleanup
      throw new Error(
        `Failed to create user profile: ${firestoreError.message}`,
      );
    }

    // Step 3: Send verification email
    try {
      await sendEmailVerification(user);
      console.log("Verification email sent to", user.email);
    } catch (emailError: any) {
      console.error("Email verification error:", emailError);
      // Don't throw here - the account was created successfully
      // Just log the error and continue
      console.warn(
        "Verification email could not be sent, but account was created",
      );
    }

    // Step 4: Sign out the user
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error: any) {
    console.error("Signup error:", error);

    // Clean up: if user was created but something failed, sign them out
    if (userCredential && auth.currentUser) {
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error("Error during cleanup signout:", signOutError);
      }
    }

    // Re-throw the error with more context
    throw error;
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ role: UserRole; emailVerified: boolean }> {
  const userCredential: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const { user } = userCredential;

  // Reload to get latest emailVerified status
  await reload(user);

  if (!user.emailVerified) {
    await signOut(auth);
    throw new Error("Please verify your email before logging in");
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error("User profile not found");
  }

  const data = userDoc.data();
  return { role: data.role as UserRole, emailVerified: user.emailVerified };
}

// Resend verification email for the currently logged-in user
export async function resendVerificationEmail(): Promise<void> {
  if (!auth.currentUser) throw new Error("No user is currently logged in");
  await sendEmailVerification(auth.currentUser);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUserRole(uid: string): Promise<UserRole> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) throw new Error("User profile not found");
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
