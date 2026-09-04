<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

/* =========================
   DATA
   ========================= */

const daftarData = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

/* =========================
   STATUS
   ========================= */

const daftarStatus = [
  'Open',
  'On Progress',
  'Close',
  'Cancel'
]

/* =========================
   USER
   ========================= */

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData)
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
   SEARCH
   ========================= */

const filteredData = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return daftarData.value
  }

  return daftarData.value.filter(item =>
    item.nomorKendaraan?.toLowerCase().includes(query) ||
    item.sparepart?.toLowerCase().includes(query) ||
    item.username?.toLowerCase().includes(query) ||
    item.keterangan?.toLowerCase().includes(query) ||
    item.status?.toLowerCase().includes(query)
  )
})

/* =========================
   AMBIL DATA
   ========================= */

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/ganti-sparepart')

    daftarData.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {
    errorMsg.value =
      'Gagal ambil data: ' +
      (
        error.response?.data?.error ||
        error.message
      )

  } finally {
    loading.value = false
  }
}

/* =========================
   UBAH STATUS
   ========================= */

const ubahStatus = async (item, statusBaru) => {
  const statusLama = item.status || 'Open'

  if (statusBaru === statusLama) {
    return
  }

  try {
    await api.put(
      `/ganti-sparepart/${item.id}`,
      {
        nomorKendaraan: item.nomorKendaraan,
        sparepart: item.sparepart,
        biaya: item.biaya,
        tanggal: item.tanggal,
        photoBase64Json: item.photoBase64Json,
        status: statusBaru,
        keterangan: item.keterangan,
        username: item.username
      }
    )

    item.status = statusBaru

    showToast(
      `Status berhasil diubah menjadi ${statusBaru}`
    )

  } catch (error) {
    errorMsg.value =
      'Gagal mengubah status: ' +
      (
        error.response?.data?.error ||
        error.message
      )

    /*
     * Kembalikan select ke status sebelumnya
     */
    item.status = statusLama
  }
}

/* =========================
   STATUS STYLE
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

  return styles[status] || {
    backgroundColor: '#f1f5f9',
    color: '#64748b'
  }
}

/* =========================
   TRIGGER TANGGAL
   ========================= */

const getStatusTanggal = (tanggal, status) => {

  /*
   * Kalau sudah Close,
   * tidak ada trigger deadline.
   */
  if (status === 'Close') {
    return {
      class: '',
      text: ''
    }
  }

  /*
   * Kalau tidak ada tanggal
   */
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

  /*
   * TERLAMBAT
   */
  if (selisihHari < 0) {
    return {
      class: 'deadline-danger',
      text: `Terlambat ${Math.abs(selisihHari)} hari`
    }
  }

  /*
   * HARI INI
   */
  if (selisihHari === 0) {
    return {
      class: 'deadline-danger',
      text: 'Hari ini'
    }
  }

  /*
   * H-1 sampai H-3
   */
  if (selisihHari <= 3) {
    return {
      class: 'deadline-danger',
      text: `H-${selisihHari}`
    }
  }

  /*
   * H-4 sampai H-5
   */
  if (selisihHari <= 5) {
    return {
      class: 'deadline-warning',
      text: `H-${selisihHari}`
    }
  }

  /*
   * Masih jauh
   */
  return {
    class: '',
    text: `H-${selisihHari}`
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

  return 'Rp ' +
    Number(angka).toLocaleString('id-ID')
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

      <div>

        <h2>
          Ganti Sparepart Fast Moving
        </h2>

        <p class="subtitle">
          Monitoring penggantian sparepart kendaraan
        </p>

      </div>

    </div>


    <!-- =========================
         SEARCH
         ========================= -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nomor kendaraan, sparepart, username, atau status..."
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
          : 'Belum ada data ganti sparepart'
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

            <th>
              Nomor
              <br>
              Kendaraan
            </th>

            <th>
              Sparepart
            </th>

            <th>
              Biaya
            </th>

            <th>
              Rencana
              <br>
              Tanggal
            </th>

            <th>
              Foto
            </th>

            <th>
              Status
            </th>

            <th>
              Keterangan
            </th>

            <th>
              Dicatat
              <br>
              Oleh
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
                @click="
                  bukaFoto(
                    item.photoBase64Json
                  )
                "
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

            <td class="status-cell">

              <!-- ADMIN / UID -->

              <select
                v-if="canManage"
                :value="item.status || 'Open'"
                class="status-select"
                :style="
                  getStatusStyle(
                    item.status || 'Open'
                  )
                "
                @change="
                  ubahStatus(
                    item,
                    $event.target.value
                  )
                "
              >

                <option
                  v-for="status in daftarStatus"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>

              </select>


              <!-- DRIVER -->

              <span
                v-else
                class="status-badge"
                :style="
                  getStatusStyle(
                    item.status || 'Open'
                  )
                "
              >
                {{ item.status || 'Open' }}
              </span>

            </td>


            <!-- KETERANGAN -->

            <td class="keterangan-cell">
              {{ item.keterangan || '-' }}
            </td>


            <!-- DICATAT OLEH -->

            <td>
              {{ item.username || '-' }}
            </td>

          </tr>

        </tbody>

      </table>

    </div>


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
}

h2 {
  color: #2b7cd3;

  font-size: 22px;

  margin: 0;
}

.subtitle {
  margin: 4px 0 0;

  color: #718096;

  font-size: 13px;
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
   TABLE WRAPPER
   ========================= */

.table-wrapper {
  width: 100%;

  overflow-x: auto;

  overflow-y: hidden;

  border-radius: 12px;
}


/* =========================
   TABLE
   ========================= */

table {
  width: 100%;

  min-width: 900px;

  table-layout: fixed;

  border-collapse: collapse;

  background: white;

  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 2px 12px rgba(58, 141, 222, 0.08);
}


/* =========================
   BOX SIZING
   ========================= */

th,
td {
  box-sizing: border-box;
}


/* =========================
   LEBAR KOLOM
   ========================= */

th:nth-child(1),
td:nth-child(1) {
  width: 5%;
}

th:nth-child(2),
td:nth-child(2) {
  width: 12%;
}

th:nth-child(3),
td:nth-child(3) {
  width: 12%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 8%;
}

th:nth-child(5),
td:nth-child(5) {
  width: 13%;
}

th:nth-child(6),
td:nth-child(6) {
  width: 8%;
}

th:nth-child(7),
td:nth-child(7) {
  width: 12%;
}

th:nth-child(8),
td:nth-child(8) {
  width: 17%;
}

th:nth-child(9),
td:nth-child(9) {
  width: 13%;
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

  line-height: 1.25;
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

  line-height: 1.4;
}


/* =========================
   HOVER
   ========================= */

tbody tr:hover td {
  background-color: #f7fbff;
}


/* =========================
   DEADLINE MERAH
   ========================= */

tbody tr.row-deadline-danger td {
  background-color: #fff5f4;
}

tbody tr.row-deadline-danger:hover td {
  background-color: #fde2df;
}


/* =========================
   DEADLINE ORANGE
   ========================= */

tbody tr.row-deadline-warning td {
  background-color: #fffaf0;
}

tbody tr.row-deadline-warning:hover td {
  background-color: #fff0d2;
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
}

.tanggal-service strong {
  font-size: 13px;

  white-space: nowrap;
}

.tanggal-service.deadline-danger {
  color: #e74c3c;

  font-weight: 700;
}

.tanggal-service.deadline-warning {
  color: #d68a00;

  font-weight: 700;
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

.deadline-label.deadline-danger {
  background-color: #fdecea;

  color: #e74c3c;
}

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
  white-space: normal;

  word-break: break-word;

  overflow-wrap: anywhere;

  line-height: 1.4;
}


/* =========================
   STATUS CELL
   ========================= */

.status-cell {
  vertical-align: middle;

  overflow: hidden;
}


/* =========================
   STATUS BADGE
   ========================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  max-width: 100%;

  box-sizing: border-box;

  padding: 5px 9px;

  border-radius: 10px;

  font-size: 11px;

  font-weight: 600;

  white-space: nowrap;
}


/* =========================
   STATUS SELECT
   ========================= */

.status-select {
  display: block;

  width: 100%;

  max-width: 115px;

  min-width: 0;

  box-sizing: border-box;

  border: none;

  padding: 6px 24px 6px 9px;

  border-radius: 10px;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  outline: none;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

  appearance: auto;
}

.status-select:focus {
  box-shadow:
    0 0 0 2px rgba(43, 124, 211, 0.2);
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

  .foto-thumbnail {
    width: 48px;

    height: 48px;
  }

  .status-select {
    max-width: 105px;

    font-size: 10px;

    padding: 5px 20px 5px 8px;
  }

}

</style>