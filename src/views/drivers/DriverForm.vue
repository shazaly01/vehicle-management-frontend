<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div>
        <AppInput
          id="driver-name"
          label="اسم السائق"
          v-model="form.name"
          placeholder="أدخل الاسم الثلاثي للسائق..."
          required
        />
        <p v-if="serverErrors?.name" class="text-rose-500 text-xs mt-1 font-bold">
          {{ serverErrors.name[0] }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="driver-phone"
            label="رقم الجوال"
            v-model="form.phone"
            placeholder="مثال: 0599999999"
            dir="ltr"
          />
          <p v-if="serverErrors?.phone" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.phone[0] }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ بيانات السائق</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
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
  serverErrors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['submit', 'cancel'])

const createFreshForm = () => ({
  id: null,
  name: '',
  emp_code: '',
  phone: '',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
        emp_code: newData.emp_code,
        phone: newData.phone || '',
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
