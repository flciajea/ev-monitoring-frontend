<template>
  <div class="ganti-sparepart-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Monitoring</p>

        <h1>Daftar Ganti Sparepart</h1>

        <p class="page-description">
          Monitoring penggantian sparepart fast moving kendaraan
        </p>
      </div>
    </section>


    <!-- =========================
         STATISTICS
    ========================== -->
    <section class="stats-grid">

      <div class="stat-card">
        <span class="stat-label">
          Total Sparepart
        </span>

        <strong class="stat-value">
          {{ totalData }}
        </strong>
      </div>


      <div class="stat-card stat-open">
        <span class="stat-label">
          Open
        </span>

        <strong class="stat-value">
          {{ jumlahStatus('Open') }}
        </strong>
      </div>


      <div class="stat-card stat-progress">
        <span class="stat-label">
          On Progress
        </span>

        <strong class="stat-value">
          {{ jumlahStatus('On Progress') }}
        </strong>
      </div>


      <div class="stat-card stat-close">
        <span class="stat-label">
          Close
        </span>

        <strong class="stat-value">
          {{ jumlahStatus('Close') }}
        </strong>
      </div>


      <div class="stat-card stat-cancel">
        <span class="stat-label">
          Cancel
        </span>

        <strong class="stat-value">
          {{ jumlahStatus('Cancel') }}
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
          placeholder="Cari kendaraan, sparepart, pengaju, UID, UP3, unit, status..."
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
          <h2>Data Ganti Sparepart</h2>

          <p>
            {{ filteredData.length }} data ditemukan
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
        v-else-if="filteredData.length === 0"
        class="state-card empty-state"
      >
        <h3>Tidak ada data ganti sparepart</h3>

        <p v-if="searchQuery">
          Tidak ditemukan data yang sesuai dengan pencarian.
        </p>

        <p v-else>
          Belum ada data penggantian sparepart.
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
            <col class="col-sparepart" />
            <col class="col-biaya" />
            <col class="col-tanggal" />
            <col class="col-tindak-tanggal" />
            <col class="col-foto" />
            <col class="col-status" />
            <col class="col-keterangan" />
            <col class="col-pengaju" />
            <col class="col-tindak-lanjut" />
          </colgroup>


          <thead>
            <tr>
              <th>ID</th>
              <th>Kendaraan</th>
              <th>Sparepart</th>
              <th>Biaya</th>
              <th>Rencana</th>
              <th>Tanggal Tindak Lanjut</th>
              <th>Foto</th>
              <th>Status</th>
              <th>Keterangan</th>
              <th>Pengaju</th>
              <th>Tindak Lanjut</th>
            </tr>
          </thead>


          <tbody>

            <tr
              v-for="item in filteredData"
              :key="item.id"
              :class="getRowClass(item)"
            >

              <!-- =========================
                   ID
              ========================== -->
              <td>

                <span class="id-number">
                  #{{ item.id }}
                </span>

              </td>


              <!-- =========================
                   KENDARAAN
              ========================== -->
              <td>

                <div class="vehicle-cell">

                  <span class="vehicle-number">
                    {{ item.nomorKendaraan || '-' }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   SPAREPART
              ========================== -->
              <td>

                <div class="complaint-text">
                  {{ item.sparepart || '-' }}
                </div>

              </td>


              <!-- =========================
                   BIAYA
              ========================== -->
              <td>

                <span class="date-text">
                  {{ formatRupiah(item.biaya) }}
                </span>

              </td>


              <!-- =========================
                   RENCANA
              ========================== -->
              <td>

                <div
                  v-if="item.tanggal"
                  class="vehicle-cell"
                >

                  <span class="date-text">
                    {{ formatTanggal(item.tanggal) }}
                  </span>

                  <span
                    v-if="getStatusTanggal(item.tanggal, item.status).text"
                    class="deadline-text"
                    :class="getStatusTanggal(item.tanggal, item.status).class"
                  >
                    {{ getStatusTanggal(item.tanggal, item.status).text }}
                  </span>

                </div>

                <span
                  v-else
                  class="empty-text"
                >
                  Belum ditentukan
                </span>

              </td>


              <!-- =========================
                   TANGGAL TINDAK LANJUT
              ========================== -->
              <td>

                <span
                  v-if="item.tanggalTindakLanjut"
                  class="follow-date"
                >
                  {{ formatTanggal(item.tanggalTindakLanjut) }}
                </span>

                <span
                  v-else
                  class="empty-text"
                >
                  Belum ada
                </span>

              </td>


              <!-- =========================
                   FOTO
              ========================== -->
              <td>

                <div
                  v-if="getPhotos(item).length > 0"
                  class="photo-list"
                >

                  <img
                    v-for="(photo, index) in getPhotos(item).slice(0, 3)"
                    :key="index"
                    :src="photo"
                    alt="Foto bukti sparepart"
                    class="photo-thumbnail"
                    @click="bukaFoto(photo)"
                  />

                  <span
                    v-if="getPhotos(item).length > 3"
                    class="photo-more"
                  >
                    +{{ getPhotos(item).length - 3 }}
                  </span>

                </div>


                <span
                  v-else
                  class="no-photo"
                >
                  Tidak ada foto
                </span>

              </td>


              <!-- =========================
                   STATUS
              ========================== -->
              <td>

                <select
                  v-if="canManage"
                  :value="item.status || 'Open'"
                  class="status-select"
                  :class="getStatusClass(item.status)"
                  @change="ubahStatus(item, $event.target.value)"
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
                  :class="getStatusClass(item.status)"
                >
                  {{ item.status || 'Open' }}
                </span>

              </td>


              <!-- =========================
                   KETERANGAN
              ========================== -->
              <td>

                <div class="complaint-text">
                  {{ item.keterangan || '-' }}
                </div>

              </td>


              <!-- =========================
                   PENGAJU
              ========================== -->
              <td>

                <div class="requester-cell">

                  <strong>
                    {{ item.namaLengkap || item.username || '-' }}
                  </strong>

                  <span v-if="item.uid">
                    UID: {{ item.uid }}
                  </span>

                  <span v-if="item.up3">
                    {{ item.up3 }}
                  </span>

                  <span v-if="item.unit">
                    {{ item.unit }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   TINDAK LANJUT
              ========================== -->
              <td>

                <div class="follow-up-cell">

                  <p
                    v-if="item.tindakLanjut"
                    class="follow-up-text"
                  >
                    {{ item.tindakLanjut }}
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
                      item.tindakLanjut
                        ? 'Lihat detail sparepart'
                        : 'Isi detail sparepart'
                    "
                    :aria-label="
                      item.tindakLanjut
                        ? 'Lihat detail sparepart'
                        : 'Isi detail sparepart'
                    "
                    @click="lihatDetail(item.id)"
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


    <!-- =========================
         PHOTO MODAL
    ========================== -->
    <div
      v-if="fotoDipilih"
      class="photo-modal"
      @click.self="tutupFoto"
    >

      <div class="photo-modal-content">

        <button
          type="button"
          class="photo-close"
          @click="tutupFoto"
        >
          Tutup
        </button>

        <img
          :src="fotoDipilih"
          alt="Preview foto sparepart"
        />

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

import {
  useToast
} from '../composables/useToast'


/* =========================
   TOAST
========================= */

const {
  showToast
} = useToast()


/* =========================
   ROUTER
========================= */

const router = useRouter()


/* =========================
   STATE
========================= */

const daftarData = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const fotoDipilih = ref('')


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


const canManage = computed(() =>
  isAdmin.value || isUid.value
)


/* =========================
   STATISTICS
========================= */

const totalData = computed(() =>
  daftarData.value.length
)


const jumlahStatus = (status) => {

  return daftarData.value.filter(
    item => (item.status || 'Open') === status
  ).length
}


/* =========================
   STATUS CLASS
========================= */

const normalizeStatus = (status) => {

  return String(status || 'Open')
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
   FOTO MODAL
========================= */

const bukaFoto = (foto) => {

  if (!foto) {
    return
  }

  fotoDipilih.value = foto
}


const tutupFoto = () => {
  fotoDipilih.value = ''
}


/* =========================
   PARSE FOTO
========================= */

const parsePhotos = (rawPhotos) => {

  if (!rawPhotos) {
    return []
  }

  let photoArray = []

  if (Array.isArray(rawPhotos)) {

    photoArray = rawPhotos

  } else if (typeof rawPhotos === 'string') {

    const strData = rawPhotos.trim()

    if (!strData) {
      return []
    }

    try {

      const parsed = JSON.parse(strData)

      if (Array.isArray(parsed)) {

        photoArray = parsed

      } else if (typeof parsed === 'string') {

        try {

          const parsedAgain = JSON.parse(parsed)

          if (Array.isArray(parsedAgain)) {

            photoArray = parsedAgain

          } else {

            photoArray = [parsedAgain]
          }

        } catch {

          photoArray = [parsed]
        }

      } else {

        photoArray = [parsed]
      }

    } catch {

      if (strData.includes('data:image')) {

        photoArray = strData.split(/(?=data:image)/g)

      } else {

        photoArray = [strData]
      }
    }
  }

  return photoArray
    .filter(
      photo =>
        typeof photo === 'string' &&
        photo.trim() !== ''
    )
    .map(photo => {

      let cleanBase64 = photo.trim()

      cleanBase64 = cleanBase64
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/^\[+/g, '')
        .replace(/\]+$/g, '')
        .replace(/^"+|"+$/g, '')
        .replace(/^'+|'+$/g, '')
        .replace(/^,|,$/g, '')
        .trim()

      if (cleanBase64.includes('data:image')) {

        const index = cleanBase64.indexOf('data:image')

        cleanBase64 = cleanBase64.substring(index)
      }

      if (cleanBase64.startsWith('data:image')) {

        return cleanBase64
      }

      if (cleanBase64.length > 30) {

        return 'data:image/png;base64,' + cleanBase64
      }

      return null
    })
    .filter(Boolean)
}


/* =========================
   GET FOTO
========================= */

const getPhotos = (item) => {

  if (!item) {
    return []
  }

  const rawPhotos =
    item.photoBase64Json ??
    item.photo_base64_json ??
    item.fotoList ??
    item.foto_list ??
    item.photoBase64 ??
    item.photo_base64

  return parsePhotos(rawPhotos)
}


/* =========================
   SEARCH
========================= */

const filteredData = computed(() => {

  const keyword = searchQuery.value
    .trim()
    .toLowerCase()

  if (!keyword) {
    return daftarData.value
  }

  return daftarData.value.filter(item => {

    const searchableText = [
      item.id,
      item.nomorKendaraan,
      item.sparepart,
      item.username,
      item.namaLengkap,
      item.uid,
      item.up3,
      item.unit,
      item.keterangan,
      item.tindakLanjut,
      item.status
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
   DETAIL
========================= */

const lihatDetail = (id) => {
  router.push(`/ganti-sparepart/edit/${id}`)
}


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
    month: 'short',
    year: 'numeric'
  })
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

  const nilai = Number(angka)

  if (Number.isNaN(nilai)) {
    return '-'
  }

  return 'Rp ' + nilai.toLocaleString('id-ID')
}


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

    console.error('ERROR GANTI SPAREPART:', error)

    errorMsg.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Terjadi kesalahan saat mengambil data ganti sparepart.'

  } finally {

    loading.value = false
  }
}


/* =========================
   UBAH STATUS
========================= */

const ubahStatus = async (item, statusBaru) => {

  if (!canManage.value) {
    return
  }

  const statusLama = item.status || 'Open'

  if (statusBaru === statusLama) {
    return
  }

  try {

    await api.put(
      `/ganti-sparepart/${item.id}`,
      { status: statusBaru }
    )

    item.status = statusBaru

    showToast(`Status berhasil diubah menjadi ${statusBaru}`)

  } catch (error) {

    console.error('Gagal mengubah status:', error)

    item.status = statusLama

    alert(
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Status ganti sparepart gagal diperbarui.'
    )
  }
}


/* =========================
   DEADLINE
========================= */

const getStatusTanggal = (tanggal, status) => {

  if (
    status === 'Close' ||
    status === 'Cancel'
  ) {
    return { class: '', text: '' }
  }

  if (!tanggal) {
    return { class: '', text: '' }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(tanggal)
  target.setHours(0, 0, 0, 0)

  if (Number.isNaN(target.getTime())) {
    return { class: '', text: '' }
  }

  const selisihMs = target.getTime() - today.getTime()

  const selisihHari = Math.ceil(
    selisihMs / (1000 * 60 * 60 * 24)
  )


  if (selisihHari === 0) {
    return { class: 'deadline-warning', text: 'Hari ini' }
  }


  if (selisihHari > 0 && selisihHari <= 3) {
    return { class: 'deadline-normal', text: `${selisihHari} hari` }
  }


  if (selisihHari >= 4 && selisihHari <= 5) {
    return { class: 'deadline-warning', text: `${selisihHari} hari` }
  }


  if (selisihHari < 0) {

    const terlambat = Math.abs(selisihHari)

    return { class: 'deadline-danger', text: `Terlambat ${terlambat} hari` }
  }


  return { class: 'deadline-normal', text: `${selisihHari} hari` }
}


/* =========================
   ROW STYLE
========================= */

const getRowClass = (item) => {

  const status = normalizeStatus(item.status)


  if (status === 'close') {
    return 'row-close'
  }


  if (status === 'cancel') {
    return 'row-cancel'
  }


  if (status === 'on progress') {
    return 'row-progress'
  }


  const deadline = getStatusTanggal(item.tanggal, item.status)

  if (deadline.class === 'deadline-danger') {
    return 'row-danger'
  }

  if (deadline.class === 'deadline-warning') {
    return 'row-warning'
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

.ganti-sparepart-page {
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

  min-width: 1350px;

  border-collapse: collapse;

  table-layout: fixed;
}


/* =========================
   COLUMN
========================= */

.col-id {
  width: 5%;
}

.col-kendaraan {
  width: 10%;
}

.col-sparepart {
  width: 11%;
}

.col-biaya {
  width: 8%;
}

.col-tanggal {
  width: 10%;
}

.col-tindak-tanggal {
  width: 10%;
}

.col-foto {
  width: 8%;
}

.col-status {
  width: 9%;
}

.col-keterangan {
  width: 12%;
}

.col-pengaju {
  width: 12%;
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


.data-table tbody tr.row-warning {
  background: #fffdf5;
}


.data-table tbody tr.row-danger {
  background: #fff8f8;
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
   VEHICLE / RENCANA
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
   SPAREPART / KETERANGAN
========================= */

.complaint-text {
  color: #334155;

  line-height: 1.55;

  white-space: normal;
}


/* =========================
   PHOTO
========================= */

.photo-list {
  display: flex;
  align-items: center;

  gap: 5px;

  flex-wrap: wrap;
}


.photo-thumbnail {
  width: 42px;
  height: 42px;

  border-radius: 7px;

  object-fit: cover;

  border: 1px solid #e2e8f0;

  cursor: pointer;

  transition: transform 0.15s ease;
}


.photo-thumbnail:hover {
  transform: scale(1.05);
}


.photo-more {
  min-width: 25px;
  height: 25px;

  padding: 0 5px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 5px;

  background: #f1f5f9;

  color: #475569;

  font-size: 10px;
  font-weight: 700;
}


.no-photo {
  color: #94a3b8;

  font-size: 12px;
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


.empty-text {
  color: #94a3b8;

  font-size: 12px;
}


/* =========================
   REQUESTER
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
   PHOTO MODAL
========================= */

.photo-modal {
  position: fixed;

  inset: 0;

  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 30px;

  background: rgba(15, 23, 42, 0.7);
}


.photo-modal-content {
  position: relative;

  max-width: min(900px, 90vw);
  max-height: 90vh;

  padding: 14px;

  border-radius: 12px;

  background: white;

  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25);
}


.photo-modal-content img {
  display: block;

  max-width: 100%;
  max-height: 80vh;

  border-radius: 7px;

  object-fit: contain;
}


.photo-close {
  display: block;

  margin-left: auto;
  margin-bottom: 10px;

  border: none;

  background: transparent;

  color: #475569;

  font-size: 12px;
  font-weight: 650;

  cursor: pointer;
}


.photo-close:hover {
  color: #2563eb;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1200px) {

  .ganti-sparepart-page {
    padding: 28px 26px 40px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

}


@media (max-width: 768px) {

  .ganti-sparepart-page {
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