const PHOTOS_KEY = 'cyworld_reboot_photos'
const MAX_PHOTO_SIZE = 1024 * 1024 * 1.2

function readPhotos() {
  const raw = localStorage.getItem(PHOTOS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writePhotos(photos) {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos))
}

export function getMaxPhotoSizeText() {
  return '1.2MB'
}

export function fileToDataUrl(file) {
  if (!file) {
    return Promise.reject(new Error('사진 파일을 선택해 주세요.'))
  }

  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('이미지 파일만 업로드할 수 있습니다.'))
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return Promise.reject(new Error(`로컬 테스트에서는 ${getMaxPhotoSizeText()} 이하 이미지만 사용할 수 있습니다.`))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('사진을 읽는 중 오류가 발생했습니다.'))
    reader.readAsDataURL(file)
  })
}

export function createPhoto(username, caption, imageData) {
  const cleanCaption = caption.trim()

  if (!imageData) {
    throw new Error('사진을 선택해 주세요.')
  }

  const photos = readPhotos()
  const newPhoto = {
    id: `${username}_photo_${Date.now()}`,
    username,
    caption: cleanCaption || '무제 사진',
    imageData,
    createdAt: new Date().toISOString(),
  }

  writePhotos([newPhoto, ...photos])
  return newPhoto
}

export function getPhotos(username, limit = 20) {
  return readPhotos()
    .filter((photo) => photo.username === username)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
}

export function deletePhoto(username, photoId) {
  const photos = readPhotos()
  const nextPhotos = photos.filter(
    (photo) => !(photo.username === username && photo.id === photoId)
  )
  writePhotos(nextPhotos)
  return getPhotos(username)
}
