const GUESTBOOK_KEY = 'cyworld_reboot_guestbooks'

function readGuestbooks() {
  const raw = localStorage.getItem(GUESTBOOK_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeGuestbooks(entries) {
  localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries))
}

export function createGuestbookEntry(ownerUsername, writer, content) {
  const cleanContent = content.trim()

  if (!cleanContent) {
    throw new Error('방명록 내용을 입력해 주세요.')
  }

  const entries = readGuestbooks()
  const newEntry = {
    id: `${ownerUsername}_guestbook_${Date.now()}`,
    ownerUsername,
    writerUsername: writer.username,
    writerName: writer.name,
    content: cleanContent,
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  writeGuestbooks([newEntry, ...entries])
  return newEntry
}

export function getGuestbookEntries(ownerUsername, limit = 20) {
  return readGuestbooks()
    .filter((entry) => entry.ownerUsername === ownerUsername)
    .map((entry) => ({ ...entry, replies: entry.replies || [] }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export function addGuestbookReply(ownerUsername, entryId, writer, content) {
  const cleanContent = content.trim()

  if (!cleanContent) {
    throw new Error('답글 내용을 입력해 주세요.')
  }

  const entries = readGuestbooks()
  let updatedEntry = null

  const nextEntries = entries.map((entry) => {
    if (entry.ownerUsername !== ownerUsername || entry.id !== entryId) {
      return entry
    }

    const reply = {
      id: `${entryId}_reply_${Date.now()}`,
      writerUsername: writer.username,
      writerName: writer.name,
      content: cleanContent,
      createdAt: new Date().toISOString(),
    }

    updatedEntry = {
      ...entry,
      replies: [...(entry.replies || []), reply],
      updatedAt: new Date().toISOString(),
    }

    return updatedEntry
  })

  if (!updatedEntry) {
    throw new Error('답글을 달 방명록을 찾을 수 없습니다.')
  }

  writeGuestbooks(nextEntries)
  return updatedEntry
}

export function deleteGuestbookEntry(ownerUsername, entryId, currentUsername = ownerUsername) {
  const entries = readGuestbooks()
  const target = entries.find((entry) => entry.ownerUsername === ownerUsername && entry.id === entryId)

  if (!target) {
    throw new Error('삭제할 방명록을 찾을 수 없습니다.')
  }

  const canDelete = currentUsername === ownerUsername

  if (!canDelete) {
    throw new Error('이 방명록을 삭제할 권한이 없습니다.')
  }

  const nextEntries = entries.filter(
    (entry) => !(entry.ownerUsername === ownerUsername && entry.id === entryId)
  )

  writeGuestbooks(nextEntries)
  return getGuestbookEntries(ownerUsername)
}

export function deleteGuestbookReply(ownerUsername, entryId, replyId, currentUsername = ownerUsername) {
  const entries = readGuestbooks()
  let changed = false

  const nextEntries = entries.map((entry) => {
    if (entry.ownerUsername !== ownerUsername || entry.id !== entryId) {
      return entry
    }

    const reply = (entry.replies || []).find((item) => item.id === replyId)

    if (!reply) {
      return entry
    }

    const canDelete = currentUsername === ownerUsername

    if (!canDelete) {
      throw new Error('이 답글을 삭제할 권한이 없습니다.')
    }

    changed = true

    return {
      ...entry,
      replies: (entry.replies || []).filter((item) => item.id !== replyId),
      updatedAt: new Date().toISOString(),
    }
  })

  if (!changed) {
    throw new Error('삭제할 답글을 찾을 수 없습니다.')
  }

  writeGuestbooks(nextEntries)
  return getGuestbookEntries(ownerUsername)
}
