<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'
const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const isAdmin = computed(() => currentUser.value?.role === 'admin')

const errorMsg = ref('')
const loading = ref(false)
const daftarKendaraan = ref([])

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const canManage = computed(() => ['admin', 'uid'].includes(currentUser.value?.role))

const form = ref({
  id: null,
  nomorKendaraan: '',
  dealer: '',
  km: null,
  picDriver: '',
  tanggalService: '',
  keterangan: '',
  status: 'pending'
})

const isEditMode = computed(() => !!route.params.id)

const ambilDaftarKendaraan = async () => {
  try {
    const response = await api.get('/kendaraan')
    daftarKendaraan.value = response.data
  } catch (error) {
    console.error('Gagal ambil daftar kendaraan', error)
  }
}

const ambilDataJadwal = async () => {
  if (!isEditMode.value) return
  try {
    const response = await api.get(`/jadwal-service/${route.params.id}`)
    form.value = { ...response.data }
  } catch (error) {
    errorMsg.value = 'Gagal ambil data jadwal: ' + error.message
  }
}

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const payload = {
      ...form.value,
      username: currentUser.value.username
    }

    if (isEditMode.value) {
      await api.put(`/jadwal-service/${form.value.id}`, payload)
    } else {
      await api.post('/jadwal-service', payload)
    }
    showToast(isEditMode.value ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!')
    router.push('/jadwal-service')
  } catch (error) {
    errorMsg.value = 'Gagal simpan data: ' + (error.response?.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

const batal = () => {
  router.push('/jadwal-service')
}

onMounted(() => {
  ambilDaftarKendaraan()
  ambilDataJadwal()
})
</script>

<template>
  <div>
    <h2>{{ isEditMode ? 'Edit Jadwal Service' : 'Jadwal Service' }}</h2>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <form @submit.prevent="submitForm" class="form-card">
      <div class="form-row">
        <label>Nomor Kendaraan</label>
        <select v-model="form.nomorKendaraan" required>
          <option value="">- Pilih Kendaraan -</option>
          <option v-for="k in daftarKendaraan" :key="k.id" :value="k.kodeKendaraan">
            {{ k.kodeKendaraan }} ({{ k.tipeKendaraan }})
          </option>
        </select>
      </div>

      <div class="form-row">
        <label>Dealer Terdekat</label>
        <input v-model="form.dealer" type="text" placeholder="Nama dealer/bengkel" />
      </div>

      <div class="form-row">
        <label>KM</label>
        <input v-model.number="form.km" type="number" placeholder="Kilometer kendaraan" />
      </div>

      <div class="form-row">
        <label>No HP PIC Driver</label>
        <input v-model="form.picDriver" type="tel" placeholder="081321454544" />
      </div>

      <div class="form-row">
        <label>Rencana Tgl Service</label>
        <input v-model="form.tanggalService" type="date" required />
      </div>

      <div class="form-row">
        <label>Keterangan</label>
        <textarea v-model="form.keterangan" rows="3"></textarea>
      </div>

      <div class="form-row" v-if="isAdmin && isEditMode">
        <label>Status</label>
        <select v-model="form.status">
          <option value="Open">Open</option>
          <option value="On Progress">On Progress</option>
          <option value="Close">Close</option>
          <option value="Cancel">Cancel</option>
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
  letter-spacing: 0.01em;
}

input, select, textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e3edf7;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
  background: #fbfdff;
  color: #1e2a3a;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

input::placeholder, textarea::placeholder {
  color: #a0aec0;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4a9eeb;
  background: white;
  box-shadow: 0 0 0 4px rgba(74, 158, 235, 0.12);
}

input:hover, select:hover, textarea:hover {
  border-color: #cfe4fb;
}

.preview-img {
  margin-top: 12px;
  max-width: 100%;
  max-height: 240px;
  border-radius: 10px;
  border: 1px solid #eef4fa;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f4f8;
}

.btn-primary {
  background-color: #4a9eeb;
  color: white;
  border: none;
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2b7cd3;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: #b8d9f7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f4f7fa;
  color: #4a5568;
  border: none;
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
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