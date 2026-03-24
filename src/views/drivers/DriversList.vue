<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة السائقين</h1>
      <AppButton v-if="authStore.can('driver.create')" @click="openModal()">
        إضافة سائق جديد
      </AppButton>
    </div>

    <DriversFilter v-model:searchQuery="searchQuery" @filter-changed="onFilterChanged" />

    <DriversTable
      :drivers="drivers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-driver="openModal"
      @delete-driver="openDeleteDialog"
      @open-documents="openDocumentsModal"
    />

    <DriverModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :driver="selectedDriver"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <DocumentsManagerModal
      v-if="documentOwner"
      v-model="isDocsModalOpen"
      :owner="documentOwner"
      targetType="driver"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف السائق"
      :message="`هل أنت متأكد من حذف السائق '${driverToDelete?.name}'؟ لا يمكن التراجع عن هذه العملية.`"
      @confirmed="deleteSelectedDriver"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDriverStore } from '@/stores/driverStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import DriversFilter from './DriversFilter.vue'
import DriversTable from './DriversTable.vue'
import DriverModal from './DriverModal.vue'

// استيراد مكون المستندات الجديد
import DocumentsManagerModal from '@/views/documents/DocumentsManagerModal.vue'

const driverStore = useDriverStore()
const authStore = useAuthStore()
const { drivers, loading, pagination } = storeToRefs(driverStore)
const toast = useToast()

const searchQuery = ref('')
let searchTimeout = null

const onFilterChanged = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1)
  }, 500)
}

const handlePageChange = async (page = 1) => {
  try {
    await driverStore.fetchDrivers(page, searchQuery.value)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات السائقين.')
  }
}

onMounted(() => {
  handlePageChange()
})

const isModalOpen = ref(false)
const selectedDriver = ref(null)

const openModal = (driver = null) => {
  if (driver && !authStore.can('driver.update')) {
    toast.error('ليس لديك صلاحية لتعديل بيانات السائق.')
    return
  }
  selectedDriver.value = driver ? { ...driver } : null
  isModalOpen.value = true
}

// --- منطق نافذة المستندات ---
const isDocsModalOpen = ref(false)
const documentOwner = ref(null)

const openDocumentsModal = (driver) => {
  documentOwner.value = driver
  isDocsModalOpen.value = true
}
// -----------------------------

const isDeleteDialogOpen = ref(false)
const driverToDelete = ref(null)

const openDeleteDialog = (driver) => {
  if (!authStore.can('driver.delete')) {
    toast.error('ليس لديك صلاحية لحذف السائقين.')
    return
  }
  driverToDelete.value = driver
  isDeleteDialogOpen.value = true
}

const deleteSelectedDriver = async () => {
  if (driverToDelete.value) {
    try {
      await driverStore.deleteDriver(driverToDelete.value.id)
      toast.success(`تم حذف السائق '${driverToDelete.value.name}' بنجاح.`)

      if (drivers.value.length === 1 && pagination.value.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value.current_page)
      }
    } catch (error) {
      const errorMessage =
        driverStore.error ||
        error.response?.data?.message ||
        'فشل الحذف، قد يكون السائق مرتبطاً بأوامر تشغيل.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      driverToDelete.value = null
    }
  }
}
</script>
