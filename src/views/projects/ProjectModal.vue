<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد'"
    @close="handleClose"
  >
    <ProjectForm
      :initial-data="project"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import AppModal from '@/components/ui/AppModal.vue'
import ProjectForm from './ProjectForm.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  project: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])
const projectStore = useProjectStore()
const isSaving = ref(false)
const serverErrors = ref({})

const isEditing = computed(() => !!props.project?.id)

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
      await projectStore.updateProject(formData.id, formData)
    } else {
      await projectStore.createProject(formData)
    }
    emit('saved')
    handleClose()
  } catch (error) {
    if (projectStore.validationErrors) {
      serverErrors.value = projectStore.validationErrors
    }
    console.error('Failed to save project:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
