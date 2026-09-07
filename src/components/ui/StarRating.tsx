export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [0, 1, 2, 3, 4]
  return (
    <span className="inline-flex items-center gap-0.5" style={{ fontSize: size }}>
      {stars.map((i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? '#a8542b' : '#e4dccb' }}>
          ★
        </span>
      ))}
    </span>
  )
}
