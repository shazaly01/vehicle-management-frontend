<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="treasury-name"
          label="اسم الخزينة / الحساب البنكي"
          v-model="form.name"
          placeholder="مثال: الخزينة الرئيسية، حساب بنك كذا..."
          required
        />
        <p v-if="serverErrors?.name" class="text-rose-500 text-xs mt-1 font-bold">
          {{ serverErrors.name[0] }}
        </p>
      </div>

      <div>
        <AppCurrencyInput
          id="treasury-opening-balance"
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

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الخزينة</span>
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
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  name: '',
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
