import { useMemo, useState } from 'react'
import { isUsernameTaken, registerUser } from '../services/authService.js'

const initialForm = {
  name: '',
  age: '',
  gender: '',
  username: '',
  email: '',
  password: '',
  passwordConfirm: '',
}

function RegisterPage({ onGoLanding, onGoLogin }) {
  const [form, setForm] = useState(initialForm)
  const [usernameChecked, setUsernameChecked] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(false)
  const [usernameMessage, setUsernameMessage] = useState('')

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email), [form.email])
  const ageValid = useMemo(() => {
    const ageNumber = Number(form.age)
    return Number.isInteger(ageNumber) && ageNumber >= 1 && ageNumber <= 120
  }, [form.age])

  const passwordValid = form.password.length >= 6
  const passwordMatched = form.password !== '' && form.password === form.passwordConfirm
  const allRequiredFilled =
    form.name.trim() !== '' &&
    form.age.trim() !== '' &&
    form.gender !== '' &&
    form.username.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password.trim() !== '' &&
    form.passwordConfirm.trim() !== ''

  const canSubmit = allRequiredFilled && ageValid && emailValid && passwordValid && passwordMatched && usernameChecked && usernameAvailable

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === 'username') {
      setUsernameChecked(false)
      setUsernameAvailable(false)
      setUsernameMessage('')
    }
  }

  const handleUsernameCheck = () => {
    const username = form.username.trim()
    if (username.length < 4) {
      setUsernameChecked(true)
      setUsernameAvailable(false)
      setUsernameMessage('아이디는 4자 이상 입력해 주세요.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameChecked(true)
      setUsernameAvailable(false)
      setUsernameMessage('아이디는 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.')
      return
    }
    if (isUsernameTaken(username)) {
      setUsernameChecked(true)
      setUsernameAvailable(false)
      setUsernameMessage('이미 사용 중인 아이디입니다.')
      return
    }
    setUsernameChecked(true)
    setUsernameAvailable(true)
    setUsernameMessage('사용 가능한 아이디입니다.')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return

    registerUser({
      name: form.name.trim(),
      age: form.age.trim(),
      gender: form.gender,
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.')
    onGoLogin()
  }

  return (
    <main className="app-shell">
      <section className="form-card wide">
        <h1>회원가입</h1>
        <p className="form-description">모든 항목을 올바르게 입력하면 가입 버튼이 활성화됩니다.</p>
        <form onSubmit={handleSubmit} className="form-stack">
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
            <span>아이디</span>
            <div className="inline-field">
              <input value={form.username} onChange={(e) => updateForm('username', e.target.value)} placeholder="영문, 숫자, 밑줄 4자 이상" autoComplete="username" />
              <button type="button" className="small-button" onClick={handleUsernameCheck}>중복체크</button>
            </div>
            {usernameMessage && <small className={usernameAvailable ? 'success-message' : 'error-message'}>{usernameMessage}</small>}
          </label>
          <label>
            <span>이메일</span>
            <input value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="example@email.com" autoComplete="email" />
            {form.email && !emailValid && <small className="error-message">이메일 형식이 올바르지 않습니다.</small>}
          </label>
          <label>
            <span>비밀번호</span>
            <input type="password" value={form.password} onChange={(e) => updateForm('password', e.target.value)} placeholder="6자 이상" autoComplete="new-password" />
            {form.password && !passwordValid && <small className="error-message">비밀번호는 6자 이상 입력해 주세요.</small>}
          </label>
          <label>
            <span>비밀번호 확인</span>
            <input type="password" value={form.passwordConfirm} onChange={(e) => updateForm('passwordConfirm', e.target.value)} placeholder="비밀번호 다시 입력" autoComplete="new-password" />
            {form.passwordConfirm && !passwordMatched && <small className="error-message">비밀번호가 일치하지 않습니다.</small>}
          </label>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={onGoLanding}>취소</button>
            <button className="primary-button" type="submit" disabled={!canSubmit}>가입하기</button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
