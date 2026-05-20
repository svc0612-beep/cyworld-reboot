import { useMemo, useState } from 'react'
import { addActivity, addNotification } from '../services/socialService.js'
import { analyzeBoardPost } from '../services/analysisService.js'
import {
  addBoardComment,
  addBoardReply,
  createBoardPost,
  deleteBoardComment,
  deleteBoardPost,
  deleteBoardReply,
  getBoardPosts,
} from '../services/boardService.js'

function formatDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function BoardAnalysisBox({ result }) {
  if (!result) return null

  const { summary, sentiment } = result

  return (
    <section className="analysis-box">
      <div className="analysis-box-header">
        <div>
          <p className="eyebrow mini-eyebrow">BOARD AI</p>
          <h4>글 요약 · 감성 분석</h4>
        </div>
        <span className={`sentiment-pill sentiment-${sentiment.label}`}>
          {sentiment.label} {sentiment.score}점
        </span>
      </div>

      <div className="analysis-section">
        <strong>요약</strong>
        {summary.bullets.length > 0 ? (
          <ul className="analysis-list">
            {summary.bullets.map((bullet, index) => (
              <li key={`${bullet}_${index}`}>{bullet}</li>
            ))}
          </ul>
        ) : (
          <p>{summary.summary}</p>
        )}
      </div>

      <div className="analysis-section">
        <strong>감성 분석</strong>
        <p>{sentiment.description}</p>
        <div className="sentiment-meter" aria-label={`감성 점수 ${sentiment.score}점`}>
          <div style={{ width: `${sentiment.score}%` }} />
        </div>
      </div>

      {(summary.keywords.length > 0 || sentiment.keywords.length > 0) && (
        <div className="analysis-keywords">
          {[...new Set([...summary.keywords, ...sentiment.keywords])].map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      )}
    </section>
  )
}

function BoardPage({ user, ownerUser, onGoMain, onGoMinihome, onContentChanged, onLogout }) {
  const owner = ownerUser || user
  const isOwner = owner.username === user.username
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [commentDrafts, setCommentDrafts] = useState({})
  const [replyDrafts, setReplyDrafts] = useState({})
  const [analysisResults, setAnalysisResults] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const posts = useMemo(() => getBoardPosts(owner.username, 50), [owner.username, refreshKey])

  const refresh = () => {
    setRefreshKey((prev) => prev + 1)
    onContentChanged?.()
  }
  const canSave = title.trim() !== '' && content.trim() !== ''

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSave) return
    try {
      const post = createBoardPost(owner.username, user, title, content)
      addActivity(owner.username, `${user.name}님이 게시판에 글을 작성했습니다: “${post.title}”`, 'board')
      if (!isOwner) addNotification(owner.username, `${user.name}님이 게시판에 글을 작성했습니다: “${post.title}”`, 'board')
      setTitle('')
      setContent('')
      refresh()
      alert('게시글이 저장되었습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAnalyzePost = (post) => {
    const result = analyzeBoardPost(post)
    setAnalysisResults((prev) => ({
      ...prev,
      [post.id]: result,
    }))
  }

  const handleDeletePost = (post) => {
    if (!confirm('이 게시글을 삭제할까요?')) return
    deleteBoardPost(owner.username, post.id, user.username)
    addActivity(owner.username, `게시판 글을 삭제했습니다: “${post.title}”`, 'board')
    setAnalysisResults((prev) => {
      const next = { ...prev }
      delete next[post.id]
      return next
    })
    refresh()
  }

  const handleCommentSubmit = (post) => {
    const clean = (commentDrafts[post.id] || '').trim()
    if (!clean) return
    try {
      const comment = addBoardComment(owner.username, post.id, user, clean)
      addActivity(owner.username, `${user.name}님이 게시글에 댓글을 남겼습니다: “${comment.content.slice(0, 24)}${comment.content.length > 24 ? '...' : ''}”`, 'board_comment')
      if (post.writerUsername !== user.username) addNotification(post.writerUsername, `${user.name}님이 게시글에 댓글을 남겼습니다: “${comment.content.slice(0, 24)}${comment.content.length > 24 ? '...' : ''}”`, 'board_comment')
      setCommentDrafts((prev) => ({ ...prev, [post.id]: '' }))
      refresh()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeleteComment = (post, comment) => {
    if (!confirm('이 댓글을 삭제할까요?')) return
    deleteBoardComment(owner.username, post.id, comment.id, user.username)
    refresh()
  }

  const handleReplySubmit = (post, comment) => {
    const key = `${post.id}_${comment.id}`
    const clean = (replyDrafts[key] || '').trim()
    if (!clean) return
    try {
      const reply = addBoardReply(owner.username, post.id, comment.id, user, clean)
      if (comment.writerUsername !== user.username) addNotification(comment.writerUsername, `${user.name}님이 댓글에 답글을 남겼습니다: “${reply.content.slice(0, 24)}${reply.content.length > 24 ? '...' : ''}”`, 'board_reply')
      setReplyDrafts((prev) => ({ ...prev, [key]: '' }))
      refresh()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDeleteReply = (post, comment, reply) => {
    if (!confirm('이 대댓글을 삭제할까요?')) return
    deleteBoardReply(owner.username, post.id, comment.id, reply.id, user.username)
    refresh()
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">BOARD</p>
          <h1>{owner.name}님의 게시판</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          <button className="secondary-button" onClick={onGoMinihome}>미니홈피</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="content-layout">
        <article className="info-card content-editor-card">
          <h3>게시글 작성</h3>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              <span>제목</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="게시글 제목" />
            </label>
            <label>
              <span>내용</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} placeholder={isOwner ? '내 게시판에 글을 작성해 보세요.' : `${owner.name}님의 게시판에 글을 남겨보세요.`} />
            </label>
            <button className="primary-button" type="submit" disabled={!canSave}>게시글 저장</button>
          </form>
        </article>

        <article className="info-card content-list-card">
          <h3>게시글 목록</h3>
          {posts.length === 0 ? <p className="empty-text">아직 게시글이 없습니다.</p> : (
            <div className="post-list">
              {posts.map((post) => {
                const canDeletePost = isOwner
                return (
                  <article className="post-card board-post-card" key={post.id}>
                    <div className="post-card-header">
                      <div>
                        <h4>{post.title}</h4>
                        <small>{post.writerName} @{post.writerUsername} · {formatDate(post.createdAt)}</small>
                      </div>
                      <div className="post-actions">
                        <button className="tiny-button" type="button" onClick={() => handleAnalyzePost(post)}>요약/감성</button>
                        {canDeletePost && <button className="tiny-button danger-text-button" onClick={() => handleDeletePost(post)}>삭제</button>}
                      </div>
                    </div>
                    <p>{post.content}</p>

                    <BoardAnalysisBox result={analysisResults[post.id]} />

                    <div className="comment-area">
                      <div className="reply-form-row">
                        <input value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))} placeholder="댓글 작성" />
                        <button className="tiny-button" onClick={() => handleCommentSubmit(post)} disabled={!(commentDrafts[post.id] || '').trim()}>댓글</button>
                      </div>

                      {(post.comments || []).map((comment) => {
                        const canDeleteComment = isOwner
                        const replyKey = `${post.id}_${comment.id}`
                        return (
                          <div className="comment-card" key={comment.id}>
                            <div className="comment-header">
                              <strong>{comment.writerName}</strong>
                              <span className="muted-text">@{comment.writerUsername}</span>
                              {canDeleteComment && <button className="tiny-button danger-text-button" onClick={() => handleDeleteComment(post, comment)}>삭제</button>}
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
                                      {canDeleteReply && <button className="tiny-button danger-text-button" onClick={() => handleDeleteReply(post, comment, reply)}>삭제</button>}
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div className="reply-form-row">
                              <input value={replyDrafts[replyKey] || ''} onChange={(event) => setReplyDrafts((prev) => ({ ...prev, [replyKey]: event.target.value }))} placeholder="대댓글 작성" />
                              <button className="tiny-button" onClick={() => handleReplySubmit(post, comment)} disabled={!(replyDrafts[replyKey] || '').trim()}>대댓글</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default BoardPage
