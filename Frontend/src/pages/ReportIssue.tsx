import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { ApiError, api } from '../api/client'
import LocationPicker, { type LatLng } from '../components/map/LocationPicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { Field, Input, Select, Textarea } from '../components/ui/Field'
import { SeverityBadge, CategoryBadge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { CATEGORIES, SEVERITIES } from '../lib/constants'
import type { AnalysisResult, Category, Severity } from '../types'

const MAX_SIZE_MB = 10
const ACCEPTED = ['image/jpeg', 'image/png']

function isAcceptedFile(file: File): boolean {
  return ACCEPTED.includes(file.type) || /\.(jpe?g|png)$/i.test(file.name)
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-teal-500 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export default function ReportIssue() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  const [override, setOverride] = useState(false)
  const [manualCategory, setManualCategory] = useState<Category | ''>('')
  const [manualSeverity, setManualSeverity] = useState<Severity | ''>('')
  const [manualDescription, setManualDescription] = useState('')

  const [location, setLocation] = useState<LatLng | null>(null)
  const [address, setAddress] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function selectFile(selected: File | null) {
    setSubmitError(null)
    if (!selected) return
    if (!isAcceptedFile(selected)) {
      setFileError('Please upload a JPG, JPEG or PNG image.')
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`Image is too large (max ${MAX_SIZE_MB} MB).`)
      return
    }
    setFileError(null)
    setFile(selected)
    setAnalysis(null)
    setAnalysisError(null)
    setOverride(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragActive(false)
    selectFile(event.dataTransfer.files?.[0] ?? null)
  }

  async function handleAnalyze() {
    if (!file) {
      setAnalysisError('Upload an image first.')
      return
    }
    setAnalyzing(true)
    setAnalysisError(null)
    setAnalysis(null)
    try {
      const result = await api.analyze(file)
      setAnalysis(result)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Analysis failed.'
      setAnalysisError(message)
      setOverride(true)
    } finally {
      setAnalyzing(false)
    }
  }

  function enableOverride() {
    if (analysis && !manualCategory && !manualSeverity) {
      setManualCategory(analysis.category)
      setManualSeverity(analysis.severity)
      setManualDescription(analysis.description)
    }
    setOverride(true)
  }

  const effective = useMemo(() => {
    if (!override && analysis) {
      return {
        category: analysis.category,
        severity: analysis.severity,
        description: analysis.description,
        confidence: analysis.confidence,
      }
    }
    return {
      category: manualCategory || '',
      severity: manualSeverity || '',
      description: manualDescription,
      confidence: 0,
    }
  }, [override, analysis, manualCategory, manualSeverity, manualDescription])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitError(null)

    if (!file) {
      setSubmitError('Please upload an image of the issue.')
      return
    }
    if (!effective.category || !effective.severity) {
      setSubmitError('Classification is missing — run the AI analysis or classify manually.')
      return
    }

    setSubmitting(true)
    try {
      const report = await api.createReport({
        image: file,
        category: effective.category,
        severity: effective.severity,
        confidence: effective.confidence,
        description: effective.description,
        latitude: location?.lat ?? null,
        longitude: location?.lng ?? null,
        address: address.trim(),
      })
      toast('Report submitted successfully.', 'success')
      navigate(`/reports/${report.id}`)
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Could not submit the report.')
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-50 py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-navy-950">Report an issue</h1>
          <p className="mt-2 text-slate-600">
            Upload a photo, let AI classify it, pin the location and submit.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Left column: image + AI analysis */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                1 · Photo of the issue
              </h2>

              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragActive
                    ? 'border-teal-500 bg-teal-500/5'
                    : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-500/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
                />
                <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {file ? file.name : 'Drag & drop an image, or click to browse'}
                </p>
                <p className="mt-1 text-xs text-slate-500">JPG or PNG, up to {MAX_SIZE_MB} MB</p>
              </label>
              {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}

              {previewUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                  <img src={previewUrl} alt="Preview" className="max-h-72 w-full object-contain bg-slate-100" />
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  2 · AI analysis
                </h2>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAnalyze}
                  loading={analyzing}
                  disabled={!file}
                >
                  Analyze with AI
                </Button>
              </div>

              {analyzing && (
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                  Analysing the image with Gemini…
                </div>
              )}

              {analysisError && !analyzing && (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-sm font-medium text-amber-800">AI analysis failed</p>
                  <p className="mt-1 text-xs text-amber-700">{analysisError}</p>
                  <p className="mt-2 text-xs text-amber-700">
                    You can still classify the issue manually below and submit your report.
                  </p>
                </div>
              )}

              {analysis && !analyzing && (
                <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <CategoryBadge value={analysis.category} />
                    <SeverityBadge value={analysis.severity} />
                  </div>
                  <p className="mt-3 text-sm text-slate-700">
                    {analysis.description || 'No description provided by AI.'}
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>AI confidence</span>
                      <span className="font-semibold text-navy-950">{analysis.confidence}%</span>
                    </div>
                    <ConfidenceBar value={analysis.confidence} />
                  </div>
                  <button
                    type="button"
                    onClick={enableOverride}
                    className="mt-3 text-xs font-semibold text-teal-600 hover:underline"
                  >
                    Adjust classification manually
                  </button>
                </div>
              )}

              {override && (
                <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Manual classification
                  </p>
                  <Field label="Category" htmlFor="manual-category" required>
                    <Select
                      id="manual-category"
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value as Category | '')}
                    >
                      <option value="">Select a category…</option>
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Severity" htmlFor="manual-severity" required>
                    <Select
                      id="manual-severity"
                      value={manualSeverity}
                      onChange={(e) => setManualSeverity(e.target.value as Severity | '')}
                    >
                      <option value="">Select severity…</option>
                      {SEVERITIES.map((severity) => (
                        <option key={severity} value={severity}>{severity}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Description" htmlFor="manual-description">
                    <Textarea
                      id="manual-description"
                      rows={3}
                      placeholder="Describe the issue…"
                      value={manualDescription}
                      onChange={(e) => setManualDescription(e.target.value)}
                    />
                  </Field>
                </div>
              )}
            </Card>
          </div>

          {/* Right column: location + submit */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                3 · Location
              </h2>
              <div className="mt-4">
                <LocationPicker value={location} onChange={setLocation} />
              </div>
              <div className="mt-4">
                <Field label="Address / landmark (optional)" htmlFor="address">
                  <Input
                    id="address"
                    placeholder="e.g. FC Road, Pune"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                4 · Review & submit
              </h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Image</span>
                  <span className="font-medium text-navy-950">{file ? 'Attached ✓' : 'Missing'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Classification</span>
                  <span className="font-medium text-navy-950">
                    {effective.category && effective.severity
                      ? `${effective.category} · ${effective.severity}`
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-navy-950">
                    {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : address || 'Not set'}
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <Button type="submit" loading={submitting} full className="mt-5">
                Submit Report
              </Button>
            </Card>
          </div>
        </form>
      </div>
    </div>
  )
}
