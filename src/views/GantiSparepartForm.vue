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
const daftarSparepart = ref([])
const previewFoto = ref('')

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
  sparepart: '',
  biaya: null,
  photoBase64Json: '',
  tanggal: '',
  keterangan: '',
  username: '',
  status: 'Open'
})


// =========================
// AMBIL DAFTAR SPAREPART
// =========================

const ambilDaftarSparepart = async () => {
  try {
    const response = await api.get('/sparepart')

    daftarSparepart.value = response.data.filter(
      sparepart => sparepart.fUsed
    )
  } catch (error) {
    console.error(
      'Gagal ambil daftar sparepart:',
      error
    )
  }
}


// =========================
// AMBIL DATA GANTI SPAREPART
// =========================

const ambilDataGantiSparepart = async () => {
  if (!isEditMode.value) return

  try {
    const response = await api.get(
      `/ganti-sparepart/${route.params.id}`
    )

    form.value = {
      ...form.value,
      ...response.data
    }

    if (response.data.photoBase64Json) {
      previewFoto.value = response.data.photoBase64Json
    }
  } catch (error) {
    errorMsg.value =
      'Gagal ambil data: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  }
}


// =========================
// FOTO
// =========================

const handleFileChange = (event) => {
  const file = event.target.files[0]

  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    form.value.photoBase64Json = e.target.result
    previewFoto.value = e.target.result
  }

  reader.readAsDataURL(file)
}


// =========================
// SUBMIT
// =========================

const submitForm = async () => {
  if (!canManage.value) {
    errorMsg.value = 'Anda tidak memiliki akses untuk mengelola data.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const payload = {
      nomorKendaraan: form.value.nomorKendaraan,
      sparepart: form.value.sparepart,
      biaya: form.value.biaya,
      photoBase64Json: form.value.photoBase64Json,
      tanggal:
        form.value.tanggal ||
        new Date().toISOString().split('T')[0],
      keterangan: form.value.keterangan,

      username:
        isEditMode.value
          ? form.value.username
          : currentUser.value?.username,

      status:
        isEditMode.value
          ? form.value.status
          : 'Open'
    }

    if (isEditMode.value) {
      await api.put(
        `/ganti-sparepart/${form.value.id}`,
        payload
      )

      showToast(
        'Data ganti sparepart berhasil diupdate!'
      )
    } else {
      await api.post(
        '/ganti-sparepart',
        payload
      )

      showToast(
        'Data ganti sparepart berhasil ditambahkan!'
      )
    }

    router.push('/ganti-sparepart')

  } catch (error) {
    errorMsg.value =
      'Gagal simpan data: ' +
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
  router.push('/ganti-sparepart')
}


// =========================
// ON MOUNTED
// =========================

onMounted(() => {
  ambilDaftarSparepart()
  ambilDataGantiSparepart()
})
</script>


<template>
  <div>

    <h2>
      {{
        isEditMode
          ? 'Edit Ganti Sparepart'
          : 'Ganti Sparepart Fast Moving'
      }}
    </h2>


    <!-- ERROR -->

    <p
      v-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>


    <form
      @submit.prevent="submitForm"
      class="form-card"
    >

      <!-- NOMOR KENDARAAN -->

      <div class="form-row">

        <label>
          Nomor Kendaraan
        </label>

        <input
          v-model="form.nomorKendaraan"
          type="text"
          required
          placeholder="Contoh: EV-001"
        />

      </div>


      <!-- SPAREPART -->

      <div class="form-row">

        <label>
          Sparepart
        </label>

        <select
          v-model="form.sparepart"
          required
        >

          <option value="">
            - Pilih Sparepart -
          </option>

          <option
            v-for="s in daftarSparepart"
            :key="s.id"
            :value="s.namaSparepart"
          >
            {{ s.namaSparepart }}
          </option>

        </select>

      </div>


      <!-- BIAYA -->

      <div class="form-row">

        <label>
          Biaya (Rp)
        </label>

        <input
          v-model.number="form.biaya"
          type="number"
          min="0"
          placeholder="150000"
        />

      </div>


      <!-- TANGGAL -->

      <div class="form-row">

        <label>
          Tanggal
        </label>

        <input
          v-model="form.tanggal"
          type="date"
          required
        />

      </div>


      <!-- KETERANGAN -->

      <div class="form-row">

        <label>
          Keterangan
        </label>

        <textarea
          v-model="form.keterangan"
          rows="3"
          placeholder="Keterangan penggantian sparepart..."
        ></textarea>

      </div>


      <!-- FOTO -->

      <div class="form-row">

        <label>
          Foto Bukti (opsional)
        </label>

        <input
          type="file"
          accept="image/*"
          @change="handleFileChange"
        />

        <img
          v-if="previewFoto"
          :src="previewFoto"
          class="preview-img"
        />

      </div>


      <!-- STATUS -->

      <div
        v-if="isAdmin && isEditMode"
        class="form-row"
      >

        <label>
          Status
        </label>

        <select
          v-model="form.status"
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

      </div>


      <!-- BUTTON -->

      <div class="form-actions">

        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          {{
            loading
              ? 'Menyimpan...'
              : (
                  isEditMode
                    ? 'Update'
                    : 'Simpan'
                )
          }}
        </button>

        <button
          type="button"
          @click="batal"
          class="btn-secondary"
        >
          Batal
        </button>

      </div>

    </form>

  </div>
</template>


<style scoped>

h2 {
  color: #1e2a3a;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

.form-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(58, 141, 222, 0.1);
  max-width: 520px;
  border: 1px solid #eef4fa;
}

.form-row {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
  letter-spacing: 0.01em;
}

input,
select,
textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e3edf7;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
  background: #fbfdff;
  color: #1e2a3a;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

input::placeholder,
textarea::placeholder {
  color: #a0aec0;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4a9eeb;
  background: white;
  box-shadow:
    0 0 0 4px rgba(74, 158, 235, 0.12);
}

input:hover,
select:hover,
textarea:hover {
  border-color: #cfe4fb;
}

.preview-img {
  margin-top: 12px;
  max-width: 100%;
  max-height: 240px;
  border-radius: 10px;
  border: 1px solid #eef4fa;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f0f4f8;
}

.btn-primary {
  background-color: #4a9eeb;
  color: white;
  border: none;
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2b7cd3;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  background-color: #b8d9f7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f4f7fa;
  color: #4a5568;
  border: none;
  padding: 11px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
  transition:
    background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #e6ebf1;
}

.error-text {
  color: #c0392b;
  background: #fdecea;
  border: 1px solid #f8d7d3;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 20px;
}

</style>