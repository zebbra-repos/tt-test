import { hash } from 'ohash'

import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'

import { EndpointFetchOptions, MaybeRefOrGetter, UseApiDataOptions } from '~/types/use-tt'

export function useTTData<T>(path: MaybeRefOrGetter<string>, opts: UseApiDataOptions<T> = {}) {
  const _path = computed(() => toValue(path))
  const { server, lazy, default: defaultFn, transform, pick, watch: watchSources, immediate, query, headers, method, body, cache = true, ...fetchOptions } = opts

  const _fetchOptions = reactive(fetchOptions)

  const _headers = computed(() => ({
    TT_BACKEND_URL: useAppConfig().backendUrl,
    ...(process.dev ? DEV_TT_HEADERS : {}),
    ...useRequestHeaders(['cookie']),
    ...headersToObject(toValue(headers)),
    // cookie: 'mod_auth_openidc_session=99203a30-c7c5-4ca0-a7cc-ee426c926c51',
  }))

  const _endpointFetchOptions: EndpointFetchOptions = reactive({
    path: _path,
    query,
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
    watch: [_endpointFetchOptions, ...(watchSources || [])],
    immediate,
  }

  let controller: AbortController
  const key = computed(() => `$api${hash(['tt', _path.value, toValue(query), toValue(method), ...(isFormData(toValue(body)) ? [] : [toValue(body)])])}`)

  return useAsyncData<T, FetchError>(
    key.value,
    async (nuxt) => {
      controller?.abort?.()

      // Workaround to persist response client-side
      // https://github.com/nuxt/nuxt/issues/15445
      if ((nuxt!.isHydrating || cache) && key.value in nuxt!.payload.data) {
        return nuxt!.payload.data[key.value]
      }

      controller = typeof AbortController !== 'undefined' ? new AbortController() : ({} as AbortController)

      const result = (await globalThis.$fetch<T>('/api/tt', {
        ..._fetchOptions,
        signal: controller.signal,
        method: 'POST',
        body: {
          ..._endpointFetchOptions,
          body: await serializeMaybeEncodedBody(_endpointFetchOptions.body),
        } satisfies EndpointFetchOptions,
      })) as T

      if (cache) {
        nuxt!.payload.data[key.value] = result
      }

      return result
    },
    _asyncDataOptions
  ) as AsyncData<T, FetchError>
}

function headersToObject(headers: HeadersInit = {}): Record<string, string> {
  if (typeof Headers !== 'undefined' && headers instanceof Headers) return Object.fromEntries([...headers.entries()])

  if (Array.isArray(headers)) return Object.fromEntries(headers)

  return headers as Record<string, string>
}
