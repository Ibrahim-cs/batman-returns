import React from "react";
import styled from "styled-components";
import Post from "../components/Post";
import { getPosts } from "../services/postServices";
import { PostData } from "../types";
import { getAuth } from "firebase/auth";

const PageContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 20px;
`;

const Content = styled.div`
  flex: 1;
`;

const MyPosts: React.FC = () => {
  const [posts, setPosts] = React.useState<PostData[]>([]);
  const user = getAuth().currentUser;

  React.useEffect(() => {
    const fetchMyPosts = async () => {
      const allPosts = await getPosts(0);
      const myPosts = allPosts.filter(
        (post) => post.userName === user?.displayName
      );
      setPosts(myPosts);
    };
    fetchMyPosts();
  }, [user]);

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

export default MyPosts;
