"use client"

import { useState } from "react"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ImageCropProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
}

export function ImageCrop({ imageUrl, onCropComplete, onCancel, aspectRatio = 16 / 9 }: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: (90 * aspectRatio),
    x: 5,
    y: 5
  })

  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null)

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): Promise<string> => {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width
    canvas.height = crop.height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Canvas is empty")
        }
        resolve(URL.createObjectURL(blob))
      }, "image/jpeg", 0.95)
    })
  }

  const handleCropComplete = async () => {
    if (imageRef && crop.width && crop.height) {
      try {
        const croppedImageUrl = await getCroppedImg(imageRef, crop)
        onCropComplete(croppedImageUrl)
      } catch (error) {
        console.error("Error cropping image:", error)
      }
    }
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Görseli Kırp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={aspectRatio}
              className="max-w-full"
            >
              <img
                ref={setImageRef}
                src={imageUrl}
                alt="Crop"
                className="max-w-full"
              />
            </ReactCrop>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button onClick={handleCropComplete}>
              Kırp ve Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 