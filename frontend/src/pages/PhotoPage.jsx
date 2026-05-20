import { useMemo, useState } from 'react'
import { addActivity, addNotification } from '../services/socialService.js'
import { createPhoto, deletePhoto, fileToDataUrl, getMaxPhotoSizeText, getPhotos } from '../services/photoService.js'

function formatDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PhotoPage({ user, ownerUser, onGoMain, onGoMinihome, onContentChanged, onLogout }) {
  const owner = ownerUser || user
  const isOwner = owner.username === user.username
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const photos = useMemo(() => getPhotos(owner.username, 30), [owner.username, refreshKey])

  const refresh = () => {
    setRefreshKey((prev) => prev + 1)
    onContentChanged?.()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    setErrorMessage('')
    setPreview('')

    if (!file) return

    try {
      const dataUrl = await fileToDataUrl(file)
      setPreview(dataUrl)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!isOwner) {
      setErrorMessage('사진 업로드는 미니홈피 주인만 할 수 있습니다.')
      return
    }

    if (!preview) {
      setErrorMessage('사진을 선택해 주세요.')
      return
    }

    try {
      const photo = createPhoto(owner.username, caption, preview)
      addActivity(owner.username, `사진첩에 사진을 올렸습니다: “${photo.caption}”`, 'photo')
      addNotification(owner.username, `새 사진이 미니홈피 사진첩에 올라갔습니다: “${photo.caption}”`, 'photo')
      setCaption('')
      setPreview('')
      refresh()
      alert('사진이 저장되었습니다.')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const handleDelete = (photoId) => {
    if (!isOwner) return
    if (!confirm('이 사진을 삭제할까요?')) return
    deletePhoto(owner.username, photoId)
    addActivity(owner.username, '사진첩 사진을 삭제했습니다.', 'photo')
    refresh()
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">PHOTO ALBUM</p>
          <h1>{owner.name}님의 사진첩</h1>
          {!isOwner && <p className="muted-text">@{owner.username}님의 미니홈피 사진을 보는 중입니다.</p>}
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          <button className="secondary-button" onClick={onGoMinihome}>{isOwner ? '내 미니홈피' : `${owner.name}님 미니홈피`}</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="content-layout">
        {isOwner ? (
          <article className="info-card content-editor-card">
            <h3>사진 올리기</h3>
            <p className="miniroom-help">로컬 테스트용이라 {getMaxPhotoSizeText()} 이하 이미지만 권장합니다. 나중에는 Supabase Storage로 바꿀 예정입니다.</p>
            <form className="form-stack" onSubmit={handleSubmit}>
              <label>
                <span>사진 선택</span>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
              {preview && <img className="photo-preview" src={preview} alt="미리보기" />}
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <label>
                <span>사진 설명</span>
                <input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="사진 설명" />
              </label>
              <button className="primary-button" type="submit" disabled={!preview}>사진 저장</button>
            </form>
          </article>
        ) : (
          <article className="info-card content-editor-card viewer-info-card">
            <h3>방문자 보기 모드</h3>
            <p className="miniroom-help">사진 업로드와 삭제는 {owner.name}님만 할 수 있습니다. 방문자는 사진을 볼 수만 있습니다.</p>
          </article>
        )}

        <article className="info-card content-list-card">
          <h3>{isOwner ? '내 사진첩' : `${owner.name}님의 사진첩`}</h3>
          {photos.length === 0 ? (
            <p className="empty-text">아직 올린 사진이 없습니다.</p>
          ) : (
            <div className="photo-grid">
              {photos.map((photo) => (
                <article className="photo-card" key={photo.id}>
                  <img src={photo.imageData} alt={photo.caption} />
                  <div>
                    <strong>{photo.caption}</strong>
                    <small>{formatDate(photo.createdAt)}</small>
                  </div>
                  {isOwner && <button className="tiny-button" onClick={() => handleDelete(photo.id)}>삭제</button>}
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default PhotoPage
