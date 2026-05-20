import { updateCurrentUserProfile } from './authService.js'

const INVENTORY_KEY = 'cyworld_reboot_inventory'
const MAX_MINIHOME_ITEMS = 20

export const DOTORI_PACKS = [
  { id: 'dotori_100', amount: 100, label: '도토리 100개', priceText: '테스트 구매', description: '가볍게 아이템 몇 개를 더 살 수 있는 기본 충전팩' },
  { id: 'dotori_300', amount: 300, label: '도토리 300개', priceText: '테스트 구매', description: '미니홈피를 본격적으로 꾸미기 좋은 충전팩' },
  { id: 'dotori_500', amount: 500, label: '도토리 500개', priceText: '테스트 구매', description: '캐릭터와 가구를 함께 구매하기 좋은 넉넉한 충전팩' },
  { id: 'dotori_1000', amount: 1000, label: '도토리 1000개', priceText: '테스트 구매', description: '상점 아이템을 많이 테스트하고 싶을 때 쓰는 대용량 충전팩' },
]

export const SHOP_ITEMS = [
  { id: 'boy_character', name: '남자 캐릭터', category: '캐릭터', price: 30, emoji: '🧑', displayType: 'character', description: '아이템을 장착할 기본 남자 캐릭터' },
  { id: 'girl_character', name: '여자 캐릭터', category: '캐릭터', price: 30, emoji: '👩', displayType: 'character', description: '아이템을 장착할 기본 여자 캐릭터' },
  { id: 'friend_character', name: '친구 캐릭터', category: '캐릭터', price: 35, emoji: '🧑‍🤝‍🧑', displayType: 'character', description: '일촌 감성을 살리는 친구 캐릭터' },

  { id: 'galaxy_phone', name: '갤럭시 스마트폰', category: '캐릭터 장착품', price: 18, emoji: '📱', displayType: 'equip', slot: 'hand', description: '캐릭터 손에 장착되는 갤럭시 스마트폰' },
  { id: 'iphone', name: '아이폰', category: '캐릭터 장착품', price: 18, emoji: '📲', displayType: 'equip', slot: 'hand', description: '캐릭터 손에 장착되는 아이폰' },
  { id: 'glasses', name: '안경', category: '캐릭터 장착품', price: 12, emoji: '👓', displayType: 'equip', slot: 'face', description: '캐릭터 얼굴에 장착되는 안경' },
  { id: 'headphones', name: '헤드폰', category: '캐릭터 장착품', price: 18, emoji: '🎧', displayType: 'equip', slot: 'head', description: '캐릭터 머리 쪽에 장착되는 음악 감성 헤드폰' },
  { id: 'camera', name: '카메라', category: '캐릭터 장착품', price: 20, emoji: '📷', displayType: 'equip', slot: 'neck', description: '캐릭터 목에 걸어두는 카메라' },
  { id: 'hair_dryer', name: '헤어드라이기', category: '캐릭터 장착품', price: 16, emoji: '💨', displayType: 'equip', slot: 'hand', description: '캐릭터 손에 장착되는 드라이기 소품' },

  { id: 'vacuum', name: '청소기', category: '전자제품', price: 22, emoji: '🧹', displayType: 'room', size: 'medium', description: '방 바닥에 배치하는 청소기' },
  { id: 'tv', name: '티비', category: '전자제품', price: 28, emoji: '📺', displayType: 'room', size: 'large', description: '미니룸 벽면에 배치하는 티비' },
  { id: 'washing_machine', name: '세탁기', category: '전자제품', price: 28, emoji: '🧺', displayType: 'room', size: 'large', description: '생활감 있는 세탁기 소품' },
  { id: 'fridge', name: '냉장고', category: '전자제품', price: 30, emoji: '🧊', displayType: 'room', size: 'large', description: '주방 느낌을 더하는 냉장고' },
  { id: 'laptop', name: '노트북', category: '전자제품', price: 26, emoji: '💻', displayType: 'room', size: 'medium', description: '책상 위 작업실 느낌 노트북' },
  { id: 'music_speaker', name: '스피커', category: '전자제품', price: 20, emoji: '🔊', displayType: 'room', size: 'medium', description: 'BGM 감성 스피커' },

  { id: 'lamp', name: '조명', category: '가구/인테리어', price: 14, emoji: '💡', displayType: 'room', size: 'small', description: '미니홈피 분위기를 밝혀주는 조명' },
  { id: 'bed', name: '침대', category: '가구/인테리어', price: 32, emoji: '🛏️', displayType: 'room', size: 'large', description: '방 꾸미기의 기본 침대' },
  { id: 'bedding', name: '침구류', category: '가구/인테리어', price: 20, emoji: '🧺', displayType: 'room', size: 'medium', description: '포근한 침구류 세트' },
  { id: 'pillow', name: '베개', category: '가구/인테리어', price: 12, emoji: '☁️', displayType: 'room', size: 'small', description: '작은 포인트 베개' },
  { id: 'sofa', name: '소파', category: '가구/인테리어', price: 30, emoji: '🛋️', displayType: 'room', size: 'large', description: '편안한 거실 느낌 소파' },
  { id: 'table', name: '테이블', category: '가구/인테리어', price: 18, emoji: '🪑', displayType: 'room', size: 'medium', description: '소품을 올려둘 작은 테이블' },
  { id: 'bookshelf', name: '책장', category: '가구/인테리어', price: 22, emoji: '📚', displayType: 'room', size: 'large', description: '공부방 느낌을 주는 책장' },
  { id: 'rug', name: '러그', category: '가구/인테리어', price: 15, emoji: '🟫', displayType: 'room', size: 'large', description: '바닥을 꾸미는 미니 러그' },
  { id: 'mirror', name: '거울', category: '가구/인테리어', price: 17, emoji: '🪞', displayType: 'room', size: 'medium', description: '방을 넓어 보이게 하는 거울' },

  { id: 'pizza', name: '피자', category: '음식', price: 10, emoji: '🍕', displayType: 'room', size: 'small', description: '테이블 위에 놓기 좋은 피자' },
  { id: 'cake', name: '케이크', category: '음식', price: 12, emoji: '🍰', displayType: 'room', size: 'small', description: '축하 분위기의 케이크' },
  { id: 'coffee', name: '커피', category: '음식', price: 8, emoji: '☕', displayType: 'room', size: 'small', description: '책상 위 감성 커피' },
  { id: 'ramen', name: '라면', category: '음식', price: 9, emoji: '🍜', displayType: 'room', size: 'small', description: '늦은 밤 감성 라면' },

  { id: 'teddy', name: '곰인형', category: '귀여운 소품', price: 16, emoji: '🧸', displayType: 'room', size: 'small', description: '미니홈피 귀여움 담당 곰인형' },
  { id: 'plant', name: '화분', category: '귀여운 소품', price: 14, emoji: '🪴', displayType: 'room', size: 'small', description: '방에 생기를 주는 화분' },
  { id: 'cat', name: '고양이', category: '귀여운 소품', price: 24, emoji: '🐈', displayType: 'room', size: 'medium', description: '미니홈피를 지키는 고양이' },
  { id: 'dog', name: '강아지', category: '귀여운 소품', price: 24, emoji: '🐕', displayType: 'room', size: 'medium', description: '방문자를 반겨주는 강아지' },
  { id: 'game_console', name: '게임기', category: '취미', price: 22, emoji: '🎮', displayType: 'room', size: 'small', description: '게임 좋아하는 사람을 위한 소품' },
  { id: 'clock', name: '시계', category: '취미', price: 14, emoji: '⏰', displayType: 'room', size: 'small', description: '방 안에 포인트가 되는 시계' },
]

function readInventory() {
  const raw = localStorage.getItem(INVENTORY_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeInventory(inventory) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory))
}

function normalizeOwnedItem(ownedItem, index = 0) {
  const item = getItemById(ownedItem.itemId)
  if (!item) return ownedItem

  const base = {
    ...ownedItem,
    x: typeof ownedItem.x === 'number' ? ownedItem.x : 12 + ((index * 17) % 72),
    y: typeof ownedItem.y === 'number' ? ownedItem.y : 18 + ((index * 23) % 62),
    equipped: Boolean(ownedItem.equipped),
  }

  if (item.displayType === 'character' && ownedItem.equipped === undefined) {
    return { ...base, equipped: true }
  }

  if (item.displayType === 'equip' && ownedItem.equipped === undefined) {
    return { ...base, equipped: true }
  }

  return base
}

export function getShopCategories() {
  return ['전체', ...Array.from(new Set(SHOP_ITEMS.map((item) => item.category)))]
}

export function getItemById(itemId) {
  return SHOP_ITEMS.find((item) => item.id === itemId)
}

export function getUserInventory(username) {
  return readInventory()
    .filter((item) => item.username === username)
    .map(normalizeOwnedItem)
    .sort((a, b) => new Date(a.purchasedAt) - new Date(b.purchasedAt))
}

export function getDecoratedItems(username) {
  return getRoomItems(username).slice(0, MAX_MINIHOME_ITEMS)
}

export function getRoomItems(username) {
  return getUserInventory(username).filter((ownedItem) => getItemById(ownedItem.itemId)?.displayType === 'room')
}

export function getActiveCharacter(username) {
  const characterItems = getUserInventory(username).filter((ownedItem) => getItemById(ownedItem.itemId)?.displayType === 'character')
  const active = [...characterItems].reverse().find((ownedItem) => ownedItem.equipped)
  const fallback = characterItems[characterItems.length - 1]
  const item = active ? getItemById(active.itemId) : fallback ? getItemById(fallback.itemId) : null

  return {
    ownedItem: active || fallback || null,
    item: item || { id: 'default_character', name: '기본 캐릭터', emoji: '🙂', displayType: 'character' },
  }
}

export function getEquippedItems(username) {
  const equippedList = getUserInventory(username).filter((ownedItem) => {
    const item = getItemById(ownedItem.itemId)
    return item?.displayType === 'equip' && ownedItem.equipped
  })

  return equippedList.reduce((acc, ownedItem) => {
    const item = getItemById(ownedItem.itemId)
    if (item?.slot) {
      acc[item.slot] = { ownedItem, item }
    }
    return acc
  }, {})
}

export function getInventoryCount(username) {
  return getUserInventory(username).length
}

export function getMaxMinihomeItems() {
  return MAX_MINIHOME_ITEMS
}

export function purchaseDotoriPack(user, packId) {
  const pack = DOTORI_PACKS.find((item) => item.id === packId)

  if (!pack) {
    throw new Error('존재하지 않는 도토리 상품입니다.')
  }

  const updatedUser = updateCurrentUserProfile({
    dotori: (user.dotori ?? 0) + pack.amount,
  })

  return {
    updatedUser,
    pack,
  }
}

export function purchaseShopItem(user, itemId) {
  const item = getItemById(itemId)

  if (!item) {
    throw new Error('존재하지 않는 아이템입니다.')
  }

  const inventory = readInventory()
  const userItems = inventory.filter((owned) => owned.username === user.username)

  if (userItems.length >= MAX_MINIHOME_ITEMS) {
    throw new Error(`미니홈피 아이템은 최대 ${MAX_MINIHOME_ITEMS}개까지만 보유할 수 있습니다.`)
  }

  if ((user.dotori ?? 0) < item.price) {
    throw new Error('도토리가 부족합니다.')
  }

  const ownedItem = {
    instanceId: `${item.id}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    username: user.username,
    itemId: item.id,
    purchasedAt: new Date().toISOString(),
    equipped: item.displayType === 'character' || item.displayType === 'equip',
    x: 14 + ((userItems.length * 17) % 70),
    y: 20 + ((userItems.length * 23) % 58),
  }

  let nextInventory = inventory

  if (item.displayType === 'character') {
    nextInventory = inventory.map((owned) => {
      if (owned.username !== user.username) return owned
      const ownedMeta = getItemById(owned.itemId)
      if (ownedMeta?.displayType !== 'character') return owned
      return { ...owned, equipped: false }
    })
  }

  if (item.displayType === 'equip' && item.slot) {
    nextInventory = nextInventory.map((owned) => {
      if (owned.username !== user.username) return owned
      const ownedMeta = getItemById(owned.itemId)
      if (ownedMeta?.displayType !== 'equip' || ownedMeta.slot !== item.slot) return owned
      return { ...owned, equipped: false }
    })
  }

  writeInventory([...nextInventory, ownedItem])

  const updatedUser = updateCurrentUserProfile({
    dotori: (user.dotori ?? 0) - item.price,
  })

  return {
    updatedUser,
    purchasedItem: item,
    ownedItem,
    inventory: getUserInventory(user.username),
  }
}

export function updateRoomItemPosition(username, instanceId, x, y) {
  const nextInventory = readInventory().map((ownedItem) => {
    if (ownedItem.username !== username || ownedItem.instanceId !== instanceId) {
      return ownedItem
    }

    return {
      ...ownedItem,
      x: Math.max(4, Math.min(96, Number(x))),
      y: Math.max(8, Math.min(92, Number(y))),
    }
  })

  writeInventory(nextInventory)
  return getUserInventory(username)
}

export function equipOwnedItem(username, instanceId) {
  const target = readInventory().find((ownedItem) => ownedItem.username === username && ownedItem.instanceId === instanceId)
  const item = target ? getItemById(target.itemId) : null

  if (!target || !item) {
    throw new Error('아이템을 찾을 수 없습니다.')
  }

  const nextInventory = readInventory().map((ownedItem) => {
    if (ownedItem.username !== username) return ownedItem
    const meta = getItemById(ownedItem.itemId)

    if (item.displayType === 'character' && meta?.displayType === 'character') {
      return { ...ownedItem, equipped: ownedItem.instanceId === instanceId }
    }

    if (item.displayType === 'equip' && meta?.displayType === 'equip' && meta.slot === item.slot) {
      return { ...ownedItem, equipped: ownedItem.instanceId === instanceId }
    }

    return ownedItem
  })

  writeInventory(nextInventory)
  return getUserInventory(username)
}

export function unequipOwnedItem(username, instanceId) {
  const nextInventory = readInventory().map((ownedItem) => {
    if (ownedItem.username === username && ownedItem.instanceId === instanceId) {
      return { ...ownedItem, equipped: false }
    }
    return ownedItem
  })
  writeInventory(nextInventory)
  return getUserInventory(username)
}

export function removeOwnedItem(username, instanceId) {
  const inventory = readInventory()
  const nextInventory = inventory.filter(
    (item) => !(item.username === username && item.instanceId === instanceId)
  )
  writeInventory(nextInventory)
  return getUserInventory(username)
}
