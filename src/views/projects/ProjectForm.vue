<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="project-name"
            label="اسم المشروع"
            v-model="form.name"
            placeholder="أدخل اسم المشروع..."
            required
          />
          <p v-if="serverErrors?.name" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.name[0] }}
          </p>
        </div>

        <div>
          <AppDropdown
            id="project-status"
            label="حالة المشروع"
            v-model="form.status"
            :options="statusOptions"
            placeholder="اختر حالة المشروع"
            required
          />
          <p v-if="serverErrors?.status" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.status[0] }}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <AppInput
            id="project-start-date"
            label="تاريخ البداية (اختياري)"
            v-model="form.start_date"
            type="date"
          />
          <p v-if="serverErrors?.start_date" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.start_date[0] }}
          </p>
        </div>

        <div>
          <AppInput
            id="project-end-date"
            label="تاريخ النهاية المتوقع (اختياري)"
            v-model="form.end_date"
            type="date"
          />
          <p v-if="serverErrors?.end_date" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.end_date[0] }}
          </p>
        </div>
      </div>

      <div>
        <AppTextarea
          id="project-description"
          label="وصف / موقع المشروع (اختياري)"
          v-model="form.description"
          placeholder="أدخل تفاصيل إضافية أو موقع المشروع..."
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
        <span v-else>حفظ المشروع</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: { type: Object, default: null },
  isSaving: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const statusOptions = [
  { id: 'active', name: 'نشط (قيد التنفيذ)' },
  { id: 'on_hold', name: 'متوقف مؤقتاً' },
  { id: 'completed', name: 'مكتمل' },
]

const createFreshForm = () => ({
  id: null,
  name: '',
  status: 'active', // افتراضي
  start_date: '',
  end_date: '',
  description: '',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name,
        status: newData.status || 'active',
        // تنسيق التواريخ لتناسب حقل الـ date
        start_date: newData.start_date
          ? new Date(newData.start_date).toISOString().split('T')[0]
          : '',
        end_date: newData.end_date ? new Date(newData.end_date).toISOString().split('T')[0] : '',
        description: newData.description || '',
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
