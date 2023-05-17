import type { AsyncData, AsyncDataOptions } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import type { NitroFetchOptions } from 'nitropack'

export interface SerializedBlob {
  data: string
  type: string
  size: number
  name?: string
}

export type SerializedFormData = Record<string, string | (SerializedBlob & { __type: 'blob' })>

export type ApiFetchOptions = Omit<NitroFetchOptions<string>, 'body' | 'cache'> & {
  body?: string | Record<string, any> | FormData | null
  /**
   * Skip the Nuxt server proxy and fetch directly from the API.
   * Requires `allowClient` to be enabled in the module options as well.
   * @default false
   */
  client?: boolean
  /**
   * Cache the response for the same request
   * @default false
   */
  cache?: boolean
}

export type MaybeRef<T> = T | Ref<T>
export type MaybeRefOrGetter<T> = MaybeRef<T> | (() => T)
export type EndpointFetchOptions = NitroFetchOptions<string> & {
  path: string
}

export type ComputedOptions<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends Function ? T[K] : T[K] extends Record<string, any> ? ComputedOptions<T[K]> | MaybeRef<T[K]> : MaybeRef<T[K]>
}

export type UseApiDataOptions<T> = AsyncDataOptions<T> &
  Pick<ComputedOptions<NitroFetchOptions<string>>, 'onRequest' | 'onRequestError' | 'onResponse' | 'onResponseError' | 'query' | 'headers' | 'method'> & {
    body?: MaybeRef<string | Record<string, any> | FormData | null | undefined>
    /**
     * Cache the response for the same request
     * @default true
     */
    cache?: boolean
  }

export type UseTTData = <T>(path: MaybeRefOrGetter<string>, opts?: UseApiDataOptions<T>) => AsyncData<T, FetchError>
