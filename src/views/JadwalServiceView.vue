<template>
  <div class="page-container">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Jadwal Service</h1>
        <p>Daftar jadwal service kendaraan</p>
      </div>
    </div>


    <!-- SEARCH -->
    <div class="toolbar">
      <SearchInput
        v-model="searchQuery"
        placeholder="Cari kendaraan, nama driver, UID, dealer..."
      />
    </div>


    <!-- LOADING -->
    <div
      v-if="loading"
      class="state-box"
    >
      <div class="spinner"></div>

      <p>
        Memuat data jadwal service...
      </p>
    </div>


    <!-- ERROR -->
    <div
      v-else-if="errorMsg"
      class="error-box"
    >
      {{ errorMsg }}
    </div>


    <!-- EMPTY -->
    <EmptyState
      v-else-if="filteredJadwal.length === 0"
      title="Tidak ada jadwal service"
      description="Belum ada data jadwal service yang tersedia."
    />


    <!-- TABLE -->
    <div
      v-else
      class="table-card"
    >

      <div class="table-wrapper">

        <table>

          <thead>

            <tr>

              <th class="col-id">
                ID
              </th>

              <th class="col-kendaraan">
                No. Kendaraan
              </th>

              <th class="col-nama">
                Nama Driver
              </th>

              <th class="col-daerah">
                UID / Daerah
              </th>

              <th class="col-dealer">
                Dealer
              </th>

              <th class="col-km">
                KM
              </th>

              <th class="col-tanggal">
                Tanggal Service
              </th>

              <th class="col-keterangan">
                Keterangan
              </th>

              <th class="col-status">
                Status
              </th>

              <th class="col-tindak-lanjut">
                Tindak Lanjut
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
                {{ jadwal.id ?? '-' }}
              </td>


              <!-- NO KENDARAAN -->
              <td class="strong">
                {{ jadwal.nomorKendaraan || '-' }}
              </td>


              <!-- NAMA DRIVER -->
              <td>
                {{ jadwal.namaLengkap || jadwal.username || '-' }}
              </td>


              <!-- UID / DAERAH -->
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


              <!-- DEALER -->
              <td>
                {{ jadwal.dealer || '-' }}
              </td>


              <!-- KM -->
              <td>
                {{ jadwal.km ?? '-' }}
              </td>


              <!-- TANGGAL SERVICE -->
              <td>

                <span class="date-text">
                  {{ formatTanggal(jadwal.tanggalService) }}
                </span>

              </td>


              <!-- KETERANGAN -->
              <td class="description">
                {{ jadwal.keterangan || '-' }}
              </td>


              <!-- STATUS -->
              <td class="status-cell">

                <!-- ADMIN / UID -->
                <select
                  v-if="canEditStatus"
                  :value="normalizeStatus(jadwal.status)"
                  class="status-select"
                  :class="getStatusClass(jadwal.status)"
                  :disabled="updatingId === jadwal.id"
                  @click.stop
                  @change="ubahStatus(jadwal, $event)"
                >

                  <option value="Open">
                    Open
                  </option>

                  <option value="On Progress">
                    On Progress
                  </option>

                  <option value="Close">
                    Close
                  </option>

                  <option value="Cancel">
                    Cancel
                  </option>

                </select>


                <!-- ROLE LAIN -->
                <span
                  v-else
                  class="status-badge"
                  :class="getStatusClass(jadwal.status)"
                >
                  {{ normalizeStatus(jadwal.status) }}
                </span>


                <!-- UPDATING -->
                <span
                  v-if="updatingId === jadwal.id"
                  class="updating-text"
                >
                  Menyimpan...
                </span>

              </td>


              <!-- TINDAK LANJUT -->
              <td class="tindak-lanjut-cell">

                <!-- BELUM ADA TINDAK LANJUT -->
                <div
                  v-if="!jadwal.tindakLanjut"
                  class="detail-wrapper"
                >

                  <button
                    type="button"
                    class="btn-detail"
                    @click="lihatDetail(jadwal.id)"
                  >
                    Detail
                  </button>

                </div>


                <!-- SUDAH ADA TINDAK LANJUT -->
                <div
                  v-else
                  class="tindak-lanjut-wrapper"
                >

                  <span class="tindak-lanjut-text">
                    {{ jadwal.tindakLanjut }}
                  </span>


                  <!-- EDIT HANYA ADMIN -->
                  <button
                    v-if="isAdmin"
                    type="button"
                    class="btn-edit"
                    title="Edit tindak lanjut"
                    @click="lihatDetail(jadwal.id)"
                  >
                    ✎
                  </button>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>

  </div>
</template>


<script setup>

import {
  ref,
  onMounted,
  computed
} from 'vue'

import {
  useRouter
} from 'vue-router'

import api from '../api'

import EmptyState from '../components/EmptyState.vue'

import SearchInput from '../components/SearchInput.vue'


/* =========================
   ROUTER
   ========================= */

const router = useRouter()


/* =========================
   DATA
   ========================= */

const daftarJadwal = ref([])

const loading = ref(true)

const errorMsg = ref('')

const searchQuery = ref('')

const updatingId = ref(null)


/* =========================
   USER
   ========================= */

const user = ref(null)

try {

  const storedUser =
    localStorage.getItem('user')

  if (storedUser) {

    user.value =
      JSON.parse(storedUser)

  }

} catch (error) {

  user.value = null

}


/* =========================
   ROLE
   ========================= */

const role = computed(() => {

  return (
    user.value?.role
      ?.toLowerCase() || ''
  )

})


/* =========================
   ADMIN
   ========================= */

const isAdmin = computed(() => {

  return role.value === 'admin'

})


/* =========================
   CAN EDIT STATUS
   ========================= */

const canEditStatus =
  computed(() => {

    return (
      role.value === 'admin' ||
      role.value === 'uid'
    )

  })


/* =========================
   SEARCH
   ========================= */

const filteredJadwal =
  computed(() => {

    const query =
      searchQuery.value
        .trim()
        .toLowerCase()

    if (!query) {

      return daftarJadwal.value

    }

    return daftarJadwal.value.filter(
      (jadwal) => {

        return (

          String(jadwal.id ?? '')
            .toLowerCase()
            .includes(query)

          ||

          jadwal.nomorKendaraan
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.namaLengkap
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.username
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.uid
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.up3
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.unit
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.dealer
            ?.toLowerCase()
            .includes(query)

          ||

          String(jadwal.km ?? '')
            .toLowerCase()
            .includes(query)

          ||

          jadwal.tanggalService
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.keterangan
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.status
            ?.toLowerCase()
            .includes(query)

          ||

          jadwal.tindakLanjut
            ?.toLowerCase()
            .includes(query)

        )

      }
    )

  })


/* =========================
   FORMAT TANGGAL
   ========================= */

const formatTanggal = (tanggal) => {

  if (!tanggal) {

    return '-'

  }

  const date =
    new Date(tanggal)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return tanggal

  }

  return date.toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  )

}


/* =========================
   NORMALIZE STATUS
   ========================= */

const normalizeStatus = (status) => {

  if (!status) {

    return 'Open'

  }

  const statusValid = [

    'Open',

    'On Progress',

    'Close',

    'Cancel'

  ]

  return statusValid.includes(status)
    ? status
    : 'Open'

}


/* =========================
   STATUS CLASS
   ========================= */

const getStatusClass = (status) => {

  const value =
    normalizeStatus(status)

  if (value === 'Open') {

    return 'status-pending'

  }

  if (value === 'On Progress') {

    return 'status-progress'

  }

  if (value === 'Close') {

    return 'status-success'

  }

  if (value === 'Cancel') {

    return 'status-cancel'

  }

  return 'status-default'

}


/* =========================
   UPDATE STATUS
   ========================= */

const ubahStatus = async (
  jadwal,
  event
) => {

  const statusBaru =
    event.target.value

  if (!statusBaru) {

    return

  }

  const statusLama =
    jadwal.status

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

    if (response.data?.status) {

      jadwal.status =
        response.data.status

    } else {

      jadwal.status =
        statusBaru

    }

  } catch (error) {

    jadwal.status =
      statusLama

    errorMsg.value =
      'Gagal mengubah status: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

  } finally {

    updatingId.value =
      null

  }

}


/* =========================
   DETAIL / EDIT
   ========================= */

const lihatDetail = (id) => {

  router.push(
    `/jadwal-service/edit/${id}`
  )

}


/* =========================
   GET DATA
   ========================= */

const ambilData = async () => {

  loading.value = true

  errorMsg.value = ''

  try {

    const response =
      await api.get(
        '/jadwal-service'
      )

    daftarJadwal.value =
      Array.isArray(response.data)

        ? response.data.map(
            (item) => ({

              ...item,

              status:
                normalizeStatus(
                  item.status
                ),

              tindakLanjut:
                item.tindakLanjut || ''

            })
          )

        : []

  } catch (error) {

    errorMsg.value =
      'Gagal mengambil data: ' +
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
   ON MOUNTED
   ========================= */

onMounted(() => {

  ambilData()

})

</script>


<style scoped>

/* =========================
   PAGE
   ========================= */

.page-container {
  width: 100%;
  max-width: none;

  /*
   * Content dibuat lebih lebar
   * dan lebih dekat dengan sidebar.
   */
  margin: 0;

  padding: 18px 18px;

  box-sizing: border-box;
}


/* =========================
   HEADER
   ========================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 18px;
}

.page-header h1 {
  margin: 0;

  font-size: 27px;
  font-weight: 700;

  color: #1e293b;
}

.page-header p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 14px;
}


/* =========================
   SEARCH
   ========================= */

.toolbar {
  margin-bottom: 18px;
}


/* =========================
   TABLE CARD
   ========================= */

.table-card {
  width: 100%;

  background: #ffffff;

  border-radius: 14px;

  overflow: hidden;

  box-shadow:
    0 4px 14px
    rgba(15, 23, 42, 0.06);
}


/* =========================
   TABLE WRAPPER
   ========================= */

.table-wrapper {
  width: 100%;

  overflow: hidden;
}


/* =========================
   TABLE
   ========================= */

table {
  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;
}


/* =========================
   TABLE HEADER
   ========================= */

thead {
  background: #eaf4ff;
}

th {
  padding: 15px 10px;

  text-align: left;

  font-size: 12px;

  font-weight: 700;

  color: #1d4f8f;

  border-bottom:
    1px solid #d7e9fb;

  vertical-align: middle;

  overflow-wrap: anywhere;
}


/* =========================
   TABLE BODY
   ========================= */

td {
  padding: 17px 10px;

  font-size: 13px;

  color: #334155;

  border-bottom:
    1px solid #edf2f7;

  vertical-align: middle;

  overflow-wrap: anywhere;

  word-break: break-word;

  box-sizing: border-box;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #f8fbff;
}


/* =========================
   STRONG
   ========================= */

.strong {
  font-weight: 700;

  color: #1e293b;
}


/* =========================
   DESCRIPTION
   ========================= */

.description {
  line-height: 1.5;
}


/* =========================
   DATE
   ========================= */

.date-text {
  white-space: nowrap;
}


/* =========================
   UID / DAERAH
   ========================= */

.daerah-info {
  display: flex;

  flex-direction: column;

  gap: 4px;
}

.uid {
  font-weight: 600;

  color: #334155;
}

.up3 {
  font-size: 11px;

  color: #64748b;
}


/* =========================
   STATUS
   ========================= */

.status-cell {
  position: relative;

  overflow: visible;
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

  padding: 7px 9px;

  border:
    1px solid currentColor;

  border-radius: 18px;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  outline: none;

  appearance: auto;
}


/* =========================
   OPEN
   ========================= */

.status-select.status-pending {
  background: #eaf3ff;

  color: #2563eb;

  border-color: #93c5fd;
}


/* =========================
   ON PROGRESS
   ========================= */

.status-select.status-progress {
  background: #fff8db;

  color: #ca8a04;

  border-color: #facc15;
}


/* =========================
   CLOSE
   ========================= */

.status-select.status-success {
  background: #e8f8e9;

  color: #16a34a;

  border-color: #22c55e;
}


/* =========================
   CANCEL
   ========================= */

.status-select.status-cancel {
  background: #fff0f0;

  color: #dc2626;

  border-color: #f87171;
}


/* =========================
   DEFAULT
   ========================= */

.status-select.status-default {
  background: #f1f5f9;

  color: #475569;

  border-color: #cbd5e1;
}


/* =========================
   FOCUS
   ========================= */

.status-select:focus {
  outline: none;

  box-shadow: none;
}


/* =========================
   DISABLED
   ========================= */

.status-select:disabled {
  opacity: 0.65;

  cursor: wait;
}


/* =========================
   STATUS BADGE
   ========================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 85px;

  min-height: 36px;

  padding: 0 12px;

  border-radius: 999px;

  font-size: 12px;

  font-weight: 600;

  line-height: 1.2;

  text-align: center;

  white-space: nowrap;

  box-sizing: border-box;
}


/* OPEN */

.status-badge.status-pending {
  background: #eaf3ff;

  color: #2563eb;

  border:
    1px solid #93c5fd;
}


/* ON PROGRESS */

.status-badge.status-progress {
  background: #fff8db;

  color: #ca8a04;

  border:
    1px solid #facc15;
}


/* CLOSE */

.status-badge.status-success {
  background: #e8f8e9;

  color: #16a34a;

  border:
    1px solid #22c55e;
}


/* CANCEL */

.status-badge.status-cancel {
  background: #fff0f0;

  color: #dc2626;

  border:
    1px solid #f87171;
}


/* DEFAULT */

.status-badge.status-default {
  background: #f1f5f9;

  color: #475569;

  border:
    1px solid #cbd5e1;
}


/* =========================
   UPDATING
   ========================= */

.updating-text {
  display: block;

  margin-top: 4px;

  font-size: 10px;

  color: #64748b;
}


/* =========================
   TINDAK LANJUT
   ========================= */

.tindak-lanjut-cell {
  vertical-align: middle;
}

.detail-wrapper {
  display: flex;

  align-items: center;
}


/* =========================
   DETAIL BUTTON
   ========================= */

.btn-detail {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 8px 13px;

  border: none;

  border-radius: 8px;

  background: #eaf3ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 11px;

  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;
}

.btn-detail:hover {
  background: #dbeafe;

  color: #1d4ed8;
}


/* =========================
   TINDAK LANJUT WRAPPER
   ========================= */

.tindak-lanjut-wrapper {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  width: 100%;
}


/* =========================
   TINDAK LANJUT TEXT
   ========================= */

.tindak-lanjut-text {
  flex: 1;

  min-width: 0;

  color: #475569;

  font-size: 12px;

  line-height: 1.5;

  overflow-wrap: anywhere;

  word-break: break-word;
}


/* =========================
   EDIT BUTTON
   ========================= */

.btn-edit {
  flex-shrink: 0;

  width: 30px;

  height: 30px;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  padding: 0;

  border:
    1px solid #bfdbfe;

  border-radius: 7px;

  background: #eff6ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 17px;

  line-height: 1;

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.btn-edit:hover {
  background: #dbeafe;

  color: #1d4ed8;

  transform: translateY(-1px);
}


/* =========================
   COLUMN WIDTH
   ========================= */

.col-id {
  width: 4%;
}

.col-kendaraan {
  width: 10%;
}

.col-nama {
  width: 13%;
}

.col-daerah {
  width: 11%;
}

.col-dealer {
  width: 9%;
}

.col-km {
  width: 5%;
}

.col-tanggal {
  width: 10%;
}

.col-keterangan {
  width: 14%;
}

.col-status {
  width: 11%;
}

.col-tindak-lanjut {
  width: 13%;
}


/* =========================
   LOADING
   ========================= */

.state-box {
  min-height: 250px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #64748b;
}

.spinner {
  width: 28px;

  height: 28px;

  border:
    3px solid #e2e8f0;

  border-top-color: #2563eb;

  border-radius: 50%;

  animation:
    spin 0.8s linear infinite;

  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================
   ERROR
   ========================= */

.error-box {
  padding: 14px 16px;

  border-radius: 10px;

  background: #fef2f2;

  border:
    1px solid #fecaca;

  color: #b91c1c;

  font-size: 14px;
}


/* =========================
   FOOTER
   ========================= */

.table-footer {
  padding: 13px 16px;

  border-top:
    1px solid #edf2f7;

  color: #64748b;

  font-size: 12px;
}

.table-footer strong {
  color: #1e293b;
}


/* =========================
   TABLET
   ========================= */

@media (max-width: 1100px) {

  .page-container {
    padding: 16px 12px;
  }

  th {
    padding: 12px 7px;

    font-size: 11px;
  }

  td {
    padding: 14px 7px;

    font-size: 11px;
  }

  .status-select {
    max-width: 105px;

    height: 35px;

    font-size: 10px;
  }

  .status-badge {
    min-width: 76px;

    min-height: 33px;

    font-size: 10px;
  }

  .tindak-lanjut-text {
    font-size: 10px;
  }

  .btn-edit {
    width: 27px;

    height: 27px;

    font-size: 16px;
  }
}


/* =========================
   MOBILE
   ========================= */

@media (max-width: 768px) {

  .page-container {
    padding: 14px;
  }

  .page-header {
    margin-bottom: 16px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .page-header p {
    font-size: 13px;
  }

  .toolbar {
    margin-bottom: 16px;
  }

  .table-wrapper {
    overflow: visible;
  }

  table,
  thead,
  tbody,
  tr,
  th,
  td {
    display: block;
  }

  thead {
    display: none;
  }

  tbody tr {
    padding: 15px;

    border-bottom:
      1px solid #e2e8f0;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  td {
    width: 100% !important;

    padding: 7px 0;

    border: none;

    display: grid;

    grid-template-columns:
      120px minmax(0, 1fr);

    gap: 10px;
  }


  /* MOBILE LABEL */

  td:nth-child(1)::before {
    content: 'ID';
  }

  td:nth-child(2)::before {
    content: 'No. Kendaraan';
  }

  td:nth-child(3)::before {
    content: 'Nama Driver';
  }

  td:nth-child(4)::before {
    content: 'UID / Daerah';
  }

  td:nth-child(5)::before {
    content: 'Dealer';
  }

  td:nth-child(6)::before {
    content: 'KM';
  }

  td:nth-child(7)::before {
    content: 'Tanggal Service';
  }

  td:nth-child(8)::before {
    content: 'Keterangan';
  }

  td:nth-child(9)::before {
    content: 'Status';
  }

  td:nth-child(10)::before {
    content: 'Tindak Lanjut';
  }

  td::before {
    font-size: 12px;

    font-weight: 600;

    color: #64748b;
  }

  .date-text {
    white-space: normal;
  }

  .status-select {
    width: 100%;

    max-width: 180px;

    height: 38px;

    font-size: 12px;

    padding: 0 12px;
  }

  .status-badge {
    min-width: 90px;

    min-height: 36px;
  }

  .tindak-lanjut-wrapper {
    align-items: flex-start;
  }

  .tindak-lanjut-text {
    font-size: 12px;

    line-height: 1.5;
  }

  .btn-detail {
    font-size: 11px;

    padding: 7px 13px;
  }

  .btn-edit {
    width: 30px;

    height: 30px;

    font-size: 17px;
  }

}

</style>