import { METRIC_LABELS, METRIC_FORMATS } from '@/types'
import type { MetricName } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adium.io'

const WRAPPER_START = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.1);">
<tr><td style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.1);">
  <span style="font-size:14px;font-weight:900;letter-spacing:3px;color:#fff;">ADIUM</span>
</td></tr>
<tr><td style="padding:32px;">
`

const WRAPPER_END = `
</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.1);">
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:1px;">
    <a href="${BASE_URL}/dashboard" style="color:rgba(255,255,255,0.4);text-decoration:none;">Dashboard</a>
    &nbsp;&middot;&nbsp;
    <a href="${BASE_URL}/companies" style="color:rgba(255,255,255,0.4);text-decoration:none;">Manage Alerts</a>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`

export interface DriftItem {
  metric: MetricName
  userValue: number
  benchmarkP50: number
  direction: 'above' | 'below'
  pctDiff: number
}

export function buildDriftAlertEmail(params: {
  companyName: string
  accountName: string
  platform: string
  drifts: DriftItem[]
}): { subject: string; html: string } {
  const { companyName, accountName, platform, drifts } = params

  const topDrift = drifts[0]
  const subject = `[Adium] ${METRIC_LABELS[topDrift.metric]} drifted ${topDrift.direction === 'above' ? '+' : '-'}${topDrift.pctDiff}% for ${companyName}`

  const rows = drifts.map(d => {
    const fmt = METRIC_FORMATS[d.metric]
    const arrow = d.direction === 'above' ? '&#9650;' : '&#9660;'
    const color = '#e74c3c'
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:2px;font-weight:700;">${METRIC_LABELS[d.metric]}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff;font-size:13px;font-weight:700;">${fmt(d.userValue)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);font-size:13px;">${fmt(d.benchmarkP50)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:${color};font-size:12px;font-weight:700;">${arrow} ${d.pctDiff}% ${d.direction}</td>
      </tr>
    `
  }).join('')

  const html = `${WRAPPER_START}
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.3);font-weight:600;">PERFORMANCE ALERT</p>
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.5px;">Metrics outside normal range</h1>
    <p style="margin:0 0 24px;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.5;">
      Your <strong style="color:rgba(255,255,255,0.7);">${accountName}</strong> (${platform}) account for
      <strong style="color:rgba(255,255,255,0.7);">${companyName}</strong> has metrics that drifted 20%+ from the benchmark median.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
      <tr>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">METRIC</td>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">YOURS</td>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">MEDIAN</td>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">DRIFT</td>
      </tr>
      ${rows}
    </table>
    <p style="margin:24px 0 0;">
      <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#f4c6a5;color:#000;font-size:12px;font-weight:700;letter-spacing:2px;padding:12px 24px;text-decoration:none;">VIEW DASHBOARD</a>
    </p>
  ${WRAPPER_END}`

  return { subject, html }
}

export interface BenchmarkMetricItem {
  metric: MetricName
  benchmarkP50: number
  userValue: number | null
  percentileRank: string
}

export function buildBenchmarkSummaryEmail(params: {
  companyName: string
  date: string
  metrics: BenchmarkMetricItem[]
}): { subject: string; html: string } {
  const { companyName, date, metrics } = params

  const subject = `[Adium] New benchmarks ready — ${date}`

  const rows = metrics.map(m => {
    const fmt = METRIC_FORMATS[m.metric]
    return `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:2px;font-weight:700;">${METRIC_LABELS[m.metric]}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#fff;font-size:13px;font-weight:700;">${m.userValue != null ? fmt(m.userValue) : '\u2014'}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);font-size:13px;">${fmt(m.benchmarkP50)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.05);color:#f4c6a5;font-size:12px;font-weight:700;">${m.percentileRank}</td>
      </tr>
    `
  }).join('')

  const html = `${WRAPPER_START}
    <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;color:rgba(255,255,255,0.3);font-weight:600;">BENCHMARK UPDATE</p>
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.5px;">New benchmarks available</h1>
    <p style="margin:0 0 24px;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.5;">
      Fresh benchmark data is ready for <strong style="color:rgba(255,255,255,0.7);">${companyName}</strong>.
      Here&rsquo;s how you compare:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);">
      <tr>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">METRIC</td>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">YOURS</td>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">MEDIAN</td>
        <td style="padding:8px 12px;font-size:10px;letter-spacing:2px;color:rgba(255,255,255,0.25);font-weight:600;border-bottom:1px solid rgba(255,255,255,0.08);">RANK</td>
      </tr>
      ${rows}
    </table>
    <p style="margin:24px 0 0;">
      <a href="${BASE_URL}/dashboard" style="display:inline-block;background:#f4c6a5;color:#000;font-size:12px;font-weight:700;letter-spacing:2px;padding:12px 24px;text-decoration:none;">VIEW DASHBOARD</a>
    </p>
  ${WRAPPER_END}`

  return { subject, html }
}
