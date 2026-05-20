const USERS_KEY = 'cyworld_reboot_users'
const CURRENT_USER_KEY = 'cyworld_reboot_current_user'

export function getUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function isUsernameTaken(username) {
  const users = getUsers()
  return users.some((user) => user.username === username)
}

export function registerUser(formData) {
  const users = getUsers()

  if (isUsernameTaken(formData.username)) {
    throw new Error('이미 사용 중인 아이디입니다.')
  }

  const newUser = {
    id: Date.now(),
    name: formData.name,
    age: Number(formData.age),
    gender: formData.gender,
    username: formData.username,
    email: formData.email,
    password: formData.password,
    dotori: 200,
    statusMessage: '',
    profileImage: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  users.push(newUser)
  saveUsers(users)

  return newUser
}

export function loginUser(username, password) {
  const users = getUsers()
  const user = users.find(
    (item) => item.username === username && item.password === password
  )

  if (!user) {
    throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
  }

  const safeUser = toSafeUser(user)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser))
  return safeUser
}

export function getCurrentUser() {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function updateCurrentUserProfile(updateData) {
  const users = getUsers()
  const currentUser = getCurrentUser()

  if (!currentUser) {
    throw new Error('로그인 정보가 없습니다.')
  }

  let updatedFullUser = null

  const updatedUsers = users.map((user) => {
    if (user.username !== currentUser.username) {
      return user
    }

    updatedFullUser = {
      ...user,
      ...updateData,
      age: updateData.age !== undefined ? Number(updateData.age) : user.age,
      updatedAt: new Date().toISOString(),
    }

    return updatedFullUser
  })

  if (!updatedFullUser) {
    throw new Error('사용자 정보를 찾을 수 없습니다.')
  }

  saveUsers(updatedUsers)

  const updatedCurrentUser = toSafeUser(updatedFullUser)
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser))

  return updatedCurrentUser
}

export function updateCurrentUserStatusMessage(statusMessage) {
  const currentUser = getCurrentUser()

  if (!currentUser) {
    throw new Error('로그인 정보가 없습니다.')
  }

  return updateCurrentUserProfile({
    statusMessage,
  })
}

export function updateCurrentUserProfileImage(profileImage) {
  return updateCurrentUserProfile({
    profileImage,
  })
}

function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
    gender: user.gender,
    username: user.username,
    email: user.email,
    dotori: user.dotori ?? 200,
    statusMessage: user.statusMessage || '',
    profileImage: user.profileImage || '',
  }
}
