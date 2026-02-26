'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import parseLLMJson from '@/lib/jsonParser'
import {
  RiArticleLine,
  RiMailLine,
  RiMegaphoneLine,
  RiVideoLine,
  RiFileTextLine,
  RiHistoryLine,
  RiFileCopyLine,
  RiDownloadLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiLoader4Line,
  RiCheckLine,
  RiErrorWarningLine,
  RiDeleteBinLine,
  RiArrowLeftLine,
  RiEditLine,
  RiHashtag,
  RiLightbulbLine,
  RiBarChartLine,
  RiGroupLine,
  RiMenuLine,
  RiStarLine,
  RiRefreshLine,
} from 'react-icons/ri'
import { FiTwitter } from 'react-icons/fi'
import { HiOutlineSpeakerphone } from 'react-icons/hi'

// --- Constants ---
const MANAGER_AGENT_ID = '699ffd466a4eb8f58312ba37'
const REFINEMENT_AGENT_ID = '699ffd466a4eb8f58312ba39'
const HISTORY_KEY = 'content_studio_history'
const MAX_HISTORY = 50

// --- Types ---
interface ContentFormData {
  topic: string
  audience: string
  tone: string
  keyMessages: string
  platform: string
  wordCount: number
}

interface ManagerResponse {
  content_type?: string
  title?: string
  content_body?: string
  seo_keywords?: string[]
  research_summary?: string
  competitive_insights?: string
  audience_insights?: string
  meta_description?: string
  key_takeaways?: string[]
  cta_text?: string
  word_count?: number
  suggested_titles?: string[]
}

interface RefinementResponse {
  title?: string
  refined_content?: string
  changes_made?: string[]
  tone_assessment?: string
  brand_alignment_score?: string
  suggestions?: string[]
}

interface HistoryItem {
  id: string
  contentType: string
  topic: string
  generatedAt: string
  title: string
  contentBody: string
  seoKeywords: string[]
  formData: ContentFormData
}

interface FeedbackData {
  toneAdjustment: string
  feedbackText: string
  brandNotes: string
}

// --- Content Types ---
const CONTENT_TYPES = [
  { id: 'blog_post', label: 'Blog Post', icon: RiArticleLine },
  { id: 'social_media', label: 'Social Media', icon: FiTwitter },
  { id: 'email_campaign', label: 'Email Campaign', icon: RiMailLine },
  { id: 'ad_copy', label: 'Ad Copy', icon: RiMegaphoneLine },
  { id: 'video_script', label: 'Video Script', icon: RiVideoLine },
  { id: 'case_study', label: 'Case Study', icon: RiFileTextLine },
] as const

const TONE_OPTIONS = ['Professional', 'Casual', 'Persuasive', 'Educational', 'Witty']
const PLATFORM_OPTIONS = ['Twitter/X', 'LinkedIn', 'Instagram', 'Facebook']

// --- Sample Data ---
const SAMPLE_FORM: ContentFormData = {
  topic: 'How AI is Transforming Content Marketing in 2025',
  audience: 'B2B marketing professionals and content strategists',
  tone: 'Professional',
  keyMessages: 'AI tools are augmenting human creativity, not replacing it. Companies using AI-driven content see 3x higher engagement. Personalization at scale is now achievable.',
  platform: '',
  wordCount: 1500,
}

const SAMPLE_MANAGER_RESPONSE: ManagerResponse = {
  content_type: 'Blog Post',
  title: 'How AI is Transforming Content Marketing in 2025: A Strategic Guide',
  content_body: '## Introduction\n\nThe content marketing landscape has undergone a seismic shift. With AI-powered tools becoming more sophisticated, marketers now have unprecedented capabilities to create, optimize, and distribute content at scale.\n\n## The Rise of AI in Content Marketing\n\nArtificial intelligence isn\'t just a buzzword anymore -- it\'s a **fundamental shift** in how content teams operate. From ideation to distribution, AI touches every stage of the content lifecycle.\n\n### Key Benefits\n\n- **Personalization at Scale**: AI enables marketers to create tailored content for different audience segments without proportional increases in resources\n- **Data-Driven Insights**: Machine learning algorithms analyze vast datasets to identify content gaps and opportunities\n- **Workflow Automation**: Repetitive tasks like formatting, scheduling, and basic optimization are handled automatically\n\n## Strategic Implementation\n\n1. Start with content auditing and gap analysis\n2. Implement AI tools for research and ideation\n3. Use AI-assisted writing for first drafts\n4. Maintain human oversight for brand voice and quality\n5. Leverage AI analytics for performance optimization\n\n## Conclusion\n\nThe future of content marketing lies in the synergy between human creativity and AI capabilities. Organizations that embrace this partnership will see measurable improvements in engagement, reach, and ROI.',
  seo_keywords: ['AI content marketing', 'content strategy 2025', 'AI marketing tools', 'content automation', 'personalized content', 'marketing AI'],
  research_summary: 'Research indicates that 78% of B2B marketers plan to increase AI adoption in their content workflows by 2025. Companies leveraging AI-assisted content creation report an average 3.2x improvement in content output with maintained quality standards.',
  competitive_insights: 'Major competitors are investing heavily in AI content tools. HubSpot, Jasper, and Copy.ai dominate the market. However, most organizations still lack a comprehensive AI content strategy, presenting an opportunity for early adopters.',
  audience_insights: 'B2B marketing professionals aged 28-45 are the primary consumers. They prefer data-backed, actionable content. LinkedIn and industry blogs are primary discovery channels. Average reading time preference: 7-10 minutes.',
  meta_description: 'Discover how AI is revolutionizing content marketing in 2025. Learn strategic frameworks for implementing AI tools to boost engagement and ROI.',
  key_takeaways: [
    'AI augments human creativity rather than replacing it',
    '78% of B2B marketers are increasing AI adoption',
    'Personalization at scale is the biggest competitive advantage',
    'Human oversight remains essential for brand consistency',
    'Early adopters see 3x higher engagement rates',
  ],
  cta_text: 'Download our free AI Content Marketing Playbook to start transforming your strategy today.',
  word_count: 1487,
  suggested_titles: [
    'The AI Revolution in Content Marketing: What 2025 Holds',
    '5 Ways AI is Reshaping Content Strategy for B2B Marketers',
    'Content Marketing Meets AI: A 2025 Strategic Blueprint',
  ],
}

const SAMPLE_REFINEMENT_RESPONSE: RefinementResponse = {
  title: 'How AI is Transforming Content Marketing in 2025: The Complete Strategic Guide',
  refined_content: '## Introduction\n\nThe content marketing landscape has undergone a **seismic shift**. As AI-powered tools reach new levels of sophistication, forward-thinking marketers now command unprecedented capabilities to create, optimize, and distribute content at scale -- all while maintaining the authentic human voice their audiences demand.\n\n## The Strategic Impact of AI\n\nAI is no longer a future promise. It is the present reality reshaping every facet of content operations.\n\n### Tangible Benefits for Your Team\n\n- **Hyper-Personalization**: Deliver tailored content experiences to each audience segment without scaling your team linearly\n- **Predictive Analytics**: Let machine learning surface content gaps and untapped opportunities before your competitors find them\n- **Intelligent Automation**: Free your creative team from formatting, scheduling, and basic optimization tasks\n\n## Your Implementation Roadmap\n\n1. Audit existing content and identify strategic gaps\n2. Deploy AI tools for research, ideation, and competitive analysis\n3. Adopt AI-assisted drafting with human editorial oversight\n4. Establish brand voice guardrails within AI workflows\n5. Measure, iterate, and optimize using AI-driven analytics\n\n## The Bottom Line\n\nThe most successful content teams in 2025 will be those that master the partnership between human creativity and AI efficiency. The question is not whether to adopt AI, but how quickly you can integrate it into your strategy.',
  changes_made: [
    'Strengthened opening with more compelling language',
    'Added "forward-thinking" qualifier to target audience appeal',
    'Reframed benefits with action-oriented language',
    'Added competitive urgency in analytics section',
    'Sharpened conclusion with clear call-to-action framing',
  ],
  tone_assessment: 'The refined content maintains a professional yet assertive tone, balancing authority with accessibility. Strategic language choices create urgency without being aggressive.',
  brand_alignment_score: '9.2/10',
  suggestions: [
    'Consider adding a customer success story or case study reference',
    'Include specific tool recommendations for different budget levels',
    'Add a downloadable checklist as a lead magnet',
  ],
}

// --- ErrorBoundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// --- Markdown Renderer ---
function formatInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) {
    const italicParts = text.split(/\*(.*?)\*/g)
    if (italicParts.length === 1) return text
    return (
      <>
        {italicParts.map((part, i) =>
          i % 2 === 1 ? (
            <em key={i} className="italic">
              {part}
            </em>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    )
  }
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold">
            {part}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2" style={{ lineHeight: '1.7', letterSpacing: '-0.02em' }}>
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-serif font-bold text-base mt-5 mb-2 text-foreground">
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-serif font-bold text-lg mt-6 mb-2 text-foreground">
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-serif font-bold text-xl mt-6 mb-3 text-foreground">
              {line.slice(2)}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-6 list-disc text-sm text-foreground">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-6 list-decimal text-sm text-foreground">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

// --- Sidebar Navigation ---
function SidebarNav({
  selectedType,
  onSelectType,
  onShowHistory,
  activeView,
  sidebarExpanded,
  onToggleSidebar,
}: {
  selectedType: string
  onSelectType: (id: string) => void
  onShowHistory: () => void
  activeView: string
  sidebarExpanded: boolean
  onToggleSidebar: () => void
}) {
  return (
    <div
      className={`h-full bg-card border-r border-border flex flex-col transition-all duration-200 ${sidebarExpanded ? 'w-[220px]' : 'w-[64px]'}`}
    >
      <div className="p-4 border-b border-border flex items-center gap-2">
        <button onClick={onToggleSidebar} className="p-1 hover:bg-secondary transition-colors">
          <RiMenuLine className="w-5 h-5 text-foreground" />
        </button>
        {sidebarExpanded && (
          <span className="font-serif font-bold text-lg text-foreground tracking-tight whitespace-nowrap">
            Content Studio
          </span>
        )}
      </div>
      <nav className="flex-1 py-3">
        {CONTENT_TYPES.map((ct) => {
          const Icon = ct.icon
          const isActive = selectedType === ct.id && activeView === 'dashboard'
          return (
            <button
              key={ct.id}
              onClick={() => onSelectType(ct.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-2 ${isActive ? 'bg-secondary border-l-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground border-l-transparent'}`}
              title={ct.label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && <span className="truncate">{ct.label}</span>}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-border py-3">
        <button
          onClick={onShowHistory}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-2 ${activeView === 'history' ? 'bg-secondary border-l-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground border-l-transparent'}`}
          title="History"
        >
          <RiHistoryLine className="w-5 h-5 flex-shrink-0" />
          {sidebarExpanded && <span>History</span>}
        </button>
      </div>
    </div>
  )
}

// --- Content Type Selector Grid ---
function ContentTypeGrid({
  selectedType,
  onSelectType,
}: {
  selectedType: string
  onSelectType: (id: string) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CONTENT_TYPES.map((ct) => {
        const Icon = ct.icon
        const isActive = selectedType === ct.id
        return (
          <button
            key={ct.id}
            onClick={() => onSelectType(ct.id)}
            className={`flex flex-col items-center gap-1.5 p-3 border text-xs transition-colors ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground'}`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium leading-tight text-center">{ct.label}</span>
          </button>
        )
      })}
    </div>
  )
}

// --- Input Form ---
function InputForm({
  formData,
  setFormData,
  selectedType,
  isGenerating,
  onGenerate,
  error,
}: {
  formData: ContentFormData
  setFormData: React.Dispatch<React.SetStateAction<ContentFormData>>
  selectedType: string
  isGenerating: boolean
  onGenerate: () => void
  error: string
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Topic / Subject
        </label>
        <input
          type="text"
          placeholder="Enter your topic..."
          value={formData.topic}
          onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Target Audience
        </label>
        <input
          type="text"
          placeholder="e.g., B2B tech buyers"
          value={formData.audience}
          onChange={(e) => setFormData((prev) => ({ ...prev, audience: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Tone / Voice
        </label>
        <select
          value={formData.tone}
          onChange={(e) => setFormData((prev) => ({ ...prev, tone: e.target.value }))}
          className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
        >
          <option value="">Select tone...</option>
          {TONE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Key Messages
        </label>
        <textarea
          placeholder="Key points to cover..."
          value={formData.keyMessages}
          onChange={(e) => setFormData((prev) => ({ ...prev, keyMessages: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none transition-colors"
        />
      </div>

      {selectedType === 'social_media' && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData((prev) => ({ ...prev, platform: e.target.value }))}
            className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
          >
            <option value="">Select platform...</option>
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Word Count Target: {formData.wordCount}
        </label>
        <input
          type="range"
          min={300}
          max={5000}
          step={100}
          value={formData.wordCount}
          onChange={(e) => setFormData((prev) => ({ ...prev, wordCount: Number(e.target.value) }))}
          className="w-full accent-[hsl(0,80%,45%)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>300</span>
          <span>5000</span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 border border-destructive bg-destructive/5 text-sm text-destructive">
          <RiErrorWarningLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={isGenerating || !formData.topic.trim()}
        className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <RiLoader4Line className="w-4 h-4 animate-spin" />
            Researching & Writing...
          </>
        ) : (
          'Generate Content'
        )}
      </button>
    </div>
  )
}

// --- Collapsible Section ---
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {icon}
          {title}
        </div>
        {isOpen ? (
          <RiArrowUpSLine className="w-4 h-4 text-muted-foreground" />
        ) : (
          <RiArrowDownSLine className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 py-4 bg-card">{children}</div>}
    </div>
  )
}

// --- Output Panel ---
function OutputPanel({
  content,
  refinement,
  onCopy,
  onExport,
  copySuccess,
  showRefinement,
}: {
  content: ManagerResponse | null
  refinement: RefinementResponse | null
  onCopy: () => void
  onExport: () => void
  copySuccess: boolean
  showRefinement: boolean
}) {
  if (!content) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <RiEditLine className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="font-serif text-xl font-bold text-foreground mb-2">Ready to Create</h3>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          Select a content type and provide your topic details to generate researched, SEO-optimized content powered by AI.
        </p>
      </div>
    )
  }

  const displayTitle = showRefinement && refinement?.title ? refinement.title : content?.title ?? 'Untitled'
  const displayBody = showRefinement && refinement?.refined_content ? refinement.refined_content : content?.content_body ?? ''
  const seoKeywords = Array.isArray(content?.seo_keywords) ? content.seo_keywords : []
  const keyTakeaways = Array.isArray(content?.key_takeaways) ? content.key_takeaways : []
  const suggestedTitles = Array.isArray(content?.suggested_titles) ? content.suggested_titles : []
  const changesMade = Array.isArray(refinement?.changes_made) ? refinement.changes_made : []
  const refineSuggestions = Array.isArray(refinement?.suggestions) ? refinement.suggestions : []

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Action Bar */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {content?.content_type && (
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {content.content_type}
            </span>
          )}
          {(content?.word_count ?? 0) > 0 && (
            <span className="text-xs text-muted-foreground border-l border-border pl-3">
              {content?.word_count} words
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-secondary transition-colors"
          >
            {copySuccess ? (
              <>
                <RiCheckLine className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <RiFileCopyLine className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-secondary transition-colors"
          >
            <RiDownloadLine className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
          {displayTitle}
        </h1>

        {/* Meta Description */}
        {content?.meta_description && (
          <div className="mb-6 p-4 bg-secondary/50 border-l-2 border-l-accent">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1 font-medium">
              Meta Description
            </p>
            <p className="text-sm text-foreground italic">{content.meta_description}</p>
          </div>
        )}

        {/* Main Content Body */}
        <div className="mb-8">{renderMarkdown(displayBody)}</div>

        {/* CTA */}
        {content?.cta_text && (
          <div className="mb-8 p-4 bg-primary text-primary-foreground">
            <p className="text-sm font-medium">{content.cta_text}</p>
          </div>
        )}

        {/* SEO Keywords */}
        {seoKeywords.length > 0 && (
          <CollapsibleSection title={`SEO Keywords (${seoKeywords.length})`} icon={<RiHashtag className="w-4 h-4" />} defaultOpen>
            <div className="flex flex-wrap gap-2">
              {seoKeywords.map((kw, idx) => (
                <span key={idx} className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                  {kw}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Key Takeaways */}
        {keyTakeaways.length > 0 && (
          <div className="mt-4">
            <CollapsibleSection title="Key Takeaways" icon={<RiLightbulbLine className="w-4 h-4" />} defaultOpen>
              <ul className="space-y-2">
                {keyTakeaways.map((tk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <RiCheckLine className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(0, 80%, 45%)' }} />
                    <span>{tk}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>
        )}

        {/* Research Insights */}
        {(content?.research_summary || content?.competitive_insights || content?.audience_insights) && (
          <div className="mt-4">
            <CollapsibleSection title="Research Insights" icon={<RiSearchLine className="w-4 h-4" />}>
              <div className="space-y-4">
                {content?.research_summary && (
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <RiBarChartLine className="w-3.5 h-3.5" />
                      Research Summary
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">{content.research_summary}</p>
                  </div>
                )}
                {content?.competitive_insights && (
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <HiOutlineSpeakerphone className="w-3.5 h-3.5" />
                      Competitive Insights
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">{content.competitive_insights}</p>
                  </div>
                )}
                {content?.audience_insights && (
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <RiGroupLine className="w-3.5 h-3.5" />
                      Audience Insights
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">{content.audience_insights}</p>
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Suggested Titles */}
        {suggestedTitles.length > 0 && (
          <div className="mt-4">
            <CollapsibleSection title="Alternative Titles" icon={<RiStarLine className="w-4 h-4" />}>
              <ul className="space-y-2">
                {suggestedTitles.map((st, idx) => (
                  <li key={idx} className="text-sm text-foreground p-2 bg-secondary/50 border border-border">
                    {st}
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          </div>
        )}

        {/* Refinement Results */}
        {showRefinement && refinement && (
          <div className="mt-6 border-t-2 pt-6" style={{ borderColor: 'hsl(0, 80%, 45%)' }}>
            <h3 className="font-serif text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <RiRefreshLine className="w-5 h-5" style={{ color: 'hsl(0, 80%, 45%)' }} />
              Refinement Results
            </h3>

            {refinement?.tone_assessment && (
              <div className="mb-3 p-3 bg-secondary/50 border border-border">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Tone Assessment</p>
                <p className="text-sm text-foreground">{refinement.tone_assessment}</p>
              </div>
            )}

            {refinement?.brand_alignment_score && (
              <div className="mb-3 p-3 bg-secondary/50 border border-border">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Brand Alignment Score</p>
                <p className="text-lg font-bold" style={{ color: 'hsl(0, 80%, 45%)' }}>{refinement.brand_alignment_score}</p>
              </div>
            )}

            {changesMade.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Changes Made</p>
                <ul className="space-y-1.5">
                  {changesMade.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <RiCheckLine className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {refineSuggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Further Suggestions</p>
                <ul className="space-y-1.5">
                  {refineSuggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <RiLightbulbLine className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(0, 80%, 45%)' }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Feedback Panel ---
function FeedbackPanel({
  feedbackData,
  setFeedbackData,
  isRefining,
  onRefine,
  error,
}: {
  feedbackData: FeedbackData
  setFeedbackData: React.Dispatch<React.SetStateAction<FeedbackData>>
  isRefining: boolean
  onRefine: () => void
  error: string
}) {
  return (
    <div className="border-t border-border pt-5 space-y-4">
      <h3 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider">Refine Content</h3>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tone Adjustment</label>
        <div className="flex flex-wrap gap-2">
          {['More Formal', 'More Casual', 'Shorter', 'Longer', 'More Persuasive', 'More Data-Driven'].map((opt) => (
            <button
              key={opt}
              onClick={() => setFeedbackData((prev) => ({ ...prev, toneAdjustment: prev.toneAdjustment === opt ? '' : opt }))}
              className={`px-3 py-1.5 text-xs border transition-colors ${feedbackData.toneAdjustment === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-foreground hover:text-foreground'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Specific Feedback</label>
        <textarea
          placeholder="Add specific feedback or revision notes..."
          value={feedbackData.feedbackText}
          onChange={(e) => setFeedbackData((prev) => ({ ...prev, feedbackText: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Brand Alignment Notes</label>
        <textarea
          placeholder="Describe your brand voice, guidelines, or specific requirements..."
          value={feedbackData.brandNotes}
          onChange={(e) => setFeedbackData((prev) => ({ ...prev, brandNotes: e.target.value }))}
          rows={2}
          className="w-full px-3 py-2.5 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground resize-none transition-colors"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 border border-destructive bg-destructive/5 text-sm text-destructive">
          <RiErrorWarningLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={onRefine}
        disabled={isRefining || (!feedbackData.toneAdjustment && !feedbackData.feedbackText.trim() && !feedbackData.brandNotes.trim())}
        className="w-full py-2.5 bg-secondary text-secondary-foreground border border-border font-medium text-sm hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isRefining ? (
          <>
            <RiLoader4Line className="w-4 h-4 animate-spin" />
            Refining...
          </>
        ) : (
          'Refine with Feedback'
        )}
      </button>
    </div>
  )
}

// --- History Panel ---
function HistoryPanel({
  history,
  onLoadItem,
  onDeleteItem,
  onClearAll,
  onBack,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
}: {
  history: HistoryItem[]
  onLoadItem: (item: HistoryItem) => void
  onDeleteItem: (id: string) => void
  onClearAll: () => void
  onBack: () => void
  filterType: string
  setFilterType: (v: string) => void
  searchQuery: string
  setSearchQuery: (v: string) => void
}) {
  const filteredHistory = history.filter((item) => {
    const matchesType = filterType === 'all' || item.contentType === filterType
    const matchesSearch = !searchQuery.trim() || item.topic.toLowerCase().includes(searchQuery.toLowerCase()) || item.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getIcon = (type: string) => {
    const found = CONTENT_TYPES.find((ct) => ct.id === type)
    if (found) {
      const Icon = found.icon
      return <Icon className="w-4 h-4" />
    }
    return <RiFileTextLine className="w-4 h-4" />
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 border border-border hover:bg-secondary transition-colors">
              <RiArrowLeftLine className="w-4 h-4" />
            </button>
            <h2 className="font-serif text-xl font-bold text-foreground">Content History</h2>
          </div>
          {history.length > 0 && (
            <button onClick={onClearAll} className="text-xs text-muted-foreground hover:text-destructive transition-colors">
              Clear All
            </button>
          )}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by topic or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Types</option>
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.id} value={ct.id}>{ct.label}</option>
            ))}
          </select>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <RiHistoryLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{history.length === 0 ? 'No content generated yet' : 'No matching results'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div key={item.id} className="border border-border bg-card p-4 hover:border-foreground/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 text-muted-foreground">{getIcon(item.contentType)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.generatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => onLoadItem(item)} className="px-2.5 py-1 text-xs border border-border hover:bg-secondary transition-colors text-foreground">
                      Use as Template
                    </button>
                    <button onClick={() => onDeleteItem(item.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <RiDeleteBinLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Agent Status ---
function AgentStatus({ activeAgentId }: { activeAgentId: string }) {
  const agents = [
    { id: MANAGER_AGENT_ID, name: 'Content Orchestrator', desc: 'Research, SEO, and content generation' },
    { id: REFINEMENT_AGENT_ID, name: 'Brand Refinement', desc: 'Tone, feedback, and brand alignment' },
  ]

  return (
    <div className="border-t border-border p-4 bg-card">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">AI Agents</p>
      <div className="space-y-1.5">
        {agents.map((a) => (
          <div key={a.id} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 flex-shrink-0 ${activeAgentId === a.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{a.name}</p>
              <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ========== MAIN PAGE ==========
export default function Page() {
  const [selectedContentType, setSelectedContentType] = useState('blog_post')
  const [formData, setFormData] = useState<ContentFormData>({
    topic: '',
    audience: '',
    tone: '',
    keyMessages: '',
    platform: '',
    wordCount: 1200,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<ManagerResponse | null>(null)
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    toneAdjustment: '',
    feedbackText: '',
    brandNotes: '',
  })
  const [isRefining, setIsRefining] = useState(false)
  const [refinedContent, setRefinedContent] = useState<RefinementResponse | null>(null)
  const [showRefinement, setShowRefinement] = useState(false)
  const [contentHistory, setContentHistory] = useState<HistoryItem[]>([])
  const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [generateError, setGenerateError] = useState('')
  const [refineError, setRefineError] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState('')
  const [sampleDataOn, setSampleDataOn] = useState(false)
  const [historyFilterType, setHistoryFilterType] = useState('all')
  const [historySearchQuery, setHistorySearchQuery] = useState('')
  const [mobileInputOpen, setMobileInputOpen] = useState(true)

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setContentHistory(parsed)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const saveHistory = useCallback((items: HistoryItem[]) => {
    const trimmed = items.slice(0, MAX_HISTORY)
    setContentHistory(trimmed)
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
    } catch {
      // ignore
    }
  }, [])

  // Sample data toggle
  useEffect(() => {
    if (sampleDataOn) {
      setFormData(SAMPLE_FORM)
      setGeneratedContent(SAMPLE_MANAGER_RESPONSE)
      setRefinedContent(SAMPLE_REFINEMENT_RESPONSE)
      setShowRefinement(true)
      setFeedbackData({
        toneAdjustment: 'More Formal',
        feedbackText: 'Strengthen the opening hook and add more competitive urgency.',
        brandNotes: 'We position ourselves as thought leaders. Use assertive but not aggressive language.',
      })
    } else {
      setFormData({ topic: '', audience: '', tone: '', keyMessages: '', platform: '', wordCount: 1200 })
      setGeneratedContent(null)
      setRefinedContent(null)
      setShowRefinement(false)
      setFeedbackData({ toneAdjustment: '', feedbackText: '', brandNotes: '' })
    }
  }, [sampleDataOn])

  const handleSelectType = useCallback((id: string) => {
    setSelectedContentType(id)
    setActiveView('dashboard')
  }, [])

  // Generate Content
  const handleGenerate = useCallback(async () => {
    if (!formData.topic.trim()) return
    setIsGenerating(true)
    setGenerateError('')
    setGeneratedContent(null)
    setRefinedContent(null)
    setShowRefinement(false)
    setActiveAgentId(MANAGER_AGENT_ID)

    const contentTypeLabel = CONTENT_TYPES.find((ct) => ct.id === selectedContentType)?.label ?? selectedContentType

    let message = `Content Type: ${contentTypeLabel}\nTopic: ${formData.topic}`
    if (formData.audience.trim()) message += `\nTarget Audience: ${formData.audience}`
    if (formData.tone) message += `\nTone/Voice: ${formData.tone}`
    if (formData.keyMessages.trim()) message += `\nKey Messages: ${formData.keyMessages}`
    if (selectedContentType === 'social_media' && formData.platform) {
      message += `\nPlatform: ${formData.platform}`
    }
    message += `\nWord Count Target: ${formData.wordCount}`
    message += `\n\nPlease research this topic and generate a complete ${contentTypeLabel} draft.`

    try {
      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success) {
        const parsed = parseLLMJson(result.response)
        const data = parsed?.result || parsed || result?.response?.result || {}

        const managerData: ManagerResponse = {
          content_type: data?.content_type ?? contentTypeLabel,
          title: data?.title ?? '',
          content_body: data?.content_body ?? '',
          seo_keywords: Array.isArray(data?.seo_keywords) ? data.seo_keywords : [],
          research_summary: data?.research_summary ?? '',
          competitive_insights: data?.competitive_insights ?? '',
          audience_insights: data?.audience_insights ?? '',
          meta_description: data?.meta_description ?? '',
          key_takeaways: Array.isArray(data?.key_takeaways) ? data.key_takeaways : [],
          cta_text: data?.cta_text ?? '',
          word_count: typeof data?.word_count === 'number' ? data.word_count : 0,
          suggested_titles: Array.isArray(data?.suggested_titles) ? data.suggested_titles : [],
        }

        setGeneratedContent(managerData)

        // Save to history
        const now = new Date()
        const historyItem: HistoryItem = {
          id: `${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
          contentType: selectedContentType,
          topic: formData.topic,
          generatedAt: now.toLocaleString(),
          title: managerData.title || 'Untitled',
          contentBody: managerData.content_body || '',
          seoKeywords: managerData.seo_keywords || [],
          formData: { ...formData },
        }
        saveHistory([historyItem, ...contentHistory])
        setMobileInputOpen(false)
      } else {
        setGenerateError(result?.error ?? 'Content generation failed. Please try again.')
      }
    } catch {
      setGenerateError('An unexpected error occurred. Please try again.')
    } finally {
      setIsGenerating(false)
      setActiveAgentId('')
    }
  }, [formData, selectedContentType, contentHistory, saveHistory])

  // Refine Content
  const handleRefine = useCallback(async () => {
    if (!generatedContent) return
    setIsRefining(true)
    setRefineError('')
    setActiveAgentId(REFINEMENT_AGENT_ID)

    const currentBody = showRefinement && refinedContent?.refined_content ? refinedContent.refined_content : generatedContent?.content_body ?? ''
    const currentTitle = showRefinement && refinedContent?.title ? refinedContent.title : generatedContent?.title ?? ''

    let message = `Original Content:\nTitle: ${currentTitle}\nContent: ${currentBody}\n\nUser Feedback:`
    if (feedbackData.toneAdjustment) message += `\nTone Adjustment: ${feedbackData.toneAdjustment}`
    if (feedbackData.feedbackText.trim()) message += `\nSpecific Feedback: ${feedbackData.feedbackText}`
    if (feedbackData.brandNotes.trim()) message += `\nBrand Notes: ${feedbackData.brandNotes}`
    message += '\n\nPlease refine this content based on the feedback above.'

    try {
      const result = await callAIAgent(message, REFINEMENT_AGENT_ID)

      if (result.success) {
        const parsed = parseLLMJson(result.response)
        const data = parsed?.result || parsed || result?.response?.result || {}

        const refinementData: RefinementResponse = {
          title: data?.title ?? '',
          refined_content: data?.refined_content ?? '',
          changes_made: Array.isArray(data?.changes_made) ? data.changes_made : [],
          tone_assessment: data?.tone_assessment ?? '',
          brand_alignment_score: data?.brand_alignment_score ?? '',
          suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
        }

        setRefinedContent(refinementData)
        setShowRefinement(true)
      } else {
        setRefineError(result?.error ?? 'Refinement failed. Please try again.')
      }
    } catch {
      setRefineError('An unexpected error occurred. Please try again.')
    } finally {
      setIsRefining(false)
      setActiveAgentId('')
    }
  }, [generatedContent, refinedContent, showRefinement, feedbackData])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    const title = showRefinement && refinedContent?.title ? refinedContent.title : generatedContent?.title ?? ''
    const body = showRefinement && refinedContent?.refined_content ? refinedContent.refined_content : generatedContent?.content_body ?? ''
    const text = `${title}\n\n${body}`
    const success = await copyToClipboard(text)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }, [generatedContent, refinedContent, showRefinement])

  // Export as text
  const handleExport = useCallback(() => {
    const title = showRefinement && refinedContent?.title ? refinedContent.title : generatedContent?.title ?? ''
    const body = showRefinement && refinedContent?.refined_content ? refinedContent.refined_content : generatedContent?.content_body ?? ''
    const text = `${title}\n\n${body}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'content').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generatedContent, refinedContent, showRefinement])

  // History actions
  const handleLoadHistoryItem = useCallback((item: HistoryItem) => {
    setFormData(item.formData)
    setSelectedContentType(item.contentType)
    setActiveView('dashboard')
    setGeneratedContent(null)
    setRefinedContent(null)
    setShowRefinement(false)
  }, [])

  const handleDeleteHistoryItem = useCallback(
    (id: string) => {
      const updated = contentHistory.filter((item) => item.id !== id)
      saveHistory(updated)
    },
    [contentHistory, saveHistory]
  )

  const handleClearHistory = useCallback(() => {
    saveHistory([])
  }, [saveHistory])

  return (
    <ErrorBoundary>
      <div className="min-h-screen h-screen bg-background text-foreground flex flex-col overflow-hidden" style={{ letterSpacing: '-0.02em' }}>
        {/* Top Header */}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-base text-foreground tracking-tight lg:hidden">Content Studio</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-muted-foreground font-medium">Sample Data</span>
              <button
                role="switch"
                aria-checked={sampleDataOn}
                onClick={() => setSampleDataOn(!sampleDataOn)}
                className={`relative w-9 h-5 transition-colors flex-shrink-0 ${sampleDataOn ? 'bg-[hsl(0,80%,45%)]' : 'bg-muted'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white transition-transform ${sampleDataOn ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </label>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar (hidden on mobile) */}
          <div className="hidden lg:flex flex-shrink-0">
            <SidebarNav
              selectedType={selectedContentType}
              onSelectType={handleSelectType}
              onShowHistory={() => setActiveView('history')}
              activeView={activeView}
              sidebarExpanded={sidebarExpanded}
              onToggleSidebar={() => setSidebarExpanded(!sidebarExpanded)}
            />
          </div>

          {/* Content Area */}
          {activeView === 'history' ? (
            <HistoryPanel
              history={contentHistory}
              onLoadItem={handleLoadHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearHistory}
              onBack={() => setActiveView('dashboard')}
              filterType={historyFilterType}
              setFilterType={setHistoryFilterType}
              searchQuery={historySearchQuery}
              setSearchQuery={setHistorySearchQuery}
            />
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Mobile Tab Bar */}
              <div className="lg:hidden flex border-b border-border bg-card flex-shrink-0">
                <button
                  onClick={() => setMobileInputOpen(true)}
                  className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${mobileInputOpen ? 'border-b-2 border-b-[hsl(0,80%,45%)] text-foreground' : 'text-muted-foreground'}`}
                >
                  Input
                </button>
                <button
                  onClick={() => setMobileInputOpen(false)}
                  className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors ${!mobileInputOpen ? 'border-b-2 border-b-[hsl(0,80%,45%)] text-foreground' : 'text-muted-foreground'}`}
                >
                  Output
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className="flex-1 py-2.5 text-xs font-medium text-center text-muted-foreground"
                >
                  History
                </button>
              </div>

              {/* Input Panel */}
              <div className={`lg:w-[380px] xl:w-[420px] border-r border-border bg-card flex flex-col flex-shrink-0 overflow-y-auto ${mobileInputOpen ? 'flex' : 'hidden lg:flex'}`}>
                <div className="p-5 space-y-6 flex-1">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider mb-3">Content Type</h3>
                    <ContentTypeGrid selectedType={selectedContentType} onSelectType={handleSelectType} />
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-sm text-foreground uppercase tracking-wider mb-3">Details</h3>
                    <InputForm
                      formData={formData}
                      setFormData={setFormData}
                      selectedType={selectedContentType}
                      isGenerating={isGenerating}
                      onGenerate={handleGenerate}
                      error={generateError}
                    />
                  </div>

                  {generatedContent && (
                    <FeedbackPanel
                      feedbackData={feedbackData}
                      setFeedbackData={setFeedbackData}
                      isRefining={isRefining}
                      onRefine={handleRefine}
                      error={refineError}
                    />
                  )}
                </div>

                <AgentStatus activeAgentId={activeAgentId} />
              </div>

              {/* Output Panel */}
              <div className={`flex-1 flex flex-col bg-background overflow-hidden ${!mobileInputOpen ? 'flex' : 'hidden lg:flex'}`}>
                <OutputPanel
                  content={generatedContent}
                  refinement={refinedContent}
                  onCopy={handleCopy}
                  onExport={handleExport}
                  copySuccess={copySuccess}
                  showRefinement={showRefinement}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
