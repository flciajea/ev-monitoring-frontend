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

/* =========================
   MODAL FOTO
   ========================= */

const showFotoModal = ref(false)
const fotoDipilih = ref('')

const bukaFoto = (foto) => {
  if (!foto) return

  fotoDipilih.value = foto
  showFotoModal.value = true
}

const tutupFoto = () => {
  showFotoModal.value = false
  fotoDipilih.value = ''
}

/* =========================
   USER
   ========================= */

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const canManage = computed(() =>
  ['admin', 'uid'].includes(currentUser.value?.role)
)
  
/* =========================
   SEARCH
   ========================= */

const filteredData = computed(() => {
  if (!searchQuery.value) {
    return daftarData.value
  }

  const q = searchQuery.value.toLowerCase()

  return daftarData.value.filter(item =>
    item.nomorKendaraan?.toLowerCase().includes(q) ||
    item.sparepart?.toLowerCase().includes(q) ||
    item.username?.toLowerCase().includes(q) ||
    item.keterangan?.toLowerCase().includes(q)
  )
})

/* =========================
   AMBIL DATA
   ========================= */

const ambilData = async () => {
  loading.value = true

  try {
    const response = await api.get('/ganti-sparepart')

    daftarData.value = response.data
    errorMsg.value = ''
  } catch (error) {
    errorMsg.value =
      'Gagal ambil data: ' +
      (error.response?.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

/* =========================
   TRIGGER TANGGAL
   ========================= */

const getStatusTanggal = (tanggal, status) => {

  // Kalau sudah Close,
  // trigger tanggal tidak ditampilkan
  if (status === 'Close') {
    return {
      class: '',
      text: ''
    }
  }

  if (!tanggal) {
    return {
      class: '',
      text: ''
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(tanggal)
  target.setHours(0, 0, 0, 0)

  const selisihMs = target - today

  const selisihHari = Math.ceil(
    selisihMs / (1000 * 60 * 60 * 24)
  )

  /* =========================
     TERLAMBAT
     ========================= */

  if (selisihHari < 0) {
    return {
      class: 'deadline-danger',
      text: `Terlambat ${Math.abs(selisihHari)} hari`
    }
  }

  /* =========================
     HARI INI
     ========================= */

  if (selisihHari === 0) {
    return {
      class: 'deadline-danger',
      text: 'Hari ini'
    }
  }

  /* =========================
     H-1 SAMPAI H-3
     ========================= */

  if (selisihHari <= 3) {
    return {
      class: 'deadline-danger',
      text: `H-${selisihHari}`
    }
  }

  /* =========================
     H-4 SAMPAI H-5
     ========================= */

  if (selisihHari <= 5) {
    return {
      class: 'deadline-warning',
      text: `H-${selisihHari}`
    }
  }

  /* =========================
     MASIH JAUH
     ========================= */

  return {
    class: '',
    text: `H-${selisihHari}`
  }
}

/* =========================
   STATUS
   ========================= */

const getStatusStyle = (status) => {
  const styles = {
    Open: {
      backgroundColor: '#e0f0ff',
      color: '#2b7cd3'
    },

    'On Progress': {
      backgroundColor: '#fff4e0',
      color: '#d68a00'
    },

    Close: {
      backgroundColor: '#e3f9e5',
      color: '#1e9e3a'
    },

    Cancel: {
      backgroundColor: '#fdecea',
      color: '#e74c3c'
    }
  }

  return styles[status] || {}
}

/* =========================
   EDIT
   ========================= */

const editData = (id) => {
  router.push(`/ganti-sparepart/edit/${id}`)
}

/* =========================
   HAPUS
   ========================= */

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
    await api.delete(
      `/ganti-sparepart/${idToDelete.value}`
    )

    showToast('Data berhasil dihapus!')

    await ambilData()
  } catch (error) {
    errorMsg.value =
      'Gagal hapus data: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  } finally {
    showConfirm.value = false
    idToDelete.value = null
  }
}

/* =========================
   FORMAT RUPIAH
   ========================= */

const formatRupiah = (angka) => {
  if (
    angka === null ||
    angka === undefined ||
    angka === ''
  ) {
    return '-'
  }

  return 'Rp ' + Number(angka).toLocaleString('id-ID')
}

/* =========================
   MOUNTED
   ========================= */

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div>

    <!-- =========================
         HEADER
         ========================= -->

    <div class="header-row">
      <h2>Ganti Sparepart Fast Moving</h2>
    </div>

    <!-- =========================
         SEARCH
         ========================= -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nomor kendaraan, sparepart, atau username..."
    />

    <!-- =========================
         LOADING
         ========================= -->

    <p v-if="loading">
      Loading...
    </p>

    <!-- =========================
         ERROR
         ========================= -->

    <p
      v-else-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>

    <!-- =========================
         EMPTY
         ========================= -->

    <EmptyState
      v-else-if="filteredData.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data ganti sparepart'
      "
      :subtext="
        searchQuery
          ? 'Coba kata kunci lain'
          : ''
      "
    />

    <!-- =========================
         TABLE
         ========================= -->

    <div
      v-else
      class="table-wrapper"
    >

      <table>

        <thead>
          <tr>
            <th>ID</th>
            <th>Nomor Kendaraan</th>
            <th>Sparepart</th>
            <th>Biaya</th>
            <th>Rencana Tanggal</th>
            <th>Foto</th>
            <th>Status</th>
            <th>Keterangan</th>
            <th>Dicatat Oleh</th>

            <th v-if="canManage">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="item in filteredData"
            :key="item.id"
            :class="{
              'row-deadline-danger':
                getStatusTanggal(
                  item.tanggal,
                  item.status
                ).class === 'deadline-danger',

              'row-deadline-warning':
                getStatusTanggal(
                  item.tanggal,
                  item.status
                ).class === 'deadline-warning'
            }"
          >

            <!-- ID -->
            <td>
              {{ item.id }}
            </td>

            <!-- NOMOR KENDARAAN -->
            <td>
              <strong>
                {{ item.nomorKendaraan || '-' }}
              </strong>
            </td>

            <!-- SPAREPART -->
            <td>
              {{ item.sparepart || '-' }}
            </td>

            <!-- BIAYA -->
            <td>
              {{ formatRupiah(item.biaya) }}
            </td>

            <!-- TANGGAL -->
            <td>

              <div
                :class="[
                  'tanggal-service',
                  getStatusTanggal(
                    item.tanggal,
                    item.status
                  ).class
                ]"
              >

                <strong>
                  {{ item.tanggal || '-' }}
                </strong>

                <span
                  v-if="
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).text
                  "
                  class="deadline-label"
                  :class="
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).class
                  "
                >
                  {{
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).text
                  }}
                </span>

              </div>

            </td>

            <!-- FOTO -->
            <td>

              <button
                v-if="item.photoBase64Json"
                class="foto-button"
                @click="bukaFoto(item.photoBase64Json)"
                title="Lihat foto"
              >

                <img
                  :src="item.photoBase64Json"
                  class="foto-thumbnail"
                  alt="Foto bukti sparepart"
                />

              </button>

              <span
                v-else
                class="no-photo"
              >
                -
              </span>

            </td>

            <!-- STATUS -->
            <td>

              <span
                class="status-badge"
                :style="getStatusStyle(item.status)"
              >
                {{ item.status || 'Open' }}
              </span>

            </td>

            <!-- KETERANGAN -->
            <td class="keterangan-cell">
              {{ item.keterangan || '-' }}
            </td>

            <!-- USERNAME -->
            <td>
              {{ item.username || '-' }}
            </td>

            <!-- AKSI -->
            <td
              v-if="canManage"
              class="action-cell"
            >

              <div class="action-buttons">

                <!-- EDIT -->
                <button
                  class="btn-edit"
                  @click="editData(item.id)"
                >
                  Edit
                </button>

                <!-- HAPUS -->
                <button
                  class="btn-delete"
                  @click="mintaHapus(item.id)"
                  title="Hapus"
                  aria-label="Hapus"
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

                    <polyline
                      points="3 6 5 6 21 6"
                    ></polyline>

                    <path
                      d="M19 6l-1 14H6L5 6"
                    ></path>

                    <path
                      d="M10 11v6"
                    ></path>

                    <path
                      d="M14 11v6"
                    ></path>

                    <path
                      d="M9 6V4h6v2"
                    ></path>

                  </svg>

                </button>

              </div>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- =========================
         CONFIRM DELETE
         ========================= -->

    <ConfirmModal
      :show="showConfirm"
      title="Hapus Data"
      message="Data yang dihapus tidak bisa dikembalikan. Yakin mau lanjut?"
      confirm-text="Ya, Hapus"
      danger
      @confirm="konfirmasiHapus"
      @cancel="batalHapus"
    />

    <!-- =========================
         MODAL FOTO
         ========================= -->

    <div
      v-if="showFotoModal"
      class="foto-modal"
      @click.self="tutupFoto"
    >

      <div class="foto-modal-content">

        <button
          class="btn-close-foto"
          @click="tutupFoto"
          title="Tutup"
        >
          ×
        </button>

        <img
          :src="fotoDipilih"
          class="foto-full"
          alt="Foto bukti sparepart"
        />

      </div>

    </div>

  </div>
</template>

<style scoped>

/* =========================
   HEADER
   ========================= */

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

/* =========================
   ERROR
   ========================= */

.error-text {
  color: #e74c3c;

  background: #fdecea;

  padding: 10px 14px;

  border-radius: 8px;

  font-size: 14px;
}

/* =========================
   TABLE
   ========================= */

.table-wrapper {
  width: 100%;
  overflow: hidden;
}

table {
  width: 100%;

  table-layout: fixed;

  border-collapse: collapse;

  background: white;

  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 2px 12px rgba(58, 141, 222, 0.08);
}

/* =========================
   LEBAR KOLOM
   ========================= */

th:nth-child(1) {
  width: 4%;
}

th:nth-child(2) {
  width: 10%;
}

th:nth-child(3) {
  width: 11%;
}

th:nth-child(4) {
  width: 9%;
}

th:nth-child(5) {
  width: 13%;
}

th:nth-child(6) {
  width: 8%;
}

th:nth-child(7) {
  width: 10%;
}

th:nth-child(8) {
  width: 13%;
}

th:nth-child(9) {
  width: 9%;
}

th:nth-child(10) {
  width: 9%;
}

/* =========================
   HEADER TABLE
   ========================= */

th {
  background-color: #eaf4ff;

  color: #2b7cd3;

  padding: 12px 10px;

  text-align: left;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.02em;

  word-break: break-word;
}

/* =========================
   DATA TABLE
   ========================= */

td {
  padding: 12px 10px;

  border-top: 1px solid #eef4fa;

  font-size: 13px;

  color: #384454;

  vertical-align: middle;

  word-break: break-word;

  overflow-wrap: anywhere;
}

/* =========================
   HOVER NORMAL
   ========================= */

tbody tr:hover td {
  background-color: #f7fbff;
}

/* =========================
   BARIS DEADLINE MERAH
   ========================= */

tbody tr.row-deadline-danger td {
  background-color: #fff5f4;
}

/* =========================
   HOVER BARIS MERAH
   ========================= */

tbody tr.row-deadline-danger:hover td {
  background-color: #fff0ee;
}

/* =========================
   BARIS DEADLINE ORANGE
   ========================= */

tbody tr.row-deadline-warning td {
  background-color: #fffaf0;
}

/* =========================
   HOVER BARIS ORANGE
   ========================= */

tbody tr.row-deadline-warning:hover td {
  background-color: #fff8e8;
}

/* =========================
   TANGGAL
   ========================= */

.tanggal-service {
  display: flex;

  align-items: center;

  gap: 6px;

  flex-wrap: wrap;

  font-weight: 600;

  color: #384454;

  transition: all 0.2s ease;
}

.tanggal-service strong {
  font-size: 13px;

  white-space: nowrap;
}

/* =========================
   TANGGAL MERAH
   HARI INI / H-1 / H-2 / H-3
   TERLAMBAT
   ========================= */

.tanggal-service.deadline-danger {
  color: #e74c3c;

  font-weight: 700;
}

/* =========================
   HOVER TANGGAL MERAH
   ========================= */

tr.row-deadline-danger:hover .tanggal-service {
  color: #d63031;
}

/* =========================
   TANGGAL ORANGE
   H-4 / H-5
   ========================= */

.tanggal-service.deadline-warning {
  color: #d68a00;

  font-weight: 700;
}

/* =========================
   HOVER TANGGAL ORANGE
   ========================= */

tr.row-deadline-warning:hover .tanggal-service {
  color: #c77d00;
}

/* =========================
   DEADLINE LABEL
   ========================= */

.deadline-label {
  display: inline-block;

  width: fit-content;

  padding: 3px 7px;

  border-radius: 8px;

  font-size: 10px;

  font-weight: 700;

  white-space: nowrap;
}

/* =========================
   LABEL MERAH
   ========================= */

.deadline-label.deadline-danger {
  background-color: #fdecea;

  color: #e74c3c;
}

/* =========================
   LABEL ORANGE
   ========================= */

.deadline-label.deadline-warning {
  background-color: #fff3cd;

  color: #d68910;
}

/* =========================
   FOTO
   ========================= */

.foto-button {
  padding: 0;

  border: none;

  background: transparent;

  cursor: pointer;

  display: block;
}

.foto-thumbnail {
  width: 55px;

  height: 55px;

  object-fit: cover;

  border-radius: 8px;

  border: 1px solid #e3edf7;

  display: block;

  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.foto-thumbnail:hover {
  transform: scale(1.08);

  box-shadow:
    0 4px 12px rgba(43, 124, 211, 0.2);
}

.no-photo {
  color: #a0aec0;
}

/* =========================
   KETERANGAN
   ========================= */

.keterangan-cell {
  max-width: 200px;

  white-space: normal;

  word-break: break-word;

  line-height: 1.4;
}

/* =========================
   STATUS
   ========================= */

.status-badge {
  display: inline-block;

  padding: 4px 9px;

  border-radius: 10px;

  font-size: 11px;

  font-weight: 600;

  white-space: nowrap;
}

/* =========================
   AKSI
   ========================= */

.action-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;

  align-items: center;

  gap: 6px;

  white-space: nowrap;
}

/* =========================
   EDIT
   ========================= */

.btn-edit {
  background-color: #e0f0ff;

  color: #2b7cd3;

  border: none;

  padding: 6px 11px;

  border-radius: 6px;

  cursor: pointer;

  font-size: 12px;

  font-weight: 600;
}

.btn-edit:hover {
  background-color: #cce4fb;
}

/* =========================
   DELETE
   ========================= */

.btn-delete {
  width: 31px;

  height: 31px;

  display: flex;

  align-items: center;

  justify-content: center;

  background-color: #fdecea;

  color: #e74c3c;

  border: none;

  border-radius: 6px;

  cursor: pointer;

  padding: 0;

  transition:
    background-color 0.2s,
    transform 0.1s;
}

.btn-delete:hover {
  background-color: #fad9d6;
}

.btn-delete:active {
  transform: scale(0.95);
}

.btn-delete svg {
  width: 15px;

  height: 15px;
}

/* =========================
   MODAL FOTO
   ========================= */

.foto-modal {
  position: fixed;

  inset: 0;

  z-index: 9999;

  background-color: rgba(0, 0, 0, 0.65);

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 30px;
}

.foto-modal-content {
  position: relative;

  background: white;

  padding: 12px;

  border-radius: 14px;

  max-width: 90vw;

  max-height: 90vh;

  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3);
}

.foto-full {
  display: block;

  max-width: 85vw;

  max-height: 82vh;

  width: auto;

  height: auto;

  object-fit: contain;

  border-radius: 8px;
}

/* =========================
   CLOSE FOTO
   ========================= */

.btn-close-foto {
  position: absolute;

  top: -14px;

  right: -14px;

  width: 34px;

  height: 34px;

  border: none;

  border-radius: 50%;

  background-color: white;

  color: #4a5568;

  font-size: 24px;

  line-height: 1;

  cursor: pointer;

  box-shadow:
    0 3px 10px rgba(0, 0, 0, 0.2);

  z-index: 2;
}

.btn-close-foto:hover {
  background-color: #fdecea;

  color: #e74c3c;
}

/* =========================
   RESPONSIVE
   ========================= */

@media (max-width: 1200px) {

  th,
  td {
    padding: 10px 7px;
  }

  th {
    font-size: 10px;
  }

  td {
    font-size: 12px;
  }

  .btn-edit {
    padding: 5px 8px;

    font-size: 11px;
  }

  .btn-delete {
    width: 29px;

    height: 29px;
  }

  .foto-thumbnail {
    width: 48px;

    height: 48px;
  }

}

</style>