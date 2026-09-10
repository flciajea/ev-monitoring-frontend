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
    <template v-if="loading">

      <section class="data-section">

        <div class="section-header">
          <div>
            <div class="loading-line"></div>
            <div class="loading-line short"></div>
          </div>
        </div>

        <div class="stats-grid">
          <div
            v-for="n in 4"
            :key="n"
            class="stat-card skeleton-card"
          >
            <div class="skeleton-icon"></div>
            <div class="loading-line short"></div>
            <div class="loading-line tiny"></div>
          </div>
        </div>

      </section>

      <section class="data-section impact-section">

        <div class="section-header">
          <div>
            <div class="loading-line"></div>
            <div class="loading-line short"></div>
          </div>
        </div>

        <div class="impact-grid">
          <div
            v-for="n in 2"
            :key="n"
            class="impact-item skeleton-card"
          >
            <div class="skeleton-icon"></div>
            <div class="loading-line short"></div>
          </div>
        </div>

      </section>

    </template>


    <!-- =========================
         ERROR
    ========================== -->
    <section
      v-else-if="errorMsg"
      class="state-card error-state"
    >
      <div class="state-icon state-icon-error">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <path d="M12 16.5V16.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>

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
      <div class="state-icon state-icon-empty">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 19.5C4 17 7.5 15 12 15C16.5 15 20 17 20 19.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          <circle cx="12" cy="8.5" r="4" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>

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

            <div class="stat-icon stat-icon-neutral">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16V11L6 6H18L20 11V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 16H20V18.5C20 19.05 19.55 19.5 19 19.5H18C17.45 19.5 17 19.05 17 18.5V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 16V18.5C4 19.05 4.45 19.5 5 19.5H6C6.55 19.5 7 19.05 7 18.5V16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="7.5" cy="12.5" r="1.2" fill="currentColor" />
                <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" />
              </svg>
            </div>

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

            <div class="stat-icon stat-icon-neutral">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 20L9 4H11L8 20H4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                <path d="M16 20L13 4H15L20 20H16Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                <path d="M11.3 11H12.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                <path d="M10.6 15H13.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </div>

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

            <div class="stat-icon stat-icon-open">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 3L5 13.5H11L10 21L19 10H13L13 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
              </svg>
            </div>

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

            <div class="stat-icon stat-icon-cancel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 20V11L8 6H16L18 11V20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M6 20H18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                <path d="M9 3V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                <path d="M13 3V6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </div>

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


        <!-- =========================
             PERBANDINGAN EMISI
        ========================== -->
        <div
          v-if="totalEmisiKeseluruhan > 0"
          class="ratio-card"
        >

          <div class="ratio-header">

            <span class="ratio-title">
              Kontribusi Emisi EV vs ICE
            </span>

            <span class="ratio-subtitle">
              Berdasarkan total emisi kg CO&#8322;
            </span>

          </div>


          <div class="ratio-bar">

            <div
              class="ratio-bar-ev"
              :style="{ width: persentaseEv + '%' }"
            ></div>

            <div
              class="ratio-bar-ice"
              :style="{ width: persentaseIce + '%' }"
            ></div>

          </div>


          <div class="ratio-legend">

            <div class="ratio-legend-item">
              <span class="ratio-dot ratio-dot-ev"></span>

              <span>
                EV — {{ persentaseEv }}%
              </span>
            </div>

            <div class="ratio-legend-item">
              <span class="ratio-dot ratio-dot-ice"></span>

              <span>
                ICE — {{ persentaseIce }}%
              </span>
            </div>

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

            <div class="impact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C12 21 5 15.5 5 10C5 5 8.5 3 12 3C15.5 3 19 5 19 10C19 15.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
                <path d="M12 6.5V13.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                <path d="M9 10.5L12 13.5L15 10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>

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

            <div class="impact-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" />
                <path d="M12 7V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                <path d="M9.5 14.5C9.5 15.6 10.6 16 12 16C13.4 16 14.5 15.4 14.5 14.3C14.5 13.2 13.5 12.9 12 12.5C10.5 12.1 9.5 11.8 9.5 10.7C9.5 9.6 10.6 9 12 9C13.4 9 14.5 9.4 14.5 10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </div>

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
import { ref, onMounted, computed } from 'vue'
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
   PERBANDINGAN EV vs ICE
========================= */

const totalEmisiKeseluruhan = computed(() => {

  const ev = Number(dataEmisi.value?.totalEmisiEv) || 0
  const ice = Number(dataEmisi.value?.totalEmisiIce) || 0

  return ev + ice
})


const persentaseEv = computed(() => {

  if (totalEmisiKeseluruhan.value <= 0) {
    return 0
  }

  const ev = Number(dataEmisi.value?.totalEmisiEv) || 0

  return Math.round(
    (ev / totalEmisiKeseluruhan.value) * 100
  )
})


const persentaseIce = computed(() => {

  return 100 - persentaseEv.value
})


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
  min-height: 128px;

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


/* =========================
   STAT ICON
========================= */

.stat-icon {
  width: 34px;
  height: 34px;

  margin-bottom: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  flex-shrink: 0;
}


.stat-icon-neutral {
  background: #f1f5f9;

  color: #64748b;
}


.stat-icon-open {
  background: #eff6ff;

  color: #2563eb;
}


.stat-icon-cancel {
  background: #fef2f2;

  color: #dc2626;
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
   RATIO CARD
========================= */

.ratio-card {
  margin-top: 18px;

  padding: 20px 22px;

  border: 1px solid #e5eaf1;

  border-radius: 12px;

  background: #f8fafc;
}


.ratio-header {
  margin-bottom: 14px;

  display: flex;
  flex-direction: column;

  gap: 3px;
}


.ratio-title {
  color: #172033;

  font-size: 13.5px;
  font-weight: 700;
}


.ratio-subtitle {
  color: #94a3b8;

  font-size: 12px;
}


.ratio-bar {
  display: flex;

  width: 100%;
  height: 10px;

  overflow: hidden;

  border-radius: 999px;

  background: #e2e8f0;
}


.ratio-bar-ev {
  background: #3b82f6;

  transition: width 0.3s ease;
}


.ratio-bar-ice {
  background: #ef4444;

  transition: width 0.3s ease;
}


.ratio-legend {
  display: flex;
  align-items: center;

  gap: 20px;

  margin-top: 12px;
}


.ratio-legend-item {
  display: flex;
  align-items: center;

  gap: 7px;

  color: #475569;

  font-size: 12.5px;
  font-weight: 600;
}


.ratio-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  flex-shrink: 0;
}


.ratio-dot-ev {
  background: #3b82f6;
}


.ratio-dot-ice {
  background: #ef4444;
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


.impact-icon {
  width: 38px;
  height: 38px;

  margin-bottom: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #dbeafe;

  color: #1d4ed8;

  flex-shrink: 0;
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


.state-icon {
  width: 52px;
  height: 52px;

  margin: 0 auto 16px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;
}


.state-icon-error {
  background: #fef2f2;

  color: #dc2626;
}


.state-icon-empty {
  background: #f1f5f9;

  color: #94a3b8;
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

  border-radius: 5px;

  background: #edf2f7;

  animation: pulse 1.4s infinite ease-in-out;
}


.loading-line.short {
  width: 110px;

  margin-top: 8px;
}


.loading-line.tiny {
  width: 70px;
  height: 10px;

  margin-top: 8px;
}


.loading-table {
  width: 90%;
  height: 180px;

  margin: 28px auto 0;

  border-radius: 8px;

  background: #f8fafc;

  animation: pulse 1.4s infinite ease-in-out;
}


.skeleton-card {
  align-items: flex-start;
}


.skeleton-icon {
  width: 34px;
  height: 34px;

  margin-bottom: 12px;

  border-radius: 9px;

  background: #edf2f7;

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
    min-height: 110px;

    padding: 15px;
  }


  .stat-value {
    font-size: 22px;
  }


  .ratio-card {
    padding: 16px 18px;
  }


  .ratio-legend {
    flex-wrap: wrap;

    gap: 12px;
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