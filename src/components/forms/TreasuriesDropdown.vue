<!--src\components\forms\TreasuriesDropdown.vue-->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="treasuries"
      :loading="loading"
      :required="required"
      :disabled="disabled"
      placeholder="اختر الخزينة"
    />
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الخزينة' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const treasuryStore = useTreasuryStore()
const { treasuries, loading } = storeToRefs(treasuryStore)
const error = ref(null)

onMounted(async () => {
  if (treasuries.value.length === 0) {
    try {
      await treasuryStore.fetchTreasuries(1, '', { paginate: false })
    } catch (err) {
      error.value = 'فشل تحميل قائمة الخزائن.'
      console.error('Failed to fetch treasuries for dropdown:', err)
    }
  }
})
</script>
