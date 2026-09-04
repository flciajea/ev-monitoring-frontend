<script setup>
import { ref } from 'vue'
import api from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true

  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })

    localStorage.setItem(
      'token',
      response.data.token
    )

    localStorage.setItem(
      'user',
      JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        namaLengkap: response.data.namaLengkap,
        role: response.data.role,
        noKendaraan: response.data.noKendaraan
      })
    )

    await router.push('/unit')

  } catch (error) {
    errorMsg.value =
      error.response?.data?.error ||
      'Gagal login: ' + error.message

  } finally {
    loading.value = false
  }
}
</script>


<template>
  <div class="login-container">

    <form
      @submit.prevent="handleLogin"
      class="login-form"
    >

      <h2>
        EV Monitoring - Login
      </h2>


      <!-- USERNAME -->

      <div>
        <label>
          Username
        </label>

        <input
          v-model="username"
          type="text"
          required
          autocomplete="username"
        />
      </div>


      <!-- PASSWORD -->

      <div>
        <label>
          Password
        </label>

        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>


      <!-- ERROR -->

      <p
        v-if="errorMsg"
        class="error"
      >
        {{ errorMsg }}
      </p>


      <!-- LOGIN -->

      <button
        type="submit"
        :disabled="loading"
      >
        {{
          loading
            ? 'Loading...'
            : 'Login'
        }}
      </button>

    </form>

  </div>
</template>


<style scoped>

.login-container {
  display: flex;

  justify-content: center;
  align-items: center;

  min-height: 100vh;

  background:
    linear-gradient(
      135deg,
      #eaf4ff 0%,
      #ffffff 100%
    );
}

.login-form {
  background: #ffffff;

  padding: 40px 36px;

  border-radius: 16px;

  width: 340px;

  box-shadow:
    0 8px 24px
    rgba(58, 141, 222, 0.15);

  border: 1px solid #e3f0fc;
}

.login-form h2 {
  color: #2b7cd3;

  text-align: center;

  margin-bottom: 24px;

  font-size: 20px;
}

.login-form div {
  margin-bottom: 18px;
}

label {
  display: block;

  margin-bottom: 6px;

  font-weight: 600;

  color: #4a5568;

  font-size: 14px;
}

input {
  width: 100%;

  padding: 10px 12px;

  border: 1px solid #cfe4fb;

  border-radius: 8px;

  box-sizing: border-box;

  font-size: 14px;

  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

input:focus {
  outline: none;

  border-color: #4a9eeb;

  box-shadow:
    0 0 0 3px
    rgba(74, 158, 235, 0.15);
}

button {
  width: 100%;

  padding: 11px;

  background-color: #4a9eeb;

  color: white;

  border: none;

  border-radius: 8px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  margin-top: 4px;

  transition:
    background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #2b7cd3;
}

button:disabled {
  background-color: #b8d9f7;

  cursor: not-allowed;
}

.error {
  color: #e74c3c;

  font-size: 13px;

  background: #fdecea;

  padding: 8px 12px;

  border-radius: 6px;

  margin-bottom: 12px;
}

</style>