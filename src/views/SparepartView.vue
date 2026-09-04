<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

const daftarSparepart = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

// =========================
// FILTER
// =========================

const filteredSparepart = computed(() => {
  const query = searchQuery.value
    .trim()
    .toLowerCase()

  if (!query) {
    return daftarSparepart.value
  }

  return daftarSparepart.value.filter(item =>
    item.namaSparepart
      ?.toLowerCase()
      .includes(query)
  )
})

// =========================
// AMBIL DATA
// =========================

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/sparepart')

    daftarSparepart.value = Array.isArray(response.data)
      ? response.data
      : []

  } catch (error) {
    errorMsg.value =
      'Gagal mengambil data: ' +
      (
        error.response?.data?.error ||
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
  <div>

    <!-- HEADER -->

    <div class="header-row">

      <div>

        <h2>
          Daftar Sparepart
        </h2>

        <p class="subtitle">
          Data sparepart yang tersedia dalam sistem
        </p>

      </div>

    </div>


    <!-- SEARCH -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nama sparepart..."
    />


    <!-- LOADING -->

    <p v-if="loading">
      Loading...
    </p>


    <!-- ERROR -->

    <p
      v-else-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>


    <!-- EMPTY -->

    <EmptyState
      v-else-if="filteredSparepart.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data sparepart'
      "
      :subtext="
        searchQuery
          ? 'Coba kata kunci lain'
          : 'Belum ada data sparepart'
      "
    />


    <!-- TABLE -->

    <div
      v-else
      class="table-wrapper"
    >

      <table>

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

            <td>
              {{ item.id }}
            </td>

            <td>
              <strong>
                {{ item.namaSparepart || '-' }}
              </strong>
            </td>

            <td>

              <span
                class="status-badge"
                :class="
                  item.fUsed
                    ? 'aktif'
                    : 'nonaktif'
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

  </div>
</template>


<style scoped>

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 16px;

  flex-wrap: wrap;
  gap: 10px;
}

h2 {
  color: #2b7cd3;

  font-size: 22px;

  margin: 0;
}

.subtitle {
  margin: 4px 0 0;

  color: #718096;

  font-size: 13px;
}


/* =========================
   ERROR
========================= */

.error-text {
  color: #e74c3c;

  background: #fdecea;

  padding: 10px 14px;

  border-radius: 8px;

  font-size: 14px;
}


/* =========================
   TABLE
========================= */

.table-wrapper {
  width: 100%;

  overflow-x: auto;
}

table {
  width: 100%;

  border-collapse: collapse;

  background: white;

  border-radius: 12px;

  overflow: hidden;

  box-shadow:
    0 2px 12px
    rgba(
      58,
      141,
      222,
      0.08
    );
}


/* =========================
   HEADER TABLE
========================= */

th {
  background-color: #eaf4ff;

  color: #2b7cd3;

  padding: 14px 16px;

  text-align: left;

  font-size: 13px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.03em;
}


/* =========================
   DATA TABLE
========================= */

td {
  padding: 14px 16px;

  border-top: 1px solid #eef4fa;

  font-size: 14px;

  color: #384454;
}

tbody tr:hover td {
  background-color: #f7fbff;
}


/* =========================
   STATUS
========================= */

.status-badge {
  display: inline-block;

  padding: 4px 10px;

  border-radius: 12px;

  font-size: 11px;

  font-weight: 600;
}

.status-badge.aktif {
  background-color: #e3f9e5;

  color: #1e9e3a;
}

.status-badge.nonaktif {
  background-color: #fdecea;

  color: #e74c3c;
}

</style>