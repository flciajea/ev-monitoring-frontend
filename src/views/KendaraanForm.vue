<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'
const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const errorMsg = ref('')
const loading = ref(false)
const daftarUnit = ref([])
const daftarDriver = ref([])

const form = ref({
  id: null,
  kodeKendaraan: '',
  tipeKendaraan: '',
  unit: '',
  driverUsername: '',
  statusKendaraan: 'aktif'
})

const isEditMode = computed(() => !!route.params.id)

const ambilDaftarUnit = async () => {
  try {
    const response = await api.get('/unit')
    daftarUnit.value = response.data
  } catch (error) {
    console.error('Gagal ambil daftar unit', error)
  }
}

const ambilDaftarDriver = async () => {
  try {
    const response = await api.get('/users')
    daftarDriver.value = response.data.filter(u => u.role && u.role.name === 'driver')
  } catch (error) {
    console.error('Gagal ambil daftar driver', error)
  }
} 

const ambilDataKendaraan = async () => {
  if (!isEditMode.value) return
  try {
    const response = await api.get(`/kendaraan/${route.params.id}`)
    form.value = { ...response.data }
  } catch (error) {
    errorMsg.value = 'Gagal ambil data kendaraan: ' + error.message
  }
}

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    if (isEditMode.value) {
      await api.put(`/kendaraan/${form.value.id}`, form.value)
    } else {
      await api.post('/kendaraan', form.value)
    } 
    showToast(isEditMode.value ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!')
    router.push('/kendaraan')
  } catch (error) {
    errorMsg.value = 'Gagal simpan data: ' + (error.response?.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

const batal = () => {
  router.push('/kendaraan')
}

onMounted(() => {
  ambilDaftarUnit()
  ambilDaftarDriver()
  ambilDataKendaraan()
})
</script>

<template>
  <div>
    <h2>{{ isEditMode ? 'Edit Kendaraan' : 'Tambah Kendaraan' }}</h2>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <form @submit.prevent="submitForm" class="form-card">
      <div class="form-row">
        <label>Kode Kendaraan</label>
        <input v-model="form.kodeKendaraan" type="text" required placeholder="EV-001" />
      </div>

      <div class="form-row">
        <label>Tipe Kendaraan</label>
        <input v-model="form.tipeKendaraan" type="text" placeholder="Motor Listrik" />
      </div>

      <div class="form-row">
        <label>Unit</label>
        <select v-model="form.unit" required>
          <option value="">- Pilih Unit -</option>
          <option v-for="u in daftarUnit" :key="u.id" :value="u.namaUnit">
            {{ u.namaUnit }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <label>Driver</label>
        <select v-model="form.driverUsername">
          <option value="">- Belum ada driver -</option>
          <option v-for="d in daftarDriver" :key="d.id" :value="d.username">
            {{ d.namaLengkap }} ({{ d.username }})
          </option>
        </select>
      </div>

      <div class="form-row">
        <label>Status</label>
        <select v-model="form.statusKendaraan">
          <option value="aktif">Aktif</option>
          <option value="maintenance">Maintenance</option>
          <option value="nonaktif">Nonaktif</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Menyimpan...' : (isEditMode ? 'Update' : 'Simpan') }}
        </button>
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

.btn-primary:hover:not(:disabled) {
  background-color: #2b7cd3;
}

.btn-primary:disabled {
  background-color: #b8d9f7;
  cursor: not-allowed;
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