<template>
  <h1>Welcome</h1>
  <section>
    <h2>Request Headers</h2>
    {{ headers }}
  </section>
  <section>
    <h2>Cookie</h2>
    {{ cookie }}
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
</template>

<script setup lang="ts">
const headers = useState('header', () => useRequestHeaders())

const cookie = useCookie('mod_auth_openidc_session')

const { data: serverData, error: serverError } = await useFetch('http://v1pturntable.net.be.ch:6996/sbr/getSettings', {
  headers: useRequestHeaders(['cookie']),
  onRequest(ctx) {
    console.log(ctx)
  },
  onResponseError(ctx) {
    console.log(ctx)
  },
})

const clientData = ref<any>(null)
const clientError = ref<any>(null)
const clientPending = ref(false)
async function onButtonClick() {
  clientPending.value = true
  const { data, error } = await useFetch('http://v1pturntable.net.be.ch:6996/sbr/getSettings', {
    onRequest(ctx) {
      console.log(ctx)
    },
    onResponseError(ctx) {
      console.log(ctx)
    },
  })
  clientPending.value = false
  clientData.value = data
  clientError.value = error
}
</script>
