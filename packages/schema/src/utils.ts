import { ZodType } from 'zod'

function attach(type: ZodType, key: string | symbol, value: any) {
  ;(type._def as any)[key] = value
}

function get(type: ZodType, key: string | symbol) {
  return (type._def as any)[key]
}

const TITLE_KEY = Symbol.for('lybic.zod.title')

export function attachTitle<T extends ZodType>(type: T, title: string) {
  attach(type, TITLE_KEY, title)
  return type
}

export function getTitle(type: ZodType) {
  return get(type, TITLE_KEY) as string | undefined
}
