<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import ConfirmModal from '../components/ConfirmModal.vue'
import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()
const daftarSparepart = ref([])
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

const form = ref({ id: null, namaSparepart: '', fUsed: true })
const isEditMode = ref(false)

const filteredSparepart = computed(() => {
  if (!searchQuery.value) return daftarSparepart.value
  const q = searchQuery.value.toLowerCase()
  return daftarSparepart.value.filter(s => s.namaSparepart?.toLowerCase().includes(q))
})

const ambilData = async () => {
  loading.value = true
  try {
    const response = await api.get('/sparepart')
    daftarSparepart.value = response.data
    errorMsg.value = ''
  } catch (error) {
    errorMsg.value = 'Gagal ambil data: ' + error.message
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { id: null, namaSparepart: '', fUsed: true }
  isEditMode.value = false
}

const submitForm = async () => {
  try {
    if (isEditMode.value) {
      await api.put(`/sparepart/${form.value.id}`, form.value)
      showToast('Sparepart berhasil diupdate!')
    } else {
      await api.post('/sparepart', form.value)
      showToast('Sparepart berhasil ditambahkan!')
    }
    resetForm()
    ambilData()
  } catch (error) {
    errorMsg.value = 'Gagal simpan data: ' + (error.response?.data?.error || error.message)
  }
}

const editData = (item) => {
  form.value = { ...item }
  isEditMode.value = true
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
    await api.delete(`/sparepart/${idToDelete.value}`)
    showToast('Sparepart berhasil dihapus!')
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
    <template v-if="isAdmin">
      <h2>{{ isEditMode ? 'Edit Sparepart' : 'Tambah Sparepart' }}</h2>
      <form @submit.prevent="submitForm" class="form-card">
        <div class="form-row">
          <label>Nama Sparepart</label>
          <input v-model="form.namaSparepart" type="text" required />
        </div>
        <div class="form-row checkbox-row">
          <label><input type="checkbox" v-model="form.fUsed" /> Masih digunakan</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">{{ isEditMode ? 'Update' : 'Simpan' }}</button>
          <button type="button" v-if="isEditMode" @click="resetForm" class="btn-secondary">Batal</button>
        </div>
      </form>
    </template>

    <h2 class="section-title">Daftar Sparepart</h2>
    <SearchInput v-model="searchQuery" placeholder="Cari nama sparepart..." />

    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <EmptyState
      v-else-if="filteredSparepart.length === 0"
      :message="searchQuery ? 'Tidak ada hasil ditemukan' : 'Belum ada data sparepart'"
      :subtext="searchQuery ? 'Coba kata kunci lain' : ''"
    />

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr><th>ID</th><th>Nama Sparepart</th><th>Status</th><th v-if="isAdmin">Aksi</th></tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredSparepart" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.namaSparepart }}</td>
            <td><span class="status-badge" :class="item.fUsed ? 'aktif' : 'nonaktif'">{{ item.fUsed ? 'Digunakan' : 'Tidak digunakan' }}</span></td>
            <td v-if="isAdmin">
              <button @click="editData(item)" class="btn-edit">Edit</button>
              <button @click="mintaHapus(item.id)" class="btn-delete">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal :show="showConfirm" title="Hapus Sparepart" message="Data yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?" confirm-text="Ya, Hapus" danger @confirm="konfirmasiHapus" @cancel="batalHapus" />
  </div>
</template>

<style scoped>
h2 { color: #2b7cd3; font-size: 22px; margin-bottom: 16px; }
.section-title { margin-top: 32px; }
.form-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08); max-width: 480px; }
.form-row { margin-bottom: 16px; }
.checkbox-row label { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #4a5568; font-size: 14px; }
.checkbox-row input[type="checkbox"] { width: auto; }
label { display: block; margin-bottom: 6px; font-weight: 600; color: #4a5568; font-size: 13px; }
input { width: 100%; padding: 9px 12px; border: 1px solid #cfe4fb; border-radius: 8px; box-sizing: border-box; font-size: 14px; font-family: inherit; }
input:focus { outline: none; border-color: #4a9eeb; box-shadow: 0 0 0 3px rgba(74, 158, 235, 0.15); }
.form-actions { display: flex; gap: 10px; }
.btn-primary { background-color: #4a9eeb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; }
.btn-primary:hover { background-color: #2b7cd3; }
.btn-secondary { background-color: #eef2f6; color: #4a5568; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-family: inherit; }
.btn-secondary:hover { background-color: #e0e6ed; }
.error-text { color: #e74c3c; background: #fdecea; padding: 10px 14px; border-radius: 8px; font-size: 14px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08); }
th { background-color: #eaf4ff; color: #2b7cd3; padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; }
td { padding: 14px 16px; border-top: 1px solid #eef4fa; font-size: 14px; color: #384454; }
tr:hover td { background-color: #f7fbff; }
.status-badge { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
.status-badge.aktif { background-color: #e3f9e5; color: #1e9e3a; }
.status-badge.nonaktif { background-color: #fdecea; color: #e74c3c; }
.btn-edit { background-color: #e0f0ff; color: #2b7cd3; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; margin-right: 6px; }
.btn-edit:hover { background-color: #cce4fb; }
.btn-delete { background-color: #fdecea; color: #e74c3c; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-delete:hover { background-color: #fad9d6; }
</style>