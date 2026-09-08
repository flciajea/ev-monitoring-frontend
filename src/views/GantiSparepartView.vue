<template>
  <div class="ganti-sparepart-page">

    <!-- HEADER -->
    <div class="header-row">
      <div>
        <h2>Ganti Sparepart Fast Moving</h2>
        <p>Monitoring penggantian sparepart kendaraan</p>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="search-container">
      <SearchInput
        v-model="searchQuery"
        placeholder="Cari kendaraan, sparepart, pengaju, UID, UP3..."
      />
    </div>

    <!-- ERROR -->
    <div v-if="errorMsg" class="error-message">
      {{ errorMsg }}
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat data...</p>
    </div>

    <!-- EMPTY -->
    <EmptyState
      v-else-if="filteredData.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan.'
          : 'Tidak ada data ganti sparepart.'
      "
    />

    <!-- TABLE -->
    <div v-else class="table-wrapper">
      <table class="data-table">

        <colgroup>
          <col class="col-id">
          <col class="col-kendaraan">
          <col class="col-sparepart">
          <col class="col-biaya">
          <col class="col-tanggal">
          <col class="col-tanggal-tindak-lanjut">
          <col class="col-foto">
          <col class="col-status">
          <col class="col-keterangan">
          <col class="col-pengaju">
          <col class="col-tindak-lanjut">
        </colgroup>

        <thead>
          <tr>
            <th>ID</th>
            <th>Nomor Kendaraan</th>
            <th>Sparepart</th>
            <th>Biaya</th>
            <th>Rencana Tanggal</th>
            <th>
              Tanggal<br>
              Tindak Lanjut
            </th>
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

            <!-- ID -->
            <td>
              {{ item.id }}
            </td>

            <!-- NOMOR KENDARAAN -->
            <td class="vehicle-cell">
              {{ item.nomorKendaraan || '-' }}
            </td>

            <!-- SPAREPART -->
            <td>
              {{ item.sparepart || '-' }}
            </td>

            <!-- BIAYA -->
            <td>
              {{ formatRupiah(item.biaya) }}
            </td>

            <!-- RENCANA TANGGAL -->
            <td>
              <div
                v-if="item.tanggal"
                class="tanggal-wrapper"
              >
                <span class="tanggal-text">
                  {{ formatTanggal(item.tanggal) }}
                </span>

                <span
                  v-if="
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).text
                  "
                  :class="[
                    'deadline-text',
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).class
                  ]"
                >
                  {{
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).text
                  }}
                </span>
              </div>

              <span v-else>
                -
              </span>
            </td>

            <!-- TANGGAL TINDAK LANJUT -->
            <td class="tanggal-tindak-lanjut-cell">
              <span
                v-if="item.tanggalTindakLanjut"
                class="tanggal-tindak-lanjut"
              >
                {{ formatTanggal(item.tanggalTindakLanjut) }}
              </span>

              <span
                v-else
                class="no-tanggal-tindak-lanjut"
              >
                Belum ada
              </span>
            </td>

            <!-- FOTO -->
            <td class="foto-cell">
              <div
                v-if="getPhotos(item).length > 0"
                class="photo-preview-list"
              >
                <button
                  v-for="(photo, index) in getPhotos(item)"
                  :key="index"
                  type="button"
                  class="photo-button"
                  @click="bukaFoto(photo)"
                  :title="`Lihat foto ${index + 1}`"
                >
                  <img
                    :src="photo"
                    :alt="`Foto bukti sparepart ${index + 1}`"
                    class="photo-thumbnail"
                  />
                </button>
              </div>

              <span
                v-else
                class="no-photo"
              >
                Tidak ada foto
              </span>
            </td>

            <!-- STATUS -->
            <td class="status-cell">

              <select
                v-if="canManage"
                :value="item.status || 'Open'"
                class="status-select"
                :style="getStatusStyle(item.status || 'Open')"
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

              <span
                v-else
                class="status-badge"
                :style="getStatusStyle(item.status || 'Open')"
              >
                {{ item.status || 'Open' }}
              </span>

            </td>

            <!-- KETERANGAN -->
            <td class="keterangan-cell">
              {{ item.keterangan || '-' }}
            </td>

            <!-- PENGAJU -->
            <td class="pengaju-cell">
              <div class="pengaju-wrapper">

                <strong class="pengaju-nama">
                  {{
                    item.namaLengkap ||
                    item.username ||
                    '-'
                  }}
                </strong>

                <span
                  v-if="item.username"
                  class="pengaju-username"
                >
                  {{ item.username }}
                </span>

                <span
                  v-if="item.uid || item.up3"
                  class="pengaju-wilayah"
                >
                  {{ item.uid || '-' }}

                  <span
                    v-if="item.uid && item.up3"
                  >
                    •
                  </span>

                  {{ item.up3 || '-' }}
                </span>

                <span
                  v-if="item.unit"
                  class="pengaju-unit"
                >
                  {{ item.unit }}
                </span>

              </div>
            </td>

            <!-- TINDAK LANJUT -->
            <td class="tindak-lanjut-cell">

              <div
                v-if="item.tindakLanjut"
                class="tindak-lanjut-wrapper"
              >
                <span class="tindak-lanjut-text">
                  {{ item.tindakLanjut }}
                </span>

                <button
                  v-if="isAdmin"
                  type="button"
                  class="btn-detail"
                  @click="lihatDetail(item.id)"
                  title="Edit tindak lanjut"
                >
                  ✎
                </button>
              </div>

              <div
                v-else
                class="tindak-lanjut-empty"
              >
                <button
                  v-if="isAdmin"
                  type="button"
                  class="btn-detail"
                  @click="lihatDetail(item.id)"
                >
                  Detail
                </button>

                <span
                  v-else
                  class="belum-ada"
                >
                  Belum ada
                </span>
              </div>

            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <!-- MODAL FOTO -->
    <div
      v-if="showFotoModal"
      class="photo-modal"
      @click.self="tutupFoto"
    >
      <div class="photo-modal-content">

        <button
          type="button"
          class="photo-close"
          @click="tutupFoto"
          aria-label="Tutup foto"
        >
          ×
        </button>

        <img
          v-if="fotoDipilih"
          :src="fotoDipilih"
          alt="Foto bukti sparepart"
          class="photo-full"
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

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

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
  const userData =
    localStorage.getItem('user')

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
})


/* =========================
   ROLE
   ========================= */

const role = computed(() => {
  return (
    currentUser.value?.role
      ?.toLowerCase() || ''
  )
})


/* =========================
   CAN MANAGE
   ========================= */

const canManage = computed(() => {
  return [
    'admin',
    'uid'
  ].includes(role.value)
})


/* =========================
   IS ADMIN
   ========================= */

const isAdmin = computed(() => {
  return role.value === 'admin'
})


/* =========================
   MODAL FOTO
   ========================= */

const showFotoModal = ref(false)
const fotoDipilih = ref('')


const bukaFoto = (foto) => {
  if (!foto) {
    return
  }

  fotoDipilih.value = foto
  showFotoModal.value = true
}


const tutupFoto = () => {
  showFotoModal.value = false
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
  }

  else if (
    typeof rawPhotos === 'string'
  ) {

    const strData =
      rawPhotos.trim()

    if (!strData) {
      return []
    }

    try {

      const parsed =
        JSON.parse(strData)

      if (Array.isArray(parsed)) {

        photoArray = parsed

      }

      else if (
        typeof parsed === 'string'
      ) {

        try {

          const parsedAgain =
            JSON.parse(parsed)

          if (
            Array.isArray(
              parsedAgain
            )
          ) {

            photoArray =
              parsedAgain

          } else {

            photoArray =
              [parsedAgain]
          }

        } catch {

          photoArray = [parsed]
        }

      }

      else {

        photoArray = [parsed]
      }

    } catch {

      if (
        strData.includes(
          'data:image'
        )
      ) {

        photoArray =
          strData.split(
            /(?=data:image)/g
          )

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

      let cleanBase64 =
        photo.trim()

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

      if (
        cleanBase64.includes(
          'data:image'
        )
      ) {

        const index =
          cleanBase64.indexOf(
            'data:image'
          )

        cleanBase64 =
          cleanBase64.substring(index)
      }

      if (
        cleanBase64.startsWith(
          'data:image'
        )
      ) {

        return cleanBase64
      }

      if (
        cleanBase64.length > 30
      ) {

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

  const query =
    searchQuery.value
      .trim()
      .toLowerCase()

  if (!query) {
    return daftarData.value
  }

  return daftarData.value.filter(item => {

    const nomorKendaraan =
      item.nomorKendaraan
        ?.toLowerCase() || ''

    const sparepart =
      item.sparepart
        ?.toLowerCase() || ''

    const username =
      item.username
        ?.toLowerCase() || ''

    const namaLengkap =
      item.namaLengkap
        ?.toLowerCase() || ''

    const uid =
      item.uid
        ?.toLowerCase() || ''

    const up3 =
      item.up3
        ?.toLowerCase() || ''

    const unit =
      item.unit
        ?.toLowerCase() || ''

    const keterangan =
      item.keterangan
        ?.toLowerCase() || ''

    const tindakLanjut =
      item.tindakLanjut
        ?.toLowerCase() || ''

    const status =
      item.status
        ?.toLowerCase() || ''

    return (
      nomorKendaraan.includes(query) ||
      sparepart.includes(query) ||
      username.includes(query) ||
      namaLengkap.includes(query) ||
      uid.includes(query) ||
      up3.includes(query) ||
      unit.includes(query) ||
      keterangan.includes(query) ||
      tindakLanjut.includes(query) ||
      status.includes(query)
    )
  })
})


/* =========================
   DETAIL
   ========================= */

const lihatDetail = (id) => {
  router.push(
    `/ganti-sparepart/edit/${id}`
  )
}


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
   AMBIL DATA
   ========================= */

const ambilData = async () => {

  loading.value = true
  errorMsg.value = ''

  try {

    const response =
      await api.get(
        '/ganti-sparepart'
      )

    daftarData.value =
      Array.isArray(
        response.data
      )
        ? response.data
        : []

  } catch (error) {

    console.error(
      'ERROR GANTI SPAREPART:',
      error
    )

    errorMsg.value =
      'Gagal ambil data: ' +
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
   UBAH STATUS
   ========================= */

const ubahStatus = async (
  item,
  statusBaru
) => {

  if (!canManage.value) {
    return
  }

  const statusLama =
    item.status || 'Open'

  if (
    statusBaru === statusLama
  ) {
    return
  }

  try {

    await api.put(
      `/ganti-sparepart/${item.id}`,
      {
        status: statusBaru
      }
    )

    item.status = statusBaru

    showToast(
      `Status berhasil diubah menjadi ${statusBaru}`
    )

  } catch (error) {

    console.error(
      'Gagal mengubah status:',
      error
    )

    errorMsg.value =
      'Gagal mengubah status: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

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

  return (
    styles[status] || {
      backgroundColor: '#f1f5f9',
      color: '#64748b'
    }
  )
}


/* =========================
   DEADLINE
   ========================= */

const getStatusTanggal = (
  tanggal,
  status
) => {

  /*
   * Close dan Cancel
   * tidak menampilkan deadline.
   */

  if (
    status === 'Close' ||
    status === 'Cancel'
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

  const target =
    new Date(tanggal)

  target.setHours(
    0,
    0,
    0,
    0
  )

  if (
    Number.isNaN(
      target.getTime()
    )
  ) {

    return {
      class: '',
      text: ''
    }
  }

  const selisihMs =
    target.getTime() -
    today.getTime()

  const selisihHari =
    Math.ceil(
      selisihMs /
      (
        1000 *
        60 *
        60 *
        24
      )
    )


  /* =========================
     HARI INI
     ========================= */

  if (
    selisihHari === 0
  ) {

    return {
      class: '',
      text: 'Hari ini'
    }
  }


  /* =========================
     H-1 SAMPAI H-3
     ========================= */

  if (
    selisihHari > 0 &&
    selisihHari <= 3
  ) {

    return {
      class: '',
      text: `${selisihHari} hari`
    }
  }


  /* =========================
     H-4 SAMPAI H-5
     ========================= */

  if (
    selisihHari >= 4 &&
    selisihHari <= 5
  ) {

    return {
      class: 'deadline-warning',
      text: `${selisihHari} hari`
    }
  }


  /* =========================
     TERLAMBAT
     ========================= */

  if (
    selisihHari < 0
  ) {

    const terlambat =
      Math.abs(selisihHari)

    return {
      class: 'deadline-danger',
      text: `Terlambat ${terlambat} hari`
    }
  }


  /* =========================
     LEBIH DARI 5 HARI
     ========================= */

  return {
    class: '',
    text: `${selisihHari} hari`
  }
}


/* =========================
   ROW CLASS
   ========================= */

const getRowClass = (item) => {

  const deadline =
    getStatusTanggal(
      item.tanggal,
      item.status
    )

  if (
    deadline.class ===
    'deadline-danger'
  ) {

    return 'row-danger'
  }

  if (
    deadline.class ===
    'deadline-warning'
  ) {

    return 'row-warning'
  }

  return ''
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

  const nilai =
    Number(angka)

  if (
    Number.isNaN(nilai)
  ) {
    return '-'
  }

  return (
    'Rp ' +
    nilai.toLocaleString(
      'id-ID'
    )
  )
}


/* =========================
   MOUNTED
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
  box-sizing: border-box;
}


/* =========================
   HEADER
   ========================= */

.header-row {
  margin-bottom: 18px;
}

.header-row h2 {
  margin: 0;
  color: #123d70;
  font-size: 24px;
  font-weight: 700;
}

.header-row p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}


/* =========================
   SEARCH
   ========================= */

.search-container {
  max-width: 480px;
  margin-bottom: 18px;
}


/* =========================
   ERROR
   ========================= */

.error-message {
  margin-bottom: 14px;
  padding: 10px 13px;
  border-radius: 8px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 13px;
}


/* =========================
   LOADING
   ========================= */

.loading-container {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  margin-bottom: 9px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


/* =========================
   TABLE WRAPPER
   ========================= */

.table-wrapper {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border-radius: 10px;
  background: #ffffff;
  box-shadow:
    0 2px 10px
    rgba(15, 23, 42, 0.06);
}


/* =========================
   TABLE
   ========================= */

.data-table {
  width: max-content;
  min-width: 1250px;
  border-collapse: collapse;
}


/* =========================
   COLUMN WIDTH
   ========================= */

.col-id {
  width: 55px;
}

.col-kendaraan {
  width: 125px;
}

.col-sparepart {
  width: 140px;
}

.col-biaya {
  width: 110px;
}

.col-tanggal {
  width: 125px;
}

.col-tanggal-tindak-lanjut {
  width: 125px;
}

.col-foto {
  width: 100px;
}

.col-status {
  width: 125px;
}

.col-keterangan {
  width: 180px;
}

.col-pengaju {
  width: 180px;
}

.col-tindak-lanjut {
  width: 250px;
}


/* =========================
   HEADER
   ========================= */

.data-table th {
  padding: 11px 10px;
  background: #eaf4ff;
  color: #2b7cd3;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  vertical-align: middle;
  white-space: normal;
  overflow-wrap: anywhere;
}


/* =========================
   BODY
   ========================= */

.data-table td {
  padding: 11px 10px;
  border-top: 1px solid #edf2f7;
  color: #334155;
  font-size: 13px;
  vertical-align: middle;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-sizing: border-box;
}

.data-table tbody tr {
  transition:
    background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background: #eef6ff;
}


/* =========================
   DEADLINE ROW
   ========================= */

.data-table tbody tr.row-warning {
  background: #fffbeb;
}

.data-table tbody tr.row-warning:hover {
  background: #fff4d6;
}

.data-table tbody tr.row-danger {
  background: #fff5f5;
}

.data-table tbody tr.row-danger:hover {
  background: #ffe8e8;
}


/* =========================
   VEHICLE
   ========================= */

.vehicle-cell {
  font-weight: 600;
  color: #1e293b;
}


/* =========================
   KETERANGAN
   ========================= */

.keterangan-cell {
  line-height: 1.45;
}


/* =========================
   TANGGAL
   ========================= */

.tanggal-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tanggal-text {
  display: block;
  overflow-wrap: anywhere;
}

.deadline-text {
  display: block;
  font-size: 10px;
  font-weight: 700;
}

.deadline-warning {
  color: #d97706 !important;
}

.deadline-danger {
  color: #dc2626 !important;
}


/* =========================
   TANGGAL TINDAK LANJUT
   ========================= */

.tanggal-tindak-lanjut-cell {
  min-width: 125px;
}

.tanggal-tindak-lanjut {
  display: block;
  font-size: 13px;
  color: #334155;
  white-space: nowrap;
}

.no-tanggal-tindak-lanjut {
  color: #94a3b8;
  font-size: 11px;
}


/* =========================
   FOTO
   ========================= */

.foto-cell {
  text-align: center;
}

.photo-preview-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.photo-button {
  display: block;
  width: 42px;
  height: 42px;
  padding: 0;
  border: 1px solid #dbe3ef;
  border-radius: 7px;
  background: #f8fafc;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.photo-button:hover {
  border-color: #2563eb;
  transform: scale(1.05);
  box-shadow:
    0 3px 8px
    rgba(37, 99, 235, 0.15);
}

.photo-thumbnail {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  color: #94a3b8;
  font-size: 10px;
}


/* =========================
   STATUS
   ========================= */

.status-cell {
  min-width: 125px;
}

.status-select {
  display: block;
  width: 100%;
  min-width: 110px;
  box-sizing: border-box;
  padding: 6px 20px 6px 7px;
  border: 1px solid currentColor;
  border-radius: 18px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}

.status-select:focus {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  min-height: 28px;
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  box-sizing: border-box;
}


/* =========================
   PENGAJU
   ========================= */

.pengaju-cell {
  min-width: 180px;
}

.pengaju-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.pengaju-nama {
  color: #1f2937;
  font-size: 13px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pengaju-username {
  color: #64748b;
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
  color: #64748b;
  font-size: 10px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}


/* =========================
   TINDAK LANJUT
   ========================= */

.tindak-lanjut-cell {
  min-width: 250px;
  line-height: 1.4;
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
  color: #334155;
  font-size: 14px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.tindak-lanjut-empty {
  display: flex;
  align-items: center;
}


/* =========================
   BUTTON DETAIL
   ========================= */

.btn-detail {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  max-width: 100%;
  padding: 6px 8px;
  border: none;
  border-radius: 7px;
  background: #e8f2fd;
  color: #2b7cd3;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  overflow-wrap: anywhere;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.btn-detail:hover {
  background: #d5e9fb;
  color: #1e5fa8;
  transform: translateY(-1px);
}


/* =========================
   BELUM ADA
   ========================= */

.belum-ada {
  color: #94a3b8;
  font-size: 10px;
}


/* =========================
   MODAL FOTO
   ========================= */

.photo-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  background: rgba(
    15,
    23,
    42,
    0.78
  );
  box-sizing: border-box;
}

.photo-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 50px
    rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

.photo-full {
  display: block;
  max-width: 85vw;
  max-height: 82vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 7px;
}

.photo-close {
  position: absolute;
  top: -15px;
  right: -15px;
  z-index: 2;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: white;
  color: #475569;
  font-size: 27px;
  line-height: 36px;
  text-align: center;
  cursor: pointer;
  box-shadow:
    0 3px 12px
    rgba(0, 0, 0, 0.25);
}

.photo-close:hover {
  background: #f1f5f9;
  color: #dc2626;
}


/* =========================
   RESPONSIVE
   ========================= */

@media (max-width: 1100px) {

  .header-row h2 {
    font-size: 22px;
  }

  .data-table th,
  .data-table td {
    padding: 9px 8px;
  }

  .photo-button {
    width: 38px;
    height: 38px;
  }

  .status-select {
    font-size: 10px;
  }

  .pengaju-nama {
    font-size: 12px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
    font-size: 9px;
  }
}


/* =========================
   TABLET
   ========================= */

@media (max-width: 768px) {

  .header-row h2 {
    font-size: 20px;
  }

  .header-row p {
    font-size: 12px;
  }

  .data-table th {
    font-size: 9px;
    padding: 8px 7px;
  }

  .data-table td {
    font-size: 10px;
    padding: 8px 7px;
  }

  .photo-button {
    width: 32px;
    height: 32px;
  }

  .status-select {
    height: 27px;
    font-size: 9px;
  }

  .status-badge {
    font-size: 8px;
    padding: 4px;
  }

  .deadline-text {
    font-size: 8px;
  }

  .tanggal-tindak-lanjut {
    font-size: 10px;
  }

  .no-tanggal-tindak-lanjut {
    font-size: 8px;
  }

  .pengaju-nama {
    font-size: 10px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
    font-size: 8px;
  }

  .tindak-lanjut-text {
    font-size: 12px;
  }

  .belum-ada {
    font-size: 8px;
  }

  .btn-detail {
    padding: 5px;
    font-size: 8px;
  }

  .photo-modal {
    padding: 15px;
  }

  .photo-modal-content {
    max-width: 94vw;
    max-height: 90vh;
  }

  .photo-full {
    max-width: 88vw;
    max-height: 82vh;
  }
}


/* =========================
   MOBILE
   ========================= */

@media (max-width: 550px) {

  .table-wrapper {
    border-radius: 8px;
  }

  .data-table th,
  .data-table td {
    padding: 7px 5px;
    font-size: 9px;
  }

  .photo-button {
    width: 28px;
    height: 28px;
  }

  .status-select {
    height: 25px;
    font-size: 8px;
  }

  .status-badge {
    font-size: 7px;
    padding: 3px 4px;
  }

  .tanggal-tindak-lanjut {
    font-size: 9px;
  }

  .no-tanggal-tindak-lanjut {
    font-size: 7px;
  }

  .pengaju-nama {
    font-size: 9px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
    font-size: 7px;
  }

  .deadline-text {
    font-size: 7px;
  }

  .tindak-lanjut-text {
    font-size: 11px;
  }

  .belum-ada {
    font-size: 7px;
  }

  .btn-detail {
    padding: 4px 3px;
    font-size: 7px;
  }

  .photo-close {
    top: -10px;
    right: -10px;
    width: 32px;
    height: 32px;
    font-size: 23px;
    line-height: 32px;
  }
}

</style>