<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-black text-white tracking-tight">تقرير ملخص الموردين</h1>
      <div class="flex gap-3">
        <AppButton
          @click="handlePrint"
          class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <PrinterIcon class="w-5 h-5 ml-2" />
          طباعة احترافية
        </AppButton>

        <AppButton
          @click="handleRefresh"
          :loading="loading"
          variant="secondary"
          class="border-gray-600 text-gray-200"
        >
          <ArrowPathIcon class="w-5 h-5 ml-2" :class="{ 'animate-spin': loading }" />
          تحديث
        </AppButton>
      </div>
    </div>

    <div
      v-if="error"
      class="bg-rose-900/30 text-rose-400 p-4 rounded-lg text-center border border-rose-700/50"
    >
      {{ error }}
    </div>

    <div v-if="suppliersSummary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-fuchsia-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-fuchsia-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي عدد الموردين
        </div>
        <div
          class="text-2xl font-black text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]"
        >
          {{ suppliersSummary.summary.total_suppliers }}
          <span class="text-sm font-normal">مورد</span>
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-rose-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-rose-200/60 uppercase tracking-widest mb-2 font-bold">
          إجمالي الديون المستحقة للموردين
        </div>
        <div class="text-2xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]">
          {{ formatCurrency(suppliersSummary.summary.total_balances_due) }}
        </div>
      </AppCard>

      <AppCard
        class="relative overflow-hidden p-5 border-r-4 border-r-cyan-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
      >
        <div class="text-xs text-cyan-200/60 uppercase tracking-widest mb-2 font-bold">
          متوسط رصيد المورد
        </div>
        <div class="text-2xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          {{
            formatCurrency(
              suppliersSummary.summary.total_balances_due /
                (suppliersSummary.summary.total_suppliers || 1),
            )
          }}
        </div>
      </AppCard>
    </div>

    <AppCard
      v-if="suppliersSummary"
      class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm"
    >
      <AppTable :headers="tableHeaders" :items="suppliersSummary.data" :is-loading="loading">
        <template #cell-name="{ item }">
          <span
            class="font-bold text-cyan-300 hover:text-cyan-100 cursor-pointer transition-all duration-300"
          >
            {{ item.name }}
          </span>
        </template>

        <template #cell-phone="{ item }">
          <span dir="ltr" class="text-gray-400 font-medium">{{ item.phone || '-' }}</span>
        </template>

        <template #cell-total_shipped_value="{ item }">
          <span class="text-gray-100 font-medium drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
            {{ formatCurrency(item.total_shipped_value) }}
          </span>
        </template>

        <template #cell-current_balance="{ item }">
          <span
            class="font-black drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]"
            :class="
              item.current_balance > 0
                ? 'text-emerald-400'
                : item.current_balance < 0
                  ? 'text-rose-400'
                  : 'text-gray-500'
            "
          >
            {{ formatCurrency(item.current_balance) }}
          </span>
        </template>
      </AppTable>
    </AppCard>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'
import { PrinterIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

// استيراد المكونات
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'

const router = useRouter()
const reportStore = useReportStore()
const { suppliersSummary, loading, error } = storeToRefs(reportStore)

const tableHeaders = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'اسم المورد' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'total_shipped_value', label: 'إجمالي حجم التوريدات' },
  { key: 'current_balance', label: 'الرصيد الحالي المستحق' },
]

const handleRefresh = () => {
  reportStore.fetchSuppliersSummary()
}

// دالة الطباعة (يجب تجهيز صفحة طباعة مشابهة لـ PrintSummary لاحقاً)
const handlePrint = () => {
  if (!suppliersSummary.value) return

  sessionStorage.setItem(
    'printSuppliersData',
    JSON.stringify({
      summary: suppliersSummary.value.summary,
      data: suppliersSummary.value.data,
    }),
  )

  // تأكد من إنشاء هذا المسار في الـ Router لصفحة الطباعة الخاصة بالموردين
  const routeData = router.resolve({ name: 'PrintSuppliersSummary' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  if (!suppliersSummary.value) {
    handleRefresh()
  }
})
</script>

<style scoped>
/* إضافة تأثير زجاجي خفيف وتحسين الوضوح للجدول */
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}

:deep(.AppTable td) {
  @apply py-4 border-b border-gray-800/50;
}
</style>
