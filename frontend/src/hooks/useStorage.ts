import { useUser } from "@clerk/clerk-react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "../firebase";

interface Voice {
  id: string;
  voiceName: string;
  voiceId: string;
}

export default function useStorage() {
  const { user } = useUser();

  async function storeClonedVoice(
    voiceId: string,
    voiceName: string
  ): Promise<Voice | null> {
    try {
      if (!user) {
        toast.error("Couldn't find user");
        return null;
      }
      const voiceRef = collection(db, "elevenlabs_voice");

      const newVoice = {
        userId: user.id,
        createdAt: serverTimestamp(),
        voiceId,
        voiceName,
      };

      const docRef = await addDoc(voiceRef, newVoice);
      return { id: docRef.id, voiceName, voiceId };
    } catch (error) {
      console.error("Error creating voice:", error);
      return null;
    }
  }

  async function getAllVoices(): Promise<Voice[]> {
    try {
      if (!user) {
        toast.error("Couldn't find user");
        return [];
      }

      const voiceRef = collection(db, "elevenlabs_voice");
      const q = query(voiceRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);

      const voices: Voice[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        voiceName: doc.data().voiceName,
        voiceId: doc.data().voiceId,
      }));

      return voices;
    } catch (error) {
      console.error("Error fetching voices:", error);
      return [];
    }
  }

  return { storeClonedVoice, getAllVoices };
}
