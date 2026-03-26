<template>
  <div class="space-y-6 print:hidden">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section/60 p-5 rounded-xl border border-surface-border shadow-lg backdrop-blur-md"
    >
      <div>
        <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-3">
          <span class="p-2 bg-amber-500/20 rounded-lg text-xl">🏬</span>
          كشف حساب مورد مواد
        </h1>
        <p class="text-gray-500 text-[10px] font-bold mt-1 uppercase tracking-wider">
          Material Supplier Detailed Statement
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div class="w-full md:w-80 text-right">
          <SuppliersDropdown
            id="supplier-report-filter"
            v-model="selectedSupplierId"
            label="اختر المورد (المحجر / المصنع)"
          />
        </div>

        <AppButton
          @click="loadStatement"
          :disabled="!selectedSupplierId || loading"
          class="bg-amber-600 hover:bg-amber-500 text-white px-6 h-[42px] shadow-lg shadow-amber-900/20 transition-all active:scale-95"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            جاري الجلب...
          </span>
          <span v-else>عرض الكشف</span>
        </AppButton>

        <AppButton
          v-if="supplierStatement"
          @click="handlePrint"
          class="bg-indigo-600 hover:bg-indigo-500 text-white h-[42px] px-6"
        >
          <PrinterIcon class="w-5 h-5 ml-2 inline-block" />
          طباعة
        </AppButton>
      </div>
    </div>

    <div
      v-if="error"
      class="bg-rose-900/30 text-rose-400 p-4 rounded-xl text-center border border-rose-700/50 font-bold animate-bounce"
    >
      ⚠️ {{ error }}
    </div>

    <template v-if="supplierStatement && supplierStatement.details">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-amber-500 bg-surface-section/60 shadow-xl"
        >
          <div class="text-[10px] text-amber-200/60 uppercase tracking-widest mb-1 font-black">
            إجمالي قيمة التوريدات (له)
          </div>
          <div class="text-2xl font-black text-amber-400">
            {{ formatCurrency(supplierStatement.summary.total_supplied_value) }}
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-emerald-500 bg-surface-section/60 shadow-xl"
        >
          <div class="text-[10px] text-emerald-200/60 uppercase tracking-widest mb-1 font-black">
            إجمالي السدادات (التي استلمها)
          </div>
          <div class="text-2xl font-black text-emerald-400">
            {{ formatCurrency(supplierStatement.summary.total_paid_to_supplier) }}
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-rose-500 bg-surface-section/60 shadow-xl"
        >
          <div class="text-[10px] text-rose-200/60 uppercase tracking-widest mb-1 font-black">
            الرصيد الصافي المتبقي له
          </div>
          <div
            class="text-2xl font-black"
            :class="
              supplierStatement.summary.current_balance > 0 ? 'text-rose-400' : 'text-gray-400'
            "
          >
            {{ formatCurrency(supplierStatement.summary.current_balance) }}
          </div>
        </AppCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AppCard class="border border-gray-800 bg-surface-section/40 overflow-hidden shadow-2xl">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-amber-900/10"
          >
            <h3 class="font-black text-amber-400 flex items-center gap-2 text-sm uppercase">
              📦 سجل توريد المواد (الفواتير)
            </h3>
          </div>
          <AppTable
            :headers="supplyHeaders"
            :items="supplierStatement.details.material_supplies"
            :is-loading="loading"
          >
            <template #cell-date="{ item }">
              <span class="text-[10px] text-gray-400 font-mono">{{ formatDate(item.date) }}</span>
            </template>
            <template #cell-order_no="{ item }">
              <span class="text-white font-bold">#{{ item.order_no }}</span>
            </template>
            <template #cell-total_price="{ item }">
              <span class="text-amber-300 font-black">
                {{ formatCurrency(item.total_price) }}
              </span>
            </template>
          </AppTable>
        </AppCard>

        <AppCard class="border border-gray-800 bg-surface-section/40 overflow-hidden shadow-2xl">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-emerald-900/10"
          >
            <h3 class="font-black text-emerald-400 flex items-center gap-2 text-sm uppercase">
              💸 سجل السندات المالية والدفعات
            </h3>
          </div>
          <AppTable
            :headers="transactionHeaders"
            :items="supplierStatement.details.financial_transactions"
            :is-loading="loading"
          >
            <template #cell-date="{ item }">
              <span class="text-[10px] text-gray-400 font-mono">{{ formatDate(item.date) }}</span>
            </template>
            <template #cell-amount="{ item }">
              <span
                class="font-black"
                :class="item.type === 'payment' ? 'text-emerald-400' : 'text-teal-400'"
              >
                {{ item.type === 'receipt' ? '+' : '' }}{{ formatCurrency(item.amount) }}
              </span>
            </template>
            <template #cell-type="{ item }">
              <span
                class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border"
                :class="
                  item.type === 'payment'
                    ? 'bg-rose-900/20 text-rose-400 border-rose-800'
                    : 'bg-teal-900/20 text-teal-400 border-teal-800'
                "
              >
                {{ item.type === 'payment' ? 'صرف' : 'قبض' }}
              </span>
            </template>
          </AppTable>
        </AppCard>
      </div>
    </template>

    <div
      v-else-if="!loading"
      class="flex flex-col items-center justify-center py-32 bg-surface-section/20 rounded-3xl border-2 border-dashed border-gray-800"
    >
      <div class="text-8xl mb-6 grayscale opacity-20">🏢</div>
      <p class="text-gray-500 font-black tracking-[0.3em] text-lg uppercase">
        اختر مورداً لعرض كشف الحساب
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { PrinterIcon } from '@heroicons/vue/24/outline'

// استيراد مكونات النظام
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const reportStore = useReportStore()

// ربط الستور (تأكد أن الأسماء تطابق المتجر)
const { supplierStatement, loading, error } = storeToRefs(reportStore)

const selectedSupplierId = ref('')

// تعريف رؤوس الجداول (keys تطابق مخرجات الكنترولر المطور)
const supplyHeaders = [
  { key: 'date', label: 'التاريخ' },
  { key: 'order_no', label: 'رقم الإذن' },
  { key: 'project_name', label: 'المشروع' },
  { key: 'material_type', label: 'البيان/المادة' },
  { key: 'total_price', label: 'القيمة (د.ل)' },
]

const transactionHeaders = [
  { key: 'date', label: 'التاريخ' },
  { key: 'transaction_no', label: 'رقم السند' },
  { key: 'description', label: 'البيان' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'type', label: 'النوع' },
]

// دالة الجلب (مع تصفير البيانات القديمة لضمان التحديث)
const loadStatement = async () => {
  if (selectedSupplierId.value) {
    await reportStore.fetchSupplierStatement(selectedSupplierId.value)
  }
}

// مراقبة اختيار المورد (إذا تغير المورد، نصفر البيانات فوراً)
watch(selectedSupplierId, () => {
  reportStore.supplierStatement = null
  reportStore.error = null
})

// دالة الطباعة (تخزين في sessionStorage وفتح صفحة الطباعة)
const handlePrint = () => {
  if (!supplierStatement.value) return
  sessionStorage.setItem('printSupplierStatementData', JSON.stringify(supplierStatement.value))

  // تأكد أن المسار 'PrintSupplierStatement' مسجل في الراوتر
  const routeData = router.resolve({ name: 'PrintSupplierStatement' })
  window.open(routeData.href, '_blank')
}
</script>

<style scoped>
/* تنسيق الجداول لزيادة الكثافة والوضوح */
:deep(.AppTable th) {
  @apply text-gray-500 font-black uppercase tracking-tighter text-[10px] border-b border-gray-800 bg-surface-ground/20 py-3 px-4;
}
:deep(.AppTable td) {
  @apply py-2 px-4 border-b border-gray-800/30 text-xs;
}

/* تأثير التوهج للبطاقات */
.AppCard {
  @apply transition-all duration-300;
}
.AppCard:hover {
  @apply border-gray-700 shadow-amber-900/10;
}
</style>
