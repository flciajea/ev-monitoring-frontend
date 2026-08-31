import { ref } from 'vue'

const show = ref(false)
const message = ref('')
const type = ref('success')
let timer = null

export function useToast() {
  const showToast = (msg, toastType = 'success') => {
    message.value = msg
    type.value = toastType
    show.value = true

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      show.value = false
    }, 2500)
  }

  return { show, message, type, showToast }
}