<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

const dataEmisi = ref(null)
const loading = ref(true)
const errorMsg = ref('')
const isEditing = ref(false)

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const isAdmin = computed(() => currentUser.value?.role === 'admin')

const form = ref({
  id: null,
  totalEmisiEv: 0,
  totalEmisiIce: 0,
  totalJarakTempuh: 0,
  totalKendaraan: 0,
  totalPenurunanEmisi: 0,
  totalRpReduksiCarbon: 0
})

const ambilData = async () => {
  loading.value = true
  try {
    const response = await api.get('/emisi-karbon')
    if (response.data.length > 0) {
      dataEmisi.value = response.data[0]
      form.value = { ...response.data[0] }
    }
    errorMsg.value = ''
  } catch (error) {
    errorMsg.value = 'Gagal ambil data: ' + error.message
  } finally {
    loading.value = false
  }
}

const mulaiEdit = () => {
  form.value = { ...dataEmisi.value }
  isEditing.value = true
}

const batalEdit = () => {
  isEditing.value = false
}

const simpanData = async () => {
  try {
    await api.put(`/emisi-karbon/${form.value.id}`, form.value)
    isEditing.value = false
    ambilData()
  } catch (error) {
    errorMsg.value = 'Gagal simpan data: ' + (error.response?.data?.error || error.message)
  }
}

const formatAngka = (angka) => {
  if (angka === null || angka === undefined) return '0'
  return Number(angka).toLocaleString('id-ID')
}

const formatRupiah = (angka) => {
  if (!angka) return 'Rp 0'
  return 'Rp ' + Number(angka).toLocaleString('id-ID')
}

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div>
    <div class="header-row">
      <h2>Ringkasan Emisi Karbon</h2>
      <button v-if="isAdmin && !isEditing" @click="mulaiEdit" class="btn-primary">
        Edit Data
      </button>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <div v-else-if="!isEditing" class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Kendaraan</div>
        <div class="stat-value">{{ formatAngka(dataEmisi?.totalKendaraan) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Jarak Tempuh</div>
        <div class="stat-value">{{ formatAngka(dataEmisi?.totalJarakTempuh) }} km</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Emisi EV</div>
        <div class="stat-value">{{ formatAngka(dataEmisi?.totalEmisiEv) }} kg CO₂</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Emisi ICE (Estimasi)</div>
        <div class="stat-value">{{ formatAngka(dataEmisi?.totalEmisiIce) }} kg CO₂</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">Penurunan Emisi</div>
        <div class="stat-value">{{ formatAngka(dataEmisi?.totalPenurunanEmisi) }} kg CO₂</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">Reduksi Biaya Karbon</div>
        <div class="stat-value">{{ formatRupiah(dataEmisi?.totalRpReduksiCarbon) }}</div>
      </div>
    </div>

    <form v-else @submit.prevent="simpanData" class="form-card">
      <div class="form-row">
        <label>Total Kendaraan</label>
        <input v-model.number="form.totalKendaraan" type="number" />
      </div>
      <div class="form-row">
        <label>Total Jarak Tempuh (km)</label>
        <input v-model.number="form.totalJarakTempuh" type="number" step="0.01" />
      </div>
      <div class="form-row">
        <label>Total Emisi EV (kg CO₂)</label>
        <input v-model.number="form.totalEmisiEv" type="number" step="0.01" />
      </div>
      <div class="form-row">
        <label>Total Emisi ICE (kg CO₂)</label>
        <input v-model.number="form.totalEmisiIce" type="number" step="0.01" />
      </div>
      <div class="form-row">
        <label>Total Penurunan Emisi (kg CO₂)</label>
        <input v-model.number="form.totalPenurunanEmisi" type="number" step="0.01" />
      </div>
      <div class="form-row">
        <label>Total Reduksi Biaya Karbon (Rp)</label>
        <input v-model.number="form.totalRpReduksiCarbon" type="number" step="0.01" />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Simpan</button>
        <button type="button" @click="batalEdit" class="btn-secondary">Batal</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  color: #2b7cd3;
  font-size: 22px;
  margin: 0;
}

.btn-primary {
  background-color: #4a9eeb;
  color: white;
  border: none;
  padding: 10px 18px;
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
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08);
}

.stat-card.highlight {
  background: linear-gradient(135deg, #eaf4ff 0%, #ffffff 100%);
  border: 1px solid #cfe4fb;
}

.stat-label {
  font-size: 13px;
  color: #718096;
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2b7cd3;
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

input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cfe4fb;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #4a9eeb;
  box-shadow: 0 0 0 3px rgba(74, 158, 235, 0.15);
}

.form-actions {
  display: flex;
  gap: 10px;
}
</style>