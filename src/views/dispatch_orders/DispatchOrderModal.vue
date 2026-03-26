<template>
  <AppModal
    :is-open="isOpen"
    :title="isEditing ? 'تعديل إذن التشغيل' : 'إنشاء إذن تشغيل (أمر عمل) جديد'"
    max-width="max-w-5xl"
    @close="handleClose"
  >
    <DispatchOrderForm
      :initial-data="order"
      :is-saving="isSaving"
      :server-errors="serverErrors"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </AppModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useDispatchOrderStore } from '@/stores/dispatchOrderStore'
import AppModal from '@/components/ui/AppModal.vue'
import DispatchOrderForm from './DispatchOrderForm.vue'

// استقبال حالة النافذة (مفتوحة/مغلقة) والبيانات المبدئية من الشاشة الرئيسية (List)
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

// تهيئة الـ Store الخاص بأوامر التشغيل
const dispatchOrderStore = useDispatchOrderStore()
const isSaving = ref(false)
const serverErrors = ref({})

// معرفة ما إذا كنا في حالة تعديل أم إضافة بناءً على وجود معرف (id)
const isEditing = computed(() => !!props.order?.id)

// مراقبة فتح النافذة لتصفير الأخطاء القديمة
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      serverErrors.value = {}
    }
  },
)

// الدالة الأهم: معالجة الإرسال
const handleSubmit = async (formData) => {
  isSaving.value = true
  serverErrors.value = {}

  try {
    if (isEditing.value) {
      // إرسال طلب التعديل (PUT)
      await dispatchOrderStore.updateOrder(formData.id, formData)
    } else {
      // إرسال طلب الإضافة (POST)
      await dispatchOrderStore.createOrder(formData)
    }

    // إذا نجح الحفظ، نبلغ الشاشة الأب (List) لتحديث الجدول وإغلاق النافذة
    emit('saved')
    handleClose()
  } catch (error) {
    // التقاط الأخطاء القادمة من السيرفر (Laravel Validation) وتمريرها للفورم
    if (dispatchOrderStore.validationErrors) {
      serverErrors.value = dispatchOrderStore.validationErrors
    }
    console.error('Failed to save dispatch order:', error)
  } finally {
    isSaving.value = false
  }
}

// إغلاق النافذة
const handleClose = () => {
  emit('close')
}
</script>
