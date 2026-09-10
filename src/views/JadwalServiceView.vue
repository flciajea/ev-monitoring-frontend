<template>
  <div class="jadwal-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Monitoring</p>

        <h1>Jadwal Service</h1>

        <p class="page-description">
          Monitoring jadwal service kendaraan
        </p>
      </div>
    </section>


    <!-- =========================
         STATISTICS
    ========================== -->
    <section class="stats-grid">

      <div class="stat-card">
        <span class="stat-label">
          Total Jadwal
        </span>

        <strong class="stat-value">
          {{ totalJadwal }}
        </strong>
      </div>


      <div class="stat-card stat-open">
        <span class="stat-label">
          Open
        </span>

        <strong class="stat-value">
          {{ totalOpen }}
        </strong>
      </div>


      <div class="stat-card stat-progress">
        <span class="stat-label">
          On Progress
        </span>

        <strong class="stat-value">
          {{ totalProgress }}
        </strong>
      </div>


      <div class="stat-card stat-close">
        <span class="stat-label">
          Close
        </span>

        <strong class="stat-value">
          {{ totalClose }}
        </strong>
      </div>


      <div class="stat-card stat-cancel">
        <span class="stat-label">
          Cancel
        </span>

        <strong class="stat-value">
          {{ totalCancel }}
        </strong>
      </div>

    </section>


    <!-- =========================
         SEARCH
    ========================== -->
    <section class="toolbar">

      <div class="search-box">

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kendaraan, driver, UID, dealer, status..."
        />

        <button
          v-if="searchQuery"
          type="button"
          class="clear-search"
          @click="searchQuery = ''"
        >
          Clear
        </button>

      </div>

    </section>


    <!-- =========================
         DATA SECTION
    ========================== -->
    <section class="data-section">

      <div class="section-header">

        <div>
          <h2>Data Jadwal Service</h2>

          <p>
            {{ filteredJadwal.length }} data ditemukan
          </p>
        </div>

      </div>


      <!-- =========================
           LOADING
      ========================== -->
      <div
        v-if="loading"
        class="state-card"
      >
        <div class="loading-line"></div>
        <div class="loading-line short"></div>
        <div class="loading-table"></div>
      </div>


      <!-- =========================
           ERROR
      ========================== -->
      <div
        v-else-if="errorMsg"
        class="state-card error-state"
      >
        <h3>Data tidak dapat dimuat</h3>

        <p>
          {{ errorMsg }}
        </p>

        <button
          type="button"
          class="btn-secondary"
          @click="ambilData"
        >
          Coba Lagi
        </button>
      </div>


      <!-- =========================
           EMPTY
      ========================== -->
      <div
        v-else-if="filteredJadwal.length === 0"
        class="state-card empty-state"
      >
        <h3>Tidak ada data jadwal service</h3>

        <p v-if="searchQuery">
          Tidak ditemukan jadwal yang sesuai dengan pencarian.
        </p>

        <p v-else>
          Belum terdapat data jadwal service.
        </p>
      </div>


      <!-- =========================
           TABLE
      ========================== -->
      <div
        v-else
        class="table-container"
      >

        <table class="data-table">

          <colgroup>
            <col class="col-id" />
            <col class="col-kendaraan" />
            <col class="col-driver" />
            <col class="col-uid" />
            <col class="col-dealer" />
            <col class="col-km" />
            <col class="col-tanggal" />
            <col class="col-tindak-tanggal" />
            <col class="col-keterangan" />
            <col class="col-status" />
            <col class="col-tindak-lanjut" />
          </colgroup>


          <thead>
            <tr>
              <th>ID</th>
              <th>Kendaraan</th>
              <th>Driver</th>
              <th>UID / Daerah</th>
              <th>Dealer</th>
              <th>KM</th>
              <th>Tanggal Service</th>
              <th>Tanggal Tindak Lanjut</th>
              <th>Keterangan</th>
              <th>Status</th>
              <th>Tindak Lanjut</th>
            </tr>
          </thead>


          <tbody>

            <tr
              v-for="jadwal in filteredJadwal"
              :key="jadwal.id"
              :class="getRowClass(jadwal)"
            >

              <!-- =========================
                   ID
              ========================== -->
              <td>

                <span class="id-number">
                  #{{ jadwal.id }}
                </span>

              </td>


              <!-- =========================
                   KENDARAAN
              ========================== -->
              <td>

                <div class="vehicle-cell">

                  <span class="vehicle-number">
                    {{ jadwal.nomorKendaraan || '-' }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   DRIVER
              ========================== -->
              <td>

                <div class="requester-cell">

                  <strong>
                    {{ jadwal.namaLengkap || jadwal.username || '-' }}
                  </strong>

                  <span v-if="jadwal.username">
                    {{ jadwal.username }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   UID / DAERAH
              ========================== -->
              <td>

                <div class="requester-cell">

                  <span v-if="jadwal.uid">
                    UID: {{ jadwal.uid }}
                  </span>

                  <span v-if="jadwal.up3">
                    {{ jadwal.up3 }}
                  </span>

                  <span v-if="!jadwal.uid && !jadwal.up3" class="empty-text">
                    -
                  </span>

                </div>

              </td>


              <!-- =========================
                   DEALER
              ========================== -->
              <td>

                <span class="date-text">
                  {{ jadwal.dealer || '-' }}
                </span>

              </td>


              <!-- =========================
                   KM
              ========================== -->
              <td>

                <span class="date-text">
                  {{ jadwal.km ?? '-' }}
                </span>

              </td>


              <!-- =========================
                   TANGGAL SERVICE
              ========================== -->
              <td>

                <div class="vehicle-cell">

                  <span class="date-text">
                    {{ formatTanggal(jadwal.tanggalService) }}
                  </span>


                  <!-- DEADLINE (berbasis tanggal service) -->
                  <span
                    v-if="getDeadlineInfo(jadwal).text"
                    class="deadline-text"
                    :class="getDeadlineInfo(jadwal).class"
                  >
                    {{ getDeadlineInfo(jadwal).text }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   TANGGAL TINDAK LANJUT
              ========================== -->
              <td>

                <span
                  v-if="jadwal.tanggalTindakLanjut"
                  class="follow-date"
                  :class="{
                    'follow-date-overdue':
                      isFollowUpOverdue(jadwal),

                    'follow-date-today':
                      isFollowUpToday(jadwal),

                    'follow-date-upcoming':
                      isFollowUpUpcoming(jadwal)
                  }"
                >
                  {{ formatTanggal(jadwal.tanggalTindakLanjut) }}
                </span>

                <span
                  v-else
                  class="empty-text"
                >
                  Belum ditentukan
                </span>

              </td>


              <!-- =========================
                   KETERANGAN
              ========================== -->
              <td>

                <div class="complaint-text">
                  {{ jadwal.keterangan || '-' }}
                </div>

              </td>


              <!-- =========================
                   STATUS
              ========================== -->
              <td>

                <select
                  v-if="canManageStatus"
                  :value="getActualStatus(jadwal.status)"
                  class="status-select"
                  :class="getStatusClass(jadwal.status)"
                  :disabled="updatingId === jadwal.id"
                  @change="updateStatus(jadwal, $event.target.value)"
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
                  :class="getStatusClass(jadwal.status)"
                >
                  {{ getActualStatus(jadwal.status) }}
                </span>

              </td>


              <!-- =========================
                   TINDAK LANJUT
              ========================== -->
              <td>

                <div class="follow-up-cell">

                  <p
                    v-if="jadwal.tindakLanjut"
                    class="follow-up-text"
                  >
                    {{ jadwal.tindakLanjut }}
                  </p>

                  <span
                    v-else
                    class="empty-text"
                  >
                    Belum ada tindak lanjut
                  </span>


                  <!-- EDIT DETAIL -->
                  <button
                    v-if="isAdmin"
                    type="button"
                    class="detail-button"
                    :title="
                      jadwal.tindakLanjut
                        ? 'Lihat detail jadwal'
                        : 'Isi detail jadwal'
                    "
                    :aria-label="
                      jadwal.tindakLanjut
                        ? 'Lihat detail jadwal'
                        : 'Isi detail jadwal'
                    "
                    @click="lihatDetail(jadwal.id)"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 20H21"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />

                      <path
                        d="M16.5 3.5C16.8978 3.10218 17.4374 2.87868 18 2.87868C18.5626 2.87868 19.1022 3.10218 19.5 3.5C19.8978 3.89782 20.1213 4.43739 20.1213 5C20.1213 5.56261 19.8978 6.10218 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>

  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()


/* =========================
   STATE
========================= */

const daftarJadwal = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const updatingId = ref(null)


/* =========================
   CURRENT USER
========================= */

const currentUser = ref(null)

try {
  const user = localStorage.getItem('user')

  if (user) {
    currentUser.value = JSON.parse(user)
  }
} catch (error) {
  currentUser.value = null
}


const role = computed(() =>
  String(currentUser.value?.role || '').toLowerCase()
)


const isAdmin = computed(() =>
  role.value === 'admin'
)


const isUid = computed(() =>
  role.value === 'uid'
)


const canManageStatus = computed(() =>
  isAdmin.value || isUid.value
)


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


const normalizeStatus = (status) => {

  return String(getActualStatus(status))
    .trim()
    .toLowerCase()
}


const getStatusClass = (status) => {

  const normalized = normalizeStatus(status)

  if (normalized === 'open') {
    return 'status-open'
  }

  if (normalized === 'on progress') {
    return 'status-progress'
  }

  if (normalized === 'close') {
    return 'status-close'
  }

  if (normalized === 'cancel') {
    return 'status-cancel'
  }

  return 'status-open'
}


/* =========================
   GET DATA
========================= */

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/jadwal-service')

    daftarJadwal.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {
    console.error('Error ambil jadwal service:', error)

    errorMsg.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Terjadi kesalahan saat mengambil data jadwal service.'

  } finally {
    loading.value = false
  }
}


/* =========================
   STATISTICS
========================= */

const totalJadwal = computed(() =>
  daftarJadwal.value.length
)


const totalOpen = computed(() =>
  daftarJadwal.value.filter(
    jadwal => normalizeStatus(jadwal.status) === 'open'
  ).length
)


const totalProgress = computed(() =>
  daftarJadwal.value.filter(
    jadwal => normalizeStatus(jadwal.status) === 'on progress'
  ).length
)


const totalClose = computed(() =>
  daftarJadwal.value.filter(
    jadwal => normalizeStatus(jadwal.status) === 'close'
  ).length
)


const totalCancel = computed(() =>
  daftarJadwal.value.filter(
    jadwal => normalizeStatus(jadwal.status) === 'cancel'
  ).length
)


/* =========================
   SEARCH
========================= */

const filteredJadwal = computed(() => {

  const keyword = searchQuery.value
    .trim()
    .toLowerCase()

  if (!keyword) {
    return daftarJadwal.value
  }

  return daftarJadwal.value.filter(jadwal => {

    const searchableText = [
      jadwal.id,
      jadwal.nomorKendaraan,
      jadwal.namaLengkap,
      jadwal.username,
      jadwal.uid,
      jadwal.up3,
      jadwal.unit,
      jadwal.dealer,
      jadwal.km,
      jadwal.tanggalService,
      jadwal.tanggalTindakLanjut,
      jadwal.keterangan,
      jadwal.status,
      jadwal.tindakLanjut
    ]
      .filter(
        value =>
          value !== null &&
          value !== undefined
      )
      .join(' ')
      .toLowerCase()

    return searchableText.includes(keyword)
  })
})


/* =========================
   UPDATE STATUS
========================= */

const updateStatus = async (jadwal, statusBaru) => {

  if (!canManageStatus.value) {
    return
  }

  const statusLama = getActualStatus(jadwal.status)

  if (statusBaru === statusLama) {
    return
  }

  updatingId.value = jadwal.id

  try {

    const response = await api.put(
      `/jadwal-service/${jadwal.id}`,
      { status: statusBaru }
    )

    jadwal.status = response.data?.status || statusBaru

  } catch (error) {

    console.error('Error update status jadwal:', error)

    jadwal.status = statusLama

    alert(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Status jadwal service gagal diperbarui.'
    )

  } finally {
    updatingId.value = null
  }
}


/* =========================
   DETAIL
========================= */

const lihatDetail = (id) => {
  router.push(`/jadwal-service/edit/${id}`)
}


/* =========================
   DATE
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
    month: 'short',
    year: 'numeric'
  })
}


/* =========================
   DEADLINE
========================= */

const getDeadlineDifference = (jadwal) => {

  const status = normalizeStatus(jadwal.status)


  /*
   * Close dan Cancel tidak perlu deadline
   */
  if (
    status === 'close' ||
    status === 'cancel'
  ) {
    return null
  }


  if (!jadwal.tanggalService) {
    return null
  }


  const tanggalService = new Date(jadwal.tanggalService)

  if (Number.isNaN(tanggalService.getTime())) {
    return null
  }


  const today = new Date()

  today.setHours(0, 0, 0, 0)
  tanggalService.setHours(0, 0, 0, 0)


  const diffTime =
    today.getTime() - tanggalService.getTime()


  return Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  )
}


const getDeadlineInfo = (jadwal) => {

  const selisihHari = getDeadlineDifference(jadwal)


  if (selisihHari === null) {
    return { class: '', text: '' }
  }


  if (selisihHari <= 0) {
    return { class: 'deadline-normal', text: 'Hari ini' }
  }


  if (selisihHari <= 3) {
    return { class: 'deadline-normal', text: `${selisihHari} hari` }
  }


  if (selisihHari <= 5) {
    return { class: 'deadline-warning', text: `${selisihHari} hari` }
  }


  return {
    class: 'deadline-danger',
    text: `Terlambat ${selisihHari - 5} hari`
  }
}


/* =========================
   DEADLINE — TANGGAL TINDAK LANJUT

   Dipakai HANYA untuk mewarnai teks
   tanggal tindak lanjut itu sendiri
   (menandakan target follow-up yang
   dijanjikan sudah lewat / hari ini
   / masih akan datang). Terpisah dari
   getDeadlineInfo di atas, yang
   mengukur SLA dari Tanggal Service.
========================= */

const getFollowUpDifference = (jadwal) => {

  const status = normalizeStatus(jadwal.status)

  if (
    status === 'close' ||
    status === 'cancel'
  ) {
    return null
  }

  if (!jadwal.tanggalTindakLanjut) {
    return null
  }

  const followUp = new Date(jadwal.tanggalTindakLanjut)

  if (Number.isNaN(followUp.getTime())) {
    return null
  }

  const today = new Date()

  today.setHours(0, 0, 0, 0)
  followUp.setHours(0, 0, 0, 0)

  const diffTime = followUp.getTime() - today.getTime()

  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}


const isFollowUpOverdue = (jadwal) => {
  const difference = getFollowUpDifference(jadwal)
  return difference !== null && difference < 0
}


const isFollowUpToday = (jadwal) => {
  const difference = getFollowUpDifference(jadwal)
  return difference !== null && difference === 0
}


const isFollowUpUpcoming = (jadwal) => {
  const difference = getFollowUpDifference(jadwal)
  return difference !== null && difference > 0
}


/* =========================
   ROW STYLE
========================= */

const getRowClass = (jadwal) => {

  const status = normalizeStatus(jadwal.status)


  if (status === 'close') {
    return 'row-close'
  }


  if (status === 'cancel') {
    return 'row-cancel'
  }


  if (status === 'on progress') {
    return 'row-progress'
  }


  return ''
}


/* =========================
   INIT
========================= */

onMounted(() => {
  ambilData()
})
</script>


<style scoped>

/* =========================
   PAGE
========================= */

.jadwal-page {
  width: 100%;
  max-width: 100%;

  padding: 32px 36px 48px;

  box-sizing: border-box;
}


/* =========================
   HEADER
========================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 24px;

  margin-bottom: 28px;
}


.page-eyebrow {
  margin: 0 0 6px;

  color: #2563eb;

  font-size: 12px;
  font-weight: 750;

  text-transform: uppercase;
  letter-spacing: 0.08em;
}


.page-header h1 {
  margin: 0;

  color: #172033;

  font-size: 30px;
  line-height: 1.2;

  font-weight: 750;
}


.page-description {
  margin: 8px 0 0;

  color: #64748b;

  font-size: 15px;
}


/* =========================
   BUTTON
========================= */

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 9px;

  padding: 11px 17px;

  font-size: 14px;
  font-weight: 650;

  cursor: pointer;

  transition: 0.2s ease;
}


.btn-primary {
  background: #2563eb;
  color: white;
}


.btn-primary:hover {
  background: #1d4ed8;
}


.btn-secondary {
  background: #eef2f7;
  color: #374151;
}


.btn-secondary:hover {
  background: #e2e8f0;
}


/* =========================
   STATISTICS
========================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 24px;
}


.stat-card {
  min-height: 90px;

  padding: 18px 20px;

  box-sizing: border-box;

  background: white;

  border: 1px solid #e5eaf1;

  border-radius: 12px;

  display: flex;
  flex-direction: column;
  justify-content: center;

  box-shadow:
    0 2px 8px rgba(15, 23, 42, 0.035);
}


.stat-label {
  margin-bottom: 7px;

  color: #64748b;

  font-size: 13px;
  font-weight: 600;
}


.stat-value {
  color: #172033;

  font-size: 25px;
  line-height: 1;

  font-weight: 750;
}


/* =========================
   STAT COLOR ACCENTS
========================= */

.stat-open {
  border-top: 3px solid #3b82f6;
}


.stat-progress {
  border-top: 3px solid #f59e0b;
}


.stat-close {
  border-top: 3px solid #22c55e;
}


.stat-cancel {
  border-top: 3px solid #ef4444;
}


/* =========================
   TOOLBAR
========================= */

.toolbar {
  margin-bottom: 24px;
}


.search-box {
  position: relative;

  width: 100%;
}


.search-box input {
  width: 100%;
  height: 48px;

  box-sizing: border-box;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: white;

  color: #1f2937;

  padding: 0 80px 0 16px;

  font-size: 14px;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.search-box input::placeholder {
  color: #94a3b8;
}


.search-box input:focus {
  border-color: #93c5fd;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}


.clear-search {
  position: absolute;

  top: 50%;
  right: 12px;

  transform: translateY(-50%);

  border: none;

  background: transparent;

  color: #64748b;

  font-size: 12px;
  font-weight: 650;

  cursor: pointer;
}


.clear-search:hover {
  color: #2563eb;
}


/* =========================
   DATA SECTION
========================= */

.data-section {
  background: white;

  border: 1px solid #e5eaf1;

  border-radius: 14px;

  overflow: hidden;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.035);
}


.section-header {
  padding: 22px 24px 18px;

  border-bottom: 1px solid #edf0f4;
}


.section-header h2 {
  margin: 0;

  color: #172033;

  font-size: 19px;
  font-weight: 720;
}


.section-header p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 13px;
}


/* =========================
   TABLE
========================= */

.table-container {
  width: 100%;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;

  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0,
    black 12px,
    black calc(100% - 12px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to right,
    transparent 0,
    black 12px,
    black calc(100% - 12px),
    transparent 100%
  );
}


.table-container::-webkit-scrollbar {
  height: 6px;
}


.table-container::-webkit-scrollbar-track {
  background: #f8fafc;
}


.table-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;

  border-radius: 10px;
}


.table-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}


.data-table {
  width: 100%;

  min-width: 1280px;

  border-collapse: collapse;

  table-layout: fixed;
}


/* =========================
   COLUMN
========================= */

.col-id {
  width: 6%;
}

.col-kendaraan {
  width: 11%;
}

.col-driver {
  width: 12%;
}

.col-uid {
  width: 10%;
}

.col-dealer {
  width: 9%;
}

.col-km {
  width: 6%;
}

.col-tanggal {
  width: 10%;
}

.col-tindak-tanggal {
  width: 11%;
}

.col-keterangan {
  width: 12%;
}

.col-status {
  width: 10%;
}

.col-tindak-lanjut {
  width: 13%;
}


/* =========================
   TABLE HEADER
========================= */

.data-table thead th {
  padding: 15px 13px;

  background: #f8fafc;

  border-bottom: 1px solid #e2e8f0;

  color: #64748b;

  font-size: 11px;
  font-weight: 750;

  text-transform: uppercase;

  letter-spacing: 0.04em;

  text-align: left;

  vertical-align: middle;
}


/* =========================
   TABLE BODY
========================= */

.data-table tbody td {
  padding: 15px 13px;

  border-bottom: 1px solid #edf0f4;

  color: #374151;

  font-size: 13px;

  vertical-align: middle;

  overflow-wrap: anywhere;
  word-break: break-word;
}


.data-table tbody tr:last-child td {
  border-bottom: none;
}


.data-table tbody tr {
  transition: background 0.15s ease;
}


.data-table tbody tr:hover {
  background: #f8fbff;
}


.data-table tbody tr.row-close {
  background: #fbfefc;
}


.data-table tbody tr.row-cancel {
  background: #fffafa;
}


.data-table tbody tr.row-progress {
  background: #fffdf7;
}


/* =========================
   ID
========================= */

.id-number {
  color: #94a3b8;

  font-size: 12px;
  font-weight: 650;
}


/* =========================
   VEHICLE
========================= */

.vehicle-cell {
  display: flex;
  flex-direction: column;

  gap: 7px;
}


.vehicle-number {
  color: #27364a;

  font-size: 13px;
  font-weight: 720;

  line-height: 1.35;
}


/* =========================
   DEADLINE
========================= */

.deadline-text {
  width: fit-content;

  padding: 4px 7px;

  border-radius: 5px;

  font-size: 10px;
  font-weight: 700;
}


.deadline-normal {
  color: #2563eb;

  background: #eff6ff;
}


.deadline-warning {
  color: #b45309;

  background: #fff7ed;
}


.deadline-danger {
  color: #b91c1c;

  background: #fee2e2;
}


/* =========================
   KETERANGAN
========================= */

.complaint-text {
  color: #334155;

  line-height: 1.55;

  white-space: normal;
}


/* =========================
   DATE
========================= */

.date-text,
.follow-date {
  display: inline-block;

  color: #475569;

  font-size: 12px;

  line-height: 1.45;
}


.follow-date {
  font-weight: 650;
}


/* =========================
   DEADLINE DATE COLORS
========================= */

.follow-date-overdue {
  color: #b91c1c;

  font-weight: 700;
}


.follow-date-today {
  color: #b45309;

  font-weight: 700;
}


.follow-date-upcoming {
  color: #2563eb;

  font-weight: 650;
}


.empty-text {
  color: #94a3b8;

  font-size: 12px;
}


/* =========================
   REQUESTER / DRIVER
========================= */

.requester-cell {
  display: flex;
  flex-direction: column;

  gap: 4px;
}


.requester-cell strong {
  color: #172033;

  font-size: 13px;
  font-weight: 700;

  line-height: 1.4;
}


.requester-cell span {
  color: #475569;

  font-size: 11px;
  font-weight: 500;

  line-height: 1.4;
}


/* =========================
   STATUS
========================= */

.status-select,
.status-badge {
  display: inline-flex;
  align-items: center;

  min-height: 34px;

  box-sizing: border-box;

  border-radius: 8px;

  font-size: 11px;
  font-weight: 700;
}


.status-select {
  width: 100%;
  max-width: 130px;

  padding: 0 10px;

  border: 1px solid transparent;

  outline: none;

  cursor: pointer;
}


.status-select:disabled {
  opacity: 0.55;

  cursor: not-allowed;
}


.status-badge {
  padding: 7px 10px;
}


/* =========================
   OPEN
========================= */

.status-open {
  color: #1d4ed8;

  background: #eff6ff;

  border-color: #bfdbfe;
}


/* =========================
   ON PROGRESS
========================= */

.status-progress {
  color: #c2410c;

  background: #fff7ed;

  border-color: #fed7aa;
}


/* =========================
   CLOSE
========================= */

.status-close {
  color: #15803d;

  background: #f0fdf4;

  border-color: #bbf7d0;
}


/* =========================
   CANCEL
========================= */

.status-cancel {
  color: #b91c1c;

  background: #fef2f2;

  border-color: #fecaca;
}


/* =========================
   FOLLOW UP
========================= */

.follow-up-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 8px;
}


.follow-up-text {
  margin: 0;

  color: #475569;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================
   DETAIL / EDIT ICON
========================= */

.detail-button {
  width: 26px;
  height: 26px;

  flex-shrink: 0;

  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #bfdbfe;

  border-radius: 6px;

  background: #eff6ff;

  color: #2563eb;

  cursor: pointer;

  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}


.detail-button:hover {
  background: #dbeafe;

  border-color: #93c5fd;

  color: #1d4ed8;

  transform: translateY(-1px);
}


.detail-button:active {
  transform: translateY(0);
}


.detail-button svg {
  display: block;

  width: 13px;
  height: 13px;
}


/* =========================
   STATES
========================= */

.state-card {
  padding: 50px 24px;

  text-align: center;
}


.state-card h3 {
  margin: 0 0 8px;

  color: #334155;

  font-size: 16px;
}


.state-card p {
  margin: 0 0 18px;

  color: #94a3b8;

  font-size: 13px;
}


.error-state h3 {
  color: #b91c1c;
}


/* =========================
   LOADING
========================= */

.loading-line {
  width: 180px;
  height: 14px;

  margin: 0 auto 10px;

  border-radius: 5px;

  background: #edf2f7;

  animation: pulse 1.4s infinite ease-in-out;
}


.loading-line.short {
  width: 110px;
}


.loading-table {
  width: 90%;
  height: 180px;

  margin: 28px auto 0;

  border-radius: 8px;

  background: #f8fafc;

  animation: pulse 1.4s infinite ease-in-out;
}


@keyframes pulse {

  0%,
  100% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1200px) {

  .jadwal-page {
    padding: 28px 26px 40px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

}


@media (max-width: 768px) {

  .jadwal-page {
    padding: 20px 16px 32px;
  }


  .page-header {
    align-items: flex-start;

    flex-direction: column;

    margin-bottom: 22px;
  }


  .page-header h1 {
    font-size: 26px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 10px;
  }


  .stat-card {
    min-height: 80px;

    padding: 15px;
  }


  .stat-value {
    font-size: 22px;
  }


  .section-header {
    padding: 18px;
  }

}


@media (max-width: 480px) {

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }


  .stat-card:last-child {
    grid-column: span 2;
  }

}

</style>