<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-black text-white tracking-tight text-emerald-500">
        مركز المراسلات (SMS)
      </h1>
    </div>

    <div class="bg-surface-section/60 p-6 rounded-xl border border-surface-border shadow-lg">
      <h2 class="text-lg font-bold mb-4 text-white flex items-center gap-2">
        <PaperAirplaneIcon class="w-5 h-5 text-primary" />
        إرسال رسالة مباشرة
      </h2>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-1">
          <label class="block text-sm font-medium text-gray-400 mb-1">فئة المستلم</label>
          <select
            v-model="formData.recipient_type"
            @change="formData.recipient_id = ''"
            class="w-full bg-surface-ground border border-surface-border text-white rounded-lg p-2.5 focus:ring-primary focus:border-primary transition-colors"
          >
            <option value="owner">الملاك</option>
            <option value="supplier">الموردين</option>
            <option value="driver">السائقين</option>
          </select>
        </div>

        <div class="space-y-1">
          <MachineryOwnersDropdown
            v-if="formData.recipient_type === 'owner'"
            v-model="formData.recipient_id"
            label="اختر صاحب الآلية"
          />
          <SuppliersDropdown
            v-if="formData.recipient_type === 'supplier'"
            v-model="formData.recipient_id"
            label="اختر المورد"
          />
          <DriversDropdown
            v-if="formData.recipient_type === 'driver'"
            v-model="formData.recipient_id"
            label="اختر السائق"
          />
        </div>

        <div class="lg:col-span-3">
          <label class="block text-sm font-medium text-gray-400 mb-1">نص الرسالة</label>
          <textarea
            v-model="formData.content"
            rows="3"
            class="block w-full rounded-lg bg-surface-ground border border-surface-border text-white p-3 focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="اكتب رسالتك هنا..."
          ></textarea>

          <div class="flex justify-between items-center mt-2 text-xs">
            <div class="flex gap-3">
              <span :class="formData.content.length > 70 ? 'text-amber-400' : 'text-gray-500'">
                الحروف: {{ formData.content.length }}
              </span>
              <span class="text-gray-500">|</span>
              <span class="text-gray-500"
                >التكلفة المتوقعة: {{ Math.ceil(formData.content.length / 70) || 1 }} رسالة</span
              >
            </div>
            <span class="text-gray-600">(70 حرف للرسالة العربية الواحدة)</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end">
        <AppButton
          @click="handleSend"
          :disabled="isSending || !formData.recipient_id || !formData.content"
          class="bg-primary hover:bg-primary-dark text-white px-8"
        >
          <span v-if="isSending">جاري الإرسال...</span>
          <span v-else>إرسال الآن</span>
        </AppButton>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-white">سجل العمليات</h2>
        <button
          @click="messageStore.fetchMessages(1)"
          class="text-sm text-primary flex items-center gap-1 hover:text-primary-light"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          تحديث السجل
        </button>
      </div>

      <AppTable :headers="tableHeaders" :items="messages" :is-loading="loading">
        <template #cell-recipient_name="{ item }">
          <div class="flex flex-col">
            <span class="font-bold text-white">{{ item.recipient_name }}</span>
            <span
              class="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded w-fit mt-1 uppercase"
              >{{ item.recipient_type }}</span
            >
          </div>
        </template>

        <template #cell-status="{ item }">
          <div class="flex flex-col gap-1 items-center">
            <span
              class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              :class="{
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':
                  item.status === 'sent',
                'bg-amber-500/10 text-amber-400 border border-amber-500/20':
                  item.status === 'pending',
                'bg-rose-500/10 text-rose-400 border border-rose-500/20': item.status === 'failed',
              }"
            >
              {{
                item.status === 'sent'
                  ? 'تم الإرسال'
                  : item.status === 'pending'
                    ? 'بالانتظار'
                    : 'فشل'
              }}
            </span>
            <span
              v-if="item.status === 'failed'"
              class="text-[9px] text-rose-400 w-32 truncate"
              :title="item.error_log"
              >{{ item.error_log }}</span
            >
          </div>
        </template>

        <template #cell-actions="{ item }">
          <button
            v-if="item.status === 'failed'"
            @click="messageStore.resendMessage(item.id)"
            class="text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1"
          >
            <ArrowPathIcon class="w-3 h-3" /> إعادة إرسال
          </button>
        </template>
      </AppTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessageStore } from '@/stores/messageStore'
import { useToast } from 'vue-toastification'
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

// المكونات
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MachineryOwnersDropdown from '@/components/forms/MachineryOwnersDropdown.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'
import DriversDropdown from '@/components/forms/DriversDropdown.vue'

const messageStore = useMessageStore()
const { messages, loading } = storeToRefs(messageStore)
const toast = useToast()

const isSending = ref(false)
const formData = ref({
  recipient_type: 'owner', // القيمة الافتراضية
  recipient_id: '',
  content: '',
})

const tableHeaders = [
  { key: 'created_at', label: 'التاريخ' },
  { key: 'recipient_name', label: 'المستلم' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'content', label: 'نص الرسالة' },
  { key: 'status', label: 'الحالة', cellClass: 'text-center' },
  { key: 'sender', label: 'بواسطة' },
  { key: 'actions', label: 'إجراء' },
]

onMounted(() => {
  messageStore.fetchMessages(1)
})

const handleSend = async () => {
  isSending.value = true
  const success = await messageStore.sendMessage(formData.value)

  if (success) {
    toast.success('تمت جدولة إرسال الرسالة بنجاح')
    formData.value.content = ''
    formData.value.recipient_id = ''
  } else {
    toast.error(messageStore.error || 'حدث خطأ أثناء الإرسال')
  }
  isSending.value = false
}
</script>
