<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="supplier-name"
          label="اسم المورد"
          v-model="form.name"
          placeholder="أدخل اسم المورد..."
          required
        />
        <p v-if="serverErrors?.name" class="text-rose-500 text-xs mt-1 font-bold">
          {{ serverErrors.name[0] }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="supplier-phone"
            label="رقم الهاتف"
            v-model="form.phone"
            placeholder="مثال: 0501234567"
          />
          <p v-if="serverErrors?.phone" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.phone[0] }}
          </p>
        </div>

        <div>
          <AppCurrencyInput
            id="supplier-opening-balance"
            label="الرصيد الافتتاحي"
            v-model="form.opening_balance"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
          <p v-if="serverErrors?.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.opening_balance[0] }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ المورد</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppCurrencyInput from '@/components/ui/AppCurrencyInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  // استقبلنا أخطاء السيرفر (Validation) من الـ Modal
  serverErrors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  name: '',
  phone: '',
  opening_balance: 0,
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
        phone: newData.phone || '',
        opening_balance: newData.opening_balance || 0,
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
