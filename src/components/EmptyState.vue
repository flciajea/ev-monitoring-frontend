<script setup>
defineProps({
  message: { type: String, default: 'Belum ada data' },
  subtext: { type: String, default: '' }
})
</script>

<template>
  <div class="empty-state">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 4v6" />
    </svg>
    <p class="empty-message">{{ message }}</p>
    <p v-if="subtext" class="empty-subtext">{{ subtext }}</p>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(58, 141, 222, 0.08);
  color: #a0aec0;
}

.empty-message {
  margin: 16px 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #718096;
}

.empty-subtext {
  font-size: 13px;
  color: #a0aec0;
  margin: 0;
}
</style>