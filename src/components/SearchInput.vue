<script setup>
defineProps({
  modelValue: String,
  placeholder: { type: String, default: 'Cari...' }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search-box">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholder"
    />
  </div>
</template>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #cfe4fb;
  border-radius: 8px;
  padding: 9px 14px;
  max-width: 300px;
  margin-bottom: 16px;
}

.search-box svg {
  color: #a0aec0;
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  width: 100%;
}
</style>