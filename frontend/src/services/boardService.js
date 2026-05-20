const BOARD_KEY = 'cyworld_reboot_board_posts'

function readPosts() {
  const raw = localStorage.getItem(BOARD_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writePosts(posts) {
  localStorage.setItem(BOARD_KEY, JSON.stringify(posts))
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function createBoardPost(ownerUsername, writer, title, content) {
  const cleanTitle = title.trim()
  const cleanContent = content.trim()
  if (!cleanTitle || !cleanContent) throw new Error('제목과 내용을 모두 입력해 주세요.')

  const posts = readPosts()
  const post = {
    id: makeId('board_post'),
    ownerUsername,
    writerUsername: writer.username,
    writerName: writer.name,
    title: cleanTitle,
    content: cleanContent,
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writePosts([post, ...posts])
  return post
}

export function getBoardPosts(ownerUsername, limit = 50) {
  return readPosts()
    .filter((post) => post.ownerUsername === ownerUsername)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export function deleteBoardPost(ownerUsername, postId, requesterUsername) {
  const posts = readPosts()
  const nextPosts = posts.filter((post) => {
    const canDelete = requesterUsername === ownerUsername
    return !(post.ownerUsername === ownerUsername && post.id === postId && canDelete)
  })
  writePosts(nextPosts)
}

export function addBoardComment(ownerUsername, postId, writer, content) {
  const cleanContent = content.trim()
  if (!cleanContent) throw new Error('댓글 내용을 입력해 주세요.')

  const posts = readPosts()
  let newComment = null
  const nextPosts = posts.map((post) => {
    if (!(post.ownerUsername === ownerUsername && post.id === postId)) return post
    newComment = {
      id: makeId('board_comment'),
      writerUsername: writer.username,
      writerName: writer.name,
      content: cleanContent,
      replies: [],
      createdAt: new Date().toISOString(),
    }
    return { ...post, comments: [newComment, ...(post.comments || [])], updatedAt: new Date().toISOString() }
  })
  if (!newComment) throw new Error('게시글을 찾을 수 없습니다.')
  writePosts(nextPosts)
  return newComment
}

export function deleteBoardComment(ownerUsername, postId, commentId, requesterUsername) {
  const posts = readPosts()
  const nextPosts = posts.map((post) => {
    if (!(post.ownerUsername === ownerUsername && post.id === postId)) return post
    const nextComments = (post.comments || []).filter((comment) => {
      const canDelete = requesterUsername === ownerUsername
      return !(comment.id === commentId && canDelete)
    })
    return { ...post, comments: nextComments, updatedAt: new Date().toISOString() }
  })
  writePosts(nextPosts)
}

export function addBoardReply(ownerUsername, postId, commentId, writer, content) {
  const cleanContent = content.trim()
  if (!cleanContent) throw new Error('대댓글 내용을 입력해 주세요.')

  const posts = readPosts()
  let newReply = null
  const nextPosts = posts.map((post) => {
    if (!(post.ownerUsername === ownerUsername && post.id === postId)) return post
    const nextComments = (post.comments || []).map((comment) => {
      if (comment.id !== commentId) return comment
      newReply = {
        id: makeId('board_reply'),
        writerUsername: writer.username,
        writerName: writer.name,
        content: cleanContent,
        createdAt: new Date().toISOString(),
      }
      return { ...comment, replies: [...(comment.replies || []), newReply] }
    })
    return { ...post, comments: nextComments, updatedAt: new Date().toISOString() }
  })
  if (!newReply) throw new Error('댓글을 찾을 수 없습니다.')
  writePosts(nextPosts)
  return newReply
}

export function deleteBoardReply(ownerUsername, postId, commentId, replyId, requesterUsername) {
  const posts = readPosts()
  const nextPosts = posts.map((post) => {
    if (!(post.ownerUsername === ownerUsername && post.id === postId)) return post
    const nextComments = (post.comments || []).map((comment) => {
      if (comment.id !== commentId) return comment
      const nextReplies = (comment.replies || []).filter((reply) => {
        const canDelete = requesterUsername === ownerUsername
        return !(reply.id === replyId && canDelete)
      })
      return { ...comment, replies: nextReplies }
    })
    return { ...post, comments: nextComments, updatedAt: new Date().toISOString() }
  })
  writePosts(nextPosts)
}
