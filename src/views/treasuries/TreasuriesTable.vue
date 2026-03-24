<template>
  <div>
    <AppTable :headers="headers" :items="treasuries" :is-loading="loading" :row-clickable="false">
      <template #cell-name="{ item }">
        <span class="font-bold text-white">{{ item.name }}</span>
      </template>

      <template #cell-balance="{ item }">
        <span class="font-mono font-bold text-green-400" dir="ltr">
          {{ Number(item.balance || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 }) }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-3">
          <button @click="$emit('edit-treasury', item)" class="text-blue-400 hover:text-blue-300">
            تعديل
          </button>
          <button @click="$emit('delete-treasury', item)" class="text-rose-500 hover:text-rose-400">
            حذف
          </button>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'
import { formatCurrency, formatDate } from '@/utils/formatters'

defineProps({ treasuries: Array, loading: Boolean })
defineEmits(['edit-treasury', 'delete-treasury'])

const headers = [
  { key: 'name', label: 'اسم الخزينة / الحساب' },
  { key: 'balance', label: 'الرصيد الحالي' },
  { key: 'actions', label: 'الإجراءات', class: 'text-center', cellClass: 'text-center w-32' },
]
</script>
