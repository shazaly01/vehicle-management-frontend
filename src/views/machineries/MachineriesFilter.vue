<template>
  <div class="bg-surface-section p-4 rounded-xl mb-6 shadow-sm border border-surface-border">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-1">بحث</label>
        <AppInput
          id="machinery-search"
          v-model="internalSearch"
          placeholder="رقم اللوحة أو الاسم..."
          @input="onSearchInput"
        />
      </div>

      <div>
        <MachineryOwnersDropdown
          id="filter-owner"
          label="صاحب الآلية"
          v-model="internalOwner"
          @update:modelValue="onFilterChange"
        />
      </div>

      <div>
        <AppDropdown
          id="filter-status"
          label="الحالة"
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
import MachineryOwnersDropdown from '@/components/forms/MachineryOwnersDropdown.vue'

const props = defineProps({
  searchQuery: String,
  ownerId: [String, Number],
  status: String,
})

const emit = defineEmits([
  'update:searchQuery',
  'update:ownerId',
  'update:status',
  'filter-changed',
])

const internalSearch = ref(props.searchQuery || '')
const internalOwner = ref(props.ownerId || '')
const internalStatus = ref(props.status || '')

const statusOptions = [
  { id: '', name: 'الكل' },
  { id: 'available', name: 'متاحة' },
  { id: 'busy', name: 'مشغولة' },
  { id: 'maintenance', name: 'صيانة' },
  { id: 'out_of_service', name: 'خارج الخدمة' },
]

watch(internalSearch, (val) => emit('update:searchQuery', val))
watch(internalOwner, (val) => emit('update:ownerId', val))
watch(internalStatus, (val) => emit('update:status', val))

const onSearchInput = () => emit('filter-changed')
const onFilterChange = () => emit('filter-changed')
</script>
