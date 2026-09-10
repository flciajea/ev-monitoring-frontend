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
  <div class="login-page">

    <div class="login-card">

      <div class="login-header">
        <p class="login-eyebrow">EV Monitoring</p>

        <h1>Masuk ke Akun Anda</h1>

        <p class="login-subtitle">
          Silakan login untuk melanjutkan
        </p>
      </div>


      <form
        class="login-form"
        @submit.prevent="handleLogin"
      >

        <!-- USERNAME -->
        <div class="form-group">
          <label for="username">Username</label>

          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Masukkan username"
            autocomplete="username"
            required
          />
        </div>


        <!-- PASSWORD -->
        <div class="form-group">
          <label for="password">Password</label>

          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            autocomplete="current-password"
            required
          />
        </div>


        <!-- ERROR -->
        <p
          v-if="errorMsg"
          class="error-text"
        >
          {{ errorMsg }}
        </p>


        <!-- SUBMIT -->
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Memproses...' : 'Login' }}
        </button>

      </form>

    </div>

  </div>
</template>


<style scoped>

/* =========================
   PAGE
========================= */

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;

  min-height: 100vh;

  padding: 24px;

  box-sizing: border-box;

  background: #f7f9fc;
}


/* =========================
   CARD
========================= */

.login-card {
  width: 100%;
  max-width: 380px;

  padding: 36px 32px;

  box-sizing: border-box;

  background: white;

  border: 1px solid #e5eaf1;

  border-radius: 16px;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.035);
}


/* =========================
   HEADER
========================= */

.login-header {
  margin-bottom: 26px;

  text-align: center;
}


.login-eyebrow {
  margin: 0 0 6px;

  color: #2563eb;

  font-size: 12px;
  font-weight: 750;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}


.login-header h1 {
  margin: 0;

  color: #172033;

  font-size: 22px;
  line-height: 1.3;

  font-weight: 750;
}


.login-subtitle {
  margin: 8px 0 0;

  color: #64748b;

  font-size: 13px;
}


/* =========================
   FORM
========================= */

.login-form {
  display: flex;
  flex-direction: column;

  gap: 18px;
}


.form-group {
  display: flex;
  flex-direction: column;

  gap: 7px;
}


.form-group label {
  color: #334155;

  font-size: 13px;
  font-weight: 650;
}


.form-group input {
  width: 100%;
  height: 46px;

  box-sizing: border-box;

  padding: 0 14px;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  outline: none;

  background: white;

  color: #1f2937;

  font-size: 14px;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.form-group input::placeholder {
  color: #94a3b8;
}


.form-group input:focus {
  border-color: #93c5fd;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}


/* =========================
   ERROR
========================= */

.error-text {
  margin: -6px 0 0;

  padding: 10px 12px;

  border-radius: 8px;

  background: #fef2f2;

  color: #b91c1c;

  font-size: 12.5px;
  line-height: 1.4;
}


/* =========================
   BUTTON
========================= */

.btn-primary {
  width: 100%;
  height: 46px;

  margin-top: 2px;

  border: none;
  border-radius: 10px;

  background: #2563eb;

  color: white;

  font-size: 14px;
  font-weight: 650;

  cursor: pointer;

  transition: background 0.2s ease;
}


.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}


.btn-primary:disabled {
  background: #93c5fd;

  cursor: not-allowed;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 420px) {

  .login-card {
    padding: 28px 22px;
  }

}

</style>