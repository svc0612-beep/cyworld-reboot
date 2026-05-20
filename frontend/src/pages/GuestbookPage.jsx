import { useMemo, useState } from 'react'
import { addActivity } from '../services/socialService.js'
import {
  addGuestbookReply,
  createGuestbookEntry,
  deleteGuestbookEntry,
  deleteGuestbookReply,
  getGuestbookEntries,
} from '../services/guestbookService.js'

function formatDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function GuestbookPage({ user, onGoMain, onGoMinihome, onLogout }) {
  const [content, setContent] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)
  const entries = useMemo(() => getGuestbookEntries(user.username, 50), [user.username, refreshKey])

  const canSave = content.trim() !== ''
  const refresh = () => setRefreshKey((prev) => prev + 1)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSave) return

    try {
      const entry = createGuestbookEntry(user.username, user, content)
      addActivity(user.username, `방명록을 남겼습니다: “${entry.content.slice(0, 24)}${entry.content.length > 24 ? '...' : ''}”`, 'guestbook')
      setContent('')
      refresh()
      alert('방명록이 저장되었습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleDelete = (entry) => {
    if (!confirm('이 방명록을 삭제할까요?')) return

    try {
      deleteGuestbookEntry(user.username, entry.id, user.username)
      addActivity(user.username, `${entry.writerName}님의 방명록 글을 삭제했습니다.`, 'guestbook')
      refresh()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleReplyChange = (entryId, value) => {
    setReplyDrafts((prev) => ({ ...prev, [entryId]: value }))
  }

  const handleReplySubmit = (entry) => {
    const cleanReply = (replyDrafts[entry.id] || '').trim()
    if (!cleanReply) return

    try {
      addGuestbookReply(user.username, entry.id, user, cleanReply)
      addActivity(user.username, `${entry.writerName}님의 방명록에 답글을 남겼습니다: “${cleanReply.slice(0, 24)}${cleanReply.length > 24 ? '...' : ''}”`, 'guestbook_reply')
      setReplyDrafts((prev) => ({ ...prev, [entry.id]: '' }))
      refresh()
      alert('답글이 저장되었습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleReplyDelete = (entryId, replyId) => {
    if (!confirm('이 답글을 삭제할까요?')) return

    try {
      deleteGuestbookReply(user.username, entryId, replyId, user.username)
      refresh()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">GUESTBOOK</p>
          <h1>방명록 관리</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          <button className="secondary-button" onClick={onGoMinihome}>내 미니홈피</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="content-layout">
        <article className="info-card content-editor-card">
          <h3>내 방명록에 글 남기기</h3>
          <p className="muted-text">다른 사람이 남긴 글은 아래 목록에서 답글을 달거나 삭제할 수 있습니다.</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              <span>내용</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} placeholder="미니홈피에 남길 말을 적어보세요." />
            </label>
            <button className="primary-button" type="submit" disabled={!canSave}>방명록 남기기</button>
          </form>
        </article>

        <article className="info-card content-list-card">
          <h3>방명록 목록</h3>
          {entries.length === 0 ? (
            <p className="empty-text">아직 방명록이 없습니다.</p>
          ) : (
            <div className="post-list">
              {entries.map((entry) => (
                <article className="post-card guestbook-thread-card" key={entry.id}>
                  <div className="post-card-header">
                    <div>
                      <h4>{entry.writerName} <span className="muted-text">@{entry.writerUsername}</span></h4>
                      <small>{formatDate(entry.createdAt)}</small>
                    </div>
                    <button className="tiny-button danger-text-button" onClick={() => handleDelete(entry)}>삭제</button>
                  </div>
                  <p>{entry.content}</p>

                  {(entry.replies || []).length > 0 && (
                    <div className="reply-list">
                      {(entry.replies || []).map((reply) => (
                        <div className="reply-card" key={reply.id}>
                          <span className="reply-owner-badge">답글</span>
                          <strong>{reply.writerName}</strong>
                          <span>{reply.content}</span>
                          <button className="tiny-button danger-text-button" onClick={() => handleReplyDelete(entry.id, reply.id)}>삭제</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="reply-form-row">
                    <input
                      value={replyDrafts[entry.id] || ''}
                      onChange={(event) => handleReplyChange(entry.id, event.target.value)}
                      placeholder={`${entry.writerName}님에게 답글 남기기`}
                    />
                    <button className="tiny-button" onClick={() => handleReplySubmit(entry)} disabled={!(replyDrafts[entry.id] || '').trim()}>
                      답글
                    </button>
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

export default GuestbookPage
