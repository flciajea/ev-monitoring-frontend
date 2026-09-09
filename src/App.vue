<script setup>
import {
  RouterLink,
  RouterView,
  useRoute,
  useRouter
} from 'vue-router'

import { computed, ref } from 'vue'

import Toast from './components/Toast.vue'
import { useToast } from './composables/useToast'


// =========================
// TOAST
// =========================

const { show, message, type } = useToast()


// =========================
// ROUTER
// =========================

const route = useRoute()
const router = useRouter()


// =========================
// USER LOGIN
// =========================

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')

  if (!userData) {
    return null
  }

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
})

const role = computed(() => {
  return currentUser.value?.role?.toLowerCase() || ''
})

const isAdmin = computed(() => {
  return role.value === 'admin'
})

const isUid = computed(() => {
  return role.value === 'uid'
})

const isDriver = computed(() => {
  return role.value === 'driver'
})

const isLoginPage = computed(() => {
  return route.name === 'login'
})


// =========================
// SIDEBAR
// =========================

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)

const closeSidebar = () => {
  sidebarOpen.value = false
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}


// =========================
// LOGOUT
// =========================

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')

  sidebarOpen.value = false

  router.push('/login')
}
</script>


<template>

  <div
    id="app"
    :class="{
      'sidebar-collapsed': sidebarCollapsed
    }"
  >

    <!-- ========================= -->
    <!-- SIDEBAR -->
    <!-- ========================= -->

    <template v-if="!isLoginPage">

      <!-- MOBILE HAMBURGER -->

      <button
        class="hamburger"
        @click="sidebarOpen = !sidebarOpen"
        aria-label="Buka menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      <!-- OVERLAY MOBILE -->

      <div
        v-if="sidebarOpen"
        class="overlay"
        @click="closeSidebar"
      ></div>


      <!-- SIDEBAR -->

      <aside
        class="sidebar"
        :class="{ open: sidebarOpen }"
      >

        <!-- HEADER -->

        <div class="sidebar-header">

          <div class="brand">

            <div class="brand-icon">
              EV
            </div>

            <h1>
              EV Monitoring
            </h1>

          </div>


          <!-- COLLAPSE BUTTON -->

          <button
            class="collapse-btn"
            @click="toggleSidebar"
            :aria-label="
              sidebarCollapsed
                ? 'Buka sidebar'
                : 'Tutup sidebar'
            "
          >
            {{ sidebarCollapsed ? '›' : '‹' }}
          </button>

        </div>


        <!-- NAVIGATION -->

        <nav class="sidebar-nav">

          <!-- ========================= -->
          <!-- ADMIN -->
          <!-- ========================= -->

          <template v-if="isAdmin">

            <RouterLink
              to="/unit"
              @click="closeSidebar"
              title="Unit"
            >
              <span class="nav-icon">▣</span>
              <span class="nav-label">Unit</span>
            </RouterLink>


            <RouterLink
              to="/users"
              @click="closeSidebar"
              title="Users"
            >
              <span class="nav-icon">♙</span>
              <span class="nav-label">Users</span>
            </RouterLink>


            <RouterLink
              to="/jadwal-service"
              @click="closeSidebar"
              title="Jadwal Service"
            >
              <span class="nav-icon">▤</span>
              <span class="nav-label">Jadwal Service</span>
            </RouterLink>


            <RouterLink
              to="/keluhan"
              @click="closeSidebar"
              title="Keluhan"
            >
              <span class="nav-icon">⚠</span>
              <span class="nav-label">Keluhan</span>
            </RouterLink>


            <RouterLink
              to="/sparepart"
              @click="closeSidebar"
              title="Sparepart"
            >
              <span class="nav-icon">⚙</span>
              <span class="nav-label">Sparepart</span>
            </RouterLink>


            <RouterLink
              to="/ganti-sparepart"
              @click="closeSidebar"
              title="Ganti Sparepart"
            >
              <span class="nav-icon">↻</span>
              <span class="nav-label">Ganti Sparepart</span>
            </RouterLink>


            <RouterLink
              to="/spk"
              @click="closeSidebar"
              title="Surat Perintah Kerja"
            >
              <span class="nav-icon">▤</span>
              <span class="nav-label">Surat Perintah Kerja</span>
            </RouterLink>


            <RouterLink
              to="/emisi-karbon"
              @click="closeSidebar"
              title="Emisi Karbon"
            >
              <span class="nav-icon">♻</span>
              <span class="nav-label">Emisi Karbon</span>
            </RouterLink>

          </template>


          <!-- ========================= -->
          <!-- UID -->
          <!-- ========================= -->

          <template v-else-if="isUid">

            <RouterLink
              to="/unit"
              @click="closeSidebar"
              title="Unit"
            >
              <span class="nav-icon">▣</span>
              <span class="nav-label">Unit</span>
            </RouterLink>


            <RouterLink
              to="/users"
              @click="closeSidebar"
              title="Users"
            >
              <span class="nav-icon">♙</span>
              <span class="nav-label">Users</span>
            </RouterLink>


            <RouterLink
              to="/jadwal-service"
              @click="closeSidebar"
              title="Jadwal Service"
            >
              <span class="nav-icon">▤</span>
              <span class="nav-label">Jadwal Service</span>
            </RouterLink>


            <RouterLink
              to="/keluhan"
              @click="closeSidebar"
              title="Keluhan"
            >
              <span class="nav-icon">⚠</span>
              <span class="nav-label">Keluhan</span>
            </RouterLink>


            <RouterLink
              to="/sparepart"
              @click="closeSidebar"
              title="Sparepart"
            >
              <span class="nav-icon">⚙</span>
              <span class="nav-label">Sparepart</span>
            </RouterLink>


            <RouterLink
              to="/ganti-sparepart"
              @click="closeSidebar"
              title="Ganti Sparepart"
            >
              <span class="nav-icon">↻</span>
              <span class="nav-label">Ganti Sparepart</span>
            </RouterLink>


            <RouterLink
              to="/emisi-karbon"
              @click="closeSidebar"
              title="Emisi Karbon"
            >
              <span class="nav-icon">♻</span>
              <span class="nav-label">Emisi Karbon</span>
            </RouterLink>

          </template>


          <!-- ========================= -->
          <!-- DRIVER -->
          <!-- ========================= -->

          <template v-else-if="isDriver">

            <RouterLink
              to="/keluhan"
              @click="closeSidebar"
              title="Keluhan"
            >
              <span class="nav-icon">⚠</span>
              <span class="nav-label">Keluhan</span>
            </RouterLink>

          </template>

        </nav>


        <!-- ========================= -->
        <!-- SIDEBAR FOOTER -->
        <!-- ========================= -->

        <div class="sidebar-footer">

          <div
            v-if="currentUser"
            class="user-info"
          >

            <div class="user-avatar">
              {{
                (
                  currentUser.namaLengkap ||
                  currentUser.username ||
                  'U'
                )
                  .charAt(0)
                  .toUpperCase()
              }}
            </div>


            <div class="user-details">

              <div class="user-name">
                {{ currentUser.namaLengkap || currentUser.username }}
              </div>

              <span class="role-badge">
                {{ currentUser.role }}
              </span>

            </div>

          </div>


          <button
            @click="handleLogout"
            class="logout-btn"
            title="Logout"
          >
            <span class="logout-icon">↪</span>
            <span class="logout-label">Logout</span>
          </button>

        </div>

      </aside>

    </template>


    <!-- ========================= -->
    <!-- MAIN CONTENT -->
    <!-- ========================= -->

    <main
      :class="{
        'full-width': isLoginPage
      }"
    >
      <RouterView />
    </main>


    <!-- ========================= -->
    <!-- TOAST -->
    <!-- ========================= -->

    <Toast
      :show="show"
      :message="message"
      :type="type"
    />

  </div>

</template>


<style>

* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

body {
  margin: 0;
}

</style>


<style scoped>

#app {
  display: flex;
  min-height: 100vh;
}


/* =========================
   SIDEBAR
========================= */

.sidebar {
  width: 240px;

  background-color: #1e2a3a;

  display: flex;
  flex-direction: column;

  position: sticky;
  top: 0;

  height: 100vh;

  flex-shrink: 0;

  transition:
    width 0.25s ease;
}


/* =========================
   COLLAPSED SIDEBAR
========================= */

.sidebar-collapsed .sidebar {
  width: 72px;
}


/* =========================
   SIDEBAR HEADER
========================= */

.sidebar-header {
  min-height: 64px;

  padding: 12px 16px;

  border-bottom: 1px solid
    rgba(255, 255, 255, 0.08);

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 8px;
}

.brand {
  display: flex;
  align-items: center;

  min-width: 0;

  gap: 10px;
}

.brand-icon {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  border-radius: 9px;

  background: #4a9eeb;

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  font-weight: 800;
}

.sidebar-header h1 {
  color: white;

  font-size: 17px;
  font-weight: 700;

  margin: 0;

  white-space: nowrap;

  overflow: hidden;

  transition:
    opacity 0.2s ease,
    width 0.25s ease;
}


/* =========================
   COLLAPSE BUTTON
========================= */

.collapse-btn {
  width: 28px;
  height: 28px;

  flex-shrink: 0;

  border: none;
  border-radius: 6px;

  background:
    rgba(255, 255, 255, 0.08);

  color: #b8c4d4;

  cursor: pointer;

  font-size: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    background 0.2s,
    color 0.2s;
}

.collapse-btn:hover {
  background:
    rgba(255, 255, 255, 0.15);

  color: white;
}


/* =========================
   COLLAPSED HEADER
========================= */

.sidebar-collapsed .sidebar-header {
  justify-content: center;

  padding: 16px 10px;
}

.sidebar-collapsed .brand {
  gap: 0;
}

.sidebar-collapsed .sidebar-header h1 {
  width: 0;
  opacity: 0;
}

.sidebar-collapsed .collapse-btn {
  position: absolute;

  top: 44px;
  right: -12px;

  width: 24px;
  height: 24px;

  border-radius: 50%;

  background: #4a9eeb;

  color: white;

  z-index: 5;
}


/* =========================
   NAVIGATION
========================= */

.sidebar-nav {
  flex: 1;

  display: flex;
  flex-direction: column;

  padding: 10px 12px;

  gap: 2px;

  overflow: hidden;
}

.sidebar-nav a {
  color: #b8c4d4;

  text-decoration: none;

  font-weight: 500;
  font-size: 14px;

  padding: 8px 12px;

  border-radius: 8px;

  transition:
    background-color 0.2s,
    color 0.2s;

  display: flex;
  align-items: center;

  gap: 12px;

  min-height: 38px;
}

.sidebar-nav a:hover {
  background-color:
    rgba(74, 158, 235, 0.12);

  color: white;
}

.sidebar-nav a.router-link-active {
  background-color: #4a9eeb;

  color: white;
}

.nav-icon {
  width: 22px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 17px;
}

.nav-label {
  white-space: nowrap;

  overflow: hidden;

  transition:
    opacity 0.15s ease;
}


/* =========================
   COLLAPSED NAVIGATION
========================= */

.sidebar-collapsed .sidebar-nav {
  padding-left: 10px;
  padding-right: 10px;
}

.sidebar-collapsed .sidebar-nav a {
  justify-content: center;

  padding-left: 8px;
  padding-right: 8px;

  gap: 0;
}

.sidebar-collapsed .nav-label {
  width: 0;

  opacity: 0;
}


/* =========================
   SIDEBAR FOOTER
========================= */

.sidebar-footer {
  padding: 12px 16px;

  border-top: 1px solid
    rgba(255, 255, 255, 0.08);
}

/* =========================
   USER INFO
========================= */

.user-info {
  display: flex;
  align-items: center;

  gap: 10px;

  margin-bottom: 12px;

  min-width: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  border-radius: 50%;

  background: #4a9eeb;

  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 700;
}

.user-details {
  min-width: 0;

  overflow: hidden;

  transition:
    opacity 0.15s ease;
}

.user-name {
  color: white;

  font-size: 13px;
  font-weight: 600;

  margin-bottom: 4px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.role-badge {
  background-color: #4a9eeb;

  color: white;

  padding: 2px 9px;

  border-radius: 12px;

  font-size: 10px;
  font-weight: 600;

  text-transform: uppercase;
}


/* =========================
   COLLAPSED USER
========================= */

.sidebar-collapsed .sidebar-footer {
  padding: 12px 10px;
}

.sidebar-collapsed .user-info {
  justify-content: center;
}

.sidebar-collapsed .user-details {
  width: 0;

  opacity: 0;
}

.sidebar-collapsed .logout-btn {
  justify-content: center;

  padding-left: 8px;
  padding-right: 8px;
}


/* =========================
   LOGOUT
========================= */

.logout-btn {
  width: 100%;

  background-color:
    rgba(231, 76, 60, 0.15);

  color: #ff6b5c;

  border: none;

  padding: 9px;

  border-radius: 8px;

  cursor: pointer;

  font-weight: 600;

  font-family: inherit;

  transition:
    background-color 0.2s;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 8px;
}

.logout-btn:hover {
  background-color:
    rgba(231, 76, 60, 0.25);
}

.logout-icon {
  font-size: 17px;

  flex-shrink: 0;
}

.logout-label {
  white-space: nowrap;

  overflow: hidden;

  transition:
    opacity 0.15s ease;
}

.sidebar-collapsed .logout-label {
  width: 0;

  opacity: 0;
}


/* =========================
   MAIN
========================= */

main {
  flex: 1;

  padding: 32px 40px;

  background-color: #f7fafd;

  min-height: 100vh;

  min-width: 0;

  transition:
    padding 0.25s ease;
}

main.full-width {
  padding: 0;
}


/* =========================
   HAMBURGER
========================= */

.hamburger {
  display: none;

  position: fixed;

  top: 16px;
  left: 16px;

  z-index: 60;

  background: #1e2a3a;

  border: none;

  border-radius: 8px;

  width: 42px;
  height: 42px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 4px;

  cursor: pointer;
}

.hamburger span {
  width: 20px;
  height: 2px;

  background: white;

  border-radius: 2px;
}


/* =========================
   OVERLAY
========================= */

.overlay {
  display: none;
}


/* =========================
   RESPONSIVE
========================= */

@media (max-width: 768px) {

  .hamburger {
    display: flex;
  }


  /* Jangan gunakan collapsed
     sidebar di mobile */

  .sidebar-collapsed .sidebar {
    width: 240px;
  }


  .sidebar {
    position: fixed;

    left: -260px;
    top: 0;

    width: 240px;

    height: 100vh;

    z-index: 50;

    transition:
      left 0.25s ease;
  }


  .sidebar.open {
    left: 0;
  }


  .overlay {
    display: block;

    position: fixed;

    inset: 0;

    background:
      rgba(0, 0, 0, 0.4);

    z-index: 40;
  }


  .collapse-btn {
    display: none;
  }


  .sidebar-header {
    padding: 16px 20px;
  }


  .sidebar-header h1 {
    width: auto;
    opacity: 1;
  }


  .nav-label {
    width: auto !important;
    opacity: 1 !important;
  }


  .user-details {
    width: auto !important;
    opacity: 1 !important;
  }


  .logout-label {
    width: auto !important;
    opacity: 1 !important;
  }


  main {
    padding: 70px 16px 24px;

    width: 100%;
  }

}

</style>