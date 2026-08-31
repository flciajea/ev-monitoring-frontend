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

      <div class="form-row" v-if="canManage && isEditMode">
        <label>Status</label>
        <select v-model="form.status">
          <option value="pending">Pending</option>
          <option value="selesai">Selesai</option>
          <option value="dibatalkan">Dibatalkan</option>
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

input, select, textarea {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cfe4fb;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
  background: white;
}

textarea {
  resize: vertical;
}

input:focus, select:focus, textarea:focus {
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