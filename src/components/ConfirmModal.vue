<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'Konfirmasi' },
  message: { type: String, default: 'Apakah Anda yakin?' },
  confirmText: { type: String, default: 'Ya, Lanjutkan' },
  cancelText: { type: String, default: 'Batal' },
  danger: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal-box">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button @click="emit('cancel')" class="btn-cancel">{{ cancelText }}</button>
          <button @click="emit('confirm')" :class="danger ? 'btn-danger' : 'btn-confirm'">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 42, 58, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal-box {
  background: white;
  border-radius: 14px;
  padding: 24px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.modal-box h3 {
  margin: 0 0 8px;
  color: #1e2a3a;
  font-size: 17px;
}

.modal-box p {
  margin: 0 0 20px;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-cancel {
  background: #eef2f6;
  color: #4a5568;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
}

.btn-cancel:hover {
  background: #e0e6ed;
}

.btn-confirm {
  background: #4a9eeb;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
}

.btn-confirm:hover {
  background: #2b7cd3;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c0392b;
}
</style>