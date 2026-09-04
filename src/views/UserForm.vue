<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  id: null,
  username: '',
  password: '',
  namaLengkap: '',
  email: '',
  noHp: '',
  unit: '',
  uid: '',
  up3: '',
  noKendaraan: '',
  active: true
})

const isEditMode = computed(() => !!route.params.id)

const ambilDataUser = async () => {
  if (!isEditMode.value) return

  loading.value = true

  try {
    const response = await api.get(`/users/${route.params.id}`)
    const user = response.data

    form.value = {
      id: user.id,
      username: user.username || '',
      password: '',
      namaLengkap: user.namaLengkap || '',
      email: user.email || '',
      noHp: user.noHp || '',
      unit: user.unit || '',
      uid: user.uid || '',
      up3: user.up3 || '',
      noKendaraan: user.noKendaraan || '',
      active: user.active ?? true
    }
  } catch (error) {
    errorMsg.value =
      'Gagal ambil data user: ' +
      (error.response?.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const payload = {
      username: form.value.username,
      namaLengkap: form.value.namaLengkap,
      email: form.value.email || null,
      noHp: form.value.noHp || null,
      unit: form.value.unit || null,
      uid: form.value.uid || null,
      up3: form.value.up3 || null,
      noKendaraan: form.value.noKendaraan || null,
      active: form.value.active
    }

    if (form.value.password.trim()) {
      payload.password = form.value.password
    }

    if (isEditMode.value) {
      await api.put(`/users/${form.value.id}`, payload)
      showToast('User berhasil diupdate!')
    } else {
      if (!form.value.password.trim()) {
        errorMsg.value = 'Password wajib diisi untuk user baru.'
        loading.value = false
        return
      }

      payload.password = form.value.password

      await api.post('/users', payload)
      showToast('User berhasil ditambahkan!')
    }

    router.push('/users')
  } catch (error) {
    errorMsg.value =
      'Gagal simpan data: ' +
      (error.response?.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

const batal = () => {
  router.push('/users')
}

onMounted(() => {
  ambilDataUser()
})
</script>

<template>
  <div>
    <h2>{{ isEditMode ? 'Edit User' : 'Tambah User' }}</h2>

    <p v-if="errorMsg" class="error-text">
      {{ errorMsg }}
    </p>

    <form
      @submit.prevent="submitForm"
      class="form-card"
    >

      <div class="form-row">
        <label>Username</label>
        <input
          v-model="form.username"
          type="text"
          required
        />
      </div>

      <div class="form-row">
        <label>
          Password
          {{ isEditMode ? '(kosongkan jika tidak ganti)' : '' }}
        </label>

        <input
          v-model="form.password"
          type="password"
          :required="!isEditMode"
        />
      </div>

      <div class="form-row">
        <label>Nama Lengkap</label>

        <input
          v-model="form.namaLengkap"
          type="text"
          required
        />
      </div>

      <div class="form-row">
        <label>Email</label>

        <input
          v-model="form.email"
          type="email"
        />
      </div>

      <div class="form-row">
        <label>No. HP</label>

        <input
          v-model="form.noHp"
          type="text"
        />
      </div>

      <div class="form-row">
        <label>Unit</label>

        <input
          v-model="form.unit"
          type="text"
          placeholder="Contoh: UP3 Mataram"
        />
      </div>

      <div class="form-row">
        <label>UID</label>

        <input
          v-model="form.uid"
          type="text"
          placeholder="Contoh: UIW NTB"
        />
      </div>

      <div class="form-row">
        <label>UP3</label>

        <input
          v-model="form.up3"
          type="text"
          placeholder="Contoh: UP3 Mataram"
        />
      </div>

      <div class="form-row">
        <label>No. Kendaraan</label>

        <input
          v-model="form.noKendaraan"
          type="text"
          placeholder="Contoh: DK 9090 SE"
        />
      </div>

      <div class="form-row checkbox-row">
        <label class="checkbox-label">
          <input
            v-model="form.active"
            type="checkbox"
          />
          User Aktif
        </label>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          {{
            loading
              ? 'Menyimpan...'
              : (isEditMode ? 'Update' : 'Simpan')
          }}
        </button>

        <button
          type="button"
          @click="batal"
          class="btn-secondary"
          :disabled="loading"
        >
          Batal
        </button>
      </div>

    </form>
  </div>
</template>

<style scoped>
h2 {
  color: #1e2a3a;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.form-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(58, 141, 222, 0.1);
  max-width: 520px;
  border: 1px solid #eef4fa;
}

.form-row {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
}

input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e3edf7;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
  background: #fbfdff;
  color: #1e2a3a;
}

input:focus {
  outline: none;
  border-color: #4a9eeb;
  background: white;
  box-shadow: 0 0 0 4px rgba(74, 158, 235, 0.12);
}

.checkbox-row {
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f4f8;
}

.btn-primary,
.btn-secondary {
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
  border: none;
}

.btn-primary {
  background-color: #4a9eeb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2b7cd3;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f4f7fa;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e6ebf1;
}

.error-text {
  color: #c0392b;
  background: #fdecea;
  border: 1px solid #f8d7d3;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 20px;
}
</style>