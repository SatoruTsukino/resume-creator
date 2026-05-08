"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Minus,
  Save,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Loader2,
  Palette,
  LayoutPanelTop,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Award,
  FolderKanban,
  SlidersHorizontal,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

type SideScreenProps = {
  accentColor: string
  setAccentColor: (color: string) => void
  header: {
    name: string
    title: string
    location: string
    email: string
    website: string
    linkedin: string
    github: string
    phone: string
  }
  contactOrder: string[]
  setContactOrder: React.Dispatch<React.SetStateAction<string[]>>
  setHeader: React.Dispatch<React.SetStateAction<SideScreenProps["header"]>>
  sections: {
    objective?: string
    summary?: string
    availability?: string
    coreCompetencies?: string[]
    selectedImpact?: string[]
    experience: Array<{
      title: string
      company: string
      location: string
      date: string
      bullets: string[]
    }>
    projects?: Array<{
      title: string
      description: string
      technologies: string
      link: string
      bullets?: string[]
    }>
    education: Array<{
      degree: string
      school: string
      location?: string
    }>
    certifications?: string[]
    technicalStack?: string[]
  }
  setSections: React.Dispatch<React.SetStateAction<SideScreenProps["sections"]>>
  printSettings: {
    margin: number
    fontSize: number
    headingFontSize: number
    sectionHeadingFontSize: number
    bulletFontSize: number
    lineSpacing: number
    sectionSpacing: number
  }
  setPrintSettings: React.Dispatch<React.SetStateAction<SideScreenProps["printSettings"]>>
  sectionVisibility: {
    objective: boolean
    coreCompetencies: boolean
    selectedImpact: boolean
    experience: boolean
    education: boolean
    certifications: boolean
    technicalStack: boolean
  }
  setSectionVisibility: React.Dispatch<React.SetStateAction<SideScreenProps["sectionVisibility"]>>
  sectionOrder: string[]
  setSectionOrder: React.Dispatch<React.SetStateAction<string[]>>
  isOpen: boolean
  onToggle: () => void
  skillsColumns: number
  setSkillsColumns: React.Dispatch<React.SetStateAction<number>>
}

type SidebarSectionProps = {
  children: React.ReactNode
  className?: string
  description?: string
  eyebrow?: string
  icon: React.ComponentType<{ className?: string }>
  title: string
}

function SidebarSection({
  children,
  className,
  description,
  eyebrow,
  icon: Icon,
  title,
}: SidebarSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-slate-100 p-2.5 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>}
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export default function SideScreen({
  accentColor = "#98C1B6",
  setAccentColor,
  header = {
    name: "",
    title: "",
    location: "",
    email: "",
    website: "",
    linkedin: "",
    github: "",
    phone: "",
  },
  contactOrder = ["email", "website", "linkedin", "github"],
  setContactOrder,
  setHeader,
  sections = {
    objective: "",
    summary: "",
    availability: "",
    coreCompetencies: [],
    selectedImpact: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    technicalStack: [],
  },
  setSections,
  printSettings = {
    margin: 96,
    fontSize: 12,
    headingFontSize: 24,
    sectionHeadingFontSize: 16,
    bulletFontSize: 12,
    lineSpacing: 1.4,
    sectionSpacing: 24,
  },
  setPrintSettings,
  sectionVisibility = {
    objective: true,
    coreCompetencies: true,
    selectedImpact: true,
    experience: true,
    education: true,
    certifications: true,
    technicalStack: true,
  },
  setSectionVisibility,
  sectionOrder = [
    "objective",
    "coreCompetencies",
    "selectedImpact",
    "experience",
    "education",
    "certifications",
    "technicalStack",
  ],
  setSectionOrder,
  isOpen = true,
  onToggle,
  skillsColumns = 1,
  setSkillsColumns,
}: SideScreenProps) {
  const REQUEST_TIMEOUT_MS = 30000
  const controlInputClass =
    "rounded-xl border-slate-200 bg-white shadow-sm transition focus-visible:ring-slate-300"
  const softButtonClass =
    "rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
  const iconActionClass =
    "h-8 w-8 rounded-lg border-slate-200 bg-white p-0 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900"
  const [savedData, setSavedData] = useState<{
    header: SideScreenProps["header"]
    sections: SideScreenProps["sections"]
    sectionVisibility: SideScreenProps["sectionVisibility"]
    sectionOrder: string[]
  } | null>(null)

  const [resumeText, setResumeText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const sectionNames = {
    objective: "Professional Summary",
    coreCompetencies: "Core Skills",
    selectedImpact: "Selected Impact",
    experience: "Professional Experience",
    education: "Education",
    certifications: "Certifications",
    technicalStack: "Technical Stack",
  }

  const handleHeaderChange = (field: string, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }))
  }

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSections((prev) => ({ ...prev, objective: e.target.value }))
  }

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSections((prev) => ({ ...prev, summary: e.target.value }))
  }

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSections((prev) => ({ ...prev, availability: e.target.value }))
  }

  const processResumeWithGemini = async () => {
    if (!resumeText.trim()) {
      toast({
        title: "No resume text",
        description: "Please paste your resume text before processing.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    let timeoutId: number | undefined

    try {
      const controller = new AbortController()
      timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      const response = await fetch("/api/process-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText }),
        signal: controller.signal,
      })

      const isJson = response.headers.get("content-type")?.includes("application/json")
      
      if (!isJson) {
        const text = await response.text()
        throw new Error(`Non-JSON response (${response.status}): ${text}`)
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || `Failed to process resume (${response.status})`)
      }


      

      if (result.success && result.data) {
        // Update header
        setHeader({
          name: result.data.header.name || "",
          title: result.data.header.title || "",
          location: result.data.header.location || "",
          phone: result.data.header.phone || "",
          email: result.data.header.email || "",
          website: result.data.header.website || "",
          linkedin: result.data.header.linkedin || "",
          github: result.data.header.github || "",
        })

        // Update sections
        setSections({
          objective: result.data.sections.objective || "",
          coreCompetencies: result.data.sections.coreCompetencies || [],
          selectedImpact: result.data.sections.selectedImpact || [],
          experience: result.data.sections.experience || [],
          projects: result.data.sections.projects || [],
          education: result.data.sections.education || [],
          certifications: result.data.sections.certifications || [],
          technicalStack: result.data.sections.technicalStack || [],
        })

        // Update section visibility based on what was found
        setSectionVisibility((prev) => ({
          ...prev,
          objective: !!result.data.sections.objective,
          coreCompetencies: result.data.sections.coreCompetencies?.length > 0,
          selectedImpact: result.data.sections.selectedImpact?.length > 0,
          experience: result.data.sections.experience?.length > 0,
          education: result.data.sections.education?.length > 0,
          certifications: result.data.sections.certifications?.length > 0,
          technicalStack: result.data.sections.technicalStack?.length > 0,
        }))

        toast({
          title: "Resume processed successfully!",
          description: "Your resume has been parsed and updated with Gemini AI.",
        })

        // Clear the input text
        setResumeText("")
      }
    } catch (error) {
      console.error("Error processing resume:", error)
      const errorMessage =
        error instanceof Error && error.name === "AbortError"
          ? "The request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to process resume. Please try again."

      toast({
        title: "Processing failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
      setIsProcessing(false)
    }
  }

  const handleExperienceChange = (index: number, field: string, value: string) => {
    setSections((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }))
  }

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    setSections((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? {
              ...exp,
              bullets: exp.bullets.map((bullet, j) => (j === bulletIndex ? value : bullet)),
            }
          : exp,
      ),
    }))
  }

  const addExperience = () => {
    setSections((prev) => ({
      ...prev,
      experience: [...prev.experience, { title: "", company: "", location: "", date: "", bullets: [""] }],
    }))
  }

  const removeExperience = (index: number) => {
    setSections((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }))
  }

  const addBullet = (expIndex: number) => {
    setSections((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === expIndex ? { ...exp, bullets: [...exp.bullets, ""] } : exp)),
    }))
  }

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    setSections((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex ? { ...exp, bullets: exp.bullets.filter((_, j) => j !== bulletIndex) } : exp,
      ),
    }))
  }

  const handleCoreCompetencyChange = (index: number, value: string) => {
    setSections((prev) => ({
      ...prev,
      coreCompetencies: prev.coreCompetencies?.map((skill, i) => (i === index ? value : skill)),
    }))
  }

  const handleEducationChange = (index: number, field: string, value: string) => {
    setSections((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }))
  }

  const addCoreCompetency = () => {
    setSections((prev) => ({
      ...prev,
      coreCompetencies: [...(prev.coreCompetencies || []), ""],
    }))
  }

  const removeCoreCompetency = (index: number) => {
    setSections((prev) => ({
      ...prev,
      coreCompetencies: prev.coreCompetencies?.filter((_, i) => i !== index),
    }))
  }

  const handleSelectedImpactChange = (index: number, value: string) => {
    setSections((prev) => ({
      ...prev,
      selectedImpact: prev.selectedImpact?.map((impact, i) => (i === index ? value : impact)),
    }))
  }

  const addSelectedImpact = () => {
    setSections((prev) => ({
      ...prev,
      selectedImpact: [...(prev.selectedImpact || []), ""],
    }))
  }

  const removeSelectedImpact = (index: number) => {
    setSections((prev) => ({
      ...prev,
      selectedImpact: prev.selectedImpact?.filter((_, i) => i !== index),
    }))
  }

  const handleTechnicalStackChange = (index: number, value: string) => {
    setSections((prev) => ({
      ...prev,
      technicalStack: prev.technicalStack?.map((tech, i) => (i === index ? value : tech)),
    }))
  }

  const addTechnicalStack = () => {
    setSections((prev) => ({
      ...prev,
      technicalStack: [...(prev.technicalStack || []), ""],
    }))
  }

  const removeTechnicalStack = (index: number) => {
    setSections((prev) => ({
      ...prev,
      technicalStack: prev.technicalStack?.filter((_, i) => i !== index),
    }))
  }

  const handleCertificationChange = (index: number, value: string) => {
    setSections((prev) => ({
      ...prev,
      certifications: prev.certifications?.map((cert, i) => (i === index ? value : cert)),
    }))
  }

  const addCertification = () => {
    setSections((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), ""],
    }))
  }

  const removeCertification = (index: number) => {
    setSections((prev) => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index),
    }))
  }

  const addEducation = () => {
    setSections((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", school: "", location: "" }],
    }))
  }

  const removeEducation = (index: number) => {
    setSections((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const handlePrintSettingChange = (setting: keyof SideScreenProps["printSettings"], value: number) => {
    setPrintSettings((prev) => ({ ...prev, [setting]: value }))
  }

  const handleProjectChange = (index: number, field: string, value: string) => {
    setSections((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) => (i === index ? { ...project, [field]: value } : project)),
    }))
  }

  const handleProjectBulletChange = (projectIndex: number, bulletIndex: number, value: string) => {
    setSections((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === projectIndex
          ? {
              ...project,
              bullets: project.bullets?.map((bullet, j) => (j === bulletIndex ? value : bullet)) || [],
            }
          : project,
      ),
    }))
  }

  const addProject = () => {
    setSections((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", technologies: "", link: "", bullets: [""] }],
    }))
  }

  const removeProject = (index: number) => {
    setSections((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }))
  }

  const addProjectBullet = (projectIndex: number) => {
    setSections((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === projectIndex ? { ...project, bullets: [...(project.bullets || []), ""] } : project,
      ),
    }))
  }

  const removeProjectBullet = (projectIndex: number, bulletIndex: number) => {
    setSections((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === projectIndex
          ? { ...project, bullets: project.bullets?.filter((_, j) => j !== bulletIndex) || [] }
          : project,
      ),
    }))
  }

  const moveSectionUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...sectionOrder]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      setSectionOrder(newOrder)
    }
  }

  const moveSectionDown = (index: number) => {
    if (index < sectionOrder.length - 1) {
      const newOrder = [...sectionOrder]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      setSectionOrder(newOrder)
    }
  }

  const saveCurrentText = () => {
    setSavedData({
      header: { ...header },
      sections: { ...sections },
      sectionVisibility: { ...sectionVisibility },
      sectionOrder: [...sectionOrder],
    })
    toast({
      title: "Content saved",
      description: "Your resume content has been saved. You can restore it later if needed.",
    })
  }

  const restoreSavedText = () => {
    if (savedData) {
      setHeader(savedData.header)
      setSections(savedData.sections)
      setSectionVisibility(savedData.sectionVisibility)
      setSectionOrder(savedData.sectionOrder)
      toast({
        title: "Content restored",
        description: "Your saved resume content has been restored.",
      })
    } else {
      toast({
        title: "No saved content",
        description: "There is no saved content to restore.",
        variant: "destructive",
      })
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed left-4 top-4 z-50">
        <Button onClick={onToggle} variant="outline" size="sm" className="bg-white shadow-md">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-[340px] border-r border-slate-200/80 bg-[linear-gradient(180deg,#f7f7f4_0%,#eef3f2_40%,#f7f8fb_100%)] shadow-[18px_0_50px_rgba(15,23,42,0.08)] transition-all duration-300">
      <div className="absolute top-4 right-4 z-50">
        <Button onClick={onToggle} variant="outline" size="sm" className="rounded-xl border-slate-200 bg-white shadow-md">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-full overflow-y-auto px-4 pb-10 pt-4">
        <div className="space-y-5 pr-1">
          <section className="rounded-[28px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(233,244,241,0.94)_100%)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] backdrop-blur">
           
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              {savedData && <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 shadow-sm">Draft saved</span>}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={saveCurrentText} className="flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800">
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              {savedData && (
                <Button onClick={restoreSavedText} className={cn("flex-1 rounded-xl", softButtonClass)} variant="outline">
                  Restore
                </Button>
              )}
            </div>
          </section>

          <SidebarSection
            className="bg-[linear-gradient(135deg,rgba(239,246,255,0.95)_0%,rgba(245,243,255,0.95)_100%)]"
            eyebrow="AI Assist"
            icon={Sparkles}
            title="Process with Gemini"
          >
        <Label htmlFor="resume-text" className="text-sm font-medium mb-2 block">
          Paste resume text
        </Label>
        <Textarea
          id="resume-text"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your complete resume text here..."
          className="w-full h-32 mb-3 text-sm"
        />
        <Button
          onClick={processResumeWithGemini}
          disabled={isProcessing || !resumeText.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-200 hover:from-sky-700 hover:via-cyan-700 hover:to-emerald-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Process with Gemini AI
            </>
          )}
        </Button>
          </SidebarSection>

          <SidebarSection
            description="Control hierarchy, visual tone, and how key sections appear in the document."
            eyebrow="Layout"
            icon={LayoutPanelTop}
            title="Structure & Styling"
          >
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3">
              <div>
                <Label htmlFor="accent-color" className="text-sm font-medium text-slate-700">Accent Color</Label>
                <p className="mt-1 text-xs text-slate-500">Used for headings and key moments.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-full border border-white shadow-sm" style={{ backgroundColor: accentColor }} />
                <Input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-xl border-slate-200 bg-white p-1 shadow-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800">Section Order & Visibility</h4>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Toggle + reorder</span>
              </div>
        <div className="space-y-2">
          {sectionOrder.map((sectionKey, index) => (
            <div key={sectionKey} className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-sm">
              <input
                type="checkbox"
                checked={sectionVisibility[sectionKey as keyof typeof sectionVisibility]}
                onChange={(e) => setSectionVisibility((prev) => ({ ...prev, [sectionKey]: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              <span className="flex-1 text-sm font-medium text-slate-700">{sectionNames[sectionKey as keyof typeof sectionNames]}</span>
              <div className="flex gap-1">
                <Button
                  onClick={() => moveSectionUp(index)}
                  size="sm"
                  variant="outline"
                  disabled={index === 0}
                  className={iconActionClass}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => moveSectionDown(index)}
                  size="sm"
                  variant="outline"
                  disabled={index === sectionOrder.length - 1}
                  className={iconActionClass}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4 text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-800">Skills Layout</h4>
              </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((cols) => (
            <Button
              key={cols}
              onClick={() => setSkillsColumns(cols)}
              size="sm"
              variant={skillsColumns === cols ? "default" : "outline"}
              className={cn(
                "flex-1 rounded-xl",
                skillsColumns === cols ? "bg-slate-900 text-white hover:bg-slate-800" : softButtonClass
              )}
            >
              {cols} Col
            </Button>
          ))}
        </div>
            </div>
          </SidebarSection>

          <SidebarSection
            description="Shape the top block and reorder the contact details exactly how they should appear."
            eyebrow="Identity"
            icon={UserRound}
            title="Header & Contact"
          >
        <Input
          value={header.name}
          onChange={(e) => handleHeaderChange("name", e.target.value)}
          placeholder="Name"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.title}
          onChange={(e) => handleHeaderChange("title", e.target.value)}
          placeholder="Title"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.location}
          onChange={(e) => handleHeaderChange("location", e.target.value)}
          placeholder="Location"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.phone}
          onChange={(e) => handleHeaderChange("phone", e.target.value)}
          placeholder="Phone"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.email}
          onChange={(e) => handleHeaderChange("email", e.target.value)}
          placeholder="Email"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.website}
          onChange={(e) => handleHeaderChange("website", e.target.value)}
          placeholder="Website"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.linkedin}
          onChange={(e) => handleHeaderChange("linkedin", e.target.value)}
          placeholder="LinkedIn"
          className={cn("mb-2", controlInputClass)}
        />
        <Input
          value={header.github}
          onChange={(e) => handleHeaderChange("github", e.target.value)}
          placeholder="GitHub"
          className={cn("mb-2", controlInputClass)}
        />

        <div className="mt-4">
          <Label className="mb-2 block text-sm font-semibold text-slate-800">Contact Order</Label>
          <div className="space-y-2">
            {contactOrder.map((contactType, index) => (
              <div key={contactType} className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                <span className="flex-1 text-sm font-medium capitalize text-slate-700">{contactType}</span>
                <div className="flex gap-1">
                  <Button
                    onClick={() => {
                      if (index > 0) {
                        const newOrder = [...contactOrder]
                        ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
                        setContactOrder(newOrder)
                      }
                    }}
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    className={iconActionClass}
                  >
                    ↑
                  </Button>
                  <Button
                    onClick={() => {
                      if (index < contactOrder.length - 1) {
                        const newOrder = [...contactOrder]
                        ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
                        setContactOrder(newOrder)
                      }
                    }}
                    size="sm"
                    variant="outline"
                    disabled={index === contactOrder.length - 1}
                    className={iconActionClass}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
          </SidebarSection>

      {sections.objective !== undefined && (
        <SidebarSection
          description="Refine the opening paragraph that frames the whole resume."
          eyebrow="Narrative"
          icon={UserRound}
          title="Professional Summary"
        >
          <Label htmlFor="objective">Professional Summary</Label>
          <Textarea
            id="objective"
            value={sections.objective}
            onChange={handleObjectiveChange}
            className={cn("w-full min-h-28 rounded-2xl border-slate-200 bg-white shadow-sm", controlInputClass)}
          />
        </SidebarSection>
      )}

      {sections.summary !== undefined && (
        <div className="mb-4">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea id="summary" value={sections.summary} onChange={handleSummaryChange} className="w-full" />
        </div>
      )}

      <SidebarSection
        description="Tune job entries and bullet points so the strongest proof lands first."
        eyebrow="Career"
        icon={BriefcaseBusiness}
        title="Experience"
      >
        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Experience</h3>
          <Button onClick={addExperience} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.experience.map((job, index) => (
          <div key={index} className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
            <Input
              value={job.title}
              onChange={(e) => handleExperienceChange(index, "title", e.target.value)}
              placeholder="Job Title"
              className="mb-2"
            />
            <Input
              value={job.company}
              onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
              placeholder="Company"
              className="mb-2"
            />
            <Input
              value={job.location}
              onChange={(e) => handleExperienceChange(index, "location", e.target.value)}
              placeholder="Location"
              className="mb-2"
            />
            <Input
              value={job.date}
              onChange={(e) => handleExperienceChange(index, "date", e.target.value)}
              placeholder="Date"
              className="mb-2"
            />
            <Label>Bullets</Label>
            {job.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center mb-2">
                <Input
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, bulletIndex, e.target.value)}
                  placeholder={`Bullet ${bulletIndex + 1}`}
                  className="flex-grow mr-2"
                />
                <Button onClick={() => removeBullet(index, bulletIndex)} size="sm" variant="outline">
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => addBullet(index)} size="sm" variant="outline" className={cn("mb-2 rounded-xl", softButtonClass)}>
              <Plus className="h-4 w-4 mr-2" /> Add Bullet
            </Button>
            <Button onClick={() => removeExperience(index)} size="sm" variant="outline" className={cn("w-full rounded-xl", softButtonClass)}>
              <Minus className="h-4 w-4 mr-2" /> Remove Experience
            </Button>
          </div>
        ))}
      </SidebarSection>

      <SidebarSection
        description="Manage concise proof lists for skills, impact, technical tools, and credentials."
        eyebrow="Proof"
        icon={Award}
        title="Skills & Highlights"
      >
        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Skills</h3>
          <Button onClick={addCoreCompetency} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.coreCompetencies?.map((skill, index) => (
          <div key={index} className="flex items-center mb-2">
            <Input
              value={skill}
              onChange={(e) => handleCoreCompetencyChange(index, e.target.value)}
              placeholder={`Core Competency ${index + 1}`}
              className="flex-grow mr-2"
            />
            <Button onClick={() => removeCoreCompetency(index)} size="sm" variant="outline">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Selected Impact</h3>
          <Button onClick={addSelectedImpact} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.selectedImpact?.map((impact, index) => (
          <div key={index} className="flex items-center mb-2">
            <Input
              value={impact}
              onChange={(e) => handleSelectedImpactChange(index, e.target.value)}
              placeholder={`Selected Impact ${index + 1}`}
              className="flex-grow mr-2"
            />
            <Button onClick={() => removeSelectedImpact(index)} size="sm" variant="outline">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Technical Stack</h3>
          <Button onClick={addTechnicalStack} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.technicalStack?.map((tech, index) => (
          <div key={index} className="flex items-center mb-2">
            <Input
              value={tech}
              onChange={(e) => handleTechnicalStackChange(index, e.target.value)}
              placeholder={`Technical Stack ${index + 1}`}
              className="flex-grow mr-2"
            />
            <Button onClick={() => removeTechnicalStack(index)} size="sm" variant="outline">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Certifications</h3>
          <Button onClick={addCertification} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.certifications?.map((cert, index) => (
          <div key={index} className="flex items-center mb-2">
            <Input
              value={cert}
              onChange={(e) => handleCertificationChange(index, e.target.value)}
              placeholder={`Certification ${index + 1}`}
              className="flex-grow mr-2"
            />
            <Button onClick={() => removeCertification(index)} size="sm" variant="outline">
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </SidebarSection>

      <SidebarSection
        description="Use project entries for portfolio-style proof with optional links and technology context."
        eyebrow="Projects"
        icon={FolderKanban}
        title="Project Highlights"
      >
        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Projects</h3>
          <Button onClick={addProject} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.projects?.map((project, index) => (
          <div key={index} className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
            <Label htmlFor={`project-title-${index}`}>Title</Label>
            <Input
              id={`project-title-${index}`}
              value={project.title}
              onChange={(e) => handleProjectChange(index, "title", e.target.value)}
              placeholder="Project Title"
              className="mb-2"
            />
            <Label htmlFor={`project-desc-${index}`}>Date/Period</Label>
            <Input
              id={`project-desc-${index}`}
              value={project.description}
              onChange={(e) => handleProjectChange(index, "description", e.target.value)}
              placeholder="Project Date/Period"
              className="mb-2"
            />
            <Label>Bullets</Label>
            {project.bullets?.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center mb-2">
                <Input
                  value={bullet}
                  onChange={(e) => handleProjectBulletChange(index, bulletIndex, e.target.value)}
                  placeholder={`Bullet ${bulletIndex + 1}`}
                  className="flex-grow mr-2"
                />
                <Button onClick={() => removeProjectBullet(index, bulletIndex)} size="sm" variant="outline">
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button onClick={() => addProjectBullet(index)} size="sm" variant="outline" className={cn("mb-2 rounded-xl", softButtonClass)}>
              <Plus className="h-4 w-4 mr-2" /> Add Bullet
            </Button>
            <Label htmlFor={`project-tech-${index}`}>Technologies (optional)</Label>
            <Input
              id={`project-tech-${index}`}
              value={project.technologies}
              onChange={(e) => handleProjectChange(index, "technologies", e.target.value)}
              placeholder="Technologies Used"
              className="mb-2"
            />
            <Label htmlFor={`project-link-${index}`}>Link (optional)</Label>
            <Input
              id={`project-link-${index}`}
              value={project.link}
              onChange={(e) => handleProjectChange(index, "link", e.target.value)}
              placeholder="Project Link"
              className="mb-2"
            />
            <Button onClick={() => removeProject(index)} size="sm" variant="outline" className={cn("w-full rounded-xl", softButtonClass)}>
              <Minus className="h-4 w-4 mr-2" /> Remove Project
            </Button>
          </div>
        ))}
      </SidebarSection>

      {sections.availability !== undefined && (
        <div className="mb-4">
          <Label htmlFor="availability">Availability</Label>
          <Textarea
            id="availability"
            value={sections.availability}
            onChange={handleAvailabilityChange}
            className="w-full"
          />
        </div>
      )}

      <SidebarSection
        description="Keep education entries crisp and scan-friendly for the final layout."
        eyebrow="Background"
        icon={GraduationCap}
        title="Education"
      >
        <div className="flex justify-between items-center mt-4 mb-2">
          <h3 className="font-bold">Education</h3>
          <Button onClick={addEducation} size="sm" variant="outline" className={cn("rounded-xl", softButtonClass)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {sections.education.map((edu, index) => (
          <div key={index} className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
            <Label htmlFor={`degree-${index}`}>Degree</Label>
            <Input
              id={`degree-${index}`}
              value={edu.degree}
              onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
              placeholder="Degree"
              className="mb-2"
            />
            <Label htmlFor={`school-${index}`}>School</Label>
            <Input
              id={`school-${index}`}
              value={edu.school}
              onChange={(e) => handleEducationChange(index, "school", e.target.value)}
              placeholder="School"
              className="mb-2"
            />
            <Label htmlFor={`location-${index}`}>Location</Label>
            <Input
              id={`location-${index}`}
              value={edu.location || ""}
              onChange={(e) => handleEducationChange(index, "location", e.target.value)}
              placeholder="Location"
              className="mb-2"
            />
            <Button onClick={() => removeEducation(index)} size="sm" variant="outline" className={cn("w-full rounded-xl", softButtonClass)}>
              <Minus className="h-4 w-4 mr-2" /> Remove Education
            </Button>
          </div>
        ))}
      </SidebarSection>

      <SidebarSection
        description="Fine-tune page density, spacing, and typography for the printed version."
        eyebrow="Output"
        icon={SlidersHorizontal}
        title="Print Settings"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="print-margin">Print Margin</Label>
            <Slider
              id="print-margin"
              min={0.25}
              max={2}
              step={0.25}
              value={[printSettings.margin / 96]} // Convert stored pixels to inches
              onValueChange={([value]) => handlePrintSettingChange("margin", value * 96)} // Convert inches to pixels for storage
            />
            <div className="text-sm text-gray-500 mt-1">
              {(printSettings.margin / 96).toFixed(2)} inch{printSettings.margin / 96 !== 1 ? "es" : ""}
            </div>
          </div>
          <div>
            <Label htmlFor="section-spacing">Section Spacing</Label>
            <Slider
              id="section-spacing"
              min={8}
              max={48}
              step={4}
              value={[printSettings.sectionSpacing]}
              onValueChange={([value]) => handlePrintSettingChange("sectionSpacing", value)}
            />
            <div className="text-sm text-gray-500 mt-1">{printSettings.sectionSpacing}px</div>
          </div>
          <div>
            <Label htmlFor="line-spacing">Line Spacing</Label>
            <Slider
              id="line-spacing"
              min={1}
              max={2}
              step={0.1}
              value={[printSettings.lineSpacing]}
              onValueChange={([value]) => handlePrintSettingChange("lineSpacing", value)}
            />
            <div className="text-sm text-gray-500 mt-1">{printSettings.lineSpacing.toFixed(1)}x</div>
          </div>
          <div>
            <Label htmlFor="heading-font-size">Name Font Size</Label>
            <Slider
              id="heading-font-size"
              min={16}
              max={36}
              step={1}
              value={[printSettings.headingFontSize]}
              onValueChange={([value]) => handlePrintSettingChange("headingFontSize", value)}
            />
            <div className="text-sm text-gray-500 mt-1">{printSettings.headingFontSize}px</div>
          </div>
          <div>
            <Label htmlFor="section-heading-font-size">Section Heading Font Size</Label>
            <Slider
              id="section-heading-font-size"
              min={12}
              max={24}
              step={1}
              value={[printSettings.sectionHeadingFontSize]}
              onValueChange={([value]) => handlePrintSettingChange("sectionHeadingFontSize", value)}
            />
            <div className="text-sm text-gray-500 mt-1">{printSettings.sectionHeadingFontSize}px</div>
          </div>
          <div>
            <Label htmlFor="print-font-size">Body Text Font Size</Label>
            <Slider
              id="print-font-size"
              min={8}
              max={16}
              step={1}
              value={[printSettings.fontSize]}
              onValueChange={([value]) => handlePrintSettingChange("fontSize", value)}
            />
            <div className="text-sm text-gray-500 mt-1">{printSettings.fontSize}px</div>
          </div>
          <div>
            <Label htmlFor="bullet-font-size">Bullet Point Font Size</Label>
            <Slider
              id="bullet-font-size"
              min={8}
              max={16}
              step={1}
              value={[printSettings.bulletFontSize]}
              onValueChange={([value]) => handlePrintSettingChange("bulletFontSize", value)}
            />
            <div className="text-sm text-gray-500 mt-1">{printSettings.bulletFontSize}px</div>
          </div>
        </div>
      </SidebarSection>
        </div>
      </div>
    </div>
  )
}
