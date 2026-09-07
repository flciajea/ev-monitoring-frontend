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
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>Memuat data jadwal service...</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="errorMsg" class="error-box">
      {{ errorMsg }}
    </div>

    <!-- EMPTY -->
    <EmptyState
      v-else-if="filteredJadwal.length === 0"
      title="Tidak ada jadwal service"
      description="Belum ada data jadwal service yang tersedia."
    />

    <!-- TABLE -->
    <div v-else class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-kendaraan">No. Kendaraan</th>
              <th class="col-nama">Nama Driver</th>
              <th class="col-daerah">UID / Daerah</th>
              <th class="col-dealer">Dealer</th>
              <th class="col-km">KM</th>
              <th class="col-tanggal">Tanggal Service</th>
              <th class="col-keterangan">Keterangan</th>
              <th class="col-tindak-lanjut">Tindak Lanjut</th>
              <th class="col-status">Status</th>
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

              <!-- TINDAK LANJUT -->
              <td class="tindak-lanjut-cell">

                <!-- ADMIN -->
                <div
                  v-if="role === 'admin'"
                  class="tindak-lanjut-form"
                >
                  <textarea
                    v-model="jadwal.tindakLanjut"
                    class="tindak-lanjut-input"
                    placeholder="Tulis tindak lanjut..."
                    rows="2"
                  ></textarea>

                  <button
                    type="button"
                    class="btn-simpan-tindak-lanjut"
                    :disabled="savingTindakLanjutId === jadwal.id"
                    @click="simpanTindakLanjut(jadwal)"
                  >
                    {{
                      savingTindakLanjutId === jadwal.id
                        ? 'Menyimpan...'
                        : 'Simpan'
                    }}
                  </button>
                </div>

                <!-- UID -->
                <div
                  v-else
                  class="tindak-lanjut-text"
                >
                  {{ jadwal.tindakLanjut || '-' }}
                </div>

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

                <!-- DRIVER -->
                <span
                  v-else
                  class="status-badge"
                  :class="getStatusClass(jadwal.status)"
                >
                  {{ normalizeStatus(jadwal.status) }}
                </span>

                <span
                  v-if="updatingId === jadwal.id"
                  class="updating-text"
                >
                  Menyimpan...
                </span>

              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- FOOTER -->
      <div class="table-footer">
        Menampilkan
        <strong>{{ filteredJadwal.length }}</strong>
        jadwal service
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'


/* =========================
   DATA
   ========================= */

const daftarJadwal = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const updatingId = ref(null)
const savingTindakLanjutId = ref(null)


/* =========================
   USER / ROLE
   ========================= */

const user = ref(null)

try {
  const storedUser = localStorage.getItem('user')

  if (storedUser) {
    user.value = JSON.parse(storedUser)
  }
} catch (error) {
  user.value = null
}

const role = computed(() => {
  return user.value?.role?.toLowerCase() || ''
})


/*
 * Admin dan UID boleh mengubah status.
 */
const canEditStatus = computed(() => {
  return (
    role.value === 'admin' ||
    role.value === 'uid'
  )
})


/* =========================
   SEARCH
   ========================= */

const filteredJadwal = computed(() => {
  const query = searchQuery.value
    .trim()
    .toLowerCase()

  if (!query) {
    return daftarJadwal.value
  }

  return daftarJadwal.value.filter((jadwal) => {
    return (
      String(jadwal.id ?? '')
        .toLowerCase()
        .includes(query) ||

      jadwal.nomorKendaraan
        ?.toLowerCase()
        .includes(query) ||

      jadwal.namaLengkap
        ?.toLowerCase()
        .includes(query) ||

      jadwal.username
        ?.toLowerCase()
        .includes(query) ||

      jadwal.uid
        ?.toLowerCase()
        .includes(query) ||

      jadwal.up3
        ?.toLowerCase()
        .includes(query) ||

      jadwal.unit
        ?.toLowerCase()
        .includes(query) ||

      jadwal.dealer
        ?.toLowerCase()
        .includes(query) ||

      String(jadwal.km ?? '')
        .toLowerCase()
        .includes(query) ||

      jadwal.tanggalService
        ?.toLowerCase()
        .includes(query) ||

      jadwal.keterangan
        ?.toLowerCase()
        .includes(query) ||

      jadwal.tindakLanjut
        ?.toLowerCase()
        .includes(query) ||

      jadwal.status
        ?.toLowerCase()
        .includes(query)
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
   STATUS
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


/*
 * WARNA STATUS
 *
 * Open        = Biru
 * On Progress = Kuning
 * Close       = Hijau
 * Cancel      = Merah
 */
const getStatusClass = (status) => {
  const value = normalizeStatus(status)

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

const ubahStatus = async (jadwal, event) => {
  const statusBaru = event.target.value

  if (!statusBaru) {
    return
  }

  const statusLama = jadwal.status

  updatingId.value = jadwal.id

  try {
    const response = await api.put(
      `/jadwal-service/${jadwal.id}`,
      {
        status: statusBaru
      }
    )

    if (response.data?.status) {
      jadwal.status = response.data.status
    } else {
      jadwal.status = statusBaru
    }

  } catch (error) {

    jadwal.status = statusLama

    errorMsg.value =
      'Gagal mengubah status: ' +
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
   UPDATE TINDAK LANJUT
   ========================= */

const simpanTindakLanjut = async (jadwal) => {

  savingTindakLanjutId.value = jadwal.id
  errorMsg.value = ''

  try {

    const response = await api.put(
      `/jadwal-service/${jadwal.id}`,
      {
        tindakLanjut: jadwal.tindakLanjut || ''
      }
    )

    if (response.data?.tindakLanjut !== undefined) {
      jadwal.tindakLanjut = response.data.tindakLanjut
    }

  } catch (error) {

    errorMsg.value =
      'Gagal menyimpan tindak lanjut: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

  } finally {

    savingTindakLanjutId.value = null

  }
}


/* =========================
   GET DATA
   ========================= */

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get(
      '/jadwal-service'
    )

    daftarJadwal.value =
      Array.isArray(response.data)
        ? response.data.map((item) => ({
            ...item,
            status: normalizeStatus(item.status),
            tindakLanjut: item.tindakLanjut || ''
          }))
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  box-sizing: border-box;
}


/* =========================
   HEADER
   ========================= */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
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
  margin-bottom: 22px;
}


/* =========================
   TABLE CARD
   ========================= */

.table-card {
  width: 100%;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.table-wrapper {
  width: 100%;
  overflow: hidden;
}

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
  border-bottom: 1px solid #d7e9fb;
  vertical-align: middle;
}


/* =========================
   TABLE BODY
   ========================= */

td {
  padding: 17px 10px;
  font-size: 13px;
  color: #334155;
  border-bottom: 1px solid #edf2f7;
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

.strong {
  font-weight: 700;
  color: #1e293b;
}

.description {
  line-height: 1.5;
}

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
   TINDAK LANJUT
   ========================= */

.tindak-lanjut-cell {
  vertical-align: top;
}

.tindak-lanjut-form {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.tindak-lanjut-input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  padding: 8px 9px;

  border: 1px solid #cbd5e1;
  border-radius: 8px;

  background: #ffffff;
  color: #334155;

  font-family: inherit;
  font-size: 11px;
  line-height: 1.4;

  resize: vertical;

  outline: none;
}

.tindak-lanjut-input::placeholder {
  color: #94a3b8;
}

.tindak-lanjut-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.08);
}

.btn-simpan-tindak-lanjut {
  align-self: flex-start;

  padding: 6px 12px;

  border: none;
  border-radius: 7px;

  background: #2563eb;
  color: #ffffff;

  font-size: 11px;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;
}

.btn-simpan-tindak-lanjut:hover {
  background: #1d4ed8;
}

.btn-simpan-tindak-lanjut:disabled {
  opacity: 0.65;
  cursor: wait;
}

.tindak-lanjut-text {
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}


/* =========================
   STATUS CELL
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
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;

  padding: 6px 22px 6px 8px;

  border: 1px solid currentColor;
  border-radius: 18px;

  font-size: 11px;
  font-weight: 600;

  cursor: pointer;
  outline: none;

  appearance: auto;
}


/* =========================
   OPEN - BIRU
   ========================= */

.status-select.status-pending {
  background: #eaf3ff;
  color: #2563eb;
  border: 1px solid #93c5fd;
}


/* =========================
   ON PROGRESS - KUNING
   ========================= */

.status-select.status-progress {
  background: #fff8db;
  color: #ca8a04;
  border: 1px solid #facc15;
}


/* =========================
   CLOSE - HIJAU
   ========================= */

.status-select.status-success {
  background: #e8f8e9;
  color: #16a34a;
  border: 1px solid #22c55e;
}


/* =========================
   CANCEL - MERAH
   ========================= */

.status-select.status-cancel {
  background: #fff0f0;
  color: #dc2626;
  border: 1px solid #f87171;
}


/* =========================
   DEFAULT
   ========================= */

.status-select.status-default {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}


/* =========================
   SELECT FOCUS
   ========================= */

.status-select:focus {
  outline: none;
  box-shadow: none;
}


/* =========================
   SELECT DISABLED
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

  min-width: 90px;
  min-height: 38px;

  padding: 0 14px;

  border-radius: 999px;

  font-size: 13px;
  font-weight: 600;

  line-height: 1.2;

  text-align: center;

  white-space: nowrap;

  box-sizing: border-box;
}


/* OPEN - BIRU */

.status-badge.status-pending {
  background: #eaf3ff;
  color: #2563eb;
  border: 1px solid #93c5fd;
}


/* ON PROGRESS - KUNING */

.status-badge.status-progress {
  background: #fff8db;
  color: #ca8a04;
  border: 1px solid #facc15;
}


/* CLOSE - HIJAU */

.status-badge.status-success {
  background: #e8f8e9;
  color: #16a34a;
  border: 1px solid #22c55e;
}


/* CANCEL - MERAH */

.status-badge.status-cancel {
  background: #fff0f0;
  color: #dc2626;
  border: 1px solid #f87171;
}


/* DEFAULT */

.status-badge.status-default {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}


/* =========================
   UPDATING
   ========================= */

.updating-text {
  display: block;

  margin-top: 5px;

  font-size: 10px;
  color: #64748b;
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
  width: 12%;
}

.col-dealer {
  width: 10%;
}

.col-km {
  width: 5%;
}

.col-tanggal {
  width: 10%;
}

.col-keterangan {
  width: 13%;
}

.col-tindak-lanjut {
  width: 11%;
}

.col-status {
  width: 12%;
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

  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;

  border-radius: 50%;

  animation: spin 0.8s linear infinite;

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

  border: 1px solid #fecaca;

  color: #b91c1c;

  font-size: 14px;
}


/* =========================
   FOOTER
   ========================= */

.table-footer {
  padding: 13px 16px;

  border-top: 1px solid #edf2f7;

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
    padding: 18px;
  }

  th {
    padding: 12px 7px;
    font-size: 11px;
  }

  td {
    padding: 13px 7px;
    font-size: 11px;
  }

  .status-select {
    width: 100%;
    max-width: 100px;

    height: 36px;

    font-size: 10px;

    padding: 0 24px 0 9px;
  }

  .status-badge {
    min-width: 78px;
    min-height: 34px;

    font-size: 11px;
  }

  .tindak-lanjut-input {
    font-size: 10px;
  }

  .btn-simpan-tindak-lanjut {
    font-size: 10px;
    padding: 5px 10px;
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

    border-bottom: 1px solid #e2e8f0;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  td {
    width: 100% !important;

    padding: 7px 0;

    border: none;

    display: grid;

    grid-template-columns: 120px minmax(0, 1fr);

    gap: 10px;
  }

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
    content: 'Tindak Lanjut';
  }

  td:nth-child(10)::before {
    content: 'Status';
  }

  td::before {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .date-text {
    white-space: normal;
  }

  .tindak-lanjut-cell {
    width: 100% !important;
  }

  .tindak-lanjut-form {
    width: 100%;
  }

  .tindak-lanjut-input {
    width: 100%;
    font-size: 12px;
  }

  .btn-simpan-tindak-lanjut {
    font-size: 11px;
    padding: 6px 12px;
  }

  .tindak-lanjut-text {
    font-size: 12px;
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
}

</style>