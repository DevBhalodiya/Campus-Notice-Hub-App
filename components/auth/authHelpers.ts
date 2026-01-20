import { auth, db } from "@/constants/firebase";
import { setSigningUp } from "@/utils/authStateManager";
import {
  createUserWithEmailAndPassword,
  deleteUser,
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
  let userCreated = false;

  try {
    console.log(`[SIGNUP START] Creating user with role: ${role}`);

    // Set the signing up flag to prevent layout navigation
    setSigningUp(true);

    // Step 1: Create the user account
    userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const { user } = userCredential;
    userCreated = true;

    console.log(`[SIGNUP] User created with UID: ${user.uid}`);

    // Step 2: Create Firestore document
    try {
      console.log(`[SIGNUP] Creating Firestore document for ${role}...`);

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        emailVerified: false,
        createdAt: serverTimestamp(),
      });

      console.log(`[SIGNUP] Firestore document created successfully`);
    } catch (firestoreError: any) {
      console.error(
        "[SIGNUP ERROR] Firestore creation failed:",
        firestoreError,
      );
      console.error("Error code:", firestoreError.code);
      console.error("Error message:", firestoreError.message);

      // Delete the auth user if Firestore fails
      if (userCreated) {
        try {
          await deleteUser(user);
          console.log("[SIGNUP] Auth user deleted after Firestore failure");
          userCreated = false;
        } catch (deleteError) {
          console.error(
            "[SIGNUP ERROR] Failed to delete auth user:",
            deleteError,
          );
        }
      }

      throw new Error(
        `Failed to create user profile. Please check your internet connection and try again. (${firestoreError.code})`,
      );
    }

    // Step 3: Send verification email
    try {
      console.log(`[SIGNUP] Sending verification email...`);
      await sendEmailVerification(user);
      console.log(`[SIGNUP] Verification email sent to ${user.email}`);
    } catch (emailError: any) {
      console.error("[SIGNUP ERROR] Email verification error:", emailError);
      console.warn(
        "[SIGNUP] Verification email could not be sent, but account was created",
      );
    }

    // Step 4: Sign out the user immediately
    console.log("[SIGNUP] Signing out user...");
    await signOut(auth);
    console.log("[SIGNUP] User signed out successfully");
    console.log("[SIGNUP COMPLETE] Process finished successfully");
  } catch (error: any) {
    console.error("[SIGNUP ERROR] Fatal error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    // Clean up: if user was created but something failed, try to delete and sign them out
    if (userCreated && auth.currentUser) {
      try {
        console.log("[SIGNUP] Cleaning up - signing out user");
        await signOut(auth);
        console.log("[SIGNUP] User signed out during error cleanup");
      } catch (signOutError) {
        console.error(
          "[SIGNUP ERROR] Error during cleanup signout:",
          signOutError,
        );
      }
    }

    // Re-throw the error with more context
    throw error;
  } finally {
    // Always clear the signing up flag
    setSigningUp(false);
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ role: UserRole; emailVerified: boolean }> {
  try {
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
  } catch (error: any) {
    // Ensure user is signed out on any error
    if (auth.currentUser) {
      await signOut(auth);
    }
    throw error;
  }
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
