import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import UnitView from '../views/UnitView.vue'
import UnitForm from '../views/UnitForm.vue'
import UsersView from '../views/UsersView.vue'
import UserForm from '../views/UserForm.vue'
import KendaraanView from '../views/KendaraanView.vue'
import JadwalServiceView from '../views/JadwalServiceView.vue'
import KeluhanView from '../views/KeluhanView.vue'
import KeluhanForm from '../views/KeluhanForm.vue'
import KendaraanForm from '../views/KendaraanForm.vue'
import JadwalServiceForm from '../views/JadwalServiceForm.vue'
import SparepartView from '../views/SparepartView.vue'
import GantiSparepartView from '../views/GantiSparepartView.vue'
import GantiSparepartForm from '../views/GantiSparepartForm.vue'
import EmisiKarbonView from '../views/EmisiKarbonView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/unit', name: 'unit', component: UnitView },
    { path: '/unit/tambah', name: 'unit-tambah', component: UnitForm },
    { path: '/kendaraan/tambah', name: 'kendaraan-tambah', component: KendaraanForm },
    { path: '/kendaraan/edit/:id', name: 'kendaraan-edit', component: KendaraanForm },
    { path: '/jadwal-service/tambah', name: 'jadwal-service-tambah', component: JadwalServiceForm },
    { path: '/jadwal-service/edit/:id', name: 'jadwal-service-edit', component: JadwalServiceForm },
    { path: '/unit/edit/:id', name: 'unit-edit', component: UnitForm },
    { path: '/users', name: 'users', component: UsersView },
    { path: '/users/tambah', name: 'users-tambah', component: UserForm },
    { path: '/users/edit/:id', name: 'users-edit', component: UserForm },
    { path: '/kendaraan', name: 'kendaraan', component: KendaraanView },
    { path: '/jadwal-service', name: 'jadwal-service', component: JadwalServiceView },
    { path: '/keluhan', name: 'keluhan', component: KeluhanView },
    { path: '/keluhan/tambah', name: 'keluhan-tambah', component: KeluhanForm },
    { path: '/keluhan/edit/:id', name: 'keluhan-edit', component: KeluhanForm },
    { path: '/sparepart', name: 'sparepart', component: SparepartView },
    { path: '/ganti-sparepart', name: 'ganti-sparepart', component: GantiSparepartView },
    { path: '/ganti-sparepart/tambah', name: 'ganti-sparepart-tambah', component: GantiSparepartForm },
    { path: '/ganti-sparepart/edit/:id', name: 'ganti-sparepart-edit', component: GantiSparepartForm },
    { path: '/emisi-karbon', name: 'emisi-karbon', component: EmisiKarbonView },
  ],
})

export default router