<template>
  <div class="bg-surface-section p-4 rounded-xl mb-6 shadow-sm border border-surface-border">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-1">بحث</label>
        <AppInput
          id="project-search"
          v-model="internalSearch"
          placeholder="ابحث باسم المشروع..."
          @input="onSearchInput"
        />
      </div>

      <div>
        <AppDropdown
          id="filter-status"
          label="حالة المشروع"
          v-model="internalStatus"
          :options="statusOptions"
          placeholder="الكل"
          @update:modelValue="onFilterChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({ searchQuery: String, status: String })
const emit = defineEmits(['update:searchQuery', 'update:status', 'filter-changed'])

const internalSearch = ref(props.searchQuery || '')
const internalStatus = ref(props.status || '')

const statusOptions = [
  { id: '', name: 'الكل' },
  { id: 'active', name: 'نشط' },
  { id: 'on_hold', name: 'متوقف مؤقتاً' },
  { id: 'completed', name: 'مكتمل' },
]

watch(internalSearch, (val) => emit('update:searchQuery', val))
watch(internalStatus, (val) => emit('update:status', val))

const onSearchInput = () => emit('filter-changed')
const onFilterChange = () => emit('filter-changed')
</script>
