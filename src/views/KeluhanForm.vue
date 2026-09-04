<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const errorMsg = ref('')
const previewFoto = ref('')

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  try {
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
})

const isAdmin = computed(() => {
  return currentUser.value?.role === 'admin'
})

const isEditMode = computed(() => {
  return !!route.params.id
})

const form = ref({
  id: null,
  nomorKendaraan: '',
  pengaduan: '',
  photoBase64: '',
  tanggal: '',
  username: '',
  status: 'Open'
})

const ambilDataKeluhan = async () => {
  if (!isEditMode.value) {
    form.value.nomorKendaraan =
      currentUser.value?.noKendaraan || ''

    form.value.username =
      currentUser.value?.username || ''

    form.value.tanggal =
      new Date().toISOString().split('T')[0]

    form.value.status = 'Open'

    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const response = await api.get(
      `/keluhan/${route.params.id}`
    )

    form.value = {
      ...form.value,
      ...response.data
    }

    if (response.data.photoBase64) {
      previewFoto.value = response.data.photoBase64
    }
  } catch (error) {
    errorMsg.value =
      'Gagal mengambil data keluhan: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  } finally {
    loading.value = false
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]

  if (!file) return

  const reader = new FileReader()

  reader.onload = (e) => {
    form.value.photoBase64 = e.target.result
    previewFoto.value = e.target.result
  }

  reader.readAsDataURL(file)
}

const submitForm = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    const payload = {
      nomorKendaraan: form.value.nomorKendaraan,
      pengaduan: form.value.pengaduan,
      photoBase64: form.value.photoBase64,
      tanggal: form.value.tanggal,
      username: form.value.username,
      status: form.value.status
    }

    if (isEditMode.value) {
      await api.put(
        `/keluhan/${form.value.id}`,
        payload
      )

      showToast('Keluhan berhasil diupdate!')
    } else {
      await api.post(
        '/keluhan',
        payload
      )

      showToast('Keluhan berhasil dikirim!')
    }

    router.push('/keluhan')
  } catch (error) {
    errorMsg.value =
      'Gagal menyimpan data: ' +
      (
        error.response?.data?.error ||
        error.message
      )
  } finally {
    loading.value = false
  }
}

const batal = () => {
  router.push('/keluhan')
}

onMounted(() => {
  ambilDataKeluhan()
})
</script>

<template>
  <div>
    <h2>
      {{ isEditMode ? 'Edit Keluhan' : 'Keluhan & Pengaduan' }}
    </h2>

    <p
      v-if="errorMsg"
      class="error-text"
    >
      {{ errorMsg }}
    </p>

    <form
      class="form-card"
      @submit.prevent="submitForm"
    >
      <div class="form-row">
        <label>Nomor Kendaraan</label>

        <input
          v-model="form.nomorKendaraan"
          type="text"
          readonly
          placeholder="Nomor kendaraan belum tersedia"
        />
      </div>

      <div class="form-row">
        <label>Pengaduan & Keluhan</label>

        <textarea
          v-model="form.pengaduan"
          rows="4"
          required
          placeholder="Jelaskan keluhan atau kerusakan yang dialami..."
        ></textarea>
      </div>

      <div class="form-row">
        <label>Foto Kerusakan (opsional)</label>

        <input
          type="file"
          accept="image/*"
          @change="handleFileChange"
        />

        <img
          v-if="previewFoto"
          :src="previewFoto"
          class="preview-img"
          alt="Preview foto kerusakan"
        />
      </div>

      <div
        v-if="isEditMode && isAdmin"
        class="form-row"
      >
        <label>Status</label>

        <select v-model="form.status">
          <option value="Open">Open</option>
          <option value="On Progress">On Progress</option>
          <option value="Close">Close</option>
          <option value="Cancel">Cancel</option>
        </select>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn-primary"
          :disabled="loading"
        >
          {{
            loading
              ? 'Menyimpan...'
              : isEditMode
                ? 'Update'
                : 'Kirim Laporan'
          }}
        </button>

        <button
          type="button"
          class="btn-secondary"
          @click="batal"
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
}

input[readonly] {
  background: #f4f7fa;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4a9eeb;
  box-shadow: 0 0 0 4px rgba(74, 158, 235, 0.12);
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

.btn-secondary {
  background: #f4f7fa;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #e6ebf1;
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