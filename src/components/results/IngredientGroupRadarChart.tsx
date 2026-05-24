import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts'

import type { ResultOverviewSkinStateScoreViewModel } from './resultOverviewViewModel'

interface IngredientGroupRadarChartProps {
  scores: ResultOverviewSkinStateScoreViewModel[]
}

interface PolarAngleTickProps {
  x?: number
  y?: number
  cx?: number | string
  cy?: number | string
  payload?: {
    value?: string
  }
  highlightLabels?: ReadonlySet<string>
  labelOffset?: number
}

const RADAR_RADIUS_TICKS = [25, 50, 75, 100] as const
const CHART_MAX_WIDTH_PX = 319
const CHART_HEIGHT_PX = 260
const RADAR_OUTER_RADIUS_PX = 99
const AXIS_TICK_SIZE_PX = 14
const AXIS_LABEL_OUTER_OFFSET_PX = 9
const RADAR_DOT_RADIUS_PX = 2.5
const RADAR_DOT_STROKE_WIDTH_PX = 0.8
const LABEL_LINE_HEIGHT_PX = 14
const LABEL_RADIAL_ADJUST_PX_BY_LABEL: Record<string, number> = {
  수분: -1,
  트러블: 1,
  민감도: 2,
  유분: 1,
  색소: 1,
}
const LABEL_VERTICAL_ADJUST_PX_BY_LABEL: Record<string, number> = {
  수분: 3,
  탄력: 6,
  트러블: 7,
  민감도: -5,
  유분: -3,
  색소: -6,
}
const LABEL_HORIZONTAL_ADJUST_PX_BY_LABEL: Record<string, number> = {
  탄력: -1,
  트러블: 1,
  민감도: 1,
  색소: -1,
}
const COLOR_NEUTRAL_150 = '#E0E2E0'
const COLOR_NEUTRAL_200 = '#C8CECA'
const COLOR_NEUTRAL_600 = '#3A3D3B'
const COLOR_NEUTRAL_50 = '#F4F4F4'
const COLOR_PRIMARY_400 = '#3DC1BB'

function toMultilineLabel(value: string): string[] {
  const slashSeparated = value
    .replace(/\s*\/\s*/g, '\n')
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (slashSeparated.length > 1) {
    return slashSeparated
  }

  const wordChunks = value
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  if (wordChunks.length <= 1) {
    return [value]
  }

  const pivot = Math.ceil(wordChunks.length / 2)
  return [wordChunks.slice(0, pivot).join(' '), wordChunks.slice(pivot).join(' ')]
}

function toFiniteNumber(value: number | string | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return fallback
}

function PolarAngleTick({
  x = 0,
  y = 0,
  cx,
  cy,
  payload,
  highlightLabels,
  labelOffset = AXIS_LABEL_OUTER_OFFSET_PX,
}: PolarAngleTickProps) {
  const label = typeof payload?.value === 'string' ? payload.value : ''
  const lines = toMultilineLabel(label).slice(0, 2)
  const isHighlighted = highlightLabels?.has(label) ?? false
  const centerX = toFiniteNumber(cx, x)
  const centerY = toFiniteNumber(cy, y)
  const deltaX = x - centerX
  const deltaY = y - centerY
  const distance = Math.hypot(deltaX, deltaY)
  const radialAdjust = LABEL_RADIAL_ADJUST_PX_BY_LABEL[label] ?? 0
  const verticalAdjust = LABEL_VERTICAL_ADJUST_PX_BY_LABEL[label] ?? 0
  const horizontalAdjust = LABEL_HORIZONTAL_ADJUST_PX_BY_LABEL[label] ?? 0
  const adjustedOffset = labelOffset + radialAdjust
  const offsetX = distance > 0 ? x + (deltaX / distance) * adjustedOffset : x
  const offsetY = distance > 0 ? y + (deltaY / distance) * adjustedOffset : y
  const firstLineDy = lines.length > 1 ? -((lines.length - 1) * LABEL_LINE_HEIGHT_PX) / 2 : 0

  return (
    <text
      dominantBaseline="middle"
      fill={isHighlighted ? COLOR_NEUTRAL_600 : COLOR_NEUTRAL_200}
      fontFamily="Pretendard"
      fontSize={12}
      fontWeight={500}
      textAnchor="middle"
      x={offsetX + horizontalAdjust}
      y={offsetY + verticalAdjust}
    >
      {lines.map((line, index) => (
        <tspan dy={index === 0 ? firstLineDy : LABEL_LINE_HEIGHT_PX} key={`${line}-${index}`} x={offsetX + horizontalAdjust}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

function IngredientGroupRadarChart({ scores }: IngredientGroupRadarChartProps) {
  const highlightLabels = new Set(scores.filter((item) => item.isTopRank).map((item) => item.label))

  return (
    <div className="pointer-events-none w-full [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_path:focus]:outline-none [&_svg:focus]:outline-none">
      <div className="mx-auto w-full" style={{ height: `${CHART_HEIGHT_PX}px`, maxWidth: `${CHART_MAX_WIDTH_PX}px` }}>
        <ResponsiveContainer height="100%" width="100%">
        <RadarChart
          accessibilityLayer={false}
          data={scores}
          cx="50%"
          cy="50%"
          endAngle={-270}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          outerRadius={RADAR_OUTER_RADIUS_PX}
          startAngle={90}
          style={{ outline: 'none' }}
        >
          <PolarGrid gridType="polygon" radialLines stroke={COLOR_NEUTRAL_50} strokeWidth={1} />
          <PolarAngleAxis
            axisLine={{ stroke: COLOR_NEUTRAL_150, strokeWidth: 1 }}
            dataKey="label"
            tickSize={AXIS_TICK_SIZE_PX}
            tick={<PolarAngleTick highlightLabels={highlightLabels} />}
            tickLine={false}
          />
          <PolarRadiusAxis axisLine={false} domain={[0, 100]} tick={false} ticks={[...RADAR_RADIUS_TICKS]} />
          <Radar
            activeDot={false}
            dataKey="score"
            dot={{
              fill: COLOR_PRIMARY_400,
              r: RADAR_DOT_RADIUS_PX,
              stroke: COLOR_PRIMARY_400,
              strokeWidth: RADAR_DOT_STROKE_WIDTH_PX,
            }}
            fill="rgba(61, 193, 187, 0.20)"
            fillOpacity={1}
            focusable={false}
            isAnimationActive
            stroke={COLOR_PRIMARY_400}
            strokeWidth={1}
          />
        </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default IngredientGroupRadarChart
