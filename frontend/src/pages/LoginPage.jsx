import { useState } from 'react'
import { loginUser } from '../services/authService.js'

function LoginPage({ onLoginSuccess, onGoLanding, onGoRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const canLogin = username.trim() !== '' && password.trim() !== ''

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canLogin) return

    try {
      const user = loginUser(username.trim(), password)
      onLoginSuccess(user)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <main className="app-shell">
      <section className="form-card">
        <h1>로그인</h1>
        <p className="form-description">아이디와 비밀번호를 입력해 주세요.</p>
        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>아이디</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="아이디" autoComplete="username" />
          </label>
          <label>
            <span>비밀번호</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" autoComplete="current-password" />
          </label>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button className="primary-button" type="submit" disabled={!canLogin}>로그인</button>
          <button className="text-button" type="button" onClick={onGoRegister}>아직 계정이 없나요? 회원가입</button>
          <button className="text-button muted" type="button" onClick={onGoLanding}>처음 화면으로</button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
