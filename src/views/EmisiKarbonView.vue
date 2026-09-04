<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const dataEmisi = ref(null)
const loading = ref(true)
const errorMsg = ref('')

const ambilData = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get('/emisi-karbon')

    if (response.data?.length > 0) {
      dataEmisi.value = response.data[0]
    } else {
      dataEmisi.value = null
    }

  } catch (error) {
    errorMsg.value =
      'Gagal ambil data: ' +
      (error.response?.data?.error || error.message)

  } finally {
    loading.value = false
  }
}

const formatAngka = (angka) => {
  if (angka === null || angka === undefined) {
    return '0'
  }

  return Number(angka).toLocaleString('id-ID')
}

const formatRupiah = (angka) => {
  if (angka === null || angka === undefined) {
    return 'Rp 0'
  }

  return 'Rp ' + Number(angka).toLocaleString('id-ID')
}

onMounted(() => {
  ambilData()
})
</script>


<template>
  <div>

    <div class="header-row">
      <h2>
        Ringkasan Emisi Karbon
      </h2>
    </div>


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


    <!-- DATA KOSONG -->

    <div
      v-else-if="!dataEmisi"
      class="empty-state"
    >
      Belum ada data emisi karbon.
    </div>


    <!-- STATISTIK -->

    <div
      v-else
      class="stats-grid"
    >

      <div class="stat-card">

        <div class="stat-label">
          Total Kendaraan
        </div>

        <div class="stat-value">
          {{ formatAngka(dataEmisi.totalKendaraan) }}
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Total Jarak Tempuh
        </div>

        <div class="stat-value">
          {{ formatAngka(dataEmisi.totalJarakTempuh) }}
          km
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Emisi EV
        </div>

        <div class="stat-value">
          {{ formatAngka(dataEmisi.totalEmisiEv) }}
          kg CO₂
        </div>

      </div>


      <div class="stat-card">

        <div class="stat-label">
          Emisi ICE (Estimasi)
        </div>

        <div class="stat-value">
          {{ formatAngka(dataEmisi.totalEmisiIce) }}
          kg CO₂
        </div>

      </div>


      <div class="stat-card highlight">

        <div class="stat-label">
          Penurunan Emisi
        </div>

        <div class="stat-value">
          {{ formatAngka(dataEmisi.totalPenurunanEmisi) }}
          kg CO₂
        </div>

      </div>


      <div class="stat-card highlight">

        <div class="stat-label">
          Reduksi Biaya Karbon
        </div>

        <div class="stat-value">
          {{ formatRupiah(dataEmisi.totalRpReduksiCarbon) }}
        </div>

      </div>

    </div>

  </div>
</template>


<style scoped>

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 20px;
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

.empty-state {
  background: white;

  padding: 30px;

  border-radius: 12px;

  text-align: center;

  color: #718096;

  box-shadow:
    0 2px 12px
    rgba(58, 141, 222, 0.08);
}

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(
      auto-fit,
      minmax(220px, 1fr)
    );

  gap: 16px;
}

.stat-card {
  background: white;

  padding: 20px;

  border-radius: 12px;

  box-shadow:
    0 2px 12px
    rgba(58, 141, 222, 0.08);
}

.stat-card.highlight {
  background:
    linear-gradient(
      135deg,
      #eaf4ff 0%,
      #ffffff 100%
    );

  border: 1px solid #cfe4fb;
}

.stat-label {
  font-size: 13px;

  color: #718096;

  font-weight: 600;

  margin-bottom: 8px;

  text-transform: uppercase;

  letter-spacing: 0.02em;
}

.stat-value {
  font-size: 24px;

  font-weight: 700;

  color: #2b7cd3;
}

</style>