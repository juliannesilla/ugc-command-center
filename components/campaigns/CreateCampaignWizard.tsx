'use client';

// Implements: A.14p P1 — Campaign Creation Wizard (client component).
// 4-step form: Brand → Campaign → SOW → Review. On submit, generates a
// `npm run new-campaign -- ...` CLI string with auto-copy-to-clipboard. The
// actual folder copy + Linear issue + JSONL append runs in
// scripts/new-campaign.mjs on localhost (gh-pages cannot touch the filesystem).
//
// HR-2 PRESERVE: client-state-only, no server actions, no API routes. UI tokens
// (cloud-*, iris-*, ink-*, peach-*) match the existing palette. No new
// dependencies beyond React + lucide-react.
import * as React from 'react';
import {
  Building2,
  Sparkles,
  Link2,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

type Category = 'Beauty' | 'Tech' | 'Lifestyle' | 'Other';
const CATEGORIES: Category[] = ['Beauty', 'Tech', 'Lifestyle', 'Other'];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

interface FormState {
  brand: string;
  brandSlug: string;
  brandSlugTouched: boolean;
  campaign: string;
  campaignSlug: string;
  campaignSlugTouched: boolean;
  category: Category;
  sow: string;
}

const STEPS = [
  { id: 1, label: 'Brand', icon: Building2 },
  { id: 2, label: 'Campaign', icon: Sparkles },
  { id: 3, label: 'SOW', icon: Link2 },
  { id: 4, label: 'Review', icon: CheckCircle2 },
] as const;

export function CreateCampaignWizard() {
  const [step, setStep] = React.useState<1 | 2 | 3 | 4>(1);
  const [copied, setCopied] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    brand: '',
    brandSlug: '',
    brandSlugTouched: false,
    campaign: '',
    campaignSlug: '',
    campaignSlugTouched: false,
    category: 'Beauty',
    sow: '',
  });

  // Auto-derive slugs until user touches them
  React.useEffect(() => {
    if (!form.brandSlugTouched) {
      setForm((f) => ({ ...f, brandSlug: slugify(f.brand) }));
    }
  }, [form.brand, form.brandSlugTouched]);

  React.useEffect(() => {
    if (!form.campaignSlugTouched) {
      setForm((f) => ({ ...f, campaignSlug: slugify(f.campaign) }));
    }
  }, [form.campaign, form.campaignSlugTouched]);

  const step1Valid = form.brand.trim().length > 0 && form.brandSlug.length > 0;
  const step2Valid =
    form.campaign.trim().length > 0 && form.campaignSlug.length > 0;
  // Step 3 SOW is optional
  const canFinish = step1Valid && step2Valid;

  const command = React.useMemo(() => {
    const parts = [
      'npm run new-campaign --',
      `--brand="${form.brand}"`,
      `--brand-slug="${form.brandSlug}"`,
      `--campaign="${form.campaign}"`,
      `--campaign-slug="${form.campaignSlug}"`,
      `--category="${form.category}"`,
    ];
    if (form.sow.trim()) parts.push(`--sow="${form.sow.trim()}"`);
    return parts.join(' ');
  }, [form]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Older browsers / insecure context — fall back to selecting the textarea
      setCopied(false);
    }
  };

  const goNext = () => setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));

  return (
    <div className="rounded-3xl bg-white ring-1 ring-cloud-200 shadow-[0_4px_24px_-12px_rgba(60,30,90,0.12)] p-7 md:p-9">
      {/* Step rail */}
      <ol className="flex items-center gap-2 mb-9">
        {STEPS.map((s, i) => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          const Icon = s.icon;
          return (
            <li key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={[
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] tracking-[0.06em] uppercase font-medium transition-colors',
                  isActive
                    ? 'bg-iris-100 text-iris-700 ring-1 ring-iris-300'
                    : isDone
                    ? 'bg-cloud-100 text-ink-700'
                    : 'bg-cloud-50 text-ink-500',
                ].join(' ')}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-px',
                    isDone ? 'bg-iris-300' : 'bg-cloud-200',
                  ].join(' ')}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step content */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <FieldHeading
            title="Brand"
            subtitle="The company you're collaborating with."
          />
          <Field label="Brand name" htmlFor="brand">
            <input
              id="brand"
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="e.g. Sideshift"
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field
            label="Brand slug (folder-safe)"
            htmlFor="brandSlug"
            hint="Auto-generated from brand name. Edit if needed."
          >
            <input
              id="brandSlug"
              type="text"
              value={form.brandSlug}
              onChange={(e) =>
                setForm({
                  ...form,
                  brandSlug: slugify(e.target.value),
                  brandSlugTouched: true,
                })
              }
              placeholder="sideshift"
              className={`${inputClass} font-mono`}
            />
          </Field>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <FieldHeading
            title="Campaign"
            subtitle="This specific collab — usually one product launch or theme."
          />
          <Field label="Campaign name" htmlFor="campaign">
            <input
              id="campaign"
              type="text"
              value={form.campaign}
              onChange={(e) => setForm({ ...form, campaign: e.target.value })}
              placeholder="e.g. Q3 Creator Push"
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field
            label="Campaign slug"
            htmlFor="campaignSlug"
            hint="Auto-generated from campaign name."
          >
            <input
              id="campaignSlug"
              type="text"
              value={form.campaignSlug}
              onChange={(e) =>
                setForm({
                  ...form,
                  campaignSlug: slugify(e.target.value),
                  campaignSlugTouched: true,
                })
              }
              placeholder="q3-creator-push"
              className={`${inputClass} font-mono`}
            />
          </Field>
          <Field label="Category" htmlFor="category">
            <select
              id="category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as Category })
              }
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <FieldHeading
            title="Statement of Work (optional)"
            subtitle="Drop a link OR paste the raw SOW. Skip if you don't have one yet — you can always add it later."
          />
          <Field
            label="SOW link or pasted text"
            htmlFor="sow"
            hint="Google Doc URL, Drive link, or paste the SOW body directly."
          >
            <textarea
              id="sow"
              value={form.sow}
              onChange={(e) => setForm({ ...form, sow: e.target.value })}
              placeholder="https://docs.google.com/... or paste SOW text…"
              rows={6}
              className={`${inputClass} font-mono text-[13px] leading-relaxed`}
            />
          </Field>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-6">
          <FieldHeading
            title="Review + Generate Command"
            subtitle="The dashboard can't write to your local OneDrive folder from the browser. Run this command locally to create everything."
          />

          {!canFinish && (
            <div className="flex items-start gap-3 rounded-xl bg-peach-50 ring-1 ring-peach-200 p-4 text-[13px] text-ink-700">
              <AlertCircle className="h-4 w-4 text-peach-600 mt-0.5 shrink-0" />
              <div>
                Missing required fields. Go back and finish steps 1–2.
              </div>
            </div>
          )}

          {/* Summary */}
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 rounded-2xl bg-cloud-50 ring-1 ring-cloud-200 p-5">
            <SummaryRow label="Brand" value={form.brand || '—'} />
            <SummaryRow
              label="Brand slug"
              value={form.brandSlug || '—'}
              mono
            />
            <SummaryRow label="Campaign" value={form.campaign || '—'} />
            <SummaryRow
              label="Campaign slug"
              value={form.campaignSlug || '—'}
              mono
            />
            <SummaryRow label="Category" value={form.category} />
            <SummaryRow
              label="SOW"
              value={form.sow ? `${form.sow.slice(0, 60)}${form.sow.length > 60 ? '…' : ''}` : '— (skip)'}
            />
          </dl>

          {/* Command + copy */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] tracking-[0.14em] uppercase font-medium text-ink-600 flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5" />
                Run this locally
              </h3>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!canFinish}
                className={[
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
                  canFinish
                    ? 'bg-iris-600 text-white hover:bg-iris-700'
                    : 'bg-cloud-200 text-ink-400 cursor-not-allowed',
                ].join(' ')}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy command
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-2xl bg-ink-900 text-cloud-50 p-5 text-[12.5px] leading-relaxed font-mono overflow-x-auto whitespace-pre-wrap break-all ring-1 ring-ink-900/50">
              {command}
            </pre>
          </div>

          {/* Instructions */}
          <ol className="rounded-2xl bg-iris-50 ring-1 ring-iris-200 p-5 text-[13px] text-ink-800 leading-relaxed flex flex-col gap-2">
            <li>
              <span className="font-semibold text-iris-700">1.</span> Copy the
              command above.
            </li>
            <li>
              <span className="font-semibold text-iris-700">2.</span> Open a
              terminal in{' '}
              <code className="font-mono text-[12.5px] bg-white px-1.5 py-0.5 rounded">
                C:\Users\julia\OneDrive\Desktop\ugc-command-center
              </code>
              .
            </li>
            <li>
              <span className="font-semibold text-iris-700">3.</span> Paste and
              hit <kbd className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded ring-1 ring-cloud-200">Enter</kbd>.
            </li>
            <li>
              <span className="font-semibold text-iris-700">4.</span> Script
              copies the template folder, replaces placeholders, writes the
              Linear issue (if{' '}
              <code className="font-mono text-[12px] bg-white px-1 rounded">
                LINEAR_API_TOKEN
              </code>{' '}
              is set), and logs the new campaign to{' '}
              <code className="font-mono text-[12px] bg-white px-1 rounded">
                data/campaigns-created.jsonl
              </code>
              . Dashboard picks it up on next build.
            </li>
          </ol>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center justify-between gap-4 mt-9 pt-6 border-t border-cloud-200">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
            step === 1
              ? 'bg-cloud-100 text-ink-400 cursor-not-allowed'
              : 'bg-cloud-100 text-ink-700 hover:bg-cloud-200',
          ].join(' ')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="text-[11px] tracking-[0.1em] uppercase text-ink-500">
          Step {step} of 4
        </div>
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              (step === 1 && !step1Valid) || (step === 2 && !step2Valid)
                ? 'bg-cloud-200 text-ink-400 cursor-not-allowed'
                : 'bg-iris-600 text-white hover:bg-iris-700',
            ].join(' ')}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCopy}
            disabled={!canFinish}
            className={[
              'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              canFinish
                ? 'bg-iris-600 text-white hover:bg-iris-700'
                : 'bg-cloud-200 text-ink-400 cursor-not-allowed',
            ].join(' ')}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy command'}
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Small presentational helpers (kept inline; no new files).
// ──────────────────────────────────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl bg-cloud-50 ring-1 ring-cloud-200 px-4 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-iris-400 focus:bg-white transition-colors';

function FieldHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-ink-900 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="font-display italic text-sm text-ink-700/80 mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] tracking-[0.1em] uppercase font-medium text-ink-600"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-[12px] text-ink-500">{hint}</p>}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-[10px] tracking-[0.12em] uppercase text-ink-500">
        {label}
      </dt>
      <dd
        className={[
          'text-[14px] text-ink-900 break-words',
          mono && 'font-mono text-[13px]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}
