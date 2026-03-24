<template>
  <div>
    <AppTable :headers="headers" :items="owners" :is-loading="loading" :row-clickable="false">
      <template #cell-name="{ item }">
        <span class="font-bold text-white">{{ item.name }}</span>
      </template>

      <template #cell-phone="{ item }">
        <span dir="ltr">{{ item.phone || '-' }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('edit-owner', item)"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            تعديل
          </button>
          <button
            @click="$emit('delete-owner', item)"
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

defineProps({
  owners: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

defineEmits(['edit-owner', 'delete-owner', 'page-change'])

const headers = [
  { key: 'name', label: 'اسم صاحب الآلية' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'actions', label: 'الإجراءات', class: 'text-center', cellClass: 'text-center w-32' },
]
</script>
