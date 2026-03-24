<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-white">إدارة أوامر التشغيل (أذونات الخروج)</h1>
      <AppButton v-if="authStore.can('dispatch_order.create')" @click="openModal()">
        إضافة إذن جديد
      </AppButton>
    </div>

    <DispatchOrdersFilter
      v-model:searchQuery="searchQuery"
      v-model:projectId="projectIdFilter"
      v-model:status="statusFilter"
      @filter-changed="onFilterChanged"
    />

    <DispatchOrdersTable
      :orders="dispatchOrders"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @edit-order="openModal"
      @delete-order="openDeleteDialog"
      @print-order="handlePrintOrder"
    />

    <DispatchOrderModal
      v-if="isModalOpen"
      :is-open="isModalOpen"
      :order="selectedOrder"
      @close="isModalOpen = false"
      @saved="handlePageChange(pagination?.current_page || 1)"
    />

    <AppConfirmDialog
      v-model="isDeleteDialogOpen"
      title="تأكيد حذف أمر التشغيل"
      :message="`هل أنت متأكد من رغبتك في حذف إذن التشغيل رقم '${orderToDelete?.order_no}'؟`"
      @confirmed="deleteSelectedOrder"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDispatchOrderStore } from '@/stores/dispatchOrderStore'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useToast } from 'vue-toastification'

// استيراد المكونات
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import DispatchOrdersFilter from './DispatchOrdersFilter.vue'
import DispatchOrdersTable from './DispatchOrdersTable.vue'
import DispatchOrderModal from './DispatchOrderModal.vue'

// إدارة الحالة
const dispatchOrderStore = useDispatchOrderStore()
const authStore = useAuthStore()
const { dispatchOrders, loading, pagination } = storeToRefs(dispatchOrderStore)
const toast = useToast()
const router = useRouter()
// فلاتر البحث
const searchQuery = ref('')
const projectIdFilter = ref('')
const statusFilter = ref('')
let searchTimeout = null

// دالة البحث مع Debounce
const onFilterChanged = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handlePageChange(1) // العودة للصفحة الأولى عند تغيير أي فلتر
  }, 500)
}

// دالة جلب البيانات
const handlePageChange = async (page = 1) => {
  const filters = {
    project_id: projectIdFilter.value,
    status: statusFilter.value,
  }

  try {
    await dispatchOrderStore.fetchOrders(page, searchQuery.value, filters)
  } catch (error) {
    toast.error('حدث خطأ أثناء جلب بيانات أوامر التشغيل.')
  }
}

onMounted(() => {
  handlePageChange()
})

// معالجة فتح نافذة الإضافة/التعديل
const isModalOpen = ref(false)
const selectedOrder = ref(null)

const openModal = (order = null) => {
  if (order && !authStore.can('dispatch_order.update')) {
    toast.error('ليس لديك الصلاحية لتعديل أمر التشغيل هذا.')
    return
  }
  selectedOrder.value = order ? { ...order } : null
  isModalOpen.value = true
}

// معالجة الحذف
const isDeleteDialogOpen = ref(false)
const orderToDelete = ref(null)

const openDeleteDialog = (order) => {
  if (!authStore.can('dispatch_order.delete')) {
    toast.error('ليس لديك الصلاحية لحذف أمر التشغيل.')
    return
  }
  orderToDelete.value = order
  isDeleteDialogOpen.value = true
}

const deleteSelectedOrder = async () => {
  if (orderToDelete.value) {
    try {
      await dispatchOrderStore.deleteOrder(orderToDelete.value.id)
      toast.success(`تم حذف إذن التشغيل رقم '${orderToDelete.value.order_no}' بنجاح.`)

      // العودة للصفحة السابقة إذا تم حذف آخر عنصر في الصفحة الحالية
      if (dispatchOrders.value.length === 1 && pagination.value.current_page > 1) {
        await handlePageChange(pagination.value.current_page - 1)
      } else {
        await handlePageChange(pagination.value.current_page)
      }
    } catch (error) {
      const errorMessage =
        dispatchOrderStore.error || error.response?.data?.message || 'فشل حذف إذن التشغيل.'
      toast.error(errorMessage)
    } finally {
      isDeleteDialogOpen.value = false
      orderToDelete.value = null
    }
  }
}

// معالجة الطباعة
const handlePrintOrder = (order) => {
  if (!order || !order.id) {
    toast.error('بيانات الإذن غير صالحة للطباعة.')
    return
  }

  // توليد مسار صفحة الطباعة
  const routeData = router.resolve({
    name: 'PrintDispatchOrder',
    params: { id: order.id },
  })

  // فتح الصفحة في تبويب جديد
  window.open(routeData.href, '_blank')
}
</script>
