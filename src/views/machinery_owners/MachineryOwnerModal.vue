<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل بيانات صاحب الآلية' : 'إضافة صاحب آلية جديد'"
    @close="handleClose"
  >
    <MachineryOwnerForm
      :initial-data="owner"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMachineryOwnerStore } from '@/stores/machineryOwnerStore'
import AppModal from '@/components/ui/AppModal.vue'
import MachineryOwnerForm from './MachineryOwnerForm.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  owner: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])
const machineryOwnerStore = useMachineryOwnerStore()
const isSaving = ref(false)
const serverErrors = ref({})

const isEditing = computed(() => !!props.owner?.id)

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
      await machineryOwnerStore.updateOwner(formData.id, formData)
    } else {
      await machineryOwnerStore.createOwner(formData)
    }
    emit('saved')
    handleClose()
  } catch (error) {
    if (machineryOwnerStore.validationErrors) {
      serverErrors.value = machineryOwnerStore.validationErrors
    }
    console.error('Failed to save machinery owner:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
