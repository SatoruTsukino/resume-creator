"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export default function ResumeDownload() {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrint = () => {
    const printContent = document.querySelector(".resume-pages") as HTMLElement
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        // Copy the entire document's styles
        const styles = Array.from(document.styleSheets)
          .map((styleSheet) => {
            try {
              return Array.from(styleSheet.cssRules)
                .map((rule) => rule.cssText)
                .join("\n")
            } catch (e) {
              console.log("Error accessing styleSheet", e)
              return ""
            }
          })
          .join("\n")

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>${styles}</style>
            </head>
            <body>
              ${printContent.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()

        // Wait for content to load before printing
        printWindow.onload = () => {
          printWindow.print()
          printWindow.close()
        }
      } else {
        console.error("Failed to open print window")
      }
    } else {
      console.error("Resume content not found")
    }
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
      <Button onClick={handlePrint} className="w-full sm:w-auto bg-[#98C1B6] hover:bg-[#7AA498] text-white">
        <FileDown className="mr-2 h-4 w-4" />
        Print Resume
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
