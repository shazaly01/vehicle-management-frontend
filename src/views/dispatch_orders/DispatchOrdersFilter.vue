<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-6 shadow-sm border border-gray-700">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">بحث برقم الإذن</label>
        <AppInput
          id="search"
          v-model="internalSearch"
          placeholder="ابحث برقم الإذن المرجعي..."
          @input="onSearchInput"
        />
      </div>

      <div>
        <ProjectsDropdown
          id="filter-project"
          label="المشروع"
          v-model="internalProject"
          @update:modelValue="onFilterChange"
        />
      </div>

      <div>
        <AppDropdown
          id="filter-status"
          label="حالة الأمر"
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
import ProjectsDropdown from '@/components/forms/ProjectsDropdown.vue'

const props = defineProps({
  searchQuery: String,
  projectId: [String, Number],
  status: String,
})

const emit = defineEmits([
  'update:searchQuery',
  'update:projectId',
  'update:status',
  'filter-changed',
])

const internalSearch = ref(props.searchQuery || '')
const internalProject = ref(props.projectId || '')
const internalStatus = ref(props.status || '')

const statusOptions = [
  { id: '', name: 'الكل' },
  { id: 'pending', name: 'قيد الانتظار' },
  { id: 'active', name: 'قيد التنفيذ' },
  { id: 'completed', name: 'مكتمل' },
  { id: 'cancelled', name: 'ملغي' },
]

// تحديث القيم للـ Parent
watch(internalSearch, (val) => emit('update:searchQuery', val))
watch(internalProject, (val) => emit('update:projectId', val))
watch(internalStatus, (val) => emit('update:status', val))

const onSearchInput = () => {
  emit('filter-changed') // الـ List سيستقبل هذا الحدث ويطبق الـ Debounce
}

const onFilterChange = () => {
  emit('filter-changed')
}
</script>
