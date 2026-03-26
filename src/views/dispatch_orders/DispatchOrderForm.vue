<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div
      class="bg-gray-800/40 p-4 rounded-xl border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <ProjectsDropdown label="المشروع" v-model="form.project_id" required />
      <SuppliersDropdown label="المورد" v-model="form.supplier_id" />
      <AppInput
        label="نوع العملية"
        v-model="form.operation_type"
        placeholder="نقل رمل..."
        required
      />
    </div>

    <DispatchOrderTrips v-model="form.trips" />

    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-5 bg-indigo-900/10 p-5 rounded-xl border border-indigo-500/20"
    >
      <AppInput
        label="الكمية الإجمالية (للمورد)"
        v-model="form.target_quantity"
        type="number"
        required
      />
      <AppCurrencyInput label="سعر المادة (للمورد)" v-model="form.material_unit_price" />
      <div class="bg-gray-900/40 p-3 rounded-lg flex flex-col justify-center">
        <span class="text-gray-400 text-xs font-bold">إجمالي مستحق المورد</span>
        <span class="text-xl font-black text-green-500"
          >{{ calculatedTotalSupplierCost }} دينار</span
        >
      </div>
    </div>

    <div class="flex justify-between items-center pt-6 border-t border-gray-700">
      <div class="w-48">
        <AppDropdown label="حالة الإذن" v-model="form.status" :options="statusOptions" required />
      </div>
      <div class="flex gap-3">
        <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
        <AppButton type="submit" :disabled="isSaving" class="px-10">
          {{ isSaving ? '⏳ جاري الحفظ...' : '💾 حفظ الكل' }}
        </AppButton>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ProjectsDropdown from '@/components/forms/ProjectsDropdown.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'

// استيراد المكون الجديد
import DispatchOrderTrips from './DispatchOrderTrips.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
  project_id: '',
  supplier_id: '',
  operation_type: '',
  target_quantity: 1,
  material_unit_price: 0,
  status: 'active',
  trips: [],
})

const calculatedTotalSupplierCost = computed(() => {
  return (
    Number(form.value.target_quantity) * Number(form.value.material_unit_price)
  ).toLocaleString()
})

const statusOptions = [
  { id: 'active', name: 'نشط' },
  { id: 'completed', name: 'مكتمل' },
]

const handleSubmit = () => emit('submit', form.value)
const handleCancel = () => emit('cancel')
const createFreshForm = () => ({
  id: null,
  project_id: '',
  supplier_id: '',
  operation_type: '',
  target_quantity: 1,
  material_unit_price: 0,
  status: 'active',
  trips: [],
})

watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.id) {
      form.value = {
        id: newData.id,
        project_id: newData.project_id || newData.project?.id || '',
        supplier_id: newData.supplier_id || newData.supplier?.id || '',
        operation_type: newData.operation_type || '',
        target_quantity: newData.target_quantity || 1,
        material_unit_price: newData.material_unit_price || 0,
        status: newData.status || 'active',

        trips: newData.trips
          ? newData.trips.map((trip) => ({
              id: trip.id,
              machinery_id: trip.machinery_id,
              transport_unit_price: trip.transport_unit_price || 0,
              quantity: trip.quantity || 1,
              status: trip.status || 'dispatched',
              cost_type_label: trip.cost_type_label || trip.machinery?.cost_type_label || '',
            }))
          : [],
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)
</script>
