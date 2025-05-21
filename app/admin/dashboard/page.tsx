"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code2, PenTool, Server, Moon, Sun, Upload } from "lucide-react"
import { useTheme } from "next-themes"
import { ImageUpload } from "@/components/image-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Icon seçenekleri
const iconOptions = [
  { value: 'Code2', label: 'Code', icon: Code2 },
  { value: 'PenTool', label: 'Design', icon: PenTool },
  { value: 'Server', label: 'Server', icon: Server }
]

// Message interface for the tab
interface Message {
  id: string
  name: string
  email: string
  message: string
  is_processed: boolean
  created_at: string
}

// Add helper for inserting at cursor
function insertAtCursor(text: string, insert: string, setText: (val: string) => void, textareaId: string) {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = text.substring(0, start)
  const after = text.substring(end)
  setText(before + insert + after)
  setTimeout(() => {
    textarea.focus()
    textarea.selectionStart = textarea.selectionEnd = start + insert.length
  }, 0)
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("blog")
  const [blogPosts, setBlogPosts] = useState([])
  const [projects, setProjects] = useState([])
  const [infos, setInfos] = useState<any>({})
  const [skills, setSkills] = useState([])
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  // Yeni skill ve deneyim için state'ler
  const [newSkill, setNewSkill] = useState({ name: '', category: '', icon: '' })
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    description: '',
    start_date: '',
    end_date: ''
  })

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    image_url: '',
    project_url: '',
    github_url: '',
    category: '',
    technologies: ''
  })

  const [messages, setMessages] = useState<Message[]>([])
  const [messageFilter, setMessageFilter] = useState<"all" | "processed" | "unprocessed">("all")
  const [messageSearch, setMessageSearch] = useState("")
  const [messagesLoading, setMessagesLoading] = useState(false)

  // Blog modal state
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false)
  const [editingBlog, setEditingBlog] = useState<any>(null)
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    mini_description: '',
    description: '',
    image_url: '',
    category: '',
    read_time: ''
  })

  useEffect(() => {
    // Admin kontrolü
    const isAdmin = localStorage.getItem('admin')
    if (!isAdmin) {
      router.push('/admin')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    const supabase = createClient()
    
    const [blogResponse, projectsResponse, infosResponse, skillsResponse, experiencesResponse] = await Promise.all([
      supabase.from('muhammetblogs').select('*').order('created_at', { ascending: false }),
      supabase.from('muhammetprojects').select('*').order('created_at', { ascending: false }),
      supabase.from('muhammetinfos').select('*').single(),
      supabase.from('muhammetskills').select('*').order('created_at', { ascending: false }),
      supabase.from('muhammetdeneyim').select('*').order('start_date', { ascending: false })
    ])

    setBlogPosts(blogResponse.data || [])
    setProjects(projectsResponse.data || [])
    setInfos(infosResponse.data || {})
    setSkills(skillsResponse.data || [])
    setExperiences(experiencesResponse.data || [])
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    router.push('/admin')
  }

  const handleInfoUpdate = async (field: string, value: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('muhammetinfos')
        .update({ [field]: value })
        .eq('id', infos.id)

      if (error) throw error

      toast.success(`${field} başarıyla güncellendi`)
      fetchData() // Verileri yenile
    } catch (error) {
      toast.error('Güncelleme sırasında bir hata oluştu')
    }
  }

  const handleAddSkill = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('muhammetskills')
        .insert([newSkill])

      if (error) throw error

      toast.success('Yetenek başarıyla eklendi')
      setNewSkill({ name: '', category: '', icon: '' })
      fetchData()
    } catch (error) {
      toast.error('Yetenek eklenirken bir hata oluştu')
    }
  }

  const handleDeleteSkill = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('muhammetskills')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Yetenek başarıyla silindi')
      fetchData()
    } catch (error) {
      toast.error('Yetenek silinirken bir hata oluştu')
    }
  }

  const handleAddExperience = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('muhammetdeneyim')
        .insert([newExperience])

      if (error) throw error

      toast.success('Deneyim başarıyla eklendi')
      setNewExperience({
        title: '',
        company: '',
        description: '',
        start_date: '',
        end_date: ''
      })
      fetchData()
    } catch (error) {
      toast.error('Deneyim eklenirken bir hata oluştu')
    }
  }

  const handleDeleteExperience = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('muhammetdeneyim')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Deneyim başarıyla silindi')
      fetchData()
    } catch (error) {
      toast.error('Deneyim silinirken bir hata oluştu')
    }
  }

  const handleAddProject = async () => {
    const supabase = createClient()
    const projectToInsert = {
      ...newProject,
      category: newProject.category || '',
      technologies: Array.isArray(newProject.technologies)
        ? newProject.technologies
        : typeof newProject.technologies === 'string'
          ? newProject.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
          : []
    }
    const { error } = await supabase
      .from('muhammetprojects')
      .insert([projectToInsert])

    if (error) {
      toast.error('Proje eklenirken bir hata oluştu')
      return
    }

    toast.success('Proje başarıyla eklendi')
    setIsProjectDialogOpen(false)
    setNewProject({
      title: '',
      description: '',
      image_url: '',
      project_url: '',
      github_url: '',
      category: '',
      technologies: ''
    })
    fetchData()
  }

  const handleEditProject = async () => {
    if (!editingProject) return

    const supabase = createClient()
    const projectToUpdate = {
      ...editingProject,
      category: editingProject.category || '',
      technologies: Array.isArray(editingProject.technologies)
        ? editingProject.technologies
        : typeof editingProject.technologies === 'string'
          ? editingProject.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
          : []
    }
    const { error } = await supabase
      .from('muhammetprojects')
      .update(projectToUpdate)
      .eq('id', editingProject.id)

    if (error) {
      toast.error('Proje güncellenirken bir hata oluştu')
      return
    }

    toast.success('Proje başarıyla güncellendi')
    setIsProjectDialogOpen(false)
    setEditingProject(null)
    setNewProject({
      title: '',
      description: '',
      image_url: '',
      project_url: '',
      github_url: '',
      category: '',
      technologies: ''
    })
    fetchData()
  }

  const handleDeleteProject = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('muhammetprojects')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Proje başarıyla silindi')
      fetchData()
    } catch (error) {
      toast.error('Proje silinirken bir hata oluştu')
    }
  }

  // CV upload handler
  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Sadece PDF dosyası yükleyebilirsiniz.')
      return
    }
    const supabase = createClient()
    const fileName = `cv_${Date.now()}.pdf`
    const { error } = await supabase.storage.from('muhammetimages').upload(fileName, file, { upsert: true })
    if (error) {
      toast.error('CV yüklenirken hata oluştu')
      return
    }
    const { data } = supabase.storage.from('muhammetimages').getPublicUrl(fileName)
    setInfos((prev: any) => ({ ...prev, cv_url: data.publicUrl }))
    toast.success('CV başarıyla yüklendi')
  }

  const fetchMessages = async () => {
    setMessagesLoading(true)
    const supabase = createClient()
    let query = supabase.from('muhammetcontact').select('*').order('created_at', { ascending: false })
    if (messageFilter === "processed") query = query.eq('is_processed', true)
    if (messageFilter === "unprocessed") query = query.eq('is_processed', false)
    const { data, error } = await query
    if (!error) setMessages(data || [])
    setMessagesLoading(false)
  }

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line
  }, [messageFilter])

  const handleToggleProcessed = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetcontact')
      .update({ is_processed: !current })
      .eq('id', id)
    if (!error) fetchMessages()
  }

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(messageSearch.toLowerCase()) ||
    m.message.toLowerCase().includes(messageSearch.toLowerCase())
  )

  const fetchBlogs = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('muhammetblogs')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setBlogPosts(data || [])
  }

  const handleAddBlog = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetblogs')
      .insert([{ ...newBlog }])
    if (error) {
      toast.error('Blog eklenirken hata oluştu')
      return
    }
    toast.success('Blog başarıyla eklendi')
    setIsBlogDialogOpen(false)
    setNewBlog({
      title: '', slug: '', mini_description: '', description: '', image_url: '', category: '', read_time: ''
    })
    fetchBlogs()
  }

  const handleEditBlog = async () => {
    if (!editingBlog) return
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetblogs')
      .update({ ...editingBlog })
      .eq('id', editingBlog.id)
    if (error) {
      toast.error('Blog güncellenirken hata oluştu')
      return
    }
    toast.success('Blog başarıyla güncellendi')
    setIsBlogDialogOpen(false)
    setEditingBlog(null)
    setNewBlog({
      title: '', slug: '', mini_description: '', description: '', image_url: '', category: '', read_time: ''
    })
    fetchBlogs()
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return
    const supabase = createClient()
    const { error } = await supabase
      .from('muhammetblogs')
      .delete()
      .eq('id', id)
    if (error) {
      toast.error('Blog silinirken hata oluştu')
      return
    }
    toast.success('Blog başarıyla silindi')
    fetchBlogs()
  }

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="blog">Blog Yazıları</TabsTrigger>
          <TabsTrigger value="projects">Projeler</TabsTrigger>
          <TabsTrigger value="infos">İletişim Bilgileri</TabsTrigger>
          <TabsTrigger value="skills">Yetenekler</TabsTrigger>
          <TabsTrigger value="experiences">Deneyimler</TabsTrigger>
          <TabsTrigger value="messages">Mesajlar</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Blog Yazıları</CardTitle>
              <Button onClick={() => {
                setEditingBlog(null)
                setNewBlog({ title: '', slug: '', mini_description: '', description: '', image_url: '', category: '', read_time: '' })
                setIsBlogDialogOpen(true)
              }}>
                Yeni Blog Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blogPosts.map((post: any) => (
                  <div key={post.id} className="border p-4 rounded-lg">
                    <div className="flex items-start gap-4">
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <div className="text-xs text-muted-foreground">{post.category} • {post.read_time}</div>
                        <p className="text-sm text-muted-foreground mt-1">{post.mini_description}</p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingBlog(post)
                              setIsBlogDialogOpen(true)
                            }}
                          >Düzenle</Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBlog(post.id)}
                          >Sil</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projeler</CardTitle>
              <Button onClick={() => {
                setEditingProject(null)
                setNewProject({
                  title: '',
                  description: '',
                  image_url: '',
                  project_url: '',
                  github_url: '',
                  category: '',
                  technologies: ''
                })
                setIsProjectDialogOpen(true)
              }}>
                Yeni Proje Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project: any) => (
                  <div key={project.id} className="border p-4 rounded-lg">
                    <div className="flex items-start gap-4">
                      {project.image_url && (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProject({
                                ...project,
                                technologies: project.technologies.join(', ')
                              })
                              setIsProjectDialogOpen(true)
                            }}
                          >
                            Düzenle
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infos">
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        value={infos.email || ''}
                        onChange={(e) => setInfos({ ...infos, email: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('email', infos.email)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        value={infos.phone || ''}
                        onChange={(e) => setInfos({ ...infos, phone: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('phone', infos.phone)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adres</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="address"
                        value={infos.address || ''}
                        onChange={(e) => setInfos({ ...infos, address: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('address', infos.address)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="github_url"
                        value={infos.github_url || ''}
                        onChange={(e) => setInfos({ ...infos, github_url: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('github_url', infos.github_url)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="linkedin_url"
                        value={infos.linkedin_url || ''}
                        onChange={(e) => setInfos({ ...infos, linkedin_url: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('linkedin_url', infos.linkedin_url)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter_url">Twitter URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="twitter_url"
                        value={infos.twitter_url || ''}
                        onChange={(e) => setInfos({ ...infos, twitter_url: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('twitter_url', infos.twitter_url)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="instagram_url"
                        value={infos.instagram_url || ''}
                        onChange={(e) => setInfos({ ...infos, instagram_url: e.target.value })}
                      />
                      <Button 
                        onClick={() => handleInfoUpdate('instagram_url', infos.instagram_url)}
                        variant="outline"
                      >
                        Kaydet
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv_url">CV (PDF)</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        id="cv_url"
                        type="file"
                        accept="application/pdf"
                        onChange={handleCvUpload}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-primary hover:file:bg-accent"
                      />
                      <Button
                        onClick={() => handleInfoUpdate('cv_url', infos.cv_url)}
                        variant="outline"
                        disabled={!infos.cv_url}
                      >
                        Kaydet
                      </Button>
                    </div>
                    {infos.cv_url && (
                      <a href={infos.cv_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm mt-1 inline-block">CV'yi Görüntüle</a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Yetenekler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold">Yeni Yetenek Ekle</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skill-name">Yetenek Adı</Label>
                      <Input
                        id="skill-name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skill-category">Kategori</Label>
                      <Input
                        id="skill-category"
                        value={newSkill.category}
                        onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>İkon</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {iconOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={newSkill.icon === option.value ? "default" : "outline"}
                            className="flex flex-col items-center gap-2 h-auto py-4"
                            onClick={() => setNewSkill({ ...newSkill, icon: option.value })}
                          >
                            <option.icon className="h-6 w-6" />
                            <span className="text-sm">{option.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleAddSkill}>Yetenek Ekle</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {skills.map((skill: any) => {
                    const IconComponent = iconOptions.find(opt => opt.value === skill.icon)?.icon || Code2
                    return (
                      <div key={skill.id} className="border p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5" />
                          <span className="font-semibold">{skill.name}</span>
                          <span className="text-sm text-muted-foreground">({skill.category})</span>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSkill(skill.id)}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experiences">
          <Card>
            <CardHeader>
              <CardTitle>Deneyimler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border p-4 rounded-lg space-y-4">
                  <h3 className="font-semibold">Yeni Deneyim Ekle</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exp-title">Pozisyon</Label>
                      <Input
                        id="exp-title"
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-company">Şirket</Label>
                      <Input
                        id="exp-company"
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exp-description">Açıklama</Label>
                      <Textarea
                        id="exp-description"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="exp-start">Başlangıç Tarihi</Label>
                        <Input
                          id="exp-start"
                          type="date"
                          value={newExperience.start_date}
                          onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="exp-end">Bitiş Tarihi</Label>
                        <Input
                          id="exp-end"
                          type="date"
                          value={newExperience.end_date}
                          onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddExperience}>Deneyim Ekle</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {experiences.map((exp: any) => (
                    <div key={exp.id} className="border p-4 rounded-lg">
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} • {new Date(exp.start_date).toLocaleDateString('tr-TR')} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString('tr-TR') : 'Günümüz'}
                      </p>
                      <p className="mt-2 text-sm">{exp.description}</p>
                      <div className="mt-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteExperience(exp.id)}
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Mesajlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Ara..."
                    value={messageSearch}
                    onChange={e => setMessageSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button variant={messageFilter === "all" ? "default" : "outline"} onClick={() => setMessageFilter("all")}>Tümü</Button>
                  <Button variant={messageFilter === "unprocessed" ? "default" : "outline"} onClick={() => setMessageFilter("unprocessed")}>İlgilenilmedi</Button>
                  <Button variant={messageFilter === "processed" ? "default" : "outline"} onClick={() => setMessageFilter("processed")}>İlgilenildi</Button>
                </div>
              </div>
              {messagesLoading ? (
                <div>Yükleniyor...</div>
              ) : filteredMessages.length === 0 ? (
                <div>Hiç mesaj yok.</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMessages.map(msg => (
                    <Card key={msg.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{msg.name}</span>
                          <Badge variant={msg.is_processed ? "success" : "destructive"}>
                            {msg.is_processed ? "İlgilenildi" : "İlgilenilmedi"}
                          </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">{msg.email}</div>
                        <div className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString('tr-TR')}</div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 whitespace-pre-line">{msg.message}</p>
                        <Button
                          variant={msg.is_processed ? "outline" : "default"}
                          onClick={() => handleToggleProcessed(msg.id, msg.is_processed)}
                        >
                          {msg.is_processed ? "İlgilenilmedi olarak işaretle" : "İlgilenildi olarak işaretle"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-row gap-8 mt-4 overflow-x-auto min-w-[600px]">
            {/* Sol: Fotoğraf alanı */}
            <div className="flex-1 flex flex-col items-center justify-center border-r pr-8 min-w-[280px] max-w-[320px]">
              <Label>Proje Görseli</Label>
              <ImageUpload
                onImageUploaded={(url) => {
                  if (editingProject) {
                    setEditingProject({ ...editingProject, image_url: url })
                  } else {
                    setNewProject({ ...newProject, image_url: url })
                  }
                }}
                aspectRatio={16 / 9}
              />
              {(editingProject?.image_url || newProject.image_url) && (
                <img
                  src={editingProject?.image_url || newProject.image_url}
                  alt="Proje görseli"
                  className="mt-2 rounded-lg object-cover h-40 w-auto border"
                />
              )}
            </div>
            {/* Sağ: Bilgi alanları */}
            <div className="flex-1 flex flex-col gap-4 min-w-[320px] max-w-[420px]">
              <div className="grid gap-2">
                <Label htmlFor="project-title">Proje Adı</Label>
                <Input
                  id="project-title"
                  value={editingProject?.title || newProject.title}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, title: e.target.value })
                    } else {
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Açıklama</Label>
                <Textarea
                  id="project-description"
                  value={editingProject?.description || newProject.description}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, description: e.target.value })
                    } else {
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-url">Proje URL</Label>
                <Input
                  id="project-url"
                  value={editingProject?.project_url || newProject.project_url}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, project_url: e.target.value })
                    } else {
                      setNewProject({ ...newProject, project_url: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="github-url">GitHub URL</Label>
                <Input
                  id="github-url"
                  value={editingProject?.github_url || newProject.github_url}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, github_url: e.target.value })
                    } else {
                      setNewProject({ ...newProject, github_url: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={editingProject?.category || newProject.category}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, category: e.target.value })
                    } else {
                      setNewProject({ ...newProject, category: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="technologies">Teknolojiler (virgülle ayırın)</Label>
                <Input
                  id="technologies"
                  value={editingProject?.technologies || newProject.technologies}
                  onChange={(e) => {
                    if (editingProject) {
                      setEditingProject({ ...editingProject, technologies: e.target.value })
                    } else {
                      setNewProject({ ...newProject, technologies: e.target.value })
                    }
                  }}
                  placeholder="React, Next.js, TypeScript"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={editingProject ? handleEditProject : handleAddProject}>
                  {editingProject ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingBlog ? 'Blogu Düzenle' : 'Yeni Blog Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-row gap-8 mt-4 overflow-x-auto min-w-[600px]">
            {/* Sol: Görsel alanı */}
            <div className="flex-1 flex flex-col items-center justify-center border-r pr-8 min-w-[280px] max-w-[320px]">
              <Label>Blog Görseli</Label>
              <ImageUpload
                onImageUploaded={(url) => {
                  if (editingBlog) {
                    setEditingBlog({ ...editingBlog, image_url: url })
                  } else {
                    setNewBlog({ ...newBlog, image_url: url })
                  }
                }}
                aspectRatio={16 / 9}
              />
              {(editingBlog?.image_url || newBlog.image_url) && (
                <img
                  src={editingBlog?.image_url || newBlog.image_url}
                  alt="Blog görseli"
                  className="mt-2 rounded-lg object-cover h-40 w-auto border"
                />
              )}
            </div>
            {/* Sağ: Bilgi alanları */}
            <div className="flex-1 flex flex-col gap-4 min-w-[320px] max-w-[420px]">
              <div className="grid gap-2">
                <Label htmlFor="blog-title">Başlık</Label>
                <Input
                  id="blog-title"
                  value={editingBlog?.title ?? newBlog.title}
                  onChange={e => editingBlog ? setEditingBlog({ ...editingBlog, title: e.target.value }) : setNewBlog({ ...newBlog, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="blog-slug">Slug</Label>
                  <span className="text-xs text-muted-foreground">(ör: typescript-ile-tip-guvenli-programlama)</span>
                </div>
                <Input
                  id="blog-slug"
                  value={editingBlog?.slug ?? newBlog.slug}
                  onChange={e => editingBlog ? setEditingBlog({ ...editingBlog, slug: e.target.value }) : setNewBlog({ ...newBlog, slug: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blog-mini-description">Kısa Açıklama</Label>
                <Input
                  id="blog-mini-description"
                  value={editingBlog?.mini_description ?? newBlog.mini_description}
                  onChange={e => editingBlog ? setEditingBlog({ ...editingBlog, mini_description: e.target.value }) : setNewBlog({ ...newBlog, mini_description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blog-description">Açıklama</Label>
                <div className="flex gap-2 mb-1">
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    if (editingBlog) {
                      insertAtCursor(editingBlog.description, '\n    ', val => setEditingBlog({ ...editingBlog, description: val }), 'blog-description')
                    } else {
                      insertAtCursor(newBlog.description, '\n    ', val => setNewBlog({ ...newBlog, description: val }), 'blog-description')
                    }
                  }}>Paragraf Başı</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    if (editingBlog) {
                      insertAtCursor(editingBlog.description, '**kalın**', val => setEditingBlog({ ...editingBlog, description: val }), 'blog-description')
                    } else {
                      insertAtCursor(newBlog.description, '**kalın**', val => setNewBlog({ ...newBlog, description: val }), 'blog-description')
                    }
                  }}>Kalın</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    if (editingBlog) {
                      insertAtCursor(editingBlog.description, '\n\n', val => setEditingBlog({ ...editingBlog, description: val }), 'blog-description')
                    } else {
                      insertAtCursor(newBlog.description, '\n\n', val => setNewBlog({ ...newBlog, description: val }), 'blog-description')
                    }
                  }}>Boşluk</Button>
                </div>
                <Textarea
                  id="blog-description"
                  value={editingBlog?.description ?? newBlog.description}
                  onChange={e => editingBlog ? setEditingBlog({ ...editingBlog, description: e.target.value }) : setNewBlog({ ...newBlog, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blog-category">Kategori</Label>
                <Input
                  id="blog-category"
                  value={editingBlog?.category ?? newBlog.category}
                  onChange={e => editingBlog ? setEditingBlog({ ...editingBlog, category: e.target.value }) : setNewBlog({ ...newBlog, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blog-read-time">Okuma Süresi</Label>
                <Input
                  id="blog-read-time"
                  value={editingBlog?.read_time ?? newBlog.read_time}
                  onChange={e => editingBlog ? setEditingBlog({ ...editingBlog, read_time: e.target.value }) : setNewBlog({ ...newBlog, read_time: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => { setIsBlogDialogOpen(false); setEditingBlog(null); }}>
                  İptal
                </Button>
                <Button onClick={editingBlog ? handleEditBlog : handleAddBlog}>
                  {editingBlog ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 