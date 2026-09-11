<template>
  <div class="keluhan-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Monitoring</p>

        <h1>Daftar Keluhan</h1>

        <p class="page-description">
          Monitoring dan tindak lanjut keluhan kendaraan
        </p>
      </div>

      <button
        v-if="isDriver"
        type="button"
        class="btn-primary"
        @click="router.push('/keluhan/tambah')"
      >
        Lapor Keluhan
      </button>
    </section>


    <!-- =========================
         STATISTICS (klik untuk filter status)
    ========================== -->
    <section class="stats-grid">

      <button
        type="button"
        class="stat-card"
        :class="{ 'stat-active': filterStatus === '' }"
        @click="filterStatus = ''"
      >
        <span class="stat-label">
          Total Keluhan
        </span>

        <strong class="stat-value">
          {{ totalKeluhan }}
        </strong>
      </button>


      <button
        type="button"
        class="stat-card stat-open"
        :class="{ 'stat-active': filterStatus === 'Open' }"
        @click="toggleFilterStatus('Open')"
      >
        <span class="stat-label">
          Open
        </span>

        <strong class="stat-value">
          {{ totalOpen }}
        </strong>
      </button>


      <button
        type="button"
        class="stat-card stat-progress"
        :class="{ 'stat-active': filterStatus === 'On Progress' }"
        @click="toggleFilterStatus('On Progress')"
      >
        <span class="stat-label">
          On Progress
        </span>

        <strong class="stat-value">
          {{ totalOnProgress }}
        </strong>
      </button>


      <button
        type="button"
        class="stat-card stat-close"
        :class="{ 'stat-active': filterStatus === 'Close' }"
        @click="toggleFilterStatus('Close')"
      >
        <span class="stat-label">
          Close
        </span>

        <strong class="stat-value">
          {{ totalClose }}
        </strong>
      </button>


      <button
        type="button"
        class="stat-card stat-cancel"
        :class="{ 'stat-active': filterStatus === 'Cancel' }"
        @click="toggleFilterStatus('Cancel')"
      >
        <span class="stat-label">
          Cancel
        </span>

        <strong class="stat-value">
          {{ totalCancel }}
        </strong>
      </button>

    </section>


    <!-- =========================
         SEARCH + FILTER + SORT
    ========================== -->
    <section class="toolbar">

      <div class="search-box">

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kendaraan, pengaju, UID, UP3, unit, status..."
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


      <!-- =========================
           FILTER UID
      ========================== -->
      <div class="filter-uid">

        <select v-model="filterUid" class="uid-select">

          <option value="">
            Semua UID
          </option>

          <option
            v-for="uid in daftarUidOptions"
            :key="uid"
            :value="uid"
          >
            {{ uid }}
          </option>

        </select>

      </div>


      <!-- =========================
           FILTER TANGGAL (RANGE)
      ========================== -->
      <div class="filter-tanggal">

        <select v-model="dateField" class="sort-select">
          <option value="tanggal">Tanggal Pengajuan</option>
          <option value="tanggalTindakLanjut">Tanggal Tindak Lanjut</option>
        </select>

        <div class="date-range">

          <input
            v-model="dateFrom"
            type="date"
            class="date-input"
            title="Dari tanggal"
          />

          <span class="date-separator">s/d</span>

          <input
            v-model="dateTo"
            type="date"
            class="date-input"
            title="Sampai tanggal"
          />

        </div>

        <select v-model="sortOrder" class="sort-select">
          <option value="terbaru">Terbaru &rarr; Terlama</option>
          <option value="terlama">Terlama &rarr; Terbaru</option>
        </select>

        <button
          v-if="filterUid || dateFrom || dateTo || filterStatus"
          type="button"
          class="clear-date"
          @click="resetFilter"
        >
          Reset Filter
        </button>

      </div>

    </section>


    <!-- =========================
         DATA SECTION
    ========================== -->
    <section class="data-section">

      <div class="section-header">

        <div>
          <h2>Data Keluhan</h2>

          <p>
            {{ filteredKeluhan.length }} data ditemukan

            <span v-if="filterStatus">
              &middot; Status: {{ filterStatus }}
            </span>
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
        v-else-if="filteredKeluhan.length === 0"
        class="state-card empty-state"
      >
        <h3>Tidak ada data keluhan</h3>

        <p v-if="searchQuery || filterUid || dateFrom || dateTo || filterStatus">
          Tidak ditemukan keluhan yang sesuai dengan pencarian / filter.
        </p>

        <p v-else>
          Belum terdapat data keluhan.
        </p>

        <button
          v-if="searchQuery || filterUid || dateFrom || dateTo || filterStatus"
          type="button"
          class="btn-secondary"
          @click="resetSemuaFilter"
        >
          Reset Semua Filter
        </button>
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
            <col class="col-kendaraan" />
            <col class="col-pengaduan" />
            <col class="col-foto" />
            <col class="col-tanggal" />
            <col class="col-tindak-tanggal" />
            <col class="col-pengaju" />
            <col class="col-status" />
            <col class="col-tindak-lanjut" />
          </colgroup>


          <thead>
            <tr>
              <th>Kendaraan</th>
              <th>Pengaduan</th>
              <th>Foto</th>
              <th>Tanggal Pengajuan</th>
              <th>Tanggal Tindak Lanjut</th>
              <th>Pengaju</th>
              <th>Status</th>
              <th>Tindak Lanjut</th>
            </tr>
          </thead>


          <tbody>

            <tr
              v-for="item in filteredKeluhan"
              :key="item.id"
              :class="getRowClass(item)"
            >

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
                   PENGADUAN
              ========================== -->
              <td>

                <div class="complaint-text">
                  {{ item.pengaduan || '-' }}
                </div>

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
                    alt="Foto keluhan"
                    class="photo-thumbnail"
                    @click="openPhoto(photo)"
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
                   TANGGAL PENGAJUAN
              ========================== -->
              <td>

                <div class="vehicle-cell">

                  <span class="date-text">
                    {{ formatTanggal(item.tanggal) }}
                  </span>


                  <!-- DEADLINE (berbasis tanggal pengajuan) -->
                  <span
                    v-if="getPengajuanDeadlineText(item)"
                    class="deadline-text"
                    :class="getPengajuanDeadlineClass(item)"
                  >
                    {{ getPengajuanDeadlineText(item) }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   TANGGAL TINDAK LANJUT
              ========================== -->
              <td>

                <span
                  v-if="item.tanggalTindakLanjut"
                  class="follow-date"
                  :class="{
                    'follow-date-overdue':
                      isDeadlineOverdue(item),

                    'follow-date-today':
                      isDeadlineToday(item),

                    'follow-date-upcoming':
                      isDeadlineUpcoming(item)
                  }"
                >
                  {{ formatTanggal(item.tanggalTindakLanjut) }}
                </span>


                <span
                  v-else
                  class="empty-text"
                >
                  Belum ditentukan
                </span>

              </td>


              <!-- =========================
                   PENGAJU
              ========================== -->
              <td>

                <div class="requester-cell">

                  <strong>
                    {{ getNamaPengaju(item) }}
                  </strong>

                  <span
                    v-if="getUid(item)"
                  >
                    UID: {{ getUid(item) }}
                  </span>

                  <span
                    v-if="getUp3(item)"
                  >
                    {{ getUp3(item) }}
                  </span>

                  <span
                    v-if="getUnit(item)"
                  >
                    {{ getUnit(item) }}
                  </span>

                </div>

              </td>


              <!-- =========================
                   STATUS
              ========================== -->
              <td>

                <select
                  v-if="canUpdateStatus"
                  v-model="item.status"
                  class="status-select"
                  :class="getStatusClass(item.status)"
                  @change="updateStatus(item)"
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


                <span
                  v-else
                  class="status-badge"
                  :class="getStatusClass(item.status)"
                >
                  {{ item.status || 'Open' }}
                </span>

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
                        ? 'Lihat detail keluhan'
                        : 'Isi detail keluhan'
                    "
                    :aria-label="
                      item.tindakLanjut
                        ? 'Lihat detail keluhan'
                        : 'Isi detail keluhan'
                    "
                    @click="
                      router.push(`/keluhan/edit/${item.id}`)
                    "
                  >
                    <svg
                      width="15"
                      height="15"
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
      v-if="selectedPhoto"
      class="photo-modal"
      @click.self="selectedPhoto = ''"
    >

      <div class="photo-modal-content">

        <button
          type="button"
          class="photo-close"
          @click="selectedPhoto = ''"
        >
          Tutup
        </button>

        <img
          :src="selectedPhoto"
          alt="Preview foto keluhan"
        />

      </div>

    </div>

  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()


/* =========================
   STATE
========================= */

const daftarKeluhan = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const selectedPhoto = ref('')


/* =========================
   FILTER & SORT
========================= */

const filterUid = ref('')
const filterStatus = ref('')
const dateField = ref('tanggal')
const dateFrom = ref('')
const dateTo = ref('')
const sortOrder = ref('terbaru')


const daftarUidOptions = [
  'UID LAMPUNG TAHAP 1',
  'UID LAMPUNG TAHAP 2',
  'UID BANTEN',
  'UIP JBT (TAHAP 1)',
  'UIP JBT (TAHAP 2)',
  'UID JATIM',
  'UIW NTB',
  'UID JATENG (TAHAP 1)',
  'UID JATENG (TAHAP 2)',
  'UID DIY (TAHAP 1)',
  'UID DIY (TAHAP 2)',
  'UIT JBT (TAHAP 1)',
  'PLN PUSAT (TAHAP 1)',
  'UID KALTIMRA',
  'PLN PUSAT (TAHAP 2)',
  'UID BALI (TAHAP 1)',
  'UIP JBTB',
  'UIW MMU',
  'UIP3B SUMATERA',
  'BANDA ACEH',
  'TANJUNG KARANG',
  'UIK DWIPANTARA',
  'UID KALSELTENG',
  'UID JABAR',
  'UIP3B SULAWESI',
  'MANADO',
  'PALU',
  'PLN PUSAT (TAHAP 3)',
  'PLN UID BALI (TAHAP II)'
]


/*
 * Klik kartu status:
 * - kalau status yang sama diklik lagi, filter dilepas
 *   (balik menampilkan semua status)
 * - kalau klik status lain, filter berpindah ke status itu
 */
const toggleFilterStatus = (status) => {

  filterStatus.value =
    filterStatus.value === status
      ? ''
      : status
}


const resetFilter = () => {
  filterUid.value = ''
  filterStatus.value = ''
  dateField.value = 'tanggal'
  dateFrom.value = ''
  dateTo.value = ''
  sortOrder.value = 'terbaru'
}


const resetSemuaFilter = () => {
  searchQuery.value = ''
  resetFilter()
}


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


const isDriver = computed(() =>
  role.value === 'driver'
)


const canUpdateStatus = computed(() =>
  isAdmin.value || isUid.value
)


/* =========================
   GET DATA
========================= */

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/keluhan')

    daftarKeluhan.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {
    console.error(error)

    errorMsg.value =
      error?.response?.data?.message ||
      'Terjadi kesalahan saat mengambil data keluhan.'

  } finally {
    loading.value = false
  }
}


/* =========================
   STATISTICS
========================= */

const totalKeluhan = computed(() =>
  daftarKeluhan.value.length
)


const totalOpen = computed(() =>
  daftarKeluhan.value.filter(
    item => normalizeStatus(item.status) === 'open'
  ).length
)


const totalOnProgress = computed(() =>
  daftarKeluhan.value.filter(
    item => normalizeStatus(item.status) === 'on progress'
  ).length
)


const totalClose = computed(() =>
  daftarKeluhan.value.filter(
    item => normalizeStatus(item.status) === 'close'
  ).length
)


const totalCancel = computed(() =>
  daftarKeluhan.value.filter(
    item => normalizeStatus(item.status) === 'cancel'
  ).length
)


/* =========================
   SEARCH + FILTER + SORT
========================= */

const filteredKeluhan = computed(() => {

  const keyword = searchQuery.value
    .trim()
    .toLowerCase()

  let hasil = daftarKeluhan.value


  /* SEARCH */
  if (keyword) {

    hasil = hasil.filter(item => {

      const searchableText = [
        item.nomorKendaraan,
        item.pengaduan,
        item.username,
        item.namaLengkap,
        item.namaPengaju,
        item.uid,
        item.up3,
        item.unit,
        item.status,
        item.tindakLanjut,
        item.tanggal,
        item.tanggalTindakLanjut
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
  }


  /* FILTER UID */
  if (filterUid.value) {

    hasil = hasil.filter(
      item => item.uid === filterUid.value
    )
  }


  /* FILTER STATUS (klik kartu statistik) */
  if (filterStatus.value) {

    hasil = hasil.filter(
      item =>
        normalizeStatus(item.status) ===
        normalizeStatus(filterStatus.value)
    )
  }


  /* FILTER RENTANG TANGGAL (dari / sampai), ala cek mutasi ATM */

  const field = dateField.value

  if (dateFrom.value || dateTo.value) {

    const batasAwal = dateFrom.value
      ? new Date(dateFrom.value + 'T00:00:00').getTime()
      : null

    const batasAkhir = dateTo.value
      ? new Date(dateTo.value + 'T23:59:59').getTime()
      : null

    hasil = hasil.filter(item => {

      if (!item[field]) {
        return false
      }

      const nilaiTanggal = new Date(item[field]).getTime()

      if (Number.isNaN(nilaiTanggal)) {
        return false
      }

      if (batasAwal !== null && nilaiTanggal < batasAwal) {
        return false
      }

      if (batasAkhir !== null && nilaiTanggal > batasAkhir) {
        return false
      }

      return true
    })
  }


  /* SORT berdasarkan field tanggal yang sama */

  hasil = [...hasil].sort((a, b) => {

    const nilaiA = a[field]
      ? new Date(a[field]).getTime()
      : 0

    const nilaiB = b[field]
      ? new Date(b[field]).getTime()
      : 0

    // data tanpa tanggal selalu ditaruh di paling bawah
    if (!nilaiA && !nilaiB) return 0
    if (!nilaiA) return 1
    if (!nilaiB) return -1

    return sortOrder.value === 'terbaru'
      ? nilaiB - nilaiA
      : nilaiA - nilaiB
  })


  return hasil
})


/* =========================
   UPDATE STATUS
========================= */

const updateStatus = async (item) => {

  if (!canUpdateStatus.value) {
    return
  }

  try {

    await api.put(`/keluhan/${item.id}`, {
      nomorKendaraan: item.nomorKendaraan,
      pengaduan: item.pengaduan,
      photoBase64: item.photoBase64,
      tanggal: item.tanggal,
      username: item.username,
      status: item.status
    })

    await ambilData()

  } catch (error) {

    console.error(error)

    alert(
      error?.response?.data?.message ||
      'Status keluhan gagal diperbarui.'
    )

    await ambilData()
  }
}


/* =========================
   STATUS
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
   REQUESTER
========================= */

const getNamaPengaju = (item) => {

  return (
    item.namaLengkap ||
    item.namaPengaju ||
    item.username ||
    '-'
  )
}


const getUid = (item) => {
  return item.uid || ''
}


const getUp3 = (item) => {
  return item.up3 || ''
}


const getUnit = (item) => {
  return item.unit || ''
}


/* =========================
   PHOTO
========================= */

const getPhotos = (item) => {

  const photos = []

  const addPhoto = (photo) => {

    if (!photo) {
      return
    }

    let value = photo


    if (typeof value === 'string') {

      value = value.trim()

      if (!value) {
        return
      }


      /* JSON */
      if (
        (value.startsWith('[') &&
          value.endsWith(']')) ||
        (value.startsWith('"') &&
          value.endsWith('"'))
      ) {

        try {

          const parsed = JSON.parse(value)

          if (Array.isArray(parsed)) {
            parsed.forEach(addPhoto)
            return
          }

          if (typeof parsed === 'string') {
            addPhoto(parsed)
            return
          }

        } catch {
          // lanjut
        }
      }


      /* DATA URI */
      if (value.startsWith('data:image/')) {
        photos.push(value)
        return
      }


      /* BASE64 */
      if (
        !value.startsWith('http://') &&
        !value.startsWith('https://') &&
        value.length > 100
      ) {

        photos.push(
          `data:image/jpeg;base64,${value}`
        )

        return
      }


      /* URL */
      if (
        value.startsWith('http://') ||
        value.startsWith('https://')
      ) {

        photos.push(value)
      }

      return
    }


    if (typeof value === 'object') {

      if (Array.isArray(value)) {
        value.forEach(addPhoto)
        return
      }


      if (value.base64) {
        addPhoto(value.base64)
        return
      }


      if (value.photoBase64) {
        addPhoto(value.photoBase64)
        return
      }


      if (value.url) {
        addPhoto(value.url)
      }
    }
  }


  if (item.fotoList) {
    addPhoto(item.fotoList)
  }


  if (item.photoBase64Json) {
    addPhoto(item.photoBase64Json)
  }


  if (item.photoBase64) {
    addPhoto(item.photoBase64)
  }


  return [...new Set(photos)]
}


const openPhoto = (photo) => {
  selectedPhoto.value = photo
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
   DEADLINE — TANGGAL TINDAK LANJUT

   Dipakai HANYA untuk mewarnai teks
   tanggal tindak lanjut itu sendiri
   (menandakan target follow-up yang
   dijanjikan admin sudah lewat / hari ini
   / masih akan datang).
========================= */

const getDeadlineDifference = (item) => {

  const status = normalizeStatus(item.status)


  /*
   * Close dan Cancel tidak perlu deadline
   */
  if (
    status === 'close' ||
    status === 'cancel'
  ) {
    return null
  }


  /*
   * Belum ada tanggal tindak lanjut
   */
  if (!item.tanggalTindakLanjut) {
    return null
  }


  const deadline = new Date(
    item.tanggalTindakLanjut
  )

  if (Number.isNaN(deadline.getTime())) {
    return null
  }


  const today = new Date()


  /*
   * Normalisasi jam supaya
   * perhitungan hanya berdasarkan tanggal.
   */
  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)


  const diffTime =
    deadline.getTime() - today.getTime()


  return Math.round(
    diffTime / (1000 * 60 * 60 * 24)
  )
}


const isDeadlineOverdue = (item) => {

  const difference =
    getDeadlineDifference(item)

  return (
    difference !== null &&
    difference < 0
  )
}


const isDeadlineToday = (item) => {

  const difference =
    getDeadlineDifference(item)

  return (
    difference !== null &&
    difference === 0
  )
}


const isDeadlineUpcoming = (item) => {

  const difference =
    getDeadlineDifference(item)

  return (
    difference !== null &&
    difference > 0
  )
}


/* =========================
   DEADLINE — TANGGAL PENGAJUAN

   Dipakai untuk badge SLA di kolom
   Tanggal Pengajuan: menandakan sudah
   berapa lama keluhan ini mengendap
   sejak dilaporkan, tanpa bergantung
   pada apakah tanggal tindak lanjut
   sudah diisi atau belum.

   Ambang batas mengikuti pola yang sama
   dengan halaman Jadwal Service.
========================= */

const getPengajuanDeadlineDifference = (item) => {

  const status = normalizeStatus(item.status)


  /*
   * Close dan Cancel tidak perlu SLA
   */
  if (
    status === 'close' ||
    status === 'cancel'
  ) {
    return null
  }


  if (!item.tanggal) {
    return null
  }


  const tanggalPengajuan = new Date(item.tanggal)

  if (Number.isNaN(tanggalPengajuan.getTime())) {
    return null
  }


  const today = new Date()

  today.setHours(0, 0, 0, 0)
  tanggalPengajuan.setHours(0, 0, 0, 0)


  const diffTime =
    today.getTime() - tanggalPengajuan.getTime()


  return Math.floor(
    diffTime / (1000 * 60 * 60 * 24)
  )
}


const getPengajuanDeadlineInfo = (item) => {

  const selisihHari =
    getPengajuanDeadlineDifference(item)


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


const getPengajuanDeadlineText = (item) => {
  return getPengajuanDeadlineInfo(item).text
}


const getPengajuanDeadlineClass = (item) => {
  return getPengajuanDeadlineInfo(item).class
}


/* =========================
   ROW STYLE
========================= */

const getRowClass = (item) => {

  const status =
    normalizeStatus(item.status)


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

.keluhan-page {
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
   STATISTICS (kini elemen <button>,
   klik untuk filter status)
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

  /* reset gaya default <button> */
  font-family: inherit;
  text-align: left;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}


.stat-card:hover {
  transform: translateY(-1px);

  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.08);
}


.stat-card:active {
  transform: translateY(0);
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
   STAT ACTIVE (kartu yang sedang
   dipilih sebagai filter status)
========================= */

.stat-active {
  border-color: #93c5fd;

  background: #f5f9ff;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.12),
    0 6px 16px rgba(15, 23, 42, 0.08);
}


.stat-open.stat-active {
  background: #eff6ff;
}


.stat-progress.stat-active {
  background: #fffaf0;

  box-shadow:
    0 0 0 3px rgba(245, 158, 11, 0.14),
    0 6px 16px rgba(15, 23, 42, 0.08);
}


.stat-close.stat-active {
  background: #f0fdf4;

  box-shadow:
    0 0 0 3px rgba(34, 197, 94, 0.14),
    0 6px 16px rgba(15, 23, 42, 0.08);
}


.stat-cancel.stat-active {
  background: #fef2f2;

  box-shadow:
    0 0 0 3px rgba(239, 68, 68, 0.14),
    0 6px 16px rgba(15, 23, 42, 0.08);
}


/* =========================
   TOOLBAR
========================= */

.toolbar {
  display: flex;
  flex-wrap: wrap;

  align-items: center;

  gap: 12px;

  margin-bottom: 24px;
}


.search-box {
  position: relative;

  flex: 1 1 320px;
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
   FILTER UID
========================= */

.filter-uid {
  flex: 0 0 auto;

  display: flex;
  gap: 10px;
}


.uid-select,
.sort-select {
  height: 48px;

  box-sizing: border-box;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: white;

  color: #1f2937;

  padding: 0 14px;

  font-size: 14px;

  outline: none;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.uid-select {
  min-width: 220px;
}


.sort-select {
  min-width: 170px;
}


.uid-select:focus,
.sort-select:focus {
  border-color: #93c5fd;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}


/* =========================
   FILTER TANGGAL (RANGE, CHIP)
========================= */

.filter-tanggal {
  flex: 1 1 auto;

  display: flex;
  flex-wrap: wrap;
  align-items: center;

  gap: 10px;

  padding: 6px 12px;

  border: 1px solid #e5eaf1;
  border-radius: 12px;

  background: #f8fafc;
}


.date-range {
  display: flex;
  align-items: center;

  gap: 8px;
}


.date-input {
  height: 48px;

  box-sizing: border-box;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: white;

  color: #1f2937;

  padding: 0 12px;

  font-size: 13px;

  outline: none;

  cursor: pointer;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


.date-input:focus {
  border-color: #93c5fd;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}


.date-separator {
  color: #94a3b8;

  font-size: 11px;
  font-weight: 700;

  text-transform: uppercase;
  letter-spacing: 0.04em;
}


.clear-date {
  height: 48px;

  padding: 0 16px;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: white;

  color: #64748b;

  font-size: 13px;
  font-weight: 650;

  cursor: pointer;

  white-space: nowrap;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}


.clear-date:hover {
  background: #fef2f2;

  border-color: #fecaca;

  color: #b91c1c;
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

  min-width: 1200px;

  border-collapse: collapse;

  table-layout: fixed;
}


/* =========================
   COLUMN
========================= */

.col-kendaraan {
  width: 12%;
}


.col-pengaduan {
  width: 16%;
}


.col-foto {
  width: 11%;
}


.col-tanggal {
  width: 11%;
}


.col-tindak-tanggal {
  width: 12%;
}


.col-pengaju {
  width: 15%;
}


.col-status {
  width: 11%;
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
   VEHICLE / TANGGAL PENGAJUAN
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
   COMPLAINT
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
  width: 30px;
  height: 30px;

  flex-shrink: 0;

  padding: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #bfdbfe;

  border-radius: 7px;

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

  width: 15px;
  height: 15px;
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

  .keluhan-page {
    padding: 28px 26px 40px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }


  .data-table {
    min-width: 1050px;
  }

}


@media (max-width: 768px) {

  .keluhan-page {
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


  .btn-primary {
    width: 100%;
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


  .toolbar {
    flex-direction: column;

    align-items: stretch;
  }


  .filter-uid,
  .filter-tanggal {
    flex-direction: column;

    align-items: stretch;
  }


  .filter-tanggal {
    padding: 12px;
  }


  .date-range {
    flex-direction: column;

    align-items: stretch;
  }


  .date-separator {
    text-align: center;
  }


  .uid-select,
  .sort-select,
  .date-input,
  .clear-date {
    width: 100%;
    min-width: 0;
  }


  .data-table {
    min-width: 1050px;
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