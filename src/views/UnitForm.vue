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
  color: #2b7cd3;
  font-size: 22px;
  margin-bottom: 16px;
}

.form-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08);
  max-width: 480px;
}

.form-row {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #4a5568;
  font-size: 13px;
}

input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #cfe4fb;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 14px;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #4a9eeb;
  box-shadow: 0 0 0 3px rgba(74, 158, 235, 0.15);
}

.form-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background-color: #4a9eeb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
}

.btn-primary:hover {
  background-color: #2b7cd3;
}

.btn-secondary {
  background-color: #eef2f6;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
}

.btn-secondary:hover {
  background-color: #e0e6ed;
}

.error-text {
  color: #e74c3c;
  background: #fdecea;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}
</style>