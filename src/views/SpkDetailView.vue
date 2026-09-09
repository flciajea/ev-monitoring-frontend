<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '../api'

const route = useRoute()
const router = useRouter()

const spk = ref(null)
const loading = ref(true)
const errorMsg = ref('')

const ambilData = async () => {
  try {
    loading.value = true
    errorMsg.value = ''

    const response = await api.get(`/spk/${route.params.id}`)

    spk.value = response.data
  } catch (error) {
    console.error('Gagal mengambil detail SPK:', error)
    errorMsg.value = 'Data SPK tidak dapat dimuat.'
  } finally {
    loading.value = false
  }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'

  const date = new Date(tanggal)

  if (isNaN(date.getTime())) return tanggal

  const hari = String(date.getDate()).padStart(2, '0')
  const bulan = String(date.getMonth() + 1).padStart(2, '0')
  const tahun = date.getFullYear()

  return `${hari}/${bulan}/${tahun}`
}

const kembali = () => {
  router.push('/spk')
}

/* =========================
   DOWNLOAD PDF
========================= */

const downloadPdf = () => {
  if (!spk.value) return

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()

  /*
   * HEADER
   */

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)

  doc.text(
    'PT GERBANG SINERGI PRIMA',
    pageWidth / 2,
    18,
    { align: 'center' }
  )

  doc.setFontSize(14)

  doc.text(
    'SURAT PERINTAH KERJA',
    pageWidth / 2,
    27,
    { align: 'center' }
  )

  doc.setLineWidth(0.5)

  doc.line(
    15,
    32,
    pageWidth - 15,
    32
  )

  /*
   * INFORMASI SPK
   */

  let y = 42

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)

  doc.text('Informasi SPK', 15, y)

  y += 8

  const nomorSpk = spk.value.nomorSpk || '-'
  const tanggal = formatTanggal(spk.value.tanggal)
  const uid = spk.value.uid || '-'
  const bengkel = spk.value.bengkel || '-'
  const noPolisi = spk.value.noPolisi || '-'

  /*
   * KOLOM KIRI
   */

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)

  doc.text('Nomor SPK', 15, y)

  doc.setFont('helvetica', 'normal')
  doc.text(`: ${nomorSpk}`, 45, y)

  doc.setFont('helvetica', 'bold')
  doc.text('Tanggal', 15, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.text(`: ${tanggal}`, 45, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.text('UID', 15, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.text(`: ${uid}`, 45, y + 14)

  /*
   * KOLOM KANAN
   */

  doc.setFont('helvetica', 'bold')
  doc.text('Bengkel', 110, y)

  doc.setFont('helvetica', 'normal')
  doc.text(`: ${bengkel}`, 135, y)

  doc.setFont('helvetica', 'bold')
  doc.text('No Polisi', 110, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.text(`: ${noPolisi}`, 135, y + 7)

  /*
   * DAFTAR PEKERJAAN
   */

  y += 28

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)

  doc.text(
    'Daftar Perintah Kerja',
    15,
    y
  )

  y += 4

  const detail = spk.value.detail || []

  const rows = detail.map((item, index) => [
    index + 1,
    item.deskripsi || '-',
    item.kategori || '-',
    item.keterangan || '-'
  ])

  /*
   * TABEL PDF
   */

  autoTable(doc, {
    startY: y,

    head: [[
      'No',
      'Deskripsi Keluhan / Jenis Pekerjaan',
      'Kategori',
      'Keterangan'
    ]],

    body: rows,

    theme: 'grid',

    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 3,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      valign: 'middle'
    },

    headStyles: {
      fontStyle: 'bold',
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      halign: 'center'
    },

    columnStyles: {
      0: {
        cellWidth: 10,
        halign: 'center'
      },

      1: {
        cellWidth: 65
      },

      2: {
        cellWidth: 30
      },

      3: {
        cellWidth: 75
      }
    },

    margin: {
      left: 15,
      right: 15
    }
  })

  /*
   * FOOTER
   */

  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  doc.text(
    'Dokumen Surat Perintah Kerja',
    pageWidth / 2,
    pageHeight - 12,
    { align: 'center' }
  )

  /*
   * NAMA FILE
   */

  const namaFile = spk.value.nomorSpk
    ? `SPK-${spk.value.nomorSpk}.pdf`
    : `SPK-${spk.value.id}.pdf`

  doc.save(namaFile)
}

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div class="spk-detail-page">

    <!-- PAGE HEADER -->
    <div class="page-header">

      <div class="header-content">

        <span class="page-eyebrow">DATA SPK</span>

        <h1>
          Detail Surat Perintah Kerja
        </h1>

        <p>
          Informasi lengkap surat perintah kerja dan pekerjaan bengkel.
        </p>

      </div>

      <div class="header-actions">

        <button
          type="button"
          class="btn-download"
          :disabled="loading || !spk"
          @click="downloadPdf"
        >
          Download PDF
        </button>

        <button
          type="button"
          class="btn-back"
          @click="kembali"
        >
          Kembali
        </button>

      </div>

    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="loading-container"
    >
      <div class="loading-spinner"></div>
      <p>Memuat data SPK...</p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="errorMsg"
      class="state-card error-card"
    >

      <div class="state-title">
        Data tidak dapat dimuat
      </div>

      <div class="state-text">
        {{ errorMsg }}
      </div>

      <button
        type="button"
        class="btn-back state-button"
        @click="kembali"
      >
        Kembali ke SPK
      </button>

    </div>

    <!-- DATA -->
    <template v-else-if="spk">

      <!-- INFORMASI SPK -->
      <section class="content-card">

        <div class="section-header">

          <div>
            <h2>
              Informasi Surat Perintah Kerja
            </h2>

            <p>
              Informasi utama dari surat perintah kerja.
            </p>
          </div>

        </div>

        <div class="info-grid">

          <div class="info-item">
            <span class="info-label">
              Nomor SPK
            </span>

            <span class="info-value">
              {{ spk.nomorSpk || '-' }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">
              Tanggal
            </span>

            <span class="info-value">
              {{ formatTanggal(spk.tanggal) }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">
              UID
            </span>

            <span class="info-value">
              {{ spk.uid || '-' }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">
              Bengkel
            </span>

            <span class="info-value">
              {{ spk.bengkel || '-' }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">
              No Polisi
            </span>

            <span class="info-value">
              {{ spk.noPolisi || '-' }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">
              Dibuat Oleh
            </span>

            <span class="info-value">
              {{ spk.createdBy || '-' }}
            </span>
          </div>

        </div>

      </section>

      <!-- DAFTAR PEKERJAAN -->
      <section class="content-card">

        <div class="section-header work-header">

          <div>
            <h2>
              Daftar Perintah Kerja
            </h2>

            <p>
              Daftar pekerjaan yang akan dilakukan oleh bengkel.
            </p>
          </div>

          <div class="work-count">

            <span class="count-label">
              Jumlah pekerjaan
            </span>

            <span class="count-value">
              {{ spk.detail?.length || 0 }}
            </span>

          </div>

        </div>

        <div class="table-wrapper">

          <table class="data-table">

            <colgroup>
              <col class="col-no" />
              <col class="col-deskripsi" />
              <col class="col-kategori" />
              <col class="col-keterangan" />
            </colgroup>

            <thead>
              <tr>
                <th class="center">
                  No
                </th>

                <th>
                  Deskripsi Keluhan / Jenis Pekerjaan
                </th>

                <th>
                  Kategori
                </th>

                <th>
                  Keterangan
                </th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="(item, index) in spk.detail"
                :key="item.id || index"
              >

                <td class="center">
                  <span class="number-badge">
                    {{ index + 1 }}
                  </span>
                </td>

                <td class="deskripsi">
                  <div class="main-text">
                    {{ item.deskripsi || '-' }}
                  </div>
                </td>

                <td>
                  <span
                    v-if="item.kategori"
                    class="category-text"
                  >
                    {{ item.kategori }}
                  </span>

                  <span
                    v-else
                    class="muted-text"
                  >
                    -
                  </span>
                </td>

                <td class="keterangan">
                  <span
                    v-if="item.keterangan"
                    class="description-text"
                  >
                    {{ item.keterangan }}
                  </span>

                  <span
                    v-else
                    class="muted-text"
                  >
                    -
                  </span>
                </td>

              </tr>

              <tr
                v-if="!spk.detail || spk.detail.length === 0"
              >

                <td
                  colspan="4"
                  class="empty-row"
                >
                  Belum ada detail pekerjaan.
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </section>

    </template>

  </div>
</template>

<style scoped>
.spk-detail-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* =========================
   PAGE HEADER
========================= */

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}

.header-content {
  min-width: 0;
}

.page-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0;
  color: #1e293b;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.page-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* =========================
   BUTTON
========================= */

.btn-download,
.btn-back {
  height: 40px;
  padding: 0 15px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.btn-download {
  border: none;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.16);
}

.btn-download:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(37, 99, 235, 0.2);
}

.btn-back {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
}

.btn-back:hover:not(:disabled) {
  border-color: #bfdbfe;
  background: #f8fbff;
  color: #2563eb;
}

.btn-download:active:not(:disabled),
.btn-back:active:not(:disabled) {
  transform: translateY(0);
}

.btn-download:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* =========================
   LOADING
========================= */

.loading-container {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.loading-container p {
  margin: 0;
  font-size: 12px;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  margin-bottom: 10px;
  border: 3px solid #dbeafe;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* =========================
   STATE (ERROR)
========================= */

.state-card {
  padding: 36px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.state-title {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.state-text {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.error-card {
  border-color: #fecaca;
  background: #fef2f2;
}

.error-card .state-title {
  color: #991b1b;
}

.error-card .state-text {
  color: #b91c1c;
}

.state-button {
  margin-top: 18px;
}

/* =========================
   CONTENT CARD
========================= */

.content-card {
  margin-bottom: 20px;
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 700;
}

.section-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

/* =========================
   INFORMATION
========================= */

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  overflow: hidden;
}

.info-item {
  min-width: 0;
  padding: 15px 18px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.info-item:nth-child(3n) {
  border-right: none;
}

.info-item:nth-last-child(-n + 3) {
  border-bottom: none;
}

.info-label {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.info-value {
  display: block;
  overflow-wrap: anywhere;
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
}

/* =========================
   WORK HEADER
========================= */

.work-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.work-count {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-shrink: 0;
}

.count-label {
  color: #64748b;
  font-size: 12px;
}

.count-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  box-sizing: border-box;
}

/* =========================
   TABLE
========================= */

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f8fafc;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.data-table {
  width: 100%;
  min-width: 740px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.col-no {
  width: 60px;
}

.col-deskripsi {
  width: 38%;
}

.col-kategori {
  width: 20%;
}

.col-keterangan {
  width: 32%;
}

.data-table th {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.035em;
  white-space: nowrap;
}

.data-table td {
  padding: 14px;
  border-bottom: 1px solid #edf2f7;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  line-height: 1.5;
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: #f8fbff;
}

.center {
  text-align: center !important;
}

/* =========================
   TABLE CONTENT
========================= */

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.deskripsi {
  white-space: normal;
}

.main-text {
  color: #1e293b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.category-text {
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border-radius: 5px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.keterangan {
  white-space: normal;
}

.description-text {
  color: #475569;
  overflow-wrap: anywhere;
}

.muted-text {
  color: #94a3b8;
  font-size: 11px;
  font-style: italic;
}

.empty-row {
  padding: 32px 20px !important;
  color: #94a3b8 !important;
  font-size: 12px;
  text-align: center !important;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1000px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .info-item:nth-child(3n) {
    border-right: 1px solid #e2e8f0;
  }

  .info-item:nth-child(2n) {
    border-right: none;
  }

  .info-item:nth-last-child(-n + 3) {
    border-bottom: 1px solid #e2e8f0;
  }

  .info-item:nth-last-child(-n + 2) {
    border-bottom: none;
  }
}

@media (max-width: 800px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
  }

  .btn-download,
  .btn-back {
    flex: 1;
  }

  .work-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .work-count {
    align-self: flex-end;
  }
}

@media (max-width: 700px) {
  .content-card {
    padding: 18px 16px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item,
  .info-item:nth-child(2n),
  .info-item:nth-child(3n) {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .page-header p {
    font-size: 12px;
  }

  .section-header h2 {
    font-size: 15px;
  }

  .data-table {
    min-width: 700px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
  }

  .btn-download,
  .btn-back {
    width: 100%;
  }

  .content-card {
    padding: 16px 14px;
    border-radius: 10px;
  }

  .work-count {
    width: 100%;
    justify-content: space-between;
  }
}
</style>