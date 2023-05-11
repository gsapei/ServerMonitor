<template>
  <div>
    <q-page class="row justify-center items-center fondo flex flex-center">
      <!-- <div class="fondo"></div> -->
    </q-page>
    <div class="items-center column ">
      
      <div class="contenedor_login shadow-3">
            <div class="q-py-lg">
              <div class="col logo">
                ServerMonitor SITEGis
              </div>
            </div>
            <div>
              <q-form
                ref="formulario"
                class="q-px-sm q-pb-lg q-gutter-md"
                @submit.prevent.stop="onSubmit"
              >
                <q-input
                  class="inputLogin"
                  item-aligned
                  label-color="white"  
                  color="white"
                  dark
                  v-model="username"
                  type="text"
                  label="Usuario"
                  lazy-rules
                  :rules="[(val) => !!val || 'El usuario es obligatorio']"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" color="white" />
                  </template>
                </q-input>
                <q-input
                  class="inputLogin"
                  item-aligned
                  label-color="white"
                  color="white"
                  dark
                  v-model="password"
                  type="password"
                  label="Contraseña"
                  autocomplete="on"
                  lazy-rules
                  :rules="[(val) => !!val || 'La contraseña es obligatoria']"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" color="white"/>
                  </template>
                </q-input>
                <q-card-actions class="q-px-auto q-mt-xl">
                  <q-btn
                    icon="login"
                    unelevated
                    size="md"
                    color="primary"
                    class="full-width"
                    style="font-size: 13pt;"
                    label="Ingresar"
                    type="submit"
                    no-caps
                    :loading="loading"
                  />
                </q-card-actions>
              </q-form>
            </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex';
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  setup() {
    const store = useStore();
    const quasar = useQuasar();
    const router = useRouter();

    const formulario = ref(null)
    const username = ref(null);
    const password = ref(null);
    const loading = ref(false);
    const usuario = ref('');

    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn']);
    const getActiveUser = computed(() => store.getters['auth/getActiveUser']);

    store.dispatch('auth/checkTokenStorage');
    if(isLoggedIn.value){ router.push('/main');}

    // ----- Metodos ------  
    function onSubmit() {

      if (username.value.hasError || password.value.hasError) {
        formHasError = true;
      }

      if (username.value && password.value) {
        loading.value=true;
        const usuario = { username: username.value, password: password.value };
        store.dispatch('auth/login',usuario)
        .then(
          (usuario) => {
            quasar.notify({
              color: 'positive',
              icon: 'login',
              message: `Ingresando como usuario: ${getActiveUser.value.toUpperCase()}`,
            });
            loading.value=false;
            store.dispatch('auth/setRol');
            router.push('/main');
          },
          (error) => {
            quasar.notify({
              color: 'negative',
              icon: 'error',
              message: `Usuario o Contraseña no reconocidos`,
            });
            loading.value=false;
            console.log(' LOGIN:\n', error);
          }
        )
      }
    }
    return {
      username,
      password,
      usuario,
      loading,
      quasar,
      isLoggedIn,
      getActiveUser,
      onSubmit,
      formulario
      };
  },
};
</script>

<style scoped>

.q-field__input{
  color: white;
}
.q-input{
  font-size: 13pt;
  color: white;
}
.logo{
  text-align: center;
  color: white;
  font-size: 16pt;
}


</style>
