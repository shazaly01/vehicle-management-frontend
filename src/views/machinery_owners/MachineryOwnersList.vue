<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة أصحاب الآليات</h1>
      <AppButton v-if="authStore.can('machinery_owner.create')" @click="openModal()">
        إضافة مالك جديد
      </AppButton>
    </div>

    <MachineryOwnersFilter v-model:searchQuery="searchQuery" @filter-changed="onFilterChanged" />

    <MachineryOwnersTable
      :owners="owners"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-owner="openModal"
      @delete-owner="openDeleteDialog"
    />

    <MachineryOwnerModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :owner="selectedOwner"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف صاحب الآلية"
      :message="`هل أنت متأكد من حذف المالك '${ownerToDelete?.name}'؟ سيؤدي ذلك لحذف ارتباطه بالآليات التابعة له.`"
      @confirmed="deleteSelectedOwner"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMachineryOwnerStore } from '@/stores/machineryOwnerStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import MachineryOwnersFilter from './MachineryOwnersFilter.vue'
import MachineryOwnersTable from './MachineryOwnersTable.vue'
import MachineryOwnerModal from './MachineryOwnerModal.vue'

const ownerStore = useMachineryOwnerStore()
const authStore = useAuthStore()
const { owners, loading, pagination } = storeToRefs(ownerStore)
const toast = useToast()

const searchQuery = ref('')
let searchTimeout = null

const onFilterChanged = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => handlePageChange(1), 500)
}

const handlePageChange = async (page = 1) => {
  try {
    await ownerStore.fetchOwners(page, searchQuery.value)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب البيانات.')
  }
}

onMounted(() => handlePageChange())

const isModalOpen = ref(false)
const selectedOwner = ref(null)

const openModal = (owner = null) => {
  if (owner && !authStore.can('machinery_owner.update')) {
    toast.error('صلاحية التعديل غير متوفرة.')
    return
  }
  selectedOwner.value = owner ? { ...owner } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const ownerToDelete = ref(null)

const openDeleteDialog = (owner) => {
  if (!authStore.can('machinery_owner.delete')) {
    toast.error('صلاحية الحذف غير متوفرة.')
    return
  }
  ownerToDelete.value = owner
  isDeleteDialogOpen.value = true
}

const deleteSelectedOwner = async () => {
  try {
    await ownerStore.deleteOwner(ownerToDelete.value.id)
    toast.success('تم الحذف بنجاح.')
    handlePageChange(pagination.value.current_page)
  } catch (error) {
    toast.error(ownerStore.error || 'فشل الحذف.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}
</script>
