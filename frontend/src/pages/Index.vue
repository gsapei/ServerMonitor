<template>
  <q-page class="flex flex-center">
    <listado/>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import Listado from "src/components/Listado.vue";

export default defineComponent({
  name: 'PageIndex',
  components: {
    Listado
  }
})
</script>
