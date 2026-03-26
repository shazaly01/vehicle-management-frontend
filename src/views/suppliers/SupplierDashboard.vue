<template>
  <div class="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
    <header
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-border pb-6"
    >
      <div>
        <h1 class="text-2xl font-extrabold text-white">مرحباً، {{ authStore.user?.full_name }}</h1>
        <p class="text-gray-500 text-sm mt-1">إدارة شحنات التوريد والعمليات الجارية</p>
      </div>

      <transition name="fade" mode="out-in">
        <div
          v-if="waitingCount > 0"
          :key="'w'"
          class="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl border border-amber-500/20 flex items-center gap-2"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span class="font-bold text-xs">{{ waitingCount }} بانتظار الشحن</span>
        </div>
        <div
          v-else
          :key="'d'"
          class="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2 text-xs font-bold"
        >
          تم إنجاز المهام ✅
        </div>
      </transition>
    </header>

    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-5">
      <div
        v-for="trip in trips"
        :key="trip.id"
        class="bg-surface-section border border-surface-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-amber-500/30 transition-all group"
      >
        <div
          class="bg-gray-800/50 px-5 py-2.5 flex justify-between items-center border-b border-surface-border/50"
        >
          <div class="flex items-center gap-3">
            <span class="text-[10px] font-black text-gray-500 uppercase tracking-tighter"
              >إذن رقم:</span
            >
            <span class="text-white font-mono font-bold text-sm">{{
              trip.dispatch_order?.order_no || trip.id
            }}</span>
          </div>
          <span
            :class="statusClasses(trip.status)"
            class="text-[9px] px-2 py-0.5 rounded-md font-black uppercase shadow-sm"
          >
            {{ statusLabel(trip.status) }}
          </span>
        </div>

        <div class="p-5 md:p-6 flex flex-col lg:flex-row gap-6">
          <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4">
            <div class="space-y-1">
              <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                جهة التوريد
              </p>
              <p class="text-white text-sm font-bold truncate">
                {{ trip.dispatch_order?.supplier_name || 'مورد عام' }}
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                المشروع المستلم
              </p>
              <p class="text-white text-sm font-bold truncate">
                {{ trip.dispatch_order?.project_name || 'غير محدد' }}
              </p>
            </div>

            <div class="space-y-1">
              <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                نوع العملية
              </p>
              <p class="text-amber-500 text-sm font-black">
                {{ trip.dispatch_order?.operation_type_label || 'توريد' }}
              </p>
            </div>

            <div class="space-y-1 col-span-2 md:col-span-1">
              <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                الشاحنة والسائق
              </p>
              <p class="text-gray-200 text-sm font-bold truncate">
                {{ trip.machinery?.plate_number_or_name }}
              </p>
              <p class="text-gray-500 text-[11px]">{{ trip.driver?.name }}</p>
            </div>

            <div
              class="col-span-2 bg-gray-900/40 rounded-xl p-3 flex items-center gap-6 border border-gray-800/50"
            >
              <div>
                <p class="text-[9px] text-amber-500/70 font-black uppercase mb-0.5">سعر التوريد</p>
                <p class="text-white font-black text-lg">
                  {{ trip.transport_unit_price }}
                  <small class="text-[10px] text-gray-500">ج.م</small>
                </p>
              </div>
              <div v-if="trip.owner_unit_price" class="border-r border-gray-700 pr-5">
                <p class="text-[9px] text-gray-500 font-black uppercase mb-0.5">سعر المالك</p>
                <p class="text-gray-400 font-black text-lg">
                  {{ trip.owner_unit_price }} <small class="text-[10px] text-gray-600">ج.م</small>
                </p>
              </div>
            </div>
          </div>

          <div
            class="lg:w-64 flex flex-col justify-center items-stretch gap-3 border-t lg:border-t-0 lg:border-r border-surface-border/50 pt-5 lg:pt-0 lg:pr-6"
          >
            <button
              v-if="trip.status === 'dispatched'"
              @click="handleStatusUpdate(trip, 'loaded')"
              :disabled="updatingId === trip.id"
              class="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-900/20 active:scale-[0.98]"
            >
              <span
                v-if="updatingId === trip.id"
                class="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
              ></span>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" stroke-width="4" />
              </svg>
              تأكيد الشحن
            </button>

            <div v-else-if="trip.status === 'loaded'" class="space-y-3">
              <div
                class="w-full bg-blue-500/10 text-blue-400 py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-sm border border-blue-500/20 shadow-inner"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  />
                </svg>
                تم تأكيد الشحن
              </div>
              <button
                @click="handleStatusUpdate(trip, 'dispatched')"
                :disabled="updatingId === trip.id"
                class="w-full text-[11px] text-gray-500 hover:text-rose-400 font-bold transition-all underline underline-offset-4 decoration-gray-800"
              >
                {{ updatingId === trip.id ? 'جاري التراجع...' : 'رجوع للحالة السابقة' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useDispatchOrderStore } from '@/stores/dispatchOrderStore'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const dispatchOrderStore = useDispatchOrderStore()
const toast = useToast()

const trips = ref([])
const loading = ref(true)
const updatingId = ref(null)

const waitingCount = computed(() => trips.value.filter((t) => t.status === 'dispatched').length)

const fetchMyTrips = async () => {
  loading.value = true
  try {
    await dispatchOrderStore.fetchTrips({ status: 'dispatched,loaded' })
    trips.value = dispatchOrderStore.trips
  } catch (error) {
    toast.error('فشل تحديث قائمة التوريد')
  } finally {
    loading.value = false
  }
}

const handleStatusUpdate = async (trip, newStatus) => {
  updatingId.value = trip.id
  try {
    await dispatchOrderStore.updateTripStatus(trip.id, newStatus)
    const target = trips.value.find((t) => t.id === trip.id)
    if (target) target.status = newStatus
    toast.success(newStatus === 'loaded' ? 'تم إثبات الشحن بنجاح' : 'تم الرجوع للحالة السابقة')
  } catch (error) {
    toast.error('عذراً، لم ينجح التحديث')
  } finally {
    updatingId.value = null
  }
}

const statusLabel = (status) => {
  const labels = { dispatched: 'في انتظارك', loaded: 'تم الشحن', delivered: 'تم التسليم' }
  return labels[status] || status
}

const statusClasses = (status) => {
  const map = {
    dispatched: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    loaded: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    delivered: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  }
  return map[status] || 'bg-gray-800 text-gray-400'
}

onMounted(fetchMyTrips)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
