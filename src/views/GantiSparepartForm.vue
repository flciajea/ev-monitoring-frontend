<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()


/* =========================
   STATE
========================= */

const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')

const previewFoto = ref('')


/* =========================
   USER
========================= */

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
})


/* =========================
   ROLE
========================= */

const role = computed(() => {
  return (
    currentUser.value?.role
      ?.toLowerCase() || ''
  )
})


const isAdmin = computed(() => {
  return role.value === 'admin'
})


const canManageStatus = computed(() => {
  return (
    role.value === 'admin' ||
    role.value === 'uid'
  )
})


/* =========================
   FORM / DATA
========================= */

const form = ref({
  id: null,
  nomorKendaraan: '',
  sparepart: '',
  biaya: null,
  photoBase64Json: '',
  tanggal: '',
  tanggalTindakLanjut: '',
  keterangan: '',
  username: '',
  status: 'Open',
  tindakLanjut: ''
})


/* =========================
   STATUS
========================= */

const daftarStatus = [
  'Open',
  'On Progress',
  'Close',
  'Cancel'
]


const getActualStatus = (status) => {
  if (!status) {
    return 'Open'
  }

  return daftarStatus.includes(status)
    ? status
    : 'Open'
}


/* =========================
   STATUS STYLE
========================= */

const getStatusClass = (status) => {
  const actualStatus = getActualStatus(status)

  if (actualStatus === 'Open') {
    return 'status-open'
  }

  if (actualStatus === 'On Progress') {
    return 'status-progress'
  }

  if (actualStatus === 'Close') {
    return 'status-close'
  }

  if (actualStatus === 'Cancel') {
    return 'status-cancel'
  }

  return 'status-open'
}


/* =========================
   FORMAT TANGGAL
========================= */

const formatTanggal = (tanggal) => {
  if (!tanggal) {
    return '-'
  }

  const date = new Date(tanggal)

  if (Number.isNaN(date.getTime())) {
    return tanggal
  }

  return date.toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  )
}


/* =========================
   AMBIL DATA
========================= */

const ambilData = async () => {
  const id = route.params.id

  if (!id) {
    errorMsg.value =
      'ID ganti sparepart tidak ditemukan'

    loading.value = false

    return
  }

  loading.value = true
  errorMsg.value = ''

  try {

    const response = await api.get(
      `/ganti-sparepart/${id}`
    )

    form.value = {

      id:
        response.data.id ?? null,

      nomorKendaraan:
        response.data.nomorKendaraan || '',

      sparepart:
        response.data.sparepart || '',

      biaya:
        response.data.biaya ?? null,

      photoBase64Json:
        response.data.photoBase64Json || '',

      tanggal:
        response.data.tanggal || '',

      tanggalTindakLanjut:
        response.data.tanggalTindakLanjut || '',

      keterangan:
        response.data.keterangan || '',

      username:
        response.data.username || '',

      status:
        getActualStatus(
          response.data.status
        ),

      tindakLanjut:
        response.data.tindakLanjut || ''

    }


    if (
      response.data.photoBase64Json
    ) {
      previewFoto.value =
        response.data.photoBase64Json
    }

  } catch (error) {

    console.error(
      'Gagal mengambil detail ganti sparepart:',
      error
    )

    errorMsg.value =
      'Gagal mengambil data: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

  } finally {

    loading.value = false

  }
}


/* =========================
   SIMPAN PERUBAHAN
========================= */

const simpanPerubahan = async () => {

  if (!canManageStatus.value) {

    errorMsg.value =
      'Anda tidak memiliki akses untuk mengubah data.'

    return
  }

  saving.value = true
  errorMsg.value = ''

  try {

    /*
     * STATUS
     * dapat diubah oleh Admin / UID
     */

    const payload = {

      status:
        getActualStatus(
          form.value.status
        )

    }


    /*
     * TINDAK LANJUT
     * dan TANGGAL TINDAK LANJUT
     * hanya dapat diubah oleh ADMIN
     */

    if (isAdmin.value) {

      payload.tindakLanjut =
        form.value.tindakLanjut || ''

      payload.tanggalTindakLanjut =
        form.value.tanggalTindakLanjut || null

    }


    await api.put(
      `/ganti-sparepart/${form.value.id}`,
      payload
    )


    showToast(
      'Data ganti sparepart berhasil diperbarui!'
    )


    router.push(
      '/ganti-sparepart'
    )

  } catch (error) {

    console.error(
      'Gagal memperbarui ganti sparepart:',
      error
    )

    errorMsg.value =
      'Gagal menyimpan perubahan: ' +
      (
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message
      )

  } finally {

    saving.value = false

  }

}


/* =========================
   BATAL / KEMBALI
========================= */

const batal = () => {
  router.push(
    '/ganti-sparepart'
  )
}


/* =========================
   ON MOUNTED
========================= */

onMounted(() => {
  ambilData()
})

</script>


<template>

  <div class="detail-page">

    <!-- =========================
         HEADER
    ========================= -->

    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Monitoring</p>

        <h1>Detail Ganti Sparepart</h1>

        <p class="page-description">
          Informasi penggantian sparepart kendaraan
        </p>
      </div>
    </section>


    <!-- =========================
         ERROR
    ========================= -->

    <p
      v-if="errorMsg && !loading"
      class="error-text"
    >
      {{ errorMsg }}
    </p>


    <!-- =========================
         LOADING
    ========================= -->

    <div
      v-if="loading"
      class="loading-box"
    >

      <div class="spinner"></div>

      <p>
        Memuat data...
      </p>

    </div>


    <!-- =========================
         DATA SECTION
    ========================= -->

    <section
      v-else
      class="data-section"
    >

      <div class="section-header">
        <div>
          <h2>Detail Penggantian Sparepart</h2>

          <p>
            Perbarui status dan tindak lanjut penggantian sparepart.
          </p>
        </div>
      </div>

      <div class="form-body">

        <!-- =========================
             INFORMASI KENDARAAN
        ========================= -->

        <div class="section-title">
          Informasi Kendaraan
        </div>


        <!-- NOMOR KENDARAAN -->

        <div class="form-row">

          <label>
            Nomor Kendaraan
          </label>

          <input
            :value="
              form.nomorKendaraan || '-'
            "
            type="text"
            readonly
          />

        </div>


        <!-- SPAREPART -->

        <div class="form-row">

          <label>
            Sparepart
          </label>

          <input
            :value="
              form.sparepart || '-'
            "
            type="text"
            readonly
          />

        </div>


        <!-- BIAYA -->

        <div class="form-row">

          <label>
            Biaya
          </label>

          <input
            :value="
              form.biaya !== null &&
              form.biaya !== undefined
                ? `Rp ${form.biaya}`
                : '-'
            "
            type="text"
            readonly
          />

        </div>


        <!-- RENCANA TANGGAL -->

        <div class="form-row">

          <label>
            Rencana Tanggal
          </label>

          <input
            :value="
              formatTanggal(form.tanggal)
            "
            type="text"
            readonly
          />

        </div>


        <!-- PENGAJU -->

        <div class="form-row">

          <label>
            Pengaju
          </label>

          <input
            :value="
              form.username || '-'
            "
            type="text"
            readonly
          />

        </div>


        <!-- =========================
             KETERANGAN
        ========================= -->

        <div class="section-title section-spacing">
          Keterangan
        </div>


        <div class="form-row">

          <label>
            Keterangan Penggantian
          </label>

          <textarea
            :value="
              form.keterangan || '-'
            "
            rows="4"
            readonly
          ></textarea>

        </div>


        <!-- =========================
             FOTO
        ========================= -->

        <div class="form-row">

          <label>
            Foto Bukti
          </label>

          <div
            v-if="previewFoto"
            class="photo-container"
          >

            <img
              :src="previewFoto"
              alt="Foto bukti penggantian sparepart"
              class="preview-img"
            />

          </div>

          <div
            v-else
            class="no-photo"
          >

            Tidak ada foto

          </div>

        </div>


        <!-- =========================
             PROSES
        ========================= -->

        <div class="section-title section-spacing">
          Proses
        </div>


        <!-- STATUS -->

        <div class="form-row">

          <label>
            Status
          </label>


          <!-- ADMIN / UID -->

          <select
            v-if="canManageStatus"
            v-model="form.status"
            class="status-select"
            :class="getStatusClass(form.status)"
            :disabled="saving"
          >

            <option
              v-for="status in daftarStatus"
              :key="status"
              :value="status"
            >

              {{ status }}

            </option>

          </select>


          <!-- DRIVER -->

          <div
            v-else
            class="status-badge"
            :class="getStatusClass(form.status)"
          >

            {{ getActualStatus(form.status) }}

          </div>

        </div>


        <!-- =========================
             TINDAK LANJUT
        ========================= -->

        <div class="form-row">

          <label>
            Tindak Lanjut
          </label>


          <!-- ADMIN -->

          <textarea
            v-if="isAdmin"
            v-model="form.tindakLanjut"
            rows="5"
            placeholder="Tulis tindak lanjut penggantian sparepart..."
            :disabled="saving"
          ></textarea>


          <!-- UID / DRIVER -->

          <div
            v-else
            class="readonly-followup"
          >

            {{
              form.tindakLanjut ||
              'Belum ada tindak lanjut'
            }}

          </div>

        </div>


        <!-- =========================
             TANGGAL TINDAK LANJUT
        ========================= -->

        <div class="form-row">

          <label>
            Tanggal Tindak Lanjut
          </label>


          <!-- ADMIN -->

          <input
            v-if="isAdmin"
            v-model="form.tanggalTindakLanjut"
            type="date"
            :disabled="saving"
          />


          <!-- UID / DRIVER -->

          <div
            v-else
            class="tanggal-tindak-lanjut-readonly"
          >

            {{
              form.tanggalTindakLanjut
                ? formatTanggal(
                    form.tanggalTindakLanjut
                  )
                : 'Belum ada tanggal tindak lanjut'
            }}

          </div>

        </div>


        <!-- =========================
             ACTION
        ========================= -->

        <div class="form-actions">

          <button
            v-if="canManageStatus"
            type="button"
            class="btn-primary"
            :disabled="saving"
            @click="simpanPerubahan"
          >

            {{
              saving
                ? 'Menyimpan...'
                : 'Simpan Perubahan'
            }}

          </button>


          <button
            type="button"
            class="btn-secondary"
            @click="batal"
          >

            Kembali

          </button>

        </div>

      </div>

    </section>

  </div>

</template>


<style scoped>

/* =========================
   PAGE
========================= */

.detail-page {
  width: 100%;
  max-width: 100%;

  padding: 32px 36px 48px;

  box-sizing: border-box;
}


/* =========================
   HEADER
========================= */

.page-header {
  margin-bottom: 24px;
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
   ERROR
========================= */

.error-text {
  margin-bottom: 20px;

  padding: 12px 16px;

  border: 1px solid #fecaca;
  border-radius: 9px;

  background: #fef2f2;

  color: #b91c1c;

  font-size: 13px;
}


/* =========================
   DATA SECTION
========================= */

.data-section {
  background: white;

  border: 1px solid #e5eaf1;

  border-radius: 14px;

  overflow: hidden;

  box-shadow:
    0 2px 10px rgba(15, 23, 42, 0.035);
}


.section-header {
  padding: 22px 24px 18px;

  border-bottom: 1px solid #edf0f4;
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
   FORM BODY
========================= */

.form-body {
  max-width: 640px;

  padding: 24px;

  box-sizing: border-box;
}


/* =========================
   SECTION TITLE (SUB-GROUP)
========================= */

.section-title {
  margin-bottom: 18px;

  color: #2563eb;

  font-size: 14px;
  font-weight: 700;

  padding-bottom: 9px;

  border-bottom: 1px solid #edf0f4;
}

.section-spacing {
  margin-top: 28px;
}


/* =========================
   FORM ROW
========================= */

.form-row {
  margin-bottom: 20px;
}

.form-row label {
  display: block;

  margin-bottom: 8px;

  color: #374151;

  font-size: 13px;
  font-weight: 650;
}


/* =========================
   INPUT
========================= */

input,
select,
textarea {
  width: 100%;

  padding: 0 16px;

  height: 46px;

  box-sizing: border-box;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: white;

  color: #1f2937;

  font-size: 14px;
  font-family: inherit;

  outline: none;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}


/* =========================
   READONLY
========================= */

input[readonly],
textarea[readonly] {
  background: #f8fafc;

  color: #64748b;

  cursor: not-allowed;
}


/* =========================
   TEXTAREA
========================= */

textarea {
  height: auto;

  min-height: 90px;

  padding: 12px 16px;

  line-height: 1.55;

  resize: vertical;
}


/* =========================
   DISABLED
========================= */

select:disabled,
textarea:disabled,
input:disabled {
  opacity: 0.65;

  cursor: not-allowed;
}


/* =========================
   FOCUS
========================= */

input:focus,
select:focus,
textarea:focus {
  border-color: #93c5fd;

  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.1);
}


input:hover,
select:hover,
textarea:hover {
  border-color: #bcd4f5;
}


/* =========================
   FOLLOW UP READONLY
========================= */

.readonly-followup {
  min-height: 90px;

  padding: 12px 16px;

  box-sizing: border-box;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: #f8fafc;

  color: #475569;

  font-size: 14px;
  line-height: 1.6;

  white-space: pre-wrap;
  overflow-wrap: anywhere;
}


/* =========================
   TANGGAL TINDAK LANJUT
========================= */

.tanggal-tindak-lanjut-readonly {
  min-height: 46px;

  padding: 0 16px;

  display: flex;
  align-items: center;

  box-sizing: border-box;

  border: 1px solid #dbe2ea;
  border-radius: 10px;

  background: #f8fafc;

  color: #475569;

  font-size: 14px;
  line-height: 1.5;
}


/* =========================
   STATUS
========================= */

.status-select,
.status-badge {
  display: inline-flex;
  align-items: center;

  width: auto;

  min-height: 38px;

  height: auto;

  box-sizing: border-box;

  border-radius: 8px;

  font-size: 12px;
  font-weight: 700;
}


.status-select {
  width: 100%;
  max-width: 190px;

  padding: 0 12px;

  border: 1px solid transparent;

  outline: none;

  cursor: pointer;
}


.status-badge {
  padding: 8px 14px;
}


/* =========================
   OPEN
========================= */

.status-open {
  color: #1d4ed8;

  background: #eff6ff;

  border-color: #bfdbfe;
}


/* =========================
   ON PROGRESS
========================= */

.status-progress {
  color: #c2410c;

  background: #fff7ed;

  border-color: #fed7aa;
}


/* =========================
   CLOSE
========================= */

.status-close {
  color: #15803d;

  background: #f0fdf4;

  border-color: #bbf7d0;
}


/* =========================
   CANCEL
========================= */

.status-cancel {
  color: #b91c1c;

  background: #fef2f2;

  border-color: #fecaca;
}


/* =========================
   PHOTO
========================= */

.photo-container {
  width: 100%;
}

.preview-img {
  display: block;

  max-width: 100%;
  max-height: 280px;

  object-fit: contain;

  border-radius: 10px;
  border: 1px solid #e5eaf1;

  background: #f8fafc;
}

.no-photo {
  padding: 12px 14px;

  border-radius: 9px;

  background: #f8fafc;

  border: 1px solid #e5eaf1;

  color: #94a3b8;

  font-size: 13px;
  font-style: italic;
}


/* =========================
   FORM ACTIONS
========================= */

.form-actions {
  display: flex;

  gap: 12px;

  margin-top: 28px;

  padding-top: 20px;

  border-top: 1px solid #edf0f4;
}


/* =========================
   BUTTON
========================= */

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 9px;

  padding: 11px 17px;

  font-size: 14px;
  font-weight: 650;

  cursor: pointer;

  transition: 0.2s ease;
}


.btn-primary {
  background: #2563eb;
  color: white;
}


.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}


.btn-primary:disabled {
  background: #93c5fd;

  cursor: not-allowed;
}


.btn-secondary {
  background: #eef2f7;
  color: #374151;
}


.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}


.btn-secondary:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* =========================
   LOADING
========================= */

.loading-box {
  min-height: 250px;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  color: #64748b;
}

.spinner {
  width: 28px;
  height: 28px;

  margin-bottom: 12px;

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
   RESPONSIVE
========================= */

@media (max-width: 1200px) {

  .detail-page {
    padding: 28px 26px 40px;
  }

}


@media (max-width: 768px) {

  .detail-page {
    padding: 20px 16px 32px;
  }


  .page-header h1 {
    font-size: 26px;
  }


  .section-header {
    padding: 18px;
  }


  .form-body {
    max-width: none;

    padding: 18px;
  }


  .form-actions {
    flex-direction: column;
  }


  .btn-primary,
  .btn-secondary {
    width: 100%;
  }


  .preview-img {
    max-height: 220px;
  }

}

</style>