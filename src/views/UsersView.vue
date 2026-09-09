<template>
  <div class="users-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Data Users</p>

        <h1>Daftar Users</h1>

        <p class="page-description">
          Data pengguna yang terdaftar dalam sistem
        </p>
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
          placeholder="Cari username, nama, email, unit, UID, UP3, atau kendaraan..."
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
          <h2>Data Pengguna</h2>

          <p>
            {{ filteredUsers.length }} data ditemukan
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
        v-else-if="filteredUsers.length === 0"
        class="state-card empty-state"
      >
        <h3>Tidak ada data user</h3>

        <p v-if="searchQuery">
          Tidak ditemukan user yang sesuai dengan pencarian.
        </p>

        <p v-else>
          Belum ada data pengguna dalam sistem.
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
              <th>ID</th>
              <th>Username</th>
              <th>Nama Lengkap</th>
              <th>Email</th>
              <th>Unit</th>
              <th>UID</th>
              <th>UP3</th>
              <th>No. Kendaraan</th>
              <th>Status</th>
            </tr>
          </thead>


          <tbody>

            <tr
              v-for="user in filteredUsers"
              :key="user.id"
            >

              <!-- ID -->
              <td>

                <span class="id-number">
                  {{ user.id }}
                </span>

              </td>


              <!-- USERNAME -->
              <td>

                <span class="vehicle-number">
                  {{ user.username || '-' }}
                </span>

              </td>


              <!-- NAMA -->
              <td>

                <span class="date-text">
                  {{ user.namaLengkap || '-' }}
                </span>

              </td>


              <!-- EMAIL -->
              <td>

                <span
                  class="date-text"
                  :title="user.email || ''"
                >
                  {{ user.email || '-' }}
                </span>

              </td>


              <!-- UNIT -->
              <td>

                <span class="date-text">
                  {{ user.unit || '-' }}
                </span>

              </td>


              <!-- UID -->
              <td>

                <span
                  v-if="user.uid"
                  class="follow-date"
                >
                  {{ user.uid }}
                </span>

                <span
                  v-else
                  class="empty-text"
                >
                  -
                </span>

              </td>


              <!-- UP3 -->
              <td>

                <span class="date-text">
                  {{ user.up3 || '-' }}
                </span>

              </td>


              <!-- KENDARAAN -->
              <td>

                <span
                  v-if="user.noKendaraan"
                  class="vehicle-number"
                >
                  {{ user.noKendaraan }}
                </span>

                <span
                  v-else
                  class="empty-text"
                >
                  -
                </span>

              </td>


              <!-- STATUS -->
              <td>

                <span
                  class="status-badge"
                  :class="
                    user.active
                      ? 'status-close'
                      : 'status-cancel'
                  "
                >
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


<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'


/* =========================
   STATE
========================= */

const daftarUsers = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')


/* =========================
   FILTER
========================= */

const filteredUsers = computed(() => {

  const keyword = searchQuery.value
    .trim()
    .toLowerCase()

  if (!keyword) {
    return daftarUsers.value
  }

  return daftarUsers.value.filter(user => {

    const searchableText = [
      user.username,
      user.namaLengkap,
      user.email,
      user.unit,
      user.uid,
      user.up3,
      user.noKendaraan
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
   AMBIL DATA
========================= */

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
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Terjadi kesalahan saat mengambil data users.'

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


<style scoped>

/* =========================
   PAGE
========================= */

.users-page {
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

.btn-secondary {
  border: none;
  border-radius: 9px;

  padding: 11px 17px;

  font-size: 14px;
  font-weight: 650;

  cursor: pointer;

  transition: 0.2s ease;

  background: #eef2f7;
  color: #374151;
}


.btn-secondary:hover {
  background: #e2e8f0;
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

  min-width: 1050px;

  border-collapse: collapse;

  table-layout: fixed;
}


/* =========================
   COLUMN
========================= */

.col-id {
  width: 6%;
}

.col-username {
  width: 12%;
}

.col-nama {
  width: 15%;
}

.col-email {
  width: 18%;
}

.col-unit {
  width: 11%;
}

.col-uid {
  width: 10%;
}

.col-up3 {
  width: 10%;
}

.col-kendaraan {
  width: 10%;
}

.col-status {
  width: 8%;
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

  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
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

.id-number {
  color: #94a3b8;

  font-size: 12px;
  font-weight: 650;
}


/* =========================
   TEXT
========================= */

.vehicle-number {
  color: #27364a;

  font-size: 13px;
  font-weight: 720;
}


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
   STATUS
========================= */

.status-badge {
  display: inline-flex;
  align-items: center;

  min-height: 30px;

  box-sizing: border-box;

  padding: 6px 10px;

  border-radius: 8px;

  font-size: 11px;
  font-weight: 700;
}


.status-close {
  color: #15803d;

  background: #f0fdf4;

  border: 1px solid #bbf7d0;
}


.status-cancel {
  color: #b91c1c;

  background: #fef2f2;

  border: 1px solid #fecaca;
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

  .users-page {
    padding: 28px 26px 40px;
  }

}


@media (max-width: 768px) {

  .users-page {
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


  .section-header {
    padding: 18px;
  }

}

</style>