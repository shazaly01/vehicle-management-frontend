<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="order-no"
            label="رقم إذن الخروج (التشغيل)"
            v-model="form.order_no"
            placeholder="أدخل الرقم المرجعي..."
            dir="ltr"
            required
          />
          <p v-if="serverErrors?.order_no" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.order_no[0] }}
          </p>
        </div>

        <div>
          <ProjectsDropdown id="project-id" label="المشروع" v-model="form.project_id" required />
          <p v-if="serverErrors?.project_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.project_id[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <SuppliersDropdown
            id="supplier-id"
            label="المورد (جهة التوريد)"
            v-model="form.supplier_id"
            required
          />
          <p v-if="serverErrors?.supplier_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.supplier_id[0] }}
          </p>
        </div>

        <div>
          <MachineriesDropdown
            id="machinery-id"
            label="الآلية (الشاحنة/المعدة)"
            v-model="form.machinery_id"
            :available-only="!isEditing"
            required
          />
          <p v-if="serverErrors?.machinery_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.machinery_id[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <DriversDropdown id="driver-id" label="السائق" v-model="form.driver_id" required />
          <p v-if="serverErrors?.driver_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.driver_id[0] }}
          </p>
        </div>

        <div>
          <AppInput
            id="operation-type"
            label="نوع العملية"
            v-model="form.operation_type"
            placeholder="مثال: نقل رمل، حفريات..."
            required
          />
          <p v-if="serverErrors?.operation_type" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.operation_type[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-700 pt-5 mt-5">
        <div>
          <AppDropdown
            id="pricing-type"
            label="نوع الحساب"
            v-model="form.pricing_type"
            :options="pricingTypes"
            placeholder="اختر نوع الحساب"
            required
          />
          <p v-if="serverErrors?.pricing_type" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.pricing_type[0] }}
          </p>
        </div>

        <div>
          <AppInput
            id="quantity"
            label="الكمية / العدد"
            v-model="form.quantity"
            type="number"
            min="1"
            placeholder="1"
            required
          />
          <p v-if="serverErrors?.quantity" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.quantity[0] }}
          </p>
        </div>

        <div>
          <AppCurrencyInput
            id="unit-price"
            label="سعر الوحدة"
            v-model="form.unit_price"
            type="number"
            step="0.01"
            placeholder="0.00"
            required
          />
          <p v-if="serverErrors?.unit_price" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.unit_price[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 bg-gray-800 p-4 rounded-lg mt-5">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1"
            >إجمالي التكلفة (تلقائي)</label
          >
          <div class="text-2xl font-bold text-green-400">
            {{ calculatedTotalCost }}
          </div>
          <p v-if="serverErrors?.total_cost" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.total_cost[0] }}
          </p>
        </div>

        <div>
          <AppDropdown
            id="order-status"
            label="حالة الطلب"
            v-model="form.status"
            :options="statusOptions"
            placeholder="اختر الحالة"
            required
          />
          <p v-if="serverErrors?.status" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.status[0] }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ إذن التشغيل</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

// استيراد القوائم المنسدلة التي صممناها سابقاً
import ProjectsDropdown from '@/components/forms/ProjectsDropdown.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'
import MachineriesDropdown from '@/components/forms/MachineriesDropdown.vue'
import DriversDropdown from '@/components/forms/DriversDropdown.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const isEditing = computed(() => !!props.initialData?.id)

// الخيارات الثابتة للقوائم
const pricingTypes = [
  { id: 'trip', name: 'بالنقلة' },
  { id: 'day', name: 'باليومية' },
  { id: 'hour', name: 'بالساعة' },
  { id: 'weight', name: 'بالوزن' },
]

const statusOptions = [
  { id: 'pending', name: 'قيد الانتظار' },
  { id: 'active', name: 'قيد التنفيذ (نشط)' },
  { id: 'completed', name: 'مكتمل' },
  { id: 'cancelled', name: 'ملغي' },
]

const createFreshForm = () => ({
  id: null,
  order_no: '',
  project_id: '',
  supplier_id: '',
  machinery_id: '',
  driver_id: '',
  operation_type: '',
  pricing_type: 'trip', // قيمة افتراضية
  quantity: 1,
  unit_price: 0,
  status: 'pending', // قيمة افتراضية
})

const form = ref(createFreshForm())

// حساب الإجمالي تلقائياً بمجرد تغيير الكمية أو السعر
const calculatedTotalCost = computed(() => {
  const qty = Number(form.value.quantity) || 0
  const price = Number(form.value.unit_price) || 0
  const total = qty * price
  // تنسيق الرقم ليظهر كعملة
  return total.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        order_no: newData.order_no,
        project_id: newData.project_id || newData.project?.id || '',
        supplier_id: newData.supplier_id || newData.supplier?.id || '',
        machinery_id: newData.machinery_id || newData.machinery?.id || '',
        driver_id: newData.driver_id || newData.driver?.id || '',
        operation_type: newData.operation_type || '',
        pricing_type: newData.pricing_type || 'trip',
        quantity: newData.quantity || 1,
        unit_price: newData.unit_price || 0,
        status: newData.status || 'pending',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // نرسل الـ Form ونضيف التكلفة الإجمالية المحسوبة برمجياً لتخزينها في الداتا بيز
  const payload = {
    ...form.value,
    total_cost: (Number(form.value.quantity) || 0) * (Number(form.value.unit_price) || 0),
  }
  emit('submit', payload)
}

const handleCancel = () => {
  emit('cancel')
}
</script>
