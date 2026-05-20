import { useMemo, useState } from 'react'
import { addActivity, addNotification } from '../services/socialService.js'
import {
  addDiaryComment,
  addDiaryReply,
  createDiary,
  deleteDiary,
  deleteDiaryComment,
  deleteDiaryReply,
  getDiaries,
} from '../services/diaryService.js'

function formatDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DiaryPage({ user, ownerUser, onGoMain, onGoMinihome, onLogout }) {
  const owner = ownerUser || user
  const isOwner = owner.username === user.username
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [replyDrafts, setReplyDrafts] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const diaries = useMemo(() => getDiaries(owner.username, 30), [owner.username, refreshKey])

  const refresh = () => setRefreshKey((prev) => prev + 1)
  const canSave = title.trim() !== '' && content.trim() !== ''

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSave || !isOwner) return

    try {
      const diary = createDiary(owner.username, title, content)
      addActivity(owner.username, `다이어리를 작성했습니다: “${diary.title}”`, 'diary')
      addNotification(owner.username, `새 다이어리가 미니홈피에 올라갔습니다: “${diary.title}”`, 'diary')
      setTitle('')
      setContent('')
      refresh()
      alert('다이어리가 저장되었습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDelete = (diaryId) => {
    if (!isOwner) return
    if (!confirm('이 다이어리를 삭제할까요?')) return
    deleteDiary(owner.username, diaryId)
    addActivity(owner.username, '다이어리 글을 삭제했습니다.', 'diary')
    refresh()
  }

  const handleCommentSubmit = (diary) => {
    const clean = (commentDrafts[diary.id] || '').trim()
    if (!clean) return
    try {
      const comment = addDiaryComment(owner.username, diary.id, user, clean)
      addActivity(owner.username, `${user.name}님이 다이어리에 댓글을 남겼습니다: “${comment.content.slice(0, 24)}${comment.content.length > 24 ? '...' : ''}”`, 'diary_comment')
      if (!isOwner) addNotification(owner.username, `${user.name}님이 다이어리에 댓글을 남겼습니다: “${comment.content.slice(0, 24)}${comment.content.length > 24 ? '...' : ''}”`, 'diary_comment')
      setCommentDrafts((prev) => ({ ...prev, [diary.id]: '' }))
      refresh()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeleteComment = (diary, comment) => {
    if (!confirm('이 댓글을 삭제할까요?')) return
    deleteDiaryComment(owner.username, diary.id, comment.id, user.username)
    refresh()
  }

  const handleReplySubmit = (diary, comment) => {
    const key = `${diary.id}_${comment.id}`
    const clean = (replyDrafts[key] || '').trim()
    if (!clean) return
    try {
      const reply = addDiaryReply(owner.username, diary.id, comment.id, user, clean)
      if (comment.writerUsername !== user.username) addNotification(comment.writerUsername, `${user.name}님이 다이어리 댓글에 대댓글을 남겼습니다: “${reply.content.slice(0, 24)}${reply.content.length > 24 ? '...' : ''}”`, 'diary_reply')
      setReplyDrafts((prev) => ({ ...prev, [key]: '' }))
      refresh()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeleteReply = (diary, comment, reply) => {
    if (!confirm('이 대댓글을 삭제할까요?')) return
    deleteDiaryReply(owner.username, diary.id, comment.id, reply.id, user.username)
    refresh()
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">DIARY</p>
          <h1>{owner.name}님의 다이어리</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          <button className="secondary-button" onClick={onGoMinihome}>미니홈피</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="content-layout">
        {isOwner && (
          <article className="info-card content-editor-card">
            <h3>새 다이어리 작성</h3>
            <form className="form-stack" onSubmit={handleSubmit}>
              <label>
                <span>제목</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="오늘의 제목" />
              </label>
              <label>
                <span>내용</span>
                <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} placeholder="오늘 있었던 일을 적어보세요." />
              </label>
              <button className="primary-button" type="submit" disabled={!canSave}>저장하기</button>
            </form>
          </article>
        )}

        <article className="info-card content-list-card">
          <h3>다이어리 목록</h3>
          {diaries.length === 0 ? (
            <p className="empty-text">아직 작성한 다이어리가 없습니다.</p>
          ) : (
            <div className="post-list">
              {diaries.map((diary) => (
                <article className="post-card" key={diary.id}>
                  <div className="post-card-header">
                    <div>
                      <h4>{diary.title}</h4>
                      <small>{formatDate(diary.createdAt)}</small>
                    </div>
                    {isOwner && <button className="tiny-button danger-text-button" onClick={() => handleDelete(diary.id)}>삭제</button>}
                  </div>
                  <p>{diary.content}</p>

                  <div className="comment-area">
                    <div className="reply-form-row">
                      <input value={commentDrafts[diary.id] || ''} onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [diary.id]: event.target.value }))} placeholder="댓글 작성" />
                      <button className="tiny-button" onClick={() => handleCommentSubmit(diary)} disabled={!(commentDrafts[diary.id] || '').trim()}>댓글</button>
                    </div>

                    {(diary.comments || []).map((comment) => {
                      const canDeleteComment = isOwner
                      const replyKey = `${diary.id}_${comment.id}`
                      return (
                        <div className="comment-card" key={comment.id}>
                          <div className="comment-header">
                            <strong>{comment.writerName}</strong>
                            <span className="muted-text">@{comment.writerUsername}</span>
                            {canDeleteComment && <button className="tiny-button danger-text-button" onClick={() => handleDeleteComment(diary, comment)}>삭제</button>}
                          </div>
                          <p>{comment.content}</p>

                          {(comment.replies || []).length > 0 && (
                            <div className="reply-list">
                              {(comment.replies || []).map((reply) => {
                                const canDeleteReply = isOwner
                                return (
                                  <div className="reply-card" key={reply.id}>
                                    <span className="reply-owner-badge">대댓글</span>
                                    <strong>{reply.writerName}</strong>
                                    <span>{reply.content}</span>
                                    {canDeleteReply && <button className="tiny-button danger-text-button" onClick={() => handleDeleteReply(diary, comment, reply)}>삭제</button>}
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          <div className="reply-form-row">
                            <input value={replyDrafts[replyKey] || ''} onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [replyKey]: event.target.value }))} placeholder="대댓글 작성" />
                            <button className="tiny-button" onClick={() => handleReplySubmit(diary, comment)} disabled={!(replyDrafts[replyKey] || '').trim()}>대댓글</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default DiaryPage
