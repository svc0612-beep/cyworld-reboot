import { getUsers } from './authService.js'

const ACTIVITIES_KEY = 'cyworld_reboot_activities'
const NOTIFICATIONS_KEY = 'cyworld_reboot_notifications'
const FRIEND_REQUESTS_KEY = 'cyworld_reboot_friend_requests'

const ACTIVITY_TYPE_LABELS = {
  status: '상태 변경',
  profile: '프로필',
  'profile-image': '프로필 사진',
  diary: '다이어리',
  diary_comment: '다이어리 댓글',
  guestbook: '방명록',
  guestbook_reply: '방명록 답글',
  photo: '사진첩',
  board: '게시판',
  board_comment: '게시판 댓글',
  shop: '상점',
  dotori: '도토리',
  friend: '일촌',
  info: '알림',
}

function padNumber(value) {
  return String(value).padStart(2, '0')
}

export function getActivityTypeLabel(type = 'info') {
  return ACTIVITY_TYPE_LABELS[type] || '활동'
}

export function formatActivityDateTime(createdAt) {
  const date = createdAt ? new Date(createdAt) : new Date()

  if (Number.isNaN(date.getTime())) {
    return {
      dayLabel: '날짜 없음',
      timeLabel: '',
      fullLabel: '',
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today - target) / 86400000)

  let dayLabel = `${date.getFullYear()}.${padNumber(date.getMonth() + 1)}.${padNumber(date.getDate())}`

  if (diffDays === 0) dayLabel = '오늘'
  if (diffDays === 1) dayLabel = '어제'
  if (diffDays >= 2 && diffDays <= 6) dayLabel = `${diffDays}일 전`

  const timeLabel = `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`

  return {
    dayLabel,
    timeLabel,
    fullLabel: `${dayLabel} ${timeLabel}`,
  }
}

export function buildActivityView(item) {
  const dateInfo = formatActivityDateTime(item.createdAt)

  return {
    typeLabel: getActivityTypeLabel(item.type),
    dateLabel: dateInfo.fullLabel,
    message: item.message,
  }
}

function readList(key) {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list))
}

function findUser(username) {
  return getUsers().find((user) => user.username === username) || null
}

function normalizePair(a, b) {
  return [a, b].sort().join('::')
}

export function addActivity(username, message, type = 'status') {
  const activities = readList(ACTIVITIES_KEY)
  const newActivity = {
    id: Date.now() + Math.random(),
    username,
    type,
    message,
    createdAt: new Date().toISOString(),
  }

  writeList(ACTIVITIES_KEY, [newActivity, ...activities].slice(0, 50))
  return newActivity
}

export function getActivities(username, limit = 5) {
  return readList(ACTIVITIES_KEY)
    .filter((activity) => activity.username === username)
    .slice(0, limit)
}

export function addNotification(username, message, type = 'info') {
  const notifications = readList(NOTIFICATIONS_KEY)
  const newNotification = {
    id: Date.now() + Math.random(),
    username,
    type,
    message,
    isRead: false,
    createdAt: new Date().toISOString(),
  }

  writeList(NOTIFICATIONS_KEY, [newNotification, ...notifications].slice(0, 50))
  return newNotification
}

export function getNotifications(username, limit = 5) {
  return readList(NOTIFICATIONS_KEY)
    .filter((notification) => notification.username === username)
    .slice(0, limit)
}

export function getOtherUsers(currentUsername) {
  return getUsers().filter((user) => user.username !== currentUsername)
}

export function getAllFriendRequests() {
  return readList(FRIEND_REQUESTS_KEY)
}

function saveFriendRequests(requests) {
  writeList(FRIEND_REQUESTS_KEY, requests)
}

export function getFriendStatus(currentUsername, targetUsername) {
  if (!currentUsername || !targetUsername) return { status: 'none' }
  if (currentUsername === targetUsername) return { status: 'self' }

  const pairKey = normalizePair(currentUsername, targetUsername)
  const request = getAllFriendRequests().find((item) => item.pairKey === pairKey)

  if (!request) return { status: 'none' }

  if (request.status === 'accepted') {
    return { status: 'accepted', request }
  }

  if (request.status === 'pending') {
    if (request.requesterUsername === currentUsername) {
      return { status: 'pending_sent', request }
    }

    return { status: 'pending_received', request }
  }

  if (request.status === 'rejected') {
    return { status: 'rejected', request }
  }

  return { status: 'none' }
}

export function sendFriendRequest(requesterUsername, receiverUsername) {
  if (requesterUsername === receiverUsername) {
    throw new Error('자기 자신에게는 일촌 신청을 할 수 없습니다.')
  }

  const requester = findUser(requesterUsername)
  const receiver = findUser(receiverUsername)

  if (!requester || !receiver) {
    throw new Error('사용자 정보를 찾을 수 없습니다.')
  }

  const requests = getAllFriendRequests()
  const pairKey = normalizePair(requesterUsername, receiverUsername)
  const existingIndex = requests.findIndex((item) => item.pairKey === pairKey)
  const now = new Date().toISOString()

  if (existingIndex >= 0) {
    const existing = requests[existingIndex]

    if (existing.status === 'accepted') {
      throw new Error('이미 일촌입니다.')
    }

    if (existing.status === 'pending') {
      throw new Error('이미 일촌 신청이 진행 중입니다.')
    }

    requests[existingIndex] = {
      ...existing,
      requesterUsername,
      receiverUsername,
      status: 'pending',
      updatedAt: now,
    }
  } else {
    requests.unshift({
      id: Date.now() + Math.random(),
      pairKey,
      requesterUsername,
      receiverUsername,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })
  }

  saveFriendRequests(requests)
  addActivity(requesterUsername, `${receiver.name}님에게 일촌 신청을 보냈습니다.`, 'friend')
  addNotification(receiverUsername, `${requester.name}님이 일촌 신청을 보냈습니다.`, 'friend_request')

  return getFriendStatus(requesterUsername, receiverUsername)
}

export function acceptFriendRequest(currentUsername, requesterUsername) {
  const requests = getAllFriendRequests()
  const pairKey = normalizePair(currentUsername, requesterUsername)
  const index = requests.findIndex(
    (item) => item.pairKey === pairKey && item.status === 'pending' && item.receiverUsername === currentUsername
  )

  if (index < 0) {
    throw new Error('승인할 일촌 신청을 찾을 수 없습니다.')
  }

  const now = new Date().toISOString()
  requests[index] = {
    ...requests[index],
    status: 'accepted',
    updatedAt: now,
    acceptedAt: now,
  }

  saveFriendRequests(requests)

  const currentUser = findUser(currentUsername)
  const requester = findUser(requesterUsername)
  addActivity(currentUsername, `${requester?.name || requesterUsername}님과 일촌이 되었습니다.`, 'friend')
  addActivity(requesterUsername, `${currentUser?.name || currentUsername}님과 일촌이 되었습니다.`, 'friend')
  addNotification(requesterUsername, `${currentUser?.name || currentUsername}님이 일촌 신청을 수락했습니다.`, 'friend_accepted')

  return getFriendStatus(currentUsername, requesterUsername)
}

export function rejectFriendRequest(currentUsername, requesterUsername) {
  const requests = getAllFriendRequests()
  const pairKey = normalizePair(currentUsername, requesterUsername)
  const index = requests.findIndex(
    (item) => item.pairKey === pairKey && item.status === 'pending' && item.receiverUsername === currentUsername
  )

  if (index < 0) {
    throw new Error('거절할 일촌 신청을 찾을 수 없습니다.')
  }

  const now = new Date().toISOString()
  requests[index] = {
    ...requests[index],
    status: 'rejected',
    updatedAt: now,
    rejectedAt: now,
  }

  saveFriendRequests(requests)

  const currentUser = findUser(currentUsername)
  addNotification(requesterUsername, `${currentUser?.name || currentUsername}님이 일촌 신청을 거절했습니다.`, 'friend_rejected')

  return getFriendStatus(currentUsername, requesterUsername)
}

export function removeFriend(currentUsername, targetUsername) {
  const pairKey = normalizePair(currentUsername, targetUsername)
  const requests = getAllFriendRequests().filter((item) => item.pairKey !== pairKey)
  saveFriendRequests(requests)

  const target = findUser(targetUsername)
  addActivity(currentUsername, `${target?.name || targetUsername}님과 일촌을 끊었습니다.`, 'friend')

  return { status: 'none' }
}

export function getFriends(username) {
  const users = getUsers()
  return getAllFriendRequests()
    .filter((item) => item.status === 'accepted' && (item.requesterUsername === username || item.receiverUsername === username))
    .map((item) => {
      const friendUsername = item.requesterUsername === username ? item.receiverUsername : item.requesterUsername
      const user = users.find((candidate) => candidate.username === friendUsername)
      if (!user) return null
      return {
        id: item.id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || '',
        statusMessage: user.statusMessage || '',
      }
    })
    .filter(Boolean)
}

export function getFriendPreview(username, limit = 3) {
  return getFriends(username).slice(0, limit)
}

export function getReceivedFriendRequests(username) {
  const users = getUsers()
  return getAllFriendRequests()
    .filter((item) => item.receiverUsername === username && item.status === 'pending')
    .map((item) => {
      const requester = users.find((user) => user.username === item.requesterUsername)
      return requester ? { ...item, requester } : item
    })
}

export function getSentFriendRequests(username) {
  const users = getUsers()
  return getAllFriendRequests()
    .filter((item) => item.requesterUsername === username && item.status === 'pending')
    .map((item) => {
      const receiver = users.find((user) => user.username === item.receiverUsername)
      return receiver ? { ...item, receiver } : item
    })
}
