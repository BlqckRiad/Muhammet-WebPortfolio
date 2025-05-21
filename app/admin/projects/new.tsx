"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"

export default function NewProjectPage() {
  const router = useRouter()
  const [newProject, setNewProject] = useState<{
    title: string
    description: string
    image_url: string
    category: string
    technologies: string[]
    github_url: string
    project_url: string
  }>({
    title: '',
    description: '',
    image_url: '',
    category: '',
    technologies: [],
    github_url: '',
    project_url: ''
  })
  const [loading, setLoading] = useState(false)

  const handleAddProject = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetprojects')
      .insert([newProject])

    setLoading(false)
    if (error) {
      toast.error('Proje eklenirken bir hata oluştu')
      return
    }
    toast.success('Proje başarıyla eklendi')
    router.push('/admin/projects')
  }

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Yeni Proje Ekle</h1>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Başlık</Label>
          <Input
            id="title"
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Kategori</Label>
          <Input
            id="category"
            value={newProject.category}
            onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="technologies">Teknolojiler (virgülle ayırın)</Label>
          <Input
            id="technologies"
            value={newProject.technologies.join(', ')}
            onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value.split(',').map(t => t.trim()) })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            value={newProject.github_url}
            onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="project_url">Proje URL</Label>
          <Input
            id="project_url"
            value={newProject.project_url}
            onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Proje Görseli</Label>
          {!newProject.image_url ? (
            <ImageUpload
              onImageUploaded={(url) => setNewProject({ ...newProject, image_url: url })}
              aspectRatio={16 / 9}
            />
          ) : (
            <div className="mt-2 flex flex-col items-center gap-2">
              <img
                src={newProject.image_url}
                alt="Proje görseli"
                className="rounded-lg object-cover h-32 w-auto border"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setNewProject({ ...newProject, image_url: '' })}
              >
                Fotoğrafı Sil
              </Button>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => router.push('/admin/projects')}>
            İptal
          </Button>
          <Button onClick={handleAddProject} disabled={loading}>
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </div>
      </div>
    </div>
  )
} 