<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'"
    @close="handleClose"
  >
    <SupplierForm
      :initial-data="supplier"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useSupplierStore } from '@/stores/supplierStore'
import AppModal from '@/components/ui/AppModal.vue'
import SupplierForm from './SupplierForm.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  // إذا كان null فهذا يعني إضافة جديد، وإذا كان كائناً فهذا يعني تعديل
  supplier: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const supplierStore = useSupplierStore()
const isSaving = ref(false)
const serverErrors = ref({})

// لتحديد هل نحن في حالة إضافة أم تعديل بناءً على وجود الـ ID
const isEditing = computed(() => !!props.supplier?.id)

// تصفير الأخطاء كلما فُتحت النافذة
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
      // إرسال طلب التعديل
      await supplierStore.updateSupplier(formData.id, formData)
    } else {
      // إرسال طلب الإضافة
      await supplierStore.createSupplier(formData)
    }

    // إشعار الأب (الـ List) بنجاح العملية لتحديث الجدول
    emit('saved')
    handleClose()
  } catch (error) {
    // التقاط أخطاء الـ Validation من لارافيل وتمريرها للـ Form
    if (supplierStore.validationErrors) {
      serverErrors.value = supplierStore.validationErrors
    }
    console.error('Failed to save supplier:', error)
  } finally {
    isSaving.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>
