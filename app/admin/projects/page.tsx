"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Github, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/image-upload"
import { toast } from "sonner"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Project {
  id: number
  title: string
  description: string
  image_url: string
  category: string
  technologies: string[]
  github_url: string
  project_url: string
  created_at: string
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    image_url: '',
    category: '',
    technologies: [],
    github_url: '',
    project_url: ''
  })

  const fetchProjects = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('muhammetprojects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Projeler yüklenirken bir hata oluştu')
      return
    }

    setProjects(data || [])
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleAddProject = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetprojects')
      .insert([newProject])

    if (error) {
      toast.error('Proje eklenirken bir hata oluştu')
      return
    }

    toast.success('Proje başarıyla eklendi')
    setIsDialogOpen(false)
    setNewProject({
      title: '',
      description: '',
      image_url: '',
      category: '',
      technologies: [],
      github_url: '',
      project_url: ''
    })
    fetchProjects()
  }

  const handleEditProject = async () => {
    if (!editingProject) return

    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetprojects')
      .update(newProject)
      .eq('id', editingProject.id)

    if (error) {
      toast.error('Proje güncellenirken bir hata oluştu')
      return
    }

    toast.success('Proje başarıyla güncellendi')
    setIsDialogOpen(false)
    setEditingProject(null)
    setNewProject({
      title: '',
      description: '',
      image_url: '',
      category: '',
      technologies: [],
      github_url: '',
      project_url: ''
    })
    fetchProjects()
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetprojects')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Proje silinirken bir hata oluştu')
      return
    }

    toast.success('Proje başarıyla silindi')
    fetchProjects()
  }

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setNewProject(project)
    } else {
      setEditingProject(null)
      setNewProject({
        title: '',
        description: '',
        image_url: '',
        category: '',
        technologies: [],
        github_url: '',
        project_url: ''
      })
    }
    setIsDialogOpen(true)
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projeler</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Proje
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {project.title}
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(project)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{project.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <span key={tech} className="text-xs bg-secondary px-2 py-1 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {project.github_url && (
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              )}
              {project.project_url && (
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Canlı Demo
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl" aria-describedby="new-project-desc">
          <DialogHeader>
            <DialogTitle>Yeni Proje</DialogTitle>
            <DialogDescription id="new-project-desc">
              Yeni bir proje eklemek için bilgileri doldurun ve görsel yükleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row gap-8 mt-4 overflow-x-auto min-w-[600px]">
            {/* Sol: Fotoğraf alanı */}
            <div className="flex-1 flex flex-col items-center justify-center border-r pr-8 min-w-[280px] max-w-[320px]">
              {!newProject.image_url ? (
                <ImageUpload
                  onImageUploaded={(url) => setNewProject({ ...newProject, image_url: url })}
                  aspectRatio={16 / 9}
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={newProject.image_url}
                    alt="Proje görseli"
                    className="rounded-lg object-cover h-40 w-auto border"
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
            {/* Sağ: Bilgi alanları */}
            <div className="flex-1 flex flex-col gap-4 min-w-[320px] max-w-[420px]">
              <div className="grid gap-2">
                <Label htmlFor="title">Başlık Ekle</Label>
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
                <Label htmlFor="technolojiler">Teknolojiler (virgülle ayırın)</Label>
                <Input
                  id="technolojiler"
                  value={newProject.technologies?.join(', ')}
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
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddProject}>
                  Ekle
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 