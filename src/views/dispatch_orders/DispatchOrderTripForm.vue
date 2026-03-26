<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-4">
      <h3 class="text-sm font-bold text-blue-800 mb-1">تسجيل حركة جديدة</h3>
      <p class="text-xs text-blue-600">
        سيقوم النظام تلقائياً بسحب "السائق الحالي" و "طريقة التسعير" الخاصة بالآلية المحددة للحفاظ
        على دقة السجلات.
      </p>
    </div>

    <div class="space-y-4">
      <div>
        <MachineriesDropdown
          id="machinery-id"
          label="الآلية (الشاحنة / المعدة)"
          v-model="form.machinery_id"
          required
        />
        <p v-if="serverErrors?.machinery_id" class="text-rose-500 text-xs mt-1 font-bold">
          {{ serverErrors.machinery_id[0] }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AppInput
            id="trip-quantity"
            label="الكمية / المدة المنفذة"
            v-model="form.quantity"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="مثال: 1 (لنقلة) أو 8 (لساعات العمل)"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            أدخل 1 إذا كان الحساب بالنقلة، أو عدد الساعات/الوزن حسب اتفاق الآلية.
          </p>
          <p v-if="serverErrors?.quantity" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.quantity[0] }}
          </p>
        </div>

        <div>
          <AppDropdown
            id="trip-status"
            label="حالة الحركة الأولية"
            v-model="form.status"
            :options="statusOptions"
            required
          />
          <p v-if="serverErrors?.status" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.status[0] }}
          </p>
        </div>
      </div>

      <div>
        <label for="trip-note" class="block text-sm font-medium text-gray-700 mb-1"
          >ملاحظات (اختياري)</label
        >
        <textarea
          id="trip-note"
          v-model="form.note"
          rows="2"
          class="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="أي ملاحظات حول هذه النقلة..."
        ></textarea>
        <p v-if="serverErrors?.note" class="text-rose-500 text-xs mt-1 font-bold">
          {{ serverErrors.note[0] }}
        </p>
      </div>
    </div>

    <div class="mt-6 flex justify-end space-x-3 space-x-reverse pt-4 border-t">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving" variant="primary">
        <span v-if="isSaving">⏳ جاري التسجيل...</span>
        <span v-else>🚚 تسجيل الحركة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MachineriesDropdown from '@/components/forms/MachineriesDropdown.vue'

const props = defineProps({
  // نستقبل رقم الأمر الرئيسي لنربط الحركة به
  dispatchOrderId: { type: [Number, String], required: true },
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const statusOptions = [
  { id: 'dispatched', name: 'تم التوجيه (في الطريق)' },
  { id: 'loaded', name: 'تم التحميل من المورد' },
  { id: 'delivered', name: 'تم الاستلام في المشروع' },
]

const createFreshForm = () => ({
  id: null,
  dispatch_order_id: props.dispatchOrderId, // يتم تعيينه من الـ Prop
  machinery_id: '',
  quantity: 1, // افتراضياً 1 (لنقلة واحدة)
  status: 'dispatched',
  note: '',
})

const form = ref(createFreshForm())

// مراقبة البيانات الأولية (في حال التعديل)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        dispatch_order_id: newData.dispatch_order_id || props.dispatchOrderId,
        machinery_id: newData.machinery_id || newData.machinery?.id || '',
        quantity: newData.quantity || 1,
        status: newData.status || 'dispatched',
        note: newData.note || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // التأكد من أن الـ Order ID موجود قبل الإرسال
  const payload = {
    ...form.value,
    dispatch_order_id: props.dispatchOrderId,
  }
  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
