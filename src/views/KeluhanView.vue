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

/* =========================
   MODAL FOTO
   ========================= */

const showFoto = ref(false)
const fotoDipilih = ref('')

const lihatFoto = (foto) => {
  fotoDipilih.value = foto
  showFoto.value = true
}

const tutupFoto = () => {
  showFoto.value = false
  fotoDipilih.value = ''
}

/* =========================
   USER
   ========================= */

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const isDriver = computed(() => {
  return currentUser.value?.role === 'driver'
})

const canHandle = computed(() => {
  return ['admin', 'uid'].includes(currentUser.value?.role)
})

/* =========================
   SEARCH
   ========================= */

const filteredKeluhan = computed(() => {
  if (!searchQuery.value) {
    return daftarKeluhan.value
  }

  const q = searchQuery.value.toLowerCase()

  return daftarKeluhan.value.filter(kh =>
    kh.nomorKendaraan?.toLowerCase().includes(q) ||
    kh.pengaduan?.toLowerCase().includes(q) ||
    kh.username?.toLowerCase().includes(q)
  )
})

/* =========================
   AMBIL DATA
   ========================= */

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
    await api.delete(`/keluhan/${idToDelete.value}`)

    showToast('Keluhan berhasil dihapus!')

    await ambilData()
  } catch (error) {
    errorMsg.value =
      'Gagal hapus data: ' +
      (error.response?.data?.error || error.message)
  } finally {
    showConfirm.value = false
    idToDelete.value = null
  }
}

/* =========================
   ON MOUNTED
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
      <h2>Daftar Keluhan</h2>

      <button
        v-if="isDriver"
        @click="router.push('/keluhan/tambah')"
        class="btn-primary"
      >
        + Lapor Keluhan
      </button>
    </div>

    <!-- =========================
         SEARCH
         ========================= -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nomor kendaraan, pengaduan, atau username..."
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
      v-else-if="filteredKeluhan.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada keluhan'
      "
      :subtext="
        searchQuery
          ? 'Coba kata kunci lain'
          : 'Belum ada laporan keluhan masuk'
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
            <th>Pengaduan</th>
            <th>Foto</th>
            <th>Tanggal</th>
            <th>Dilapor Oleh</th>
            <th>Status</th>
            <th>Ditangani Oleh</th>
            <th v-if="canHandle">
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="kh in filteredKeluhan"
            :key="kh.id"
          >

            <!-- ID -->
            <td>
              {{ kh.id }}
            </td>

            <!-- NOMOR KENDARAAN -->
            <td>
              <strong>
                {{ kh.nomorKendaraan }}
              </strong>
            </td>

            <!-- PENGADUAN -->
            <td class="pengaduan-cell">
              {{ kh.pengaduan }}
            </td>

            <!-- FOTO -->
            <td>

              <div
                v-if="kh.photoBase64"
                class="photo-wrapper"
                @click="lihatFoto(kh.photoBase64)"
                title="Klik untuk melihat foto"
              >

                <img
                  :src="kh.photoBase64"
                  alt="Foto kerusakan"
                  class="keluhan-photo"
                />

                <div class="photo-overlay">
                  Lihat
                </div>

              </div>

              <span
                v-else
                class="no-photo"
              >
                -
              </span>

            </td>

            <!-- TANGGAL -->
            <td>
              {{ kh.tanggal }}
            </td>

            <!-- USERNAME -->
            <td>
              {{ kh.username }}
            </td>

            <!-- STATUS -->
            <td>

              <span
                class="status-badge"
                :class="{
                  'status-open': kh.status === 'Open',
                  'status-progress': kh.status === 'On Progress',
                  'status-close': kh.status === 'Close',
                  'status-cancel': kh.status === 'Cancel',
                  'status-pending': kh.status === 'pending',
                  'status-ditangani': kh.status === 'ditangani'
                }"
              >

                <span
                  v-if="kh.status !== 'Close'"
                  class="status-dot"
                ></span>

                {{ kh.status }}

              </span>

            </td>

            <!-- DITANGANI OLEH -->
            <td>
              {{ kh.ditanganiOleh || '-' }}
            </td>

            <!-- AKSI -->
            <td v-if="canHandle">

              <div class="action-buttons">

                <button
                  @click="
                    router.push(
                      `/keluhan/edit/${kh.id}`
                    )
                  "
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
      title="Hapus Keluhan"
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
      v-if="showFoto"
      class="foto-modal"
      @click.self="tutupFoto"
    >

      <div class="foto-modal-content">

        <button
          class="foto-close"
          @click="tutupFoto"
          title="Tutup"
          aria-label="Tutup foto"
        >
          ×
        </button>

        <img
          :src="fotoDipilih"
          alt="Foto kerusakan"
          class="foto-large"
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
   BUTTON PRIMARY
   ========================= */

.btn-primary {
  background-color: #4a9eeb;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #2b7cd3;
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
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow:
    0 2px 12px rgba(58, 141, 222, 0.08);
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
  white-space: nowrap;
}

td {
  padding: 14px 16px;
  border-top: 1px solid #eef4fa;
  font-size: 14px;
  color: #384454;
  vertical-align: middle;
}

/* Hover tabel tetap */

tr:hover td {
  background-color: #f7fbff;
}

/* =========================
   PENGADUAN
   ========================= */

.pengaduan-cell {
  max-width: 260px;
  line-height: 1.5;
}

/* =========================
   FOTO THUMBNAIL
   ========================= */

.photo-wrapper {
  position: relative;
  width: 65px;
  height: 65px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e3edf7;
  background-color: #f7fbff;
  cursor: pointer;
}

.keluhan-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s, opacity 0.2s;
}

.photo-wrapper:hover .keluhan-photo {
  transform: scale(1.05);
  opacity: 0.75;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(43, 124, 211, 0.65);
  color: white;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-wrapper:hover .photo-overlay {
  opacity: 1;
}

.no-photo {
  color: #a0aec0;
  font-size: 14px;
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
  white-space: nowrap;
}

/* Open */

.status-open {
  background-color: #e0f0ff;
  color: #2b7cd3;
}

.status-open .status-dot {
  background-color: #2b7cd3;
}

/* On Progress */

.status-progress {
  background-color: #fff4e0;
  color: #d68a00;
}

.status-progress .status-dot {
  background-color: #d68a00;
}

/* Close */

.status-close {
  background-color: #e3f9e5;
  color: #1e9e3a;
}

/* Cancel */

.status-cancel {
  background-color: #fdecea;
  color: #e74c3c;
}

.status-cancel .status-dot {
  background-color: #e74c3c;
}

/* Pending */

.status-pending {
  background-color: #e0f0ff;
  color: #2b7cd3;
}

.status-pending .status-dot {
  background-color: #2b7cd3;
}

/* Ditangani */

.status-ditangani {
  background-color: #fff4e0;
  color: #d68a00;
}

.status-ditangani .status-dot {
  background-color: #d68a00;
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
  transition: background-color 0.2s;
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
  display: block;
}

/* =========================
   MODAL FOTO
   ========================= */

.foto-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;

  background-color: rgba(0, 0, 0, 0.75);
}

.foto-modal-content {
  position: relative;

  max-width: 90vw;
  max-height: 90vh;

  padding: 10px;

  background-color: white;

  border-radius: 12px;

  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.3);
}

.foto-large {
  display: block;

  max-width: 85vw;
  max-height: 85vh;

  width: auto;
  height: auto;

  object-fit: contain;

  border-radius: 8px;
}

/* =========================
   CLOSE MODAL
   ========================= */

.foto-close {
  position: absolute;

  top: -14px;
  right: -14px;

  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 50%;

  background-color: white;
  color: #4a5568;

  font-size: 24px;
  line-height: 1;

  cursor: pointer;

  box-shadow:
    0 2px 10px rgba(0, 0, 0, 0.2);

  z-index: 2;

  transition:
    background-color 0.2s,
    color 0.2s;
}

.foto-close:hover {
  background-color: #fdecea;
  color: #e74c3c;
}

/* =========================
   RESPONSIVE
   ========================= */

@media (max-width: 1100px) {

  th,
  td {
    padding: 11px 12px;
  }

  th {
    font-size: 12px;
  }

  td {
    font-size: 13px;
  }

  .pengaduan-cell {
    max-width: 200px;
  }

  .photo-wrapper {
    width: 55px;
    height: 55px;
  }
}

</style>
```
