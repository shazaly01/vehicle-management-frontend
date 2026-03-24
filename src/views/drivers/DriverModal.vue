<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'"
    @close="handleClose"
  >
    <DriverForm
      :initial-data="driver"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import AppModal from '@/components/ui/AppModal.vue'
import DriverForm from './DriverForm.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  driver: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const driverStore = useDriverStore()
const isSaving = ref(false)
const serverErrors = ref({})

const isEditing = computed(() => !!props.driver?.id)

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
      await driverStore.updateDriver(formData.id, formData)
    } else {
      await driverStore.createDriver(formData)
    }

    emit('saved')
    handleClose()
  } catch (error) {
    if (driverStore.validationErrors) {
      serverErrors.value = driverStore.validationErrors
    }
    console.error('Failed to save driver:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
