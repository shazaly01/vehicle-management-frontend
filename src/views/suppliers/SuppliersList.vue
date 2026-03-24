<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة الموردين</h1>
      <AppButton v-if="authStore.can('supplier.create')" @click="openModal()">
        إضافة مورد جديد
      </AppButton>
    </div>

    <SuppliersFilter v-model:searchQuery="searchQuery" @filter-changed="onFilterChanged" />

    <SuppliersTable
      :suppliers="suppliers"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-supplier="openModal"
      @delete-supplier="openDeleteDialog"
    />

    <SupplierModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :supplier="selectedSupplier"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المورد"
      :message="`هل أنت متأكد من رغبتك في حذف المورد '${supplierToDelete?.name}'؟`"
      @confirmed="deleteSelectedSupplier"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupplierStore } from '@/stores/supplierStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import SuppliersFilter from './SuppliersFilter.vue'
import SuppliersTable from './SuppliersTable.vue'
import SupplierModal from './SupplierModal.vue'

const supplierStore = useSupplierStore()
const authStore = useAuthStore()
const { suppliers, loading, pagination } = storeToRefs(supplierStore)
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
    await supplierStore.fetchSuppliers(page, searchQuery.value)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات الموردين.')
  }
}

onMounted(() => {
  handlePageChange()
})

const isModalOpen = ref(false)
const selectedSupplier = ref(null)

const openModal = (supplier = null) => {
  if (supplier && !authStore.can('supplier.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذا المورد.')
    return
  }
  selectedSupplier.value = supplier ? { ...supplier } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const supplierToDelete = ref(null)

const openDeleteDialog = (supplier) => {
  if (!authStore.can('supplier.delete')) {
    toast.error('ليس لديك الصلاحية لحذف الموردين.')
    return
  }
  supplierToDelete.value = supplier
  isDeleteDialogOpen.value = true
}

const deleteSelectedSupplier = async () => {
  if (supplierToDelete.value) {
    try {
      await supplierStore.deleteSupplier(supplierToDelete.value.id)
      toast.success(`تم حذف المورد '${supplierToDelete.value.name}' بنجاح.`)

      if (suppliers.value.length === 1 && pagination.value.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value.current_page)
      }
    } catch (error) {
      const errorMessage =
        supplierStore.error ||
        error.response?.data?.message ||
        'فشل حذف المورد لوجود عمليات مرتبطة به.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      supplierToDelete.value = null
    }
  }
}
</script>
