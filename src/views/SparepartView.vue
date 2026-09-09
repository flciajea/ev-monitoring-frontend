<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

const daftarSparepart = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

/* =========================
   FILTER
========================= */

const filteredSparepart = computed(() => {
  const query = searchQuery.value
    .trim()
    .toLowerCase()

  if (!query) {
    return daftarSparepart.value
  }

  return daftarSparepart.value.filter(item => {
    const searchableText = [
      item.id,
      item.namaSparepart,
      item.fUsed ? 'digunakan' : 'tidak digunakan'
    ]
      .filter(
        value =>
          value !== null &&
          value !== undefined
      )
      .join(' ')
      .toLowerCase()

    return searchableText.includes(query)
  })
})

/* =========================
   STATISTICS
========================= */

const totalSparepart = computed(() =>
  daftarSparepart.value.length
)

const totalDigunakan = computed(() =>
  daftarSparepart.value.filter(
    item => item.fUsed === true
  ).length
)

const totalTidakDigunakan = computed(() =>
  daftarSparepart.value.filter(
    item => item.fUsed !== true
  ).length
)

/* =========================
   AMBIL DATA
========================= */

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/sparepart')

    daftarSparepart.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {
    console.error(error)

    errorMsg.value =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      'Gagal mengambil data sparepart.'

  } finally {
    loading.value = false
  }
}

/* =========================
   INIT
========================= */

onMounted(() => {
  ambilData()
})
</script>


<template>
  <div class="sparepart-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">

      <div class="header-content">

        <p class="page-eyebrow">
          Master Data
        </p>

        <h1>
          Daftar Sparepart
        </h1>

        <p class="page-description">
          Data sparepart yang tersedia dalam sistem
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
          {{ totalSparepart }}
        </strong>

      </div>


      <div class="stat-card stat-used">

        <span class="stat-label">
          Digunakan
        </span>

        <strong class="stat-value">
          {{ totalDigunakan }}
        </strong>

      </div>


      <div class="stat-card stat-unused">

        <span class="stat-label">
          Tidak Digunakan
        </span>

        <strong class="stat-value">
          {{ totalTidakDigunakan }}
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
          placeholder="Cari nama sparepart..."
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

          <h2>
            Data Sparepart
          </h2>

          <p>
            {{ filteredSparepart.length }}
            data ditemukan
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

        <h3>
          Data tidak dapat dimuat
        </h3>

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
        v-else-if="filteredSparepart.length === 0"
        class="state-card empty-state"
      >

        <h3>
          Tidak ada data sparepart
        </h3>

        <p v-if="searchQuery">
          Tidak ditemukan sparepart yang sesuai
          dengan pencarian.
        </p>

        <p v-else>
          Belum terdapat data sparepart dalam sistem.
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

            <col class="col-nama" />

            <col class="col-status" />

          </colgroup>


          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Nama Sparepart
              </th>

              <th>
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="item in filteredSparepart"
              :key="item.id"
            >

              <!-- ID -->
              <td>

                <span class="id-text">
                  {{ item.id }}
                </span>

              </td>


              <!-- NAMA -->
              <td>

                <div class="sparepart-name">
                  {{ item.namaSparepart || '-' }}
                </div>

              </td>


              <!-- STATUS -->
              <td>

                <span
                  class="status-badge"
                  :class="
                    item.fUsed
                      ? 'status-used'
                      : 'status-unused'
                  "
                >
                  {{
                    item.fUsed
                      ? 'Digunakan'
                      : 'Tidak digunakan'
                  }}
                </span>

              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>

  </div>
</template>


<style scoped>

/* =========================
   PAGE
========================= */

.sparepart-page {
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
    repeat(3, minmax(0, 1fr));

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

.stat-used {
  border-top: 3px solid #22c55e;
}


.stat-unused {
  border-top: 3px solid #94a3b8;
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
}


.data-table {
  width: 100%;

  border-collapse: collapse;

  table-layout: fixed;
}


.col-id {
  width: 15%;
}


.col-nama {
  width: 60%;
}


.col-status {
  width: 25%;
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


/* =========================
   ID
========================= */

.id-text {
  color: #64748b;

  font-size: 12px;

  font-weight: 650;
}


/* =========================
   NAMA SPAREPART
========================= */

.sparepart-name {
  color: #172033;

  font-size: 13px;

  font-weight: 650;

  line-height: 1.5;
}


/* =========================
   STATUS
========================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  min-height: 32px;

  padding: 7px 10px;

  box-sizing: border-box;

  border-radius: 8px;

  font-size: 11px;

  font-weight: 700;
}


/* DIGUNAKAN */

.status-used {
  color: #15803d;

  background: #f0fdf4;

  border: 1px solid #bbf7d0;
}


/* TIDAK DIGUNAKAN */

.status-unused {
  color: #64748b;

  background: #f1f5f9;

  border: 1px solid #cbd5e1;
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

  .sparepart-page {
    padding: 28px 26px 40px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }

}


@media (max-width: 768px) {

  .sparepart-page {
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


  .data-table {
    min-width: 560px;
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


  .stat-card:first-child {
    grid-column: span 2;
  }

}

</style>