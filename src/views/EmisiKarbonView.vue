<template>
  <div class="emisi-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Data Emisi Karbon</p>

        <h1>Ringkasan Emisi Karbon</h1>

        <p class="page-description">
          Ringkasan penggunaan kendaraan dan dampak emisi karbon
        </p>
      </div>
    </section>


    <!-- =========================
         LOADING
    ========================== -->
    <section
      v-if="loading"
      class="state-card"
    >
      <div class="loading-line"></div>
      <div class="loading-line short"></div>
      <div class="loading-table"></div>
    </section>


    <!-- =========================
         ERROR
    ========================== -->
    <section
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
    </section>


    <!-- =========================
         EMPTY
    ========================== -->
    <section
      v-else-if="!dataEmisi"
      class="state-card empty-state"
    >
      <h3>Belum ada data emisi karbon</h3>

      <p>
        Data emisi karbon belum tersedia.
      </p>
    </section>


    <!-- =========================
         DATA
    ========================== -->
    <template v-else>

      <!-- =========================
           SUMMARY
      ========================== -->
      <section class="data-section">

        <div class="section-header">

          <div>
            <h2>Ringkasan Emisi</h2>

            <p>
              Informasi keseluruhan berdasarkan data kendaraan yang tersedia
            </p>
          </div>

        </div>


        <div class="stats-grid">

          <!-- TOTAL KENDARAAN -->
          <div class="stat-card">

            <span class="stat-label">
              Total Kendaraan
            </span>

            <strong class="stat-value">
              {{ formatAngka(dataEmisi.totalKendaraan) }}
            </strong>

            <span class="stat-unit">
              kendaraan
            </span>

          </div>


          <!-- TOTAL JARAK -->
          <div class="stat-card">

            <span class="stat-label">
              Total Jarak Tempuh
            </span>

            <strong class="stat-value">
              {{ formatAngka(dataEmisi.totalJarakTempuh) }}
            </strong>

            <span class="stat-unit">
              kilometer
            </span>

          </div>


          <!-- EMISI EV -->
          <div class="stat-card stat-open">

            <span class="stat-label">
              Emisi EV
            </span>

            <strong class="stat-value">
              {{ formatAngka(dataEmisi.totalEmisiEv) }}
            </strong>

            <span class="stat-unit">
              kg CO&#8322;
            </span>

          </div>


          <!-- EMISI ICE -->
          <div class="stat-card stat-cancel">

            <span class="stat-label">
              Emisi ICE
            </span>

            <strong class="stat-value">
              {{ formatAngka(dataEmisi.totalEmisiIce) }}
            </strong>

            <span class="stat-unit">
              kg CO&#8322;
            </span>

          </div>

        </div>

      </section>


      <!-- =========================
           DAMPAK
      ========================== -->
      <section class="data-section impact-section">

        <div class="section-header">

          <div>
            <h2>Dampak Penggunaan Kendaraan Listrik</h2>

            <p>
              Perbandingan pengurangan emisi dan estimasi reduksi biaya karbon
            </p>
          </div>

        </div>


        <div class="impact-grid">

          <!-- PENURUNAN EMISI -->
          <div class="impact-item">

            <span class="impact-label">
              Penurunan Emisi
            </span>

            <strong class="impact-value">
              {{ formatAngka(dataEmisi.totalPenurunanEmisi) }}
            </strong>

            <span class="impact-unit">
              kg CO&#8322;
            </span>

          </div>


          <!-- REDUKSI BIAYA -->
          <div class="impact-item">

            <span class="impact-label">
              Reduksi Biaya Karbon
            </span>

            <strong class="impact-value">
              {{ formatRupiah(dataEmisi.totalRpReduksiCarbon) }}
            </strong>

            <span class="impact-unit">
              estimasi reduksi biaya
            </span>

          </div>

        </div>

      </section>

    </template>

  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'


/* =========================
   STATE
========================= */

const dataEmisi = ref(null)
const loading = ref(true)
const errorMsg = ref('')


/* =========================
   AMBIL DATA
========================= */

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
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Terjadi kesalahan saat mengambil data emisi karbon.'

  } finally {

    loading.value = false
  }
}


/* =========================
   FORMAT
========================= */

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

.emisi-page {
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
   DATA SECTION
========================= */

.data-section {
  margin-bottom: 20px;

  padding: 22px 24px 24px;

  background: white;

  border: 1px solid #e5eaf1;

  border-radius: 14px;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.035);
}


.impact-section {
  margin-bottom: 0;
}


.section-header {
  margin-bottom: 18px;
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
   STATISTICS
========================= */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 14px;
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

  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}


.stat-card:hover {
  border-color: #cbd5e1;

  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.05);

  transform: translateY(-1px);
}


.stat-open {
  border-top: 3px solid #3b82f6;
}


.stat-cancel {
  border-top: 3px solid #ef4444;
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
  line-height: 1.2;

  font-weight: 750;

  overflow-wrap: anywhere;
}


.stat-unit {
  margin-top: 6px;

  color: #94a3b8;

  font-size: 12px;
}


/* =========================
   IMPACT
========================= */

.impact-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 16px;
}


.impact-item {
  min-width: 0;

  padding: 22px 24px;

  border: 1px solid #bfdbfe;

  border-radius: 12px;

  background: linear-gradient(
    135deg,
    #f8fbff 0%,
    #eff6ff 100%
  );

  display: flex;
  flex-direction: column;
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

  font-weight: 750;

  overflow-wrap: anywhere;
}


.impact-unit {
  margin-top: 6px;

  color: #64748b;

  font-size: 13px;
}


/* =========================
   STATES
========================= */

.state-card {
  padding: 50px 24px;

  text-align: center;

  background: white;

  border: 1px solid #e5eaf1;

  border-radius: 14px;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.035);
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


.empty-state p {
  margin-bottom: 0;
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

  .emisi-page {
    padding: 28px 26px 40px;
  }


  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}


@media (max-width: 768px) {

  .emisi-page {
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


  .data-section {
    padding: 18px;
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


  .impact-grid {
    grid-template-columns: 1fr;
  }


  .impact-item {
    padding: 20px;
  }


  .impact-value {
    font-size: 24px;
  }

}


@media (max-width: 480px) {

  .stats-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

}

</style>