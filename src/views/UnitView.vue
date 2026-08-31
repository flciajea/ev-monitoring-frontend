<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import ConfirmModal from '../components/ConfirmModal.vue'
import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'
import { useToast } from '../composables/useToast'
const { showToast } = useToast()

const router = useRouter()
const daftarUnit = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

const showConfirm = ref(false)
const idToDelete = ref(null)

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const isAdmin = computed(() => currentUser.value?.role === 'admin')

const filteredUnit = computed(() => {
  if (!searchQuery.value) return daftarUnit.value
  const q = searchQuery.value.toLowerCase()
  return daftarUnit.value.filter(u =>
    u.namaUnit?.toLowerCase().includes(q) ||
    u.kodeUnit?.toLowerCase().includes(q) ||
    u.tipeUnit?.toLowerCase().includes(q)
  )
})

const ambilData = async () => {
  loading.value = true
  try {
    const response = await api.get('/unit')
    daftarUnit.value = response.data
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
    await api.delete(`/unit/${idToDelete.value}`)
    showToast('Unit berhasil dihapus!')
    ambilData()
  } catch (error) {
    errorMsg.value = 'Gagal hapus data: ' + (error.response?.data?.error || error.message)
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
      <h2>Daftar Unit</h2>
      <button v-if="isAdmin" @click="router.push('/unit/tambah')" class="btn-primary">
        + Tambah Unit
      </button>
    </div>

    <SearchInput v-model="searchQuery" placeholder="Cari nama unit, kode, atau tipe..." />

    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <EmptyState
      v-else-if="filteredUnit.length === 0"
      :message="searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada data unit'"
      :subtext="searchQuery ? 'Coba kata kunci lain' : 'Klik tombol Tambah Unit untuk mulai'"
    />

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Unit</th>
            <th>Kode Unit</th>
            <th>Tipe</th>
            <th v-if="isAdmin">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="unit in filteredUnit" :key="unit.id">
            <td>{{ unit.id }}</td>
            <td>{{ unit.namaUnit }}</td>
            <td>{{ unit.kodeUnit }}</td>
            <td>{{ unit.tipeUnit || '-' }}</td>
            <td v-if="isAdmin">
              <button @click="router.push(`/unit/edit/${unit.id}`)" class="btn-edit">Edit</button>
              <button @click="mintaHapus(unit.id)" class="btn-delete">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :show="showConfirm"
      title="Hapus Unit"
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

.btn-edit {
  background-color: #e0f0ff;
  color: #2b7cd3;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  margin-right: 6px;
}

.btn-edit:hover {
  background-color: #cce4fb;
}

.btn-delete {
  background-color: #fdecea;
  color: #e74c3c;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-delete:hover {
  background-color: #fad9d6;
}
</style>