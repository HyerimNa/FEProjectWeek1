import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import api from "../api/post";

const CommentForm = ({ postId }) => {
  const [post, setPost] = useState(null);
  console.log("댓글폼 페이지", { postId });
  const [commentValue, setCommentValue] = useState({
    content: "",
  });
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);

  //확인용

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/post/${postId}`);
      setPost(response.data.info);
    } catch (error) {
      console.error("API 요청 오류:", error);
    }
  };

  //댓글 추가함수
  const onSUbmitHandler = async (e) => {
    e.preventDefault();
    console.log(commentValue);
    try {
      const res = await api.post(`/post/${postId}/comment`, commentValue);

      console.log(res);
      setCommentValue("");
      fetchPost();
    } catch (error) {
      console.error("코멘트API Post 요청 오류:", error);
    }
  };

  //댓글 삭제함수
  const onDeleteComment = async ({ commentId }) => {
    console.log("commentId", commentId);
    if (commentId === undefined) {
      console.error("삭제할 댓글이 유효하지 않습니다.");
      return;
    }
    try {
      await api.delete(`/post/${postId}/comment/${commentId}`);
      console.log("삭제되었습니다!");
      setPost("");
      fetchPost();
    } catch (error) {
      alert("댓글에 대한 권한이 없습니다.");
      console.error("댓글 삭제 오류:", error);
    }
  };

  //댓글 수정함수

  //토글 폼을 띄움. 버튼보이게 하고, 다시누르면 취소되고 빈값됨.
  const toggleCommentForm = () => {
    setShowCommentForm((prevShowCommentForm) => !prevShowCommentForm);
    setEditingCommentId(null);
    setCommentValue("");
  };

  const startEditingComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setCommentValue(content);
    setShowCommentForm(true);
  };

  const updateComment = async () => {
    try {
      await api.put(`/post/${postId}/comment/${editingCommentId}`, {
        content: commentValue,
      });
      toggleCommentForm();
      fetchPost();
    } catch (error) {
      console.error("코멘트API Put 요청 오류:", error);
    }
  };
  if (!post) {
    return <div>Loading...</div>;
  }
  return (
    <CommentFormBoxStyle>
      <CommentFormStyle
        className="comment-form"
        onSubmit={(e) => {
          // 버튼 클릭시, input에 들어있는 값(state)을 이용하여 DB에 저장(POST요청)
          onSUbmitHandler(e);
        }}
      >
        <textarea
          className="textarea"
          type="text"
          placeholder="댓글을 작성해주세요...✨"
          // ={changeHandler}
          onChange={(e) => {
            setCommentValue({
              content: e.target.value,
            });
          }}
        />
        <button type="submit">댓글 작성</button>
      </CommentFormStyle>
      <h3>댓글</h3>
      <SectionStyle>
        {post.commentList &&
          post.commentList.map((comment) => (
            <div className="comment" key={comment.id}>
              <p className="comment-author">작성자: {comment.username}</p>
              <p className="comment-date">
                작성일: {new Date(comment.createdAt).toLocaleDateString()}
              </p>
              {editingCommentId === comment.id ? (
                <>
                  <button onClick={toggleCommentForm}>
                    {showCommentForm ? "작성 취소" : "댓글 수정완료"}
                  </button>
                  {showCommentForm && (
                    <>
                      <button onClick={updateComment}>댓글 수정완료</button>
                      <input
                        type="text"
                        value={commentValue}
                        onChange={(e) => setCommentValue(e.target.value)}
                      />
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="comment-content">{comment.content}</div>
                  <button
                    onClick={() =>
                      startEditingComment(comment.id, comment.content)
                    }
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDeleteComment({ commentId: comment.id })}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          ))}
      </SectionStyle>
    </CommentFormBoxStyle>
  );
};

const SectionStyle = styled.section`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #fefefe;
  /* width: 700px;
  height: 300px; */
  border: 1px solid #ccc;
  padding: 20px;

  .h1 {
    flex-shrink: 0; /* 제목 영역은 고정 크기를 유지 */
  }

  .post-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
  }

  /* 작성자 스타일 */
  .post-author {
    font-size: 16px;
    color: #888;
    margin-bottom: 5px;
  }

  /* 작성일 스타일 */
  .post-date {
    font-size: 14px;
    color: #888;
    margin-bottom: 10px;
  }

  /* 본문 스타일 */
  .post-content {
    font-size: 16px;
    line-height: 1.5;
    flex-grow: 1; /* 내용 영역이 늘어나도록 설정 */
    margin-bottom: 20px;
  }
`;

const CommentFormBoxStyle = styled.section`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  background-color: #fefefe;
  /* width: 700px;
  height: 300px; */
  border: 1px solid #ccc;
  padding: 20px;
`;
const CommentFormStyle = styled.form`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: stretch;

  .textarea {
    flex-grow: 1;
    width: 90%;
    height: 39px;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #fc0303;
    resize: vertical;
  }

  button {
    display: inline-block;
    padding: 8px 16px;
    background-color: #4caf50;
    color: #fff;
    text-decoration: none;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }
`;

export default CommentForm;
