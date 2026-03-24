<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="dropdownOptions"
      :loading="loading"
      :required="required"
      :disabled="disabled"
      placeholder="اختر الآلية"
    />
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMachineryStore } from '@/stores/machineryStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'الآلية' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  availableOnly: { type: Boolean, default: false }, // ميزة إضافية للآليات المتاحة فقط
})

defineEmits(['update:modelValue'])

const machineryStore = useMachineryStore()
const { machineries, availableMachineries, loading } = storeToRefs(machineryStore)
const error = ref(null)

// تحديد القائمة المناسبة بناءً على الـ prop
const dropdownOptions = computed(() => {
  // بما أن حقل الاسم في الآليات هو plate_number_or_name نقوم بتمريره لـ AppDropdown كـ name
  const sourceList = props.availableOnly ? availableMachineries.value : machineries.value
  return sourceList.map((m) => ({
    id: m.id,
    name: m.plate_number_or_name, // التأكد من توافق المفتاح مع مكون AppDropdown
  }))
})

onMounted(async () => {
  try {
    if (props.availableOnly) {
      if (availableMachineries.value.length === 0) {
        await machineryStore.fetchAvailableMachineries()
      }
    } else {
      if (machineries.value.length === 0) {
        await machineryStore.fetchMachineries(1, '', { paginate: false })
      }
    }
  } catch (err) {
    error.value = 'فشل تحميل قائمة الآليات.'
    console.error('Failed to fetch machineries for dropdown:', err)
  }
})
</script>
