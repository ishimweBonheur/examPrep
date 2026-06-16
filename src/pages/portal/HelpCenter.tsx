import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HelpCircle, Send, Loader2, ArrowRight } from 'lucide-react'
import { streamHelpChat } from '@/api/http'

const QUICK_TOPICS = [
  'How do I complete payment?',
  'How do I change my class level?',
  'Where are past papers and resources?',
  'How does the AI Tutor work?',
  'I forgot my password',
]

export default function HelpCenter() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ask = async (text: string) => {
    const q = text.trim()
    if (!q) return
    setQuery(q)
    setResponse('')
    setError('')
    setLoading(true)
    try {
      await streamHelpChat(q, (chunk) => setResponse((prev) => prev + chunk))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not get help response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl flex items-center gap-2">
          <HelpCircle className="w-7 h-7 text-primary" /> Help Center
        </h1>
        <p className="text-muted-foreground mt-1">Describe your issue and our AI assistant will guide you to the right solution.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ask a question</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => { e.preventDefault(); void ask(query) }}
            className="flex gap-2"
          >
            <Input
              placeholder="e.g. How do I download past papers?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((topic) => (
              <Button key={topic} variant="outline" size="sm" disabled={loading} onClick={() => void ask(topic)}>
                {topic}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {(response || error || loading) && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Assistant</CardTitle></CardHeader>
          <CardContent>
            {loading && !response && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your question...
              </div>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            {response && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => {
                      const isInternal = href?.startsWith('/')
                      return isInternal
                        ? <Link to={href!} className="text-primary font-medium hover:underline inline-flex items-center gap-1">{children} <ArrowRight className="w-3 h-3" /></Link>
                        : <a href={href} target="_blank" rel="noreferrer" className="text-primary">{children}</a>
                    },
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          New to ExamPrep? <Link to="/demo" className="text-primary font-medium hover:underline">Watch the platform demo</Link> for a guided tour of all features.
        </CardContent>
      </Card>
    </div>
  )
}
