import { defineStore } from 'pinia'
import { ref } from 'vue'
import reportService from '@/services/ReportService'

export const useReportStore = defineStore('report', () => {
  // --- States ---
  const suppliersSummary = ref(null)
  const supplierStatement = ref(null)
  const machineryOwnerStatement = ref(null)
  const projectsReport = ref(null)

  const loading = ref(false)
  const error = ref(null)

  // وظيفة مساعدة لتصفير الأخطاء والبدء في التحميل
  const startLoading = () => {
    loading.value = true
    error.value = null
  }

  // 1. جلب ملخص الموردين العام
  async function fetchSuppliersSummary() {
    startLoading()
    try {
      const response = await reportService.getSuppliersSummary()
      // لارافيل يرجع response()->json([...]) لذا نأخذ response.data مباشرة
      suppliersSummary.value = response.data
    } catch (err) {
      error.value = 'فشل في جلب ملخص الموردين.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 2. جلب كشف حساب مورد (نظام التوريدات والمالية الجديد)
  async function fetchSupplierStatement(supplierId) {
    startLoading()
    supplierStatement.value = null // تصفير إجباري لضمان تحديث الواجهة
    try {
      const response = await reportService.getSupplierStatement(supplierId)

      // نتحقق من وجود البيانات المطلوبة قبل الإسناد
      if (response.data && response.data.details) {
        supplierStatement.value = response.data
      } else {
        error.value = 'البيانات المستلمة غير مكتملة.'
      }
    } catch (err) {
      error.value = 'فشل في جلب كشف حساب المورد.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 3. جلب كشف حساب صاحب آلية (نظام الحشر والعمل الميداني)
  async function fetchMachineryOwnerStatement(ownerId) {
    startLoading()
    machineryOwnerStatement.value = null // تصفير إجباري
    try {
      const response = await reportService.getMachineryOwnerStatement(ownerId)

      // في الـ Controller نستخدم response()->json مباشرة، لذا نأخذ response.data
      // إذا كان الكنترولر يلف البيانات في resource، نستخدم response.data.data
      const data = response.data.data || response.data

      if (data && data.details) {
        machineryOwnerStatement.value = data
      } else {
        error.value = 'لم يتم العثور على سجلات لهذا المالك.'
      }
    } catch (err) {
      error.value = 'فشل في جلب كشف حساب صاحب الآلية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // 4. جلب تقرير المشاريع
  async function fetchProjectsReport(filters = {}) {
    startLoading()
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
