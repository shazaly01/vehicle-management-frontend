<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة الآليات والمعدات</h1>
      <AppButton v-if="authStore.can('machinery.create')" @click="openModal()">
        إضافة آلية جديدة
      </AppButton>
    </div>

    <MachineriesFilter
      v-model:searchQuery="searchQuery"
      v-model:ownerId="ownerIdFilter"
      v-model:status="statusFilter"
      @filter-changed="onFilterChanged"
    />

    <MachineriesTable
      :machineries="machineries"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-machinery="openModal"
      @delete-machinery="openDeleteDialog"
      @open-documents="openDocumentsModal"
    />

    <MachineryModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :machinery="selectedMachinery"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <DocumentsManagerModal
      v-if="documentOwner"
      v-model="isDocsModalOpen"
      :owner="documentOwner"
      targetType="machinery"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الآلية"
      :message="`هل أنت متأكد من حذف الآلية '${machineryToDelete?.plate_number_or_name}'؟`"
      @confirmed="deleteSelectedMachinery"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMachineryStore } from '@/stores/machineryStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import MachineriesFilter from './MachineriesFilter.vue'
import MachineriesTable from './MachineriesTable.vue'
import MachineryModal from './MachineryModal.vue'

// استيراد نافذة المستندات
import DocumentsManagerModal from '@/views/documents/DocumentsManagerModal.vue'

const machineryStore = useMachineryStore()
const authStore = useAuthStore()
const { machineries, loading, pagination } = storeToRefs(machineryStore)
const toast = useToast()

const searchQuery = ref('')
const ownerIdFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

const onFilterChanged = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => handlePageChange(1), 500)
}

const handlePageChange = async (page = 1) => {
  const filters = {
    // التعديل هنا: غيرنا machinery_owner_id إلى owner_id ليتطابق مع الـ Backend
    owner_id: ownerIdFilter.value,
    status: statusFilter.value,
  }
  try {
    await machineryStore.fetchMachineries(page, searchQuery.value, filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات الآليات.')
  }
}

onMounted(() => handlePageChange())

const isModalOpen = ref(false)
const selectedMachinery = ref(null)

const openModal = (machinery = null) => {
  if (machinery && !authStore.can('machinery.update')) {
    toast.error('ليس لديك صلاحية التعديل.')
    return
  }
  selectedMachinery.value = machinery ? { ...machinery } : null
  isModalOpen.value = true
}

// --- منطق نافذة المستندات ---
const isDocsModalOpen = ref(false)
const documentOwner = ref(null)

const openDocumentsModal = (machinery) => {
  documentOwner.value = machinery
  isDocsModalOpen.value = true
}
// -----------------------------

const isDeleteDialogOpen = ref(false)
const machineryToDelete = ref(null)

const openDeleteDialog = (machinery) => {
  if (!authStore.can('machinery.delete')) {
    toast.error('ليس لديك صلاحية الحذف.')
    return
  }
  machineryToDelete.value = machinery
  isDeleteDialogOpen.value = true
}

const deleteSelectedMachinery = async () => {
  try {
    await machineryStore.deleteMachinery(machineryToDelete.value.id)
    toast.success('تم حذف الآلية بنجاح.')
    handlePageChange(pagination.value.current_page)
  } catch (error) {
    toast.error(machineryStore.error || 'فشل الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}
</script>
