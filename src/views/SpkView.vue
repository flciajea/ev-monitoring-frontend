<template>
  <div class="spk-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <span class="page-eyebrow">DATA SPK</span>

        <h1>
          Surat Perintah Kerja
        </h1>

        <p>
          Pengelolaan dan monitoring Surat Perintah Kerja
        </p>
      </div>

      <button
        type="button"
        class="btn-add"
        @click="tambahSpk"
      >
        <span class="btn-add-plus">+</span>
        Tambah SPK
      </button>
    </div>


    <!-- TOOLBAR -->
    <div class="toolbar">

      <div class="search-container">
        <SearchInput
          v-model="search"
          placeholder="Cari nomor SPK, UID, bengkel, no polisi, atau pekerjaan..."
        />
      </div>

      <div
        v-if="!loading && !errorMsg"
        class="total-data"
      >
        <span>Total Data</span>

        <strong>
          {{ daftarSpkFiltered.length }}
        </strong>
      </div>

    </div>


    <!-- ERROR -->
    <div
      v-if="errorMsg"
      class="error-message"
    >
      <div class="error-content">
        <strong>Data tidak dapat dimuat</strong>

        <span>
          {{ errorMsg }}
        </span>
      </div>

      <button
        type="button"
        class="btn-retry-small"
        @click="ambilData"
      >
        Coba Lagi
      </button>
    </div>


    <!-- LOADING -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="loading-spinner"></div>

      <p>
        Memuat data SPK...
      </p>
    </div>


    <!-- EMPTY -->
    <EmptyState
      v-else-if="daftarSpkFiltered.length === 0"
      :message="
        search
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data SPK'
      "
      :subtext="
        search
          ? 'Coba gunakan kata kunci lain'
          : 'Belum ada Surat Perintah Kerja yang dibuat'
      "
    />


    <!-- TABLE -->
    <div
      v-else
      class="table-card"
    >
      <div class="table-wrapper">

        <table class="data-table">

          <colgroup>
            <col class="col-no">
            <col class="col-nomor">
            <col class="col-tanggal">
            <col class="col-uid">
            <col class="col-bengkel">
            <col class="col-polisi">
            <col class="col-pekerjaan">
            <col class="col-pembuat">
            <col class="col-aksi">
          </colgroup>

          <thead>
            <tr>
              <th>No</th>
              <th>Nomor SPK</th>
              <th>Tanggal</th>
              <th>UID</th>
              <th>Bengkel</th>
              <th>No Polisi</th>
              <th>Perintah Kerja</th>
              <th>Dibuat Oleh</th>
              <th class="text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in daftarSpkFiltered"
              :key="item.id"
            >

              <!-- NO -->
              <td class="no-cell">
                <span class="number-badge">
                  {{ index + 1 }}
                </span>
              </td>


              <!-- NOMOR SPK -->
              <td class="nomor-spk-cell">
                <div class="nomor-spk">
                  <strong>
                    {{ item.nomorSpk || '-' }}
                  </strong>

                  <span>
                    Surat Perintah Kerja
                  </span>
                </div>
              </td>


              <!-- TANGGAL -->
              <td>
                <span
                  v-if="item.tanggal"
                  class="date-text"
                >
                  {{ formatTanggal(item.tanggal) }}
                </span>

                <span
                  v-else
                  class="empty-value"
                >
                  Belum ditentukan
                </span>
              </td>


              <!-- UID -->
              <td>
                <span
                  v-if="item.uid"
                  class="uid-text"
                >
                  {{ item.uid }}
                </span>

                <span
                  v-else
                  class="empty-value"
                >
                  -
                </span>
              </td>


              <!-- BENGKEL -->
              <td>
                <span class="primary-text">
                  {{ item.bengkel || '-' }}
                </span>
              </td>


              <!-- NO POLISI -->
              <td>
                <span
                  v-if="item.noPolisi"
                  class="polisi-badge"
                >
                  {{ item.noPolisi }}
                </span>

                <span
                  v-else
                  class="empty-value"
                >
                  -
                </span>
              </td>


              <!-- PEKERJAAN -->
              <td class="pekerjaan-cell">

                <div
                  v-if="
                    item.detail &&
                    item.detail.length > 0
                  "
                  class="pekerjaan-wrapper"
                >

                  <div class="pekerjaan-list">

                    <div
                      v-for="(detailItem, detailIndex) in item.detail"
                      :key="detailItem.id || detailIndex"
                      class="pekerjaan-item"
                    >

                      <span class="pekerjaan-number">
                        {{ detailIndex + 1 }}
                      </span>

                      <div class="pekerjaan-content">

                        <span class="pekerjaan-description">
                          {{
                            detailItem.deskripsi ||
                            'Tidak ada deskripsi'
                          }}
                        </span>

                        <span
                          v-if="detailItem.kategori"
                          class="kategori-badge"
                        >
                          {{ detailItem.kategori }}
                        </span>

                      </div>

                    </div>

                  </div>

                  <span
                    v-if="item.detail.length > 1"
                    class="jumlah-pekerjaan"
                  >
                    {{ item.detail.length }} pekerjaan
                  </span>

                </div>

                <span
                  v-else
                  class="empty-value"
                >
                  Belum ada perintah kerja
                </span>

              </td>


              <!-- DIBUAT OLEH -->
              <td class="pembuat-cell">
                <div class="pembuat-info">

                  <strong>
                    {{ item.createdBy || '-' }}
                  </strong>

                  <span>
                    Pembuat SPK
                  </span>

                </div>
              </td>


              <!-- AKSI -->
              <td class="action-cell">

                <div class="action-buttons">

                  <button
                    type="button"
                    class="btn-detail"
                    @click="lihatDetail(item.id)"
                  >
                    Detail
                  </button>

                  <button
                    type="button"
                    class="btn-edit"
                    @click="editSpk(item.id)"
                    title="Edit SPK"
                  >
                    Edit
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
  computed,
  onMounted
} from 'vue'

import {
  useRouter
} from 'vue-router'

import api from '../api'

import SearchInput from '../components/SearchInput.vue'
import EmptyState from '../components/EmptyState.vue'


/* =========================
   ROUTER
========================= */

const router = useRouter()


/* =========================
   DATA
========================= */

const daftarSpk = ref([])
const loading = ref(true)
const errorMsg = ref('')
const search = ref('')


/* =========================
   AMBIL DATA
========================= */

const ambilData = async () => {

  try {

    loading.value = true
    errorMsg.value = ''

    const response =
      await api.get('/spk')

    daftarSpk.value =
      Array.isArray(response.data)
        ? response.data
        : []

  } catch (error) {

    console.error(
      'Gagal mengambil data SPK:',
      error
    )

    errorMsg.value =
      'Data SPK tidak dapat dimuat.'

  } finally {

    loading.value = false

  }

}


/* =========================
   SEARCH
========================= */

const daftarSpkFiltered = computed(() => {

  const keyword =
    search.value
      .trim()
      .toLowerCase()

  if (!keyword) {
    return daftarSpk.value
  }

  return daftarSpk.value.filter(item => {

    const nomorSpk =
      String(
        item.nomorSpk || ''
      ).toLowerCase()

    const tanggal =
      String(
        item.tanggal || ''
      ).toLowerCase()

    const uid =
      String(
        item.uid || ''
      ).toLowerCase()

    const bengkel =
      String(
        item.bengkel || ''
      ).toLowerCase()

    const noPolisi =
      String(
        item.noPolisi || ''
      ).toLowerCase()

    const createdBy =
      String(
        item.createdBy || ''
      ).toLowerCase()

    const detail =
      (item.detail || [])
        .map(detailItem => {

          return [
            detailItem.deskripsi || '',
            detailItem.kategori || '',
            detailItem.keterangan || ''
          ].join(' ')

        })
        .join(' ')
        .toLowerCase()

    return (
      nomorSpk.includes(keyword) ||
      tanggal.includes(keyword) ||
      uid.includes(keyword) ||
      bengkel.includes(keyword) ||
      noPolisi.includes(keyword) ||
      createdBy.includes(keyword) ||
      detail.includes(keyword)
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
   DETAIL
========================= */

const lihatDetail = (id) => {

  router.push(
    `/spk/${id}`
  )

}


/* =========================
   EDIT
========================= */

const editSpk = (id) => {

  router.push(
    `/spk/edit/${id}`
  )

}


/* =========================
   TAMBAH
========================= */

const tambahSpk = () => {

  router.push(
    '/spk/tambah'
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

/* =====================================================
   PAGE
===================================================== */

.spk-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}


/* =====================================================
   HEADER
===================================================== */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 24px;
}

.page-eyebrow {
  display: block;

  margin-bottom: 5px;

  color: #2563eb;

  font-size: 10px;
  font-weight: 700;

  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0;

  color: #1e293b;

  font-size: 25px;
  font-weight: 700;

  line-height: 1.25;

  letter-spacing: -0.025em;
}

.page-header p {
  margin: 5px 0 0;

  color: #64748b;

  font-size: 13px;

  line-height: 1.5;
}


/* =====================================================
   BUTTON TAMBAH
===================================================== */

.btn-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;

  flex-shrink: 0;

  padding: 10px 15px;

  border: none;
  border-radius: 8px;

  background: #2563eb;

  color: white;

  font-family: inherit;

  font-size: 12px;
  font-weight: 700;

  cursor: pointer;

  box-shadow:
    0 3px 8px rgba(37, 99, 235, 0.16);

  transition:
    background-color 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.btn-add:hover {
  background: #1d4ed8;

  transform: translateY(-1px);

  box-shadow:
    0 5px 12px rgba(37, 99, 235, 0.2);
}

.btn-add-plus {
  font-size: 17px;
  font-weight: 400;

  line-height: 1;
}


/* =====================================================
   TOOLBAR
===================================================== */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  margin-bottom: 16px;
}

.search-container {
  width: 100%;
  max-width: 540px;
}

.total-data {
  display: flex;
  align-items: center;

  gap: 9px;

  padding: 8px 12px;

  border: 1px solid #e2e8f0;
  border-radius: 8px;

  background: #ffffff;

  white-space: nowrap;
}

.total-data span {
  color: #64748b;

  font-size: 11px;
  font-weight: 500;
}

.total-data strong {
  color: #2563eb;

  font-size: 13px;
  font-weight: 700;
}


/* =====================================================
   ERROR
===================================================== */

.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 15px;

  margin-bottom: 16px;

  padding: 12px 14px;

  border: 1px solid #fecaca;
  border-radius: 9px;

  background: #fef2f2;
}

.error-content {
  display: flex;
  flex-direction: column;

  gap: 2px;

  min-width: 0;
}

.error-content strong {
  color: #991b1b;

  font-size: 12px;
  font-weight: 700;
}

.error-content span {
  color: #b91c1c;

  font-size: 11px;
}

.btn-retry-small {
  flex-shrink: 0;

  padding: 6px 10px;

  border: 1px solid #fecaca;
  border-radius: 6px;

  background: #ffffff;

  color: #b91c1c;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background-color 0.15s ease;
}

.btn-retry-small:hover {
  background: #fff7f7;
}


/* =====================================================
   LOADING
===================================================== */

.loading-container {
  min-height: 220px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #64748b;
}

.loading-container p {
  margin: 0;

  font-size: 12px;
}

.loading-spinner {
  width: 28px;
  height: 28px;

  margin-bottom: 10px;

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


/* =====================================================
   TABLE CARD
===================================================== */

.table-card {
  width: 100%;

  border: 1px solid #e2e8f0;
  border-radius: 11px;

  background: #ffffff;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.04);

  overflow: hidden;
}


/* =====================================================
   TABLE WRAPPER
===================================================== */

.table-wrapper {
  width: 100%;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
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


/* =====================================================
   TABLE
===================================================== */

.data-table {
  width: max-content;

  min-width: 1180px;

  border-collapse: separate;
  border-spacing: 0;

  background: #ffffff;
}


/* =====================================================
   COLUMN
===================================================== */

.col-no {
  width: 58px;
}

.col-nomor {
  width: 155px;
}

.col-tanggal {
  width: 120px;
}

.col-uid {
  width: 120px;
}

.col-bengkel {
  width: 170px;
}

.col-polisi {
  width: 120px;
}

.col-pekerjaan {
  width: 350px;
}

.col-pembuat {
  width: 155px;
}

.col-aksi {
  width: 135px;
}


/* =====================================================
   TABLE HEADER
===================================================== */

.data-table th {
  padding: 12px 11px;

  background: #f8fafc;

  color: #475569;

  border-bottom: 1px solid #e2e8f0;

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  text-transform: uppercase;

  letter-spacing: 0.035em;

  white-space: nowrap;
}

.data-table th:first-child {
  padding-left: 16px;
}

.data-table th.text-center {
  text-align: center;
}


/* =====================================================
   TABLE BODY
===================================================== */

.data-table td {
  padding: 13px 11px;

  border-bottom: 1px solid #edf2f7;

  color: #475569;

  font-size: 12px;

  vertical-align: middle;

  box-sizing: border-box;

  overflow-wrap: anywhere;
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


/* =====================================================
   NO
===================================================== */

.no-cell {
  padding-left: 16px !important;
}

.number-badge {
  width: 26px;
  height: 26px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 6px;

  background: #f1f5f9;

  color: #64748b;

  font-size: 10px;
  font-weight: 700;
}


/* =====================================================
   NOMOR SPK
===================================================== */

.nomor-spk-cell {
  min-width: 155px;
}

.nomor-spk {
  display: flex;
  flex-direction: column;

  gap: 3px;

  min-width: 0;
}

.nomor-spk strong {
  color: #1e293b;

  font-size: 12px;
  font-weight: 700;

  line-height: 1.35;

  white-space: nowrap;
}

.nomor-spk span {
  color: #94a3b8;

  font-size: 9px;

  line-height: 1.3;
}


/* =====================================================
   TANGGAL
===================================================== */

.date-text {
  color: #334155;

  font-size: 11px;
  font-weight: 600;

  white-space: nowrap;
}

.empty-value {
  color: #94a3b8;

  font-size: 10px;

  font-style: italic;
}


/* =====================================================
   UID
===================================================== */

.uid-text {
  color: #2563eb;

  font-size: 11px;
  font-weight: 700;

  white-space: nowrap;
}


/* =====================================================
   GENERAL TEXT
===================================================== */

.primary-text {
  color: #334155;

  font-size: 11px;
  font-weight: 600;

  line-height: 1.4;
}


/* =====================================================
   NO POLISI
===================================================== */

.polisi-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 5px 8px;

  border: 1px solid #e2e8f0;
  border-radius: 6px;

  background: #f8fafc;

  color: #334155;

  font-size: 10px;
  font-weight: 700;

  white-space: nowrap;
}


/* =====================================================
   PEKERJAAN
===================================================== */

.pekerjaan-cell {
  min-width: 350px;
}

.pekerjaan-wrapper {
  display: flex;
  flex-direction: column;

  gap: 6px;

  min-width: 0;
}

.pekerjaan-list {
  display: flex;
  flex-direction: column;

  gap: 6px;
}

.pekerjaan-item {
  display: flex;
  align-items: flex-start;

  gap: 7px;

  min-width: 0;
}

.pekerjaan-number {
  width: 18px;
  height: 18px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  margin-top: 1px;

  border-radius: 5px;

  background: #eff6ff;

  color: #2563eb;

  font-size: 8px;
  font-weight: 700;
}

.pekerjaan-content {
  display: flex;
  align-items: flex-start;

  gap: 6px;

  flex-wrap: wrap;

  min-width: 0;
}

.pekerjaan-description {
  color: #334155;

  font-size: 11px;
  font-weight: 600;

  line-height: 1.4;

  overflow-wrap: anywhere;
}

.kategori-badge {
  display: inline-flex;
  align-items: center;

  padding: 2px 6px;

  border-radius: 5px;

  background: #f1f5f9;

  color: #64748b;

  font-size: 8px;
  font-weight: 700;

  white-space: nowrap;
}

.jumlah-pekerjaan {
  width: fit-content;

  padding: 3px 7px;

  border-radius: 5px;

  background: #f8fafc;

  color: #94a3b8;

  font-size: 8px;
  font-weight: 600;
}


/* =====================================================
   PEMBUAT
===================================================== */

.pembuat-cell {
  min-width: 155px;
}

.pembuat-info {
  display: flex;
  flex-direction: column;

  gap: 3px;

  min-width: 0;
}

.pembuat-info strong {
  color: #334155;

  font-size: 11px;
  font-weight: 700;

  line-height: 1.35;

  overflow-wrap: anywhere;
}

.pembuat-info span {
  color: #94a3b8;

  font-size: 8px;
}


/* =====================================================
   AKSI
===================================================== */

.action-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;
}

.btn-detail {
  padding: 7px 10px;

  border: 1px solid #bfdbfe;
  border-radius: 6px;

  background: #eff6ff;

  color: #2563eb;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.btn-detail:hover {
  background: #dbeafe;

  border-color: #93c5fd;
}

.btn-edit {
  padding: 7px 10px;

  border: 1px solid #e2e8f0;
  border-radius: 6px;

  background: #ffffff;

  color: #475569;

  font-family: inherit;

  font-size: 10px;
  font-weight: 700;

  cursor: pointer;

  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.btn-edit:hover {
  border-color: #bfdbfe;

  background: #f8fbff;

  color: #2563eb;
}


/* =====================================================
   TABLET
===================================================== */

@media (max-width: 1100px) {

  .page-header h1 {
    font-size: 22px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
  }

  .pekerjaan-cell {
    min-width: 320px;
  }

}


/* =====================================================
   MOBILE
===================================================== */

@media (max-width: 700px) {

  .page-header {
    align-items: stretch;

    flex-direction: column;

    gap: 14px;

    margin-bottom: 18px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .page-header p {
    font-size: 12px;
  }

  .btn-add {
    width: 100%;
  }

  .toolbar {
    align-items: stretch;

    flex-direction: column;

    gap: 10px;
  }

  .search-container {
    max-width: none;
  }

  .total-data {
    width: fit-content;
  }

  .error-message {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .btn-retry-small {
    margin-left: auto;
  }

  .table-card {
    border-radius: 9px;
  }

  .data-table {
    min-width: 1120px;
  }

  .data-table th {
    padding: 9px 7px;

    font-size: 9px;
  }

  .data-table td {
    padding: 9px 7px;

    font-size: 10px;
  }

  .number-badge {
    width: 24px;
    height: 24px;

    font-size: 9px;
  }

  .nomor-spk strong {
    font-size: 10px;
  }

  .nomor-spk span {
    font-size: 8px;
  }

  .date-text {
    font-size: 10px;
  }

  .uid-text {
    font-size: 10px;
  }

  .primary-text {
    font-size: 10px;
  }

  .polisi-badge {
    font-size: 9px;
  }

  .pekerjaan-description {
    font-size: 10px;
  }

  .pembuat-info strong {
    font-size: 9px;
  }

  .pembuat-info span {
    font-size: 7px;
  }

  .btn-detail,
  .btn-edit {
    padding: 6px 8px;

    font-size: 8px;
  }

}


/* =====================================================
   VERY SMALL
===================================================== */

@media (max-width: 500px) {

  .page-header h1 {
    font-size: 18px;
  }

  .page-header p {
    font-size: 11px;
  }

  .data-table {
    min-width: 1080px;
  }

  .data-table th,
  .data-table td {
    padding: 7px 5px;
  }

  .pekerjaan-cell {
    min-width: 290px;
  }

  .btn-detail,
  .btn-edit {
    padding: 5px 7px;

    font-size: 8px;
  }

}

</style>