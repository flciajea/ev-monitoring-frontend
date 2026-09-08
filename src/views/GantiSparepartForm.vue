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

const getStatusStyle = (status) => {
  const actualStatus = getActualStatus(status)

  const styles = {

    Open: {
      backgroundColor: '#e0f0ff',
      color: '#2b7cd3',
      borderColor: '#93c5fd'
    },

    'On Progress': {
      backgroundColor: '#fff4e0',
      color: '#d68a00',
      borderColor: '#facc15'
    },

    Close: {
      backgroundColor: '#e3f9e5',
      color: '#1e9e3a',
      borderColor: '#22c55e'
    },

    Cancel: {
      backgroundColor: '#fdecea',
      color: '#e74c3c',
      borderColor: '#f87171'
    }

  }

  return (
    styles[actualStatus] || {
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      borderColor: '#cbd5e1'
    }
  )
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

    <div class="page-header">

      <div>

        <h2>
          Detail Ganti Sparepart
        </h2>

        <p>
          Informasi penggantian sparepart kendaraan
        </p>

      </div>

    </div>


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
         ERROR
    ========================= -->

    <div
      v-else-if="errorMsg"
      class="error-box"
    >

      {{ errorMsg }}

    </div>


    <!-- =========================
         DETAIL
    ========================= -->

    <div
      v-else
      class="detail-card"
    >

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
          :style="
            getStatusStyle(
              form.status
            )
          "
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
          :style="
            getStatusStyle(
              form.status
            )
          "
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

  </div>

</template>


<style scoped>

/* =========================
   PAGE
========================= */

.detail-page {
  width: 100%;
  max-width: 100%;
}


/* =========================
   HEADER
========================= */

.page-header {
  margin-bottom: 22px;
}

.page-header h2 {
  margin: 0;
  color: #1e2a3a;
  font-size: 24px;
  font-weight: 700;
}

.page-header p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}


/* =========================
   CARD
========================= */

.detail-card {
  width: 100%;
  max-width: 720px;

  background: white;

  padding: 28px;

  border-radius: 16px;

  border: 1px solid #eef4fa;

  box-shadow:
    0 4px 20px
    rgba(58, 141, 222, 0.08);

  box-sizing: border-box;
}


/* =========================
   SECTION
========================= */

.section-title {
  margin-bottom: 18px;

  color: #2563eb;

  font-size: 15px;
  font-weight: 700;

  padding-bottom: 9px;

  border-bottom: 1px solid #e5eef8;
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

  color: #4a5568;

  font-size: 13px;

  font-weight: 600;
}


/* =========================
   INPUT
========================= */

input,
textarea,
select {
  width: 100%;

  padding: 11px 14px;

  border: 1.5px solid #e3edf7;

  border-radius: 10px;

  box-sizing: border-box;

  font-family: inherit;

  font-size: 14px;

  color: #1e2a3a;

  background: #fbfdff;
}


/* =========================
   READONLY
========================= */

input[readonly],
textarea[readonly] {
  background: #f7f9fc;

  color: #475569;

  cursor: default;
}


/* =========================
   TEXTAREA
========================= */

textarea {
  resize: vertical;

  min-height: 90px;

  line-height: 1.5;
}


/* =========================
   FOLLOW UP READONLY
========================= */

.readonly-followup {
  min-height: 90px;

  padding: 13px 14px;

  box-sizing: border-box;

  border: 1.5px solid #e3edf7;

  border-radius: 10px;

  background: #f7f9fc;

  color: #475569;

  font-size: 14px;

  line-height: 1.5;

  white-space: pre-wrap;

  overflow-wrap: anywhere;
}


/* =========================
   TANGGAL TINDAK LANJUT
========================= */

.tanggal-tindak-lanjut-readonly {
  width: 100%;

  padding: 11px 14px;

  box-sizing: border-box;

  border: 1.5px solid #e3edf7;

  border-radius: 10px;

  background: #f7f9fc;

  color: #475569;

  font-size: 14px;
}


/* =========================
   STATUS
========================= */

.status-select {
  font-weight: 600;

  cursor: pointer;

  border: 1.5px solid;

  outline: none;
}

.status-select:focus {
  box-shadow:
    0 0 0 3px
    rgba(37, 99, 235, 0.1);
}

.status-select:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* =========================
   STATUS BADGE
========================= */

.status-badge {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  min-width: 110px;

  padding: 9px 16px;

  border-radius: 20px;

  border: 1.5px solid;

  font-size: 13px;

  font-weight: 600;

  box-sizing: border-box;
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

  max-height: 300px;

  object-fit: contain;

  border-radius: 10px;

  border: 1px solid #e3edf7;

  background: #f8fafc;
}

.no-photo {
  padding: 15px;

  border-radius: 10px;

  background: #f8fafc;

  border: 1px solid #e5e7eb;

  color: #9ca3af;

  font-size: 13px;

  font-style: italic;
}


/* =========================
   ACTION
========================= */

.form-actions {
  display: flex;

  gap: 12px;

  margin-top: 30px;

  padding-top: 20px;

  border-top: 1px solid #eef2f7;
}


/* =========================
   PRIMARY
========================= */

.btn-primary {
  background: #4a9eeb;

  color: white;

  border: none;

  padding: 11px 22px;

  border-radius: 9px;

  cursor: pointer;

  font-family: inherit;

  font-size: 14px;

  font-weight: 600;

  transition:
    background 0.2s,
    transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background: #2b7cd3;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background: #b8d9f7;

  cursor: not-allowed;
}


/* =========================
   SECONDARY
========================= */

.btn-secondary {
  background: #f4f7fa;

  color: #4a5568;

  border: none;

  padding: 11px 22px;

  border-radius: 9px;

  cursor: pointer;

  font-family: inherit;

  font-size: 14px;

  font-weight: 600;

  transition:
    background 0.2s;
}

.btn-secondary:hover {
  background: #e6ebf1;
}


/* =========================
   ERROR
========================= */

.error-box {
  max-width: 720px;

  padding: 14px 16px;

  border-radius: 10px;

  background: #fef2f2;

  border: 1px solid #fecaca;

  color: #b91c1c;

  font-size: 14px;
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

  border: 3px solid #e2e8f0;

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
   MOBILE
========================= */

@media (max-width: 700px) {

  .page-header h2 {
    font-size: 21px;
  }

  .page-header p {
    font-size: 12px;
  }

  .detail-card {
    padding: 20px;

    border-radius: 12px;
  }

  .section-title {
    font-size: 14px;
  }

  input,
  textarea,
  select {
    font-size: 13px;

    padding: 10px 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .tanggal-tindak-lanjut-readonly {
    font-size: 13px;
    padding: 10px 12px;
  }

  .preview-img {
    max-height: 240px;
  }

}

</style>