/**
 * Formatting utilities for LiquidAI Treasury OS
 * Financial data, numbers, dates, and addresses
 */

/**
 * Format currency values with proper localization
 * @example formatCurrency(1234567.89) => "$1,234,567.89"
 */
export function formatCurrency(
  value: number,
  options?: {
    currency?: string
    locale?: string
    decimals?: number
  }
): string {
  const { currency = "USD", locale = "en-US", decimals = 2 } = options || {}

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format compact numbers (1M, 1.2B, etc)
 * @example formatCompactNumber(1234567) => "1.2M"
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format percentage with sign
 * @example formatPercentage(23.05) => "+23.05%"
 */
export function formatPercentage(
  value: number,
  options?: {
    showSign?: boolean
    decimals?: number
  }
): string {
  const { showSign = false, decimals = 2 } = options || {}
  
  const formatted = value.toFixed(decimals)
  const sign = showSign && value > 0 ? "+" : ""
  
  return `${sign}${formatted}%`
}

/**
 * Truncate Ethereum address
 * @example truncateAddress("0x1234...5678", 6, 4) => "0x1234...5678"
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return ""
  if (address.length <= startChars + endChars) return address
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Format relative time (e.g., "2m ago", "1h ago")
 * @example formatRelativeTime(Date.now() - 120000) => "2m ago"
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const now = Date.now()
  const time = typeof timestamp === "number" ? timestamp : timestamp.getTime()
  const diff = now - time
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return "now"
}

/**
 * Format APY with proper styling class
 * @example formatAPY(23.05) => { value: "23.05%", trend: "up" }
 */
export function formatAPY(apy: number): {
  value: string
  trend: "up" | "down" | "neutral"
} {
  const value = formatPercentage(apy, { decimals: 2 })
  const trend = apy > 20 ? "up" : apy > 10 ? "neutral" : "down"
  
  return { value, trend }
}

/**
 * Validate and format wallet address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format large numbers with K/M/B suffix
 * @example formatLargeNumber(1500) => "1.5K"
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toString()
}

/**
 * Calculate and format duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}
