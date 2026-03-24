<!--src\components\forms\ProjectsDropdown.vue-->
<template>
  <div>
    <AppDropdown
      :id="id"
      :label="label"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :options="projects"
      :loading="loading"
      :required="required"
      :disabled="disabled"
      placeholder="اختر المشروع"
    />
    <p v-if="error" class="text-sm text-red-500 mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { storeToRefs } from 'pinia'
import AppDropdown from '@/components/ui/AppDropdown.vue'

defineProps({
  id: { type: String, required: true },
  label: { type: String, default: 'المشروع' },
  modelValue: { type: [String, Number], default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])

const projectStore = useProjectStore()
const { projects, loading } = storeToRefs(projectStore)
const error = ref(null)

onMounted(async () => {
  if (projects.value.length === 0) {
    try {
      await projectStore.fetchProjects(1, '', { paginate: false, status: 'active' }) // الأفضل جلب المشاريع النشطة فقط
    } catch (err) {
      error.value = 'فشل تحميل قائمة المشاريع.'
      console.error('Failed to fetch projects for dropdown:', err)
    }
  }
})
</script>
