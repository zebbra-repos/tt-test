import destr from 'destr'
import type { FetchError } from 'ofetch'

import type { EndpointFetchOptions } from '../../composables/use-tt'

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
      body,
      onRequestError(context) {
        console.log('onRequestError', context)
      },
    })
  } catch (err) {
    throw createError(err as FetchError)
  }
})
