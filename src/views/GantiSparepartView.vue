<template>
  <div class="ganti-sparepart-page">

    <!-- =========================
         HEADER
    ========================= -->

    <div class="page-header">

      <div class="header-eyebrow">
        MONITORING
      </div>

      <h1>
        Daftar Ganti Sparepart
      </h1>

      <p>
        Monitoring penggantian sparepart fast moving kendaraan
      </p>

    </div>


    <!-- =========================
         STATISTICS
    ========================= -->

    <div class="stats-grid">

      <!-- TOTAL -->
      <div class="stat-card">

        <div class="stat-label">
          Total Sparepart
        </div>

        <div class="stat-value total">
          {{ totalData }}
        </div>

      </div>


      <!-- OPEN -->
      <div class="stat-card stat-open">

        <div class="stat-label">
          Open
        </div>

        <div class="stat-value open">
          {{ jumlahStatus('Open') }}
        </div>

      </div>


      <!-- ON PROGRESS -->
      <div class="stat-card stat-progress">

        <div class="stat-label">
          On Progress
        </div>

        <div class="stat-value progress">
          {{ jumlahStatus('On Progress') }}
        </div>

      </div>


      <!-- CLOSE -->
      <div class="stat-card stat-close">

        <div class="stat-label">
          Close
        </div>

        <div class="stat-value close">
          {{ jumlahStatus('Close') }}
        </div>

      </div>


      <!-- CANCEL -->
      <div class="stat-card stat-cancel">

        <div class="stat-label">
          Cancel
        </div>

        <div class="stat-value cancel">
          {{ jumlahStatus('Cancel') }}
        </div>

      </div>

    </div>


    <!-- =========================
         SEARCH
    ========================= -->

    <div class="search-card">

      <SearchInput
        v-model="searchQuery"
        placeholder="Cari kendaraan, sparepart, pengaju, UID, UP3, unit, status..."
      />

    </div>


    <!-- =========================
         ERROR
    ========================= -->

    <div
      v-if="errorMsg"
      class="error-message"
    >

      <span class="error-icon">
        !
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
      class="loading-container"
    >

      <div class="loading-spinner"></div>

      <p>
        Memuat data ganti sparepart...
      </p>

    </div>


    <!-- =========================
         EMPTY
    ========================= -->

    <EmptyState
      v-else-if="filteredData.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data ganti sparepart'
      "
      :subtext="
        searchQuery
          ? 'Coba gunakan kata kunci lain'
          : 'Belum ada data penggantian sparepart'
      "
    />


    <!-- =========================
         TABLE CARD
    ========================= -->

    <div
      v-else
      class="table-card"
    >

      <!-- TABLE HEADER -->
      <div class="table-card-header">

        <div>

          <h2>
            Data Ganti Sparepart
          </h2>

          <span>
            {{ filteredData.length }} data ditemukan
          </span>

        </div>

      </div>


      <!-- TABLE -->
      <div class="table-wrapper">

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


          <!-- =========================
               HEADER
          ========================= -->

          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Kendaraan
              </th>

              <th>
                Sparepart
              </th>

              <th>
                Biaya
              </th>

              <th>
                Rencana
              </th>

              <th>
                Tanggal Tindak Lanjut
              </th>

              <th class="text-center">
                Foto
              </th>

              <th>
                Status
              </th>

              <th>
                Keterangan
              </th>

              <th>
                Pengaju
              </th>

              <th>
                Tindak Lanjut
              </th>

            </tr>

          </thead>


          <!-- =========================
               BODY
          ========================= -->

          <tbody>

            <tr
              v-for="item in filteredData"
              :key="item.id"
              :class="getRowClass(item)"
            >

              <!-- ID -->
              <td>

                <span class="id-badge">
                  #{{ item.id }}
                </span>

              </td>


              <!-- KENDARAAN -->
              <td class="vehicle-cell">

                <strong class="vehicle-number">
                  {{ item.nomorKendaraan || '-' }}
                </strong>

              </td>


              <!-- SPAREPART -->
              <td class="sparepart-cell">

                <strong class="sparepart-name">
                  {{ item.sparepart || '-' }}
                </strong>

              </td>


              <!-- BIAYA -->
              <td>

                <span class="biaya-value">
                  {{ formatRupiah(item.biaya) }}
                </span>

              </td>


              <!-- RENCANA -->
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

                <span
                  v-else
                  class="empty-value"
                >
                  Belum ditentukan
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

                <div
                  v-else
                  class="no-photo"
                >

                  <span class="no-photo-icon">
                    📷
                  </span>

                  <span>
                    Tidak ada
                  </span>

                </div>

              </td>


              <!-- STATUS -->
              <td class="status-cell">

                <select
                  v-if="canManage"
                  :value="item.status || 'Open'"
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
                      item.status || 'Open'
                    )
                  "
                >

                  <span class="status-dot"></span>

                  {{ item.status || 'Open' }}

                </span>

              </td>


              <!-- KETERANGAN -->
              <td class="keterangan-cell">

                <span
                  v-if="item.keterangan"
                  class="keterangan-text"
                >
                  {{ item.keterangan }}
                </span>

                <span
                  v-else
                  class="empty-value"
                >
                  Tidak ada keterangan
                </span>

              </td>


              <!-- PENGAJU -->
              <td class="pengaju-cell">

                <div class="pengaju-wrapper">

                  <div class="pengaju-main">

                    <span class="avatar">
                      {{
                        (
                          item.namaLengkap ||
                          item.username ||
                          '?'
                        )
                        .charAt(0)
                        .toUpperCase()
                      }}
                    </span>

                    <div class="pengaju-info">

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

                    </div>

                  </div>


                  <div
                    v-if="
                      item.uid ||
                      item.up3 ||
                      item.unit
                    "
                    class="pengaju-location"
                  >

                    <span
                      v-if="item.uid"
                      class="location-item"
                    >
                      {{ item.uid }}
                    </span>

                    <span
                      v-if="item.uid && item.up3"
                      class="location-separator"
                    >
                      •
                    </span>

                    <span
                      v-if="item.up3"
                      class="location-item"
                    >
                      {{ item.up3 }}
                    </span>

                    <span
                      v-if="
                        (item.uid || item.up3) &&
                        item.unit
                      "
                      class="location-separator"
                    >
                      •
                    </span>

                    <span
                      v-if="item.unit"
                      class="location-item unit"
                    >
                      {{ item.unit }}
                    </span>

                  </div>

                </div>

              </td>


              <!-- TINDAK LANJUT -->
              <td class="tindak-lanjut-cell">

                <div
                  v-if="item.tindakLanjut"
                  class="tindak-lanjut-wrapper"
                >

                  <div class="tindak-lanjut-content">

                    <span class="tindak-lanjut-label">
                      Tindak lanjut
                    </span>

                    <span class="tindak-lanjut-text">
                      {{ item.tindakLanjut }}
                    </span>

                  </div>


                  <button
                    v-if="isAdmin"
                    type="button"
                    class="btn-edit"
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
                    Tambah Detail
                  </button>

                  <span
                    v-else
                    class="belum-ada"
                  >
                    Belum ada tindak lanjut
                  </span>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>


    <!-- =========================
         FOTO MODAL
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
   PERMISSION
========================= */

const canManage = computed(() => {

  return [
    'admin',
    'uid'
  ].includes(role.value)

})


const isAdmin = computed(() => {

  return role.value === 'admin'

})


/* =========================
   TOTAL DATA
========================= */

const totalData = computed(() => {

  return daftarData.value.length

})


/* =========================
   JUMLAH STATUS
========================= */

const jumlahStatus = (status) => {

  return daftarData.value.filter(
    item =>
      (item.status || 'Open') === status
  ).length

}


/* =========================
   FOTO MODAL
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

  } else if (
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

      } else if (
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

      } else {

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
      backgroundColor: '#eff6ff',
      color: '#2563eb'
    },

    'On Progress': {
      backgroundColor: '#fff7ed',
      color: '#ea580c'
    },

    Close: {
      backgroundColor: '#f0fdf4',
      color: '#16a34a'
    },

    Cancel: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    }

  }

  return (
    styles[status] || {
      backgroundColor: '#f8fafc',
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


  if (
    selisihHari === 0
  ) {

    return {
      class: '',
      text: 'Hari ini'
    }

  }


  if (
    selisihHari > 0 &&
    selisihHari <= 3
  ) {

    return {
      class: '',
      text: `${selisihHari} hari`
    }

  }


  if (
    selisihHari >= 4 &&
    selisihHari <= 5
  ) {

    return {
      class: 'deadline-warning',
      text: `${selisihHari} hari`
    }

  }


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

.page-header {
  margin-bottom: 34px;
}

.header-eyebrow {
  margin-bottom: 8px;

  color: #2563eb;

  font-size: 14px;
  font-weight: 700;

  letter-spacing: 0.06em;
}

.page-header h1 {
  margin: 0;

  color: #0f2747;

  font-size: 30px;
  font-weight: 700;

  line-height: 1.15;
  letter-spacing: -0.025em;
}

.page-header p {
  margin: 10px 0 0;

  color: #64748b;

  font-size: 17px;
  line-height: 1.5;
}


/* =========================
   STATISTICS
========================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 18px;

  margin-bottom: 32px;
}

.stat-card {
  min-height: 106px;

  padding: 25px 28px;

  box-sizing: border-box;

  border: 1px solid #e2e8f0;
  border-top: 4px solid transparent;

  border-radius: 15px;

  background: #ffffff;

  box-shadow:
    0 3px 12px
    rgba(15, 23, 42, 0.045);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 7px 18px
    rgba(15, 23, 42, 0.07);
}

.stat-label {
  color: #64748b;

  font-size: 15px;
  font-weight: 600;

  line-height: 1.3;
}

.stat-value {
  margin-top: 7px;

  color: #0f172a;

  font-size: 31px;
  font-weight: 700;

  line-height: 1;
}

.stat-value.open {
  color: #2563eb;
}

.stat-value.progress {
  color: #ea580c;
}

.stat-value.close {
  color: #16a34a;
}

.stat-value.cancel {
  color: #dc2626;
}

.stat-open {
  border-top-color: #3b82f6;
}

.stat-progress {
  border-top-color: #f59e0b;
}

.stat-close {
  border-top-color: #22c55e;
}

.stat-cancel {
  border-top-color: #ef4444;
}


/* =========================
   SEARCH
========================= */

.search-card {
  width: 100%;

  margin-bottom: 32px;

  padding: 17px 22px;

  box-sizing: border-box;

  border: 1px solid #dbe3ed;
  border-radius: 14px;

  background: #ffffff;

  box-shadow:
    0 2px 8px
    rgba(15, 23, 42, 0.035);
}


/* =========================
   ERROR
========================= */

.error-message {
  display: flex;
  align-items: center;

  gap: 10px;

  margin-bottom: 20px;

  padding: 12px 15px;

  border: 1px solid #fecaca;
  border-radius: 10px;

  background: #fef2f2;

  color: #b91c1c;

  font-size: 13px;
}

.error-icon {
  width: 22px;
  height: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background: #fee2e2;

  font-size: 12px;
  font-weight: 700;
}


/* =========================
   LOADING
========================= */

.loading-container {
  min-height: 260px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #64748b;
}

.loading-container p {
  margin: 0;

  font-size: 13px;
}

.loading-spinner {
  width: 32px;
  height: 32px;

  margin-bottom: 12px;

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
   TABLE CARD
========================= */

.table-card {
  width: 100%;

  overflow: hidden;

  border: 1px solid #e2e8f0;
  border-radius: 15px;

  background: #ffffff;

  box-shadow:
    0 3px 12px
    rgba(15, 23, 42, 0.045);
}


/* =========================
   TABLE CARD HEADER
========================= */

.table-card-header {
  padding: 24px 30px 20px;

  border-bottom: 1px solid #edf2f7;

  background: #ffffff;
}

.table-card-header h2 {
  margin: 0;

  color: #0f2747;

  font-size: 20px;
  font-weight: 700;
}

.table-card-header span {
  display: block;

  margin-top: 5px;

  color: #94a3b8;

  font-size: 13px;
}


/* =========================
   TABLE WRAPPER
========================= */

.table-wrapper {
  width: 100%;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.table-wrapper::-webkit-scrollbar {
  height: 7px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;

  border-radius: 10px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}


/* =========================
   TABLE
========================= */

.data-table {
  width: max-content;
  min-width: 1350px;

  border-collapse: separate;
  border-spacing: 0;

  background: #ffffff;
}


/* =========================
   COLUMN
========================= */

.col-id {
  width: 65px;
}

.col-kendaraan {
  width: 145px;
}

.col-sparepart {
  width: 170px;
}

.col-biaya {
  width: 125px;
}

.col-tanggal {
  width: 145px;
}

.col-tanggal-tindak-lanjut {
  width: 155px;
}

.col-foto {
  width: 110px;
}

.col-status {
  width: 135px;
}

.col-keterangan {
  width: 205px;
}

.col-pengaju {
  width: 220px;
}

.col-tindak-lanjut {
  width: 260px;
}


/* =========================
   TABLE HEADER
========================= */

.data-table th {
  padding: 14px 13px;

  background: #f8fafc;

  color: #64748b;

  border-bottom: 1px solid #e2e8f0;

  font-size: 11px;
  font-weight: 700;

  text-align: left;

  text-transform: uppercase;

  letter-spacing: 0.045em;

  white-space: nowrap;
}

.data-table th:first-child {
  padding-left: 18px;
}

.data-table th.text-center {
  text-align: center;
}


/* =========================
   TABLE BODY
========================= */

.data-table td {
  padding: 17px 13px;

  border-bottom: 1px solid #edf2f7;

  color: #475569;

  font-size: 13px;

  line-height: 1.4;

  vertical-align: middle;

  overflow-wrap: anywhere;

  box-sizing: border-box;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr {
  transition:
    background-color 0.15s ease;
}

.data-table tbody tr:hover td {
  background: #f8fbff;
}


/* =========================
   DEADLINE ROW
========================= */

.data-table tbody tr.row-warning td {
  background: #fffdf5;
}

.data-table tbody tr.row-warning:hover td {
  background: #fff8e6;
}

.data-table tbody tr.row-danger td {
  background: #fff8f8;
}

.data-table tbody tr.row-danger:hover td {
  background: #fff0f0;
}


/* =========================
   ID
========================= */

.id-badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 39px;

  padding: 5px 8px;

  border-radius: 7px;

  background: #f1f5f9;

  color: #64748b;

  font-size: 11px;
  font-weight: 700;
}


/* =========================
   VEHICLE
========================= */

.vehicle-number {
  color: #1e293b;

  font-size: 13px;
  font-weight: 700;

  white-space: nowrap;
}


/* =========================
   SPAREPART
========================= */

.sparepart-name {
  display: block;

  color: #1e293b;

  font-size: 13px;
  font-weight: 600;

  line-height: 1.4;

  overflow-wrap: anywhere;
}


/* =========================
   BIAYA
========================= */

.biaya-value {
  color: #334155;

  font-size: 12px;
  font-weight: 600;

  white-space: nowrap;
}


/* =========================
   TANGGAL
========================= */

.tanggal-wrapper {
  display: flex;
  flex-direction: column;

  gap: 5px;
}

.tanggal-text {
  color: #334155;

  font-size: 12px;
  font-weight: 600;

  white-space: nowrap;
}

.deadline-text {
  display: inline-flex;

  width: fit-content;

  padding: 4px 7px;

  border-radius: 6px;

  background: #f1f5f9;

  color: #64748b;

  font-size: 9px;
  font-weight: 700;

  white-space: nowrap;
}

.deadline-warning {
  background: #fff3cd !important;
  color: #d97706 !important;
}

.deadline-danger {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

.empty-value {
  color: #94a3b8;

  font-size: 11px;

  font-style: italic;
}


/* =========================
   TANGGAL TINDAK LANJUT
========================= */

.tanggal-tindak-lanjut-cell {
  min-width: 155px;
}

.tanggal-tindak-lanjut {
  display: inline-flex;

  padding: 6px 9px;

  border-radius: 7px;

  background: #f8fafc;

  color: #475569;

  font-size: 11px;
  font-weight: 600;

  white-space: nowrap;
}

.no-tanggal-tindak-lanjut {
  color: #94a3b8;

  font-size: 10px;

  font-style: italic;
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
  width: 43px;
  height: 43px;

  display: block;

  padding: 0;

  overflow: hidden;

  border: 1px solid #dbe3ef;
  border-radius: 8px;

  background: #f8fafc;

  cursor: pointer;

  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.photo-button:hover {
  transform: translateY(-2px);

  border-color: #60a5fa;

  box-shadow:
    0 4px 10px
    rgba(37, 99, 235, 0.15);
}

.photo-thumbnail {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;
}

.no-photo {
  display: flex;
  flex-direction: column;

  align-items: center;

  gap: 3px;

  color: #94a3b8;

  font-size: 9px;
}

.no-photo-icon {
  font-size: 15px;
}


/* =========================
   STATUS
========================= */

.status-cell {
  min-width: 135px;
}

.status-select {
  width: 124px;

  padding: 8px 23px 8px 11px;

  box-sizing: border-box;

  border: 1px solid currentColor;
  border-radius: 18px;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  outline: none;
}

.status-select:focus {
  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.12);
}

.status-badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 6px;

  min-width: 96px;

  padding: 8px 11px;

  border-radius: 18px;

  font-size: 10px;
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
   KETERANGAN
========================= */

.keterangan-cell {
  line-height: 1.5;
}

.keterangan-text {
  color: #475569;

  font-size: 12px;

  line-height: 1.5;
}


/* =========================
   PENGAJU
========================= */

.pengaju-cell {
  min-width: 220px;
}

.pengaju-wrapper {
  display: flex;
  flex-direction: column;

  gap: 7px;

  min-width: 0;
}

.pengaju-main {
  display: flex;
  align-items: center;

  gap: 9px;
}

.avatar {
  width: 31px;
  height: 31px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 50%;

  background: #eaf4ff;

  color: #2563eb;

  font-size: 11px;
  font-weight: 700;
}

.pengaju-info {
  display: flex;
  flex-direction: column;

  gap: 2px;

  min-width: 0;
}

.pengaju-nama {
  color: #1e293b;

  font-size: 12px;
  font-weight: 700;

  line-height: 1.3;

  overflow-wrap: anywhere;
}

.pengaju-username {
  color: #94a3b8;

  font-size: 9px;

  line-height: 1.3;

  overflow-wrap: anywhere;
}

.pengaju-location {
  display: flex;
  align-items: center;

  gap: 4px;

  flex-wrap: wrap;

  padding-left: 40px;
}

.location-item {
  color: #2563eb;

  font-size: 9px;
  font-weight: 600;
}

.location-item.unit {
  color: #64748b;
}

.location-separator {
  color: #cbd5e1;

  font-size: 9px;
}


/* =========================
   TINDAK LANJUT
========================= */

.tindak-lanjut-cell {
  min-width: 260px;
}

.tindak-lanjut-wrapper {
  display: flex;
  align-items: flex-start;

  gap: 9px;
}

.tindak-lanjut-content {
  display: flex;
  flex-direction: column;

  gap: 4px;

  flex: 1;

  min-width: 0;
}

.tindak-lanjut-label {
  color: #94a3b8;

  font-size: 9px;
  font-weight: 600;

  text-transform: uppercase;

  letter-spacing: 0.04em;
}

.tindak-lanjut-text {
  color: #334155;

  font-size: 12px;

  line-height: 1.5;

  overflow-wrap: anywhere;
  word-break: break-word;
}

.tindak-lanjut-empty {
  display: flex;
  align-items: center;
}

.belum-ada {
  color: #94a3b8;

  font-size: 10px;

  font-style: italic;
}


/* =========================
   BUTTON DETAIL
========================= */

.btn-detail {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  padding: 7px 11px;

  border: none;
  border-radius: 7px;

  background: #eff6ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.btn-detail:hover {
  background: #dbeafe;

  transform: translateY(-1px);
}


/* =========================
   EDIT
========================= */

.btn-edit {
  width: 30px;
  height: 30px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  padding: 0;

  border: 1px solid #bfdbfe;
  border-radius: 7px;

  background: #eff6ff;

  color: #2563eb;

  font-size: 15px;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
}

.btn-edit:hover {
  background: #dbeafe;

  border-color: #93c5fd;

  transform: translateY(-1px);
}


/* =========================
   PHOTO MODAL
========================= */

.photo-modal {
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 25px;

  box-sizing: border-box;

  background:
    rgba(15, 23, 42, 0.78);
}

.photo-modal-content {
  position: relative;

  max-width: 90vw;
  max-height: 90vh;

  padding: 12px;

  box-sizing: border-box;

  border-radius: 13px;

  background: #ffffff;

  box-shadow:
    0 20px 50px
    rgba(0, 0, 0, 0.3);
}

.photo-full {
  display: block;

  max-width: 85vw;
  max-height: 82vh;

  width: auto;
  height: auto;

  object-fit: contain;

  border-radius: 8px;
}

.photo-close {
  position: absolute;

  top: -14px;
  right: -14px;

  z-index: 2;

  width: 36px;
  height: 36px;

  padding: 0;

  border: none;
  border-radius: 50%;

  background: #ffffff;

  color: #475569;

  font-size: 26px;
  line-height: 36px;

  text-align: center;

  cursor: pointer;

  box-shadow:
    0 3px 12px
    rgba(0, 0, 0, 0.25);
}

.photo-close:hover {
  color: #dc2626;

  background: #f8fafc;
}


/* =========================
   TABLET
========================= */

@media (max-width: 1200px) {

  .page-header h1 {
    font-size: 32px;
  }

  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

}


/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

  .page-header {
    margin-bottom: 22px;
  }

  .header-eyebrow {
    font-size: 12px;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .page-header p {
    margin-top: 7px;

    font-size: 14px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 10px;

    margin-bottom: 20px;
  }

  .stat-card {
    min-height: 88px;

    padding: 18px 17px;

    border-radius: 12px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 25px;
  }


  .search-card {
    margin-bottom: 20px;

    padding: 13px 15px;

    border-radius: 11px;
  }


  .table-card {
    border-radius: 11px;
  }

  .table-card-header {
    padding: 19px 20px 16px;
  }

  .table-card-header h2 {
    font-size: 17px;
  }

  .table-card-header span {
    font-size: 11px;
  }


  .data-table {
    min-width: 1350px;
  }

  .data-table th {
    padding: 11px 9px;

    font-size: 9px;
  }

  .data-table td {
    padding: 12px 9px;

    font-size: 10px;
  }


  .vehicle-number {
    font-size: 11px;
  }

  .sparepart-name {
    font-size: 11px;
  }

  .biaya-value {
    font-size: 10px;
  }

  .tanggal-text {
    font-size: 10px;
  }

  .deadline-text {
    font-size: 8px;
  }

  .tanggal-tindak-lanjut {
    font-size: 9px;
  }

  .no-tanggal-tindak-lanjut {
    font-size: 8px;
  }


  .photo-button {
    width: 35px;
    height: 35px;
  }


  .status-select {
    width: 108px;

    padding: 6px 8px;

    font-size: 8px;
  }

  .status-badge {
    min-width: 82px;

    padding: 6px 8px;

    font-size: 8px;
  }


  .keterangan-text {
    font-size: 10px;
  }


  .avatar {
    width: 26px;
    height: 26px;

    font-size: 9px;
  }

  .pengaju-nama {
    font-size: 9px;
  }

  .pengaju-username,
  .location-item,
  .location-separator {
    font-size: 8px;
  }

  .pengaju-location {
    padding-left: 34px;
  }


  .tindak-lanjut-text {
    font-size: 10px;
  }

  .btn-detail {
    padding: 6px 8px;

    font-size: 8px;
  }

  .btn-edit {
    width: 26px;
    height: 26px;

    font-size: 13px;
  }

}


/* =========================
   VERY SMALL
========================= */

@media (max-width: 500px) {

  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 12px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .stat-card {
    min-height: 80px;

    padding: 15px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 23px;
  }


  .data-table th,
  .data-table td {
    padding: 9px 7px;
  }


  .photo-button {
    width: 31px;
    height: 31px;
  }


  .photo-modal {
    padding: 15px;
  }

  .photo-full {
    max-width: 88vw;
    max-height: 82vh;
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