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
    <button @click="onButtonClick">Trigger</button>
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
</template>

<script setup lang="ts">
const headers = useState('header', () => useRequestHeaders())

const { data: serverData, error: serverError } = await useTTData('/sbr/getSettings')

const clientData = ref<any>(null)
const clientError = ref<any>(null)
const clientPending = ref(false)
async function onButtonClick() {
  clientPending.value = true
  const { data, error } = await useTTData('/sbr/getSettings')
  clientPending.value = false
  clientData.value = data
  clientError.value = error
}

function changeBackendUrl() {
  const newUrl = prompt('Enter new backend url', useAppConfig().backendUrl)
  if (newUrl) {
    useAppConfig().backendUrl = newUrl
  }
}
</script>
