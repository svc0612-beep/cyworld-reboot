const DIARIES_KEY = 'cyworld_reboot_diaries'

function readDiaries() {
  const raw = localStorage.getItem(DIARIES_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeDiaries(diaries) {
  localStorage.setItem(DIARIES_KEY, JSON.stringify(diaries))
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createDiary(username, title, content) {
  const cleanTitle = title.trim()
  const cleanContent = content.trim()

  if (!cleanTitle || !cleanContent) {
    throw new Error('제목과 내용을 모두 입력해 주세요.')
  }

  const diaries = readDiaries()
  const newDiary = {
    id: makeId(`${username}_diary`),
    username,
    title: cleanTitle,
    content: cleanContent,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  writeDiaries([newDiary, ...diaries])
  return newDiary
}

export function getDiaries(username, limit = 20) {
  return readDiaries()
    .filter((diary) => diary.username === username)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export function deleteDiary(username, diaryId) {
  const diaries = readDiaries()
  const nextDiaries = diaries.filter(
    (diary) => !(diary.username === username && diary.id === diaryId)
  )
  writeDiaries(nextDiaries)
  return getDiaries(username)
}

export function addDiaryComment(ownerUsername, diaryId, writer, content) {
  const cleanContent = content.trim()
  if (!cleanContent) throw new Error('댓글 내용을 입력해 주세요.')

  const diaries = readDiaries()
  let newComment = null
  const nextDiaries = diaries.map((diary) => {
    if (!(diary.username === ownerUsername && diary.id === diaryId)) return diary
    newComment = {
      id: makeId('diary_comment'),
      writerUsername: writer.username,
      writerName: writer.name,
      content: cleanContent,
      replies: [],
      createdAt: new Date().toISOString(),
    }
    return {
      ...diary,
      comments: [newComment, ...(diary.comments || [])],
      updatedAt: new Date().toISOString(),
    }
  })

  if (!newComment) throw new Error('다이어리 글을 찾을 수 없습니다.')
  writeDiaries(nextDiaries)
  return newComment
}

export function deleteDiaryComment(ownerUsername, diaryId, commentId, requesterUsername) {
  const diaries = readDiaries()
  const nextDiaries = diaries.map((diary) => {
    if (!(diary.username === ownerUsername && diary.id === diaryId)) return diary
    const nextComments = (diary.comments || []).filter((comment) => {
      const canDelete = requesterUsername === ownerUsername
      return !(comment.id === commentId && canDelete)
    })
    return { ...diary, comments: nextComments, updatedAt: new Date().toISOString() }
  })
  writeDiaries(nextDiaries)
}

export function addDiaryReply(ownerUsername, diaryId, commentId, writer, content) {
  const cleanContent = content.trim()
  if (!cleanContent) throw new Error('대댓글 내용을 입력해 주세요.')

  const diaries = readDiaries()
  let newReply = null
  const nextDiaries = diaries.map((diary) => {
    if (!(diary.username === ownerUsername && diary.id === diaryId)) return diary
    const nextComments = (diary.comments || []).map((comment) => {
      if (comment.id !== commentId) return comment
      newReply = {
        id: makeId('diary_reply'),
        writerUsername: writer.username,
        writerName: writer.name,
        content: cleanContent,
        createdAt: new Date().toISOString(),
      }
      return { ...comment, replies: [...(comment.replies || []), newReply] }
    })
    return { ...diary, comments: nextComments, updatedAt: new Date().toISOString() }
  })
  if (!newReply) throw new Error('댓글을 찾을 수 없습니다.')
  writeDiaries(nextDiaries)
  return newReply
}

export function deleteDiaryReply(ownerUsername, diaryId, commentId, replyId, requesterUsername) {
  const diaries = readDiaries()
  const nextDiaries = diaries.map((diary) => {
    if (!(diary.username === ownerUsername && diary.id === diaryId)) return diary
    const nextComments = (diary.comments || []).map((comment) => {
      if (comment.id !== commentId) return comment
      const nextReplies = (comment.replies || []).filter((reply) => {
        const canDelete = requesterUsername === ownerUsername
        return !(reply.id === replyId && canDelete)
      })
      return { ...comment, replies: nextReplies }
    })
    return { ...diary, comments: nextComments, updatedAt: new Date().toISOString() }
  })
  writeDiaries(nextDiaries)
}
