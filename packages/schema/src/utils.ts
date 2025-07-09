import { ZodType } from 'zod'

function attach(type: ZodType, key: string | symbol, value: any) {
  ;(type._def as any)[key] = value
}

function get(type: ZodType, key: string | symbol) {
  return (type._def as any)[key]
}

export interface LybicZodMeta {
  title: string
  fieldComponent?: 'project' | 'string' | 'hidden' | 'select'
  fieldProps?: any
}

const TITLE_KEY = Symbol.for('lybic.zod.title')

export function attachMeta<T>(type: T, meta: LybicZodMeta): T {
  attach(type as any, TITLE_KEY, meta)
  return type
}

export function getMeta(type: ZodType) {
  return get(type, TITLE_KEY) as LybicZodMeta | undefined
}
