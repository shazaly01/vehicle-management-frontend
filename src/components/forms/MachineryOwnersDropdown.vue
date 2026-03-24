<!--src\components\forms\MachineryOwnersDropdown.vue-->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="owners"
      :loading="loading"
      :required="required"
      :disabled="disabled"
      placeholder="اختر صاحب الآلية"
    />
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMachineryOwnerStore } from '@/stores/machineryOwnerStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'صاحب الآلية' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const machineryOwnerStore = useMachineryOwnerStore()
const { owners, loading } = storeToRefs(machineryOwnerStore)
const error = ref(null)

onMounted(async () => {
  if (owners.value.length === 0) {
    try {
      await machineryOwnerStore.fetchOwners(1, '', { paginate: false })
    } catch (err) {
      error.value = 'فشل تحميل قائمة أصحاب الآليات.'
      console.error('Failed to fetch machinery owners for dropdown:', err)
    }
  }
})
</script>
