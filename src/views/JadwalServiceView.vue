<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

const router = useRouter()

// =========================
// DATA
// =========================

const daftarJadwal = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const updatingId = ref(null)

// =========================
// USER
// =========================

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

// =========================
// STATUS
// =========================

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
      backgroundColor: '#eff6ff',
      color: '#2563eb',
      borderColor: '#bfdbfe'
    },

    'On Progress': {
      backgroundColor: '#fff7ed',
      color: '#ea580c',
      borderColor: '#fed7aa'
    },

    Close: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a',
      borderColor: '#bbf7d0'
    },

    Cancel: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      borderColor: '#fecaca'
    }
  }

  return styles[actualStatus] || {
    backgroundColor: '#f8fafc',
    color: '#64748b',
    borderColor: '#e2e8f0'
  }
}

// =========================
// SUMMARY
// =========================

const totalJadwal = computed(() => {
  return daftarJadwal.value.length
})

const totalOpen = computed(() => {
  return daftarJadwal.value.filter(
    jadwal => getActualStatus(jadwal.status) === 'Open'
  ).length
})

const totalProgress = computed(() => {
  return daftarJadwal.value.filter(
    jadwal => getActualStatus(jadwal.status) === 'On Progress'
  ).length
})

const totalClose = computed(() => {
  return daftarJadwal.value.filter(
    jadwal => getActualStatus(jadwal.status) === 'Close'
  ).length
})

const totalCancel = computed(() => {
  return daftarJadwal.value.filter(
    jadwal => getActualStatus(jadwal.status) === 'Cancel'
  ).length
})

// =========================
// SEARCH
// =========================

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

// =========================
// FORMAT TANGGAL
// =========================

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
    month: 'short',
    year: 'numeric'
  })
}

// =========================
// DEADLINE
// =========================

const getDeadlineInfo = (tanggal, status) => {
  const actualStatus = getActualStatus(status)

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
  today.setHours(0, 0, 0, 0)

  const tanggalService = new Date(tanggal)
  tanggalService.setHours(0, 0, 0, 0)

  if (Number.isNaN(tanggalService.getTime())) {
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

  if (selisihHari <= 0) {
    return {
      class: '',
      text: 'Hari ini'
    }
  }

  if (selisihHari <= 3) {
    return {
      class: '',
      text: `${selisihHari} hari`
    }
  }

  if (selisihHari <= 5) {
    return {
      class: 'deadline-warning',
      text: `${selisihHari} hari`
    }
  }

  return {
    class: 'deadline-danger',
    text: `Terlambat ${selisihHari - 5} hari`
  }
}

// =========================
// UPDATE STATUS
// =========================

const updateStatus = async (jadwal, statusBaru) => {
  if (!canManageStatus.value) {
    return
  }

  const statusLama =
    getActualStatus(jadwal.status)

  if (statusBaru === statusLama) {
    return
  }

  updatingId.value = jadwal.id
  errorMsg.value = ''

  try {
    const response = await api.put(
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

    jadwal.status = statusLama

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

// =========================
// DETAIL
// =========================

const lihatDetail = (id) => {
  router.push(
    `/jadwal-service/edit/${id}`
  )
}

// =========================
// AMBIL DATA
// =========================

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get(
      '/jadwal-service'
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

// =========================
// INIT
// =========================

onMounted(() => {
  ambilData()
})
</script>


<template>

  <div class="jadwal-page">

    <!-- =========================
         HEADER
    ========================= -->

    <div class="page-header">

      <span class="page-eyebrow">
        MONITORING
      </span>

      <h2>
        Jadwal Service
      </h2>

      <p>
        Monitoring jadwal service kendaraan
      </p>

    </div>


    <!-- =========================
         SUMMARY
    ========================= -->

    <div class="summary-grid">

      <div class="summary-card">

        <span class="summary-label">
          Total Jadwal
        </span>

        <strong class="total-value">
          {{ totalJadwal }}
        </strong>

      </div>


      <div class="summary-card open-card">

        <span class="summary-label">
          Open
        </span>

        <strong class="open-value">
          {{ totalOpen }}
        </strong>

      </div>


      <div class="summary-card progress-card">

        <span class="summary-label">
          On Progress
        </span>

        <strong class="progress-value">
          {{ totalProgress }}
        </strong>

      </div>


      <div class="summary-card close-card">

        <span class="summary-label">
          Close
        </span>

        <strong class="close-value">
          {{ totalClose }}
        </strong>

      </div>


      <div class="summary-card cancel-card">

        <span class="summary-label">
          Cancel
        </span>

        <strong class="cancel-value">
          {{ totalCancel }}
        </strong>

      </div>

    </div>


    <!-- =========================
         SEARCH
    ========================= -->

    <div class="search-card">

      <SearchInput
        v-model="searchQuery"
        placeholder="Cari kendaraan, driver, UID, dealer, status..."
      />

    </div>


    <!-- =========================
         ERROR
    ========================= -->

    <div
      v-if="errorMsg"
      class="error-box"
    >
      <span class="error-title">
        Terjadi kesalahan
      </span>

      <span>
        {{ errorMsg }}
      </span>
    </div>


    <!-- =========================
         LOADING
    ========================= -->

    <div
      v-if="loading"
      class="loading-card"
    >

      <div class="loading-spinner"></div>

      <span>
        Memuat data jadwal service...
      </span>

    </div>


    <!-- =========================
         EMPTY
    ========================= -->

    <EmptyState
      v-else-if="filteredJadwal.length === 0"
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
      class="table-card"
    >

      <!-- TABLE HEADER -->

      <div class="table-header">

        <div>

          <h3>
            Data Jadwal Service
          </h3>

          <span>
            {{ filteredJadwal.length }} data ditemukan
          </span>

        </div>

      </div>


      <div class="table-wrapper">

        <table>

          <colgroup>

            <col class="col-id">
            <col class="col-kendaraan">
            <col class="col-driver">
            <col class="col-uid">
            <col class="col-dealer">
            <col class="col-km">
            <col class="col-tanggal">
            <col class="col-tindak-tanggal">
            <col class="col-keterangan">
            <col class="col-status">
            <col class="col-tindak">

          </colgroup>


          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                KENDARAAN
              </th>

              <th>
                DRIVER
              </th>

              <th>
                UID / DAERAH
              </th>

              <th>
                DEALER
              </th>

              <th>
                KM
              </th>

              <th>
                TANGGAL
                <br>
                SERVICE
              </th>

              <th>
                TANGGAL
                <br>
                TINDAK LANJUT
              </th>

              <th>
                KETERANGAN
              </th>

              <th>
                STATUS
              </th>

              <th>
                TINDAK LANJUT
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="jadwal in filteredJadwal"
              :key="jadwal.id"
            >

              <!-- ID -->

              <td>

                <span class="id-number">
                  #{{ jadwal.id }}
                </span>

              </td>


              <!-- KENDARAAN -->

              <td>

                <div class="vehicle-info">

                  <strong>
                    {{
                      jadwal.nomorKendaraan ||
                      '-'
                    }}
                  </strong>

                  <span
                    v-if="jadwal.dealer"
                  >
                    {{ jadwal.dealer }}
                  </span>

                </div>

              </td>


              <!-- DRIVER -->

              <td>

                <div class="driver-info">

                  <strong>
                    {{
                      jadwal.namaLengkap ||
                      jadwal.username ||
                      '-'
                    }}
                  </strong>

                  <span
                    v-if="jadwal.username"
                  >
                    {{ jadwal.username }}
                  </span>

                </div>

              </td>


              <!-- UID / DAERAH -->

              <td>

                <div class="area-info">

                  <span
                    v-if="jadwal.uid"
                    class="uid-text"
                  >
                    {{ jadwal.uid }}
                  </span>

                  <span
                    v-if="jadwal.up3"
                    class="area-text"
                  >
                    {{ jadwal.up3 }}
                  </span>

                  <span
                    v-if="!jadwal.uid && !jadwal.up3"
                    class="muted"
                  >
                    -
                  </span>

                </div>

              </td>


              <!-- DEALER -->

              <td>

                <span class="dealer-text">
                  {{ jadwal.dealer || '-' }}
                </span>

              </td>


              <!-- KM -->

              <td>

                <span class="km-value">
                  {{ jadwal.km ?? '-' }}
                </span>

              </td>


              <!-- TANGGAL SERVICE -->

              <td>

                <div
                  class="service-date"
                  :class="
                    getDeadlineInfo(
                      jadwal.tanggalService,
                      jadwal.status
                    ).class
                  "
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


              <!-- TANGGAL TINDAK LANJUT -->

              <td>

                <span
                  v-if="jadwal.tanggalTindakLanjut"
                  class="follow-date"
                >
                  {{
                    formatTanggal(
                      jadwal.tanggalTindakLanjut
                    )
                  }}
                </span>

                <span
                  v-else
                  class="muted"
                >
                  Belum ditentukan
                </span>

              </td>


              <!-- KETERANGAN -->

              <td>

                <div class="description">
                  {{
                    jadwal.keterangan ||
                    '-'
                  }}
                </div>

              </td>


              <!-- STATUS -->

              <td>

                <select
                  v-if="canManageStatus"
                  class="status-select"
                  :value="
                    getActualStatus(
                      jadwal.status
                    )
                  "
                  :disabled="
                    updatingId === jadwal.id
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
                    v-for="status in daftarStatus"
                    :key="status"
                    :value="status"
                  >
                    {{ status }}
                  </option>

                </select>


                <span
                  v-else
                  class="status-badge"
                  :style="
                    getStatusStyle(
                      jadwal.status
                    )
                  "
                >

                  <span class="status-dot"></span>

                  {{
                    getActualStatus(
                      jadwal.status
                    )
                  }}

                </span>

              </td>


              <!-- TINDAK LANJUT -->

              <td>

                <div class="follow-up">

                  <template
                    v-if="
                      jadwal.tindakLanjut &&
                      jadwal.tindakLanjut.trim()
                    "
                  >

                    <span class="follow-up-text">
                      {{ jadwal.tindakLanjut }}
                    </span>


                    <button
                      v-if="isAdmin"
                      type="button"
                      class="edit-button"
                      title="Edit tindak lanjut"
                      @click="
                        lihatDetail(
                          jadwal.id
                        )
                      "
                    >
                      Edit
                    </button>

                  </template>


                  <template v-else>

                    <button
                      v-if="isAdmin"
                      type="button"
                      class="detail-button"
                      @click="
                        lihatDetail(
                          jadwal.id
                        )
                      "
                    >
                      Isi Detail
                    </button>

                    <span
                      v-else
                      class="muted"
                    >
                      Belum ada
                    </span>

                  </template>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

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
  margin: 0;
}


/* =========================
   HEADER
========================= */

.page-header {
  margin-bottom: 34px;
}

.page-eyebrow {
  display: block;

  margin-bottom: 8px;

  color: #2563eb;

  font-size: 13px;
  font-weight: 700;

  letter-spacing: 0.08em;
}

.page-header h2 {
  margin: 0;

  color: #162b46;

  font-size: 30px;
  font-weight: 700;

  line-height: 1.15;

  letter-spacing: -0.025em;
}

.page-header p {
  margin: 10px 0 0;

  color: #64748b;

  font-size: 16px;

  line-height: 1.5;
}


/* =========================
   SUMMARY
========================= */

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 20px;

  margin-bottom: 32px;
}

.summary-card {
  min-height: 104px;

  display: flex;
  flex-direction: column;

  justify-content: center;

  padding: 22px 28px;

  background: #ffffff;

  border: 1px solid #e2e8f0;

  border-top: 3px solid transparent;

  border-radius: 16px;

  box-shadow:
    0 2px 8px
    rgba(15, 23, 42, 0.025);

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.summary-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 6px 18px
    rgba(15, 23, 42, 0.06);
}

.summary-label {
  color: #64748b;

  font-size: 14px;
  font-weight: 600;

  line-height: 1.4;
}

.summary-card strong {
  margin-top: 5px;

  color: #172b46;

  font-size: 32px;
  font-weight: 700;

  line-height: 1;
}

.summary-card.open-card {
  border-top-color: #3b82f6;
}

.summary-card.progress-card {
  border-top-color: #f59e0b;
}

.summary-card.close-card {
  border-top-color: #22c55e;
}

.summary-card.cancel-card {
  border-top-color: #ef4444;
}

.open-value {
  color: #2563eb !important;
}

.progress-value {
  color: #ea580c !important;
}

.close-value {
  color: #16a34a !important;
}

.cancel-value {
  color: #dc2626 !important;
}


/* =========================
   SEARCH
========================= */

.search-card {
  width: 100%;

  margin-bottom: 32px;

  padding: 16px 22px;

  background: #ffffff;

  border: 1px solid #dbe4ef;

  border-radius: 14px;

  box-shadow:
    0 2px 8px
    rgba(15, 23, 42, 0.025);

  box-sizing: border-box;
}

.search-card :deep(.search-container) {
  width: 100%;
}

.search-card :deep(input) {
  width: 100%;
}


/* =========================
   ERROR
========================= */

.error-box {
  display: flex;
  flex-direction: column;

  gap: 3px;

  margin-bottom: 20px;

  padding: 13px 16px;

  background: #fef2f2;

  border: 1px solid #fecaca;

  border-radius: 10px;

  color: #b91c1c;

  font-size: 13px;

  line-height: 1.5;
}

.error-title {
  font-weight: 700;
}


/* =========================
   LOADING
========================= */

.loading-card {
  min-height: 260px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 13px;

  background: #ffffff;

  border: 1px solid #e2e8f0;

  border-radius: 16px;

  color: #64748b;

  font-size: 13px;
}

.loading-spinner {
  width: 30px;
  height: 30px;

  border: 3px solid #e2e8f0;

  border-top-color: #3b82f6;

  border-radius: 50%;

  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================
   TABLE CARD
========================= */

.table-card {
  width: 100%;

  background: #ffffff;

  border: 1px solid #e2e8f0;

  border-radius: 16px;

  box-shadow:
    0 3px 12px
    rgba(15, 23, 42, 0.035);

  overflow: hidden;
}


/* =========================
   TABLE HEADER
========================= */

.table-header {
  padding: 28px 32px;

  border-bottom: 1px solid #edf2f7;
}

.table-header h3 {
  margin: 0;

  color: #172b46;

  font-size: 23px;
  font-weight: 700;

  line-height: 1.25;
}

.table-header span {
  display: block;

  margin-top: 6px;

  color: #71839a;

  font-size: 14px;
}


/* =========================
   TABLE WRAPPER
========================= */

.table-wrapper {
  width: 100%;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: thin;

  scrollbar-color:
    #cbd5e1
    transparent;
}


/* =========================
   TABLE
========================= */

table {
  width: 100%;

  min-width: 1280px;

  border-collapse: collapse;

  table-layout: fixed;
}


/* =========================
   COLUMN
========================= */

.col-id {
  width: 55px;
}

.col-kendaraan {
  width: 130px;
}

.col-driver {
  width: 160px;
}

.col-uid {
  width: 130px;
}

.col-dealer {
  width: 110px;
}

.col-km {
  width: 65px;
}

.col-tanggal {
  width: 135px;
}

.col-tindak-tanggal {
  width: 145px;
}

.col-keterangan {
  width: 180px;
}

.col-status {
  width: 125px;
}

.col-tindak {
  width: 205px;
}


/* =========================
   TABLE HEADER
========================= */

thead th {
  padding: 18px 17px;

  background: #f8fafc;

  border-bottom: 1px solid #e2e8f0;

  color: #58708e;

  text-align: left;

  font-size: 12px;
  font-weight: 700;

  line-height: 1.25;

  letter-spacing: 0.035em;

  white-space: nowrap;
}


/* =========================
   TABLE BODY
========================= */

tbody tr {
  transition:
    background-color 0.15s ease;
}

tbody tr:hover {
  background: #f8fbff;
}

tbody td {
  padding: 19px 17px;

  border-bottom: 1px solid #edf2f7;

  color: #334155;

  font-size: 13px;

  line-height: 1.5;

  vertical-align: middle;

  overflow: hidden;
}

tbody tr:last-child td {
  border-bottom: none;
}


/* =========================
   ID
========================= */

.id-number {
  color: #94a3b8;

  font-size: 12px;

  font-weight: 600;
}


/* =========================
   VEHICLE
========================= */

.vehicle-info {
  display: flex;
  flex-direction: column;

  gap: 4px;

  min-width: 0;
}

.vehicle-info strong {
  color: #1e293b;

  font-size: 14px;
  font-weight: 700;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.vehicle-info span {
  color: #71839a;

  font-size: 11px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}


/* =========================
   DRIVER
========================= */

.driver-info {
  display: flex;
  flex-direction: column;

  gap: 4px;

  min-width: 0;
}

.driver-info strong {
  color: #1e293b;

  font-size: 13px;
  font-weight: 700;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.driver-info span {
  color: #64748b;

  font-size: 11px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}


/* =========================
   UID / AREA
========================= */

.area-info {
  display: flex;
  flex-direction: column;

  align-items: flex-start;

  gap: 5px;

  min-width: 0;
}

.uid-text {
  color: #2563eb;

  font-size: 12px;
  font-weight: 700;

  line-height: 1.3;

  overflow-wrap: anywhere;
}

.area-text {
  color: #64748b;

  font-size: 11px;

  line-height: 1.3;

  overflow-wrap: anywhere;
}


/* =========================
   DEALER
========================= */

.dealer-text {
  color: #475569;

  font-size: 12px;

  line-height: 1.45;

  overflow-wrap: anywhere;
}


/* =========================
   KM
========================= */

.km-value {
  color: #334155;

  font-size: 13px;
  font-weight: 600;
}


/* =========================
   SERVICE DATE
========================= */

.service-date {
  display: flex;
  flex-direction: column;

  align-items: flex-start;

  gap: 6px;
}

.service-date strong {
  color: #334155;

  font-size: 12px;
  font-weight: 600;

  white-space: nowrap;
}

.service-date.deadline-warning strong {
  color: #ea580c;
}

.service-date.deadline-danger strong {
  color: #dc2626;
}


/* =========================
   DEADLINE
========================= */

.deadline-label {
  display: inline-flex;

  padding: 4px 8px;

  border-radius: 6px;

  background: #f1f5f9;

  color: #64748b;

  font-size: 10px;
  font-weight: 700;

  line-height: 1;

  white-space: nowrap;
}

.deadline-label.deadline-warning {
  background: #fff7ed;

  color: #ea580c;
}

.deadline-label.deadline-danger {
  background: #fef2f2;

  color: #dc2626;
}


/* =========================
   FOLLOW DATE
========================= */

.follow-date {
  color: #1e293b;

  font-size: 12px;
  font-weight: 600;

  white-space: nowrap;
}


/* =========================
   DESCRIPTION
========================= */

.description {
  color: #475569;

  font-size: 12px;

  line-height: 1.5;

  overflow-wrap: anywhere;

  display: -webkit-box;

  -webkit-line-clamp: 3;

  -webkit-box-orient: vertical;

  overflow: hidden;
}


/* =========================
   STATUS SELECT
========================= */

.status-select {
  width: 112px;

  padding: 8px 10px;

  border: 1px solid;

  border-radius: 20px;

  outline: none;

  font-family: inherit;

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;

  appearance: auto;

  transition:
    box-shadow 0.15s ease;
}

.status-select:focus {
  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.10);
}

.status-select:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}


/* =========================
   STATUS BADGE
========================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding: 8px 11px;

  border: 1px solid;

  border-radius: 20px;

  font-size: 11px;
  font-weight: 700;

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
   FOLLOW UP
========================= */

.follow-up {
  display: flex;

  align-items: flex-start;

  gap: 9px;

  min-width: 0;
}

.follow-up-text {
  flex: 1;

  min-width: 0;

  color: #475569;

  font-size: 12px;

  line-height: 1.5;

  overflow-wrap: anywhere;

  display: -webkit-box;

  -webkit-line-clamp: 3;

  -webkit-box-orient: vertical;

  overflow: hidden;
}


/* =========================
   DETAIL BUTTON
========================= */

.detail-button {
  padding: 7px 12px;

  border: 1px solid #bfdbfe;

  border-radius: 7px;

  background: #eff6ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.detail-button:hover {
  background: #dbeafe;

  border-color: #93c5fd;
}


/* =========================
   EDIT BUTTON
========================= */

.edit-button {
  flex-shrink: 0;

  padding: 6px 10px;

  border: 1px solid #bfdbfe;

  border-radius: 7px;

  background: #eff6ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.edit-button:hover {
  background: #dbeafe;

  border-color: #93c5fd;
}


/* =========================
   MUTED
========================= */

.muted {
  color: #94a3b8 !important;

  font-size: 11px !important;

  font-style: italic;
}


/* =========================
   TABLET
========================= */

@media (max-width: 1200px) {

  .summary-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

}


/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

  .jadwal-page {
    width: 100%;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-eyebrow {
    margin-bottom: 6px;

    font-size: 11px;
  }

  .page-header h2 {
    font-size: 25px;
  }

  .page-header p {
    margin-top: 7px;

    font-size: 13px;
  }

  .summary-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 10px;

    margin-bottom: 20px;
  }

  .summary-card {
    min-height: 82px;

    padding: 16px 17px;

    border-radius: 12px;
  }

  .summary-label {
    font-size: 11px;
  }

  .summary-card strong {
    font-size: 25px;
  }

  .search-card {
    margin-bottom: 20px;

    padding: 12px 14px;

    border-radius: 11px;
  }

  .table-card {
    border-radius: 12px;
  }

  .table-header {
    padding: 20px;
  }

  .table-header h3 {
    font-size: 19px;
  }

  .table-header span {
    font-size: 12px;
  }

  table {
    min-width: 1280px;
  }

}


/* =========================
   VERY SMALL
========================= */

@media (max-width: 450px) {

  .summary-grid {
    gap: 8px;
  }

  .summary-card {
    padding: 13px 14px;
  }

  .summary-card strong {
    font-size: 22px;
  }

}

</style>