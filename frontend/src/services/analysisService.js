const positiveWords = [
  '좋다', '좋아요', '좋은', '마음에', '편하다', '재밌다', '재미있다',
  '예쁘다', '만족', '최고', '성공', '괜찮다', '추천', '감사', '행복',
  '기대', '잘됨', '잘돼', '훌륭', '안정', '깔끔', '편리'
]

const negativeWords = [
  '싫다', '싫어요', '불편', '오류', '안됨', '안돼', '안된다', '안되네',
  '별로', '짜증', '문제', '이상하다', '위험', '느리다', '복잡', '깨짐',
  '불안', '실패', '힘들다', '답답', '부족', '아쉽', '삭제', '에러'
]

const topicKeywords = [
  '일촌', '미니홈피', '게시판', '방명록', '다이어리', '사진첩', '도토리',
  '상점', '캐릭터', '프로필', '댓글', '대댓글', '알림', '삭제', '권한',
  '오류', '디자인', '모바일', '앱', '로그인', '회원가입'
]

function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function countMatches(text, words) {
  return words.reduce((count, word) => {
    const pattern = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const matches = text.match(pattern)
    return count + (matches ? matches.length : 0)
  }, 0)
}

export function summarizeText(title, content) {
  const cleanTitle = (title || '').trim()
  const cleanContent = (content || '').trim()
  const fullText = `${cleanTitle}. ${cleanContent}`.trim()

  if (!cleanContent && !cleanTitle) {
    return {
      summary: '요약할 내용이 없습니다.',
      bullets: [],
      keywords: [],
    }
  }

  const sentences = splitSentences(cleanContent || cleanTitle)
  const keywords = topicKeywords.filter((keyword) => fullText.includes(keyword)).slice(0, 6)

  if (sentences.length === 0) {
    return {
      summary: fullText.length > 90 ? `${fullText.slice(0, 90)}...` : fullText,
      bullets: [fullText.length > 90 ? `${fullText.slice(0, 90)}...` : fullText],
      keywords,
    }
  }

  const scored = sentences.map((sentence, index) => {
    const keywordScore = topicKeywords.reduce((score, keyword) => {
      return score + (sentence.includes(keyword) ? 2 : 0)
    }, 0)
    const lengthScore = Math.min(sentence.length / 30, 3)
    const firstSentenceBonus = index === 0 ? 2 : 0
    return {
      sentence,
      score: keywordScore + lengthScore + firstSentenceBonus,
      index,
    }
  })

  const selected = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(3, scored.length))
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence)

  return {
    summary: selected.join(' '),
    bullets: selected,
    keywords,
  }
}

export function analyzeSentiment(title, content) {
  const text = `${title || ''} ${content || ''}`.toLowerCase()

  const positiveCount = countMatches(text, positiveWords)
  const negativeCount = countMatches(text, negativeWords)
  const rawScore = 50 + positiveCount * 12 - negativeCount * 12
  const score = Math.max(0, Math.min(100, rawScore))

  let label = '중립'
  let description = '긍정과 부정 표현이 비슷하거나 감정 표현이 강하지 않은 글입니다.'

  if (score >= 65) {
    label = '긍정'
    description = '긍정적인 표현이 더 많이 감지된 글입니다.'
  } else if (score <= 35) {
    label = '부정'
    description = '불편함, 문제 제기, 부정적인 표현이 더 많이 감지된 글입니다.'
  }

  const matchedPositiveWords = positiveWords.filter((word) => text.includes(word.toLowerCase()))
  const matchedNegativeWords = negativeWords.filter((word) => text.includes(word.toLowerCase()))

  return {
    label,
    score,
    description,
    positiveCount,
    negativeCount,
    keywords: [...matchedPositiveWords, ...matchedNegativeWords].slice(0, 8),
  }
}

export function analyzeBoardPost(post) {
  return {
    summary: summarizeText(post.title, post.content),
    sentiment: analyzeSentiment(post.title, post.content),
    analyzedAt: new Date().toISOString(),
  }
}
