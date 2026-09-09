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
    console.error('Gagal mengambil data emisi karbon:', error)

    errorMsg.value =
      'Gagal mengambil data: ' +
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
  <div class="emisi-page">

    <!-- PAGE HEADER -->
    <div class="page-header">

      <div>
        <div class="breadcrumb">
          DATA EMISI KARBON
        </div>

        <h1>
          Ringkasan Emisi Karbon
        </h1>

        <p>
          Ringkasan penggunaan kendaraan dan dampak emisi karbon.
        </p>
      </div>

    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="state-card"
    >
      <div class="state-title">
        Memuat data emisi karbon
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
    <div
      v-else-if="!dataEmisi"
      class="state-card"
    >
      <div class="state-title">
        Belum ada data emisi karbon
      </div>

      <div class="state-text">
        Data emisi karbon belum tersedia.
      </div>
    </div>

    <!-- DATA -->
    <template v-else>

      <!-- SUMMARY -->
      <section class="summary-card">

        <div class="summary-header">
          <div>
            <h2>
              Ringkasan Emisi
            </h2>

            <p>
              Informasi keseluruhan berdasarkan data kendaraan yang tersedia.
            </p>
          </div>
        </div>

        <div class="stats-grid">

          <!-- TOTAL KENDARAAN -->
          <div class="stat-card">

            <div class="stat-label">
              Total Kendaraan
            </div>

            <div class="stat-value">
              {{ formatAngka(dataEmisi.totalKendaraan) }}
            </div>

            <div class="stat-unit">
              kendaraan
            </div>

          </div>

          <!-- TOTAL JARAK -->
          <div class="stat-card">

            <div class="stat-label">
              Total Jarak Tempuh
            </div>

            <div class="stat-value">
              {{ formatAngka(dataEmisi.totalJarakTempuh) }}
            </div>

            <div class="stat-unit">
              kilometer
            </div>

          </div>

          <!-- EMISI EV -->
          <div class="stat-card">

            <div class="stat-label">
              Emisi EV
            </div>

            <div class="stat-value">
              {{ formatAngka(dataEmisi.totalEmisiEv) }}
            </div>

            <div class="stat-unit">
              kg CO₂
            </div>

          </div>

          <!-- EMISI ICE -->
          <div class="stat-card">

            <div class="stat-label">
              Emisi ICE
            </div>

            <div class="stat-value">
              {{ formatAngka(dataEmisi.totalEmisiIce) }}
            </div>

            <div class="stat-unit">
              kg CO₂
            </div>

          </div>

        </div>

      </section>

      <!-- DAMPAK -->
      <section class="impact-card">

        <div class="impact-header">

          <div>
            <h2>
              Dampak Penggunaan Kendaraan Listrik
            </h2>

            <p>
              Perbandingan pengurangan emisi dan estimasi reduksi biaya karbon.
            </p>
          </div>

        </div>

        <div class="impact-grid">

          <!-- PENURUNAN EMISI -->
          <div class="impact-item">

            <div class="impact-label">
              Penurunan Emisi
            </div>

            <div class="impact-value">
              {{ formatAngka(dataEmisi.totalPenurunanEmisi) }}
            </div>

            <div class="impact-unit">
              kg CO₂
            </div>

          </div>

          <!-- REDUKSI BIAYA -->
          <div class="impact-item">

            <div class="impact-label">
              Reduksi Biaya Karbon
            </div>

            <div class="impact-value">
              {{ formatRupiah(dataEmisi.totalRpReduksiCarbon) }}
            </div>

            <div class="impact-unit">
              estimasi reduksi biaya
            </div>

          </div>

        </div>

      </section>

    </template>

  </div>
</template>

<style scoped>
.emisi-page {
  width: 100%;
  max-width: 100%;
  padding: 0 0 32px;
  box-sizing: border-box;
}

/* =========================
   PAGE HEADER
========================= */

.page-header {
  margin-bottom: 24px;
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
   SUMMARY CARD
========================= */

.summary-card,
.impact-card {
  margin-bottom: 20px;
  padding: 26px 28px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.summary-header,
.impact-header {
  margin-bottom: 22px;
}

.summary-header h2,
.impact-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
}

.summary-header p,
.impact-header p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

/* =========================
   STATISTICS
========================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}

.stat-label {
  margin-bottom: 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.stat-value {
  color: #2563eb;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.stat-unit {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 13px;
}

/* =========================
   IMPACT
========================= */

.impact-card {
  margin-bottom: 0;
}

.impact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.impact-item {
  position: relative;
  min-width: 0;
  padding: 22px 24px;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    #f8fbff 0%,
    #eff6ff 100%
  );
}

.impact-label {
  margin-bottom: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
}

.impact-value {
  color: #1d4ed8;
  font-size: 27px;
  line-height: 1.2;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.impact-unit {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .summary-card,
  .impact-card {
    padding: 22px;
  }

  .impact-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 14px;
  }

  .summary-card,
  .impact-card {
    padding: 18px 16px;
    border-radius: 10px;
  }

  .summary-header h2,
  .impact-header h2 {
    font-size: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 18px;
  }

  .stat-value {
    font-size: 24px;
  }

  .impact-item {
    padding: 20px;
  }

  .impact-value {
    font-size: 24px;
  }
}
</style>