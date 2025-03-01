import type { User, UserUpdatePayload } from "@repo/shared-types";
import { type Firestore } from "firebase-admin/firestore";
import { formatDate, isValidUser } from "@repo/shared-utils";
import { db } from "@/config/firebase";

export class UserRepository {
  private collection: FirebaseFirestore.CollectionReference;

  constructor(firestore: Firestore) {
    this.collection = firestore.collection("users");
  }

  async createUser(
    userData: { uid: string; email: string } & Partial<User>
  ): Promise<User> {
    const now = formatDate(new Date());
    const user: User = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName || "",
      photoURL: userData.photoURL || "",
      createdAt: now,
      updatedAt: now,
      isActive: userData.isActive ?? true,
      ...(userData.metadata && { metadata: userData.metadata }),
    };

    if (!isValidUser(user)) {
      throw new Error("Invalid user data");
    }

    await this.collection.doc(user.uid).set(user);
    return user;
  }

  async getUser(uid: string): Promise<User | null> {
    const doc = await this.collection.doc(uid).get();
    if (!doc.exists) return null;

    const userData = doc.data() as User;
    if (!isValidUser(userData)) {
      throw new Error("Invalid user data in database");
    }
    return userData;
  }

  async updateUser(
    uid: string,
    updates: UserUpdatePayload
  ): Promise<User | null> {
    const userRef = this.collection.doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return null;
    }

    const updatedData = {
      ...updates,
      updatedAt: formatDate(new Date()),
    };

    await userRef.update(updatedData);
    const updated = await userRef.get();
    const userData = updated.data() as User;

    if (!isValidUser(userData)) {
      throw new Error("Invalid user data after update");
    }
    return userData;
  }

  async deleteUser(uid: string): Promise<boolean> {
    const userRef = this.collection.doc(uid);
    const user = await userRef.get();

    if (!user.exists) {
      return false;
    }

    await userRef.delete();
    return true;
  }
}

export const userCollection = new UserRepository(db);
