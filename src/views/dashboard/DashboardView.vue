<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white">نظام إدارة حركة الآليات</h1>
        <p class="text-text-muted text-sm mt-1">إليك ملخص شامل لأداء النظام والعمليات الحالية.</p>
      </div>
      <AppButton variant="secondary" @click="fetchData" :loading="loading">
        تحديث البيانات
      </AppButton>
    </div>

    <DashboardStatsCards :stats="stats" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <RecentDispatchOrdersTable :orders="stats?.recent_orders" :loading="loading" />

      <RecentTransactionsTable :transactions="stats?.recent_transactions" :loading="loading" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'
import { storeToRefs } from 'pinia'

import AppButton from '@/components/ui/AppButton.vue'
import DashboardStatsCards from './DashboardStatsCards.vue'
import RecentDispatchOrdersTable from './RecentDispatchOrdersTable.vue'
import RecentTransactionsTable from './RecentTransactionsTable.vue'

const dashboardStore = useDashboardStore()
const { stats, loading } = storeToRefs(dashboardStore)

const fetchData = async () => {
  await dashboardStore.fetchStats()
}

onMounted(() => {
  fetchData()
})
</script>
