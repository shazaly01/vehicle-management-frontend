<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="transaction-no"
            label="رقم السند / المعاملة"
            v-model="form.transaction_no"
            placeholder="أدخل رقم المعاملة المرجعي..."
            dir="ltr"
            required
          />
          <p v-if="serverErrors?.transaction_no" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.transaction_no[0] }}
          </p>
        </div>

        <div>
          <AppInput
            id="transaction-date"
            label="تاريخ المعاملة"
            v-model="form.date"
            type="date"
            required
          />
          <p v-if="serverErrors?.date" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.date[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppDropdown
            id="transaction-type"
            label="نوع المعاملة"
            v-model="form.type"
            :options="transactionTypes"
            placeholder="اختر نوع المعاملة"
            required
          />
          <p v-if="serverErrors?.type" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.type[0] }}
          </p>
        </div>

        <div>
          <TreasuriesDropdown
            id="treasury-id"
            label="الخزينة (الصندوق)"
            v-model="form.treasury_id"
            required
          />
          <p v-if="serverErrors?.treasury_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.treasury_id[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-gray-700 pt-5 mt-5">
        <div>
          <AppCurrencyInput
            id="transaction-amount"
            label="المبلغ"
            v-model="form.amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
          <p v-if="serverErrors?.amount" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.amount[0] }}
          </p>
        </div>

        <div>
          <ProjectsDropdown
            id="project-id"
            label="المشروع المرتبط (اختياري)"
            v-model="form.project_id"
          />
          <p v-if="serverErrors?.project_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.project_id[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <SuppliersDropdown id="supplier-id" label="المورد (اختياري)" v-model="form.supplier_id" />
          <p v-if="serverErrors?.supplier_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.supplier_id[0] }}
          </p>
        </div>

        <div>
          <MachineryOwnersDropdown
            id="machinery-owner-id"
            label="صاحب الآلية (اختياري)"
            v-model="form.machinery_owner_id"
          />
          <p v-if="serverErrors?.machinery_owner_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.machinery_owner_id[0] }}
          </p>
        </div>
      </div>

      <div>
        <AppTextarea
          id="transaction-description"
          label="البيان / الوصف"
          v-model="form.description"
          placeholder="أدخل تفاصيل المعاملة، أو رقم إذن الخروج المرتبط..."
          rows="3"
        />
        <p v-if="serverErrors?.description" class="text-rose-500 text-xs mt-1 font-bold">
          {{ serverErrors.description[0] }}
        </p>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ المعاملة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

// استيراد القوائم المنسدلة
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import ProjectsDropdown from '@/components/forms/ProjectsDropdown.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'
import MachineryOwnersDropdown from '@/components/forms/MachineryOwnersDropdown.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const transactionTypes = [
  { id: 'payment', name: 'سند صرف (دفع)' },
  { id: 'receipt', name: 'سند قبض (استلام)' },
]

const createFreshForm = () => {
  // وضع تاريخ اليوم كقيمة افتراضية
  const today = new Date().toISOString().split('T')[0]
  return {
    id: null,
    transaction_no: '',
    date: today,
    type: 'payment',
    treasury_id: '',
    amount: '',
    project_id: '',
    supplier_id: '',
    machinery_owner_id: '',
    description: '',
  }
}

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      const formattedDate = newData.date
        ? new Date(newData.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      // إسناد مباشر وبسيط جداً، مع تحويل أي null إلى '' (نص فارغ)
      form.value = {
        id: newData.id,
        transaction_no: newData.transaction_no,
        date: formattedDate,
        type: newData.transaction_type || newData.type || 'payment',

        // استخدام ?? '' يضمن أنه إذا كان الحقل null، فسيأخذ '' لكي لا ينهار PrimeVue
        treasury_id: newData.treasury_id ?? '',
        amount: newData.amount,

        project_id: newData.project_id ?? '',
        supplier_id: newData.supplier_id ?? '',
        machinery_owner_id: newData.machinery_owner_id ?? '',

        description: newData.description || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // 1. تحضير كائن البيانات الأساسي
  const payload = {
    ...form.value,
    transaction_type: form.value.type, // تحويل type إلى transaction_type ليقبله Laravel
  }

  // 2. منطق الربط المتعدد (Polymorphic Mapping)
  // نتحقق من الحقل المختار ونحدد نوع الكيان (Model) المرتبط به
  if (form.value.supplier_id) {
    payload.related_entity_id = form.value.supplier_id
    payload.related_entity_type = 'App\\Models\\Supplier'
  } else if (form.value.machinery_owner_id) {
    payload.related_entity_id = form.value.machinery_owner_id
    payload.related_entity_type = 'App\\Models\\MachineryOwner'
  } else if (form.value.project_id) {
    payload.related_entity_id = form.value.project_id
    payload.related_entity_type = 'App\\Models\\Project'
  }

  // إرسال البيانات النهائية
  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
