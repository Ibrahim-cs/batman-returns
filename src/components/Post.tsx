import React, { useState } from "react";
import styled from "styled-components";
import { PostData, Comment } from "../types";
import { FiHeart } from "react-icons/fi";
import { getAuth } from "firebase/auth";

interface PostProps {
  post: PostData;
  onLike: () => void;
  onUnlike: () => void;
  onAddComment: (postId: string, comment: Comment) => void;
  onAddReply: (postId: string, parentCommentId: string, reply: Comment) => void;
  onSave: () => void;
  onUnsave: () => void;
}

const PostContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  overflow: hidden;
  width: 580px;
`;

const PostHeader = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #eaeaea;
`;

const UserName = styled.h4`
  margin: 0;
  font-size: 1rem;
  color: #333;
`;

const PostImage = styled.img`
  width: 100%;
  height: auto;
`;

const PostFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
`;

const LikesContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  margin-right: 10px;
`;

const LikeCount = styled.span`
  font-size: 0.9rem;
  color: #555;
`;

interface SaveButtonProps {
  saved: boolean;
}

const SaveButton = styled.button<SaveButtonProps>`
  background: ${(props) => (props.saved ? "#007bff" : "#ddd")};
  color: ${(props) => (props.saved ? "white" : "#333")};
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background: ${(props) => (props.saved ? "#0056b3" : "#ccc")};
  }
`;

const CommentSection = styled.div`
  padding: 10px 15px;
  border-top: 1px solid #eaeaea;
  background-color: #f9f9f9;
`;

const CommentContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  margin-bottom: 8px;
`;

const ReplyContainer = styled.div`
  margin-left: 20px;
  padding: 8px 0;
`;

const CommentUser = styled.span`
  font-weight: bold;
  color: #333;
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #555;
`;

const CommentInput = styled.input`
  width: 96%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const CommentSubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const ReplyInputContainer = styled.div`
  margin-top: 10px;
`;

const Post: React.FC<PostProps> = ({
  post,
  onLike,
  onUnlike,
  onAddComment,
  onAddReply,
  onSave,
  onUnsave,
}) => {
  const { userName, imageUrl, likeCount, likedByUser, comments, id } = post;
  const [newComment, setNewComment] = useState<string>("");
  const [newReply, setNewReply] = useState<Record<string, string>>({});
  const currentUser = getAuth().currentUser;
  const isSavedByUser: boolean = currentUser?.uid
    ? post.savedBy?.includes(currentUser.uid) ?? false
    : false;

  const handleAddComment = () => {
    const auth = getAuth();
    const userId = auth.currentUser;
    if (newComment.trim()) {
      const comment: Comment = {
        userName: userId?.displayName || "Anonymous",
        content: newComment,
        createdAt: new Date(),
        replies: [],
      };
      onAddComment(id, comment);
      setNewComment("");
    }
  };

  const handleAddReply = (parentCommentId: string) => {
    const replyContent = newReply[parentCommentId];
    if (replyContent?.trim()) {
      const reply: Comment = {
        userName: currentUser?.displayName || "Anonymous",
        content: replyContent,
        createdAt: new Date(),
        replies: [],
      };
      onAddReply(id, parentCommentId, reply);
      setNewReply((prevReplies) => ({ ...prevReplies, [parentCommentId]: "" }));
    }
  };

  return (
    <PostContainer>
      <PostHeader>
        <UserName>{userName}</UserName>
      </PostHeader>
      <PostImage src={imageUrl} alt="Post image" />
      <PostFooter>
        <LikesContainer>
          <LikeButton
            onClick={likedByUser ? onUnlike : onLike}
            disabled={!currentUser?.uid}
          >
            <FiHeart color={likedByUser ? "red" : "gray"} />
          </LikeButton>
          <LikeCount>{likeCount} Likes</LikeCount>
        </LikesContainer>
        <SaveButton
          onClick={isSavedByUser ? onUnsave : onSave}
          saved={isSavedByUser}
          disabled={!currentUser?.uid}
        >
          {isSavedByUser ? "Unsave" : "Save"}
        </SaveButton>
      </PostFooter>

      <CommentSection>
        {comments?.map((comment) => (
          <CommentContainer key={comment.createdAt.toString()}>
            <CommentUser>{comment.userName}</CommentUser>
            <CommentText>{comment.content}</CommentText>

            {currentUser?.displayName !== comment.userName && ( // Only show reply input if current user is different
              <ReplyInputContainer>
                <CommentInput
                  type="text"
                  value={newReply[comment.createdAt.toString()] || ""}
                  onChange={(e) =>
                    setNewReply({
                      ...newReply,
                      [comment.createdAt.toString()]: e.target.value,
                    })
                  }
                  placeholder="Reply to this comment..."
                  disabled={!currentUser?.uid}
                />
                <CommentSubmitButton
                  onClick={() => handleAddReply(comment.createdAt.toString())}
                  disabled={!currentUser?.uid}
                >
                  Reply
                </CommentSubmitButton>
              </ReplyInputContainer>
            )}

            {comment.replies?.map((reply, index) => (
              <ReplyContainer key={index}>
                <CommentUser>{reply.userName}</CommentUser>
                <CommentText>{reply.content}</CommentText>
              </ReplyContainer>
            ))}
          </CommentContainer>
        ))}

        <CommentInput
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={!currentUser?.uid}
        />
        <CommentSubmitButton
          onClick={handleAddComment}
          disabled={!currentUser?.uid}
        >
          Post
        </CommentSubmitButton>
      </CommentSection>
    </PostContainer>
  );
};

export default Post;
