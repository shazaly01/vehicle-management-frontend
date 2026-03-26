import api from './apiClient' // تأكد من أن هذا المسار يطابق إعداد الـ axios لديك

export default {
  /**
   * جلب قائمة الأوامر الرئيسية (مع الفلترة والبحث)
   */
  get(page = 1, search = '', filters = {}) {
    return api.get('/dispatch_orders', {
      params: {
        page,
        search,
        ...filters, // يدمج أي فلاتر إضافية مثل project_id أو status
      },
    })
  },

  /**
   * عرض تفاصيل أمر رئيسي محدد (سيجلب معه الحركات التابعة له من الباك-إند)
   */
  find(id) {
    return api.get(`/dispatch_orders/${id}`)
  },

  /**
   * إنشاء أمر رئيسي (عقد) جديد
   */
  create(payload) {
    return api.post('/dispatch_orders', payload)
  },

  /**
   * تحديث بيانات أمر رئيسي
   */
  update(id, payload) {
    // نستخدم _method: 'PUT' إذا كنا نرسل FormData، أو نستخدم api.put مباشرة للـ JSON
    return api.put(`/dispatch_orders/${id}`, payload)
  },

  /**
   * حذف أمر رئيسي
   */
  delete(id) {
    return api.delete(`/dispatch_orders/${id}`)
  },
}
