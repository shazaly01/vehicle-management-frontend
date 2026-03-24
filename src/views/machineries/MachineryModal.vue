<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل بيانات الآلية' : 'إضافة آلية جديدة'"
    @close="handleClose"
  >
    <MachineryForm
      :initial-data="machinery"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMachineryStore } from '@/stores/machineryStore'
import AppModal from '@/components/ui/AppModal.vue'
import MachineryForm from './MachineryForm.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  machinery: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])
const machineryStore = useMachineryStore()
const isSaving = ref(false)
const serverErrors = ref({})

const isEditing = computed(() => !!props.machinery?.id)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      serverErrors.value = {}
    }
  },
)

const handleSubmit = async (formData) => {
  isSaving.value = true
  serverErrors.value = {}

  try {
    if (isEditing.value) {
      await machineryStore.updateMachinery(formData.id, formData)
    } else {
      await machineryStore.createMachinery(formData)
    }
    emit('saved')
    handleClose()
  } catch (error) {
    if (machineryStore.validationErrors) {
      serverErrors.value = machineryStore.validationErrors
    }
    console.error('Failed to save machinery:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
