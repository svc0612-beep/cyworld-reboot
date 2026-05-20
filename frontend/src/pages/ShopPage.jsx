import { useMemo, useRef, useState } from 'react'
import { addActivity, addNotification } from '../services/socialService.js'
import {
  DOTORI_PACKS,
  equipOwnedItem,
  getActiveCharacter,
  getEquippedItems,
  getInventoryCount,
  getItemById,
  getMaxMinihomeItems,
  getRoomItems,
  getShopCategories,
  getUserInventory,
  purchaseDotoriPack,
  purchaseShopItem,
  SHOP_ITEMS,
  unequipOwnedItem,
  updateRoomItemPosition,
} from '../services/shopService.js'

function CharacterPreview({ username }) {
  const activeCharacter = getActiveCharacter(username)
  const equipped = getEquippedItems(username)
  const characterId = activeCharacter.item.id || 'default_character'
  const characterClass = characterId.includes('girl') ? 'female' : characterId.includes('friend') ? 'friend' : 'male'
  const handItemId = equipped.hand?.item.id

  const hasGlasses = equipped.face?.item.id === 'glasses'
  const hasHeadphones = equipped.head?.item.id === 'headphones'
  const hasCamera = equipped.neck?.item.id === 'camera'
  const hasPhone = handItemId === 'galaxy_phone' || handItemId === 'iphone'
  const hasHairDryer = handItemId === 'hair_dryer'

  return (
    <div className="character-preview-card character-only-card">
      <div className="character-stage natural-character-stage">
        <div className={`mini-character ${characterClass}`} aria-label="캐릭터 미리보기">
          <div className="char-hair" />
          {hasHeadphones && <div className="char-headphones" title={equipped.head.item.name} />}
          <div className="char-head">
            <div className="char-eye left" />
            <div className="char-eye right" />
            <div className="char-mouth" />
            {hasGlasses && (
              <div className="char-glasses" title={equipped.face.item.name}>
                <span />
                <span />
              </div>
            )}
          </div>
          <div className="char-neck" />
          <div className="char-body-torso" />
          <div className="char-leg left" />
          <div className="char-leg right" />
          <div className="char-arm left" />
          <div className={hasPhone ? 'char-arm right phone-pose' : 'char-arm right'} />
          {hasCamera && <div className="char-camera" title={equipped.neck.item.name}>📷</div>}
          {hasPhone && <div className="char-phone-call" title={equipped.hand.item.name}>📱</div>}
          {hasHairDryer && <div className="char-hairdryer" title={equipped.hand.item.name}>💨</div>}
        </div>
      </div>
    </div>
  )
}

function RoomDecorator({ username, roomItems, onItemsChanged, compact = false }) {
  const stageRef = useRef(null)
  const [draggingId, setDraggingId] = useState(null)

  const moveItem = (event, instanceId) => {
    const stage = stageRef.current
    if (!stage) return

    const rect = stage.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const nextInventory = updateRoomItemPosition(username, instanceId, x, y)
    onItemsChanged(nextInventory)
  }

  return (
    <div
      ref={stageRef}
      className={compact ? 'miniroom-stage shop-miniroom-stage compact' : 'miniroom-stage shop-miniroom-stage'}
      onPointerMove={(event) => {
        if (!draggingId) return
        moveItem(event, draggingId)
      }}
      onPointerUp={() => setDraggingId(null)}
      onPointerLeave={() => setDraggingId(null)}
    >
      {roomItems.length === 0 ? (
        <div className="miniroom-empty">
          <strong>아직 배치된 방 아이템이 없습니다.</strong>
          <span>침대, 티비, 음식처럼 캐릭터보다 큰 아이템을 구매하면 이 공간에 배치됩니다.</span>
        </div>
      ) : (
        roomItems.map((ownedItem) => {
          const item = getItemById(ownedItem.itemId)
          if (!item) return null
          return (
            <button
              type="button"
              className={`miniroom-item draggable room-size-${item.size || 'small'} room-item-${item.id}`}
              key={ownedItem.instanceId}
              title={`${item.name} - 드래그해서 이동`}
              style={{ left: `${ownedItem.x}%`, top: `${ownedItem.y}%` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture?.(event.pointerId)
                setDraggingId(ownedItem.instanceId)
                moveItem(event, ownedItem.instanceId)
              }}
            >
              <span>{item.emoji}</span>
              <small>{item.name}</small>
            </button>
          )
        })
      )}
    </div>
  )
}

function ShopPage({ user, onUserUpdated, onGoMain, onGoMinihome, onLogout }) {
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [ownedItems, setOwnedItems] = useState(() => getUserInventory(user.username))
  const [message, setMessage] = useState('')

  const categories = useMemo(() => getShopCategories(), [])
  const maxItems = getMaxMinihomeItems()
  const inventoryCount = getInventoryCount(user.username)
  const roomItems = getRoomItems(user.username)

  const visibleItems = useMemo(() => {
    if (selectedCategory === '전체') return SHOP_ITEMS
    return SHOP_ITEMS.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  const refreshInventory = () => {
    setOwnedItems(getUserInventory(user.username))
  }

  const handleDotoriPurchase = (packId) => {
    try {
      const result = purchaseDotoriPack(user, packId)
      onUserUpdated(result.updatedUser)
      addActivity(user.username, `도토리 ${result.pack.amount}개를 구매했습니다.`, 'dotori')
      addNotification(user.username, `도토리 ${result.pack.amount}개가 충전되었습니다.`, 'dotori')
      setMessage(`${result.pack.label}가 충전되었습니다. 현재는 실제 결제가 아닌 로컬 테스트 구매입니다.`)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handlePurchase = (itemId) => {
    try {
      const result = purchaseShopItem(user, itemId)
      setOwnedItems(result.inventory)
      onUserUpdated(result.updatedUser)

      const typeText = result.purchasedItem.displayType === 'room'
        ? '미니홈피 장식 공간에 배치되었습니다.'
        : '캐릭터에게 자동 장착되었습니다.'

      addActivity(user.username, `도토리 상점에서 “${result.purchasedItem.name}” 아이템을 구매했습니다.`, 'shop')
      addNotification(user.username, `“${result.purchasedItem.name}” 아이템이 ${typeText}`, 'shop')
      setMessage(`“${result.purchasedItem.name}” 구매 완료! ${typeText}`)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleEquip = (instanceId) => {
    try {
      setOwnedItems(equipOwnedItem(user.username, instanceId))
      setMessage('아이템을 캐릭터에게 장착했습니다.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleUnequip = (instanceId) => {
    setOwnedItems(unequipOwnedItem(user.username, instanceId))
    setMessage('아이템 장착을 해제했습니다.')
  }

  return (
    <main className="main-shell">
      <header className="main-header">
        <div>
          <p className="eyebrow">DOTORI SHOP</p>
          <h1>도토리 상점</h1>
          <p className="page-description">캐릭터 장착품은 캐릭터에게, 큰 소품은 미니홈피 장식 공간에 배치됩니다.</p>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={onGoMain}>메인으로</button>
          <button className="secondary-button" onClick={onGoMinihome}>내 미니홈피</button>
          <button className="secondary-button" onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <section className="shop-summary-grid">
        <article className="info-card shop-balance-card">
          <h3>보유 도토리</h3>
          <p className="dotori-count">{user.dotori}개</p>
          <small>지금은 실제 결제 전 단계라 로컬 테스트 충전으로 동작합니다.</small>
        </article>

        <article className="info-card">
          <h3>보유 아이템</h3>
          <p className="shop-count-text">{inventoryCount} / {maxItems}개</p>
          <small>전체 아이템은 최대 20개까지 보유하도록 제한했습니다.</small>
        </article>
      </section>

      {message && <div className="shop-message">{message}</div>}

      <section className="dotori-pack-section">
        <div className="section-title-row">
          <div>
            <h3>도토리 구매</h3>
            <p className="miniroom-help">실제 결제는 나중에 붙이고, 지금은 기능 확인용으로 도토리가 충전됩니다.</p>
          </div>
        </div>

        <div className="dotori-pack-grid">
          {DOTORI_PACKS.map((pack) => (
            <article className="dotori-pack-card" key={pack.id}>
              <div className="dotori-pack-icon">🌰</div>
              <div>
                <h3>{pack.label}</h3>
                <p>{pack.description}</p>
                <strong>{pack.priceText}</strong>
              </div>
              <button className="primary-button" onClick={() => handleDotoriPurchase(pack.id)}>
                구매하기
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="decorator-section">
        <div className="section-title-row">
          <div>
            <h3>내 미니홈피 꾸미기 미리보기</h3>
            <p className="miniroom-help">캐릭터 장착품은 캐릭터에 표시되고, 방 아이템은 아래 공간에서 드래그해 자유롭게 이동할 수 있습니다.</p>
          </div>
          <button className="small-button" onClick={onGoMinihome}>미니홈피에서 보기</button>
        </div>

        <div className="decorator-preview-grid">
          <CharacterPreview username={user.username} inventory={ownedItems} />
          <RoomDecorator username={user.username} roomItems={roomItems} onItemsChanged={refreshInventory} compact />
        </div>
      </section>

      <section className="owned-items-section">
        <h3>내가 보유한 캐릭터/장착품</h3>
        <div className="owned-equip-list">
          {ownedItems.filter((owned) => ['character', 'equip'].includes(getItemById(owned.itemId)?.displayType)).length === 0 ? (
            <p className="empty-text">아직 캐릭터나 장착품이 없습니다.</p>
          ) : (
            ownedItems
              .filter((owned) => ['character', 'equip'].includes(getItemById(owned.itemId)?.displayType))
              .map((owned) => {
                const item = getItemById(owned.itemId)
                return (
                  <article className="owned-equip-card" key={owned.instanceId}>
                    <span>{item.emoji}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.displayType === 'character' ? '캐릭터' : `장착 부위: ${item.slot}`}</small>
                    </div>
                    {owned.equipped ? (
                      <button className="tiny-button" onClick={() => handleUnequip(owned.instanceId)}>해제</button>
                    ) : (
                      <button className="tiny-button" onClick={() => handleEquip(owned.instanceId)}>장착</button>
                    )}
                  </article>
                )
              })
          )}
        </div>
      </section>

      <section className="shop-layout">
        <aside className="shop-sidebar">
          <h3>카테고리</h3>
          <div className="shop-category-list">
            {categories.map((category) => (
              <button
                key={category}
                className={category === selectedCategory ? 'category-button active' : 'category-button'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <section className="shop-items-grid">
          {visibleItems.map((item) => (
            <article className="shop-item-card" key={item.id}>
              <div className={`mini-item-preview item-kind-${item.displayType}`} aria-hidden="true">{item.emoji}</div>
              <div className="shop-item-info">
                <p className="shop-item-category">{item.category}</p>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <strong>{item.price} 도토리</strong>
                <small className="item-placement-note">
                  {item.displayType === 'room' ? '구매 후 방 장식 공간에 배치' : '구매 후 캐릭터에게 장착'}
                </small>
              </div>
              <button
                className="primary-button"
                onClick={() => handlePurchase(item.id)}
                disabled={user.dotori < item.price || ownedItems.length >= maxItems}
              >
                구매하기
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default ShopPage
