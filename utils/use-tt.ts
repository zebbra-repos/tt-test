import type { SerializedFormData, SerializedBlob, ApiFetchOptions } from '~/types/use-tt'

export const DEV_TT_HEADERS = {
  'x-rp-username': 'rothm',
  'x-rp-user-company': 'SPIE ICS',
  'x-rp-user-dept': 'superuser',
  'x-rp-apps': 'xxxxxxxxxx_tt_admin',
  'x-rp-user-dn': 'uid=rothm,o=kaio,ou=people,dc=net,dc=be,dc=ch',
  'x-rp-user-groups': 'conusr,cmw,ls-benet-zabbix-rw,diradm,magic-button,zar,netdisco,ls-benet-oxidized-rw,srvadm,map,prolix,netop',
}

export function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  if (typeof Headers !== 'undefined' && headers instanceof Headers) return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers)) return Object.fromEntries(headers)

  return headers as Record<string, string>
}

export function isFormData(obj: unknown): obj is FormData {
  return typeof FormData !== 'undefined' && obj instanceof FormData
}

export function isSerializedFormData(obj: unknown): obj is SerializedFormData {
  return typeof obj === 'object' && obj !== null && '__type' in obj && obj.__type === 'form-data'
}

export async function formDataToObject(formData: FormData) {
  const obj: SerializedFormData = {
    __type: 'form-data',
  }

  for (const [key, value] of formData.entries()) {
    if (value instanceof Blob) {
      obj[key] = {
        __type: 'blob',
        ...(await serializeBlob(value)),
        name: value.name,
      }
    } else {
      obj[key] = value
    }
  }

  return obj
}

export async function objectToFormData(obj: SerializedFormData) {
  const formData = new FormData()
  const entries = Object.entries(obj).filter(([key]) => key !== '__type')

  for (const [key, value] of entries) {
    if (isSerializedBlob(value)) {
      const arrayBuffer = Uint8Array.from(atob(value.data), (c) => c.charCodeAt(0))
      const blob = new Blob([arrayBuffer], { type: value.type })
      formData.append(key, blob, value.name)
    } else {
      formData.append(key, value)
    }
  }

  return formData
}

export async function serializeMaybeEncodedBody(value: ApiFetchOptions['body']) {
  if (isFormData(value)) return await formDataToObject(value)

  return value
}

export async function deserializeMaybeEncodedBody(value: ApiFetchOptions['body']) {
  if (isSerializedFormData(value)) return await objectToFormData(value)

  return value
}

function isSerializedBlob(obj: unknown): obj is SerializedBlob {
  return typeof obj === 'object' && obj !== null && '__type' in obj && obj.__type === 'blob'
}

async function serializeBlob(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  const base64 = btoa(binary)

  return {
    data: base64,
    type: blob.type,
    size: blob.size,
  }
}
