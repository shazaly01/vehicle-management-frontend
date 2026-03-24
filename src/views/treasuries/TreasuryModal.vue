<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل بيانات الخزينة' : 'إضافة خزينة جديدة'"
    @close="handleClose"
  >
    <TreasuryForm
      :initial-data="treasury"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTreasuryStore } from '@/stores/treasuryStore'
import AppModal from '@/components/ui/AppModal.vue'
import TreasuryForm from './TreasuryForm.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  treasury: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])
const treasuryStore = useTreasuryStore()
const isSaving = ref(false)
const serverErrors = ref({})

const isEditing = computed(() => !!props.treasury?.id)

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
      await treasuryStore.updateTreasury(formData.id, formData)
    } else {
      await treasuryStore.createTreasury(formData)
    }
    emit('saved')
    handleClose()
  } catch (error) {
    if (treasuryStore.validationErrors) {
      serverErrors.value = treasuryStore.validationErrors
    }
    console.error('Failed to save treasury:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
