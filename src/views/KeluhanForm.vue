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

  tindakLanjut: ''

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
        response.data.tindakLanjut || ''

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

  <div class="page-container">

    <!-- =========================
         HEADER
         ========================= -->

    <div class="page-header">

      <div>

        <h1>
          {{
            isEditMode
              ? 'Detail Keluhan'
              : 'Keluhan & Pengaduan'
          }}
        </h1>

        <p>
          {{
            isEditMode
              ? 'Detail laporan keluhan kendaraan'
              : 'Laporkan keluhan atau kerusakan kendaraan'
          }}
        </p>

      </div>

    </div>


    <!-- =========================
         ERROR
         ========================= -->

    <p
      v-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>


    <!-- =========================
         FORM
         ========================= -->

    <form
      class="form-card"
      @submit.prevent="submitForm"
    >


      <!-- =========================
           NOMOR KENDARAAN
           ========================= -->

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
           ========================= -->

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
           ========================= -->

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
           ========================= -->

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
           ========================= -->

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
           ========================= -->

      <div class="form-row">

        <label>
          Status
        </label>


        <!-- ADMIN / UID -->

        <select
          v-if="canEditStatus && isEditMode"
          v-model="form.status"
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
           ========================= -->

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
           ACTION
           ========================= -->

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

  </div>

</template>


<script setup>
</script>


<style scoped>

/* =========================
   PAGE
   ========================= */

.page-container {

  width: 100%;

  max-width: 1000px;

  margin: 0;

  padding: 18px 20px;

  box-sizing: border-box;

}


/* =========================
   HEADER
   ========================= */

.page-header {

  margin-bottom: 20px;

}

.page-header h1 {

  margin: 0;

  color: #1e293b;

  font-size: 26px;

  font-weight: 700;

}

.page-header p {

  margin: 5px 0 0;

  color: #64748b;

  font-size: 14px;

}


/* =========================
   FORM CARD
   ========================= */

.form-card {

  width: 100%;

  max-width: 700px;

  background: white;

  padding: 28px;

  border-radius: 16px;

  box-shadow:
    0 4px 20px
    rgba(58, 141, 222, 0.08);

  border:
    1px solid #eef4fa;

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

  font-weight: 600;

  color: #4a5568;

  font-size: 13px;

}


/* =========================
   INPUT
   ========================= */

input,
select,
textarea {

  width: 100%;

  padding: 11px 14px;

  border:
    1.5px solid #e3edf7;

  border-radius: 10px;

  box-sizing: border-box;

  font-size: 14px;

  font-family: inherit;

  background: #fbfdff;

  color: #1e2a3a;

}


/* =========================
   READONLY
   ========================= */

input[readonly],
textarea[readonly] {

  background: #f4f7fa;

  color: #64748b;

  cursor: not-allowed;

}


/* =========================
   TEXTAREA
   ========================= */

textarea {

  resize: vertical;

  min-height: 100px;

  line-height: 1.5;

}


/* =========================
   DISABLED
   ========================= */

select:disabled,
textarea:disabled {

  opacity: 0.7;

  cursor: wait;

}


/* =========================
   FOCUS
   ========================= */

input:focus,
select:focus,
textarea:focus {

  outline: none;

  border-color: #4a9eeb;

  box-shadow:
    0 0 0 4px
    rgba(74, 158, 235, 0.12);

}


/* =========================
   PREVIEW FOTO
   ========================= */

.preview-img {

  margin-top: 12px;

  max-width: 100%;

  max-height: 300px;

  border-radius: 10px;

  border:
    1px solid #eef4fa;

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

  min-height: 100px;

  padding: 12px 14px;

  box-sizing: border-box;

  border:
    1.5px solid #e3edf7;

  border-radius: 10px;

  background: #f4f7fa;

  color: #475569;

  font-size: 14px;

  line-height: 1.6;

  white-space: pre-wrap;

  overflow-wrap: anywhere;

}


/* =========================
   STATUS BADGE
   ========================= */

.status-badge {

  display: inline-flex;

  align-items: center;

  justify-content: center;

  min-width: 95px;

  min-height: 38px;

  padding: 0 16px;

  border-radius: 999px;

  font-size: 13px;

  font-weight: 600;

  box-sizing: border-box;

}


/* =========================
   OPEN
   ========================= */

.status-pending {

  background: #eaf3ff;

  color: #2563eb;

  border:
    1px solid #93c5fd;

}


/* =========================
   ON PROGRESS
   ========================= */

.status-progress {

  background: #fff8db;

  color: #ca8a04;

  border:
    1px solid #facc15;

}


/* =========================
   CLOSE
   ========================= */

.status-success {

  background: #e8f8e9;

  color: #16a34a;

  border:
    1px solid #22c55e;

}


/* =========================
   CANCEL
   ========================= */

.status-cancel {

  background: #fff0f0;

  color: #dc2626;

  border:
    1px solid #f87171;

}


/* =========================
   DEFAULT
   ========================= */

.status-default {

  background: #f1f5f9;

  color: #475569;

  border:
    1px solid #cbd5e1;

}


/* =========================
   FORM ACTIONS
   ========================= */

.form-actions {

  display: flex;

  gap: 12px;

  margin-top: 28px;

  padding-top: 20px;

  border-top:
    1px solid #f0f4f8;

}


/* =========================
   BUTTON
   ========================= */

.btn-primary,
.btn-secondary {

  padding: 11px 24px;

  border-radius: 10px;

  cursor: pointer;

  font-weight: 600;

  font-family: inherit;

  font-size: 14px;

  border: none;

}


/* =========================
   PRIMARY
   ========================= */

.btn-primary {

  background: #4a9eeb;

  color: white;

}

.btn-primary:hover:not(:disabled) {

  background: #2b7cd3;

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

}

.btn-secondary:hover {

  background: #e6ebf1;

}


/* =========================
   ERROR
   ========================= */

.error-text {

  color: #c0392b;

  background: #fdecea;

  border:
    1px solid #f8d7d3;

  padding: 12px 16px;

  border-radius: 10px;

  font-size: 14px;

  margin-bottom: 20px;

}


/* =========================
   MOBILE
   ========================= */

@media (max-width: 768px) {

  .page-container {

    padding: 14px;

  }

  .page-header h1 {

    font-size: 22px;

  }

  .form-card {

    padding: 20px;

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