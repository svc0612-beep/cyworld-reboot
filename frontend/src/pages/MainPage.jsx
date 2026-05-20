import { useMemo, useState } from 'react'
import { updateCurrentUserStatusMessage } from '../services/authService.js'
import { addActivity, addNotification, buildActivityView, getActivities, getFriendPreview, getNotifications } from '../services/socialService.js'
import { getDiaries } from '../services/diaryService.js'
import { getGuestbookEntries } from '../services/guestbookService.js'
import { getPhotos } from '../services/photoService.js'
import { getBoardPosts } from '../services/boardService.js'

function MainPage({ user, onLogout, onGoMinihome, onGoFriends, onGoProfileEdit, onGoShop, onGoDiary, onGoBoard, onGoGuestbook, onGoPhoto, onViewMinihome, onUserUpdated }) {
  const [statusMessage, setStatusMessage] = useState(user.statusMessage || '')
  const [refreshKey, setRefreshKey] = useState(0)

  const activities = useMemo(() => getActivities(user.username, 5), [user.username, refreshKey])
  const notifications = useMemo(() => getNotifications(user.username, 5), [user.username, refreshKey])
  const friends = useMemo(() => getFriendPreview(user.username, 3), [user.username, refreshKey])
  const diaries = useMemo(() => getDiaries(user.username, 3), [user.username, refreshKey])
  const guestbooks = useMemo(() => getGuestbookEntries(user.username, 3), [user.username, refreshKey])
  const photos = useMemo(() => getPhotos(user.username, 3), [user.username, refreshKey])
  const boardPosts = useMemo(() => getBoardPosts(user.username, 3), [user.username, refreshKey])

  const handleSaveStatus = () => {
    const cleanMessage = statusMessage.trim()
    const updatedUser = updateCurrentUserStatusMessage(cleanMessage)

    if (cleanMessage) {
      addActivity(user.username, `상태 메시지를 변경했습니다: “${cleanMessage}”`, 'status')
      addNotification(user.username, `새 상태 메시지가 미니홈피에 반영되었습니다: “${cleanMessage}”`, 'status')
    } else {
      addActivity(user.username, '상태 메시지를 비웠습니다.', 'status')
      addNotification(user.username, '상태 메시지가 비워졌고 미니홈피에 반영되었습니다.', 'status')
    }

    onUserUpdated(updatedUser)
    setRefreshKey((prev) => prev + 1)
    alert('상태 메시지가 저장되었습니다.')
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">CYWORLD REBOOT</p>
          <h1>싸이월드 리부트 메인</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMinihome}>내 미니홈피</button>
          <button className="secondary-button" onClick={() => onGoDiary(user)}>다이어리</button>
          <button className="secondary-button" onClick={() => onGoBoard(user)}>게시판</button>
          <button className="secondary-button" onClick={onGoGuestbook}>방명록</button>
          <button className="secondary-button" onClick={onGoPhoto}>사진첩</button>
          <button className="secondary-button" onClick={onGoFriends}>일촌보기</button>
          <button className="secondary-button" onClick={onGoProfileEdit}>프로필 수정</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="dashboard-grid main-dashboard-grid">
        <article className="profile-card profile-card-large">
          <div className="profile-avatar">{user.profileImage ? <img src={user.profileImage} alt="프로필" /> : user.name.slice(0, 1)}</div>
          <div className="profile-summary">
            <h2>{user.name}님의 미니홈피</h2>
            <p>@{user.username}</p>
            <p>{user.email}</p>
            <p className="status-preview">{user.statusMessage || '아직 상태 메시지가 없습니다.'}</p>
          </div>
        </article>

        <article className="info-card dotori-shop-card" onClick={onGoShop} role="button" tabIndex={0}>
          <h3>보유 도토리</h3>
          <p className="dotori-count">{user.dotori}개</p>
          <small>클릭하면 도토리 상점으로 이동합니다.</small>
          <button className="small-button dotori-shop-button" type="button">상점 열기</button>
        </article>

        <article className="info-card status-card">
          <h3>오늘의 한마디</h3>
          <textarea
            value={statusMessage}
            onChange={(event) => setStatusMessage(event.target.value)}
            placeholder="오늘의 기분이나 한마디를 적어보세요."
            rows={4}
          />
          <button className="primary-button" onClick={handleSaveStatus}>상태 메시지 저장</button>
        </article>

        <article className="info-card quick-menu-card">
          <h3>미니홈피 메뉴</h3>
          <div className="quick-menu-grid">
            <button className="secondary-button" onClick={() => onGoDiary(user)}>다이어리 작성</button>
            <button className="secondary-button" onClick={() => onGoBoard(user)}>게시판 관리</button>
            <button className="secondary-button" onClick={onGoGuestbook}>방명록 보기</button>
            <button className="secondary-button" onClick={onGoPhoto}>사진첩 관리</button>
            <button className="secondary-button" onClick={onGoShop}>상점/꾸미기</button>
          </div>
        </article>

        <article className="info-card">
          <h3>최근 다이어리</h3>
          {diaries.length === 0 ? (
            <p className="empty-text">아직 다이어리가 없습니다.</p>
          ) : (
            <ul className="simple-list">
              {diaries.map((diary) => <li key={diary.id}>{diary.title}</li>)}
            </ul>
          )}
        </article>



        <article className="info-card">
          <h3>최근 게시판</h3>
          {boardPosts.length === 0 ? (
            <p className="empty-text">아직 게시글이 없습니다.</p>
          ) : (
            <ul className="simple-list">
              {boardPosts.map((post) => <li key={post.id}>{post.title}</li>)}
            </ul>
          )}
        </article>

        <article className="info-card">
          <h3>최근 방명록</h3>
          {guestbooks.length === 0 ? (
            <p className="empty-text">아직 방명록이 없습니다.</p>
          ) : (
            <ul className="simple-list">
              {guestbooks.map((entry) => <li key={entry.id}>{entry.writerName}: {entry.content}</li>)}
            </ul>
          )}
        </article>

        <article className="info-card">
          <h3>최근 사진첩</h3>
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
            <p className="empty-text">아직 최근 활동이 없습니다.</p>
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

        <article className="info-card">
          <h3>일촌 미리보기</h3>
          {friends.length === 0 ? (
            <p className="empty-text">아직 승인된 일촌이 없습니다.</p>
          ) : (
            <ul className="simple-list clickable-list">
              {friends.map((friend) => (
                <li key={friend.id}>
                  <button className="link-button" onClick={() => onViewMinihome(friend)}>
                    {friend.name} <span className="muted-text">@{friend.username}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button className="small-button full-width-button" onClick={onGoFriends}>일촌 관리</button>
        </article>

        <article className="info-card">
          <h3>알림</h3>
          {notifications.length === 0 ? (
            <p className="empty-text">새 알림이 없습니다.</p>
          ) : (
            <ul className="activity-list">
              {notifications.map((notification) => {
                const view = buildActivityView(notification)

                return (
                  <li key={notification.id} className="activity-item">
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
    </main>
  )
}

export default MainPage
