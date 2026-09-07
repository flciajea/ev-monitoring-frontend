<template>
  <div class="page-container">

    <!-- =========================
         HEADER
         ========================= -->
    <div class="page-header">
      <div>
        <h1>Ganti Sparepart Fast Moving</h1>
        <p>Monitoring penggantian sparepart kendaraan</p>
      </div>
    </div>


    <!-- =========================
         SEARCH
         ========================= -->
    <div class="search-container">
      <SearchInput
        v-model="searchQuery"
        placeholder="Cari kendaraan, sparepart, pengaju, UID, UP3..."
      />
    </div>


    <!-- =========================
         ERROR
         ========================= -->
    <div
      v-if="errorMsg"
      class="error-message"
    >
      {{ errorMsg }}
    </div>


    <!-- =========================
         LOADING
         ========================= -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="loading-spinner"></div>
      <p>Memuat data...</p>
    </div>


    <!-- =========================
         EMPTY
         ========================= -->
    <EmptyState
      v-else-if="filteredData.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan.'
          : 'Tidak ada data ganti sparepart.'
      "
    />


    <!-- =========================
         TABLE
         ========================= -->
    <div
      v-else
      class="table-wrapper"
    >

      <table class="data-table">

        <colgroup>
          <col class="col-id">
          <col class="col-kendaraan">
          <col class="col-sparepart">
          <col class="col-biaya">
          <col class="col-tanggal">
          <col class="col-foto">
          <col class="col-status">
          <col class="col-keterangan">
          <col class="col-pengaju">
        </colgroup>


        <thead>
          <tr>
            <th>ID</th>
            <th>Nomor Kendaraan</th>
            <th>Sparepart</th>
            <th>Biaya</th>
            <th>Rencana Tanggal</th>
            <th>Foto</th>
            <th>Status</th>
            <th>Keterangan</th>
            <th>Pengaju</th>
          </tr>
        </thead>


        <tbody>

          <tr
            v-for="item in filteredData"
            :key="item.id"
          >

            <!-- =========================
                 ID
                 ========================= -->
            <td>
              {{ item.id }}
            </td>


            <!-- =========================
                 NOMOR KENDARAAN
                 ========================= -->
            <td class="vehicle-cell">
              {{ item.nomorKendaraan || '-' }}
            </td>


            <!-- =========================
                 SPAREPART
                 ========================= -->
            <td>
              {{ item.sparepart || '-' }}
            </td>


            <!-- =========================
                 BIAYA
                 ========================= -->
            <td>
              {{ formatRupiah(item.biaya) }}
            </td>


            <!-- =========================
                 TANGGAL
                 ========================= -->
            <td>

              <div
                v-if="item.tanggal"
                class="tanggal-wrapper"
              >

                <span
                  :class="[
                    'tanggal-text',
                    getStatusTanggal(
                      item.tanggal,
                      item.status
                    ).class
                  ]"
                >
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


            <!-- =========================
                 FOTO
                 ========================= -->
            <td class="foto-cell">

              <div
                v-if="getPhotos(item).length > 0"
                class="photo-preview-list"
              >

                <button
                  v-for="(
                    photo,
                    index
                  ) in getPhotos(item)"
                  :key="index"
                  type="button"
                  class="photo-button"
                  @click="bukaFoto(photo)"
                  :title="
                    `Lihat foto ${index + 1}`
                  "
                >

                  <img
                    :src="photo"
                    :alt="
                      `Foto bukti sparepart ${
                        index + 1
                      }`
                    "
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


            <!-- =========================
                 STATUS
                 ========================= -->
            <td class="status-cell">

              <!-- ADMIN / UID -->
              <select
                v-if="canManage"
                :value="
                  item.status || 'Open'
                "
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
                    item.status || 'Open'
                  )
                "
              >

                {{ item.status || 'Open' }}

              </span>

            </td>


            <!-- =========================
                 KETERANGAN
                 ========================= -->
            <td class="keterangan-cell">
              {{ item.keterangan || '-' }}
            </td>


            <!-- =========================
                 PENGAJU
                 ========================= -->
            <td class="pengaju-cell">

              <div class="pengaju-wrapper">

                <!-- NAMA -->
                <strong class="pengaju-nama">

                  {{
                    item.namaLengkap ||
                    item.username ||
                    '-'
                  }}

                </strong>


                <!-- USERNAME -->
                <span
                  v-if="item.username"
                  class="pengaju-username"
                >
                  {{ item.username }}
                </span>


                <!-- UID + UP3 -->
                <span
                  v-if="
                    item.uid ||
                    item.up3
                  "
                  class="pengaju-wilayah"
                >

                  {{ item.uid || '-' }}

                  <span
                    v-if="
                      item.uid &&
                      item.up3
                    "
                  >
                    •
                  </span>

                  {{ item.up3 || '-' }}

                </span>


                <!-- UNIT -->
                <span
                  v-if="item.unit"
                  class="pengaju-unit"
                >
                  {{ item.unit }}
                </span>

              </div>

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


const role = computed(() => {

  return (
    currentUser.value?.role
      ?.toLowerCase() || ''
  )

})


/*
 * Hanya Admin dan UID
 * yang boleh mengubah status.
 */

const canManage = computed(() => {

  return [
    'admin',
    'uid'
  ].includes(
    role.value
  )

})


/* =========================
   MODAL FOTO
   ========================= */

const showFotoModal =
  ref(false)

const fotoDipilih =
  ref('')


const bukaFoto = (foto) => {

  if (!foto) {
    return
  }

  fotoDipilih.value =
    foto

  showFotoModal.value =
    true

}


const tutupFoto = () => {

  showFotoModal.value =
    false

  fotoDipilih.value =
    ''

}


/* =========================
   PARSE FOTO
   ========================= */

const parsePhotos = (
  rawPhotos
) => {

  if (!rawPhotos) {
    return []
  }

  let photoArray = []


  /* =========================
     ARRAY
     ========================= */

  if (
    Array.isArray(
      rawPhotos
    )
  ) {

    photoArray =
      rawPhotos

  }


  /* =========================
     STRING
     ========================= */

  else if (
    typeof rawPhotos ===
    'string'
  ) {

    let strData =
      rawPhotos.trim()

    if (!strData) {
      return []
    }


    /* =========================
       JSON
       ========================= */

    try {

      const parsed =
        JSON.parse(
          strData
        )


      if (
        Array.isArray(
          parsed
        )
      ) {

        photoArray =
          parsed

      }


      else if (
        typeof parsed ===
        'string'
      ) {

        try {

          const parsedAgain =
            JSON.parse(
              parsed
            )

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

          photoArray =
            [parsed]

        }

      }


      else {

        photoArray =
          [parsed]

      }

    }


    /* =========================
       BUKAN JSON
       ========================= */

    catch {

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

        photoArray =
          [strData]

      }

    }

  }


  /* =========================
     CLEANING
     ========================= */

  return photoArray

    .filter(
      photo =>
        typeof photo ===
          'string' &&
        photo.trim() !== ''
    )

    .map(
      photo => {

        let cleanBase64 =
          photo.trim()


        cleanBase64 =
          cleanBase64
            .replace(
              /\\"/g,
              '"'
            )
            .replace(
              /\\'/g,
              "'"
            )
            .replace(
              /^\[+/g,
              ''
            )
            .replace(
              /\]+$/g,
              ''
            )
            .replace(
              /^"+|"+$/g,
              ''
            )
            .replace(
              /^'+|'+$/g,
              ''
            )
            .replace(
              /^,|,$/g,
              ''
            )
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
            cleanBase64.substring(
              index
            )

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

      }
    )

    .filter(Boolean)

}


/* =========================
   GET FOTO
   ========================= */

const getPhotos = (
  item
) => {

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


  return parsePhotos(
    rawPhotos
  )

}


/* =========================
   SEARCH
   ========================= */

const filteredData =
  computed(() => {

    const query =
      searchQuery.value
        .trim()
        .toLowerCase()


    if (!query) {
      return daftarData.value
    }


    return daftarData.value.filter(
      item => {

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
          status.includes(query)
        )

      }
    )

  })


/* =========================
   FORMAT TANGGAL
   ========================= */

const formatTanggal = (
  tanggal
) => {

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


    console.log(
      'DATA GANTI SPAREPART:',
      response.data
    )


    daftarData.value =
      Array.isArray(
        response.data
      )
        ? response.data
        : []

  }


  catch (error) {

    console.error(
      'ERROR GANTI SPAREPART:',
      error
    )


    errorMsg.value =
      'Gagal ambil data: ' +
      (
        error.response?.data
          ?.error ||
        error.response?.data
          ?.message ||
        error.message
      )

  }


  finally {

    loading.value =
      false

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
    statusBaru ===
    statusLama
  ) {
    return
  }


  try {

    await api.put(
      `/ganti-sparepart/${item.id}`,
      {

        nomorKendaraan:
          item.nomorKendaraan,

        sparepart:
          item.sparepart,

        biaya:
          item.biaya,

        tanggal:
          item.tanggal,

        photoBase64Json:
          item.photoBase64Json,

        status:
          statusBaru,

        keterangan:
          item.keterangan,

        username:
          item.username

      }
    )


    item.status =
      statusBaru


    showToast(
      `Status berhasil diubah menjadi ${statusBaru}`
    )

  }


  catch (error) {

    console.error(
      'Gagal mengubah status:',
      error
    )


    errorMsg.value =
      'Gagal mengubah status: ' +
      (
        error.response?.data
          ?.error ||
        error.response?.data
          ?.message ||
        error.message
      )


    item.status =
      statusLama

  }

}


/* =========================
   STATUS STYLE
   ========================= */

const getStatusStyle = (
  status
) => {

  const styles = {

    Open: {
      backgroundColor:
        '#e0f0ff',
      color:
        '#2b7cd3'
    },

    'On Progress': {
      backgroundColor:
        '#fff4e0',
      color:
        '#d68a00'
    },

    Close: {
      backgroundColor:
        '#e3f9e5',
      color:
        '#1e9e3a'
    },

    Cancel: {
      backgroundColor:
        '#fdecea',
      color:
        '#e74c3c'
    }

  }


  return (
    styles[status] || {
      backgroundColor:
        '#f1f5f9',
      color:
        '#64748b'
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
   * Kalau sudah selesai
   * atau dibatalkan,
   * deadline tidak ditampilkan.
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


  const today =
    new Date()

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


  /*
   * TERLAMBAT
   */

  if (
    selisihHari < 0
  ) {

    return {
      class:
        'deadline-danger',

      text:
        `Terlambat ${
          Math.abs(
            selisihHari
          )
        } hari`
    }

  }


  /*
   * HARI INI
   */

  if (
    selisihHari === 0
  ) {

    return {
      class:
        'deadline-danger',

      text:
        'Hari ini'
    }

  }


  /*
   * H-1 sampai H-3
   */

  if (
    selisihHari <= 3
  ) {

    return {
      class:
        'deadline-danger',

      text:
        `H-${selisihHari}`
    }

  }


  /*
   * H-4 sampai H-5
   */

  if (
    selisihHari <= 5
  ) {

    return {
      class:
        'deadline-warning',

      text:
        `H-${selisihHari}`
    }

  }


  /*
   * Masih jauh.
   */

  return {
    class: '',
    text:
      `H-${selisihHari}`
  }

}


/* =========================
   FORMAT RUPIAH
   ========================= */

const formatRupiah = (
  angka
) => {

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
    Number.isNaN(
      nilai
    )
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

.page-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}


/* =========================
   HEADER
   ========================= */

.page-header {
  margin-bottom: 22px;
}

.page-header h1 {
  margin: 0;
  color: #123d70;
  font-size: 28px;
  font-weight: 700;
}

.page-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 15px;
}


/* =========================
   SEARCH
   ========================= */

.search-container {
  margin-bottom: 20px;
  max-width: 480px;
}


/* =========================
   ERROR
   ========================= */

.error-message {
  margin-bottom: 15px;
  padding: 12px 15px;
  border-radius: 8px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 14px;
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
  width: 30px;
  height: 30px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 10px;
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
  overflow: hidden;
  border-radius: 12px;
  background: white;
  box-shadow:
    0 2px 10px
    rgba(15, 23, 42, 0.06);
}


/* =========================
   TABLE
   ========================= */

.data-table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
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

.col-sparepart {
  width: 12%;
}

.col-biaya {
  width: 8%;
}

.col-tanggal {
  width: 11%;
}

.col-foto {
  width: 8%;
}

.col-status {
  width: 11%;
}

.col-keterangan {
  width: 16%;
}

.col-pengaju {
  width: 20%;
}


/* =========================
   HEADER
   ========================= */

.data-table th {
  padding: 13px 8px;
  background: #f1f5f9;
  color: #174a7c;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  vertical-align: middle;
  overflow-wrap: anywhere;
  word-break: break-word;
}


/* =========================
   BODY
   ========================= */

.data-table td {
  padding: 13px 8px;
  border-top: 1px solid #edf2f7;
  color: #334155;
  font-size: 12px;
  vertical-align: middle;
  overflow-wrap: anywhere;
  word-break: break-word;
  box-sizing: border-box;
}

.data-table tbody tr:hover {
  background: #f8fafc;
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

.deadline-danger {
  color: #dc2626 !important;
}

.deadline-warning {
  color: #d97706 !important;
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
  width: 46px;
  height: 46px;
  padding: 0;
  border: 1px solid #dbe3ef;
  border-radius: 7px;
  background: #f8fafc;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.15s,
    border-color 0.15s;
}

.photo-button:hover {
  border-color: #2563eb;
  transform: scale(1.04);
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
  min-width: 0;
  overflow: hidden;
}

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
  overflow-wrap: anywhere;
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

  .page-header h1 {
    font-size: 24px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 6px;
    font-size: 11px;
  }

  .photo-button {
    width: 40px;
    height: 40px;
  }

  .status-select {
    font-size: 10px;
    padding-left: 6px;
    padding-right: 16px;
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
   TABLET
   ========================= */

@media (max-width: 768px) {

  .page-header h1 {
    font-size: 21px;
  }

  .page-header p {
    font-size: 13px;
  }

  .data-table th {
    font-size: 9px;
    padding: 8px 4px;
  }

  .data-table td {
    font-size: 10px;
    padding: 9px 4px;
  }

  .photo-button {
    width: 34px;
    height: 34px;
  }

  .status-select {
    height: 28px;
    font-size: 9px;
    padding-left: 4px;
    padding-right: 10px;
  }

  .status-badge {
    font-size: 8px;
    padding: 5px;
  }

  .deadline-text {
    font-size: 8px;
  }

  .pengaju-nama {
    font-size: 9px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
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
    padding: 7px 3px;
    font-size: 9px;
  }

  .photo-button {
    width: 30px;
    height: 30px;
  }

  .status-select {
    max-width: 100%;
    height: 26px;
    font-size: 8px;
    padding-left: 3px;
    padding-right: 5px;
  }

  .status-badge {
    font-size: 7px;
    padding: 4px 3px;
  }

  .pengaju-nama {
    font-size: 8px;
  }

  .pengaju-username,
  .pengaju-wilayah,
  .pengaju-unit {
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