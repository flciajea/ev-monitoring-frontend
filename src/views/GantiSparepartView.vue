```vue
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import ConfirmModal from '../components/ConfirmModal.vue'
import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { showToast } = useToast()
const daftarJadwal = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const showConfirm = ref(false)
const idToDelete = ref(null)

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const isDriver = computed(() => currentUser.value?.role === 'driver')
const canManage = computed(() => ['admin', 'uid'].includes(currentUser.value?.role))

const filteredJadwal = computed(() => {
  if (!searchQuery.value) return daftarJadwal.value

  const q = searchQuery.value.toLowerCase()

  return daftarJadwal.value.filter(j =>
    j.nomorKendaraan?.toLowerCase().includes(q) ||
    j.dealer?.toLowerCase().includes(q)
  )
})

/* =========================
   CEK TENGGAT SERVICE
   ========================= */

const getStatusTanggal = (tanggal) => {
  if (!tanggal) {
    return {
      class: '',
      text: ''
    }
  }

  const hariIni = new Date()
  hariIni.setHours(0, 0, 0, 0)

  const tanggalService = new Date(tanggal)
  tanggalService.setHours(0, 0, 0, 0)

  const selisihMs = tanggalService - hariIni
  const selisihHari = Math.ceil(
    selisihMs / (1000 * 60 * 60 * 24)
  )

  // Hari ini atau sudah lewat
  if (selisihHari <= 0) {
    return {
      class: 'deadline-danger',
      text: selisihHari < 0
        ? `Terlambat ${Math.abs(selisihHari)} hari`
        : 'Hari ini'
    }
  }

  // H-1 sampai H-5
  if (selisihHari <= 5) {
    return {
      class: 'deadline-warning',
      text: `H-${selisihHari}`
    }
  }

  // Lebih dari H-5 → polos
  return {
    class: '',
    text: `H-${selisihHari}`
  }
}

const getStatusStyle = (status) => {
  const styles = {
    'Open': {
      backgroundColor: '#e0f0ff',
      color: '#2b7cd3'
    },
    'On Progress': {
      backgroundColor: '#fff4e0',
      color: '#d68a00'
    },
    'Close': {
      backgroundColor: '#e3f9e5',
      color: '#1e9e3a'
    },
    'Cancel': {
      backgroundColor: '#fdecea',
      color: '#e74c3c'
    }
  }

  return styles[status] || {}
}

const ambilData = async () => {
  loading.value = true

  try {
    const response = await api.get('/jadwal-service')
    daftarJadwal.value = response.data
    errorMsg.value = ''
  } catch (error) {
    errorMsg.value = 'Gagal ambil data: ' + error.message
  } finally {
    loading.value = false
  }
}

const mintaHapus = (id) => {
  idToDelete.value = id
  showConfirm.value = true
}

const batalHapus = () => {
  showConfirm.value = false
  idToDelete.value = null
}

const konfirmasiHapus = async () => {
  try {
    await api.delete(`/jadwal-service/${idToDelete.value}`)
    showToast('Jadwal service berhasil dihapus!')
    ambilData()
  } catch (error) {
    errorMsg.value =
      'Gagal hapus data: ' +
      (error.response?.data?.error || error.message)
  } finally {
    showConfirm.value = false
    idToDelete.value = null
  }
}

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div>
    <div class="header-row">
      <h2>Daftar Jadwal Service</h2>
    </div>

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nomor kendaraan atau dealer..."
    />

    <p v-if="loading">
      Loading...
    </p>

    <p v-else-if="errorMsg" class="error-text">
      {{ errorMsg }}
    </p>

    <EmptyState
      v-else-if="filteredJadwal.length === 0"
      :message="searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada jadwal service'"
      :subtext="searchQuery ? 'Coba kata kunci lain' : 'Klik tombol Tambah Jadwal untuk mulai'"
    />

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nomor Kendaraan</th>
            <th>Dealer Terdekat</th>
            <th>KM</th>
            <th>No HP PIC Driver</th>
            <th>Rencana Tgl Service</th>
            <th>Keterangan</th>
            <th>Status</th>
            <th v-if="canManage">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="j in filteredJadwal"
            :key="j.id"
          >
            <td>{{ j.id }}</td>

            <td>{{ j.nomorKendaraan }}</td>

            <td>{{ j.dealer || '-' }}</td>

            <td>{{ j.km || '-' }}</td>

            <td>{{ j.picDriver || '-' }}</td>

            <td>
              <div class="tanggal-service">
                <strong>{{ j.tanggalService }}</strong>

                <span
                  v-if="getStatusTanggal(j.tanggalService).text"
                  class="deadline-label"
                  :class="getStatusTanggal(j.tanggalService).class"
                >
                  {{ getStatusTanggal(j.tanggalService).text }}
                </span>
              </div>
            </td>

            <td>{{ j.keterangan || '-' }}</td>

            <td>
              <span
                class="status-badge"
                :style="getStatusStyle(j.status)"
              >
                {{ j.status || 'Open' }}
              </span>
            </td>

            <td v-if="canManage">
              <div class="action-buttons">
                <button
                  @click="router.push(`/jadwal-service/edit/${j.id}`)"
                  class="btn-edit"
                >
                  Edit
                </button>

                <button
                  @click="mintaHapus(j.id)"
                  class="btn-delete"
                  title="Hapus"
                  aria-label="Hapus jadwal service"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14H6L5 6"></path>
                    <path d="M10 11v6"></path>
                    <path d="M14 11v6"></path>
                    <path d="M9 6V4h6v2"></path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :show="showConfirm"
      title="Hapus Jadwal Service"
      message="Data yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?"
      confirm-text="Ya, Hapus"
      danger
      @confirm="konfirmasiHapus"
      @cancel="batalHapus"
    />
  </div>
</template>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
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

.error-text {
  color: #e74c3c;
  background: #fdecea;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08);
}

th {
  background-color: #eaf4ff;
  color: #2b7cd3;
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

td {
  padding: 14px 16px;
  border-top: 1px solid #eef4fa;
  font-size: 14px;
  color: #384454;
}

/* Hover tabel tetap dipertahankan */
tr:hover td {
  background-color: #f7fbff;
}

/* =========================
   TOMBOL AKSI
   ========================= */

.action-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-edit {
  background-color: #e0f0ff;
  color: #2b7cd3;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-edit:hover {
  background-color: #cce4fb;
}

.btn-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fdecea;
  color: #e74c3c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
}

.btn-delete:hover {
  background-color: #fad9d6;
}

.btn-delete svg {
  width: 16px;
  height: 16px;
}

/* =========================
   TANGGAL SERVICE
   ========================= */

.tanggal-service {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.deadline-label {
  display: inline-block;
  width: fit-content;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

/* Hari ini / sudah lewat */
.deadline-danger {
  background-color: #fdecea;
  color: #e74c3c;
}

/* H-1 sampai H-5 */
.deadline-warning {
  background-color: #fff3cd;
  color: #d68910;
}

/* Lebih dari H-5 tidak diberi warna */

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
</style>
```
