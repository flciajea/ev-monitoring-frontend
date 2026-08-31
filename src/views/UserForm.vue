<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'
const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const daftarUnit = ref([])
const errorMsg = ref('')

const form = ref({
  id: null,
  username: '',
  password: '',
  namaLengkap: '',
  role: 3, // default driver
  unit: null
})

// cek dari URL: kalau ada :id, berarti mode edit
const isEditMode = computed(() => !!route.params.id)

const ambilDaftarUnit = async () => {
  try {
    const response = await api.get('/unit')
    daftarUnit.value = response.data
  } catch (error) {
    console.error('Gagal ambil daftar unit', error)
  }
}

const ambilDataUser = async () => {
  if (!isEditMode.value) return
  try {
    const response = await api.get(`/users/${route.params.id}`)
    const user = response.data
    form.value = {
      id: user.id,
      username: user.username,
      password: '',
      namaLengkap: user.namaLengkap,
      role: user.role ? user.role.id : null,
      unit: user.unit ? user.unit.id : null
    }
  } catch (error) {
    errorMsg.value = 'Gagal ambil data user: ' + error.message
  }
}

const submitForm = async () => {
  try {
    const payload = {
      ...form.value,
      role: form.value.role ? { id: form.value.role } : null,
      unit: form.value.unit ? { id: form.value.unit } : null
    }

    if (isEditMode.value) {
      await api.put(`/users/${form.value.id}`, payload)
    } else {
      await api.post('/users', payload)
    }
    
    router.push('/users')
  } catch (error) {
    errorMsg.value = 'Gagal simpan data: ' + (error.response?.data?.error || error.message)
  }
}

const batal = () => {
  router.push('/users')
}

onMounted(() => {
  ambilDaftarUnit()
  ambilDataUser()
})
</script>

<template>
  <div>
    <h2>{{ isEditMode ? 'Edit User' : 'Tambah User' }}</h2>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <form @submit.prevent="submitForm" class="form-card">
      <div class="form-row">
        <label>Username</label>
        <input v-model="form.username" type="text" required />
      </div>
      <div class="form-row">
        <label>Password {{ isEditMode ? '(kosongkan jika tidak ganti)' : '' }}</label>
        <input v-model="form.password" type="password" :required="!isEditMode" />
      </div>
      <div class="form-row">
        <label>Nama Lengkap</label>
        <input v-model="form.namaLengkap" type="text" required />
      </div>
      <div class="form-row">
        <label>Role</label>
          <select v-model="form.role">
            <option :value="null">- Pilih Role -</option>
            <option :value="1">Admin</option>
            <option :value="2">UID</option>
            <option :value="3">Driver</option>
          </select>
      </div>
      <div class="form-row" v-if="form.role !== 1">
        <label>Unit</label>
        <select v-model="form.unit">
          <option :value="null">- Pilih Unit -</option>
          <option v-for="unit in daftarUnit" :key="unit.id" :value="unit.id">
            {{ unit.namaUnit }}
          </option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">{{ isEditMode ? 'Update' : 'Simpan' }}</button>
        <button type="button" @click="batal" class="btn-secondary">Batal</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
h2 {
  color: #2b7cd3;
  font-size: 22px;
  margin-bottom: 16px;
}

.form-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08);
  max-width: 480px;
}

.form-row {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
}

input, select {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cfe4fb;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
  background: white;
}

input:focus, select:focus {
  outline: none;
  border-color: #4a9eeb;
  box-shadow: 0 0 0 3px rgba(74, 158, 235, 0.15);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #4a9eeb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
}

.btn-primary:hover {
  background-color: #2b7cd3;
}

.btn-secondary {
  background-color: #eef2f6;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
}

.btn-secondary:hover {
  background-color: #e0e6ed;
}

.error-text {
  color: #e74c3c;
  background: #fdecea;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}
</style>