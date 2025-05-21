"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ImageCrop } from "@/components/image-crop"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  aspectRatio?: number
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function ImageUpload({ onImageUploaded, aspectRatio = 16 / 9 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Dosya boyutu 2MB\'dan küçük olmalıdır')
      return
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Sadece JPG, PNG ve WEBP formatları desteklenmektedir')
      return
    }

    // Geçici URL oluştur
    const tempUrl = URL.createObjectURL(file)
    setTempImageUrl(tempUrl)
  }

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setUploading(true)

      // Blob URL'den dosyayı al
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" })

      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('muhammetimages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('muhammetimages')
        .getPublicUrl(filePath)

      onImageUploaded(publicUrl)
      toast.success('Görsel başarıyla yüklendi')
      setTempImageUrl(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Görsel yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="image-upload"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-accent/50"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Görsel yüklemek için tıklayın</span>
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG veya WEBP (MAX. 2MB)
          </p>
        </div>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </label>
      {uploading && (
        <div className="mt-4">
          <Button disabled>
            Yükleniyor...
          </Button>
        </div>
      )}
      {tempImageUrl && (
        <ImageCrop
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setTempImageUrl(null)}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  )
} 