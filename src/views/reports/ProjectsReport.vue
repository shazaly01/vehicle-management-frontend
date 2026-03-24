<template>
  <div class="space-y-6 print:hidden">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-black text-white tracking-tight">تقرير تكلفة المشاريع</h1>
      <AppButton
        v-if="projectsReport"
        @click="handlePrint"
        class="bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
      >
        <svg
          class="w-5 h-5 ml-2 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          ></path>
        </svg>
        طباعة التقرير
      </AppButton>
    </div>

    <AppCard class="p-5 border border-surface-border bg-surface-section/60 shadow-lg">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm text-gray-400 mb-1 font-bold">حالة المشروع</label>
          <select
            v-model="filters.status"
            class="w-full bg-surface-ground border border-surface-border text-white rounded-lg p-2 focus:ring-primary focus:border-primary"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="suspended">متوقف</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1 font-bold">من تاريخ</label>
          <input
            type="date"
            v-model="filters.start_date"
            class="w-full bg-surface-ground border border-surface-border text-white rounded-lg p-2 focus:ring-primary focus:border-primary [color-scheme:dark]"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-400 mb-1 font-bold">إلى تاريخ</label>
          <input
            type="date"
            v-model="filters.end_date"
            class="w-full bg-surface-ground border border-surface-border text-white rounded-lg p-2 focus:ring-primary focus:border-primary [color-scheme:dark]"
          />
        </div>

        <div>
          <AppButton
            @click="applyFilters"
            :disabled="loading"
            class="w-full bg-primary hover:bg-primary-dark text-white justify-center"
          >
            <span v-if="loading">جاري البحث...</span>
            <span v-else>تطبيق الفلتر</span>
          </AppButton>
        </div>
      </div>
    </AppCard>

    <div
      v-if="error"
      class="bg-rose-900/30 text-rose-400 p-4 rounded-lg text-center border border-rose-700/50"
    >
      {{ error }}
    </div>

    <template v-if="projectsReport">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-fuchsia-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
        >
          <div class="text-xs text-fuchsia-200/60 uppercase tracking-widest mb-2 font-bold">
            عدد المشاريع (حسب الفلتر)
          </div>
          <div
            class="text-2xl font-black text-fuchsia-300 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]"
          >
            {{ projectsReport.data.length }} <span class="text-sm font-normal">مشروع</span>
          </div>
        </AppCard>

        <AppCard
          class="relative overflow-hidden p-5 border-r-4 border-r-emerald-400 bg-surface-section/60 shadow-[0_4_20px_rgba(0,0,0,0.3)]"
        >
          <div class="text-xs text-emerald-200/60 uppercase tracking-widest mb-2 font-bold">
            إجمالي تكلفة تشغيل الآليات
          </div>
          <div
            class="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          >
            {{ formatCurrency(projectsReport.total_projects_cost) }}
          </div>
        </AppCard>
      </div>

      <AppCard class="border border-gray-800 bg-surface-section/40 backdrop-blur-sm">
        <AppTable :headers="tableHeaders" :items="projectsReport.data" :is-loading="loading">
          <template #cell-name="{ item }">
            <span class="font-bold text-cyan-300">{{ item.name }}</span>
          </template>

          <template #cell-status="{ item }">
            <span
              class="px-3 py-1 text-xs rounded-full border"
              :class="{
                'bg-emerald-900/30 text-emerald-400 border-emerald-700/50':
                  item.status === 'completed',
                'bg-blue-900/30 text-blue-400 border-blue-700/50': item.status === 'active',
                'bg-rose-900/30 text-rose-400 border-rose-700/50': item.status === 'suspended',
                'bg-gray-800 text-gray-400 border-gray-600': ![
                  'completed',
                  'active',
                  'suspended',
                ].includes(item.status),
              }"
            >
              {{ getStatusName(item.status) }}
            </span>
          </template>

          <template #cell-total_machinery_cost="{ item }">
            <span class="text-gray-100 font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
              {{ formatCurrency(item.total_machinery_cost) }}
            </span>
          </template>
        </AppTable>
      </AppCard>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '@/utils/formatters'

import AppCard from '@/components/ui/AppCard.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const reportStore = useReportStore()
const { projectsReport, loading, error } = storeToRefs(reportStore)

// حالة الفلاتر
const filters = ref({
  status: '',
  start_date: '',
  end_date: '',
})

const tableHeaders = [
  { key: 'name', label: 'اسم المشروع' },
  { key: 'status', label: 'الحالة', class: 'w-32 text-center', cellClass: 'text-center' },
  { key: 'total_machinery_cost', label: 'إجمالي تكلفة الآليات (بناءً على الفلتر)' },
]

// دالة مساعدة لترجمة الحالة
const getStatusName = (status) => {
  const map = {
    active: 'نشط',
    completed: 'مكتمل',
    suspended: 'متوقف',
  }
  return map[status] || status || 'غير محدد'
}

const applyFilters = () => {
  // نقوم بتنظيف الفلاتر الفارغة قبل إرسالها للباك-إند
  const cleanFilters = {}
  if (filters.value.status) cleanFilters.status = filters.value.status
  if (filters.value.start_date) cleanFilters.start_date = filters.value.start_date
  if (filters.value.end_date) cleanFilters.end_date = filters.value.end_date

  reportStore.fetchProjectsReport(cleanFilters)
}

const handlePrint = () => {
  if (!projectsReport.value) return

  sessionStorage.setItem(
    'printProjectsReportData',
    JSON.stringify({
      filters: filters.value, // لإظهار الفلاتر في ورقة الطباعة
      data: projectsReport.value,
    }),
  )

  const routeData = router.resolve({ name: 'PrintProjectsReport' })
  window.open(routeData.href, '_blank')
}

onMounted(() => {
  // جلب التقرير المبدئي (بدون فلاتر) عند فتح الصفحة
  applyFilters()
})
</script>

<style scoped>
:deep(.AppTable th) {
  @apply text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-gray-800;
}
:deep(.AppTable td) {
  @apply py-4 border-b border-gray-800/50;
}
</style>
