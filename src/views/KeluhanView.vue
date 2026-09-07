<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'
import { useToast } from '../composables/useToast'

const router = useRouter()
const { showToast } = useToast()

/* =========================
   DATA
========================= */

const daftarKeluhan = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

/* =========================
   FOTO MODAL
========================= */

const showFoto = ref(false)
const fotoDipilih = ref('')

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

const isDriver = computed(() => {
  return role.value === 'driver'
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

const filteredKeluhan = computed(() => {
  const q = searchQuery.value
    .trim()
    .toLowerCase()

  if (!q) {
    return daftarKeluhan.value
  }

  return daftarKeluhan.value.filter((keluhan) => {

    const nomorKendaraan =
      keluhan.nomorKendaraan?.toLowerCase() || ''

    const pengaduan =
      keluhan.pengaduan?.toLowerCase() || ''

    const username =
      keluhan.username?.toLowerCase() || ''

    const namaLengkap =
      keluhan.namaLengkap?.toLowerCase() || ''

    const uid =
      keluhan.uid?.toLowerCase() || ''

    const up3 =
      keluhan.up3?.toLowerCase() || ''

    const unit =
      keluhan.unit?.toLowerCase() || ''

    const status =
      keluhan.status?.toLowerCase() || ''

    return (
      nomorKendaraan.includes(q) ||
      pengaduan.includes(q) ||
      username.includes(q) ||
      namaLengkap.includes(q) ||
      uid.includes(q) ||
      up3.includes(q) ||
      unit.includes(q) ||
      status.includes(q)
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

  const tanggalKeluhan = new Date(tanggal)
  tanggalKeluhan.setHours(0, 0, 0, 0)

  if (Number.isNaN(tanggalKeluhan.getTime())) {
    return {
      class: '',
      text: ''
    }
  }

  const selisihMs =
    today.getTime() -
    tanggalKeluhan.getTime()

  const selisihHari = Math.floor(
    selisihMs /
      (1000 * 60 * 60 * 24)
  )

  /* Hari ini */
  if (selisihHari <= 0) {
    return {
      class: '',
      text: 'Hari ini'
    }
  }

  /* 1 - 3 hari */
  if (selisihHari <= 3) {
    return {
      class: '',
      text: `${selisihHari} hari`
    }
  }

  /* 4 - 5 hari */
  if (selisihHari <= 5) {
    return {
      class: 'deadline-warning',
      text: `${selisihHari} hari`
    }
  }

  /* Lebih dari 5 hari */
  return {
    class: 'deadline-danger',
    text: `Terlambat ${selisihHari - 5} hari`
  }
}

/* =========================
   PARSE FOTO
========================= */

const parsePhotos = (rawPhotos) => {

  if (!rawPhotos) {
    return []
  }

  let photoArray = []

  /* =========================
     ARRAY
  ========================= */

  if (Array.isArray(rawPhotos)) {

    photoArray = rawPhotos
  }

  /* =========================
     STRING
  ========================= */

  else if (typeof rawPhotos === 'string') {

    let strData = rawPhotos.trim()

    if (!strData) {
      return []
    }

    try {

      const parsed = JSON.parse(strData)

      /*
       * Contoh:
       * ["data:image/png;base64,..."]
       */
      if (Array.isArray(parsed)) {

        photoArray = parsed
      }

      /*
       * Kalau hasil parse masih string
       */
      else if (typeof parsed === 'string') {

        try {

          const parsedAgain =
            JSON.parse(parsed)

          photoArray =
            Array.isArray(parsedAgain)
              ? parsedAgain
              : [parsedAgain]

        } catch {

          photoArray = [parsed]
        }

      }

      else {

        photoArray = [parsed]
      }

    } catch {

      /*
       * Kalau bukan JSON,
       * cari data:image
       */
      if (strData.includes('data:image')) {

        photoArray =
          strData.split(
            /(?=data:image)/g
          )

      } else {

        /*
         * Anggap Base64 mentah.
         */
        photoArray = [strData]
      }
    }
  }

  /* =========================
     CLEANING
  ========================= */

  return photoArray

    .filter(photo => {
      return (
        typeof photo === 'string' &&
        photo.trim() !== ''
      )
    })

    .map(photo => {

      let cleanBase64 =
        photo.trim()

      /*
       * Bersihkan karakter tambahan.
       */
      cleanBase64 =
        cleanBase64
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/^\[+/g, '')
          .replace(/\]+$/g, '')
          .replace(/^"+|"+$/g, '')
          .replace(/^'+|'+$/g, '')
          .replace(/^,|,$/g, '')
          .trim()

      /*
       * Ambil mulai dari data:image
       */
      if (
        cleanBase64.includes('data:image')
      ) {

        const index =
          cleanBase64.indexOf(
            'data:image'
          )

        cleanBase64 =
          cleanBase64.substring(index)
      }

      /*
       * Sudah Data URI.
       */
      if (
        cleanBase64.startsWith(
          'data:image'
        )
      ) {

        return cleanBase64
      }

      /*
       * Base64 mentah.
       */
      if (cleanBase64.length > 30) {

        return (
          'data:image/png;base64,' +
          cleanBase64
        )
      }

      return null
    })

    .filter(Boolean)
}

/* =========================
   AMBIL FOTO DARI KELUHAN
========================= */

const getPhotos = (keluhan) => {

  if (!keluhan) {
    return []
  }

  const rawPhotos =
    keluhan.photoBase64Json ??
    keluhan.photo_base64_json ??
    keluhan.photoBase64 ??
    keluhan.photo_base64 ??
    keluhan.fotoList ??
    keluhan.foto_list

  return parsePhotos(rawPhotos)
}

/* =========================
   AMBIL DATA
========================= */

const ambilData = async () => {

  loading.value = true
  errorMsg.value = ''

  try {

    const response =
      await api.get('/keluhan')

    console.log(
      'DATA KELUHAN:',
      response.data
    )

    daftarKeluhan.value =
      Array.isArray(response.data)
        ? response.data
        : []

  } catch (error) {

    console.error(
      'Error ambil keluhan:',
      error
    )

    errorMsg.value =
      'Gagal mengambil data keluhan: ' +
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
   TAMBAH KELUHAN
========================= */

const tambahKeluhan = () => {
  router.push('/keluhan/tambah')
}

/* =========================
   UPDATE STATUS
========================= */

const updateStatus = async (
  keluhan,
  statusBaru
) => {

  if (!canManageStatus.value) {
    return
  }

  const statusLama =
    getActualStatus(
      keluhan.status
    )

  if (statusBaru === statusLama) {
    return
  }

  updatingId.value =
    keluhan.id

  errorMsg.value = ''

  try {

    await api.put(
      `/keluhan/${keluhan.id}`,
      {
        nomorKendaraan:
          keluhan.nomorKendaraan,

        pengaduan:
          keluhan.pengaduan,

        photoBase64:
          keluhan.photoBase64,

        tanggal:
          keluhan.tanggal,

        username:
          keluhan.username,

        status:
          statusBaru
      }
    )

    keluhan.status =
      statusBaru

    showToast(
      'Status keluhan berhasil diperbarui!'
    )

  } catch (error) {

    console.error(
      'Error update status:',
      error
    )

    errorMsg.value =
      'Gagal memperbarui status keluhan: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

    keluhan.status =
      statusLama

  } finally {

    updatingId.value = null
  }
}

/* =========================
   FOTO
========================= */

const lihatFoto = (foto) => {

  if (!foto) {
    return
  }

  fotoDipilih.value = foto
  showFoto.value = true
}

const tutupFoto = () => {

  showFoto.value = false
  fotoDipilih.value = ''
}

/* =========================
   INIT
========================= */

onMounted(() => {
  ambilData()
})
</script>


<template>

  <div class="keluhan-page">

    <!-- =========================
         HEADER
    ========================= -->

    <div class="header-row">

      <div>

        <h2>
          Daftar Keluhan
        </h2>

        <p class="subtitle">
          Data keluhan kendaraan
        </p>

      </div>

      <!-- KHUSUS DRIVER -->

      <button
        v-if="isDriver"
        class="btn-primary"
        @click="tambahKeluhan"
      >
        + Lapor Keluhan
      </button>

    </div>


    <!-- =========================
         SEARCH
    ========================= -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari kendaraan, pengaju, UID, UP3, keluhan, status..."
    />


    <!-- =========================
         LOADING
    ========================= -->

    <p
      v-if="loading"
      class="loading-text"
    >
      Loading data keluhan...
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
        filteredKeluhan.length === 0
      "
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data keluhan'
      "
      :subtext="
        searchQuery
          ? 'Coba gunakan kata kunci lain'
          : isDriver
            ? 'Klik tombol Lapor Keluhan untuk membuat laporan'
            : 'Belum ada keluhan yang tersedia'
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

          <col class="col-pengaduan">

          <col class="col-foto">

          <col class="col-tanggal">

          <col class="col-pengaju">

          <col class="col-status">

        </colgroup>


        <thead>

          <tr>

            <th>
              ID
            </th>

            <th>
              Nomor Kendaraan
            </th>

            <th>
              Pengaduan
            </th>

            <th>
              Foto
            </th>

            <th>
              Tanggal
            </th>

            <th>
              Pengaju
            </th>

            <th>
              Status
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="keluhan in filteredKeluhan"
            :key="keluhan.id"
            :class="{
              'row-deadline-danger':
                getDeadlineInfo(
                  keluhan.tanggal,
                  keluhan.status
                ).class === 'deadline-danger',

              'row-deadline-warning':
                getDeadlineInfo(
                  keluhan.tanggal,
                  keluhan.status
                ).class === 'deadline-warning'
            }"
          >

            <!-- =========================
                 ID
            ========================= -->

            <td>
              {{ keluhan.id }}
            </td>


            <!-- =========================
                 NOMOR KENDARAAN
            ========================= -->

            <td>

              <strong>
                {{
                  keluhan.nomorKendaraan ||
                  '-'
                }}
              </strong>

            </td>


            <!-- =========================
                 PENGADUAN
            ========================= -->

            <td class="pengaduan-cell">

              {{
                keluhan.pengaduan ||
                '-'
              }}

            </td>


            <!-- =========================
                 FOTO
            ========================= -->

            <td class="foto-cell">

              <div
                v-if="
                  getPhotos(keluhan).length > 0
                "
                class="photo-wrapper"
              >

                <button
                  v-for="(
                    photo,
                    index
                  ) in getPhotos(keluhan)"
                  :key="index"
                  type="button"
                  class="photo-button"
                  @click="
                    lihatFoto(photo)
                  "
                  :title="
                    `Lihat foto ${index + 1}`
                  "
                >

                  <img
                    :src="photo"
                    :alt="
                      `Foto keluhan ${
                        index + 1
                      }`
                    "
                    class="keluhan-photo"
                  />

                </button>

              </div>


              <span
                v-else
                class="no-photo"
              >
                Tidak ada
              </span>

            </td>


            <!-- =========================
                 TANGGAL
            ========================= -->

            <td class="tanggal-cell">

              <div
                :class="[
                  'tanggal-wrapper',

                  getDeadlineInfo(
                    keluhan.tanggal,
                    keluhan.status
                  ).class
                ]"
              >

                <strong>
                  {{
                    formatTanggal(
                      keluhan.tanggal
                    )
                  }}
                </strong>


                <span
                  v-if="
                    getDeadlineInfo(
                      keluhan.tanggal,
                      keluhan.status
                    ).text
                  "
                  class="deadline-label"
                  :class="
                    getDeadlineInfo(
                      keluhan.tanggal,
                      keluhan.status
                    ).class
                  "
                >

                  {{
                    getDeadlineInfo(
                      keluhan.tanggal,
                      keluhan.status
                    ).text
                  }}

                </span>

              </div>

            </td>


            <!-- =========================
                 PENGAJU
            ========================= -->

            <td class="pengaju-cell">

              <div class="pengaju-wrapper">

                <!-- NAMA LENGKAP -->

                <strong class="pengaju-nama">

                  {{
                    keluhan.namaLengkap ||
                    keluhan.username ||
                    '-'
                  }}

                </strong>


                <!-- USERNAME -->

                <span
                  v-if="keluhan.username"
                  class="pengaju-username"
                >

                  {{ keluhan.username }}

                </span>


                <!-- UID + UP3 -->

                <span
                  v-if="
                    keluhan.uid ||
                    keluhan.up3
                  "
                  class="pengaju-wilayah"
                >

                  {{ keluhan.uid || '-' }}

                  <span
                    v-if="
                      keluhan.uid &&
                      keluhan.up3
                    "
                  >
                    •
                  </span>

                  {{ keluhan.up3 || '-' }}

                </span>


                <!-- UNIT -->

                <span
                  v-if="keluhan.unit"
                  class="pengaju-unit"
                >

                  {{ keluhan.unit }}

                </span>

              </div>

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
                    keluhan.status
                  )
                "
                :disabled="
                  updatingId ===
                  keluhan.id
                "
                @change="
                  updateStatus(
                    keluhan,
                    $event.target.value
                  )
                "
                :style="
                  getStatusStyle(
                    keluhan.status
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


              <!-- DRIVER -->

              <span
                v-else
                class="status-badge"
                :style="
                  getStatusStyle(
                    keluhan.status
                  )
                "
              >

                <span
                  class="status-dot"
                ></span>

                {{
                  getActualStatus(
                    keluhan.status
                  )
                }}

              </span>

            </td>

          </tr>

        </tbody>

      </table>

    </div>


    <!-- =========================
         PHOTO MODAL
    ========================= -->

    <div
      v-if="showFoto"
      class="foto-modal"
      @click.self="tutupFoto"
    >

      <div class="foto-modal-content">

        <button
          type="button"
          class="foto-close"
          @click="tutupFoto"
          title="Tutup"
        >
          ×
        </button>

        <img
          v-if="fotoDipilih"
          :src="fotoDipilih"
          alt="Foto keluhan"
          class="foto-large"
        />

      </div>

    </div>

  </div>

</template>


<style scoped>

/* =========================
   PAGE
========================= */

.keluhan-page {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
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
  overflow: hidden;
  margin-top: 15px;
}


/* =========================
   TABLE
========================= */

table {
  width: 100%;
  max-width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
}


/* =========================
   COLUMN WIDTH
========================= */

.col-id {
  width: 5%;
}

.col-kendaraan {
  width: 13%;
}

.col-pengaduan {
  width: 27%;
}

.col-foto {
  width: 8%;
}

.col-tanggal {
  width: 14%;
}

.col-pengaju {
  width: 19%;
}

.col-status {
  width: 14%;
}


/* =========================
   HEADER
========================= */

th {
  padding: 12px 10px;
  background: #eaf4ff;
  color: #2b7cd3;
  border-bottom: 1px solid #dbeafe;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  word-break: break-word;
  overflow-wrap: anywhere;
}


/* =========================
   BODY
========================= */

td {
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  vertical-align: middle;
  font-size: 13px;
  color: #4b5563;
  word-break: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
  box-sizing: border-box;
}

tbody tr:hover td {
  background: #f9fbfd;
}


/* =========================
   DEADLINE
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
   PENGADUAN
========================= */

.pengaduan-cell {
  line-height: 1.45;
  white-space: normal;
}


/* =========================
   PENGAJU
========================= */

.pengaju-cell {
  vertical-align: middle;
}

.pengaju-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.pengaju-nama {
  color: #1f2937;
  font-size: 12px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pengaju-username {
  color: #6b7280;
  font-size: 10px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pengaju-wilayah {
  color: #2b7cd3;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pengaju-unit {
  color: #6b7280;
  font-size: 10px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}


/* =========================
   TANGGAL
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

.tanggal-wrapper:not(
  .deadline-warning
):not(
  .deadline-danger
) {
  color: #384454;
}

.tanggal-wrapper.deadline-warning {
  color: #d68a00;
}

.deadline-label.deadline-warning {
  background-color: #fff3cd;
  color: #d68910;
}

.tanggal-wrapper.deadline-danger {
  color: #e74c3c;
}

.deadline-label.deadline-danger {
  background-color: #fdecea;
  color: #e74c3c;
}


/* =========================
   FOTO
========================= */

.foto-cell {
  text-align: center;
}

.photo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.photo-button {
  display: block;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #f8fafc;
  overflow: hidden;
  cursor: pointer;
  box-sizing: border-box;
}

.photo-button:hover {
  border-color: #2563eb;
  transform: scale(1.05);
}

.keluhan-photo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  color: #9ca3af;
  font-size: 11px;
}


/* =========================
   STATUS
========================= */

.status-cell {
  padding-left: 8px;
  padding-right: 8px;
  overflow: hidden;
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
  max-width: 100%;
  box-sizing: border-box;
  padding: 6px 8px;
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
   BUTTON
========================= */

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 9px 14px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.2s,
    transform 0.1s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-primary:active {
  transform: scale(0.98);
}


/* =========================
   PHOTO MODAL
========================= */

.foto-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.foto-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.foto-large {
  display: block;
  max-width: 90vw;
  max-height: 85vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  background: white;
}

.foto-close {
  position: absolute;
  top: -40px;
  right: 0;
  border: none;
  background: transparent;
  color: white;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
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

  .keluhan-photo {
    width: 42px;
    height: 42px;
  }

  .status-select,
  .status-badge {
    font-size: 10px;
  }

  .pengaju-nama {
    font-size: 11px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
    font-size: 9px;
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

  .btn-primary {
    width: 100%;
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
    padding: 5px 3px;
    font-size: 9px;
  }

  .status-badge {
    padding: 5px 3px;
    font-size: 9px;
  }

  .status-dot {
    display: none;
  }

  .keluhan-photo {
    width: 38px;
    height: 38px;
  }

  .deadline-label {
    font-size: 9px;
    padding: 2px 5px;
  }

  .pengaju-nama {
    font-size: 10px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
    font-size: 8px;
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

  .keluhan-photo {
    width: 32px;
    height: 32px;
  }

  .status-select {
    padding: 4px 2px;
    font-size: 8px;
  }

  .status-badge {
    padding: 4px 2px;
    font-size: 8px;
  }

  .pengaju-nama {
    font-size: 9px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
    font-size: 7px;
  }

}

</style>