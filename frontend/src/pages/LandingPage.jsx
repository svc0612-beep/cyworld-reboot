function LandingPage({ onGoLogin, onGoRegister }) {
  return (
    <main className="app-shell">
      <section className="landing-card">
        <div className="brand-badge">CY</div>
        <h1>싸이월드 리부트</h1>
        <p className="landing-description">
          추억의 미니홈피 감성을 현대적인 웹앱으로 다시 만듭니다.
        </p>
        <div className="landing-actions">
          <button className="primary-button" onClick={onGoLogin}>로그인</button>
          <button className="secondary-button" onClick={onGoRegister}>회원가입</button>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
