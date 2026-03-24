<template>
  <div class="bg-surface-section rounded-xl border border-surface-border p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-white flex items-center gap-2">
        <ArrowPathIcon class="w-5 h-5 text-green-400" />
        أحدث الحركات المالية
      </h2>
      <router-link
        to="/app/financial-transactions"
        class="text-primary text-xs font-bold hover:underline"
      >
        عرض الكل
      </router-link>
    </div>

    <AppTable :headers="headers" :items="transactions" :is-loading="loading" :row-clickable="false">
      <template #cell-date="{ item }">
        <span dir="ltr" class="text-xs text-text-secondary">{{ formatDate(item.date) }}</span>
      </template>

      <template #cell-transaction_no="{ item }">
        <span dir="ltr" class="text-xs font-mono text-text-muted">{{ item.transaction_no }}</span>
      </template>

      <template #cell-amount="{ item }">
        <span
          :class="item.type === 'receipt' ? 'text-green-400' : 'text-rose-400'"
          class="font-bold"
        >
          {{ item.type === 'receipt' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
        </span>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import AppTable from '@/components/ui/AppTable.vue'

defineProps({
  transactions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const headers = [
  { key: 'transaction_no', label: 'رقم السند' },
  { key: 'date', label: 'التاريخ' },
  { key: 'amount', label: 'المبلغ' },
]

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })
const formatDate = (d) => new Date(d).toLocaleDateString('en-GB')
</script>
