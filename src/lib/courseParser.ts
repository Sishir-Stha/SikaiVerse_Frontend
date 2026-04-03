import type { Course } from '../components/CourseCard'

export function parseCoursesFromResponse(response: string): Course[] {
  const normalized = response
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const courses: Course[] = []

  // Primary grammar: explicit Level/Rating tags.
  const levelBlocks = normalized.split(/(?=Level:\s*[^,]+,\s*Rating:\s*[\d.]+(?:\/5)?)/gi)

  levelBlocks.forEach(block => {
    const levelMatch = block.match(/Level:\s*([^,\.\n]+)/i)
    const ratingMatch = block.match(/Rating:\s*([\d.]+)(?:\/5)?/i)

    if (!levelMatch || !ratingMatch) {
      return
    }

    const titleCandidate = block
      .split(/Level:/i)[0]
      .replace(/^(Here(?:'s)?\s*)/i, '')
      .trim()

    const titleSentences = titleCandidate.split(/[.!?]/).map(s => s.trim()).filter(Boolean)
    const title = titleSentences[0] || 'Course recommendation'
    const description = titleSentences.slice(1, 3).join('. ').trim() || undefined

    const categoryMatch = block.match(/Category:\s*([^,\.\n]+)/i)
    const instructorMatch = block.match(/(?:Created by|created by|By|by)\s+([^,\.\n]+)/i)

    courses.push({
      name: title,
      description,
      level: levelMatch[1].trim(),
      rating: parseFloat(ratingMatch[1]),
      category: categoryMatch ? categoryMatch[1].trim() : undefined,
      instructor: instructorMatch ? instructorMatch[1].trim() : undefined,
    })
  })

  if (courses.length > 0) {
    return courses
  }

  // Fallback grammar: parentheses style like "React Fundamentals (beginner, 4.5/5)"
  const parenRegex = /([^\.\n]+?)\s*\(\s*(beginner|intermediate|advanced)\s*,\s*([\d.]+)(?:\/5)?\s*\)/gi
  const matches = [...normalized.matchAll(parenRegex)]

  matches.forEach((match, index) => {
    const rawTitle = match[1].trim()
    const level = match[2].trim()
    const rating = parseFloat(match[3])

    // Limit description from section after the title match, before the next match or end
    const startIdx = match.index! + match[0].length
    const endIdx = index + 1 < matches.length ? matches[index + 1].index! : normalized.length
    const section = normalized.slice(startIdx, endIdx).trim()

    const categoryMatch = section.match(/Category:\s*([^,\.\n]+)/i)
    const instructorMatch = section.match(/(?:Created by|created by|By|by)\s+([^,\.\n]+)/i)

    let description: string | undefined
    if (section) {
      const firstSentence = section.split(/[.!?]/).map(s => s.trim()).filter(Boolean)[0]
      if (firstSentence) {
        description = firstSentence
      }
    }

    courses.push({
      name: rawTitle,
      description,
      level,
      rating,
      category: categoryMatch ? categoryMatch[1].trim() : undefined,
      instructor: instructorMatch ? instructorMatch[1].trim() : undefined,
    })
  })

  // Trim to 5 to prevent huge lists in chatbot
  return courses.slice(0, 5)
}

export function isCourseResponse(input: string): boolean {
  const courseKeywords = [
    'course',
    'courses',
    'learn',
    'java',
    'python',
    'javascript',
    'flutter',
    'kotlin',
    'android',
    'react',
    'node',
    'typescript',
    'webdev',
    'mobile',
    'programming',
  ]

  const lowercaseInput = input.toLowerCase()
  return courseKeywords.some(keyword => lowercaseInput.includes(keyword))
}
