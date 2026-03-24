<template>
  <div class="space-y-6 print:hidden">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section/60 p-5 rounded-xl border border-surface-border shadow-lg"
    >
      <h1 class="text-2xl font-black text-white tracking-tight">كشف حساب صاحب آلية</h1>

      <div class="flex flex-wrap items-end gap-3 w-full md:w-auto">
        <div class="flex flex-wrap items-end gap-3 w-full md:w-auto">
          <div v-if="!authStore.hasRole('Machinery Owner')" class="w-full md:w-64">
            <MachineryOwnersDropdown
              id="owner-report-filter"
              label="اختر صاحب الآلية"
              v-model="selectedOwnerId"
            />
          </div>

          <div v-else class="bg-surface-ground/40 p-2.5 px-4 rounded-lg border border-primary/20">
            <span class="text-xs text-gray-500 block mb-0.5">كشف حساب:</span>
            <span class="text-white font-bold">{{ authStore.user?.full_name }}</span>
          </div>

          <AppButton
            v-if="!authStore.hasRole('Machinery Owner')"
            @click="loadStatement"
            :disabled="!selectedOwnerId || loading"
            class="bg-primary hover:bg-primary-dark text-white px-6"
          >
            <span v-if="loading">جاري الجلب...</span>
            <span v-else>عرض الكشف</span>
          </AppButton>
        </div>

        <AppButton
          @click="loadStatement"
          :disabled="!selectedOwnerId || loading"
          class="bg-primary hover:bg-primary-dark text-white px-6"
        >
          <span v-if="loading">جاري الجلب...</span>
          <span v-else>عرض الكشف</span>
        </AppButton>

        <AppButton
          v-if="machineryOwnerStatement"
          @click="handlePrint"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <PrinterIcon class="w-5 h-5 ml-2 inline-block" />
          طباعة
        </AppButton>
      </div>
    </div>

    <div
      v-if="error"
      class="bg-rose-900/30 text-rose-400 p-4 rounded-lg text-center border border-rose-700/50"
    >
      {{ error }}
    </div>

    <template v-if="machineryOwnerStatement">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-sky-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
        >
          <div class="text-xs text-sky-200/60 uppercase tracking-widest mb-2 font-bold">
            إجمالي أرباح الآليات
          </div>
          <div class="text-2xl font-black text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
            {{ formatCurrency(machineryOwnerStatement.financial_summary.total_earnings) }}
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-emerald-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
        >
          <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
            إجمالي الدفعات المستلمة
          </div>
          <div
            class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          >
            {{ formatCurrency(machineryOwnerStatement.financial_summary.total_received) }}
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-rose-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
        >
          <div class="text-xs text-rose-200/60 uppercase tracking-widest mb-2 font-bold">
            الرصيد الصافي (المتبقي له)
          </div>
          <div
            class="text-2xl font-black drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]"
            :class="
              machineryOwnerStatement.financial_summary.net_balance > 0
                ? 'text-rose-400'
                : 'text-gray-400'
            "
          >
            {{ formatCurrency(machineryOwnerStatement.financial_summary.net_balance) }}
          </div>
        </AppCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AppCard class="border border-gray-800 bg-surface-section/40">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-surface-ground/50"
          >
            <h3 class="font-bold text-sky-400">تفاصيل أرباح الآليات (من أوامر التشغيل المكتملة)</h3>
          </div>
          <AppTable
            :headers="machineryHeaders"
            :items="machineryOwnerStatement.details.machineries_earnings"
            :is-loading="loading"
          >
            <template #cell-plate_number_or_name="{ item }">
              <span class="font-bold text-white">{{ item.plate_number_or_name }}</span>
            </template>
            <template #cell-total_earnings="{ item }">
              <span class="text-sky-300 font-bold drop-shadow-[0_0_5px_rgba(56,189,248,0.2)]">
                {{ formatCurrency(item.total_earnings) }}
              </span>
            </template>
          </AppTable>
        </AppCard>

        <AppCard class="border border-gray-800 bg-surface-section/40">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-surface-ground/50"
          >
            <h3 class="font-bold text-emerald-400">سجل الدفعات المستلمة (المعاملات المالية)</h3>
          </div>
          <AppTable
            :headers="transactionHeaders"
            :items="machineryOwnerStatement.details.financial_transactions"
            :is-loading="loading"
          >
            <template #cell-transaction_no="{ item }">
              <span class="font-mono text-gray-300">#{{ item.transaction_no }}</span>
            </template>
            <template #cell-transaction_type="{ item }">
              <span class="text-gray-400 text-sm">{{ item.transaction_type }}</span>
            </template>
            <template #cell-amount="{ item }">
              <span class="text-emerald-400 font-bold">{{ formatCurrency(item.amount) }}</span>
            </template>
            <template #cell-created_at="{ item }">
              <span class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</span>
            </template>
          </AppTable>
        </AppCard>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
// افتراض أن لديك store لأصحاب الآليات لملء القائمة المنسدلة
import { useMachineryOwnerStore } from '@/stores/machineryOwnerStore'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { PrinterIcon } from '@heroicons/vue/24/outline'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MachineryOwnersDropdown from '@/components/forms/MachineryOwnersDropdown.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const reportStore = useReportStore()
const machineryOwnerStore = useMachineryOwnerStore()

const { machineryOwnerStatement, loading, error } = storeToRefs(reportStore)
const { machineryOwners } = storeToRefs(machineryOwnerStore)

const selectedOwnerId = ref('')

// رؤوس الجداول
const machineryHeaders = [
  { key: 'plate_number_or_name', label: 'الآلية (اللوحة / الاسم)' },
  { key: 'total_earnings', label: 'إجمالي الأرباح المحققة' },
]

const transactionHeaders = [
  { key: 'transaction_no', label: 'رقم السند' },
  { key: 'transaction_type', label: 'نوع الدفعة' },
  { key: 'description', label: 'البيان' },
  { key: 'amount', label: 'المبلغ المستلم' },
  { key: 'created_at', label: 'التاريخ' },
]

const loadStatement = () => {
  if (selectedOwnerId.value) {
    reportStore.fetchMachineryOwnerStatement(selectedOwnerId.value)
  }
}

// دالة الطباعة المجهزة مسبقاً
const handlePrint = () => {
  if (!machineryOwnerStatement.value) return

  sessionStorage.setItem('printOwnerStatementData', JSON.stringify(machineryOwnerStatement.value))

  // سنقوم بإنشاء مسار PrintMachineryOwnerStatement لاحقاً
  const routeData = router.resolve({ name: 'PrintMachineryOwnerStatement' })
  window.open(routeData.href, '_blank')
}

onMounted(async () => {
  // الحالة أ: الدخول عبر رابط مباشر (للإدارة)
  if (route.params.id) {
    selectedOwnerId.value = route.params.id
    loadStatement()
  }
  // الحالة ب: الدخول كصاحب آلية (تلقائي)
  else if (authStore.hasRole('Machinery Owner')) {
    const ownerId = authStore.user?.machinery_owner?.id
    if (ownerId) {
      selectedOwnerId.value = ownerId
      loadStatement() // تحميل البيانات فوراً
    } else {
      console.error('خطأ: لم يتم العثور على ملف مالك مرتبط بهذا المستخدم')
    }
  }

  // جلب القائمة فقط إذا كان المستخدم إدارياً (لمنع الـ 403)
  if (!authStore.hasRole('Machinery Owner')) {
    await machineryOwnerStore.fetchMachineryOwners(1, '', { limit: 1000 })
  }
})
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}
:deep(.AppTable td) {
  @apply py-3 border-b border-gray-800/50;
}
</style>
