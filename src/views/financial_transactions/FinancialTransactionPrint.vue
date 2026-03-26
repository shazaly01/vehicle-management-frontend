<template>
  <div
    class="min-h-screen bg-slate-100 py-10 print:py-0 print:bg-white flex justify-center font-sans"
    dir="rtl"
  >
    <div
      class="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full flex flex-col text-slate-900 relative border-t-[8px]"
      :class="isReceipt ? 'border-emerald-600' : 'border-rose-600'"
    >
      <div class="print:hidden absolute -left-20 top-0 flex flex-col gap-2">
        <button
          @click="window.print()"
          class="bg-slate-800 text-white p-4 rounded-xl shadow-xl hover:bg-slate-700 transition-all"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col justify-center items-center h-[200mm]">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-4"></div>
        <p class="font-bold">جاري تجهيز السند...</p>
      </div>

      <div v-else-if="transaction" class="flex flex-col flex-1 p-8 md:p-12">
        <header class="flex flex-col items-center mb-12 relative">
          <div class="absolute top-1/2 left-0 w-[30%] h-[1px] bg-slate-200 hidden md:block"></div>
          <div class="absolute top-1/2 right-0 w-[30%] h-[1px] bg-slate-200 hidden md:block"></div>

          <img
            src="/MainLogo.png"
            alt="Logo"
            class="h-36 object-contain relative z-10 mb-4 px-6 bg-white"
          />

          <div class="text-center space-y-1">
            <h1
              class="text-3xl font-black tracking-[0.1em] text-slate-800"
              :class="isReceipt ? 'text-emerald-700' : 'text-rose-700'"
            >
              {{ isReceipt ? 'سند قبض مالي' : 'سند صرف مالي' }}
            </h1>
            <p class="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase">
              Voucher Management System
            </p>
          </div>
        </header>

        <div class="flex justify-between items-start mb-10 border-b border-slate-100 pb-8">
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <span class="text-xs font-black text-slate-400 uppercase">رقم السند:</span>
              <span class="text-2xl font-mono font-black text-slate-900" dir="ltr"
                >#{{ transaction.transaction_no }}</span
              >
            </div>
            <div class="flex items-center gap-4">
              <span class="text-xs font-black text-slate-400 uppercase">التاريخ:</span>
              <span class="text-lg font-bold text-slate-700">{{
                formatDate(transaction.date || transaction.created_at)
              }}</span>
            </div>
          </div>

          <div
            class="bg-slate-50 border-2 rounded-2xl p-5 flex flex-col items-center min-w-[220px]"
            :class="isReceipt ? 'border-emerald-100' : 'border-rose-100'"
          >
            <span class="text-[10px] font-black text-slate-400 uppercase mb-1"
              >المبلغ الإجمالي / Total Amount</span
            >
            <div class="text-3xl font-black text-slate-900" dir="ltr">
              {{ formatCurrency(transaction.amount) }}
            </div>
          </div>
        </div>

        <main class="flex-1 space-y-12 py-4">
          <div class="flex items-baseline gap-4 border-b border-slate-100 pb-3">
            <span class="text-sm font-black text-slate-400 whitespace-nowrap">{{
              isReceipt ? 'استلمنا من السيد:' : 'صرفنا إلى السيد:'
            }}</span>
            <span class="text-2xl font-bold text-slate-900">{{ getPartyName(transaction) }}</span>
            <span
              class="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold mr-auto tracking-widest uppercase"
            >
              {{ getPartyLabel(transaction) }}
            </span>
          </div>

          <div class="flex items-baseline gap-4 border-b border-slate-100 pb-3">
            <span class="text-sm font-black text-slate-400 whitespace-nowrap"
              >مبلغ وقدره نصاً:</span
            >
            <p class="text-xl font-bold text-slate-800 italic decoration-emerald-500">
              {{ amountInArabicWords }} فقط لا غير.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="border-b border-slate-100 pb-3">
              <span class="text-xs font-black text-slate-400 block mb-2">طريقة الدفع:</span>
              <span class="text-lg font-bold text-slate-800">{{
                transaction.treasury?.name || 'نقداً / خزينة الشركة'
              }}</span>
            </div>
            <div class="border-b border-slate-100 pb-3">
              <span class="text-xs font-black text-slate-400 block mb-2">وذلك مقابل:</span>
              <p class="text-lg font-semibold text-slate-700">
                {{ transaction.description || 'تغطية حسابات تجارية جارية' }}
              </p>
            </div>
          </div>
        </main>

        <section class="mt-20 grid grid-cols-3 gap-12 text-center">
          <div
            v-for="role in [
              'المحاسب المراجع',
              'المدير المالي',
              isReceipt ? 'أمين الصندوق' : 'المستلم',
            ]"
            :key="role"
          >
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-12">
              {{ role }}
            </p>
            <div class="w-full border-t border-slate-300"></div>
          </div>
        </section>

        <footer
          class="mt-auto pt-8 flex justify-between items-center text-[9px] font-bold text-slate-400 border-t border-slate-100 uppercase tracking-widest"
        >
          <div>
            Printed: {{ new Date().toLocaleString('ar-SA') }} | Security ID: {{ transaction.id }}
          </div>
          <div class="italic">Authorized by {{ authStore?.user?.name }}</div>
          <div>Page 1 of 1</div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useFinancialTransactionStore } from '@/stores/financialTransactionStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { tafkeet } from '@/utils/tafkeetLibyan' // سنقوم بإنشاء هذا الملف الآن

const route = useRoute()
const transactionStore = useFinancialTransactionStore()
const authStore = useAuthStore()

const { currentTransaction: transaction, loading } = storeToRefs(transactionStore)

const isReceipt = computed(() => transaction.value?.transaction_type === 'receipt')

// --- محرك تحويل الرقم إلى كلمات بالدينار الليبي ---
const amountInArabicWords = computed(() => {
  if (!transaction.value?.amount) return '................'
  return tafkeet(transaction.value.amount)
})

const getPartyName = (txn) =>
  txn.related_entity?.name || txn.related_entity_name || '................'
const getPartyLabel = (txn) => {
  const type = txn.related_entity_type || ''
  if (type.includes('Supplier')) return 'مورد'
  if (type.includes('MachineryOwner')) return 'مالك'
  if (type.includes('Project')) return 'مشروع'
  return 'جهة تعامل'
}

const fetchTransactionDetails = async () => {
  const id = route.params.id
  if (!id) return
  await transactionStore.fetchTransaction(id)
  if (transaction.value) setTimeout(() => window.print(), 1500)
}

onMounted(fetchTransactionDetails)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap');
* {
  font-family: 'Tajawal', sans-serif;
}
@media print {
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  body {
    -webkit-print-color-adjust: exact !important;
  }
}
</style>
