import { useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import MainPage from './pages/MainPage.jsx'
import MinihomePage from './pages/MinihomePage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import ProfileEditPage from './pages/ProfileEditPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import DiaryPage from './pages/DiaryPage.jsx'
import GuestbookPage from './pages/GuestbookPage.jsx'
import PhotoPage from './pages/PhotoPage.jsx'
import BoardPage from './pages/BoardPage.jsx'
import { getCurrentUser, logout } from './services/authService.js'

function App() {
  const [page, setPage] = useState('landing')
  const [currentUser, setCurrentUser] = useState(null)
  const [targetMinihomeUser, setTargetMinihomeUser] = useState(null)
  const [targetBoardUser, setTargetBoardUser] = useState(null)
  const [targetDiaryUser, setTargetDiaryUser] = useState(null)
  const [targetPhotoUser, setTargetPhotoUser] = useState(null)
  const [contentVersion, setContentVersion] = useState(0)

  useEffect(() => {
    const savedUser = getCurrentUser()
    if (savedUser) {
      setCurrentUser(savedUser)
      setPage('main')
    }
  }, [])

  const goLanding = () => setPage('landing')
  const goLogin = () => setPage('login')
  const goRegister = () => setPage('register')
  const goMain = () => setPage('main')
  const goMinihome = () => {
    setTargetMinihomeUser(null)
    setPage('minihome')
  }
  const goFriends = () => setPage('friends')
  const goProfileEdit = () => setPage('profileEdit')
  const goShop = () => setPage('shop')
  const goDiary = (owner = null) => {
    setTargetDiaryUser(owner || null)
    setPage('diary')
  }
  const goGuestbook = () => setPage('guestbook')
  const goPhoto = (owner = null) => {
    setTargetPhotoUser(owner || null)
    setPage('photo')
  }
  const goBoard = (owner = null) => {
    setTargetBoardUser(owner || null)
    setPage('board')
  }

  const goUserMinihome = (targetUser) => {
    setTargetMinihomeUser(targetUser)
    setPage('minihome')
  }

  const handleContentChanged = () => {
    setContentVersion((prev) => prev + 1)
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    setPage('main')
  }

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser)
    setPage('main')
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setPage('landing')
  }

  if (page === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoLanding={goLanding}
        onGoRegister={goRegister}
      />
    )
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onGoLanding={goLanding}
        onGoLogin={goLogin}
      />
    )
  }

  if (page === 'profileEdit' && currentUser) {
    return (
      <ProfileEditPage
        user={currentUser}
        onProfileUpdated={handleProfileUpdated}
        onGoMain={goMain}
      />
    )
  }

  if (page === 'minihome' && currentUser) {
    return (
      <MinihomePage
        user={currentUser}
        ownerUser={targetMinihomeUser || currentUser}
        onGoMain={goMain}
        onGoFriends={goFriends}
        onGoProfileEdit={goProfileEdit}
        onGoShop={goShop}
        onGoDiary={goDiary}
        onGoBoard={goBoard}
        onGoGuestbook={goGuestbook}
        onGoPhoto={goPhoto}
        onViewMinihome={goUserMinihome}
        contentVersion={contentVersion}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'shop' && currentUser) {
    return (
      <ShopPage
        user={currentUser}
        onUserUpdated={setCurrentUser}
        onGoMain={goMain}
        onGoMinihome={() => {
          setTargetMinihomeUser(targetDiaryUser || currentUser)
          setPage('minihome')
        }}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'diary' && currentUser) {
    return (
      <DiaryPage
        user={currentUser}
        ownerUser={targetDiaryUser || currentUser}
        onGoMain={goMain}
        onGoMinihome={() => {
          setTargetMinihomeUser(targetDiaryUser || currentUser)
          setPage('minihome')
        }}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'guestbook' && currentUser) {
    return (
      <GuestbookPage
        user={currentUser}
        onGoMain={goMain}
        onGoMinihome={goMinihome}
        onLogout={handleLogout}
      />
    )
  }



  if (page === 'board' && currentUser) {
    return (
      <BoardPage
        user={currentUser}
        ownerUser={targetBoardUser || currentUser}
        onGoMain={goMain}
        onGoMinihome={() => {
          setTargetMinihomeUser(targetBoardUser || currentUser)
          setPage('minihome')
        }}
        onContentChanged={handleContentChanged}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'photo' && currentUser) {
    return (
      <PhotoPage
        user={currentUser}
        ownerUser={targetPhotoUser || currentUser}
        onGoMain={goMain}
        onGoMinihome={() => {
          setTargetMinihomeUser(targetPhotoUser || currentUser)
          setPage('minihome')
        }}
        onContentChanged={handleContentChanged}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'friends' && currentUser) {
    return (
      <FriendsPage
        user={currentUser}
        onGoMain={goMain}
        onGoMinihome={goMinihome}
        onViewMinihome={goUserMinihome}
        contentVersion={contentVersion}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'main' && currentUser) {
    return (
      <MainPage
        user={currentUser}
        onLogout={handleLogout}
        onGoMinihome={goMinihome}
        onGoFriends={goFriends}
        onGoProfileEdit={goProfileEdit}
        onGoShop={goShop}
        onGoDiary={goDiary}
        onGoBoard={goBoard}
        onGoGuestbook={goGuestbook}
        onGoPhoto={goPhoto}
        onViewMinihome={goUserMinihome}
        onUserUpdated={setCurrentUser}
      />
    )
  }

  return (
    <LandingPage
      onGoLogin={goLogin}
      onGoRegister={goRegister}
    />
  )
}

export default App
