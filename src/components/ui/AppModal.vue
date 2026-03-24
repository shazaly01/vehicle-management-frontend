<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')"></div>

        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="isOpen"
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-surface-section border border-surface-border p-6 text-right align-middle shadow-xl transition-all"
            >
              <div
                class="flex items-center justify-between mb-6 border-b border-surface-border pb-4"
              >
                <h3 class="text-xl font-bold text-white">
                  {{ title }}
                </h3>
                <button
                  @click="$emit('close')"
                  class="text-text-muted hover:text-white transition-colors p-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="mt-2">
                <slot></slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
})

defineEmits(['close'])

// منع التمرير (Scroll) في الخلفية عند فتح المودال
const toggleScroll = (disable) => {
  document.body.style.overflow = disable ? 'hidden' : ''
}

onMounted(() => {
  if (props.isOpen) toggleScroll(true)
})

onUnmounted(() => {
  toggleScroll(false)
})
</script>

<style scoped>
/* يمكنك إضافة تنسيقات CSS إضافية هنا إذا لزم الأمر */
</style>
