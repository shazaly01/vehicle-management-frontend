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
            required
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
            placeholder="0.00"
          />
          <p v-if="serverErrors?.opening_balance" class="text-rose-500 text-xs mt-1 font-bold">
            {{ serverErrors.opening_balance[0] }}
          </p>
        </div>
      </div>

      <hr class="border-surface-border my-6" />

      <div class="bg-surface-section/40 p-4 rounded-xl border border-surface-border/50">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
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
              <h3 class="text-white font-bold text-sm">حساب الدخول للمورد</h3>
              <p class="text-xs text-gray-400">
                تفعيل هذا الخيار يسمح للمورد بالدخول لتأكيد التحميل ورؤية كشف حسابه
              </p>
            </div>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.create_account" class="sr-only peer" />
            <div
              class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"
            ></div>
          </label>
        </div>

        <div
          v-if="form.create_account"
          class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-fade-in"
        >
          <div>
            <AppInput
              id="supplier-username"
              label="اسم المستخدم (Username)"
              v-model="form.username"
              placeholder="مثال: supplier_1"
              required
            />
            <p v-if="serverErrors?.username" class="text-rose-500 text-xs mt-1 font-bold">
              {{ serverErrors.username[0] }}
            </p>
          </div>
          <div>
            <AppInput
              id="supplier-password"
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

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>{{ form.id ? 'تحديث المورد' : 'حفظ المورد' }}</span>
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
  phone: '',
  opening_balance: 0,
  create_account: false, // الحقل الجديد
  username: '', // الحقل الجديد
  password: '', // الحقل الجديد
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
        // التحقق مما إذا كان للمورد مستخدم مرتبط
        create_account: !!newData.user_id,
        username: newData.user?.username || '',
        password: '', // دائماً فارغة في التعديل
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
