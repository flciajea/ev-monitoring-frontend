<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const errorMsg = ref('')
const loading = ref(false)

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  try {
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
})

const role = computed(() => {
  return currentUser.value?.role?.toLowerCase() || ''
})

const canManage = computed(() => {
  return ['admin', 'uid'].includes(role.value)
})

const isAdmin = computed(() => {
  return role.value === 'admin'
})

const isEditMode = computed(() => {
  return !!route.params.id
})

const form = ref({
  id: null,
  nomorKendaraan: '',
  dealer: '',
  km: null,
  picDriver: '',
  tanggalService: '',
  tanggalTindakLanjut: '',
  keterangan: '',
  status: 'Open',
  tindakLanjut: ''
})

// =========================
// FORMAT TANGGAL
// =========================

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'

  const date = new Date(tanggal)

  if (isNaN(date.getTime())) {
    return tanggal
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// =========================
// STATUS DISPLAY
// =========================

const normalizeStatus = (status) => {
  return status || 'Open'
}

const getStatusClass = (status) => {
  const actualStatus = normalizeStatus(status)

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

// =========================
// AMBIL DATA JADWAL
// =========================

const ambilDataJadwal = async () => {
  if (!isEditMode.value) {
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get(
      `/jadwal-service/${route.params.id}`
    )

    const jadwal = response.data

    form.value = {
      id: jadwal.id,
      nomorKendaraan: jadwal.nomorKendaraan || '',
      dealer: jadwal.dealer || '',
      km: jadwal.km ?? null,
      picDriver: jadwal.picDriver || '',
      tanggalService: jadwal.tanggalService || '',
      tanggalTindakLanjut: jadwal.tanggalTindakLanjut || '',
      keterangan: jadwal.keterangan || '',
      status: jadwal.status || 'Open',
      tindakLanjut: jadwal.tindakLanjut || ''
    }
  } catch (error) {
    errorMsg.value =
      'Gagal mengambil data jadwal service: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  } finally {
    loading.value = false
  }
}

// =========================
// SUBMIT
// =========================

const submitForm = async () => {
  if (!canManage.value) {
    errorMsg.value =
      'Anda tidak memiliki akses untuk mengelola jadwal service.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {

    // =========================
    // UID
    // =========================
    // UID hanya boleh mengubah status

    if (role.value === 'uid') {
      await api.put(
        `/jadwal-service/${form.value.id}`,
        {
          status: form.value.status
        }
      )

      showToast(
        'Status jadwal service berhasil diupdate!'
      )
    }

    // =========================
    // ADMIN
    // =========================
    // Admin boleh mengubah:
    // - status
    // - tindak lanjut
    // - tanggal tindak lanjut

    if (role.value === 'admin') {
      await api.put(
        `/jadwal-service/${form.value.id}`,
        {
          status: form.value.status,
          tindakLanjut: form.value.tindakLanjut,
          tanggalTindakLanjut:
            form.value.tanggalTindakLanjut || null
        }
      )

      showToast(
        'Jadwal service berhasil diupdate!'
      )
    }

    router.push('/jadwal-service')

  } catch (error) {

    errorMsg.value =
      'Gagal menyimpan jadwal service: ' +
      (
        error.response?.data?.error ||
        error.message
      )

  } finally {
    loading.value = false
  }
}

// =========================
// BATAL
// =========================

const batal = () => {
  router.push('/jadwal-service')
}

// =========================
// ON MOUNTED
// =========================

onMounted(() => {
  ambilDataJadwal()
})
</script>

<template>
  <div class="jadwal-form-page">

    <!-- =========================
         HEADER
    ========================== -->
    <section class="page-header">
      <div class="header-content">
        <p class="page-eyebrow">Monitoring</p>

        <h1>Detail Jadwal Service</h1>

        <p class="page-description">
          Informasi lengkap jadwal service dan tindak lanjutnya.
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
          <h2>Data Jadwal Service</h2>

          <p>
            Perbarui status dan tindak lanjut jadwal service.
          </p>
        </div>
      </div>

      <form
        class="form-body"
        @submit.prevent="submitForm"
      >

        <!-- NOMOR KENDARAAN -->
        <div class="form-row">
          <label>
            Nomor Kendaraan
          </label>

          <input
            v-model="form.nomorKendaraan"
            type="text"
            readonly
          />
        </div>

        <!-- DEALER -->
        <div class="form-row">
          <label>
            Dealer / Bengkel
          </label>

          <input
            v-model="form.dealer"
            type="text"
            readonly
          />
        </div>

        <!-- KM -->
        <div class="form-row">
          <label>
            KM
          </label>

          <input
            v-model="form.km"
            type="number"
            readonly
          />
        </div>

        <!-- PIC DRIVER -->
        <div class="form-row">
          <label>
            PIC Driver
          </label>

          <input
            v-model="form.picDriver"
            type="text"
            readonly
          />
        </div>

        <!-- RENCANA TANGGAL SERVICE -->
        <div class="form-row">
          <label>
            Rencana Tanggal Service
          </label>

          <input
            v-model="form.tanggalService"
            type="date"
            readonly
          />
        </div>

        <!-- TANGGAL TINDAK LANJUT -->
        <div class="form-row">
          <label>
            Tanggal Tindak Lanjut
          </label>

          <!-- ADMIN BOLEH EDIT -->
          <input
            v-if="isAdmin"
            v-model="form.tanggalTindakLanjut"
            type="date"
            :disabled="loading"
          />

          <!-- UID / ROLE LAIN READONLY -->
          <div
            v-else
            class="readonly-date"
          >
            {{
              form.tanggalTindakLanjut
                ? formatTanggal(form.tanggalTindakLanjut)
                : 'Belum ada tanggal tindak lanjut'
            }}
          </div>
        </div>

        <!-- KETERANGAN -->
        <div class="form-row">
          <label>
            Keterangan
          </label>

          <textarea
            v-model="form.keterangan"
            rows="3"
            readonly
          ></textarea>
        </div>

        <!-- STATUS -->
        <div class="form-row">
          <label>
            Status
          </label>

          <!-- ADMIN / UID -->
          <select
            v-if="canManage"
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

          <!-- ROLE LAIN -->
          <div
            v-else
            class="status-badge"
            :class="getStatusClass(form.status)"
          >
            {{ normalizeStatus(form.status) }}
          </div>
        </div>

        <!-- TINDAK LANJUT -->
        <div class="form-row">
          <label>
            Tindak Lanjut
          </label>

          <!-- ADMIN -->
          <textarea
            v-if="isAdmin"
            v-model="form.tindakLanjut"
            rows="5"
            placeholder="Tuliskan tindak lanjut jadwal service..."
            :disabled="loading"
          ></textarea>

          <!-- UID / ROLE LAIN -->
          <div
            v-else
            class="readonly-text"
          >
            {{ form.tindakLanjut || 'Belum ada tindak lanjut.' }}
          </div>
        </div>

        <!-- BUTTON -->
        <div class="form-actions">

          <button
            v-if="canManage"
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >
            {{
              loading
                ? 'Menyimpan...'
                : 'Simpan'
            }}
          </button>

          <button
            type="button"
            class="btn-secondary"
            @click="batal"
            :disabled="loading"
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

.jadwal-form-page {
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
   READONLY DATE / TEXT
========================= */

.readonly-date {
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


.readonly-text {
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
  word-break: break-word;
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


.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}


.btn-secondary:disabled {
  opacity: 0.6;

  cursor: not-allowed;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1200px) {

  .jadwal-form-page {
    padding: 28px 26px 40px;
  }

}


@media (max-width: 768px) {

  .jadwal-form-page {
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