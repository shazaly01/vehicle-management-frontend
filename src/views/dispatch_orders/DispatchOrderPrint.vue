<template>
  <div
    class="min-h-screen bg-gray-200 py-8 print:py-0 print:bg-white flex justify-center dir-rtl font-sans text-gray-900"
    dir="rtl"
  >
    <div
      class="bg-white w-[210mm] min-h-[297mm] p-12 shadow-2xl print:shadow-none print:w-full print:h-auto print:p-0 relative flex flex-col"
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

      <div v-if="loading" class="flex justify-center items-center h-full print:hidden flex-1">
        <div class="animate-pulse flex flex-col items-center">
          <div class="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <span class="text-xl font-bold text-gray-500">جاري تجهيز المستند...</span>
        </div>
      </div>

      <div v-else-if="order" class="flex flex-col flex-1">
        <header class="border-b-2 border-gray-300 pb-6 mb-8 flex justify-between items-start">
          <div class="flex items-center gap-4">
            <div
              class="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold text-sm"
            >
              شعار الشركة
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">إذن تشغيل معدات</h1>
              <p class="text-gray-500 mt-1 text-sm font-medium">
                شركة حركة الآليات والمعدات للتجارة والمقاولات
              </p>
            </div>
          </div>

          <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div class="flex flex-col gap-1">
              <div class="text-sm text-gray-500 font-medium">رقم الإذن</div>
              <div class="text-2xl font-bold text-gray-900 tracking-wider" dir="ltr">
                #{{ order.order_no }}
              </div>
              <div class="text-sm text-gray-500 mt-2 font-medium">
                تاريخ الإصدار: <span class="text-gray-900">{{ formatDate(order.created_at) }}</span>
              </div>
            </div>
          </div>
        </header>

        <div class="grid grid-cols-2 gap-6 mb-8">
          <div class="rounded-xl border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 class="font-bold text-gray-800">بيانات التوجيه والمشروع</h3>
            </div>
            <div class="p-4 space-y-3 text-sm">
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-500">المشروع</span>
                <span class="font-semibold">{{ order.project?.name || 'غير محدد' }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-500">المورد / العميل</span>
                <span class="font-semibold">{{ order.supplier?.name || 'غير محدد' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">نوع العملية</span>
                <span class="font-semibold">{{ order.operation_type || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-gray-200 overflow-hidden">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 class="font-bold text-gray-800">بيانات الآلية والسائق</h3>
            </div>
            <div class="p-4 space-y-3 text-sm">
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-500">الآلية / المعدة</span>
                <span class="font-semibold">{{
                  order.machinery?.plate_number_or_name || '-'
                }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-500">المالك</span>
                <span class="font-semibold">{{ order.machinery?.owner?.name || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">السائق</span>
                <span class="font-semibold">{{ order.driver?.name || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="font-bold text-gray-800 mb-4 px-1">تفاصيل التشغيل والتسعير</h3>
          <div class="border border-gray-300 rounded-lg overflow-hidden">
            <table class="w-full text-right border-collapse">
              <thead class="bg-gray-100 text-gray-700">
                <tr>
                  <th class="p-4 font-bold border-b border-gray-300 w-1/4">نوع التسعير</th>
                  <th class="p-4 font-bold border-b border-gray-300 w-1/4">الكمية / المدة</th>
                  <th class="p-4 font-bold border-b border-gray-300 w-1/4">سعر الوحدة</th>
                  <th class="p-4 font-bold border-b border-gray-300 w-1/4 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr>
                  <td class="p-4 font-medium text-gray-800">{{ order.pricing_type || '-' }}</td>
                  <td class="p-4 font-bold text-gray-900">{{ order.quantity }}</td>
                  <td class="p-4 font-medium text-gray-800">
                    {{ formatCurrency(order.unit_price) }}
                  </td>
                  <td class="p-4 font-bold text-lg text-gray-900 text-left">
                    {{ formatCurrency(order.total_cost) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="order.shipped_material_note || order.shipped_material_value > 0"
          class="mb-8 bg-blue-50/50 border border-blue-100 rounded-xl p-5"
        >
          <h3 class="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              ></path>
            </svg>
            بيانات المواد المشحونة / العهدة
          </h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-500 block mb-1">البيان / الملاحظات:</span>
              <span class="font-semibold text-gray-800">{{
                order.shipped_material_note || 'لا يوجد'
              }}</span>
            </div>
            <div class="text-left">
              <span class="text-gray-500 block mb-1">قيمة المواد:</span>
              <span class="font-bold text-lg text-gray-900">{{
                formatCurrency(order.shipped_material_value)
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex-grow"></div>

        <div class="mt-12 pt-8 grid grid-cols-3 gap-8 text-center">
          <div class="flex flex-col items-center">
            <p class="font-bold text-gray-700 mb-12">توقيع السائق / المستلم</p>
            <div class="border-b-2 border-dashed border-gray-400 w-48"></div>
          </div>
          <div class="flex flex-col items-center">
            <p class="font-bold text-gray-700 mb-12">المشرف المسؤول</p>
            <div class="border-b-2 border-dashed border-gray-400 w-48"></div>
          </div>
          <div class="flex flex-col items-center">
            <p class="font-bold text-gray-700 mb-12">اعتماد الإدارة</p>
            <div class="border-b-2 border-dashed border-gray-400 w-48"></div>
          </div>
        </div>

        <footer
          class="mt-12 border-t border-gray-200 pt-4 flex justify-between items-center text-xs text-gray-400"
        >
          <div>النظام التقني لإدارة حركة المعدات © {{ new Date().getFullYear() }}</div>
          <div>طُبع بتاريخ: {{ new Date().toLocaleString('ar-SA') }}</div>
        </footer>
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
        <span class="text-xl font-bold text-gray-800 mb-2">تعذر تحميل بيانات الإذن</span>
        <span class="text-gray-500 mb-6">قد يكون الإذن محذوفاً أو ليس لديك صلاحية لعرضه.</span>
        <button
          @click="closeTab"
          class="bg-gray-800 hover:bg-gray-900 text-white px-8 py-2 rounded-lg font-medium"
        >
          عودة
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDispatchOrderStore } from '@/stores/dispatchOrderStore'
import { formatCurrency, formatDate } from '@/utils/formatters'

const route = useRoute()
const dispatchOrderStore = useDispatchOrderStore()

const { currentOrder: order, loading } = storeToRefs(dispatchOrderStore)
const window = globalThis.window

const fetchOrderDetails = async () => {
  const orderId = route.params.id
  if (!orderId) return

  try {
    await dispatchOrderStore.fetchOrder(orderId)

    if (order.value) {
      setTimeout(() => {
        window.print()
      }, 700) // زدنا التوقيت قليلاً لضمان تحميل الخطوط وتنسيقات الـ CSS
    }
  } catch (error) {
    console.error('Error fetching order details for print:', error)
  }
}

const closeTab = () => {
  window.close()
}

onMounted(() => {
  fetchOrderDetails()
})
</script>

<style scoped>
@media print {
  @page {
    margin: 0;
    size: A4 portrait;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  /* إخفاء الهوامش السفلية والعلوية الافتراضية للمتصفح */
  @page {
    margin-top: 5mm;
    margin-bottom: 5mm;
  }
}
</style>
