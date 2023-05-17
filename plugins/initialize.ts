export default defineNuxtPlugin({
  name: 'initialize-plugin',
  enforce: 'pre',
  setup() {
    const appConfig = useAppConfig()
    appConfig.backendUrl = useRuntimeConfig().public.backendUrl
  },
})
