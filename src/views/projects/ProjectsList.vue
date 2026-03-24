<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة المشاريع</h1>
      <AppButton v-if="authStore.can('project.create')" @click="openModal()">
        إضافة مشروع جديد
      </AppButton>
    </div>

    <ProjectsFilter
      v-model:searchQuery="searchQuery"
      v-model:status="statusFilter"
      @filter-changed="onFilterChanged"
    />

    <ProjectsTable
      :projects="projects"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-project="openModal"
      @delete-project="openDeleteDialog"
    />

    <ProjectModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :project="selectedProject"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المشروع"
      :message="`هل أنت متأكد من رغبتك في حذف مشروع '${projectToDelete?.name}'؟`"
      @confirmed="deleteSelectedProject"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import ProjectsFilter from './ProjectsFilter.vue'
import ProjectsTable from './ProjectsTable.vue'
import ProjectModal from './ProjectModal.vue'

const projectStore = useProjectStore()
const authStore = useAuthStore()
const { projects, loading, pagination } = storeToRefs(projectStore)
const toast = useToast()

const searchQuery = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onFilterChanged = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  const filters = {
    status: statusFilter.value,
  }
  try {
    await projectStore.fetchProjects(page, searchQuery.value, filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات المشاريع.')
  }
}

onMounted(() => {
  handlePageChange()
})

const isModalOpen = ref(false)
const selectedProject = ref(null)

const openModal = (project = null) => {
  if (project && !authStore.can('project.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذا المشروع.')
    return
  }
  selectedProject.value = project ? { ...project } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const projectToDelete = ref(null)

const openDeleteDialog = (project) => {
  if (!authStore.can('project.delete')) {
    toast.error('ليس لديك الصلاحية لحذف المشاريع.')
    return
  }
  projectToDelete.value = project
  isDeleteDialogOpen.value = true
}

const deleteSelectedProject = async () => {
  try {
    await projectStore.deleteProject(projectToDelete.value.id)
    toast.success(`تم حذف مشروع '${projectToDelete.value.name}' بنجاح.`)
    handlePageChange(pagination.value.current_page)
  } catch (error) {
    toast.error(projectStore.error || 'فشل الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}
</script>
