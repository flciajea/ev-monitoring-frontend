<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { useToast } from '../composables/useToast'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()

const errorMsg = ref('')

const form = ref({
  id: null,
  namaUnit: '',
  kodeUnit: '',
  tipeUnit: ''
})

const isEditMode = computed(() => !!route.params.id)

const ambilDataUnit = async () => {
  if (!isEditMode.value) return
  try {
    const response = await api.get(`/unit/${route.params.id}`)
    form.value = { ...response.data }
  } catch (error) {
    errorMsg.value = 'Gagal ambil data unit: ' + error.message
  }
}

const submitForm = async () => {
  try {
    if (isEditMode.value) {
      await api.put(`/unit/${form.value.id}`, form.value)
      showToast('Unit berhasil diupdate!')
    } else {
      await api.post('/unit', form.value)
      showToast('Unit berhasil ditambahkan!')
    }
    router.push('/unit')
  } catch (error) {
    errorMsg.value = 'Gagal simpan data: ' + (error.response?.data?.error || error.message)
  }
}

const batal = () => {
  router.push('/unit')
}

onMounted(() => {
  ambilDataUnit()
})
</script>

<template>
  <div>
    <h2>{{ isEditMode ? 'Edit Unit' : 'Tambah Unit' }}</h2>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

    <form @submit.prevent="submitForm" class="form-card">
      <div class="form-row">
        <label>Nama Unit</label>
        <input v-model="form.namaUnit" type="text" required />
      </div>
      <div class="form-row">
        <label>Kode Unit</label>
        <input v-model="form.kodeUnit" type="text" required />
      </div>
      <div class="form-row">
        <label>Tipe Unit</label>
        <input v-model="form.tipeUnit" type="text" placeholder="UID / UIP / UIW / dst" />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">{{ isEditMode ? 'Update' : 'Simpan' }}</button>
        <button type="button" @click="batal" class="btn-secondary">Batal</button>
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

input, select, textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e3edf7;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
  background: #fbfdff;
  color: #1e2a3a;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}

textarea {
  resize: vertical;
  min-height: 90px;
}

input::placeholder, textarea::placeholder {
  color: #a0aec0;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4a9eeb;
  background: white;
  box-shadow: 0 0 0 4px rgba(74, 158, 235, 0.12);
}

input:hover, select:hover, textarea:hover {
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
  transition: background-color 0.2s, transform 0.1s;
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
  transition: background-color 0.2s;
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