import destr from 'destr'
import { useLogger } from '@nuxt/kit'
import type { FetchError } from 'ofetch'

import type { EndpointFetchOptions } from '../../composables/use-tt'

const logger = useLogger('tt-api')

export default defineEventHandler(async (event) => {
  let _body = await readBody<EndpointFetchOptions>(event)

  // Inconsistent `readBody` behavior in some Nitro presets
  // https://github.com/unjs/nitro/issues/912
  if (Buffer.isBuffer(_body)) _body = destr((_body as Buffer).toString())

  const { path, query, headers, body, ...fetchOptions } = _body

  const baseURL = query?.backendUrl || useRuntimeConfig().public.backendUrl
  delete query?.backendUrl

  try {
    return await $fetch(path!, {
      ...fetchOptions,
      baseURL,
      query,
      headers,
      cookies: parseCookies(event),
      body,
      onRequest(context) {
        logger.info('onRequest', context)
      },
      onRequestError(context) {
        logger.error('onRequestError', context)
      },
    })
  } catch (err) {
    throw createError(err as FetchError)
  }
})
