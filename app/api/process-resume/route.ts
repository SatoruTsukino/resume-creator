// app/api/process-resume/route.ts
// Uses direct Gemini API call to support gemini-2.5-flash

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_TIMEOUT_MS = 25000

const resumeSchemaDefinition = {
  type: "object",
  properties: {
    header: {
      type: "object",
      properties: {
        name: { type: "string" },
        title: { type: "string" },
        location: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        website: { type: "string" },
        linkedin: { type: "string" },
        github: { type: "string" },
      },
      required: ["name"],
    },
    sections: {
      type: "object",
      properties: {
        objective: { type: "string" },
        coreCompetencies: { type: "array", items: { type: "string" } },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              company: { type: "string" },
              location: { type: "string" },
              date: { type: "string" },
              description: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            properties: {
              degree: { type: "string" },
              school: { type: "string" },
              location: { type: "string" },
              dates: { type: "string" },
              notes: { type: "array", items: { type: "string" } },
            },
          },
        },
        certifications: { type: "array", items: { type: "string" } },
        technicalStack: { type: "array", items: { type: "string" } },
        selectedImpact: { type: "array", items: { type: "string" } },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              technologies: { type: "string" },
              link: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  },
  required: ["header", "sections"],
}

const SYSTEM_PROMPT = `You are classifying a resume into JSON ONLY. Do not write any prose. 
Do not invent or infer any content. If a field is not explicitly present, use "" or [] as appropriate.

Return JSON that *strictly* matches the provided schema. 
For every text field you populate, copy the user's text *exactly* as it appears:
- preserve punctuation (e.g., en dashes, commas)
- preserve capitalization
- preserve bullet wording (no rephrasing, no truncation)
- preserve order of items within each section

Mapping rules:
1) HEADER
   - Extract what's visibly present (name, title, location, phone, email, website, linkedin, github). 
   - If an item isn't present verbatim, set it to "" (do not guess or construct URLs).

2) OBJECTIVE / SUMMARY
   - If a summary/objective paragraph exists, put the full paragraph into "objective" verbatim. 
   - If there are multiple lines, join them with a single space. Do not reword.

3) SKILLS (coreCompetencies)
   - Keep each visible line from the Skills section as one string item (do NOT split by commas or ".").
   - Example: "Automation: Make.com, Zapier, Google Apps Script" is a single array item.

4) EXPERIENCE
   - Maintain order as shown in the resume.
   - For each job, fill: title, company, location, date (use the raw date line or range if present).
   - If there is a one-sentence description before bullets, put it in "description" verbatim.
   - Put each bullet as its own string EXACTLY (no rewording). If bullets use "-" or ".", keep whichever appears.

5) EDUCATION
   - One entry per degree block, in document order.
   - "degree" := the line that contains the degree and field exactly (e.g., "MFA - Creative Writing")
   - "school" := the institution line exactly (e.g., "The New School")
   - If a location or date appears, place the full line into "location" or "dates" (verbatim). 
   - If extra lines belong to the entry (e.g., honors), put them in "notes" as separate strings, unchanged.

6) CERTIFICATIONS / TECHNICAL STACK / SELECTED IMPACT / PROJECTS
   - If present, keep each visible line as a single array item (or per-object fields for projects) exactly as written.

General rules:
- Never fabricate missing fields.
- Never normalize, expand, or shorten text.
- If a section is missing, return an empty string or empty array for it as defined in the schema.
- Output ONLY valid JSON.`

function extractJsonPayload(rawText: string) {
  const trimmed = rawText.trim()

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim()
  }

  const objectStart = trimmed.indexOf("{")
  const objectEnd = trimmed.lastIndexOf("}")

  if (objectStart >= 0 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1)
  }

  return trimmed
}

export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json()

    if (!resumeText || typeof resumeText !== "string") {
      return Response.json({ error: "Resume text is required" }, { status: 400 })
    }

    const apiKey =
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
      process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: "Server is not configured with a Gemini API key." },
        { status: 500 }
      )
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nRESUME TEXT:\n${resumeText}` }],
              },
            ],
            generationConfig: {
              temperature: 0,
              responseMimeType: "application/json",
              responseSchema: resumeSchemaDefinition,
            },
          }),
          signal: controller.signal,
          cache: "no-store",
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Gemini API request failed"

        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData?.error?.message ?? errorMessage
          console.error("[v0] Gemini API error:", errorData)
        } catch {
          console.error("[v0] Gemini API error:", errorText)
          if (errorText.trim()) {
            errorMessage = errorText
          }
        }

        return Response.json({ error: errorMessage }, { status: response.status })
      }

      const result = await response.json()
      const textContent = result?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!textContent) {
        console.error("[v0] Gemini response missing text:", result)
        return Response.json({ error: "No response from Gemini" }, { status: 502 })
      }

      const parsedData = JSON.parse(extractJsonPayload(textContent))

      return Response.json({ success: true, data: parsedData })
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (err: unknown) {
    const error = err as Error & { status?: number }
    console.error("[v0] Resume processing error:", error)

    if (error?.name === "AbortError") {
      return Response.json(
        { error: "Gemini request timed out. Please try again." },
        { status: 504 }
      )
    }

    return Response.json(
      { error: error?.message ?? "Failed to process resume." },
      { status: error?.status ?? 500 }
    )
  }
}
