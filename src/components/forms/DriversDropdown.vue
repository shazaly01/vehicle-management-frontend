<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="drivers"
      :loading="loading"
      :required="required"
      :disabled="disabled"
      placeholder="اختر السائق"
    />
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'السائق' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const driverStore = useDriverStore()
const { drivers, loading } = storeToRefs(driverStore)
const error = ref(null)

onMounted(async () => {
  if (drivers.value.length === 0) {
    try {
      await driverStore.fetchDrivers(1, '', { paginate: false })
    } catch (err) {
      error.value = 'فشل تحميل قائمة السائقين.'
      console.error('Failed to fetch drivers for dropdown:', err)
    }
  }
})
</script>
