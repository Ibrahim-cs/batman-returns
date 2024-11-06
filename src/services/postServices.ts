import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  increment,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { PostData } from "../types";

const POSTS_COLLECTION = "posts";

export const getPosts = async (startIndex: number): Promise<PostData[]> => {
  try {
    const postsRef = collection(db, POSTS_COLLECTION);

    const postsQuery = query(postsRef, orderBy("createdAt", "desc"), limit(10));
    const snapshot = await getDocs(postsQuery);
    const posts: PostData[] = [];
    snapshot.docs.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
      } as PostData);
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Unable to fetch posts");
  }
};

export const createPost = async (post: any) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated");

  const postData: PostData = {
    userId: user.uid,
    userName: user.displayName || "Anonymous",
    imageUrl: post.imageUrl,
    likeCount: 0,
    likedByUser: false,
    createdAt: new Date(),
    id: Date.now().toString(),
    comments: [],
    savedByUser: undefined,
  };

  await addDoc(collection(db, POSTS_COLLECTION), postData);
  return postData;
};

export const likePost = async (postId: string) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated");
  let docId;

  const q = query(collection(db, POSTS_COLLECTION), where("id", "==", postId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    docId = doc.id;
  });

  const postRef = doc(db, POSTS_COLLECTION, docId);
  const postDoc = await getDoc(postRef);
  if (!postDoc.exists()) {
    throw new Error("No document found with the given postId");
  }
  await updateDoc(postRef, {
    likeCount: increment(1),
    likedBy: arrayUnion(user.uid),
    likedByUser: true,
  });
};

export const unlikePost = async (postId: string) => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated");

  let docId;

  const q = query(collection(db, POSTS_COLLECTION), where("id", "==", postId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    docId = doc.id;
  });

  const postRef = doc(db, POSTS_COLLECTION, docId);
  const postDoc = await getDoc(postRef);

  if (!postDoc.exists()) {
    throw new Error("No document found with the given postId");
  }

  const postData = postDoc.data();
  const likedByArray = postData?.likedBy || [];

  if (!likedByArray.includes(user.uid)) {
    console.log("User hasn't liked the post yet");
    return;
  }

  await updateDoc(postRef, {
    likeCount: increment(-1),
    likedBy: arrayRemove(user.uid),
    likedByUser: false,
  });
  console.log("Post unliked successfully");
};

export const deletePost = async (postId: string) => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(postRef);
};

export const addCommentToPost = async (postId: string, comment: Comment) => {
  let docId;
  const q = query(collection(db, POSTS_COLLECTION), where("id", "==", postId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    docId = doc.id;
  });
  const postRef = doc(db, "posts", docId);

  try {
    await updateDoc(postRef, {
      comments: arrayUnion(comment),
    });
    console.log("Comment added successfully");
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};

export const savePost = async (postId: string): Promise<void> => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  let docId;

  const q = query(collection(db, POSTS_COLLECTION), where("id", "==", postId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    docId = doc.id;
  });

  const postRef = doc(db, POSTS_COLLECTION, docId);

  await updateDoc(postRef, {
    savedBy: arrayUnion(userId),
  });
};

export const unsavePost = async (postId: string): Promise<void> => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  let docId;

  const q = query(collection(db, POSTS_COLLECTION), where("id", "==", postId));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    docId = doc.id;
  });

  const postRef = doc(db, POSTS_COLLECTION, docId);

  await updateDoc(postRef, {
    savedBy: arrayRemove(userId),
  });
};
