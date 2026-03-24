//src\stores\reportStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportService from '@/services/ReportService'

export const useReportStore = defineStore('report', () => {
  // --- States لكل تقرير على حدة ---
  const suppliersSummary = ref(null)
  const supplierStatement = ref(null)
  const machineryOwnerStatement = ref(null)
  const projectsReport = ref(null)

  const loading = ref(false)
  const error = ref(null)

  // 1. جلب ملخص الموردين
  async function fetchSuppliersSummary() {
    loading.value = true
    error.value = null
    try {
      const response = await reportService.getSuppliersSummary()
      suppliersSummary.value = response.data
    } catch (err) {
      error.value = 'فشل في جلب ملخص الموردين.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 2. جلب كشف حساب مورد محدد
  async function fetchSupplierStatement(supplierId) {
    loading.value = true
    error.value = null
    supplierStatement.value = null // تصفير الكشف القديم
    try {
      const response = await reportService.getSupplierStatement(supplierId)
      supplierStatement.value = response.data
    } catch (err) {
      error.value = 'فشل في جلب كشف حساب المورد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 3. جلب كشف حساب صاحب آلية محدد
  // جلب كشف حساب صاحب آلية محدد
  async function fetchMachineryOwnerStatement(ownerId) {
    loading.value = true
    error.value = null
    machineryOwnerStatement.value = null // تصفير القديم
    try {
      const response = await reportService.getMachineryOwnerStatement(ownerId)

      // جرب تغييرها إلى .data.data إذا كنت تستخدم Resources في لارافيل
      // أو اتركها .data إذا كنت ترجع response()->json([...]) مباشرة
      machineryOwnerStatement.value = response.data.data || response.data

      console.log('البيانات المستلمة في الستور:', machineryOwnerStatement.value) // للتأكد
    } catch (err) {
      error.value = 'فشل في جلب كشف حساب صاحب الآلية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 4. جلب تقرير المشاريع (مع دعم الفلاتر)
  async function fetchProjectsReport(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await reportService.getProjectsReport(filters)
      projectsReport.value = response.data
    } catch (err) {
      error.value = 'فشل في جلب تقرير المشاريع.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return {
    suppliersSummary,
    supplierStatement,
    machineryOwnerStatement,
    projectsReport,
    loading,
    error,
    fetchSuppliersSummary,
    fetchSupplierStatement,
    fetchMachineryOwnerStatement,
    fetchProjectsReport,
  }
})
