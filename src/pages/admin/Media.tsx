import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { mediaApi } from '../../lib/api'
import { Spinner, EmptyState } from '../../components/ui/Spinner'
import type { MediaFile } from '../../types'

export function Media() {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const { data: files, isLoading } = useQuery({ queryKey: ['media'], queryFn: mediaApi.list })

  const removeMutation = useMutation({
    mutationFn: (name: string) => mediaApi.remove(name),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['media'] }) },
  })

  async function handleUpload(fileList: FileList | null) {
    if (!fileList?.length) return
    setUploading(true)
    try {
      for (const file of Array.from(fileList)) {
        await mediaApi.upload(file)
      }
      toast.success('Uploaded')
      qc.invalidateQueries({ queryKey: ['media'] })
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(window.location.origin + url)
    toast.success('URL copied')
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-2xl">Media Library</h2>
        <label className="btn-primary cursor-pointer">
          {uploading ? 'Uploading…' : '+ Upload Images'}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !files?.length ? (
        <EmptyState title="No media yet" subtitle="Upload product photos, hero images, and more." />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {files.map((f: MediaFile) => (
            <div key={f.name} className="group relative aspect-square overflow-hidden border border-line bg-sand">
              <img src={f.url} className="h-full w-full object-cover" alt={f.name} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyUrl(f.url)} className="text-[0.65rem] font-bold uppercase text-white">Copy URL</button>
                <button onClick={() => confirm('Delete this image?') && removeMutation.mutate(f.name)} className="text-[0.65rem] font-bold uppercase text-rust">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
