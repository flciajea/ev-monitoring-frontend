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
const daftarKeluhan = ref([])
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
const canHandle = computed(() => ['admin', 'uid'].includes(currentUser.value?.role))

const filteredKeluhan = computed(() => {
  if (!searchQuery.value) return daftarKeluhan.value

  const q = searchQuery.value.toLowerCase()

  return daftarKeluhan.value.filter(kh =>
    kh.nomorKendaraan?.toLowerCase().includes(q) ||
    kh.pengaduan?.toLowerCase().includes(q) ||
    kh.username?.toLowerCase().includes(q)
  )
})

const ambilData = async () => {
  loading.value = true

  try {
    const response = await api.get('/keluhan')
    daftarKeluhan.value = response.data
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
    await api.delete(`/keluhan/${idToDelete.value}`)
    showToast('Keluhan berhasil dihapus!')
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
      <h2>Daftar Keluhan</h2>

      <button
        v-if="isDriver"
        @click="router.push('/keluhan/tambah')"
        class="btn-primary"
      >
        + Lapor Keluhan
      </button>
    </div>

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nomor kendaraan, pengaduan, atau username..."
    />

    <p v-if="loading">
      Loading...
    </p>

    <p v-else-if="errorMsg" class="error-text">
      {{ errorMsg }}
    </p>

    <EmptyState
      v-else-if="filteredKeluhan.length === 0"
      :message="searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada keluhan'"
      :subtext="searchQuery ? 'Coba kata kunci lain' : 'Belum ada laporan keluhan masuk'"
    />

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nomor Kendaraan</th>
            <th>Pengaduan</th>
            <th>Tanggal</th>
            <th>Dilapor Oleh</th>
            <th>Status</th>
            <th>Ditangani Oleh</th>
            <th v-if="canHandle">Aksi</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="kh in filteredKeluhan"
            :key="kh.id"
          >
            <td>{{ kh.id }}</td>

            <td>{{ kh.nomorKendaraan }}</td>

            <td>{{ kh.pengaduan }}</td>

            <td>{{ kh.tanggal }}</td>

            <td>{{ kh.username }}</td>

            <td>
              <span
                class="status-badge"
                :class="kh.status"
              >
                <span
                  v-if="kh.status !== 'Close'"
                  class="status-dot"
                ></span>

                {{ kh.status }}
              </span>
            </td>

            <td>{{ kh.ditanganiOleh || '-' }}</td>

            <td v-if="canHandle">
              <div class="action-buttons">
                <button
                  @click="router.push(`/keluhan/edit/${kh.id}`)"
                  class="btn-edit"
                >
                  Edit
                </button>

                <button
                  @click="mintaHapus(kh.id)"
                  class="btn-delete"
                  title="Hapus"
                  aria-label="Hapus"
                >
                  <svg
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
      title="Hapus Keluhan"
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

tr:hover td {
  background-color: #f7fbff;
}

/* =========================
   STATUS
   ========================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Titik warna status */

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* Open */

.status-badge.Open {
  background-color: #e0f0ff;
  color: #2b7cd3;
}

.status-badge.Open .status-dot {
  background-color: #2b7cd3;
}

/* On Progress */

.status-badge.On.Progress {
  background-color: #fff4e0;
  color: #d68a00;
}

.status-badge.On.Progress .status-dot {
  background-color: #d68a00;
}

/* Close
   Sudah selesai → polos */

.status-badge.Close {
  background-color: transparent;
  color: #6b7280;
}

/* Cancel */

.status-badge.Cancel {
  background-color: #fdecea;
  color: #e74c3c;
}

.status-badge.Cancel .status-dot {
  background-color: #e74c3c;
}

/* =========================
   ACTION BUTTON
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
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fdecea;
  color: #e74c3c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-delete:hover {
  background-color: #fad9d6;
}

.btn-delete:active {
  transform: scale(0.95);
}

.btn-delete svg {
  display: block;
}
</style>
```
