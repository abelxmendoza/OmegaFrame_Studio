import { supabase } from './client'

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

export async function uploadFileWithMetadata(
  bucket: string,
  path: string,
  file: File | Blob,
  metadata?: Record<string, string>
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file instanceof File ? file.type : 'application/octet-stream',
  })

  if (error) throw error

  // Update metadata if provided
  if (metadata) {
    await supabase.storage.from(bucket).update(path, file, {
      upsert: true,
      contentType: file instanceof File ? file.type : 'application/octet-stream',
    })
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return publicUrl
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
