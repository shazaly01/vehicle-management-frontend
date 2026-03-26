import api from './apiClient' // تأكد من تطابق مسار ملف إعداد axios

export default {
  /**
   * جلب قائمة الحركات (يمكن تمرير dispatch_order_id في الـ params لفلترتها)
   */
  get(params = {}) {
    return api.get('/dispatch_order_trips', { params })
  },

  /**
   * عرض تفاصيل حركة محددة
   */
  find(id) {
    return api.get(`/dispatch_order_trips/${id}`)
  },

  /**
   * إضافة حركة (نقلة) جديدة تابعة لأمر تشغيل
   */
  create(payload) {
    return api.post('/dispatch_order_trips', payload)
  },

  /**
   * تحديث حالة الحركة (دورة الاعتماد: loaded, delivered)
   * نستخدم PATCH لأننا نحدث حقلاً واحداً فقط
   */
  updateStatus(id, status) {
    return api.patch(`/dispatch_order_trips/${id}/status`, { status })
  },

  /**
   * حذف حركة محددة
   */
  delete(id) {
    return api.delete(`/dispatch_order_trips/${id}`)
  },
}
