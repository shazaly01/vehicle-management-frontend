<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل المعاملة المالية' : 'إضافة معاملة مالية جديدة'"
    @close="handleClose"
  >
    <FinancialTransactionForm
      :initial-data="transaction"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFinancialTransactionStore } from '@/stores/financialTransactionStore'
import AppModal from '@/components/ui/AppModal.vue'
import FinancialTransactionForm from './FinancialTransactionForm.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  transaction: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const transactionStore = useFinancialTransactionStore()
const isSaving = ref(false)
const serverErrors = ref({})

const isEditing = computed(() => !!props.transaction?.id)

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
      await transactionStore.updateTransaction(formData.id, formData)
    } else {
      await transactionStore.createTransaction(formData)
    }

    emit('saved')
    handleClose()
  } catch (error) {
    if (transactionStore.validationErrors) {
      serverErrors.value = transactionStore.validationErrors
    }
    console.error('Failed to save financial transaction:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
