<template>
  <div class="space-y-6 print:hidden">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section/60 p-5 rounded-xl border border-surface-border shadow-lg"
    >
      <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
        <span class="p-2 bg-primary/20 rounded-lg">📊</span>
        كشف حساب تفصيلي - مالك آليات
      </h1>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div v-if="!authStore.hasRole('Machinery Owner')" class="w-full md:w-64">
          <MachineryOwnersDropdown
            id="owner-report-filter"
            v-model="selectedOwnerId"
            label="اختر صاحب الآلية"
          />
        </div>
        <div v-else class="bg-surface-ground/40 p-2.5 px-4 rounded-lg border border-primary/20">
          <span class="text-[10px] text-gray-500 block uppercase font-bold">حساب المالك:</span>
          <span class="text-white font-bold">{{ authStore.user?.full_name }}</span>
        </div>

        <AppButton
          @click="loadStatement"
          :disabled="!selectedOwnerId || loading"
          class="bg-primary hover:bg-primary-dark text-white px-6 shadow-lg shadow-primary/20"
        >
          <span v-if="loading">⏳ جاري المعالجة...</span>
          <span v-else>🔄 عرض البيانات</span>
        </AppButton>

        <AppButton
          v-if="machineryOwnerStatement"
          @click="handlePrint"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20"
        >
          <PrinterIcon class="w-5 h-5 ml-2 inline-block" />
          طباعة الكشف
        </AppButton>
      </div>
    </div>

    <div
      v-if="error"
      class="bg-rose-900/30 text-rose-400 p-4 rounded-lg text-center border border-rose-700/50 font-bold"
    >
      ⚠️ {{ error }}
    </div>

    <template v-if="machineryOwnerStatement">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-sky-400 bg-surface-section/60 shadow-xl"
        >
          <div class="text-[10px] text-sky-200/60 uppercase tracking-widest mb-2 font-black">
            إجمالي المستحقات (قيمة العمل)
          </div>
          <div class="text-3xl font-black text-sky-400 tracking-tighter">
            {{ formatCurrency(machineryOwnerStatement.summary.total_earnings) }}
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-emerald-400 bg-surface-section/60 shadow-xl"
        >
          <div class="text-[10px] text-emerald-200/60 uppercase tracking-widest mb-2 font-black">
            إجمالي المسحوبات (المدفوع له)
          </div>
          <div class="text-3xl font-black text-emerald-400 tracking-tighter">
            {{ formatCurrency(machineryOwnerStatement.summary.total_paid) }}
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-rose-400 bg-surface-section/60 shadow-xl"
        >
          <div class="text-[10px] text-rose-200/60 uppercase tracking-widest mb-2 font-black">
            صافي الرصيد (المتبقي له طرفنا)
          </div>
          <div
            class="text-3xl font-black drop-shadow-md"
            :class="
              machineryOwnerStatement.summary.net_balance > 0 ? 'text-rose-400' : 'text-gray-400'
            "
          >
            {{ formatCurrency(machineryOwnerStatement.summary.net_balance) }}
          </div>
        </AppCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AppCard class="border border-gray-800 bg-surface-section/40 overflow-hidden">
          <div class="p-4 border-b border-gray-800 flex justify-between items-center bg-sky-900/10">
            <h3 class="font-black text-sky-400 flex items-center gap-2 text-sm uppercase">
              🚛 سجل حركات الآليات (تفصيلي)
            </h3>
          </div>
          <AppTable
            :headers="workHeaders"
            :items="machineryOwnerStatement.details.work_history"
            :is-loading="loading"
          >
            <template #cell-date="{ item }">
              <span class="text-[10px] text-gray-400 font-mono">{{ formatDate(item.date) }}</span>
            </template>
            <template #cell-machinery="{ item }">
              <span class="font-bold text-white text-xs">{{ item.machinery }}</span>
            </template>
            <template #cell-description="{ item }">
              <span class="text-[10px] text-gray-400 italic">{{ item.description }}</span>
            </template>
            <template #cell-earnings="{ item }">
              <span class="text-sky-300 font-black tracking-tight">
                {{ formatCurrency(item.earnings) }}
              </span>
            </template>
          </AppTable>
        </AppCard>

        <AppCard class="border border-gray-800 bg-surface-section/40 overflow-hidden">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-emerald-900/10"
          >
            <h3 class="font-black text-emerald-400 flex items-center gap-2 text-sm uppercase">
              💸 سجل المدفوعات والمسحوبات
            </h3>
          </div>
          <AppTable
            :headers="transactionHeaders"
            :items="machineryOwnerStatement.details.financial_history"
            :is-loading="loading"
          >
            <template #cell-date="{ item }">
              <span class="text-[10px] text-gray-400 font-mono">{{ formatDate(item.date) }}</span>
            </template>
            <template #cell-amount="{ item }">
              <span
                class="text-emerald-400 font-black tracking-tight"
                :class="item.type === 'receipt' ? 'text-teal-400' : 'text-emerald-400'"
              >
                {{ item.type === 'receipt' ? '+' : '' }}{{ formatCurrency(item.amount) }}
              </span>
            </template>
            <template #cell-type="{ item }">
              <span
                class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
                :class="
                  item.type === 'payment'
                    ? 'bg-rose-900/20 text-rose-400 border border-rose-800'
                    : 'bg-teal-900/20 text-teal-400 border border-teal-800'
                "
              >
                {{ item.type === 'payment' ? 'صرف' : 'قبض' }}
              </span>
            </template>
          </AppTable>
        </AppCard>
      </div>
    </template>

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-24 opacity-30">
      <div class="text-6xl mb-4">🔍</div>
      <p class="text-white font-bold tracking-widest">اختر مالكاً لعرض كشف الحساب</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { useMachineryOwnerStore } from '@/stores/machineryOwnerStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { PrinterIcon } from '@heroicons/vue/24/outline'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import MachineryOwnersDropdown from '@/components/forms/MachineryOwnersDropdown.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const reportStore = useReportStore()
const machineryOwnerStore = useMachineryOwnerStore()

const { machineryOwnerStatement, loading, error } = storeToRefs(reportStore)
const selectedOwnerId = ref('')

// رؤوس جداول العمل (Trip based)
const workHeaders = [
  { key: 'date', label: 'التاريخ' },
  { key: 'machinery', label: 'الآلية' },
  { key: 'description', label: 'البيان' },
  { key: 'earnings', label: 'الاستحقاق (د.ل)' },
]

// رؤوس جداول المالية
const transactionHeaders = [
  { key: 'date', label: 'التاريخ' },
  { key: 'description', label: 'البيان' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'type', label: 'النوع' },
]

const loadStatement = () => {
  if (selectedOwnerId.value) {
    reportStore.fetchMachineryOwnerStatement(selectedOwnerId.value)
  }
}

const handlePrint = () => {
  if (!machineryOwnerStatement.value) return
  // تخزين البيانات للطباعة
  sessionStorage.setItem('printOwnerStatementData', JSON.stringify(machineryOwnerStatement.value))
  const routeData = router.resolve({ name: 'PrintMachineryOwnerStatement' })
  window.open(routeData.href, '_blank')
}

onMounted(async () => {
  // التحقق من الهوية والتحميل التلقائي
  if (route.params.id) {
    selectedOwnerId.value = route.params.id
    loadStatement()
  } else if (authStore.hasRole('Machinery Owner')) {
    const ownerId = authStore.user?.machinery_owner?.id
    if (ownerId) {
      selectedOwnerId.value = ownerId
      loadStatement()
    }
  }

  if (!authStore.hasRole('Machinery Owner')) {
    await machineryOwnerStore.fetchMachineryOwners(1, '', { limit: 1000 })
  }
})
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-500 font-black uppercase tracking-tighter text-[10px] border-b border-gray-800 bg-surface-ground/30;
}
:deep(.AppTable td) {
  @apply py-2 border-b border-gray-800/30;
}
</style>
