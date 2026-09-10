<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import api from '../api'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()


/* =========================
   STATE
   ========================= */

const loading = ref(false)

const errorMsg = ref('')

const previewFoto = ref('')


/* =========================
   CURRENT USER
   ========================= */

const currentUser = computed(() => {

  const userData =
    localStorage.getItem('user')

  try {

    return userData
      ? JSON.parse(userData)
      : null

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


/* =========================
   PERMISSION
   ========================= */

/*
 * Admin dan UID boleh mengubah status.
 */
const canEditStatus = computed(() => {

  return (
    role.value === 'admin' ||
    role.value === 'uid'
  )

})


/*
 * Tindak lanjut hanya Admin.
 */
const isAdmin = computed(() => {

  return role.value === 'admin'

})


/* =========================
   MODE
   ========================= */

const isEditMode = computed(() => {

  return !!route.params.id

})


/* =========================
   FORM
   ========================= */

const form = ref({

  id: null,

  nomorKendaraan: '',

  pengaduan: '',

  photoBase64: '',

  tanggal: '',

  username: '',

  status: 'Open',

  tindakLanjut: '',

  tanggalTindakLanjut: ''

})


/* =========================
   AMBIL DATA
   ========================= */

const ambilDataKeluhan = async () => {

  /*
   * MODE TAMBAH
   *
   * Hanya digunakan Driver
   */
  if (!isEditMode.value) {

    form.value.nomorKendaraan =
      currentUser.value?.noKendaraan || ''

    form.value.username =
      currentUser.value?.username || ''

    form.value.tanggal =
      new Date()
        .toISOString()
        .split('T')[0]

    form.value.status = 'Open'

    form.value.tindakLanjut = ''

    form.value.tanggalTindakLanjut = ''

    return

  }


  /*
   * MODE DETAIL / EDIT
   */

  loading.value = true

  errorMsg.value = ''


  try {

    const response =
      await api.get(
        `/keluhan/${route.params.id}`
      )


    form.value = {

      ...form.value,

      ...response.data,

      tindakLanjut:
        response.data.tindakLanjut || '',

      tanggalTindakLanjut:
        response.data.tanggalTindakLanjut || ''

    }


    /*
     * Foto
     */

    if (
      response.data.photoBase64
    ) {

      previewFoto.value =
        response.data.photoBase64

    }

  } catch (error) {

    errorMsg.value =
      'Gagal mengambil data keluhan: ' +
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
   FILE FOTO
   ========================= */

const handleFileChange = (event) => {

  /*
   * Foto hanya digunakan
   * saat membuat laporan baru.
   */

  const file =
    event.target.files[0]

  if (!file) {

    return

  }


  const reader =
    new FileReader()


  reader.onload = (e) => {

    form.value.photoBase64 =
      e.target.result

    previewFoto.value =
      e.target.result

  }


  reader.readAsDataURL(file)

}


/* =========================
   STATUS DISPLAY
   ========================= */

const normalizeStatus = (status) => {

  return status || 'Open'

}


const getStatusClass = (status) => {

  const actualStatus =
    normalizeStatus(status)

  if (actualStatus === 'Open') {

    return 'status-open'

  }

  if (
    actualStatus === 'On Progress'
  ) {

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
   SUBMIT
   ========================= */

const submitForm = async () => {

  loading.value = true

  errorMsg.value = ''


  try {

    /*
     * MODE EDIT
     *
     * HANYA kirim field yang
     * memang boleh diubah.
     */

    if (isEditMode.value) {

      const payload = {}


      /*
       * Status:
       * Admin + UID
       */

      if (canEditStatus.value) {

        payload.status =
          form.value.status

      }


      /*
       * Tindak lanjut:
       * Admin saja
       */

      if (isAdmin.value) {

        payload.tindakLanjut =
          form.value.tindakLanjut

        payload.tanggalTindakLanjut =
          form.value.tanggalTindakLanjut

      }


      await api.put(
        `/keluhan/${form.value.id}`,
        payload
      )


      showToast(
        'Keluhan berhasil diperbarui!'
      )

    }


    /*
     * MODE TAMBAH
     */

    else {

      const payload = {

        nomorKendaraan:
          form.value.nomorKendaraan,

        pengaduan:
          form.value.pengaduan,

        photoBase64:
          form.value.photoBase64,

        tanggal:
          form.value.tanggal,

        username:
          form.value.username,

        status: 'Open'

      }


      await api.post(
        '/keluhan',
        payload
      )


      showToast(
        'Keluhan berhasil dikirim!'
      )

    }


    router.push('/keluhan')

  } catch (error) {

    errorMsg.value =
      'Gagal menyimpan data: ' +
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
   BATAL / KEMBALI
   ========================= */

const batal = () => {

  router.push('/keluhan')

}


/* =========================
   MOUNTED
   ========================= */

onMounted(() => {

  ambilDataKeluhan()

})

</script>


<template>

  <div class="keluhan-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Keluhan</p>

        <h1>
          {{
            isEditMode
              ? 'Detail Keluhan'
              : 'Keluhan & Pengaduan'
          }}
        </h1>

        <p class="page-description">
          {{
            isEditMode
              ? 'Detail laporan keluhan kendaraan'
              : 'Laporkan keluhan atau kerusakan kendaraan'
          }}
        </p>
      </div>
    </section>


    <!-- =========================
         ERROR
    ========================== -->
    <p
      v-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>


    <!-- =========================
         DATA SECTION
    ========================== -->
    <section class="data-section">

      <div class="section-header">

        <div>
          <h2>
            {{
              isEditMode
                ? 'Detail Laporan'
                : 'Form Pengaduan'
            }}
          </h2>

          <p>
            {{
              isEditMode
                ? 'Informasi lengkap laporan dan tindak lanjutnya.'
                : 'Isi form berikut untuk melaporkan keluhan atau kerusakan kendaraan.'
            }}
          </p>
        </div>

      </div>


      <form
        class="form-body"
        @submit.prevent="submitForm"
      >


        <!-- =========================
             NOMOR KENDARAAN
        ========================== -->

        <div class="form-row">

          <label>
            Nomor Kendaraan
          </label>

          <input
            v-model="form.nomorKendaraan"
            type="text"
            readonly
            placeholder="Nomor kendaraan belum tersedia"
          />

        </div>


        <!-- =========================
             USERNAME
        ========================== -->

        <div class="form-row">

          <label>
            Username
          </label>

          <input
            v-model="form.username"
            type="text"
            readonly
          />

        </div>


        <!-- =========================
             TANGGAL
        ========================== -->

        <div class="form-row">

          <label>
            Tanggal
          </label>

          <input
            v-model="form.tanggal"
            type="text"
            readonly
          />

        </div>


        <!-- =========================
             PENGADUAN
        ========================== -->

        <div class="form-row">

          <label>
            Pengaduan & Keluhan
          </label>

          <textarea
            v-model="form.pengaduan"
            rows="5"
            :readonly="isEditMode"
            required
            placeholder="Jelaskan keluhan atau kerusakan yang dialami..."
          ></textarea>

          <small
            v-if="isEditMode"
            class="readonly-info"
          >
            Data pengaduan tidak dapat diubah.
          </small>

        </div>


        <!-- =========================
             FOTO
        ========================== -->

        <div class="form-row">

          <label>
            Foto Kerusakan
          </label>


          <!--
            Input foto hanya muncul
            saat membuat laporan.
          -->

          <input
            v-if="!isEditMode"
            type="file"
            accept="image/*"
            @change="handleFileChange"
          />


          <!--
            Foto existing
          -->

          <img
            v-if="previewFoto"
            :src="previewFoto"
            class="preview-img"
            alt="Foto kerusakan"
          />


          <span
            v-if="!previewFoto && isEditMode"
            class="no-photo"
          >
            Tidak ada foto.
          </span>


          <small
            v-if="isEditMode"
            class="readonly-info"
          >
            Foto tidak dapat diubah.
          </small>

        </div>


        <!-- =========================
             STATUS
        ========================== -->

        <div class="form-row">

          <label>
            Status
          </label>


          <!-- ADMIN / UID -->

          <select
            v-if="canEditStatus && isEditMode"
            v-model="form.status"
            class="status-select"
            :class="getStatusClass(form.status)"
            :disabled="loading"
          >

            <option value="Open">
              Open
            </option>

            <option value="On Progress">
              On Progress
            </option>

            <option value="Close">
              Close
            </option>

            <option value="Cancel">
              Cancel
            </option>

          </select>


          <!--
            Role yang tidak boleh
            mengubah status
          -->

          <div
            v-else
            class="status-badge"
            :class="getStatusClass(form.status)"
          >

            {{ normalizeStatus(form.status) }}

          </div>

        </div>


        <!-- =========================
             TINDAK LANJUT
        ========================== -->

        <div
          v-if="isEditMode"
          class="form-row"
        >

          <label>
            Tindak Lanjut
          </label>


          <!-- ADMIN -->

          <textarea
            v-if="isAdmin"
            v-model="form.tindakLanjut"
            rows="5"
            :disabled="loading"
            placeholder="Tuliskan tindak lanjut yang dilakukan..."
          ></textarea>


          <!-- UID / ROLE LAIN -->

          <div
            v-else
            class="tindak-lanjut-readonly"
          >

            {{
              form.tindakLanjut ||
              'Belum ada tindak lanjut.'
            }}

          </div>


          <!-- INFO ADMIN -->

          <small
            v-if="isAdmin"
            class="field-info"
          >
            Tindak lanjut hanya dapat diisi atau diubah oleh Admin.
          </small>

        </div>


        <!-- =========================
             TANGGAL TINDAK LANJUT
        ========================== -->

        <div
          v-if="isEditMode"
          class="form-row"
        >

          <label>
            Tanggal Tindak Lanjut
          </label>


          <!-- ADMIN -->

          <input
            v-if="isAdmin"
            v-model="form.tanggalTindakLanjut"
            type="date"
            :disabled="loading"
          />


          <!-- UID / ROLE LAIN -->

          <div
            v-else
            class="tanggal-tindak-lanjut-readonly"
          >

            {{
              form.tanggalTindakLanjut ||
              'Belum ada tanggal tindak lanjut.'
            }}

          </div>


          <!-- INFO ADMIN -->

          <small
            v-if="isAdmin"
            class="field-info"
          >
            Tanggal tindak lanjut hanya dapat diisi atau diubah oleh Admin.
          </small>

        </div>


        <!-- =========================
             ACTION
        ========================== -->

        <div class="form-actions">


          <!--
            Saat tambah:
            Kirim Laporan

            Saat edit:
            Simpan perubahan
          -->

          <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >

            {{
              loading
                ? 'Menyimpan...'
                : isEditMode
                  ? 'Simpan Perubahan'
                  : 'Kirim Laporan'
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

      </form>

    </section>

  </div>

</template>


<style scoped>

/* =========================
   PAGE
========================= */

.keluhan-page {
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
   FORM ROW
========================= */

.form-row {
  margin-bottom: 20px;
}


/* =========================
   LABEL
========================= */

label {
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

  min-height: 110px;

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


/* =========================
   PREVIEW FOTO
========================= */

.preview-img {
  margin-top: 12px;

  max-width: 100%;
  max-height: 280px;

  border-radius: 10px;
  border: 1px solid #e5eaf1;

  display: block;

  object-fit: contain;
}


/* =========================
   NO PHOTO
========================= */

.no-photo {
  display: block;

  padding: 12px 14px;

  border-radius: 9px;

  background: #f8fafc;

  color: #64748b;

  font-size: 13px;
}


/* =========================
   READONLY INFO
========================= */

.readonly-info {
  display: block;

  margin-top: 7px;

  color: #94a3b8;

  font-size: 11px;
}


/* =========================
   FIELD INFO
========================= */

.field-info {
  display: block;

  margin-top: 7px;

  color: #64748b;

  font-size: 11px;
}


/* =========================
   TINDAK LANJUT READONLY
========================= */

.tindak-lanjut-readonly {
  min-height: 110px;

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
   TANGGAL TINDAK LANJUT READONLY
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


.btn-secondary:hover {
  background: #e2e8f0;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1200px) {

  .keluhan-page {
    padding: 28px 26px 40px;
  }

}


@media (max-width: 768px) {

  .keluhan-page {
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

}

</style>