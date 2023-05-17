<template>
  <h1>Welcome</h1>
  <section>
    <h2>Configurations</h2>
    <h3>Runtime Config</h3>
    <pre>{{ useRuntimeConfig() }}</pre>
    <h3>App Config</h3>
    <pre>{{ useAppConfig() }}</pre>
  </section>
  <section>
    <h2>Request Headers</h2>
    {{ headers }}
  </section>
  <section>
    <h2>Server side tt request</h2>
    <h3>Data:</h3>
    <pre>{{ serverData }}</pre>
    <h3>Error:</h3>
    <pre>{{ serverError }}</pre>
  </section>
  <section>
    <h2>Client side tt request</h2>
    <button @click="refresh()">Trigger</button>
    <p v-if="clientPending">Loading...</p>
    <h3>Data:</h3>
    <pre>{{ clientData }}</pre>
    <h3>Error:</h3>
    <pre>{{ clientError }}</pre>
  </section>
  <section>
    <h2>Change backend url</h2>
    <button @click="changeBackendUrl">Change</button>
  </section>
  <section>
    <h2>Change query</h2>
    <button @click="changeQuery">Change</button>
  </section>
</template>

<script setup lang="ts">
const headers = useState('header', () => useRequestHeaders())

const { data: serverData, error: serverError } = await useTTData('/sbr/getSettings')

const clientQuery = reactive<any>({})
const clientPending = ref(false)
const {
  data: clientData,
  error: clientError,
  pending,
  refresh,
} = useTTData('/sbr/getSettings', {
  query: clientQuery,
  server: false,
  immediate: false,
  cache: false,
})

watch(pending, (val) => {
  clientPending.value = val
})

function changeBackendUrl() {
  let value = useAppConfig().backendUrl

  if (value.includes('127.0.0.1')) {
    value = value.replace('127.0.0.1', '0.0.0.0')
  } else if (value.includes('0.0.0.0')) {
    value = value.replace('0.0.0.0', '127.0.0.1')
  }

  const newUrl = prompt('Enter new backend url', value)
  if (newUrl) {
    useAppConfig().backendUrl = newUrl
  }
}

function changeQuery() {
  clientQuery.foo = new Date().toISOString()
}
</script>
