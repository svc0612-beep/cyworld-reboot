import { useMemo, useRef, useState } from 'react'
import { updateCurrentUserProfile } from '../services/authService.js'
import { addActivity, addNotification } from '../services/socialService.js'

const MAX_IMAGE_SIZE = 900 * 1024

function ProfileEditPage({ user, onProfileUpdated, onGoMain }) {
  const fileInputRef = useRef(null)
  const [form, setForm] = useState({
    name: user.name || '',
    age: String(user.age || ''),
    gender: user.gender || '',
    email: user.email || '',
    statusMessage: user.statusMessage || '',
    profileImage: user.profileImage || '',
  })
  const [imageError, setImageError] = useState('')

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), [form.email])
  const ageValid = useMemo(() => {
    const ageNumber = Number(form.age)
    return Number.isInteger(ageNumber) && ageNumber >= 1 && ageNumber <= 120
  }, [form.age])

  const canSave =
    form.name.trim() !== '' &&
    form.age.trim() !== '' &&
    form.gender !== '' &&
    form.email.trim() !== '' &&
    emailValid &&
    ageValid

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    setImageError('')

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setImageError('이미지 파일만 선택할 수 있습니다.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('로컬 테스트용 이미지는 900KB 이하로 선택해 주세요.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateForm('profileImage', String(reader.result || ''))
    }
    reader.onerror = () => {
      setImageError('이미지를 불러오지 못했습니다. 다른 파일을 선택해 주세요.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    updateForm('profileImage', '')
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSave) return

    const statusChanged = (user.statusMessage || '') !== form.statusMessage.trim()
    const imageChanged = (user.profileImage || '') !== (form.profileImage || '')

    const updatedUser = updateCurrentUserProfile({
      name: form.name.trim(),
      age: form.age.trim(),
      gender: form.gender,
      email: form.email.trim(),
      statusMessage: form.statusMessage.trim(),
      profileImage: form.profileImage || '',
    })

    if (statusChanged) {
      const cleanStatus = form.statusMessage.trim()
      if (cleanStatus) {
        addActivity(user.username, `상태 메시지를 변경했습니다: “${cleanStatus}”`, 'status')
        addNotification(user.username, `새 상태 메시지가 메인과 미니홈피에 반영되었습니다: “${cleanStatus}”`, 'status')
      } else {
        addActivity(user.username, '상태 메시지를 비웠습니다.', 'status')
        addNotification(user.username, '상태 메시지가 비워졌고 메인과 미니홈피에 반영되었습니다.', 'status')
      }
    }

    if (imageChanged) {
      addActivity(user.username, form.profileImage ? '프로필 사진을 변경했습니다.' : '프로필 사진을 삭제했습니다.', 'profile-image')
      addNotification(user.username, '프로필 사진 변경 내용이 메인과 미니홈피에 반영되었습니다.', 'profile-image')
    }

    if (!statusChanged && !imageChanged) {
      addActivity(user.username, '프로필 정보를 수정했습니다.', 'profile')
      addNotification(user.username, '프로필 변경 내용이 메인과 미니홈피에 반영되었습니다.', 'profile')
    }

    alert('프로필이 수정되었습니다.')
    onProfileUpdated(updatedUser)
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">PROFILE EDIT</p>
          <h1>프로필 수정</h1>
        </div>
        <button className="secondary-button" onClick={onGoMain}>메인으로</button>
      </header>

      <section className="profile-edit-card">
        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="profile-image-editor">
            <div className="profile-image-preview">
              {form.profileImage ? (
                <img src={form.profileImage} alt="프로필 미리보기" />
              ) : (
                <span>{form.name ? form.name.slice(0, 1) : user.name.slice(0, 1)}</span>
              )}
            </div>

            <div className="profile-image-actions">
              <strong>프로필 사진</strong>
              <p>지금은 로컬 테스트용으로 브라우저 저장소에 임시 저장됩니다. 나중에 Supabase Storage로 바꾸면 됩니다.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />
              {imageError && <small className="error-message">{imageError}</small>}
              {form.profileImage && (
                <button className="secondary-button" type="button" onClick={handleRemoveImage}>
                  사진 삭제
                </button>
              )}
            </div>
          </div>

          <label>
            <span>이름</span>
            <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="이름" />
          </label>
          <label>
            <span>나이</span>
            <input value={form.age} onChange={(e) => updateForm('age', e.target.value.replace(/[^0-9]/g, ''))} placeholder="나이" inputMode="numeric" />
            {form.age && !ageValid && <small className="error-message">나이는 1~120 사이 숫자로 입력해 주세요.</small>}
          </label>
          <label>
            <span>성별</span>
            <select value={form.gender} onChange={(e) => updateForm('gender', e.target.value)}>
              <option value="">성별 선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타 / 선택 안 함</option>
            </select>
          </label>
          <label>
            <span>이메일</span>
            <input value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="example@email.com" />
            {form.email && !emailValid && <small className="error-message">이메일 형식이 올바르지 않습니다.</small>}
          </label>
          <label>
            <span>상태 메시지</span>
            <textarea value={form.statusMessage} onChange={(e) => updateForm('statusMessage', e.target.value)} placeholder="오늘의 기분이나 한마디를 적어보세요." rows={4} />
          </label>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={onGoMain}>취소</button>
            <button className="primary-button" type="submit" disabled={!canSave}>저장하기</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default ProfileEditPage
