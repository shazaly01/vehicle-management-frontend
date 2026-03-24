import apiClient from './apiClient'

const resource = '/dispatch_orders'

export default {
  get(page = 1, search = '', filters = {}) {
    return apiClient.get(resource, {
      params: {
        page: page,
        search: search,
        ...filters,
      },
    })
  },

  find(id) {
    return apiClient.get(`${resource}/${id}`)
  },

  create(payload) {
    return apiClient.post(resource, payload)
  },

  update(id, payload) {
    return apiClient.put(`${resource}/${id}`, payload)
  },

  delete(id) {
    return apiClient.delete(`${resource}/${id}`)
  },
}
