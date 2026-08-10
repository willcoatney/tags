import { createAdminClient } from '@/lib/supabase/admin'

export const ErrorCategory = {
  STRIPE: 'stripe',
  SMS: 'sms',
  EMAIL: 'email',
  DB: 'db',
  AUTH: 'auth',
  API: 'api',
} as const

export type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory]

export const ErrorSeverity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export type ErrorSeverityType = typeof ErrorSeverity[keyof typeof ErrorSeverity]

export interface LogErrorOptions {
  route?: string
  user_id?: string
  organization_id?: string
  severity?: ErrorSeverityType
}

export async function logError(
  category: ErrorCategoryType,
  message: string,
  metadata?: Record<string, unknown>,
  options?: LogErrorOptions
): Promise<void> {
  try {
    const admin = createAdminClient()
    await admin.from('error_logs').insert({
      category,
      severity: options?.severity ?? ErrorSeverity.MEDIUM,
      message,
      metadata: metadata ?? null,
      route: options?.route ?? null,
      user_id: options?.user_id ?? null,
      organization_id: options?.organization_id ?? null,
      resolved: false,
    })
  } catch (e) {
    // Never let error logging crash the app
    console.error('[logError] Failed to write error log:', e)
  }
}
