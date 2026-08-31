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
const daftarKendaraan = ref([])
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

const filteredKendaraan = computed(() => {
  if (!searchQuery.value) return daftarKendaraan.value
  const q = searchQuery.value.toLowerCase()
  return daftarKendaraan.value.filter(k =>
    k.kodeKendaraan?.toLowerCase().includes(q) ||
    k.unit?.toLowerCase().includes(q) ||
    k.driverUsername?.toLowerCase().includes(q)
  )
})

const ambilData = async () => {
  loading.value = true
  try {
    const response = await api.get('/kendaraan')
    daftarKendaraan.value = response.data
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
    await api.delete(`/kendaraan/${idToDelete.value}`)
    showToast('Kendaraan berhasil dihapus!')
    ambilData()
  } catch (error) {
    errorMsg.value = 'Gagal hapus data: ' + (error.response?.data?.error || error.message)
  } finally {
    showConfirm.value = false
    idToDelete.value = null
  }
}

onMounted(() => { ambilData() })
</script>

<template>
  <div>
    <div class="header-row">
      <h2>Daftar Kendaraan</h2>
      <button v-if="isAdmin" @click="router.push('/kendaraan/tambah')" class="btn-primary">+ Tambah Kendaraan</button>
    </div>

    <SearchInput v-model="searchQuery" placeholder="Cari kode kendaraan, unit, atau driver..." />

    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <EmptyState
      v-else-if="filteredKendaraan.length === 0"
      :message="searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada data kendaraan'"
      :subtext="searchQuery ? 'Coba kata kunci lain' : 'Klik tombol Tambah Kendaraan untuk mulai'"
    />

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Kode Kendaraan</th><th>Tipe</th><th>Unit</th><th>Driver</th><th>Status</th>
            <th v-if="isAdmin">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in filteredKendaraan" :key="k.id">
            <td>{{ k.id }}</td>
            <td>{{ k.kodeKendaraan }}</td>
            <td>{{ k.tipeKendaraan }}</td>
            <td>{{ k.unit || '-' }}</td>
            <td>{{ k.driverUsername || '-' }}</td>
            <td><span class="status-badge" :class="k.statusKendaraan">{{ k.statusKendaraan }}</span></td>
            <td v-if="isAdmin">
              <button @click="router.push(`/kendaraan/edit/${k.id}`)" class="btn-edit">Edit</button>
              <button @click="mintaHapus(k.id)" class="btn-delete">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :show="showConfirm" title="Hapus Kendaraan"
      message="Data yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?"
      confirm-text="Ya, Hapus" danger
      @confirm="konfirmasiHapus" @cancel="batalHapus"
    />
  </div>
</template>

<style scoped>
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
h2 { color: #2b7cd3; font-size: 22px; margin: 0; }
.btn-primary { background-color: #4a9eeb; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; }
.btn-primary:hover { background-color: #2b7cd3; }
.error-text { color: #e74c3c; background: #fdecea; padding: 10px 14px; border-radius: 8px; font-size: 14px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08); }
th { background-color: #eaf4ff; color: #2b7cd3; padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
td { padding: 14px 16px; border-top: 1px solid #eef4fa; font-size: 14px; color: #384454; }
tr:hover td { background-color: #f7fbff; }
.status-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
.status-badge.aktif { background-color: #e3f9e5; color: #1e9e3a; }
.status-badge.maintenance { background-color: #fff4e0; color: #d68a00; }
.status-badge.nonaktif { background-color: #fdecea; color: #e74c3c; }
.btn-edit { background-color: #e0f0ff; color: #2b7cd3; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-right: 6px; }
.btn-edit:hover { background-color: #cce4fb; }
.btn-delete { background-color: #fdecea; color: #e74c3c; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-delete:hover { background-color: #fad9d6; }
</style>