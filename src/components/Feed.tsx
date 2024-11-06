import React, { useEffect, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import {
  getPosts,
  likePost,
  unlikePost,
  createPost,
  addCommentToPost,
  unsavePost,
  savePost,
} from "../services/postServices.ts";
import Post from "../components/Post.tsx";
import { PostData, Comment } from "../types";
import { getAuth } from "firebase/auth";

interface SidebarButtonProps {
  active: boolean;
}

const FeedContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f0f2f5;
`;

const Sidebar = styled.div`
  width: 200px;
  height: fit-content;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-right: 20px;
`;

const SidebarButton = styled.button<SidebarButtonProps>`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: ${(props) => (props.active ? "#007bff" : "#f0f2f5")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const FeedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const LoadingMessage = styled.p`
  margin: 20px 0;
  color: #555;
`;

const NewPostForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [newPostImage, setNewPostImage] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "saved" | "myPosts">("all");
  const observerRef = useRef<HTMLDivElement | null>(null);
  const loadRef = useRef<boolean>(false);
  const user = getAuth();
  const userId = user.currentUser?.uid;

  const loadPosts = useCallback(async () => {
    if (!hasMore || loading) return;
    setLoading(true);
    const newPosts = await getPosts(posts.length);
    setPosts((prevPosts) => [...prevPosts, ...newPosts]);
    setHasMore(newPosts.length === 10);
    setLoading(false);
  }, [hasMore, loading, posts.length]);

  useEffect(() => {
    if (!loadRef.current) loadPosts();
    loadRef.current = true;
  }, [loadPosts]);

  const handleLike = async (postId: string) => {
    await likePost(postId);
    updatePostLikes(postId, true);
  };

  const handleUnlike = async (postId: string) => {
    await unlikePost(postId);
    updatePostLikes(postId, false);
  };

  const updatePostLikes = (postId: string, liked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByUser: liked,
              likeCount: post.likeCount + (liked ? 1 : -1),
            }
          : post
      )
    );
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostImage || !user) return;

    const newPost = {
      imageUrl: newPostImage,
      userName: user.currentUser?.displayName || "Anonymous",
      likeCount: 0,
      likedByUser: false,
    };

    const createdPost: PostData = await createPost(newPost);
    setPosts((prevPosts) => [createdPost, ...prevPosts]);
    setNewPostImage("");
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) loadPosts();
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadPosts]);

  const handleAddComment = async (postId: string, comment: Comment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments ? [...post.comments, comment] : [comment],
            }
          : post
      )
    );
    await addCommentToPost(postId, comment as any);
  };

  const handleSave = async (postId: string) => {
    await savePost(postId);
    updatePostSaveStatus(postId, true);
  };

  const handleUnsave = async (postId: string) => {
    await unsavePost(postId);
    updatePostSaveStatus(postId, false);
  };

  const updatePostSaveStatus = (postId: string, saved: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              savedBy: saved
                ? [...(post.savedBy || []), userId].filter(
                    (id): id is string => !!id
                  )
                : post.savedBy
                    ?.filter((id): id is string => !!id)
                    .filter((id) => id !== userId),
            }
          : post
      )
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === "saved")
      return userId ? post.savedBy?.includes(userId) : false;
    if (filter === "myPosts")
      return post.userName === user.currentUser?.displayName;
    return true;
  });

  return (
    <>
      {userId ? (
        <Sidebar>
          <SidebarButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All Posts
          </SidebarButton>
          <SidebarButton
            active={filter === "saved"}
            onClick={() => setFilter("saved")}
          >
            Saved Posts
          </SidebarButton>
          <SidebarButton
            active={filter === "myPosts"}
            onClick={() => setFilter("myPosts")}
          >
            My Posts
          </SidebarButton>
        </Sidebar>
      ) : null}
      <FeedContainer>
        <FeedContent>
          {user && (
            <NewPostForm onSubmit={handleCreatePost}>
              <Input
                type="text"
                placeholder="Enter image URL"
                value={newPostImage}
                onChange={(e) => setNewPostImage(e.target.value)}
              />
              <Button type="submit">Create Post</Button>
            </NewPostForm>
          )}

          {filteredPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              onUnlike={() => handleUnlike(post.id)}
              onAddComment={handleAddComment}
              onAddReply={() => {}}
              onSave={() => handleSave(post.id)}
              onUnsave={() => handleUnsave(post.id)}
            />
          ))}

          {loading && <LoadingMessage>Loading more posts...</LoadingMessage>}
          <div ref={observerRef} />
        </FeedContent>
      </FeedContainer>
    </>
  );
};

export default Feed;
