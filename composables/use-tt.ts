import { hash } from 'ohash'

import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import type { NitroFetchOptions } from 'nitropack'

export type MaybeRef<T> = T | Ref<T>
export type MaybeRefOrGetter<T> = MaybeRef<T> | (() => T)
export type EndpointFetchOptions = NitroFetchOptions<string> & {
  path: string
}

type ComputedOptions<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Function ? T[K] : T[K] extends Record<string, any> ? ComputedOptions<T[K]> | MaybeRef<T[K]> : MaybeRef<T[K]>
}

export type UseApiDataOptions<T> = AsyncDataOptions<T> &
  Pick<ComputedOptions<NitroFetchOptions<string>>, 'onRequest' | 'onRequestError' | 'onResponse' | 'onResponseError' | 'query' | 'headers' | 'method'> & {
    body?: MaybeRef<string | Record<string, any> | FormData | null | undefined>
  }

export type UseTTData = <T>(path: MaybeRefOrGetter<string>, opts?: UseApiDataOptions<T>) => AsyncData<T, FetchError>

export const DEV_TT_HEADERS = {
  'x-rp-username': 'rothm',
  'x-rp-user-company': 'SPIE ICS',
  'x-rp-user-dept': 'superuser',
  'x-rp-apps': 'xxxxxxxxxx_tt_admin',
  'x-rp-user-dn': 'uid=rothm,o=kaio,ou=people,dc=net,dc=be,dc=ch',
  'x-rp-user-groups': 'conusr,cmw,ls-benet-zabbix-rw,diradm,magic-button,zar,netdisco,ls-benet-oxidized-rw,srvadm,map,prolix,netop',
}

export function useTTData<T>(path: MaybeRefOrGetter<string>, opts: UseApiDataOptions<T> = {}) {
  const _path = computed(() => toValue(path))
  const { server, lazy, default: defaultFn, transform, pick, watch, immediate, query, headers, method, body, ...fetchOptions } = opts

  const _query = computed(() => {
    const val = toValue(query) || {}
    val.backendUrl = useAppConfig().backendUrl
    return val
  })

  const _fetchOptions = reactive(fetchOptions)

  const _headers = {
    ...(process.dev ? DEV_TT_HEADERS : {}),
    ...useRequestHeaders(['cookie']),
    ...headersToObject(toValue(headers)),
  }

  const _endpointFetchOptions: EndpointFetchOptions = reactive({
    path: _path,
    query: _query,
    headers: _headers,
    method,
    body,
  })

  const _asyncDataOptions: AsyncDataOptions<T> = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick,
    watch: [_endpointFetchOptions, ...(watch || [])],
    immediate,
  }

  let controller: AbortController
  const key = computed(() => `$api${hash(['tt', _path.value, toValue(query), toValue(method), ...[toValue(body)]])}`)

  return useAsyncData<T, FetchError>(
    key.value,
    async () => {
      controller?.abort?.()
      controller = typeof AbortController !== 'undefined' ? new AbortController() : ({} as AbortController)

      return (await globalThis.$fetch<T>('/api/tt', {
        ..._fetchOptions,
        signal: controller.signal,
        method: 'POST',
        body: _endpointFetchOptions,
      })) as T
    },
    _asyncDataOptions
  ) as AsyncData<T, FetchError>
}

function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  if (typeof Headers !== 'undefined' && headers instanceof Headers) return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers)) return Object.fromEntries(headers)

  return headers as Record<string, string>
}
