<template>
  <div>
    <AppTable :headers="headers" :items="drivers" :is-loading="loading" :row-clickable="false">
      <template #cell-name="{ item }">
        <span class="font-bold text-white">{{ item.name }}</span>
      </template>

      <template #cell-emp_code="{ item }">
        <span
          dir="ltr"
          class="bg-surface-ground px-2 py-1 rounded text-primary border border-surface-border font-mono"
        >
          {{ item.emp_code }}
        </span>
      </template>

      <template #cell-phone="{ item }">
        <span dir="ltr">{{ item.phone || '-' }}</span>
      </template>

      <template #cell-actions="{ item }">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('open-documents', item)"
            class="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
            title="إدارة المستندات"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              ></path>
            </svg>
          </button>

          <button
            @click="$emit('edit-driver', item)"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            تعديل
          </button>
          <button
            @click="$emit('delete-driver', item)"
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
  drivers: { type: Array, required: true },
  pagination: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})

// أضفنا الحدث الجديد هنا 'open-documents'
defineEmits(['edit-driver', 'delete-driver', 'page-change', 'open-documents'])

const headers = [
  { key: 'name', label: 'اسم السائق' },
  { key: 'emp_code', label: 'الكود الوظيفي' },
  { key: 'phone', label: 'رقم الجوال' },
  { key: 'actions', label: 'الإجراءات', class: 'text-center', cellClass: 'text-center w-40' },
]
</script>
