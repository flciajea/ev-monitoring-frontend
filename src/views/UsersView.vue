<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

const daftarUsers = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

// =========================
// FILTER
// =========================

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  if (!q) {
    return daftarUsers.value
  }

  return daftarUsers.value.filter(user =>
    user.username?.toLowerCase().includes(q) ||
    user.namaLengkap?.toLowerCase().includes(q) ||
    user.email?.toLowerCase().includes(q) ||
    user.unit?.toLowerCase().includes(q) ||
    user.uid?.toLowerCase().includes(q) ||
    user.up3?.toLowerCase().includes(q) ||
    user.noKendaraan?.toLowerCase().includes(q)
  )
})

// =========================
// AMBIL DATA
// =========================

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/users')

    daftarUsers.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {
    console.error('Error ambil users:', error)

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

// =========================
// INIT
// =========================

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div class="users-page">

    <!-- PAGE HEADER -->
    <div class="page-header">

      <div class="header-content">

        <div class="breadcrumb">
          DATA USERS
        </div>

        <h1>
          Daftar Users
        </h1>

        <p>
          Data pengguna yang terdaftar dalam sistem.
        </p>

      </div>

    </div>


    <!-- TOOLBAR -->
    <div class="toolbar">

      <div class="search-container">

        <SearchInput
          v-model="searchQuery"
          placeholder="Cari username, nama, email, unit, UID, UP3, atau kendaraan..."
        />

      </div>

      <div class="total-info">

        <span class="total-label">
          Total
        </span>

        <span class="total-value">
          {{ filteredUsers.length }}
        </span>

      </div>

    </div>


    <!-- LOADING -->
    <div
      v-if="loading"
      class="state-card"
    >

      <div class="state-title">
        Memuat data users
      </div>

      <div class="state-text">
        Silakan tunggu sebentar.
      </div>

    </div>


    <!-- ERROR -->
    <div
      v-else-if="errorMsg"
      class="error-card"
    >

      <div class="error-title">
        Data tidak dapat dimuat
      </div>

      <div class="error-message">
        {{ errorMsg }}
      </div>

    </div>


    <!-- EMPTY -->
    <EmptyState
      v-else-if="filteredUsers.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data user'
      "
      :subtext="
        searchQuery
          ? 'Coba gunakan kata kunci lain'
          : 'Belum ada data pengguna'
      "
    />


    <!-- TABLE CARD -->
    <section
      v-else
      class="table-card"
    >

      <div class="table-header">

        <div>
          <h2>
            Data Pengguna
          </h2>

          <p>
            Menampilkan {{ filteredUsers.length }} pengguna.
          </p>
        </div>

      </div>


      <div class="table-wrapper">

        <table class="data-table">

          <colgroup>
            <col class="col-id" />
            <col class="col-username" />
            <col class="col-nama" />
            <col class="col-email" />
            <col class="col-unit" />
            <col class="col-uid" />
            <col class="col-up3" />
            <col class="col-kendaraan" />
            <col class="col-status" />
          </colgroup>


          <thead>

            <tr>

              <th class="center">
                ID
              </th>

              <th>
                Username
              </th>

              <th>
                Nama Lengkap
              </th>

              <th>
                Email
              </th>

              <th>
                Unit
              </th>

              <th>
                UID
              </th>

              <th>
                UP3
              </th>

              <th>
                No. Kendaraan
              </th>

              <th class="center">
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            <tr
              v-for="user in filteredUsers"
              :key="user.id"
            >

              <!-- ID -->
              <td class="center">

                <span class="id-text">
                  {{ user.id }}
                </span>

              </td>


              <!-- USERNAME -->
              <td>

                <span class="primary-text">
                  {{ user.username || '-' }}
                </span>

              </td>


              <!-- NAMA -->
              <td>

                <span class="normal-text">
                  {{ user.namaLengkap || '-' }}
                </span>

              </td>


              <!-- EMAIL -->
              <td>

                <span
                  class="email-text"
                  :title="user.email || ''"
                >
                  {{ user.email || '-' }}
                </span>

              </td>


              <!-- UNIT -->
              <td>

                <span class="normal-text">
                  {{ user.unit || '-' }}
                </span>

              </td>


              <!-- UID -->
              <td>

                <span
                  v-if="user.uid"
                  class="code-text"
                >
                  {{ user.uid }}
                </span>

                <span
                  v-else
                  class="muted-text"
                >
                  -
                </span>

              </td>


              <!-- UP3 -->
              <td>

                <span class="normal-text">
                  {{ user.up3 || '-' }}
                </span>

              </td>


              <!-- KENDARAAN -->
              <td>

                <span
                  v-if="user.noKendaraan"
                  class="vehicle-text"
                >
                  {{ user.noKendaraan }}
                </span>

                <span
                  v-else
                  class="muted-text"
                >
                  -
                </span>

              </td>


              <!-- STATUS -->
              <td class="center">

                <span
                  class="status-badge"
                  :class="
                    user.active
                      ? 'active'
                      : 'inactive'
                  "
                >

                  <span class="status-dot"></span>

                  {{ user.active ? 'Aktif' : 'Nonaktif' }}

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

.users-page {
  width: 100%;
  max-width: 100%;
  padding: 0 0 32px;
  box-sizing: border-box;
}


/* =========================
   PAGE HEADER
========================= */

.page-header {
  margin-bottom: 22px;
}

.header-content {
  min-width: 0;
}

.breadcrumb {
  margin-bottom: 7px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.page-header h1 {
  margin: 0;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.25;
  font-weight: 700;
}

.page-header p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
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
}

.search-container {
  flex: 1;
  min-width: 0;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
  height: 42px;
  padding: 0 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.total-label {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.total-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 7px;
  border-radius: 6px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}


/* =========================
   STATE
========================= */

.state-card {
  padding: 44px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.state-title {
  color: #334155;
  font-size: 15px;
  font-weight: 600;
}

.state-text {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}


/* =========================
   ERROR
========================= */

.error-card {
  padding: 16px 18px;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 10px;
  background: #fffafa;
}

.error-title {
  margin-bottom: 4px;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 700;
}

.error-message {
  color: #7f1d1d;
  font-size: 14px;
  line-height: 1.5;
}


/* =========================
   TABLE CARD
========================= */

.table-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #e2e8f0;
}

.table-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
}

.table-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
}


/* =========================
   TABLE
========================= */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.data-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}


/* =========================
   COLUMN WIDTH
========================= */

.col-id {
  width: 55px;
}

.col-username {
  width: 115px;
}

.col-nama {
  width: 155px;
}

.col-email {
  width: 190px;
}

.col-unit {
  width: 115px;
}

.col-uid {
  width: 105px;
}

.col-up3 {
  width: 110px;
}

.col-kendaraan {
  width: 125px;
}

.col-status {
  width: 100px;
}


/* =========================
   TABLE HEADER
========================= */

.data-table th {
  height: 52px;
  padding: 0 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

.data-table th.center {
  text-align: center;
}


/* =========================
   TABLE DATA
========================= */

.data-table td {
  height: 58px;
  padding: 10px 14px;
  border-bottom: 1px solid #eef2f7;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: #f8fbff;
}


/* =========================
   TEXT
========================= */

.center {
  text-align: center !important;
}

.id-text {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.primary-text {
  display: block;
  overflow: hidden;
  color: #0f172a;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.normal-text {
  display: block;
  overflow: hidden;
  color: #334155;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-text {
  display: block;
  overflow: hidden;
  color: #475569;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  padding: 4px 7px;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
}

.vehicle-text {
  display: inline-block;
  color: #0f172a;
  font-weight: 600;
  white-space: nowrap;
}

.muted-text {
  color: #94a3b8;
}


/* =========================
   STATUS
========================= */

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 72px;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  box-sizing: border-box;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.active {
  background: #ecfdf3;
  color: #15803d;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #dc2626;
}


/* =========================
   TABLET
========================= */

@media (max-width: 900px) {
  .toolbar {
    align-items: stretch;
  }

  .total-info {
    height: 40px;
  }

  .table-header {
    padding: 18px;
  }
}


/* =========================
   MOBILE
========================= */

@media (max-width: 650px) {
  .page-header {
    margin-bottom: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 14px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .total-info {
    align-self: flex-start;
  }

  .table-card {
    border-radius: 10px;
  }

  .table-header {
    padding: 17px 16px;
  }

  .table-header h2 {
    font-size: 17px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .data-table {
    min-width: 1050px;
  }
}
</style>