<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="plate-number"
            label="رقم اللوحة / اسم الآلية"
            v-model="form.plate_number_or_name"
            placeholder="مثال: شاحنة مرسيدس 1234"
            required
          />
          <p v-if="serverErrors?.plate_number_or_name" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.plate_number_or_name[0] }}
          </p>
        </div>

        <div>
          <MachineryOwnersDropdown
            id="machinery-owner-id"
            label="صاحب الآلية"
            v-model="form.owner_id"
            required
          />
          <p v-if="serverErrors?.owner_id" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.owner_id[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="machinery-type"
            label="النوع / الموديل"
            v-model="form.type"
            placeholder="مثال: قلاب، حفارة، لودر..."
            required
          />
          <p v-if="serverErrors?.type" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.type[0] }}
          </p>
        </div>

        <div>
          <AppDropdown
            id="machinery-status"
            label="حالة الآلية"
            v-model="form.status"
            :options="statusOptions"
            placeholder="اختر الحالة"
            required
          />
          <p v-if="serverErrors?.status" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.status[0] }}
          </p>
        </div>

        <div>
          <AppDropdown
            id="cost-type"
            label="نوع التكلفة"
            v-model="form.cost_type"
            :options="costTypeOptions"
            placeholder="اختر نوع التكلفة"
            required
          />
          <p v-if="serverErrors?.cost_type" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.cost_type[0] }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الآلية</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MachineryOwnersDropdown from '@/components/forms/MachineryOwnersDropdown.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const statusOptions = [
  { id: 'available', name: 'متاحة للعمل' },
  { id: 'busy', name: 'مشغولة' },
  { id: 'maintenance', name: 'في الصيانة' },
  { id: 'out_of_service', name: 'خارج الخدمة' },
]

const costTypeOptions = [
  { id: 'trip', name: 'بالنقلة (Trip)' },
  { id: 'weight', name: 'بالوزن (Weight)' },
  { id: 'hour', name: 'بالساعة (Hour)' },
  { id: 'day', name: 'باليومية (Day)' },
]

const createFreshForm = () => ({
  id: null,
  plate_number_or_name: '',
  type: '',
  owner_id: '',
  status: 'available', // القيمة الافتراضية عند الإضافة
  cost_type: 'trip',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        plate_number_or_name: newData.plate_number_or_name,
        type: newData.type || '',
        owner_id: newData.owner_id || newData.machinery_owner?.id || '',
        status: newData.status || 'available',
        cost_type: newData.cost_type || 'trip',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
