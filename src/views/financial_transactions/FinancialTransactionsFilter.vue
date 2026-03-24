<template>
  <div class="bg-surface-section p-4 rounded-xl mb-6 shadow-sm border border-surface-border">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-text-secondary mb-1">بحث برقم السند</label>
        <AppInput
          id="search"
          v-model="internalSearch"
          placeholder="ابحث برقم المعاملة..."
          @input="onSearchInput"
        />
      </div>

      <div>
        <AppDropdown
          id="filter-type"
          label="نوع المعاملة"
          v-model="internalType"
          :options="typeOptions"
          placeholder="الكل"
          @update:modelValue="onFilterChange"
        />
      </div>

      <div>
        <TreasuriesDropdown
          id="filter-treasury"
          label="الخزينة"
          v-model="internalTreasury"
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
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'

const props = defineProps({
  searchQuery: String,
  type: String,
  treasuryId: [String, Number],
})

const emit = defineEmits([
  'update:searchQuery',
  'update:type',
  'update:treasuryId',
  'filter-changed',
])

const internalSearch = ref(props.searchQuery || '')
const internalType = ref(props.type || '')
const internalTreasury = ref(props.treasuryId || '')

const typeOptions = [
  { id: '', name: 'الكل' },
  { id: 'receipt', name: 'سندات القبض (وارد)' },
  { id: 'payment', name: 'سندات الصرف (صادر)' },
]

watch(internalSearch, (val) => emit('update:searchQuery', val))
watch(internalType, (val) => emit('update:type', val))
watch(internalTreasury, (val) => emit('update:treasuryId', val))

const onSearchInput = () => {
  emit('filter-changed')
}

const onFilterChange = () => {
  emit('filter-changed')
}
</script>
