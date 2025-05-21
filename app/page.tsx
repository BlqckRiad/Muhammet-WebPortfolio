import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Github, Linkedin, Twitter, Mail, Code2, PenTool, Server, Phone, MapPin, Instagram } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContactForm } from "@/components/contact-form"
import { createClient } from "@/lib/supabase-server"

// Icon mapping
const iconMap: { [key: string]: any } = {
  Code2,
  PenTool,
  Server
}

export default async function Home() {
  const supabase = await createClient()

  const [projectsResponse, blogPostsResponse, skillsResponse, experienceResponse, contactInfoResponse] = await Promise.all([
    supabase
      .from('muhammetprojects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('muhammetblogs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('muhammetskills')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('muhammetdeneyim')
      .select('*')
      .order('start_date', { ascending: false }),
    supabase
      .from('muhammetinfos')
      .select('*')
      .single()
  ])

  const projects = projectsResponse.data || []
  const blogPosts = blogPostsResponse.data || []
  const skills = skillsResponse.data || []
  const experiences = experienceResponse.data || []
  const contactInfo = contactInfoResponse.data

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (date: string | null) => {
    if (!date) return 'Günümüz'
    return new Date(date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Sosyal linkler ve CV indir alanı */}
      

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Muhammet</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Ana Sayfa
            </Link>
            <Link href="#projects" className="text-sm font-medium transition-colors hover:text-primary">
              Projeler
            </Link>
            <Link href="#blog" className="text-sm font-medium transition-colors hover:text-primary">
              Blog
            </Link>
            <Link href="#about" className="text-sm font-medium transition-colors hover:text-primary">
              Hakkımda
            </Link>
            <Link href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
              İletişim
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Link href="#contact">İletişime Geç</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Ana Bölüm */}
        <section className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
                Merhaba, Ben <span className="text-primary">Muhammet</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Güzel ve işlevsel web deneyimleri oluşturan tam yığın geliştirici
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="#projects">
                  Projeleri Gör <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#contact">İletişime Geç</Link>
              </Button>
            </div>
            {/* Sosyal linkler ve CV indir alanı (hero altı) */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {contactInfo?.github_url && (
                <Link href={contactInfo.github_url} target="_blank" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                  <span className="hidden sm:inline">GitHub</span>
                </Link>
              )}
              {contactInfo?.linkedin_url && (
                <Link href={contactInfo.linkedin_url} target="_blank" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </Link>
              )}
              {contactInfo?.twitter_url && (
                <Link href={contactInfo.twitter_url} target="_blank" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="hidden sm:inline">Twitter</span>
                </Link>
              )}
              {contactInfo?.instagram_url && (
                <Link href={contactInfo.instagram_url} target="_blank" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                  <span className="hidden sm:inline">Instagram</span>
                </Link>
              )}
              {contactInfo?.cv_url && (
                <a href={contactInfo.cv_url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors font-medium border rounded px-3 py-1 ml-2">
                  <ArrowRight className="h-4 w-4 rotate-90" />
                  CV İndir
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Öne Çıkan Projeler */}
        <section id="projects" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                Öne Çıkan Projeler
              </h2>
              <p className="text-lg text-muted-foreground">
                İşte son çalışmalarımdan bazıları
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="group flex flex-col overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.image_url}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto border-t pt-4">
                    <div className="flex w-full gap-2">
                      {project.github_url && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={project.github_url} target="_blank">
                            <Github className="mr-2 h-4 w-4" />
                            GitHub
                          </Link>
                        </Button>
                      )}
                      {project.project_url && (
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={project.project_url} target="_blank">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Canlı Demo
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link href="/projects">
                Tüm Projeleri Gör <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Blog Bölümü */}
        <section id="blog" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                Son Yazılar
              </h2>
              <p className="text-lg text-muted-foreground">
                Web geliştirme hakkında içgörüler ve öğreticiler
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post: any) => (
                <Card key={post.id} className="group flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={post.image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="space-y-1">
                      <Badge variant="secondary">{post.category}</Badge>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                        <span>•</span>
                        <span>{post.read_time}</span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="line-clamp-3 text-muted-foreground">{post.mini_description}</p>
                  </CardContent>
                  <CardFooter className="mt-auto border-t pt-4">
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href={`/blog/${post.slug}`}>
                        Devamını Oku <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <Button asChild className="mt-8">
              <Link href="/blog">
                Tüm Yazıları Gör <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Hakkımda Bölümü */}
        <section id="about" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                Hakkımda
              </h2>
              <p className="max-w-[750px] text-lg text-muted-foreground">
                Güzel ve işlevsel web deneyimleri oluşturmaya odaklanmış tutkulu bir web geliştirici ve yazarım.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Yetenekler ve Uzmanlık</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {skills.map((skill) => {
                    const Icon = iconMap[skill.icon]
                    return (
                      <div key={skill.id} className="flex items-center gap-3 rounded-lg border p-4">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-sm text-muted-foreground">{skill.category}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Deneyim</h3>
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <div key={experience.id} className="rounded-lg border p-4">
                      <h4 className="font-semibold">{experience.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {experience.company} • {formatDate(experience.start_date)} - {formatDate(experience.end_date)}
                      </p>
                      <p className="mt-2 text-sm">{experience.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* İletişim Bölümü */}
        <section id="contact" className="container py-12 md:py-24 lg:py-32">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                İletişime Geç
              </h2>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Bir sorunuz mu var veya birlikte çalışmak mı istiyorsunuz? Bana ulaşmaktan çekinmeyin!
              </p>
            </div>
            
            <div className="grid w-full gap-8 md:grid-cols-2">
              <div className="space-y-6 rounded-lg border bg-card p-8 text-left">
                <h3 className="text-2xl font-semibold">İletişim Bilgileri</h3>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Yeni projeler, yaratıcı fikirler veya vizyonunuzun bir parçası olma fırsatları hakkında konuşmaya her zaman açığım.
                  </p>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <a href={`mailto:${contactInfo?.email}`} className="text-sm hover:text-primary">
                        {contactInfo?.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" />
                      <a href={`tel:${contactInfo?.phone}`} className="text-sm hover:text-primary">
                        {contactInfo?.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5" />
                      <span className="text-sm">{contactInfo?.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <a href={contactInfo?.github_url} target="_blank" className="text-sm hover:text-primary">
                        {contactInfo?.github_url?.replace('https://', '')}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Linkedin className="h-5 w-5" />
                      <a href={contactInfo?.linkedin_url} target="_blank" className="text-sm hover:text-primary">
                        {contactInfo?.linkedin_url?.replace('https://', '')}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Twitter className="h-5 w-5" />
                      <a href={contactInfo?.twitter_url} target="_blank" className="text-sm hover:text-primary">
                        {contactInfo?.twitter_url?.replace('https://', '')}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Instagram className="h-5 w-5" />
                      <a href={contactInfo?.instagram_url} target="_blank" className="text-sm hover:text-primary">
                        {contactInfo?.instagram_url?.replace('https://', '')}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-8">
                <ContactForm />
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              {contactInfo?.github_url && (
                <Button variant="outline" size="icon" asChild className="h-12 w-12">
                  <Link href={contactInfo.github_url} target="_blank">
                    <Github className="h-6 w-6" />
                  </Link>
                </Button>
              )}
              {contactInfo?.linkedin_url && (
                <Button variant="outline" size="icon" asChild className="h-12 w-12">
                  <Link href={contactInfo.linkedin_url} target="_blank">
                    <Linkedin className="h-6 w-6" />
                  </Link>
                </Button>
              )}
              {contactInfo?.twitter_url && (
                <Button variant="outline" size="icon" asChild className="h-12 w-12">
                  <Link href={contactInfo.twitter_url} target="_blank">
                    <Twitter className="h-6 w-6" />
                  </Link>
                </Button>
              )}
              {contactInfo?.instagram_url && (
                <Button variant="outline" size="icon" asChild className="h-12 w-12">
                  <Link href={contactInfo.instagram_url} target="_blank">
                    <Instagram className="h-6 w-6" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Muhammet. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Ana Sayfa
            </Link>
            <Link href="#projects" className="text-sm text-muted-foreground hover:text-foreground">
              Projeler
            </Link>
            <Link href="#blog" className="text-sm text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground">
              Hakkımda
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
              İletişim
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
