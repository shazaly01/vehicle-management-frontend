<template>
  <div>
    <AppTable :headers="headers" :items="projects" :is-loading="loading" :row-clickable="false">
      <template #cell-name="{ item }">
        <span class="font-bold text-white">{{ item.name }}</span>
      </template>

      <template #cell-status="{ item }">
        <span :class="getStatusClass(item.status)" class="px-2 py-1 text-xs rounded-md border">
          {{ getStatusName(item.status) }}
        </span>
      </template>

      <template #cell-dates="{ item }">
        <div class="text-xs text-text-muted">
          <p v-if="item.start_date">بداية: {{ formatDate(item.start_date) }}</p>
          <p v-if="item.end_date">نهاية: {{ formatDate(item.end_date) }}</p>
        </div>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-3">
          <button @click="$emit('edit-project', item)" class="text-blue-400 hover:text-blue-300">
            تعديل
          </button>
          <button @click="$emit('delete-project', item)" class="text-rose-500 hover:text-rose-400">
            حذف
          </button>
        </div>
      </template>
    </AppTable>
  </div>
</template>

<script setup>
import AppTable from '@/components/ui/AppTable.vue'

defineProps({ projects: Array, loading: Boolean, pagination: Object })
defineEmits(['edit-project', 'delete-project', 'page-change'])

const headers = [
  { key: 'name', label: 'اسم المشروع' },
  { key: 'status', label: 'الحالة', class: 'text-center', cellClass: 'text-center' },
  { key: 'dates', label: 'التواريخ' },
  { key: 'actions', label: 'الإجراءات', class: 'text-center', cellClass: 'text-center w-32' },
]

const getStatusName = (s) => ({ active: 'نشط', on_hold: 'متوقف', completed: 'مكتمل' })[s] || s
const getStatusClass = (s) => {
  const map = {
    active: 'bg-green-900/30 text-green-400 border-green-700/50',
    on_hold: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
    completed: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
  }
  return map[s] || 'bg-gray-700 text-gray-300'
}
const formatDate = (d) => new Date(d).toLocaleDateString('en-GB')
</script>
