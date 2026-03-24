<template>
  <div class="bg-surface-section rounded-xl border border-surface-border p-5">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-white flex items-center gap-2">
        <ClockIcon class="w-5 h-5 text-primary" />
        أحدث أوامر التشغيل
      </h2>
      <router-link to="/app/dispatch-orders" class="text-primary text-xs font-bold hover:underline">
        عرض الكل
      </router-link>
    </div>

    <AppTable :headers="headers" :items="orders" :is-loading="loading" :row-clickable="false">
      <template #cell-order_no="{ item }">
        <span dir="ltr" class="text-xs font-mono font-bold text-white">{{ item.order_no }}</span>
      </template>

      <template #cell-total_cost="{ item }">
        <span class="text-green-400 font-bold">
          {{ formatCurrency(item.total_cost) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <div class="flex justify-center">
          <span
            :class="getStatusClass(item.status)"
            class="w-2 h-2 rounded-full shadow-sm"
            :title="item.status"
          ></span>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import { ClockIcon } from '@heroicons/vue/24/outline'
import AppTable from '@/components/ui/AppTable.vue'

defineProps({
  orders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const headers = [
  { key: 'order_no', label: 'رقم الإذن' },
  { key: 'operation_type', label: 'البيان' },
  { key: 'total_cost', label: 'التكلفة' },
  { key: 'status', label: 'ح', class: 'text-center', cellClass: 'text-center' },
]

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-500',
    active: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-rose-500',
  }
  return map[status] || 'bg-gray-500'
}
</script>
