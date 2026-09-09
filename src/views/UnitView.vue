<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

const daftarUnit = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

// =========================
// FILTER
// =========================

const filteredUnit = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  if (!q) {
    return daftarUnit.value
  }

  return daftarUnit.value.filter(unit =>
    unit.namaUnit?.toLowerCase().includes(q) ||
    unit.kodeUnit?.toLowerCase().includes(q) ||
    unit.tipeUnit?.toLowerCase().includes(q)
  )
})

// =========================
// AMBIL DATA
// =========================

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/unit')
    daftarUnit.value = response.data
  } catch (error) {
    console.error('Gagal mengambil data unit:', error)

    errorMsg.value =
      'Gagal mengambil data: ' +
      (error.response?.data?.error || error.message)
  } finally {
    loading.value = false
  }
}

// =========================
// INIT
// =========================

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div class="unit-page">

    <!-- PAGE HEADER -->
    <div class="page-header">
      <div>
        <div class="breadcrumb">
          DATA UNIT
        </div>

        <h1>Daftar Unit</h1>

        <p class="page-subtitle">
          Informasi unit kendaraan yang terdaftar dalam sistem.
        </p>
      </div>
    </div>

    <!-- TOOLBAR -->
    <div class="toolbar">
      <div class="search-wrapper">
        <SearchInput
          v-model="searchQuery"
          placeholder="Cari nama unit, kode, atau tipe..."
        />
      </div>

      <div class="data-count">
        <span>{{ filteredUnit.length }}</span>
        data unit
      </div>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="state-card"
    >
      <div class="loading-spinner"></div>
      <p>Memuat data unit...</p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="errorMsg"
      class="error-card"
    >
      <div class="error-title">
        Gagal Memuat Data
      </div>

      <p>{{ errorMsg }}</p>

      <button
        type="button"
        class="retry-button"
        @click="ambilData"
      >
        Coba Lagi
      </button>
    </div>

    <!-- EMPTY -->
    <div
      v-else-if="filteredUnit.length === 0"
      class="empty-card"
    >
      <EmptyState
        :message="
          searchQuery
            ? 'Tidak ada hasil ditemukan'
            : 'Belum ada data unit'
        "
        :subtext="
          searchQuery
            ? 'Coba gunakan kata kunci pencarian lain.'
            : 'Belum terdapat data unit dalam sistem.'
        "
      />
    </div>

    <!-- TABLE -->
    <div
      v-else
      class="table-card"
    >
      <!-- TABLE HEADER -->
      <div class="table-card-header">
        <div>
          <h2>Data Unit</h2>
          <p>
            Daftar unit yang tersedia dalam sistem.
          </p>
        </div>

        <div class="table-total">
          {{ filteredUnit.length }} unit
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-wrapper">
        <table class="data-table">

          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th>Nama Unit</th>
              <th>Kode Unit</th>
              <th>Tipe Unit</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="unit in filteredUnit"
              :key="unit.id"
            >
              <td class="id-cell">
                {{ unit.id }}
              </td>

              <td class="name-cell">
                {{ unit.namaUnit || '-' }}
              </td>

              <td>
                <span
                  v-if="unit.kodeUnit"
                  class="code-badge"
                >
                  {{ unit.kodeUnit }}
                </span>

                <span
                  v-else
                  class="empty-value"
                >
                  -
                </span>
              </td>

              <td>
                <span
                  v-if="unit.tipeUnit"
                  class="type-badge"
                >
                  {{ unit.tipeUnit }}
                </span>

                <span
                  v-else
                  class="empty-value"
                >
                  -
                </span>
              </td>
            </tr>
          </tbody>

        </table>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* =========================
   PAGE
========================= */

.unit-page {
  width: 100%;
  max-width: 100%;
}

/* =========================
   HEADER
========================= */

.page-header {
  margin-bottom: 26px;
}

.breadcrumb {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 7px;
}

.page-header h1 {
  margin: 0;
  color: #172033;
  font-size: 27px;
  line-height: 1.25;
  font-weight: 700;
}

.page-subtitle {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

/* =========================
   TOOLBAR
========================= */

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;

  margin-bottom: 18px;
  padding: 14px 16px;

  background: #ffffff;
  border: 1px solid #e5eaf0;
  border-radius: 12px;
}

.search-wrapper {
  width: min(420px, 100%);
}

.data-count {
  flex-shrink: 0;

  color: #64748b;
  font-size: 13px;
  white-space: nowrap;
}

.data-count span {
  color: #172033;
  font-weight: 700;
}

/* =========================
   TABLE CARD
========================= */

.table-card {
  background: #ffffff;
  border: 1px solid #e5eaf0;
  border-radius: 14px;
  overflow: hidden;

  box-shadow:
    0 2px 8px rgba(15, 23, 42, 0.03);
}

.table-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 19px 20px;

  border-bottom: 1px solid #e9edf2;
}

.table-card-header h2 {
  margin: 0;
  color: #172033;
  font-size: 16px;
  font-weight: 700;
}

.table-card-header p {
  margin: 5px 0 0;
  color: #7a8797;
  font-size: 12px;
}

.table-total {
  flex-shrink: 0;

  padding: 6px 10px;

  color: #2b7cd3;
  background: #edf6ff;

  border: 1px solid #d7eaff;
  border-radius: 7px;

  font-size: 12px;
  font-weight: 600;
}

/* =========================
   TABLE
========================= */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.data-table {
  width: 100%;
  min-width: 680px;

  border-collapse: collapse;
  table-layout: auto;
}

.data-table th {
  padding: 13px 18px;

  background: #f7f9fc;

  border-bottom: 1px solid #e5eaf0;

  color: #64748b;

  text-align: left;
  white-space: nowrap;

  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 15px 18px;

  border-bottom: 1px solid #edf0f4;

  color: #39465a;

  font-size: 13px;
  line-height: 1.5;

  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr {
  transition: background-color 0.15s ease;
}

.data-table tbody tr:hover {
  background: #f8fbff;
}

/* =========================
   COLUMN
========================= */

.col-id {
  width: 80px;
}

.id-cell {
  color: #7a8797 !important;
  font-weight: 500;
}

.name-cell {
  color: #263449 !important;
  font-weight: 600;
}

/* =========================
   BADGES
========================= */

.code-badge {
  display: inline-flex;
  align-items: center;

  padding: 5px 9px;

  color: #315b83;
  background: #f1f6fb;

  border: 1px solid #dce8f3;
  border-radius: 6px;

  font-size: 12px;
  font-weight: 600;
}

.type-badge {
  display: inline-flex;
  align-items: center;

  padding: 5px 9px;

  color: #526174;
  background: #f5f7fa;

  border: 1px solid #e3e8ee;
  border-radius: 6px;

  font-size: 12px;
  font-weight: 500;
}

.empty-value {
  color: #a0a9b5;
}

/* =========================
   STATES
========================= */

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 240px;

  background: #ffffff;
  border: 1px solid #e5eaf0;
  border-radius: 14px;
}

.state-card p {
  margin: 13px 0 0;

  color: #64748b;
  font-size: 13px;
}

.loading-spinner {
  width: 28px;
  height: 28px;

  border: 3px solid #e5edf5;
  border-top-color: #2b7cd3;
  border-radius: 50%;

  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================
   ERROR
========================= */

.error-card {
  padding: 20px;

  background: #ffffff;
  border: 1px solid #f0d5d2;
  border-radius: 14px;
}

.error-title {
  color: #b42318;
  font-size: 14px;
  font-weight: 700;
}

.error-card p {
  margin: 6px 0 15px;

  color: #7a4a46;
  font-size: 13px;
  line-height: 1.5;
}

.retry-button {
  padding: 8px 14px;

  border: 1px solid #d0d5dd;
  border-radius: 7px;

  background: #ffffff;
  color: #344054;

  font-size: 12px;
  font-weight: 600;

  cursor: pointer;
  transition: all 0.15s ease;
}

.retry-button:hover {
  background: #f8fafc;
  border-color: #98a2b3;
}

/* =========================
   EMPTY
========================= */

.empty-card {
  min-height: 240px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: #ffffff;
  border: 1px solid #e5eaf0;
  border-radius: 14px;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 768px) {
  .page-header {
    margin-bottom: 20px;
  }

  .page-header h1 {
    font-size: 23px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .search-wrapper {
    width: 100%;
  }

  .data-count {
    text-align: right;
  }

  .table-card-header {
    padding: 16px;
  }

  .table-card-header p {
    display: none;
  }

  .data-table {
    min-width: 600px;
  }

  .data-table th,
  .data-table td {
    padding: 12px 14px;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 21px;
  }

  .breadcrumb {
    font-size: 10px;
  }

  .table-card-header {
    align-items: flex-start;
  }

  .table-total {
    font-size: 11px;
  }
}
</style>