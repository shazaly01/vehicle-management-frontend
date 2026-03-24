<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard
      label="إجمالي المشاريع"
      :value="stats?.projects_count || 0"
      :icon="BuildingOfficeIcon"
    />

    <StatCard
      label="آليات نشطة حالياً"
      :value="stats?.active_machinery_count || 0"
      :icon="TruckIcon"
      icon-bg-class="bg-blue-500/10"
      icon-color-class="text-blue-400"
    />

    <StatCard
      label="إجمالي مستحقات الموردين"
      :icon="BanknotesIcon"
      icon-bg-class="bg-rose-500/10"
      icon-color-class="text-rose-400"
    >
      {{ formatCurrency(stats?.total_suppliers_balance) }}
    </StatCard>

    <StatCard
      label="إجمالي أرصدة الخزائن"
      :icon="WalletIcon"
      icon-bg-class="bg-green-500/10"
      icon-color-class="text-green-400"
    >
      {{ formatCurrency(stats?.total_treasuries_balance) }}
    </StatCard>
  </div>
</template>

<script setup>
import { BuildingOfficeIcon, TruckIcon, BanknotesIcon, WalletIcon } from '@heroicons/vue/24/outline'
import StatCard from '@/components/ui/StatCard.vue'

// استقبال البيانات كـ Prop من الشاشة الرئيسية
defineProps({
  stats: {
    type: Object,
    default: () => ({}),
  },
})

// دالة تنسيق العملة لتبقى البطاقات فخمة وموحدة
const formatCurrency = (val) => {
  if (val === undefined || val === null) return '0.00'
  return Number(val).toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
