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

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  try {
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
})

const role = computed(() => {
  return currentUser.value?.role?.toLowerCase() || ''
})

const canManage = computed(() => {
  return ['admin', 'uid'].includes(role.value)
})

const isEditMode = computed(() => {
  return !!route.params.id
})

const form = ref({
  id: null,
  nomorKendaraan: '',
  dealer: '',
  km: null,
  picDriver: '',
  tanggalService: '',
  keterangan: ''
})

// =========================
// AMBIL DATA JADWAL
// =========================

const ambilDataJadwal = async () => {
  if (!isEditMode.value) {
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get(
      `/jadwal-service/${route.params.id}`
    )

    const jadwal = response.data

    form.value = {
      id: jadwal.id,
      nomorKendaraan: jadwal.nomorKendaraan || '',
      dealer: jadwal.dealer || '',
      km: jadwal.km ?? null,
      picDriver: jadwal.picDriver || '',
      tanggalService: jadwal.tanggalService || '',
      keterangan: jadwal.keterangan || ''
    }
  } catch (error) {
    errorMsg.value =
      'Gagal mengambil data jadwal service: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  } finally {
    loading.value = false
  }
}

// =========================
// SUBMIT
// =========================

const submitForm = async () => {
  if (!canManage.value) {
    errorMsg.value = 'Anda tidak memiliki akses untuk mengelola jadwal service.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const payload = {
      nomorKendaraan: form.value.nomorKendaraan,
      dealer: form.value.dealer || null,
      km: form.value.km,
      picDriver: form.value.picDriver || null,
      tanggalService: form.value.tanggalService,
      keterangan: form.value.keterangan || null,
      username: currentUser.value?.username || ''
    }

    if (isEditMode.value) {
      await api.put(
        `/jadwal-service/${form.value.id}`,
        payload
      )

      showToast(
        'Jadwal service berhasil diupdate!'
      )
    } else {
      await api.post(
        '/jadwal-service',
        payload
      )

      showToast(
        'Jadwal service berhasil ditambahkan!'
      )
    }

    router.push('/jadwal-service')
  } catch (error) {
    errorMsg.value =
      'Gagal menyimpan jadwal service: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  } finally {
    loading.value = false
  }
}

// =========================
// BATAL
// =========================

const batal = () => {
  router.push('/jadwal-service')
}

// =========================
// ON MOUNTED
// =========================

onMounted(() => {
  ambilDataJadwal()
})
</script>

<template>
  <div>
    <h2>
      {{
        isEditMode
          ? 'Edit Jadwal Service'
          : 'Tambah Jadwal Service'
      }}
    </h2>

    <!-- ERROR -->
    <p
      v-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>

    <form
      class="form-card"
      @submit.prevent="submitForm"
    >

      <!-- NOMOR KENDARAAN -->
      <div class="form-row">
        <label>
          Nomor Kendaraan
        </label>

        <input
          v-model="form.nomorKendaraan"
          type="text"
          required
          placeholder="Contoh: EV-001"
        />
      </div>

      <!-- DEALER -->
      <div class="form-row">
        <label>
          Dealer / Bengkel
        </label>

        <input
          v-model="form.dealer"
          type="text"
          placeholder="Nama dealer atau bengkel"
        />
      </div>

      <!-- KM -->
      <div class="form-row">
        <label>
          KM
        </label>

        <input
          v-model.number="form.km"
          type="number"
          min="0"
          placeholder="Kilometer kendaraan"
        />
      </div>

      <!-- PIC DRIVER -->
      <div class="form-row">
        <label>
          PIC Driver
        </label>

        <input
          v-model="form.picDriver"
          type="text"
          placeholder="Nama atau kontak PIC driver"
        />
      </div>

      <!-- TANGGAL SERVICE -->
      <div class="form-row">
        <label>
          Rencana Tanggal Service
        </label>

        <input
          v-model="form.tanggalService"
          type="date"
          required
        />
      </div>

      <!-- KETERANGAN -->
      <div class="form-row">
        <label>
          Keterangan
        </label>

        <textarea
          v-model="form.keterangan"
          rows="3"
          placeholder="Keterangan jadwal service..."
        ></textarea>
      </div>

      <!-- BUTTON -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          {{
            loading
              ? 'Menyimpan...'
              : isEditMode
                ? 'Update'
                : 'Simpan'
          }}
        </button>

        <button
          type="button"
          class="btn-secondary"
          @click="batal"
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

input,
textarea {
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

textarea {
  resize: vertical;
  min-height: 90px;
}

input::placeholder,
textarea::placeholder {
  color: #a0aec0;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #4a9eeb;
  background: white;
  box-shadow: 0 0 0 4px rgba(74, 158, 235, 0.12);
}

input:hover,
textarea:hover {
  border-color: #cfe4fb;
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
  background: #4a9eeb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2b7cd3;
}

.btn-primary:disabled {
  background: #b8d9f7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f4f7fa;
  color: #4a5568;
}

.btn-secondary:hover:not(:disabled) {
  background: #e6ebf1;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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