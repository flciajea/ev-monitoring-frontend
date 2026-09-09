<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)

const loading = ref(false)
const saving = ref(false)
const errorMsg = ref('')

const form = ref({
  nomorSpk: '',
  tanggal: '',
  uid: '',
  bengkel: '',
  noPolisi: '',
  detail: [
    {
      id: null,
      deskripsi: '',
      kategori: '',
      keterangan: ''
    }
  ]
})

const ambilData = async () => {
  if (!isEdit.value) return

  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get(`/spk/${route.params.id}`)
    const data = response.data

    form.value = {
      nomorSpk: data.nomorSpk || '',
      tanggal: data.tanggal || '',
      uid: data.uid || '',
      bengkel: data.bengkel || '',
      noPolisi: data.noPolisi || '',
      detail: Array.isArray(data.detail) && data.detail.length
        ? data.detail.map(item => ({
            id: item.id || null,
            deskripsi: item.deskripsi || '',
            kategori: item.kategori || '',
            keterangan: item.keterangan || ''
          }))
        : [
            {
              id: null,
              deskripsi: '',
              kategori: '',
              keterangan: ''
            }
          ]
    }
  } catch (error) {
    console.error(error)
    errorMsg.value = 'Data SPK gagal dimuat.'
  } finally {
    loading.value = false
  }
}

const tambahDetail = () => {
  form.value.detail.push({
    id: null,
    deskripsi: '',
    kategori: '',
    keterangan: ''
  })
}

const hapusDetail = (index) => {
  if (form.value.detail.length <= 1) {
    return
  }

  form.value.detail.splice(index, 1)
}

const simpan = async () => {
  errorMsg.value = ''

  if (!form.value.tanggal) {
    errorMsg.value = 'Tanggal SPK wajib diisi.'
    return
  }

  if (!form.value.uid.trim()) {
    errorMsg.value = 'UID wajib diisi.'
    return
  }

  if (!form.value.bengkel.trim()) {
    errorMsg.value = 'Bengkel wajib diisi.'
    return
  }

  if (!form.value.noPolisi.trim()) {
    errorMsg.value = 'No Polisi wajib diisi.'
    return
  }

  const detailTidakValid = form.value.detail.some(
    item => !item.deskripsi.trim()
  )

  if (detailTidakValid) {
    errorMsg.value = 'Deskripsi keluhan / jenis pekerjaan wajib diisi.'
    return
  }

  saving.value = true

  try {
    if (isEdit.value) {
      await api.put(`/spk/${route.params.id}`, {
        nomorSpk: form.value.nomorSpk || null,
        tanggal: form.value.tanggal,
        uid: form.value.uid,
        bengkel: form.value.bengkel,
        noPolisi: form.value.noPolisi,
        detail: form.value.detail.map(item => ({
          id: item.id || null,
          deskripsi: item.deskripsi,
          kategori: item.kategori || null,
          keterangan: item.keterangan || null
        }))
      })
    } else {
      const response = await api.post('/spk', {
        tanggal: form.value.tanggal,
        uid: form.value.uid,
        bengkel: form.value.bengkel,
        noPolisi: form.value.noPolisi
      })

      const spkId = response.data.id

      for (const item of form.value.detail) {
        await api.post(`/spk/${spkId}/detail`, {
          deskripsi: item.deskripsi,
          kategori: item.kategori || null,
          keterangan: item.keterangan || null
        })
      }
    }

    router.push('/spk')
  } catch (error) {
    console.error(error)

    errorMsg.value =
      error.response?.data?.message ||
      'SPK gagal disimpan. Silakan coba kembali.'
  } finally {
    saving.value = false
  }
}

const batal = () => {
  router.push('/spk')
}

onMounted(() => {
  ambilData()
})
</script>

<template>
  <div class="spk-form-page">

    <!-- PAGE HEADER -->
    <div class="page-header">
      <div>
        <span class="page-eyebrow">DATA SPK</span>

        <h1>
          {{ isEdit ? 'Edit Surat Perintah Kerja' : 'Tambah Surat Perintah Kerja' }}
        </h1>

        <p>
          {{ isEdit
            ? 'Perbarui informasi surat perintah kerja dan pekerjaan bengkel.'
            : 'Masukkan informasi surat perintah kerja dan pekerjaan yang akan dilakukan bengkel.'
          }}
        </p>
      </div>
    </div>

    <!-- ERROR -->
    <div v-if="errorMsg" class="error-message">
      <div class="error-content">
        <strong>Data belum dapat disimpan</strong>
        <span>{{ errorMsg }}</span>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Memuat data SPK...</p>
    </div>

    <template v-else>

      <!-- INFORMASI SPK -->
      <section class="form-card">
        <div class="card-header">
          <h2>Informasi Surat Perintah Kerja</h2>
          <p>Lengkapi informasi utama surat perintah kerja.</p>
        </div>

        <div class="form-grid">

          <div class="form-group">
            <label>Nomor SPK</label>

            <input
              v-model="form.nomorSpk"
              type="text"
              placeholder="Nomor SPK"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>
              Tanggal
              <span class="required">*</span>
            </label>

            <input
              v-model="form.tanggal"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>
              UID
              <span class="required">*</span>
            </label>

            <input
              v-model="form.uid"
              type="text"
              placeholder="Masukkan UID"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>
              Bengkel
              <span class="required">*</span>
            </label>

            <input
              v-model="form.bengkel"
              type="text"
              placeholder="Masukkan nama bengkel"
              class="form-input"
            />
          </div>

          <div class="form-group full-width">
            <label>
              No Polisi
              <span class="required">*</span>
            </label>

            <input
              v-model="form.noPolisi"
              type="text"
              placeholder="Contoh: D 1234 ABC"
              class="form-input"
            />
          </div>

        </div>
      </section>

      <!-- DAFTAR PERINTAH KERJA -->
      <section class="form-card detail-card">

        <div class="detail-header">
          <div>
            <h2>Daftar Perintah Kerja</h2>
            <p>Tambahkan pekerjaan yang akan dilakukan oleh bengkel.</p>
          </div>

          <button
            type="button"
            class="btn-add"
            @click="tambahDetail"
          >
            <span class="btn-add-plus">+</span>
            Tambah Perintah Kerja
          </button>
        </div>

        <div class="table-wrapper">

          <table class="detail-table">

            <colgroup>
              <col class="col-no" />
              <col class="col-deskripsi" />
              <col class="col-kategori" />
              <col class="col-keterangan" />
              <col class="col-aksi" />
            </colgroup>

            <thead>
              <tr>
                <th>No</th>
                <th>Deskripsi Keluhan / Jenis Pekerjaan</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="(item, index) in form.detail"
                :key="item.id || index"
              >

                <!-- NO -->
                <td class="no-cell">
                  <span class="number-badge">
                    {{ index + 1 }}
                  </span>
                </td>

                <!-- DESKRIPSI -->
                <td>
                  <input
                    v-model="item.deskripsi"
                    type="text"
                    class="table-input"
                    placeholder="Deskripsi pekerjaan"
                  />
                </td>

                <!-- KATEGORI -->
                <td>
                  <input
                    v-model="item.kategori"
                    type="text"
                    class="table-input"
                    placeholder="Kategori pekerjaan"
                  />
                </td>

                <!-- KETERANGAN -->
                <td>
                  <textarea
                    v-model="item.keterangan"
                    class="table-textarea"
                    placeholder="Keterangan pekerjaan"
                    rows="2"
                  ></textarea>
                </td>

                <!-- AKSI -->
                <td class="action-cell">

                  <button
                    type="button"
                    class="btn-delete"
                    :disabled="form.detail.length <= 1"
                    title="Hapus perintah kerja"
                    aria-label="Hapus perintah kerja"
                    @click="hapusDetail(index)"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                      <path d="M10 11V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                      <path d="M14 11V17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                      <path
                        d="M6 7L7 19C7.1 20.1 8 21 9.1 21H14.9C16 21 16.9 20.1 17 19L18 7"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path d="M9 7V4C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                    </svg>
                  </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

        <!-- DETAIL FOOTER -->
        <div class="detail-footer">
          <span class="detail-total-label">Jumlah perintah kerja</span>
          <span class="detail-total">{{ form.detail.length }}</span>
        </div>

      </section>

      <!-- ACTION -->
      <div class="form-actions">

        <button
          type="button"
          class="btn-cancel"
          :disabled="saving"
          @click="batal"
        >
          Batal
        </button>

        <button
          type="button"
          class="btn-save"
          :disabled="saving"
          @click="simpan"
        >
          {{ saving
            ? 'Menyimpan...'
            : isEdit
              ? 'Simpan Perubahan'
              : 'Simpan SPK'
          }}
        </button>

      </div>

    </template>

  </div>
</template>

<style scoped>
.spk-form-page {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* =========================
   PAGE HEADER
========================= */

.page-header {
  margin-bottom: 24px;
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

/* =========================
   ERROR
========================= */

.error-message {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #fecaca;
  border-radius: 9px;
  background: #fef2f2;
}

.error-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.error-content strong {
  color: #991b1b;
  font-size: 12px;
  font-weight: 700;
}

.error-content span {
  color: #b91c1c;
  font-size: 11px;
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
   CARD
========================= */

.form-card {
  margin-bottom: 20px;
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.card-header {
  margin-bottom: 20px;
}

.card-header h2,
.detail-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 700;
}

.card-header p,
.detail-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

/* =========================
   FORM GRID
========================= */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}

.form-group {
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.required {
  color: #dc2626;
  margin-left: 2px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #1e293b;
  font-family: inherit;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

/* =========================
   DETAIL HEADER
========================= */

.detail-card {
  padding-bottom: 16px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  flex-shrink: 0;
  min-height: 38px;
  padding: 0 15px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.16);
  transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-add:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(37, 99, 235, 0.2);
}

.btn-add:active {
  transform: translateY(0);
}

.btn-add-plus {
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
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

.detail-table {
  width: 100%;
  min-width: 860px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.col-no {
  width: 60px;
}

.col-deskripsi {
  width: 37%;
}

.col-kategori {
  width: 18%;
}

.col-keterangan {
  width: 30%;
}

.col-aksi {
  width: 90px;
}

.detail-table thead th {
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

.detail-table thead th.text-center {
  text-align: center;
}

.detail-table tbody td {
  padding: 12px 14px;
  border-bottom: 1px solid #edf2f7;
  background: #ffffff;
  vertical-align: middle;
}

.detail-table tbody tr:last-child td {
  border-bottom: none;
}

.detail-table tbody tr:hover td {
  background: #f8fbff;
}

/* =========================
   NUMBER
========================= */

.no-cell {
  text-align: center;
}

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

/* =========================
   TABLE INPUT
========================= */

.table-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #1e293b;
  font-family: inherit;
  font-size: 12px;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.table-input::placeholder {
  color: #94a3b8;
}

.table-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

.table-textarea {
  display: block;
  width: 100%;
  min-height: 64px;
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  background: #ffffff;
  color: #1e293b;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.table-textarea::placeholder {
  color: #94a3b8;
}

.table-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

/* =========================
   DELETE
========================= */

.action-cell {
  text-align: center;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid #fecaca;
  border-radius: 7px;
  background: #ffffff;
  color: #dc2626;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.btn-delete:hover:not(:disabled) {
  border-color: #fca5a5;
  background: #fef2f2;
  color: #b91c1c;
}

.btn-delete:disabled {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #cbd5e1;
  cursor: not-allowed;
}

.btn-delete svg {
  flex-shrink: 0;
}

/* =========================
   DETAIL FOOTER
========================= */

.detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  padding: 16px 2px 0;
}

.detail-total-label {
  color: #64748b;
  font-size: 12px;
}

.detail-total {
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
   ACTION BUTTON
========================= */

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
}

.btn-cancel,
.btn-save {
  min-width: 100px;
  height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.btn-cancel {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
}

.btn-cancel:hover:not(:disabled) {
  border-color: #bfdbfe;
  background: #f8fbff;
  color: #2563eb;
}

.btn-save {
  min-width: 150px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 3px 8px rgba(37, 99, 235, 0.16);
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(37, 99, 235, 0.2);
}

.btn-cancel:active:not(:disabled),
.btn-save:active:not(:disabled) {
  transform: translateY(0);
}

.btn-cancel:disabled,
.btn-save:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {
  .form-card {
    padding: 20px;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    align-self: flex-start;
  }

  .detail-table {
    min-width: 800px;
  }
}

@media (max-width: 700px) {
  .page-header h1 {
    font-size: 20px;
  }

  .page-header p {
    font-size: 12px;
  }

  .form-card {
    padding: 18px 16px;
    border-radius: 10px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .full-width {
    grid-column: auto;
  }

  .card-header h2,
  .detail-header h2 {
    font-size: 15px;
  }

  .detail-table {
    min-width: 780px;
  }

  .detail-table thead th,
  .detail-table tbody td {
    padding-left: 12px;
    padding-right: 12px;
  }

  .form-actions {
    width: 100%;
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    margin-bottom: 18px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  .page-eyebrow {
    font-size: 9px;
  }

  .form-card {
    margin-bottom: 16px;
  }

  .btn-add {
    width: 100%;
  }

  .detail-footer {
    justify-content: space-between;
  }
}
</style>