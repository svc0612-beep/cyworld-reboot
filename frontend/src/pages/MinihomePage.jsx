import { useMemo, useRef, useState } from 'react'
import {
  acceptFriendRequest,
  addActivity,
  addNotification,
  buildActivityView,
  getActivities,
  getFriendStatus,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from '../services/socialService.js'
import {
  getActiveCharacter,
  getEquippedItems,
  getItemById,
  getMaxMinihomeItems,
  getRoomItems,
  updateRoomItemPosition,
} from '../services/shopService.js'
import { getDiaries } from '../services/diaryService.js'
import {
  addGuestbookReply,
  createGuestbookEntry,
  deleteGuestbookEntry,
  deleteGuestbookReply,
  getGuestbookEntries,
} from '../services/guestbookService.js'
import { getPhotos } from '../services/photoService.js'
import { getBoardPosts } from '../services/boardService.js'

function CharacterPreview({ username }) {
  const activeCharacter = getActiveCharacter(username)
  const equipped = getEquippedItems(username)
  const characterId = activeCharacter.item.id || 'default_character'
  const characterClass = characterId.includes('girl') ? 'female' : characterId.includes('friend') ? 'friend' : 'male'
  const handItemId = equipped.hand?.item.id

  const hasGlasses = equipped.face?.item.id === 'glasses'
  const hasHeadphones = equipped.head?.item.id === 'headphones'
  const hasCamera = equipped.neck?.item.id === 'camera'
  const hasPhone = handItemId === 'galaxy_phone' || handItemId === 'iphone'
  const hasHairDryer = handItemId === 'hair_dryer'

  return (
    <div className="character-preview-card character-only-card">
      <div className="character-stage natural-character-stage">
        <div className={`mini-character ${characterClass}`} aria-label="캐릭터 미리보기">
          <div className="char-hair" />
          {hasHeadphones && <div className="char-headphones" title={equipped.head.item.name} />}
          <div className="char-head">
            <div className="char-eye left" />
            <div className="char-eye right" />
            <div className="char-mouth" />
            {hasGlasses && (
              <div className="char-glasses" title={equipped.face.item.name}>
                <span />
                <span />
              </div>
            )}
          </div>
          <div className="char-neck" />
          <div className="char-body-torso" />
          <div className="char-leg left" />
          <div className="char-leg right" />
          <div className="char-arm left" />
          <div className={hasPhone ? 'char-arm right phone-pose' : 'char-arm right'} />
          {hasCamera && <div className="char-camera" title={equipped.neck.item.name}>📷</div>}
          {hasPhone && <div className="char-phone-call" title={equipped.hand.item.name}>📱</div>}
          {hasHairDryer && <div className="char-hairdryer" title={equipped.hand.item.name}>💨</div>}
        </div>
      </div>
    </div>
  )
}

function RoomStage({ username, roomItems, onItemsChanged, canEdit = true }) {
  const stageRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)

  const moveItem = (event, instanceId) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    if (!canEdit) return
    onItemsChanged(updateRoomItemPosition(username, instanceId, x, y))
  }

  return (
    <div
      ref={stageRef}
      className="miniroom-stage"
      onPointerMove={(event) => {
        if (!draggingId) return
        moveItem(event, draggingId)
      }}
      onPointerUp={() => setDraggingId(null)}
      onPointerLeave={() => setDraggingId(null)}
    >
      {roomItems.length === 0 ? (
        <div className="miniroom-empty">
          <strong>아직 배치된 방 아이템이 없습니다.</strong>
          <span>상점에서 침대, 티비, 음식, 반려동물 같은 아이템을 구매하면 이곳에 배치됩니다.</span>
        </div>
      ) : (
        roomItems.map((ownedItem) => {
          const item = getItemById(ownedItem.itemId)
          if (!item) return null
          return (
            <button
              type="button"
              className={`miniroom-item draggable room-size-${item.size || 'small'} room-item-${item.id}`}
              key={ownedItem.instanceId}
              title={canEdit ? `${item.name} - 드래그해서 이동` : item.name}
              style={{ left: `${ownedItem.x}%`, top: `${ownedItem.y}%` }}
              onPointerDown={(event) => {
                if (!canEdit) return
                event.currentTarget.setPointerCapture?.(event.pointerId)
                setDraggingId(ownedItem.instanceId)
                moveItem(event, ownedItem.instanceId)
              }}
            >
              <span>{item.emoji}</span>
              <small>{item.name}</small>
            </button>
          )
        })
      )}
    </div>
  )
}

function MinihomePage({ user, ownerUser, onGoMain, onGoFriends, onGoProfileEdit, onGoShop, onGoDiary, onGoBoard, onGoGuestbook, onGoPhoto, contentVersion = 0, onLogout }) {
  const owner = ownerUser || user
  const isOwner = owner.username === user.username
  const [inventoryRefreshKey, setInventoryRefreshKey] = useState(0)
  const [friendRefreshKey, setFriendRefreshKey] = useState(0)
  const [contentRefreshKey, setContentRefreshKey] = useState(0)
  const [guestbookContent, setGuestbookContent] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const friendStatus = useMemo(() => getFriendStatus(user.username, owner.username), [user.username, owner.username, friendRefreshKey])
  const activities = useMemo(() => getActivities(owner.username, 8), [owner.username, owner.statusMessage, friendRefreshKey])
  const roomItems = useMemo(() => getRoomItems(owner.username), [owner.username, inventoryRefreshKey])
  const diaries = useMemo(() => getDiaries(owner.username, 3), [owner.username, contentRefreshKey, contentVersion])
  const guestbooks = useMemo(() => getGuestbookEntries(owner.username, 5), [owner.username, contentRefreshKey])
  const photos = useMemo(() => getPhotos(owner.username, 4), [owner.username, contentRefreshKey, contentVersion])
  const boardPosts = useMemo(() => getBoardPosts(owner.username, 4), [owner.username, contentRefreshKey, contentVersion])
  const maxItems = getMaxMinihomeItems()

  const handleItemsChanged = () => {
    if (!isOwner) return
    setInventoryRefreshKey((prev) => prev + 1)
  }

  const refreshFriendStatus = () => setFriendRefreshKey((prev) => prev + 1)

  const handleFriendRequest = () => {
    try {
      sendFriendRequest(user.username, owner.username)
      refreshFriendStatus()
      alert(`${owner.name}님에게 일촌 신청을 보냈습니다.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleFriendAccept = () => {
    try {
      acceptFriendRequest(user.username, owner.username)
      refreshFriendStatus()
      alert(`${owner.name}님과 일촌이 되었습니다.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleFriendReject = () => {
    try {
      rejectFriendRequest(user.username, owner.username)
      refreshFriendStatus()
      alert(`${owner.name}님의 일촌 신청을 거절했습니다.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleFriendRemove = () => {
    if (!confirm(`${owner.name}님과 일촌을 끊을까요?`)) return
    removeFriend(user.username, owner.username)
    refreshFriendStatus()
  }

  const refreshContent = () => setContentRefreshKey((prev) => prev + 1)

  const handleGuestbookSubmit = (event) => {
    event.preventDefault()
    const cleanContent = guestbookContent.trim()
    if (!cleanContent) return

    try {
      const entry = createGuestbookEntry(owner.username, user, cleanContent)
      addActivity(owner.username, `${user.name}님이 방명록을 남겼습니다: “${entry.content.slice(0, 24)}${entry.content.length > 24 ? '...' : ''}”`, 'guestbook')
      if (!isOwner) {
        addNotification(owner.username, `${user.name}님이 미니홈피 방명록에 글을 남겼습니다: “${entry.content.slice(0, 24)}${entry.content.length > 24 ? '...' : ''}”`, 'guestbook')
      }
      setGuestbookContent('')
      refreshContent()
      alert('방명록이 저장되었습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleGuestbookDelete = (entry) => {
    if (!confirm('이 방명록을 삭제할까요?')) return

    try {
      deleteGuestbookEntry(owner.username, entry.id, user.username)
      addActivity(owner.username, `${entry.writerName}님의 방명록 글을 삭제했습니다.`, 'guestbook')
      refreshContent()
    } catch (error) {
      alert(error.message)
    }
  }

  const handleReplyChange = (entryId, value) => {
    setReplyDrafts((prev) => ({
      ...prev,
      [entryId]: value,
    }))
  }

  const handleReplySubmit = (entry) => {
    const cleanReply = (replyDrafts[entry.id] || '').trim()
    if (!cleanReply) return

    try {
      addGuestbookReply(owner.username, entry.id, user, cleanReply)
      addActivity(owner.username, `${entry.writerName}님의 방명록에 답글을 남겼습니다: “${cleanReply.slice(0, 24)}${cleanReply.length > 24 ? '...' : ''}”`, 'guestbook_reply')
      if (entry.writerUsername !== owner.username) {
        addNotification(entry.writerUsername, `${owner.name}님이 방명록에 답글을 남겼습니다: “${cleanReply.slice(0, 24)}${cleanReply.length > 24 ? '...' : ''}”`, 'guestbook_reply')
      }
      setReplyDrafts((prev) => ({ ...prev, [entry.id]: '' }))
      refreshContent()
      alert('답글이 저장되었습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleReplyDelete = (entryId, replyId) => {
    if (!confirm('이 답글을 삭제할까요?')) return

    try {
      deleteGuestbookReply(owner.username, entryId, replyId, user.username)
      refreshContent()
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">MINIHOME</p>
          <h1>{owner.name}님의 미니홈피</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          {isOwner && <button className="secondary-button" onClick={onGoShop}>상점/꾸미기</button>}
          <button className="secondary-button" onClick={onGoFriends}>일촌보기</button>
          {isOwner && <button className="secondary-button" onClick={onGoProfileEdit}>프로필 수정</button>}
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="minihome-layout">
        <aside className="minihome-profile-panel">
          <div className="profile-avatar minihome-avatar">
            {owner.profileImage ? <img src={owner.profileImage} alt="프로필" /> : owner.name.slice(0, 1)}
          </div>
          <h2>{owner.name}</h2>
          <p className="muted-text">@{owner.username}</p>
          <p className="status-preview">{owner.statusMessage || '아직 상태 메시지가 없습니다.'}</p>
          {isOwner ? (
            <button className="small-button" onClick={onGoProfileEdit}>프로필 수정</button>
          ) : (
            <div className="minihome-friend-actions">
              {friendStatus.status === 'none' || friendStatus.status === 'rejected' ? (
                <button className="small-button" onClick={handleFriendRequest}>일촌 신청</button>
              ) : null}
              {friendStatus.status === 'pending_sent' ? <span className="status-pill">신청 중</span> : null}
              {friendStatus.status === 'pending_received' ? (
                <>
                  <button className="small-button" onClick={handleFriendAccept}>승인</button>
                  <button className="small-button danger-button" onClick={handleFriendReject}>거절</button>
                </>
              ) : null}
              {friendStatus.status === 'accepted' ? (
                <>
                  <span className="status-pill">일촌입니다</span>
                  <button className="small-button danger-button" onClick={handleFriendRemove}>일촌 끊기</button>
                </>
              ) : null}
            </div>
          )}
        </aside>

        <section className="minihome-main-panel">
          <article className="info-card miniroom-card">
            <div className="section-title-row">
              <div>
                <h3>내 미니홈피 꾸미기</h3>
                <p className="miniroom-help">
                  장착품은 캐릭터에게 표시되고, 큰 아이템은 아래 장식 공간에서 드래그해 위치를 조정할 수 있습니다. 방 아이템 {roomItems.length} / {maxItems}개
                </p>
              </div>
              {isOwner && <button className="small-button" onClick={onGoShop}>상점 가기</button>}
            </div>

            <div className="minihome-decorator-grid">
              <CharacterPreview username={owner.username} />
              <RoomStage username={owner.username} roomItems={roomItems} onItemsChanged={handleItemsChanged} canEdit={isOwner} />
            </div>
          </article>

          <article className="info-card minihome-menu-card">
            <h3>미니홈피 메뉴</h3>
            <div className="quick-menu-grid">
              {isOwner ? (
                <>
                  <button className="secondary-button" onClick={() => onGoDiary(owner)}>다이어리 관리</button>
                  <button className="secondary-button" onClick={() => onGoBoard(owner)}>게시판 관리</button>
                  <button className="secondary-button" onClick={onGoGuestbook}>방명록 관리</button>
                  <button className="secondary-button" onClick={() => onGoPhoto(owner)}>사진첩 관리</button>
                  <button className="secondary-button" onClick={onGoShop}>상점/꾸미기</button>
                  <button className="secondary-button" onClick={onGoFriends}>일촌 관리</button>
                  <button className="secondary-button" onClick={onGoProfileEdit}>프로필 수정</button>
                </>
              ) : (
                <>
                  <button className="secondary-button" onClick={handleFriendRequest} disabled={!(friendStatus.status === 'none' || friendStatus.status === 'rejected')}>일촌 신청</button>
                  <button className="secondary-button" onClick={() => onGoDiary(owner)}>다이어리 보기</button>
                  <button className="secondary-button" onClick={() => onGoBoard(owner)}>게시판 보기</button>
                  <button className="secondary-button" onClick={() => onGoPhoto(owner)}>사진첩 보기</button>
                  <button className="secondary-button" onClick={onGoFriends}>내 일촌 관리</button>
                  <button className="secondary-button" onClick={() => document.querySelector('.guestbook-mini-card')?.scrollIntoView({ behavior: 'smooth' })}>방명록 남기기</button>
                  <button className="secondary-button" onClick={onGoMain}>메인으로</button>
                </>
              )}
            </div>
          </article>

          <section className="minihome-widget-grid">
            <article className="info-card">
              <div className="section-title-row compact">
                <h3>다이어리</h3>
                <button className="tiny-button" onClick={() => onGoDiary(owner)}>{isOwner ? '작성/보기' : '전체 보기'}</button>
              </div>
              {diaries.length === 0 ? (
                <p className="empty-text">아직 다이어리가 없습니다.</p>
              ) : (
                <ul className="simple-list">
                  {diaries.map((diary) => <li key={diary.id}>{diary.title}</li>)}
                </ul>
              )}
            </article>


            <article className="info-card">
              <div className="section-title-row compact">
                <h3>게시판</h3>
                <button className="tiny-button" onClick={() => onGoBoard(owner)}>{isOwner ? '관리하기' : '글 남기기'}</button>
              </div>
              {boardPosts.length === 0 ? (
                <p className="empty-text">아직 게시글이 없습니다.</p>
              ) : (
                <ul className="simple-list board-preview-list">
                  {boardPosts.map((post) => (
                    <li key={post.id} className="board-preview-item">
                      <button type="button" className="link-like-button" onClick={() => onGoBoard(owner)}>
                        {post.title}
                      </button>
                      <small>{post.writerName} @{post.writerUsername}</small>
                      <p>{post.content.length > 42 ? `${post.content.slice(0, 42)}...` : post.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="info-card guestbook-mini-card">
              <div className="section-title-row compact">
                <h3>방명록</h3>
                {isOwner && <button className="tiny-button" onClick={onGoGuestbook}>전체 관리</button>}
              </div>

              <form className="mini-guestbook-form" onSubmit={handleGuestbookSubmit}>
                <textarea
                  value={guestbookContent}
                  onChange={(event) => setGuestbookContent(event.target.value)}
                  rows={3}
                  placeholder={isOwner ? '내 미니홈피에 메모를 남길 수 있습니다.' : `${owner.name}님에게 방명록을 남겨보세요.`}
                />
                <button className="small-button" type="submit" disabled={!guestbookContent.trim()}>
                  방명록 남기기
                </button>
              </form>

              {guestbooks.length === 0 ? (
                <p className="empty-text">아직 방명록이 없습니다.</p>
              ) : (
                <div className="guestbook-thread-list">
                  {guestbooks.map((entry) => {
                    const canDeleteEntry = isOwner
                    return (
                      <article className="guestbook-thread-card" key={entry.id}>
                        <div className="guestbook-thread-header">
                          <strong>{entry.writerName}</strong>
                          <span className="muted-text">@{entry.writerUsername}</span>
                          {canDeleteEntry && (
                            <button className="tiny-button danger-text-button" onClick={() => handleGuestbookDelete(entry)}>
                              삭제
                            </button>
                          )}
                        </div>
                        <p>{entry.content}</p>

                        {(entry.replies || []).length > 0 && (
                          <div className="reply-list">
                            {(entry.replies || []).map((reply) => {
                              const canDeleteReply = isOwner
                              return (
                                <div className="reply-card" key={reply.id}>
                                  <span className="reply-owner-badge">답글</span>
                                  <strong>{reply.writerName}</strong>
                                  <span>{reply.content}</span>
                                  {canDeleteReply && (
                                    <button className="tiny-button danger-text-button" onClick={() => handleReplyDelete(entry.id, reply.id)}>
                                      삭제
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {isOwner && (
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
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </article>

            <article className="info-card">
              <div className="section-title-row compact">
                <h3>사진첩</h3>
                <button className="tiny-button" onClick={() => onGoPhoto(owner)}>{isOwner ? '올리기/보기' : '전체 보기'}</button>
              </div>
              {photos.length === 0 ? (
                <p className="empty-text">아직 사진이 없습니다.</p>
              ) : (
                <div className="mini-photo-row">
                  {photos.map((photo) => <img key={photo.id} src={photo.imageData} alt={photo.caption} title={photo.caption} />)}
                </div>
              )}
            </article>

            <article className="info-card">
              <h3>최근 활동</h3>
              {activities.length === 0 ? (
                <p className="empty-text">아직 미니홈피 활동이 없습니다.</p>
              ) : (
                <ul className="activity-list">
                  {activities.map((activity) => {
                    const view = buildActivityView(activity)

                    return (
                      <li key={activity.id} className="activity-item">
                        <div className="activity-topline">
                          <span className="activity-type-badge">{view.typeLabel}</span>
                          <time className="activity-time">{view.dateLabel}</time>
                        </div>
                        <p>{view.message}</p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </article>
          </section>
        </section>
      </section>
    </main>
  )
}

export default MinihomePage
