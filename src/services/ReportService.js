//src\services\ReportService.js
import apiClient from './apiClient'

const resource = '/reports'

export default {
  // 1. تقرير ملخص الموردين (إجمالي الأرصدة وحجم التعاملات)
  getSuppliersSummary() {
    return apiClient.get(`${resource}/suppliers-summary`)
  },

  // 2. كشف حساب مورد محدد (يجلب أوامر التشغيل والدفعات المالية)
  getSupplierStatement(supplierId) {
    // نمرر الـ ID الخاص بالمورد في الرابط
    return apiClient.get(`${resource}/suppliers/${supplierId}/statement`)
  },

  // 3. كشف حساب صاحب آلية محدد (أرباح آلياته والدفعات التي استلمها)
  getMachineryOwnerStatement(ownerId) {
    return apiClient.get(`${resource}/machinery-owners/${ownerId}/statement`)
  },

  // 4. تقرير المشاريع المفلترة (حسب الحالة، وتاريخ البداية والنهاية)
  getProjectsReport(filters = {}) {
    return apiClient.get(`${resource}/projects`, {
      params: filters, // سيرسل مثلاً: ?status=active&start_date=2024-01-01
    })
  },
}
