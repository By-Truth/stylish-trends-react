import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { reviewsAdminApi } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { StarRating } from '../../components/ui/StarRating'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import type { Review } from '../../types'

export function Reviews() {
  const qc = useQueryClient()
  const { data: reviews, isLoading } = useQuery({ queryKey: ['admin-reviews'], queryFn: reviewsAdminApi.listAll })

  const moderate = useMutation({
    mutationFn: ({ id, approve }: { id: number; approve: boolean }) => reviewsAdminApi.moderate(id, approve),
    onSuccess: () => { toast.success('Updated'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }) },
  })
  const remove = useMutation({
    mutationFn: (id: number) => reviewsAdminApi.remove(id),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-reviews'] }) },
  })

  return (
    <div>
      <h2 className="mb-5 font-display text-2xl">Reviews</h2>
      {isLoading ? (
        <Spinner />
      ) : !reviews?.length ? (
        <EmptyState title="No reviews yet" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r: Review) => (
            <div key={r.id} className="card flex items-start justify-between gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold">{r.author_name}</p>
                  <StarRating rating={r.rating} size={12} />
                  <span className="text-xs text-ink-soft">{formatDate(r.created_at)}</span>
                  {!r.is_approved && (
                    <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[0.6rem] font-bold uppercase text-clay-dark">Pending</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink-soft">on {r.product_name}</p>
                {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 text-xs font-bold uppercase">
                {!r.is_approved && (
                  <button onClick={() => moderate.mutate({ id: r.id, approve: true })} className="text-moss">Approve</button>
                )}
                {!!r.is_approved && (
                  <button onClick={() => moderate.mutate({ id: r.id, approve: false })} className="text-ink-soft">Unpublish</button>
                )}
                <button onClick={() => confirm('Delete this review?') && remove.mutate(r.id)} className="text-rust">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
