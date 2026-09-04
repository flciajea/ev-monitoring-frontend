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
  <div>

    <!-- HEADER -->

    <div class="header-row">

      <h2>
        Daftar Unit
      </h2>

    </div>


    <!-- SEARCH -->

    <SearchInput
      v-model="searchQuery"
      placeholder="Cari nama unit, kode, atau tipe..."
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
      v-else-if="filteredUnit.length === 0"
      :message="
        searchQuery
          ? 'Tidak ada hasil ditemukan'
          : 'Belum ada data unit'
      "
      :subtext="
        searchQuery
          ? 'Coba kata kunci lain'
          : 'Belum ada data unit'
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
              Nama Unit
            </th>

            <th>
              Kode Unit
            </th>

            <th>
              Tipe
            </th>

          </tr>

        </thead>


        <tbody>

          <tr
            v-for="unit in filteredUnit"
            :key="unit.id"
          >

            <td>
              {{ unit.id }}
            </td>

            <td>
              {{ unit.namaUnit || '-' }}
            </td>

            <td>
              {{ unit.kodeUnit || '-' }}
            </td>

            <td>
              {{ unit.tipeUnit || '-' }}
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

.error-text {
  color: #e74c3c;

  background: #fdecea;

  padding: 10px 14px;

  border-radius: 8px;

  font-size: 14px;
}

.table-wrapper {
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
    rgba(58, 141, 222, 0.08);
}

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

td {
  padding: 14px 16px;

  border-top: 1px solid #eef4fa;

  font-size: 14px;

  color: #384454;
}

tr:hover td {
  background-color: #f7fbff;
}

</style>