import { crypto } from '@std/crypto'
import { encodeHex } from '@std/encoding/hex'

function canonicalizeRequest(
  verb: string,
  canonicalUri: string,
  canonicalQueryString: string,
  canonicalHeaders: string,
  canonicalSignedHeaders: string,
) {
  return [verb, canonicalUri, canonicalQueryString, canonicalHeaders, canonicalSignedHeaders, 'UNSIGNED-PAYLOAD'].join(
    '\n',
  )
}

function canonicalizeVerb(verb: string) {
  return verb.toUpperCase()
}

function canonicalizeUri(uri: string) {
  return uri
}

function canonicalizeQueryString(queryString: Record<string, string>) {
  return Object.entries(queryString)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

function canonicalizeHeaders(headers: Record<string, string>) {
  const sortedHeaders = Object.entries(headers)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key.toLowerCase()}:${value.trim()}`)
    .join('\n')
  return sortedHeaders + '\n'
}

function canonicalizeSignedHeaders(headers: Set<string> | string[]) {
  const signedHeaders = Array.from(headers)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => key.toLowerCase())
    .join(';')
  return signedHeaders
}

async function createStringToSign(
  verb: string,
  resource: string,
  query: Record<string, string>,
  headers: Record<string, string>,
  signedHeaders: Set<string> | string[],
  dateTime: string,
  yyyymmdd: string,
  region: string,
) {
  const canonicalRequest = canonicalizeRequest(
    canonicalizeVerb(verb),
    canonicalizeUri(resource),
    canonicalizeQueryString(query),
    canonicalizeHeaders(headers),
    canonicalizeSignedHeaders(signedHeaders),
  )
  const requestHash = encodeHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)))
  return ['AWS4-HMAC-SHA256', dateTime, `${yyyymmdd}/${region}/s3/aws4_request`, requestHash].join('\n')
}

async function hmacSha256(keyInput: string | ArrayBuffer, messageString: string) {
  const key = typeof keyInput === 'string' ? new Uint8Array(new TextEncoder().encode(keyInput)) : keyInput
  const message = new Uint8Array(new TextEncoder().encode(messageString))
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, [
    'sign',
  ])
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message)
  return signature
}

async function createSigningKey(secretKey: string, yyyymmdd: string, region: string) {
  const dateKey = await hmacSha256('AWS4' + secretKey, yyyymmdd)
  const dateRegionKey = await hmacSha256(dateKey, region)
  const dateRegionServiceKey = await hmacSha256(dateRegionKey, 's3')
  const signingKey = await hmacSha256(dateRegionServiceKey, 'aws4_request')
  return signingKey
}

async function createSignature(stringToSign: string, signingKey: ArrayBuffer) {
  const signature = await hmacSha256(signingKey, stringToSign)
  return encodeHex(signature)
}

export function toAwsDate(date: Date) {
  const dateTime = date
    .toISOString()
    .replace(/[:\-]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
  const yyyymmdd = dateTime.split('T')[0]!

  return { dateTime, yyyymmdd }
}

export async function signRequest(
  verb: string,
  resource: string,
  query: Record<string, string>,
  headers: Record<string, string>,
  signedHeaders: Set<string> | string[],
  date: Date,
  region: string,
  secretKey: string,
) {
  const { dateTime, yyyymmdd } = toAwsDate(date)

  const stringToSign = await createStringToSign(
    verb,
    resource,
    query,
    headers,
    signedHeaders,
    dateTime,
    yyyymmdd,
    region,
  )
  const signingKey = await createSigningKey(secretKey, yyyymmdd, region)
  const signature = await createSignature(stringToSign, signingKey)
  return signature
}

export async function signPolicy(stringToSign: string, date: Date, region: string, secretKey: string) {
  const { dateTime, yyyymmdd } = toAwsDate(date)

  const signingKey = await createSigningKey(secretKey, yyyymmdd, region)
  const signature = await createSignature(stringToSign, signingKey)
  return signature
}
