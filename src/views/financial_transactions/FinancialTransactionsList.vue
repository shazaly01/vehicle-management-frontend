<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">المعاملات المالية (القبض والصرف)</h1>
      <AppButton v-if="authStore.can('financial_transaction.create')" @click="openModal()">
        إضافة معاملة جديدة
      </AppButton>
    </div>

    <FinancialTransactionsFilter
      v-model:searchQuery="searchQuery"
      v-model:type="typeFilter"
      v-model:treasuryId="treasuryIdFilter"
      @filter-changed="onFilterChanged"
    />

    <FinancialTransactionsTable
      :transactions="transactions"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-transaction="openModal"
      @delete-transaction="openDeleteDialog"
      @print-transaction="handlePrintTransaction"
    />

    <FinancialTransactionModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :transaction="selectedTransaction"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف المعاملة المالية"
      :message="`هل أنت متأكد من رغبتك في حذف المعاملة رقم '${transactionToDelete?.transaction_no}'؟ سيؤثر هذا على رصيد الخزينة.`"
      @confirmed="deleteSelectedTransaction"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFinancialTransactionStore } from '@/stores/financialTransactionStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
// استيراد المكونات
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import FinancialTransactionsFilter from './FinancialTransactionsFilter.vue'
import FinancialTransactionsTable from './FinancialTransactionsTable.vue'
import FinancialTransactionModal from './FinancialTransactionModal.vue'

// إدارة الحالة
const transactionStore = useFinancialTransactionStore()
const authStore = useAuthStore()
const { transactions, loading, pagination } = storeToRefs(transactionStore)
const toast = useToast()

// فلاتر البحث
const searchQuery = ref('')
const typeFilter = ref('')
const treasuryIdFilter = ref('')
let searchTimeout = null
const router = useRouter()

// معالجة تغييرات الفلتر مع Debounce
const onFilterChanged = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // إعادة التوجيه للصفحة الأولى عند الفلترة
  }, 500)
}

// دالة جلب البيانات
const handlePageChange = async (page = 1) => {
  const filters = {
    type: typeFilter.value,
    treasury_id: treasuryIdFilter.value,
  }

  try {
    // نمرر الـ page، ثم الـ search، ثم الـ filters بناءً على تصميم الـ Store
    await transactionStore.fetchTransactions(page, searchQuery.value, filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب المعاملات المالية.')
  }
}

onMounted(() => {
  handlePageChange()
})

// دوال فتح النوافذ
const isModalOpen = ref(false)
const selectedTransaction = ref(null)

const openModal = (transaction = null) => {
  if (transaction && !authStore.can('financial_transaction.update')) {
    toast.error('ليس لديك الصلاحية لتعديل هذه المعاملة.')
    return
  }
  selectedTransaction.value = transaction ? { ...transaction } : null
  isModalOpen.value = true
}

const isDeleteDialogOpen = ref(false)
const transactionToDelete = ref(null)

const openDeleteDialog = (transaction) => {
  if (!authStore.can('financial_transaction.delete')) {
    toast.error('ليس لديك الصلاحية لحذف هذه المعاملة.')
    return
  }
  transactionToDelete.value = transaction
  isDeleteDialogOpen.value = true
}

// دالة تأكيد الحذف
const deleteSelectedTransaction = async () => {
  if (transactionToDelete.value) {
    try {
      await transactionStore.deleteTransaction(transactionToDelete.value.id)
      toast.success(`تم حذف المعاملة رقم '${transactionToDelete.value.transaction_no}' بنجاح.`)

      if (transactions.value.length === 1 && pagination.value.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value.current_page)
      }
    } catch (error) {
      const errorMessage =
        transactionStore.error || error.response?.data?.message || 'فشل حذف المعاملة.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      transactionToDelete.value = null
    }
  }
}

// دالة معالجة الطباعة
const handlePrintTransaction = (transaction) => {
  if (!transaction || !transaction.id) {
    toast.error('بيانات المعاملة غير صالحة للطباعة.')
    return
  }

  // توليد مسار صفحة طباعة السند وفتحه في تبويب جديد
  const routeData = router.resolve({
    name: 'PrintFinancialTransaction',
    params: { id: transaction.id },
  })

  window.open(routeData.href, '_blank')
}
</script>
