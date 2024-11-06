import React from "react";
import styled from "styled-components";
import Post from "../components/Post";
import { getPosts } from "../services/postServices";
import { PostData } from "../types";

const PageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 20px;
`;

const Content = styled.div`
  flex: 1;
`;

const SavedPosts: React.FC = () => {
  const [posts, setPosts] = React.useState<PostData[]>([]);

  React.useEffect(() => {
    const fetchSavedPosts = async () => {
      const allPosts = await getPosts(0);
      const savedPosts = allPosts.filter((post) => post.savedByUser);
      setPosts(savedPosts);
    };
    fetchSavedPosts();
  }, []);

  return (
    <PageContainer>
      <Content>
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={() => {}}
            onUnlike={() => {}}
            onAddComment={() => {}}
            onAddReply={() => {}}
            onSave={() => {}}
            onUnsave={() => {}}
          />
        ))}
      </Content>
    </PageContainer>
  );
};

export default SavedPosts;
