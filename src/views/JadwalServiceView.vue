<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

import EmptyState from '../components/EmptyState.vue'
import SearchInput from '../components/SearchInput.vue'

const daftarJadwal = ref([])
const loading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')

// =========================
// SEARCH
// =========================

const filteredJadwal = computed(() => {
  const q = searchQuery.value
    .toLowerCase()
    .trim()

  if (!q) {
    return daftarJadwal.value
  }

  return daftarJadwal.value.filter((jadwal) => {
    return (
      jadwal.nomorKendaraan
        ?.toLowerCase()
        .includes(q) ||

      jadwal.dealer
        ?.toLowerCase()
        .includes(q) ||

      jadwal.picDriver
        ?.toLowerCase()
        .includes(q) ||

      jadwal.keterangan
        ?.toLowerCase()
        .includes(q)
    )
  })
})

// =========================
// FORMAT TANGGAL
// =========================

const formatTanggal = (tanggal) => {
  if (!tanggal) {
    return '-'
  }

  const date = new Date(tanggal)

  if (Number.isNaN(date.getTime())) {
    return tanggal
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// =========================
// AMBIL DATA
// =========================

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/jadwal-service')

    daftarJadwal.value = Array.isArray(response.data)
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

      <h2>
        Daftar Jadwal Service
      </h2>

    </div>


    <!-- SEARCH -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nomor kendaraan, dealer, PIC driver..."
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
      v-else-if="filteredJadwal.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada jadwal service'
      "
      :subtext="
        searchQuery
          ? 'Coba kata kunci lain'
          : 'Belum ada jadwal service'
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

            <th>ID</th>

            <th>
              Nomor Kendaraan
            </th>

            <th>
              Dealer
            </th>

            <th>
              KM
            </th>

            <th>
              PIC Driver
            </th>

            <th>
              Tanggal Service
            </th>

            <th>
              Keterangan
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="jadwal in filteredJadwal"
            :key="jadwal.id"
          >

            <td>
              {{ jadwal.id }}
            </td>

            <td>
              <strong>
                {{ jadwal.nomorKendaraan || '-' }}
              </strong>
            </td>

            <td>
              {{ jadwal.dealer || '-' }}
            </td>

            <td>
              {{ jadwal.km ?? '-' }}
            </td>

            <td>
              {{ jadwal.picDriver || '-' }}
            </td>

            <td>
              {{ formatTanggal(jadwal.tanggalService) }}
            </td>

            <td>
              {{ jadwal.keterangan || '-' }}
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

  min-width: 900px;

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

  padding: 12px 10px;

  text-align: left;

  font-size: 11px;

  font-weight: 700;

  text-transform: uppercase;

  letter-spacing: 0.02em;

  white-space: nowrap;
}


/* =========================
   DATA TABLE
========================= */

td {
  padding: 12px 10px;

  border-top: 1px solid #eef4fa;

  font-size: 13px;

  color: #384454;

  vertical-align: middle;

  word-break: break-word;
}

tbody tr:hover td {
  background-color: #f7fbff;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1200px) {

  th,
  td {
    padding: 10px 8px;
  }

  th {
    font-size: 10px;
  }

  td {
    font-size: 12px;
  }

}

</style>