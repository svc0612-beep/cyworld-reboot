import { useMemo, useState } from 'react'
import {
  acceptFriendRequest,
  getFriendStatus,
  getFriends,
  getOtherUsers,
  getReceivedFriendRequests,
  getSentFriendRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from '../services/socialService.js'

function UserMiniCard({ user, currentUsername, onViewMinihome, onRefresh }) {
  const [statusInfo, setStatusInfo] = useState(() => getFriendStatus(currentUsername, user.username))

  const refreshStatus = () => {
    setStatusInfo(getFriendStatus(currentUsername, user.username))
    onRefresh()
  }

  const handleRequest = () => {
    try {
      sendFriendRequest(currentUsername, user.username)
      refreshStatus()
      alert(`${user.name}님에게 일촌 신청을 보냈습니다.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAccept = () => {
    try {
      acceptFriendRequest(currentUsername, user.username)
      refreshStatus()
      alert(`${user.name}님과 일촌이 되었습니다.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleReject = () => {
    try {
      rejectFriendRequest(currentUsername, user.username)
      refreshStatus()
      alert(`${user.name}님의 일촌 신청을 거절했습니다.`)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleRemove = () => {
    if (!confirm(`${user.name}님과 일촌을 끊을까요?`)) return
    removeFriend(currentUsername, user.username)
    refreshStatus()
  }

  return (
    <article className="friend-card rich-friend-card">
      <button className="friend-main-button" onClick={() => onViewMinihome(user)}>
        <div className="friend-avatar">
          {user.profileImage ? <img src={user.profileImage} alt="프로필" /> : user.name.slice(0, 1)}
        </div>
        <div>
          <h3>{user.name}</h3>
          <p>@{user.username}</p>
          <small>{user.statusMessage || '상태 메시지가 없습니다.'}</small>
        </div>
      </button>

      <div className="friend-action-row">
        {statusInfo.status === 'none' || statusInfo.status === 'rejected' ? (
          <button className="small-button" onClick={handleRequest}>일촌 신청</button>
        ) : null}

        {statusInfo.status === 'pending_sent' ? (
          <button className="small-button" disabled>신청 중</button>
        ) : null}

        {statusInfo.status === 'pending_received' ? (
          <>
            <button className="small-button" onClick={handleAccept}>승인</button>
            <button className="small-button danger-button" onClick={handleReject}>거절</button>
          </>
        ) : null}

        {statusInfo.status === 'accepted' ? (
          <>
            <span className="status-pill">일촌</span>
            <button className="small-button danger-button" onClick={handleRemove}>끊기</button>
          </>
        ) : null}
      </div>
    </article>
  )
}

function FriendsPage({ user, onGoMain, onGoMinihome, onViewMinihome, onLogout }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const otherUsers = useMemo(() => getOtherUsers(user.username), [user.username, refreshKey])
  const friends = useMemo(() => getFriends(user.username), [user.username, refreshKey])
  const receivedRequests = useMemo(() => getReceivedFriendRequests(user.username), [user.username, refreshKey])
  const sentRequests = useMemo(() => getSentFriendRequests(user.username), [user.username, refreshKey])

  const refresh = () => setRefreshKey((prev) => prev + 1)

  const handleAcceptFromList = (requesterUsername) => {
    try {
      acceptFriendRequest(user.username, requesterUsername)
      refresh()
      alert('일촌 신청을 승인했습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  const handleRejectFromList = (requesterUsername) => {
    try {
      rejectFriendRequest(user.username, requesterUsername)
      refresh()
      alert('일촌 신청을 거절했습니다.')
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">FRIENDS</p>
          <h1>일촌 관리</h1>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          <button className="secondary-button" onClick={onGoMinihome}>내 미니홈피</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="friends-dashboard-grid">
        <article className="info-card">
          <h3>내 일촌 목록</h3>
          {friends.length === 0 ? (
            <p className="empty-text">아직 승인된 일촌이 없습니다. 아래 사용자 목록에서 일촌을 신청해 보세요.</p>
          ) : (
            <div className="friends-grid compact-friends-grid">
              {friends.map((friend) => (
                <UserMiniCard
                  key={friend.username}
                  user={friend}
                  currentUsername={user.username}
                  onViewMinihome={onViewMinihome}
                  onRefresh={refresh}
                />
              ))}
            </div>
          )}
        </article>

        <article className="info-card">
          <h3>받은 일촌 신청</h3>
          {receivedRequests.length === 0 ? (
            <p className="empty-text">받은 신청이 없습니다.</p>
          ) : (
            <ul className="request-list">
              {receivedRequests.map((request) => (
                <li key={request.id}>
                  <button className="link-button" onClick={() => onViewMinihome(request.requester)}>
                    {request.requester?.name || request.requesterUsername} @{request.requesterUsername}
                  </button>
                  <div className="friend-action-row">
                    <button className="small-button" onClick={() => handleAcceptFromList(request.requesterUsername)}>승인</button>
                    <button className="small-button danger-button" onClick={() => handleRejectFromList(request.requesterUsername)}>거절</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="info-card">
          <h3>보낸 일촌 신청</h3>
          {sentRequests.length === 0 ? (
            <p className="empty-text">보낸 신청이 없습니다.</p>
          ) : (
            <ul className="simple-list clickable-list">
              {sentRequests.map((request) => (
                <li key={request.id}>
                  <button className="link-button" onClick={() => onViewMinihome(request.receiver)}>
                    {request.receiver?.name || request.receiverUsername} <span className="muted-text">@{request.receiverUsername}</span> · 신청 중
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="info-card full-width-card">
          <h3>가입한 사용자</h3>
          {otherUsers.length === 0 ? (
            <p className="empty-text">아직 다른 가입자가 없습니다. 테스트하려면 계정을 하나 더 만들어 주세요.</p>
          ) : (
            <div className="friends-grid">
              {otherUsers.map((candidate) => (
                <UserMiniCard
                  key={candidate.username}
                  user={candidate}
                  currentUsername={user.username}
                  onViewMinihome={onViewMinihome}
                  onRefresh={refresh}
                />
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default FriendsPage
