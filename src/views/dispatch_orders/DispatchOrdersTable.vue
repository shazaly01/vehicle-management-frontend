<template>
  <div>
    <AppTable :headers="headers" :items="orders" :is-loading="loading" :row-clickable="false">
      <template #cell-order_no="{ item }">
        <span dir="ltr" class="font-bold text-white">{{ item.order_no }}</span>
      </template>

      <template #cell-project="{ item }">
        <span>{{ item.project?.name || '-' }}</span>
      </template>

      <template #cell-machinery="{ item }">
        <span>{{ item.machinery?.plate_number_or_name || '-' }}</span>
      </template>

      <template #cell-driver="{ item }">
        <span>{{ item.driver?.name || '-' }}</span>
      </template>

      <template #cell-total_cost="{ item }">
        <span class="font-bold text-green-400">
          {{ formatCurrency(item.total_cost) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span :class="getStatusClass(item.status)" class="px-2 py-1 text-xs rounded-md">
          {{ getStatusName(item.status) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('print-order', item)"
            class="text-emerald-500 hover:text-emerald-400 transition-colors font-bold"
            title="طباعة"
          >
            طباعة
          </button>

          <button
            @click="$emit('edit-order', item)"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            تعديل
          </button>
          <button
            @click="$emit('delete-order', item)"
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
  orders: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit-order', 'delete-order', 'print-order', 'page-change'])

// تعريف الأعمدة ليقرأها AppTable
const headers = [
  { key: 'order_no', label: 'رقم الإذن' },
  { key: 'project', label: 'المشروع' },
  { key: 'machinery', label: 'الآلية' },
  { key: 'driver', label: 'السائق' },
  { key: 'total_cost', label: 'الإجمالي' },
  { key: 'status', label: 'الحالة', class: 'text-center', cellClass: 'text-center' },
  { key: 'actions', label: 'الإجراءات', class: 'text-center', cellClass: 'text-center w-32' },
]

const getStatusName = (status) => {
  const map = {
    pending: 'قيد الانتظار',
    active: 'قيد التنفيذ',
    completed: 'مكتمل',
    cancelled: 'ملغي',
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = {
    pending: 'bg-yellow-900/30 text-yellow-500 border border-yellow-700/50',
    active: 'bg-blue-900/30 text-blue-400 border border-blue-700/50',
    completed: 'bg-green-900/30 text-green-400 border border-green-700/50',
    cancelled: 'bg-red-900/30 text-rose-400 border border-red-700/50',
  }
  return map[status] || 'bg-surface-section text-text-secondary'
}
</script>
