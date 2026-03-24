<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة الخزائن والحسابات</h1>
      <AppButton v-if="authStore.can('treasury.create')" @click="openModal()">
        إضافة خزينة جديدة
      </AppButton>
    </div>

    <TreasuriesTable
      :treasuries="treasuries"
      :loading="loading"
      @edit-treasury="openModal"
      @delete-treasury="openDeleteDialog"
    />

    <TreasuryModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :treasury="selectedTreasury"
      @close="isModalOpen = false"
      @saved="fetchData"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف الخزينة"
      :message="`هل أنت متأكد من رغبتك في حذف '${treasuryToDelete?.name}'؟`"
      @confirmed="deleteSelectedTreasury"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import TreasuriesTable from './TreasuriesTable.vue'
import TreasuryModal from './TreasuryModal.vue'

const treasuryStore = useTreasuryStore()
const authStore = useAuthStore()
const { treasuries, loading } = storeToRefs(treasuryStore)
const toast = useToast()

const fetchData = async () => {
  try {
    // جلب الخزائن بدون ترقيم صفحات (Pagination) لعرضها كاملة
    await treasuryStore.fetchTreasuries(1, '', { paginate: false })
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات الخزائن.')
  }
}

onMounted(() => {
  fetchData()
})

const isModalOpen = ref(false)
const selectedTreasury = ref(null)

const openModal = (treasury = null) => {
  if (treasury && !authStore.can('treasury.update')) {
    toast.error('ليس لديك الصلاحية لتعديل بيانات الخزينة.')
    return
  }
  selectedTreasury.value = treasury ? { ...treasury } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const treasuryToDelete = ref(null)

const openDeleteDialog = (treasury) => {
  if (!authStore.can('treasury.delete')) {
    toast.error('ليس لديك الصلاحية لحذف الخزائن.')
    return
  }
  treasuryToDelete.value = treasury
  isDeleteDialogOpen.value = true
}

const deleteSelectedTreasury = async () => {
  try {
    await treasuryStore.deleteTreasury(treasuryToDelete.value.id)
    toast.success('تم حذف الخزينة بنجاح.')
    fetchData()
  } catch (error) {
    toast.error(treasuryStore.error || 'فشل حذف الخزينة.')
  } finally {
    isDeleteDialogOpen.value = false
  }
}
</script>
