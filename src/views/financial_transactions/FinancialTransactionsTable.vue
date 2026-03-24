<template>
  <div>
    <AppTable :headers="headers" :items="transactions" :is-loading="loading" :row-clickable="false">
      <template #cell-transaction_no="{ item }">
        <span dir="ltr" class="font-bold text-white">{{ item.transaction_no }}</span>
      </template>

      <template #cell-date="{ item }">
        <span dir="ltr">{{ formatDate(item.date || item.created_at) }}</span>
      </template>

      <template #cell-transaction_type="{ item }">
        <span :class="getTypeClass(item.transaction_type)" class="px-2 py-1 text-xs rounded-md">
          {{ item.transaction_type === 'receipt' ? 'سند قبض' : 'سند صرف' }}
        </span>
      </template>

      <template #cell-treasury="{ item }">
        <span>{{ item.treasury?.name || '-' }}</span>
      </template>

      <template #cell-party="{ item }">
        <span v-if="item.supplier_id" class="text-blue-300">مورد: {{ item.supplier?.name }}</span>
        <span v-else-if="item.machinery_owner_id" class="text-orange-300"
          >مالك: {{ item.machinery_owner?.name }}</span
        >
        <span v-else-if="item.project_id" class="text-emerald-300"
          >مشروع: {{ item.project?.name }}</span
        >
        <span v-else class="text-text-muted">-</span>
      </template>

      <template #cell-amount="{ item }">
        <span
          class="font-bold"
          :class="item.transaction_type === 'receipt' ? 'text-green-400' : 'text-rose-400'"
        >
          {{ item.transaction_type === 'receipt' ? '+' : '-' }} {{ formatCurrency(item.amount) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('print-transaction', item)"
            class="text-emerald-500 hover:text-emerald-400 transition-colors font-bold"
            title="طباعة"
          >
            طباعة
          </button>

          <button
            @click="$emit('edit-transaction', item)"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            تعديل
          </button>
          <button
            @click="$emit('delete-transaction', item)"
            class="text-rose-500 hover:text-rose-400 transition-colors"
          >
            حذف
          </button>
        </div>
      </template>
    </AppTable>

    <div v-if="pagination && pagination.last_page > 1" class="p-4 mt-4 flex justify-center">
      <div class="flex gap-2">
        <button
          v-for="page in pagination.last_page"
          :key="page"
          @click="$emit('page-change', page)"
          :class="[
            'px-3 py-1 rounded text-sm',
            pagination.current_page === page
              ? 'bg-primary text-white font-bold'
              : 'bg-surface-section text-text-secondary hover:bg-black/20',
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

defineProps({
  transactions: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

// أضفنا 'print-transaction' للأحداث
defineEmits(['edit-transaction', 'delete-transaction', 'print-transaction', 'page-change'])

const headers = [
  { key: 'transaction_no', label: 'رقم السند' },
  { key: 'date', label: 'التاريخ' },
  { key: 'transaction_type', label: 'النوع' }, // تم الإصلاح هنا: transaction_type بدلاً من type
  { key: 'treasury', label: 'الخزينة' },
  { key: 'party', label: 'المستفيد / الدافع' },
  { key: 'amount', label: 'المبلغ' },
  { key: 'actions', label: 'الإجراءات', class: 'text-center', cellClass: 'text-center w-32' },
]

const getTypeClass = (type) => {
  if (type === 'receipt') return 'bg-green-900/30 text-green-400 border border-green-700/50'
  return 'bg-rose-900/30 text-rose-400 border border-rose-700/50'
}
</script>
