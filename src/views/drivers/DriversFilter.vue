<template>
  <div class="bg-surface-section p-4 rounded-xl mb-6 shadow-sm border border-surface-border">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-1">
        <label class="block text-sm font-medium text-text-secondary mb-1">بحث</label>
        <AppInput
          id="driver-search"
          v-model="internalSearch"
          placeholder="ابحث بالاسم أو الكود الوظيفي..."
          @input="onSearchInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'

const props = defineProps({
  searchQuery: String,
})

const emit = defineEmits(['update:searchQuery', 'filter-changed'])

const internalSearch = ref(props.searchQuery || '')

watch(internalSearch, (val) => emit('update:searchQuery', val))

const onSearchInput = () => {
  emit('filter-changed')
}
</script>
