'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './styles.module.css'

interface RoomClientProps {
  data: any
  id: string
}

export default function RoomClient({ data, id }: RoomClientProps) {
  const images = data.images && data.images.length > 0
    ? data.images
    : (data.imageUrl ? [{ fileUrl: data.imageUrl, id: 'main' }] : [])

  const [activeImage, setActiveImage] = useState(images[0]?.fileUrl || '')
  const [activeIdx, setActiveIdx] = useState(0)
  const searchParams = useSearchParams()
  
  // Giải mã SĐT từ Base64 (nếu có)
  const encoded = searchParams.get('p')
  const [sharedPhone, setSharedPhone] = useState<string | null>(null)

  useEffect(() => {
    if (encoded) {
      try {
        const decoded = atob(encoded);
        setSharedPhone(decoded);
        
        // Tự động xóa tham số p khỏi thanh địa chỉ để bảo mật và sạch sẽ
        const url = new URL(window.location.href);
        url.searchParams.delete('p');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.error('Lỗi giải mã số điện thoại', e);
      }
    }
  }, [encoded])

  const formatPrice = (price: any) =>
    Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

  const handleThumb = (url: string, idx: number) => {
    setActiveImage(url)
    setActiveIdx(idx)
  }

  const includedFurnitures = data.furnitures?.filter((f: any) => f.category === 'INCLUDED') ?? []
  const paidFurnitures = data.furnitures?.filter((f: any) => f.category === 'PAID') ?? []

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="https://ezhouse.vn/wp-content/uploads/2023/12/logo-ezhouse_Logo-Ezhouse-Color-Horizontal.svg" alt="ezhouse logo" className={styles.logoImage} />
        </div>
        <div className={`${styles.headerBadge} ${styles[data.status] || ''}`}>
          {data.status === 'AVAILABLE'
            ? 'Đang trống'
            : data.status === 'AVAILABLE_SOON'
              ? 'Sắp trống'
              : data.status === 'OCCUPIED'
                ? 'Đang có người thuê'
                : 'Đang cho thuê'}
        </div>
      </header>

      <main className={styles.main}>

        {/* ── Gallery ── */}
        <div className={styles.galleryWrapper}>
          <div className={styles.mainImageContainer}>
            {activeImage ? (
              <img
                src={activeImage}
                alt={data.title}
                className={styles.activeImage}
              />
            ) : (
              <div className={styles.placeholderImage}>Không có hình ảnh</div>
            )}
            {images.length > 1 && (
              <div className={styles.imageCount}>
                {activeIdx + 1} / {images.length}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className={styles.thumbnailList}>
              {images.map((img: any, index: number) => (
                <div
                  key={img.id || index}
                  className={`${styles.thumbnailItem} ${activeImage === img.fileUrl ? styles.thumbnailActive : ''}`}
                  onClick={() => handleThumb(img.fileUrl, index)}
                >
                  <img src={img.fileUrl} alt={data.title} className={styles.thumbnailImage} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className={styles.infoSection}>

          {/* Room code pill */}
          <div className={styles.roomCodePill}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="4" height="4" rx="1" />
              <rect x="7" y="1" width="4" height="4" rx="1" />
              <rect x="1" y="7" width="4" height="4" rx="1" />
              <rect x="7" y="7" width="4" height="4" rx="1" />
            </svg>
            {data.roomCode}
          </div>

          <h1 className={styles.title}>{data.title}</h1>

          {data.description && (
            <p className={styles.description}>{data.description}</p>
          )}

          {/* Price Banner */}
          <div className={styles.priceBanner}>
            <div className={styles.priceLeft}>
              <div className={styles.priceLabel}>Giá thuê hàng tháng</div>
              <div className={styles.priceValue}>
                {formatPrice(data.price)}
                <span className={styles.priceUnit}>/tháng</span>
              </div>
            </div>
            <div className={styles.priceRight}>
              <div className={styles.priceRightLabel}>Mã phòng</div>
              <div className={styles.priceRightValue}>{data.roomCode}</div>
            </div>
          </div>

          {/* Address Block — nổi bật */}
          {(data.address || data.location || data.ward || data.district || data.city) && (
            <div className={styles.addressBlock}>
              <div className={styles.addressIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div className={styles.addressContent}>
                <div className={styles.addressLabel}>Địa chỉ</div>
                <div className={styles.addressText}>
                  {[data.address, data.ward, data.district].filter(Boolean).join(', ')}
                </div>
                {data.city && (
                  <div className={styles.addressSub}>{data.city}</div>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          {(includedFurnitures.length > 0 || paidFurnitures.length > 0) && (
            <div className={styles.divider}>
              <div className={styles.dividerLine} />
              <div className={styles.dividerLabel}>Nội thất phòng</div>
              <div className={styles.dividerLine} />
            </div>
          )}

          {/* Included furniture */}
          {includedFurnitures.length > 0 && (
            <div className={styles.furnitureSection}>
              <div className={styles.sectionHeader}>
                <div className={`${styles.sectionIcon} ${styles.sectionIconGreen}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={styles.sectionLabel}>Nội thất có sẵn (miễn phí)</span>
              </div>
              <div className={styles.furnitureGrid}>
                {includedFurnitures.map((f: any) => (
                  <div key={f.id} className={styles.furnitureItem}>
                    {f.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paid furniture */}
          {paidFurnitures.length > 0 && (
            <div className={styles.furnitureSection}>
              <div className={styles.sectionHeader}>
                <div className={`${styles.sectionIcon} ${styles.sectionIconAmber}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <span className={styles.sectionLabel}>Nội thất tính phí riêng</span>
              </div>
              <div className={styles.furnitureGridPaid}>
                {paidFurnitures.map((f: any) => (
                  <div key={f.id} className={styles.furnitureItemPaid}>
                    <span className={styles.furnitureName}>{f.name}</span>
                    <span className={styles.furniturePrice}>{formatPrice(f.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className={styles.actions}>
            <div className={styles.contactCard}>
              <div className={styles.contactHeader}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span className={styles.contactLabel}>Liên hệ thuê phòng</span>
              </div>
              <div className={styles.contactPhone}>{sharedPhone || '0901 222 333'}</div>
            </div>
            <div className={styles.ctaNote}>Phản hồi trong vòng 30 phút · Xem phòng miễn phí</div>
          </div>

        </div>
      </main>
    </div>
  )
}