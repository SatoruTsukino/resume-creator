"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"

export default function ResumeDownload() {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const resume = document.querySelector(".resume-pages") as HTMLElement | null
      if (!resume) {
        throw new Error("Resume content not found")
      }

      // Each rendered page is a fixed 816px x 1056px (8.5in x 11in @ 96dpi) block.
      const pages = Array.from(resume.querySelectorAll<HTMLElement>(".page-content"))
      const targets = pages.length > 0 ? pages : [resume]

      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ])

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter", // 612 x 792 pt
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < targets.length; i++) {
        const canvas = await html2canvas(targets[i], {
          scale: 2, // higher resolution for crisp text
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        })

        const imgData = canvas.toDataURL("image/png")

        if (i > 0) {
          pdf.addPage("letter", "portrait")
        }

        // Fit the page image to the full letter page, preserving aspect ratio.
        const imgRatio = canvas.width / canvas.height
        const pageRatio = pageWidth / pageHeight
        let renderWidth = pageWidth
        let renderHeight = pageHeight
        if (imgRatio > pageRatio) {
          renderHeight = pageWidth / imgRatio
        } else {
          renderWidth = pageHeight * imgRatio
        }
        const offsetX = (pageWidth - renderWidth) / 2
        const offsetY = (pageHeight - renderHeight) / 2

        pdf.addImage(imgData, "PNG", offsetX, offsetY, renderWidth, renderHeight)
      }

      pdf.save("resume.pdf")
    } catch (error) {
      console.error("PDF export failed:", error)
      alert("Could not export PDF. Please try again.")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleTxtDownload = async () => {
    setIsLoading(true)
    try {
      const resume = document.querySelector(".resume-pages")
      if (!resume) {
        throw new Error("Resume content not found")
      }

      let content = resume.textContent || ""
      content = content.replace(/\s+/g, " ").trim() // Remove extra whitespace
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "resume.txt"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center p-4 bg-white rounded-lg shadow-sm">
      <Button
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="w-full sm:w-auto bg-[#98C1B6] hover:bg-[#7AA498] text-white"
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isGeneratingPdf ? "Generating PDF..." : "Download PDF"}
      </Button>
      <Button
        onClick={handlePrint}
        variant="outline"
        className="w-full sm:w-auto border-[#98C1B6] text-[#98C1B6] hover:bg-[#98C1B6] hover:text-white"
      >
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button
        onClick={handleTxtDownload}
        variant="outline"
        className="w-full sm:w-auto border-[#98C1B6] text-[#98C1B6] hover:bg-[#98C1B6] hover:text-white"
        disabled={isLoading}
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isLoading ? "Generating TXT..." : "Download TXT"}
      </Button>
    </div>
  )
}
