<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

const router = useRouter()

/* =========================
   DATA
========================= */

const daftarJadwal = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

/* =========================
   UPDATE STATUS
========================= */

const updatingId = ref(null)

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

const isAdmin = computed(() => {
  return role.value === 'admin'
})

const canManageStatus = computed(() => {
  return ['admin', 'uid'].includes(role.value)
})

/* =========================
   STATUS
========================= */

const daftarStatus = [
  'Open',
  'On Progress',
  'Close',
  'Cancel'
]

const getActualStatus = (status) => {
  return status || 'Open'
}

const getStatusStyle = (status) => {
  const actualStatus = getActualStatus(status)

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

  return styles[actualStatus] || {
    backgroundColor: '#f1f5f9',
    color: '#64748b'
  }
}

/* =========================
   SEARCH
========================= */

const filteredJadwal = computed(() => {
  const q = searchQuery.value
    .trim()
    .toLowerCase()

  if (!q) {
    return daftarJadwal.value
  }

  return daftarJadwal.value.filter((jadwal) => {

    const id =
      String(jadwal.id ?? '').toLowerCase()

    const nomorKendaraan =
      jadwal.nomorKendaraan?.toLowerCase() || ''

    const namaLengkap =
      jadwal.namaLengkap?.toLowerCase() || ''

    const username =
      jadwal.username?.toLowerCase() || ''

    const uid =
      jadwal.uid?.toLowerCase() || ''

    const up3 =
      jadwal.up3?.toLowerCase() || ''

    const unit =
      jadwal.unit?.toLowerCase() || ''

    const dealer =
      jadwal.dealer?.toLowerCase() || ''

    const km =
      String(jadwal.km ?? '').toLowerCase()

    const tanggalService =
      jadwal.tanggalService?.toLowerCase() || ''

    const tanggalTindakLanjut =
      jadwal.tanggalTindakLanjut
        ?.toString()
        .toLowerCase() || ''

    const keterangan =
      jadwal.keterangan?.toLowerCase() || ''

    const status =
      jadwal.status?.toLowerCase() || ''

    const tindakLanjut =
      jadwal.tindakLanjut?.toLowerCase() || ''

    return (
      id.includes(q) ||
      nomorKendaraan.includes(q) ||
      namaLengkap.includes(q) ||
      username.includes(q) ||
      uid.includes(q) ||
      up3.includes(q) ||
      unit.includes(q) ||
      dealer.includes(q) ||
      km.includes(q) ||
      tanggalService.includes(q) ||
      tanggalTindakLanjut.includes(q) ||
      keterangan.includes(q) ||
      status.includes(q) ||
      tindakLanjut.includes(q)
    )
  })
})

/* =========================
   FORMAT TANGGAL
========================= */

const formatTanggal = (tanggal) => {
  if (!tanggal) {
    return '-'
  }

  const date = new Date(tanggal)

  if (Number.isNaN(date.getTime())) {
    return tanggal
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/* =========================
   INDIKATOR DEADLINE
========================= */

const getDeadlineInfo = (tanggal, status) => {

  const actualStatus =
    getActualStatus(status)

  /*
   * Kalau sudah selesai atau dibatalkan,
   * tidak perlu indikator deadline.
   */
  if (
    actualStatus === 'Close' ||
    actualStatus === 'Cancel'
  ) {
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

  today.setHours(
    0,
    0,
    0,
    0
  )

  const tanggalService =
    new Date(tanggal)

  tanggalService.setHours(
    0,
    0,
    0,
    0
  )

  if (
    Number.isNaN(
      tanggalService.getTime()
    )
  ) {
    return {
      class: '',
      text: ''
    }
  }

  const selisihMs =
    today.getTime() -
    tanggalService.getTime()

  const selisihHari =
    Math.floor(
      selisihMs /
      (1000 * 60 * 60 * 24)
    )

  /* =========================
     HARI INI / BELUM LEWAT
  ========================= */

  if (selisihHari <= 0) {
    return {
      class: '',
      text: 'Hari ini'
    }
  }

  /* =========================
     1 - 3 HARI
  ========================= */

  if (selisihHari <= 3) {
    return {
      class: '',
      text: `${selisihHari} hari`
    }
  }

  /* =========================
     4 - 5 HARI
  ========================= */

  if (selisihHari <= 5) {
    return {
      class: 'deadline-warning',
      text: `${selisihHari} hari`
    }
  }

  /* =========================
     LEBIH DARI 5 HARI
  ========================= */

  return {
    class: 'deadline-danger',
    text: `Terlambat ${selisihHari - 5} hari`
  }
}

/* =========================
   UPDATE STATUS
========================= */

const updateStatus = async (
  jadwal,
  statusBaru
) => {

  if (!canManageStatus.value) {
    return
  }

  const statusLama =
    getActualStatus(
      jadwal.status
    )

  if (statusBaru === statusLama) {
    return
  }

  updatingId.value =
    jadwal.id

  errorMsg.value = ''

  try {

    const response =
      await api.put(
        `/jadwal-service/${jadwal.id}`,
        {
          status: statusBaru
        }
      )

    jadwal.status =
      response.data?.status ||
      statusBaru

  } catch (error) {

    console.error(
      'Error update status jadwal:',
      error
    )

    jadwal.status =
      statusLama

    errorMsg.value =
      'Gagal memperbarui status jadwal service: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

  } finally {

    updatingId.value = null
  }
}

/* =========================
   DETAIL / TINDAK LANJUT
========================= */

const lihatDetail = (id) => {

  router.push(
    `/jadwal-service/edit/${id}`
  )
}

/* =========================
   AMBIL DATA
========================= */

const ambilData = async () => {

  loading.value = true
  errorMsg.value = ''

  try {

    const response =
      await api.get(
        '/jadwal-service'
      )

    console.log(
      'DATA JADWAL SERVICE:',
      response.data
    )

    daftarJadwal.value =
      Array.isArray(response.data)
        ? response.data
        : []

  } catch (error) {

    console.error(
      'Error ambil jadwal service:',
      error
    )

    errorMsg.value =
      'Gagal mengambil data jadwal service: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

  } finally {

    loading.value = false
  }
}

/* =========================
   INIT
========================= */

onMounted(() => {
  ambilData()
})
</script>


<template>

  <div class="jadwal-page">

    <!-- =========================
         HEADER
    ========================= -->

    <div class="header-row">

      <div>

        <h2>
          Jadwal Service
        </h2>

        <p class="subtitle">
          Daftar jadwal service kendaraan
        </p>

      </div>

    </div>


    <!-- =========================
         SEARCH
    ========================= -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari kendaraan, nama driver, UID, dealer..."
    />


    <!-- =========================
         LOADING
    ========================= -->

    <p
      v-if="loading"
      class="loading-text"
    >
      Loading data jadwal service...
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
      v-else-if="
        filteredJadwal.length === 0
      "
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data jadwal service'
      "
      :subtext="
        searchQuery
          ? 'Coba gunakan kata kunci lain'
          : 'Belum ada jadwal service yang tersedia'
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

        <colgroup>

          <col class="col-id">

          <col class="col-kendaraan">

          <col class="col-nama">

          <col class="col-daerah">

          <col class="col-dealer">

          <col class="col-km">

          <col class="col-tanggal">

          <col class="col-tanggal-tindak-lanjut">

          <col class="col-keterangan">

          <col class="col-status">

          <col class="col-tindak-lanjut">

        </colgroup>


        <thead>

          <tr>

            <th>
              ID
            </th>

            <th>
              No. Kendaraan
            </th>

            <th>
              Nama Driver
            </th>

            <th>
              UID / Daerah
            </th>

            <th>
              Dealer
            </th>

            <th>
              KM
            </th>

            <th>
              Tanggal Service
            </th>

            <th class="tanggal-tindak-lanjut">
              Tanggal<br>
              Tindak Lanjut
            </th>

            <th>
              Keterangan
            </th>

            <th>
              Status
            </th>

            <th>
              Tindak Lanjut
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="jadwal in filteredJadwal"
            :key="jadwal.id"

            :class="{

              'row-deadline-danger':
                getDeadlineInfo(
                  jadwal.tanggalService,
                  jadwal.status
                ).class ===
                'deadline-danger',

              'row-deadline-warning':
                getDeadlineInfo(
                  jadwal.tanggalService,
                  jadwal.status
                ).class ===
                'deadline-warning'

            }"
          >

            <!-- =========================
                 ID
            ========================= -->

            <td>
              {{ jadwal.id ?? '-' }}
            </td>


            <!-- =========================
                 NOMOR KENDARAAN
            ========================= -->

            <td>

              <strong>
                {{
                  jadwal.nomorKendaraan ||
                  '-'
                }}
              </strong>

            </td>


            <!-- =========================
                 NAMA DRIVER
            ========================= -->

            <td>

              {{
                jadwal.namaLengkap ||
                jadwal.username ||
                '-'
              }}

            </td>


            <!-- =========================
                 UID / DAERAH
            ========================= -->

            <td>

              <div class="daerah-info">

                <span class="uid">
                  {{ jadwal.uid || '-' }}
                </span>

                <span
                  v-if="jadwal.up3"
                  class="up3"
                >
                  {{ jadwal.up3 }}
                </span>

              </div>

            </td>


            <!-- =========================
                 DEALER
            ========================= -->

            <td>
              {{ jadwal.dealer || '-' }}
            </td>


            <!-- =========================
                 KM
            ========================= -->

            <td>
              {{ jadwal.km ?? '-' }}
            </td>


            <!-- =========================
                 TANGGAL SERVICE
            ========================= -->

            <td class="tanggal-cell">

              <div
                :class="[

                  'tanggal-wrapper',

                  getDeadlineInfo(
                    jadwal.tanggalService,
                    jadwal.status
                  ).class

                ]"
              >

                <strong>

                  {{
                    formatTanggal(
                      jadwal.tanggalService
                    )
                  }}

                </strong>


                <span
                  v-if="
                    getDeadlineInfo(
                      jadwal.tanggalService,
                      jadwal.status
                    ).text
                  "

                  class="deadline-label"

                  :class="
                    getDeadlineInfo(
                      jadwal.tanggalService,
                      jadwal.status
                    ).class
                  "
                >

                  {{
                    getDeadlineInfo(
                      jadwal.tanggalService,
                      jadwal.status
                    ).text
                  }}

                </span>

              </div>

            </td>


            <!-- =========================
                 TANGGAL TINDAK LANJUT
            ========================= -->

            <td class="tanggal-tindak-lanjut-cell">

              <span
                v-if="jadwal.tanggalTindakLanjut"
                class="tanggal-tindak-lanjut-value"
              >

                {{
                  formatTanggal(
                    jadwal.tanggalTindakLanjut
                  )
                }}

              </span>

              <span
                v-else
                class="no-tanggal-tindak-lanjut"
              >

                Belum ada

              </span>

            </td>


            <!-- =========================
                 KETERANGAN
            ========================= -->

            <td class="keterangan-cell">

              {{
                jadwal.keterangan ||
                '-'
              }}

            </td>


            <!-- =========================
                 STATUS
            ========================= -->

            <td class="status-cell">

              <!-- ADMIN / UID -->

              <select
                v-if="canManageStatus"

                class="status-select"

                :value="
                  getActualStatus(
                    jadwal.status
                  )
                "

                :disabled="
                  updatingId ===
                  jadwal.id
                "

                @change="
                  updateStatus(
                    jadwal,
                    $event.target.value
                  )
                "

                :style="
                  getStatusStyle(
                    jadwal.status
                  )
                "
              >

                <option
                  v-for="
                    status in daftarStatus
                  "
                  :key="status"
                  :value="status"
                >

                  {{ status }}

                </option>

              </select>


              <!-- ROLE LAIN -->

              <span
                v-else

                class="status-badge"

                :style="
                  getStatusStyle(
                    jadwal.status
                  )
                "
              >

                <span
                  class="status-dot"
                ></span>

                {{
                  getActualStatus(
                    jadwal.status
                  )
                }}

              </span>

            </td>


            <!-- =========================
                 TINDAK LANJUT
            ========================= -->

            <td class="tindak-lanjut-cell">

              <!-- BELUM ADA -->

              <template
                v-if="
                  !jadwal.tindakLanjut ||
                  !jadwal.tindakLanjut.trim()
                "
              >

                <!-- ADMIN -->

                <button
                  v-if="isAdmin"

                  type="button"

                  class="btn-detail"

                  @click="
                    lihatDetail(
                      jadwal.id
                    )
                  "
                >

                  Detail

                </button>


                <!-- UID -->

                <span
                  v-else
                  class="no-tindak-lanjut"
                >

                  Belum ada

                </span>

              </template>


              <!-- SUDAH ADA -->

              <template v-else>

                <div
                  class="tindak-lanjut-wrapper"
                >

                  <span
                    class="tindak-lanjut-text"
                  >

                    {{ jadwal.tindakLanjut }}

                  </span>


                  <!-- PENSIL ADMIN -->

                  <button
                    v-if="isAdmin"

                    type="button"

                    class="btn-edit-tindak"

                    title="Edit tindak lanjut"

                    @click="
                      lihatDetail(
                        jadwal.id
                      )
                    "
                  >

                    <span
                      class="edit-icon"
                    >
                      ✎
                    </span>

                  </button>

                </div>

              </template>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </div>

</template>


<style scoped>

/* =========================
   PAGE
========================= */

.jadwal-page {
  width: 100%;
  max-width: 100%;
}


/* =========================
   HEADER
========================= */

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.subtitle {
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 14px;
}


/* =========================
   LOADING
========================= */

.loading-text {
  text-align: center;
  color: #6b7280;
  padding: 30px;
}


/* =========================
   ERROR
========================= */

.error-text {
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
}


/* =========================
   TABLE WRAPPER
========================= */

.table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 15px;
  border-radius: 10px;
}


/* =========================
   TABLE
========================= */

table {
  width: max-content;
  min-width: 1350px;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}


/* =========================
   COLUMN WIDTH
========================= */

.col-id {
  width: 55px;
}

.col-kendaraan {
  width: 130px;
}

.col-nama {
  width: 170px;
}

.col-daerah {
  width: 130px;
}

.col-dealer {
  width: 120px;
}

.col-km {
  width: 80px;
}

.col-tanggal {
  width: 140px;
}

.col-tanggal-tindak-lanjut {
  width: 145px;
}

.col-keterangan {
  width: 190px;
}

.col-status {
  width: 135px;
}

.col-tindak-lanjut {
  width: 260px;
}


/* =========================
   HEADER
========================= */

th {
  padding: 12px 10px;

  background: #eaf4ff;

  color: #2b7cd3;

  border-bottom:
    1px solid #dbeafe;

  text-align: left;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.02em;

  word-break: break-word;

  overflow-wrap: anywhere;

  white-space: nowrap;
}

th.tanggal-tindak-lanjut {
  white-space: normal;
  line-height: 1.25;
  min-width: 120px;
}


/* =========================
   BODY
========================= */

td {
  padding: 12px 10px;

  border-bottom:
    1px solid #e5e7eb;

  text-align: left;

  vertical-align: middle;

  font-size: 13px;

  color: #4b5563;

  word-break: break-word;

  overflow-wrap: anywhere;

  box-sizing: border-box;
}

tbody tr:hover td {
  background: #f9fbfd;
}


/* =========================
   DEADLINE ROW
========================= */

tbody tr.row-deadline-danger td {
  background-color: #fff5f4;
}

tbody tr.row-deadline-danger:hover td {
  background-color: #fde2df;
}

tbody tr.row-deadline-warning td {
  background-color: #fffaf0;
}

tbody tr.row-deadline-warning:hover td {
  background-color: #fff0d2;
}


/* =========================
   DAERAH
========================= */

.daerah-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.uid {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  overflow-wrap: anywhere;
}

.up3 {
  font-size: 10px;
  color: #6b7280;
  overflow-wrap: anywhere;
}


/* =========================
   KETERANGAN
========================= */

.keterangan-cell {
  line-height: 1.45;
  white-space: normal;
}


/* =========================
   TANGGAL SERVICE
========================= */

.tanggal-cell {
  vertical-align: middle;
}

.tanggal-wrapper {
  display: flex;

  flex-direction: column;

  align-items: flex-start;

  gap: 5px;

  min-width: 0;
}

.tanggal-wrapper strong {
  font-size: 13px;
  white-space: nowrap;
}


/* =========================
   TANGGAL TINDAK LANJUT
========================= */

.tanggal-tindak-lanjut-cell {
  vertical-align: middle;
  min-width: 145px;
}

.tanggal-tindak-lanjut-value {
  display: inline-block;

  font-size: 13px;

  font-weight: 500;

  color: #475569;

  white-space: nowrap;
}

.no-tanggal-tindak-lanjut {
  color: #9ca3af;

  font-size: 12px;

  font-style: italic;

  white-space: nowrap;
}


/* =========================
   DEADLINE LABEL
========================= */

.deadline-label {
  display: inline-block;

  max-width: 100%;

  padding: 3px 7px;

  border-radius: 8px;

  font-size: 10px;

  font-weight: 700;

  white-space: nowrap;
}


/* NORMAL */

.tanggal-wrapper:not(
  .deadline-warning
):not(
  .deadline-danger
) {
  color: #384454;
}


/* WARNING */

.tanggal-wrapper.deadline-warning {
  color: #d68a00;
}

.deadline-label.deadline-warning {
  background-color: #fff3cd;
  color: #d68910;
}


/* DANGER */

.tanggal-wrapper.deadline-danger {
  color: #e74c3c;
}

.deadline-label.deadline-danger {
  background-color: #fdecea;
  color: #e74c3c;
}


/* =========================
   STATUS
========================= */

.status-cell {
  padding-left: 8px;
  padding-right: 8px;
}


/* =========================
   STATUS BADGE
========================= */

.status-badge {
  display: flex;

  align-items: center;

  justify-content: center;

  gap: 6px;

  width: 100%;

  max-width: 135px;

  box-sizing: border-box;

  padding: 6px 10px;

  border-radius: 18px;

  font-size: 11px;

  font-weight: 600;

  white-space: nowrap;
}

.status-dot {
  width: 6px;

  height: 6px;

  flex-shrink: 0;

  border-radius: 50%;

  background: currentColor;
}


/* =========================
   STATUS SELECT
========================= */

.status-select {
  display: block;

  width: 135px;

  box-sizing: border-box;

  padding: 6px 22px 6px 9px;

  border: 1px solid currentColor;

  border-radius: 18px;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  outline: none;

  appearance: auto;
}

.status-select:focus {
  box-shadow:
    0 0 0 2px
    rgba(43, 124, 211, 0.15);
}

.status-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


/* =========================
   TINDAK LANJUT
========================= */

.tindak-lanjut-cell {
  vertical-align: middle;
  min-width: 260px;
}

.tindak-lanjut-wrapper {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  min-width: 0;
}

.tindak-lanjut-text {
  flex: 1;

  min-width: 0;

  color: #475569;

  font-size: 14px;

  line-height: 1.5;

  overflow-wrap: anywhere;

  word-break: break-word;
}

.no-tindak-lanjut {
  color: #9ca3af;

  font-size: 12px;

  font-style: italic;
}


/* =========================
   DETAIL BUTTON
========================= */

.btn-detail {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 7px 12px;

  border: none;

  border-radius: 7px;

  background: #eaf3ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  transition:
    background 0.2s,
    transform 0.1s;
}

.btn-detail:hover {
  background: #dbeafe;

  color: #1d4ed8;
}

.btn-detail:active {
  transform: scale(0.97);
}


/* =========================
   EDIT ICON
========================= */

.btn-edit-tindak {
  flex-shrink: 0;

  width: 28px;

  height: 28px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 0;

  border:
    1px solid #bfdbfe;

  border-radius: 7px;

  background: #eff6ff;

  color: #2563eb;

  cursor: pointer;

  transition:
    background 0.2s,
    border-color 0.2s,
    transform 0.1s;
}

.btn-edit-tindak:hover {
  background: #dbeafe;

  border-color: #93c5fd;

  color: #1d4ed8;
}

.btn-edit-tindak:active {
  transform: scale(0.94);
}

.edit-icon {
  font-size: 16px;

  line-height: 1;

  font-weight: 700;
}


/* =========================
   TABLET
========================= */

@media (max-width: 1100px) {

  th,
  td {
    padding: 9px 7px;
  }

  th {
    font-size: 10px;
  }

  td {
    font-size: 12px;
  }

  .status-select,
  .status-badge {
    font-size: 10px;
  }

  .uid {
    font-size: 11px;
  }

  .up3 {
    font-size: 9px;
  }

  .tanggal-wrapper strong {
    font-size: 12px;
  }

  .tanggal-tindak-lanjut-value {
    font-size: 12px;
  }

  .no-tanggal-tindak-lanjut {
    font-size: 11px;
  }

  .deadline-label {
    font-size: 9px;
    padding: 3px 6px;
  }

  .tindak-lanjut-text {
    font-size: 13px;
  }

  .btn-detail {
    font-size: 10px;
    padding: 6px 9px;
  }

  .btn-edit-tindak {
    width: 26px;
    height: 26px;
  }

}


/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

  .header-row {
    align-items: flex-start;
  }

  h2 {
    font-size: 20px;
  }

  .subtitle {
    font-size: 12px;
  }

  th,
  td {
    padding: 8px 5px;
  }

  th {
    font-size: 9px;
  }

  td {
    font-size: 11px;
  }

  .status-select {
    padding: 5px 6px;
    font-size: 9px;
  }

  .status-badge {
    padding: 5px 8px;
    font-size: 9px;
  }

  .status-dot {
    display: none;
  }

  .tanggal-wrapper strong {
    font-size: 11px;
  }

  .tanggal-tindak-lanjut-value {
    font-size: 11px;
  }

  .no-tanggal-tindak-lanjut {
    font-size: 10px;
  }

  .deadline-label {
    font-size: 9px;
    padding: 2px 5px;
  }

  .tindak-lanjut-text {
    font-size: 12px;
  }

  .no-tindak-lanjut {
    font-size: 9px;
  }

  .btn-detail {
    font-size: 9px;
    padding: 5px 8px;
  }

  .btn-edit-tindak {
    width: 24px;
    height: 24px;
  }

  .edit-icon {
    font-size: 14px;
  }

}


/* =========================
   VERY SMALL
========================= */

@media (max-width: 500px) {

  th,
  td {
    padding: 7px 4px;
  }

  .status-select {
    padding: 4px 5px;
    font-size: 8px;
  }

  .status-badge {
    padding: 4px 6px;
    font-size: 8px;
  }

  .tanggal-wrapper strong {
    font-size: 10px;
  }

  .tanggal-tindak-lanjut-value {
    font-size: 10px;
  }

  .no-tanggal-tindak-lanjut {
    font-size: 9px;
  }

  .deadline-label {
    font-size: 8px;
    padding: 2px 4px;
  }

  .tindak-lanjut-text {
    font-size: 11px;
  }

  .no-tindak-lanjut {
    font-size: 8px;
  }

  .btn-detail {
    font-size: 8px;
    padding: 4px 6px;
  }

  .btn-edit-tindak {
    width: 22px;
    height: 22px;
  }

  .edit-icon {
    font-size: 13px;
  }

}

</style>