<template>
  <div class="space-y-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-section/60 p-5 rounded-xl border border-surface-border shadow-lg"
    >
      <h1 class="text-2xl font-black text-white tracking-tight">كشف حساب مورد</h1>

      <div class="flex items-end gap-3 w-full md:w-auto">
        <div class="w-full md:w-80 text-right">
          <SuppliersDropdown
            id="supplier-report-filter"
            label="اختر المورد"
            v-model="selectedSupplierId"
          />
        </div>

        <AppButton
          @click="loadStatement"
          :disabled="!selectedSupplierId || loading"
          class="bg-primary hover:bg-primary-dark text-white px-6 h-[42px]"
        >
          <span v-if="loading">جاري الجلب...</span>
          <span v-else>عرض الكشف</span>
        </AppButton>

        <AppButton
          v-if="supplierStatement"
          @click="handlePrint"
          variant="secondary"
          class="h-[42px]"
        >
          طباعة الكشف
        </AppButton>
      </div>
    </div>

    <div
      v-if="error"
      class="bg-rose-900/30 text-rose-400 p-4 rounded-lg text-center border border-rose-700/50"
    >
      {{ error }}
    </div>

    <template v-if="supplierStatement">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppCard class="p-5 border-l-4 border-l-blue-500 bg-surface-section/60">
          <div class="text-xs text-blue-200/60 uppercase tracking-widest mb-1 font-bold">
            بيانات المورد
          </div>
          <div class="text-xl font-black text-blue-300">{{ supplierStatement.supplier.name }}</div>
          <div class="text-sm text-gray-400 mt-1">
            رقم المورد: {{ supplierStatement.supplier.id }}
          </div>
        </AppCard>

        <AppCard class="p-5 border-l-4 border-l-emerald-500 bg-surface-section/60">
          <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-1 font-bold">
            الرصيد الحالي المستحق للمورد
          </div>
          <div
            class="text-2xl font-black text-emerald-400"
            :class="supplierStatement.supplier.current_balance < 0 ? 'text-rose-400' : ''"
          >
            {{ formatCurrency(supplierStatement.supplier.current_balance) }}
          </div>
        </AppCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AppCard class="border border-gray-800 bg-surface-section/40">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-surface-ground/50"
          >
            <h3 class="font-bold text-sky-400 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
              التوريدات (أوامر التشغيل)
            </h3>
          </div>
          <AppTable
            :headers="dispatchHeaders"
            :items="supplierStatement.statement.dispatch_orders"
            :is-loading="loading"
          >
            <template #cell-order_no="{ item }">
              <span class="font-mono text-gray-300">#{{ item.order_no }}</span>
            </template>
            <template #cell-project="{ item }">
              <span class="text-gray-400 text-sm">{{ item.project?.name || '-' }}</span>
            </template>
            <template #cell-shipped_material_value="{ item }">
              <span class="text-sky-300 font-bold">{{
                formatCurrency(item.shipped_material_value)
              }}</span>
            </template>
            <template #cell-created_at="{ item }">
              <span class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</span>
            </template>
          </AppTable>
        </AppCard>

        <AppCard class="border border-gray-800 bg-surface-section/40">
          <div
            class="p-4 border-b border-gray-800 flex justify-between items-center bg-surface-ground/50"
          >
            <h3 class="font-bold text-emerald-400 flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              الدفعات والتسويات (المالية)
            </h3>
          </div>
          <AppTable
            :headers="transactionHeaders"
            :items="supplierStatement.statement.financial_transactions"
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
import { ref } from 'vue' // حذفنا onMounted لأنه لم يعد مطلوباً هنا
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency, formatDate } from '@/utils/formatters'

// المكونات
import SuppliersDropdown from '@/components/forms/SuppliersDropdown.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const reportStore = useReportStore()
const { supplierStatement, loading, error } = storeToRefs(reportStore)

const selectedSupplierId = ref('')

// رؤوس جدول التوريدات
const dispatchHeaders = [
  { key: 'order_no', label: 'رقم الإذن' },
  { key: 'project', label: 'المشروع' },
  { key: 'shipped_material_note', label: 'البيان/المادة' },
  { key: 'shipped_material_value', label: 'القيمة' },
  { key: 'created_at', label: 'التاريخ' },
]

// رؤوس جدول الدفعات المالية
const transactionHeaders = [
  { key: 'transaction_no', label: 'رقم السند' },
  { key: 'transaction_type', label: 'نوع الحركة' },
  { key: 'description', label: 'البيان' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'created_at', label: 'التاريخ' },
]

const loadStatement = () => {
  if (selectedSupplierId.value) {
    reportStore.fetchSupplierStatement(selectedSupplierId.value)
  }
}
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}
:deep(.AppTable td) {
  @apply py-3 border-b border-gray-800/50;
}
</style>
