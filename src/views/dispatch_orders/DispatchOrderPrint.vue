<template>
  <div
    class="min-h-screen bg-slate-50 py-6 print:py-0 print:bg-white flex justify-center font-sans dir-rtl"
    dir="rtl"
  >
    <div
      class="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full relative flex flex-col text-slate-900 overflow-hidden rounded-xl print:rounded-none border border-slate-100 print:border-none"
    >
      <div class="print:hidden absolute top-4 left-4 flex gap-2 z-50">
        <button
          @click="window.print()"
          class="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-1.5 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            ></path>
          </svg>
          طباعة الإذن
        </button>
      </div>

      <div v-if="loading" class="flex flex-col justify-center items-center h-[200mm] print:hidden">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
        <p class="text-teal-700 font-bold">جاري تحضير البيانات...</p>
      </div>

      <div v-else-if="order" class="flex flex-col flex-1 p-8 print:p-6 break-inside-avoid">
        <header
          class="relative -mt-8 -mx-8 print:-mt-6 print:-mx-6 mb-6 h-48 flex items-center bg-teal-950 px-10 rounded-b-[40px] shadow-lg overflow-hidden border-b-4 border-teal-500"
        >
          <div class="absolute inset-0 opacity-10">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" class="h-full w-full">
              <path
                d="M0.00,49.98 C150.00,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                style="stroke: none; fill: white"
              ></path>
            </svg>
          </div>

          <div class="relative z-10 flex justify-between items-center w-full mt-2">
            <div class="flex items-center gap-8">
              <div class="bg-white p-3 rounded-2xl shadow-2xl flex items-center justify-center">
                <img src="/MainLogo.png" alt="Company Logo" class="h-32 object-contain" />
              </div>
              <div class="space-y-1">
                <h1 class="text-4xl font-black text-white tracking-tighter">إذن تشغيل معدات</h1>
                <p class="text-teal-400 text-xs font-black tracking-widest uppercase">
                  Logistics & Machinery Operation Order
                </p>
              </div>
            </div>

            <div
              class="text-left bg-white/10 p-4 rounded-3xl border border-white/20 text-white min-w-[190px] backdrop-blur-md shadow-inner"
            >
              <div
                class="text-[10px] uppercase font-bold text-teal-300 text-center mb-1 tracking-widest"
              >
                Serial Number
              </div>
              <div class="text-3xl font-black text-center text-white" dir="ltr">
                #{{ order.order_no }}
              </div>
              <div class="text-[10px] text-teal-200 text-center mt-1 font-bold">
                تاريخ الإذن: {{ formatDate(order.created_at) }}
              </div>
            </div>
          </div>
        </header>

        <div
          class="bg-teal-50 rounded-2xl border-2 border-teal-100 p-5 mb-6 grid grid-cols-4 gap-4 divide-x divide-x-reverse divide-teal-100 shadow-sm items-center"
        >
          <div class="col-span-1 pr-0 flex flex-col">
            <span class="text-teal-600 text-[10px] font-black uppercase mb-1">المشروع المستلم</span>
            <span class="font-black text-slate-900 text-base leading-none">{{
              order.project?.name || '---'
            }}</span>
          </div>
          <div class="col-span-1 pr-4 flex flex-col border-r-2 border-teal-200/50">
            <span class="text-teal-600 text-[10px] font-black uppercase mb-1">نوع العملية</span>
            <span class="font-black text-slate-900 text-base leading-none">{{
              order.operation_type_label || order.operation_type
            }}</span>
          </div>
          <div class="col-span-1 pr-4 flex flex-col border-r-2 border-teal-200/50">
            <span class="text-teal-600 text-[10px] font-black uppercase mb-1">المورد / المصدر</span>
            <span class="font-black text-slate-900 text-base leading-none">{{
              order.supplier?.name || 'تشغيل داخلي'
            }}</span>
          </div>
          <div
            class="col-span-1 text-left flex flex-col items-end border-r-2 border-teal-200/50 pr-4"
          >
            <span class="text-teal-700 font-black text-[10px] uppercase mb-1"
              >الكمية المستهدفة</span
            >
            <div class="flex items-baseline gap-1 text-teal-600">
              <span class="text-3xl font-black leading-none">{{ order.target_quantity }}</span>
              <span class="text-[10px] font-bold">وحدة</span>
            </div>
          </div>
        </div>

        <div class="flex-grow">
          <table class="w-full border-collapse text-xs shadow-sm rounded-t-xl overflow-hidden">
            <thead>
              <tr class="bg-teal-900 text-white">
                <th class="py-3 px-2 text-right w-10 border border-teal-800 font-black">#</th>
                <th class="py-3 px-3 text-right border border-teal-800">المعدة / الآلية</th>
                <th class="py-3 px-3 text-right border border-teal-800">السائق</th>
                <th class="py-3 px-2 text-center border border-teal-800">نوع الحساب</th>
                <th class="py-3 px-2 text-center border border-teal-800">الكمية</th>
                <th class="py-3 px-3 text-left border border-teal-800">إجمالي المالك</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(trip, index) in order.trips"
                :key="index"
                class="border-b border-teal-50 odd:bg-white even:bg-teal-50/30"
              >
                <td
                  class="py-2.5 px-2 text-center font-black text-teal-300 border-r border-teal-50"
                >
                  {{ index + 1 }}
                </td>
                <td class="py-2.5 px-3 border-r border-teal-50">
                  <div class="font-black text-teal-900 text-sm">
                    {{ trip.machinery?.plate_number_or_name }}
                  </div>
                  <div class="text-[9px] text-teal-500 font-bold uppercase tracking-widest">
                    {{ trip.machinery?.owner?.name }}
                  </div>
                </td>
                <td class="py-2.5 px-3 font-bold text-slate-800 border-r border-teal-50">
                  {{ trip.driver?.name || '---' }}
                </td>
                <td class="py-2.5 px-2 text-center border-r border-teal-50 font-bold text-teal-700">
                  {{ trip.cost_type_label || trip.transport_cost_type }}
                </td>
                <td
                  class="py-2.5 px-2 text-center font-black text-slate-950 border-r border-teal-50"
                >
                  {{ trip.quantity }}
                </td>
                <td class="py-2.5 px-3 text-left font-black text-teal-600 border-r border-teal-50">
                  {{ formatCurrency(trip.quantity * trip.transport_unit_price) }}
                </td>
              </tr>
              <tr
                v-for="i in Math.max(0, 8 - (order.trips?.length || 0))"
                :key="'empty-' + i"
                class="border-b border-teal-50/50 print:hidden"
              >
                <td class="py-3 px-2 border-r border-teal-50"></td>
                <td class="py-3 px-3 border-r border-teal-50"></td>
                <td class="py-3 px-3 border-r border-teal-50"></td>
                <td class="py-3 px-2 border-r border-teal-50"></td>
                <td class="py-3 px-2 border-r border-teal-50"></td>
                <td class="py-3 px-3 border-r border-teal-50"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-8 border-t-2 border-teal-50 pt-6">
          <div class="flex justify-between items-start gap-12">
            <div
              class="flex-1 text-[10px] text-teal-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200"
            >
              <p class="font-black text-teal-950 mb-2 underline">تعليمات الإدارة:</p>
              يتم توريد الكميات الموضحة أعلاه تحت إشراف مسئول الموقع. لا يعتد بأي تعديل يدوي على هذا
              الإذن. يلزم السائق بالحفاظ على نسخة الإذن لتقديمها للمراجعة المالية عند الطلب.
            </div>

            <div class="w-80 space-y-2">
              <div
                class="flex justify-between p-2 text-xs font-bold text-teal-800 bg-teal-50 rounded-lg"
              >
                <span>إجمالي تشغيل الملاك:</span>
                <span>{{ formatCurrency(calculateTotalOwners()) }}</span>
              </div>
              <div
                class="flex justify-between p-2 text-xs font-bold text-teal-800 bg-teal-50 rounded-lg"
              >
                <span>إجمالي مواد المورد:</span>
                <span>{{ formatCurrency(order.target_quantity * order.material_unit_price) }}</span>
              </div>
              <div
                class="flex justify-between bg-teal-700 text-white p-4 rounded-2xl font-black text-xl shadow-lg border-b-4 border-teal-900"
              >
                <span>الإجمالي العام:</span>
                <span>{{ formatCurrency(calculateGrandTotal()) }}</span>
              </div>
            </div>
          </div>

          <div
            class="grid grid-cols-3 gap-10 text-center text-[10px] font-black uppercase text-teal-950 mt-12"
          >
            <div class="space-y-6">
              <p class="tracking-widest">توقيع المستلم / السائق</p>
              <div class="border-b-2 border-dashed border-teal-200 mx-10"></div>
            </div>
            <div class="space-y-6">
              <p class="tracking-widest">اعتماد مسئول الموقع</p>
              <div class="border-b-2 border-dashed border-teal-200 mx-10"></div>
            </div>
            <div class="space-y-6">
              <p class="tracking-widest">المراجعة والاعتماد المالي</p>
              <div class="border-b-2 border-dashed border-teal-200 mx-10"></div>
            </div>
          </div>
        </div>

        <footer
          class="mt-auto pt-6 flex justify-between items-center text-[9px] text-teal-300 border-t border-teal-50 font-bold uppercase"
        >
          <div>Operational Management System v4.0</div>
          <div class="bg-teal-50 px-4 py-1 rounded-full text-teal-500 italic">
            تم الاستخراج بواسطة: {{ authStore.user?.name }} -
            {{ new Date().toLocaleString('ar-SA') }}
          </div>
          <div>صفحة 01 / 01</div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDispatchOrderStore } from '@/stores/dispatchOrderStore'
import { useAuthStore } from '@/stores/authStore'
import { formatCurrency, formatDate } from '@/utils/formatters'

const route = useRoute()
const dispatchOrderStore = useDispatchOrderStore()
const authStore = useAuthStore()

const { currentOrder: order, loading } = storeToRefs(dispatchOrderStore)
const window = globalThis.window

// حساب إجمالي الملاك برمجياً
const calculateTotalOwners = () => {
  if (!order.value?.trips) return 0
  return order.value.trips.reduce(
    (sum, t) => sum + Number(t.quantity || 0) * Number(t.transport_unit_price || 0),
    0,
  )
}

// حساب الإجمالي الكلي برمجياً
const calculateGrandTotal = () => {
  const materialTotal =
    Number(order.value?.target_quantity || 0) * Number(order.value?.material_unit_price || 0)
  return calculateTotalOwners() + materialTotal
}

const fetchOrderDetails = async () => {
  const orderId = route.params.id
  if (!orderId) return
  try {
    await dispatchOrderStore.fetchOrder(orderId)
    // طباعة تلقائية بعد ثانية لضمان رندر الجرافيكس الملونة
    if (order.value) {
      setTimeout(() => {
        window.print()
      }, 1000)
    }
  } catch (err) {
    console.error('خطأ في جلب بيانات الطباعة:', err)
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
/* استيراد خط تجول العربي الفخم */
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');

* {
  font-family: 'Tajawal', sans-serif;
}

/* إعدادات الطباعة المتقدمة A4 */
@media print {
  @page {
    margin: 5mm; /* هوامش صغيرة جداً للورقة */
    size: A4 portrait;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background-color: white;
  }
  /* اخفاء أزرار التكم */
  .print\:hidden {
    display: none !important;
  }
  /* ضمان عدم فصل التواقيع عن التلخيص المالي */
  .break-inside-avoid {
    page-break-inside: avoid;
  }
}

/* تنسيقات إضافية للجدول لزيادة الوضوح والفخامة */
table thead th {
  border-bottom: 2px solid #0f172a;
} /* Slate-900 border for strong header separation */
table tbody tr:last-child {
  border-bottom: none;
}
table font-black {
  font-weight: 900;
}
</style>
