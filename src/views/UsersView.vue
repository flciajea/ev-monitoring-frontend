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

    <!-- =========================
         HEADER
    ========================= -->

    <div class="header-row">

      <div>

        <h2>
          Daftar Users
        </h2>

        <p class="subtitle">
          Data pengguna sistem
        </p>

      </div>

    </div>


    <!-- =========================
         SEARCH
    ========================= -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari username, nama, email, unit, UID, UP3, atau kendaraan..."
    />


    <!-- =========================
         LOADING
    ========================= -->

    <p
      v-if="loading"
      class="loading-text"
    >
      Loading data users...
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


    <!-- =========================
         TABLE
    ========================= -->

    <div
      v-else
      class="table-wrapper"
    >

      <table>

        <thead>

          <tr>

            <th class="col-id">
              ID
            </th>

            <th class="col-username">
              Username
            </th>

            <th class="col-nama">
              Nama Lengkap
            </th>

            <th class="col-email">
              Email
            </th>

            <th class="col-unit">
              Unit
            </th>

            <th class="col-uid">
              UID
            </th>

            <th class="col-up3">
              UP3
            </th>

            <th class="col-kendaraan">
              No. Kendaraan
            </th>

            <th class="col-status">
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

            <td class="text-center">
              {{ user.id }}
            </td>


            <!-- USERNAME -->

            <td>
              <strong>
                {{ user.username || '-' }}
              </strong>
            </td>


            <!-- NAMA -->

            <td>
              {{ user.namaLengkap || '-' }}
            </td>


            <!-- EMAIL -->

            <td class="email-cell">
              {{ user.email || '-' }}
            </td>


            <!-- UNIT -->

            <td>
              {{ user.unit || '-' }}
            </td>


            <!-- UID -->

            <td>
              {{ user.uid || '-' }}
            </td>


            <!-- UP3 -->

            <td>
              {{ user.up3 || '-' }}
            </td>


            <!-- KENDARAAN -->

            <td>
              <strong
                v-if="user.noKendaraan"
                class="kendaraan-text"
              >
                {{ user.noKendaraan }}
              </strong>

              <span v-else>
                -
              </span>
            </td>


            <!-- STATUS -->

            <td class="text-center">

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

  </div>
</template>


<style scoped>

/* =========================
   PAGE
========================= */

.users-page {
  width: 100%;
}


/* =========================
   HEADER
========================= */

.header-row {
  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 16px;
}

h2 {
  margin: 0;

  color: #2b7cd3;

  font-size: 22px;

  font-weight: 700;
}

.subtitle {
  margin: 4px 0 0;

  color: #718096;

  font-size: 13px;
}


/* =========================
   LOADING
========================= */

.loading-text {
  text-align: center;

  color: #718096;

  padding: 30px;
}


/* =========================
   ERROR
========================= */

.error-text {
  color: #e74c3c;

  background: #fdecea;

  border: 1px solid #f5c6c2;

  padding: 10px 14px;

  border-radius: 8px;

  font-size: 14px;
}


/* =========================
   TABLE
========================= */

.table-wrapper {
  width: 100%;

  overflow: hidden;

  margin-top: 15px;
}

table {
  width: 100%;

  table-layout: fixed;

  border-collapse: collapse;

  background: white;

  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 2px 12px
    rgba(58, 141, 222, 0.08);
}


/* =========================
   COLUMN WIDTH
========================= */

.col-id {
  width: 5%;
}

.col-username {
  width: 10%;
}

.col-nama {
  width: 14%;
}

.col-email {
  width: 17%;
}

.col-unit {
  width: 10%;
}

.col-uid {
  width: 11%;
}

.col-up3 {
  width: 11%;
}

.col-kendaraan {
  width: 12%;
}

.col-status {
  width: 10%;
}


/* =========================
   HEADER TABLE
========================= */

th {
  background-color: #eaf4ff;

  color: #2b7cd3;

  padding: 12px 8px;

  text-align: left;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.02em;

  line-height: 1.25;

  word-break: break-word;
}


/* =========================
   DATA
========================= */

td {
  padding: 12px 8px;

  border-top: 1px solid #eef4fa;

  font-size: 12px;

  color: #384454;

  vertical-align: middle;

  line-height: 1.4;

  word-break: break-word;

  overflow-wrap: anywhere;
}

tbody tr:hover td {
  background-color: #f7fbff;
}


/* =========================
   TEXT
========================= */

.text-center {
  text-align: center;
}

.email-cell {
  word-break: break-all;

  font-size: 11px;
}

.kendaraan-text {
  white-space: nowrap;
}


/* =========================
   STATUS
========================= */

.status-badge {
  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 5px;

  padding: 5px 8px;

  border-radius: 12px;

  font-size: 10px;

  font-weight: 600;

  white-space: nowrap;
}

.status-dot {
  width: 6px;

  height: 6px;

  border-radius: 50%;

  background: currentColor;
}

.status-badge.active {
  background: #e5f7ed;

  color: #219653;
}

.status-badge.inactive {
  background: #fdecea;

  color: #e74c3c;
}


/* =========================
   TABLET
========================= */

@media (max-width: 1200px) {

  th {
    padding: 10px 6px;

    font-size: 10px;
  }

  td {
    padding: 10px 6px;

    font-size: 11px;
  }

  .email-cell {
    font-size: 10px;
  }

  .status-badge {
    font-size: 9px;

    padding: 4px 6px;
  }

}


/* =========================
   MOBILE
========================= */

@media (max-width: 700px) {

  .table-wrapper {
    overflow: hidden;
  }

  table {
    font-size: 10px;
  }

  th {
    padding: 8px 4px;

    font-size: 9px;
  }

  td {
    padding: 8px 4px;

    font-size: 10px;
  }

  .status-badge {
    font-size: 8px;

    padding: 4px 5px;
  }

  .status-dot {
    width: 5px;

    height: 5px;
  }

}

</style>