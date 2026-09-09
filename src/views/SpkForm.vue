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
        <div class="breadcrumb">DATA SPK</div>

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
    <div v-if="errorMsg" class="error-box">
      <div class="error-title">Data belum dapat disimpan</div>
      <div class="error-message">
        {{ errorMsg }}
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading-card">
      Memuat data SPK...
    </div>

    <template v-else>

      <!-- INFORMASI SPK -->
      <section class="form-card">
        <div class="card-header">
          <div>
            <h2>Informasi Surat Perintah Kerja</h2>
            <p>Lengkapi informasi utama surat perintah kerja.</p>
          </div>
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

            <p>
              Tambahkan pekerjaan yang akan dilakukan oleh bengkel.
            </p>
          </div>

          <button
            type="button"
            class="btn-add"
            @click="tambahDetail"
          >
            <span class="plus">+</span>
            Tambah Perintah Kerja
          </button>
        </div>

        <div class="table-container">

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
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              <tr
                v-for="(item, index) in form.detail"
                :key="item.id || index"
              >

                <!-- NO -->
                <td class="number-cell">
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
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                    d="M4 7H20"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    />
                    <path
                    d="M10 11V17"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    />
                    <path
                    d="M14 11V17"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    />
                    <path
                    d="M6 7L7 19C7.1 20.1 8 21 9.1 21H14.9C16 21 16.9 20.1 17 19L18 7"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    />
                    <path
                    d="M9 7V4C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4V7"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    />
                </svg>
                </button>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

        <!-- DETAIL FOOTER -->
        <div class="detail-footer">

          <span class="detail-total-label">
            Jumlah perintah kerja
          </span>

          <span class="detail-total">
            {{ form.detail.length }}
          </span>

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
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
  letter-spacing: 0.04em;
  margin-bottom: 7px;
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
   ERROR
========================= */

.error-box {
  margin-bottom: 20px;
  padding: 15px 18px;
  border: 1px solid #fecaca;
  border-left: 4px solid #ef4444;
  border-radius: 10px;
  background: #fffafa;
}

.error-title {
  margin-bottom: 3px;
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
   LOADING
========================= */

.loading-card {
  padding: 40px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #64748b;
  text-align: center;
  font-size: 14px;
}

/* =========================
   CARD
========================= */

.form-card {
  margin-bottom: 20px;
  padding: 26px 28px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.card-header {
  margin-bottom: 24px;
}

.card-header h2,
.detail-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
}

.card-header p,
.detail-header p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

/* =========================
   FORM GRID
========================= */

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;
}

.form-group {
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
}

.required {
  color: #dc2626;
  margin-left: 2px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
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
  padding-bottom: 18px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.btn-add {
  flex-shrink: 0;
  min-height: 42px;
  padding: 0 17px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.btn-add:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.18);
}

.btn-add:active {
  transform: translateY(1px);
}

.plus {
  margin-right: 7px;
  font-size: 18px;
  font-weight: 400;
  line-height: 0;
  vertical-align: -1px;
}

/* =========================
   TABLE
========================= */

.table-container {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  scrollbar-width: thin;
}

.detail-table {
  width: 100%;
  min-width: 880px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.col-no {
  width: 70px;
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
  width: 105px;
}

.detail-table thead th {
  height: 62px;
  padding: 0 18px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  vertical-align: middle;
}

.detail-table thead th:first-child {
  text-align: center;
}

.detail-table thead th:last-child {
  text-align: center;
}

.detail-table tbody td {
  padding: 17px 18px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  vertical-align: middle;
}

.detail-table tbody tr:last-child td {
  border-bottom: none;
}

.detail-table tbody tr:hover td {
  background: #fcfdff;
}

/* =========================
   NUMBER
========================= */

.number-cell {
  text-align: center;
}

.number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
}

/* =========================
   TABLE INPUT
========================= */

.table-input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.table-input::placeholder {
  color: #94a3b8;
}

.table-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
}

.select-input {
  cursor: pointer;
  color: #334155;
}

.table-textarea {
  display: block;
  width: 100%;
  min-height: 72px;
  padding: 11px 13px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  resize: vertical;
  background: #ffffff;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
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
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #ffffff;
  color: #dc2626;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
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

/* =========================
   DETAIL FOOTER
========================= */

.detail-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 2px 0;
}

.detail-total-label {
  color: #64748b;
  font-size: 14px;
}

.detail-total {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 9px;
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
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
  gap: 12px;
  margin-top: 26px;
}

.btn-cancel,
.btn-save {
  min-width: 108px;
  height: 46px;
  padding: 0 20px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.btn-cancel {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.btn-cancel:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #94a3b8;
}

.btn-save {
  min-width: 160px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.18);
}

.btn-cancel:active:not(:disabled),
.btn-save:active:not(:disabled) {
  transform: translateY(1px);
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
    padding: 22px;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    align-self: flex-start;
  }

  .detail-table {
    min-width: 820px;
  }
}

@media (max-width: 700px) {
  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 14px;
  }

  .form-card {
    padding: 20px 16px;
    border-radius: 10px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .full-width {
    grid-column: auto;
  }

  .card-header h2,
  .detail-header h2 {
    font-size: 18px;
  }

  .detail-table {
    min-width: 790px;
  }

  .detail-table thead th,
  .detail-table tbody td {
    padding-left: 14px;
    padding-right: 14px;
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
  .spk-form-page {
    padding-bottom: 20px;
  }

  .page-header {
    margin-bottom: 18px;
  }

  .page-header h1 {
    font-size: 22px;
  }

  .breadcrumb {
    font-size: 12px;
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