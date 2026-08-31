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
const daftarData = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const showConfirm = ref(false)
const idToDelete = ref(null)

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})
const canManage = computed(() => ['admin', 'uid'].includes(currentUser.value?.role))

const filteredData = computed(() => {
  if (!searchQuery.value) return daftarData.value
  const q = searchQuery.value.toLowerCase()
  return daftarData.value.filter(item =>
    item.nomorKendaraan?.toLowerCase().includes(q) ||
    item.sparepart?.toLowerCase().includes(q) ||
    item.username?.toLowerCase().includes(q)
  )
})

const ambilData = async () => {
  loading.value = true
  try {
    const response = await api.get('/ganti-sparepart')
    daftarData.value = response.data
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
    await api.delete(`/ganti-sparepart/${idToDelete.value}`)
    showToast('Data berhasil dihapus!')
    ambilData()
  } catch (error) {
    errorMsg.value = 'Gagal hapus data: ' + (error.response?.data?.error || error.message)
  } finally {
    showConfirm.value = false
    idToDelete.value = null
  }
}

const formatRupiah = (angka) => {
  if (!angka) return '-'
  return 'Rp ' + Number(angka).toLocaleString('id-ID')
}

onMounted(() => { ambilData() })
</script>

<template>
  <div>
    <div class="header-row">
      <h2>Ganti Sparepart Fast Moving</h2>
      <button @click="router.push('/ganti-sparepart/tambah')" class="btn-primary">+ Tambah Data</button>
    </div>

    <SearchInput v-model="searchQuery" placeholder="Cari nomor kendaraan, sparepart, atau username..." />

    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <EmptyState
      v-else-if="filteredData.length === 0"
      :message="searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada data ganti sparepart'"
      :subtext="searchQuery ? 'Coba kata kunci lain' : ''"
    />

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nomor Kendaraan</th><th>Sparepart</th><th>Biaya</th><th>Tanggal</th>
            <th>Keterangan</th><th>Dicatat Oleh</th>
            <th v-if="canManage">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredData" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nomorKendaraan }}</td>
            <td>{{ item.sparepart }}</td>
            <td>{{ formatRupiah(item.biaya) }}</td>
            <td>{{ item.tanggal }}</td>
            <td>{{ item.keterangan || '-' }}</td>
            <td>{{ item.username }}</td>
            <td v-if="canManage">
              <button @click="router.push(`/ganti-sparepart/edit/${item.id}`)" class="btn-edit">Edit</button>
              <button @click="mintaHapus(item.id)" class="btn-delete">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal :show="showConfirm" title="Hapus Data" message="Data yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?" confirm-text="Ya, Hapus" danger @confirm="konfirmasiHapus" @cancel="batalHapus" />
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
.btn-edit { background-color: #e0f0ff; color: #2b7cd3; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-right: 6px; }
.btn-edit:hover { background-color: #cce4fb; }
.btn-delete { background-color: #fdecea; color: #e74c3c; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-delete:hover { background-color: #fad9d6; }
</style>