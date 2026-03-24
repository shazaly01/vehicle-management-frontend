<template>
  <div
    class="min-h-screen bg-gray-200 py-8 print:py-0 print:bg-white flex justify-center dir-rtl font-sans text-gray-900"
    dir="rtl"
  >
    <div
      class="bg-white w-[210mm] min-h-[148mm] p-10 shadow-2xl print:shadow-none print:w-full print:h-auto print:p-0 relative flex flex-col border-2 border-transparent print:border-gray-200"
    >
      <div class="print:hidden absolute top-4 left-4 flex gap-4">
        <button
          @click="window.print()"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md font-bold transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            ></path>
          </svg>
          طباعة
        </button>
        <button
          @click="closeTab"
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded-lg shadow-sm font-bold transition-colors"
        >
          إغلاق
        </button>
      </div>

      <div v-if="loading" class="flex justify-center items-center h-full print:hidden flex-1 py-20">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <span class="text-xl font-bold text-gray-500">جاري تجهيز السند...</span>
        </div>
      </div>

      <div v-else-if="transaction" class="flex flex-col flex-1">
        <header
          class="flex justify-between items-start mb-8 border-b-2 pb-4"
          :class="isReceipt ? 'border-green-600' : 'border-rose-700'"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold text-sm"
            >
              شعار الشركة
            </div>
            <div>
              <h1
                class="text-2xl font-black tracking-tight"
                :class="isReceipt ? 'text-green-700' : 'text-rose-700'"
              >
                {{ isReceipt ? 'سند قبض' : 'سند صرف' }}
              </h1>
              <p class="text-gray-500 mt-1 text-sm font-medium">
                شركة حركة الآليات والمعدات للتجارة والمقاولات
              </p>
            </div>
          </div>

          <div class="text-left flex flex-col gap-2">
            <div class="flex items-center justify-end gap-2 text-lg">
              <span class="text-gray-500 font-medium text-sm">رقم السند:</span>
              <span class="font-bold text-gray-900" dir="ltr">{{
                transaction.transaction_no
              }}</span>
            </div>
            <div class="flex items-center justify-end gap-2 text-lg">
              <span class="text-gray-500 font-medium text-sm">التاريخ:</span>
              <span class="font-bold text-gray-900">{{
                formatDate(transaction.date || transaction.created_at)
              }}</span>
            </div>
          </div>
        </header>

        <div class="flex items-center gap-6 mb-8">
          <div
            class="border-2 p-4 rounded-xl min-w-[200px] text-center bg-gray-50"
            :class="isReceipt ? 'border-green-200 text-green-800' : 'border-rose-200 text-rose-800'"
          >
            <div class="text-sm font-bold mb-1">المبلغ (ر.س)</div>
            <div class="text-3xl font-black" dir="ltr">
              {{ formatCurrency(transaction.amount) }}
            </div>
          </div>

          <div class="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center">
            <div class="text-lg">
              <span class="text-gray-500 font-medium ml-2">طريقة الدفع / الخزينة:</span>
              <span class="font-bold text-gray-900">{{
                transaction.treasury?.name || 'غير محدد'
              }}</span>
            </div>
          </div>
        </div>

        <div class="space-y-6 text-lg leading-relaxed mb-8">
          <div class="flex items-baseline border-b border-gray-300 pb-2">
            <span class="font-bold text-gray-700 w-32 shrink-0">{{
              isReceipt ? 'استلمنا من:' : 'صرفنا إلى:'
            }}</span>
            <span class="font-black text-xl text-gray-900 flex-1">{{
              getPartyName(transaction)
            }}</span>
            <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{{
              getPartyLabel(transaction)
            }}</span>
          </div>

          <div class="flex items-baseline border-b border-gray-300 pb-2">
            <span class="font-bold text-gray-700 w-32 shrink-0">مبلغ وقدره:</span>
            <span class="font-bold text-gray-900 flex-1"
              >فقط {{ formatCurrency(transaction.amount) }} ريال سعودي لا غير.</span
            >
          </div>

          <div class="flex items-start border-b border-gray-300 pb-2">
            <span class="font-bold text-gray-700 w-32 shrink-0">وذلك عن:</span>
            <span class="font-semibold text-gray-900 flex-1 whitespace-pre-wrap">{{
              transaction.description || 'لا يوجد تفاصيل إضافية'
            }}</span>
          </div>
        </div>

        <div class="flex-grow"></div>

        <div class="mt-12 pt-8 grid grid-cols-3 gap-8 text-center">
          <div class="flex flex-col items-center">
            <p class="font-bold text-gray-700 mb-12">المحاسب</p>
            <div class="border-b-2 border-dashed border-gray-400 w-40"></div>
          </div>
          <div class="flex flex-col items-center">
            <p class="font-bold text-gray-700 mb-12">المدير المالي / الإدارة</p>
            <div class="border-b-2 border-dashed border-gray-400 w-40"></div>
          </div>
          <div class="flex flex-col items-center">
            <p class="font-bold text-gray-700 mb-12">
              {{ isReceipt ? 'توقيع المستلم (الشركة)' : 'توقيع المستفيد' }}
            </p>
            <div class="border-b-2 border-dashed border-gray-400 w-40"></div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col justify-center items-center h-full print:hidden flex-1">
        <svg
          class="w-16 h-16 text-red-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span class="text-xl font-bold text-gray-800 mb-2">تعذر تحميل بيانات المعاملة</span>
        <button
          @click="closeTab"
          class="bg-gray-800 hover:bg-gray-900 text-white px-8 py-2 rounded-lg font-medium mt-4"
        >
          عودة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
// استدعاء مخزن المعاملات المالية
import { useFinancialTransactionStore } from '@/stores/financialTransactionStore'
import { formatCurrency, formatDate } from '@/utils/formatters'

const route = useRoute()
const transactionStore = useFinancialTransactionStore()

// استخراج المعاملة الحالية (يجب أن تتأكد أن المخزن الخاص بك يحتوي على currentTransaction و fetchTransaction)
const { currentTransaction: transaction, loading } = storeToRefs(transactionStore)
const window = globalThis.window

// دوال مساعدة لتحديد نوع السند
const isReceipt = computed(() => {
  return transaction.value?.transaction_type === 'receipt'
})

// استخراج اسم المستفيد/الدافع ديناميكياً
const getPartyName = (txn) => {
  if (txn.supplier_id && txn.supplier) return txn.supplier.name
  if (txn.machinery_owner_id && txn.machinery_owner) return txn.machinery_owner.name
  if (txn.project_id && txn.project) return txn.project.name
  if (txn.related_entity && txn.related_entity.name) return txn.related_entity.name
  return 'غير محدد'
}

// استخراج وصف أو صفة المستفيد/الدافع
const getPartyLabel = (txn) => {
  if (txn.supplier_id) return 'مورد / عميل'
  if (txn.machinery_owner_id) return 'مالك معدة'
  if (txn.project_id) return 'مشروع'
  return 'جهة مرتبطة'
}

const fetchTransactionDetails = async () => {
  const transactionId = route.params.id
  if (!transactionId) return

  try {
    // استدعاء دالة جلب معاملة واحدة من المخزن
    await transactionStore.fetchTransaction(transactionId)

    if (transaction.value) {
      setTimeout(() => {
        window.print()
      }, 700)
    }
  } catch (error) {
    console.error('Error fetching transaction details for print:', error)
  }
}

const closeTab = () => {
  window.close()
}

onMounted(() => {
  fetchTransactionDetails()
})
</script>

<style scoped>
@media print {
  @page {
    margin: 0;
    /* استخدمنا A5 ليكون حجم السند أصغر وأكثر واقعية للسندات المالية، ويمكن تغييره إلى A4 إذا أردت */
    size: A5 landscape;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
