<template>
  <form @submit.prevent="handleSubmit">
    <div class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AppInput
            id="owner-name"
            label="اسم صاحب الآلية / الشركة"
            v-model="form.name"
            placeholder="أدخل اسم المالك..."
            required
          />
          <p v-if="serverErrors?.name" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.name[0] }}
          </p>
        </div>

        <div>
          <AppInput
            id="owner-phone"
            label="رقم الهاتف (سيكون كلمة السر الافتراضية)"
            v-model="form.phone"
            placeholder="مثال: 0912345678"
            dir="ltr"
            required
          />
          <p v-if="serverErrors?.phone" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.phone[0] }}
          </p>
        </div>
      </div>

      <hr class="border-surface-border my-6" />

      <div class="bg-surface-section/40 p-4 rounded-xl border border-surface-border/50">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h3 class="text-white font-bold text-sm">حساب الدخول للنظام</h3>
              <p class="text-xs text-gray-400">
                تفعيل هذا الخيار يسمح للمالك بالدخول لرؤية كشف حسابه
              </p>
            </div>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.create_account" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"
            ></div>
          </label>
        </div>

        <div
          v-if="form.create_account"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in"
        >
          <div>
            <AppInput
              id="owner-username"
              label="اسم المستخدم (Username)"
              v-model="form.username"
              placeholder="مثال: ahmed_2024"
              required
            />
            <p v-if="serverErrors?.username" class="text-rose-500 text-xs mt-1 font-bold">
              {{ serverErrors.username[0] }}
            </p>
          </div>
          <div>
            <AppInput
              id="owner-password"
              label="كلمة المرور (اختياري)"
              v-model="form.password"
              type="password"
              placeholder="اتركها فارغة لاستخدام الهاتف"
            />
            <p v-if="serverErrors?.password" class="text-rose-500 text-xs mt-1 font-bold">
              {{ serverErrors.password[0] }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end gap-3">
      <AppButton type="button" variant="secondary" @click="handleCancel" class="min-w-[100px]">
        إلغاء
      </AppButton>
      <AppButton type="submit" :disabled="isSaving" class="min-w-[150px]">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث البيانات' : 'حفظ المالك الجديد' }}</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
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
  phone: '',
  create_account: false, // الخيار الافتراضي: لا يوجد حساب
  username: '',
  password: '',
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
        // إذا كان لديه user_id، فهذا يعني أن لديه حساب مسبقاً
        create_account: !!newData.user_id,
        username: newData.user?.username || '',
        password: '', // لا نعرض كلمة السر القديمة لأسباب أمنية
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  // نرسل البيانات المصفاة للباك-إند
  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
