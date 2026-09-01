<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import Toast from './components/Toast.vue'
import { useToast } from './composables/useToast'

const { show, message, type } = useToast()

const route = useRoute()
const router = useRouter()

const currentUser = computed(() => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
})

const sidebarOpen = ref(false)

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const closeSidebar = () => {
  sidebarOpen.value = false
}
</script>

<template>
  <div id="app">
    <template v-if="route.name !== 'login'">
      <!-- tombol hamburger, cuma muncul di layar kecil -->
      <button class="hamburger" @click="sidebarOpen = !sidebarOpen">
        <span></span><span></span><span></span>
      </button>

      <!-- overlay gelap pas sidebar kebuka di mobile -->
      <div v-if="sidebarOpen" class="overlay" @click="closeSidebar"></div>

      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <div class="sidebar-header">
          <h1>EV Monitoring</h1>
        </div>

        <nav class="sidebar-nav">
          <RouterLink to="/unit" @click="closeSidebar">Unit</RouterLink>
          <RouterLink to="/users" @click="closeSidebar">Users</RouterLink>
          <RouterLink to="/jadwal-service" @click="closeSidebar">Jadwal Service</RouterLink>
          <RouterLink to="/keluhan">Keluhan</RouterLink>
          <RouterLink to="/sparepart">Sparepart</RouterLink>
          <RouterLink to="/ganti-sparepart">Ganti Sparepart</RouterLink>
          <RouterLink to="/emisi-karbon">Emisi Karbon</RouterLink>
        </nav>

        <div class="sidebar-footer">
          <div v-if="currentUser" class="user-info">
            <div class="user-name">{{ currentUser.namaLengkap }}</div>
            <span class="role-badge">{{ currentUser.role }}</span>
          </div>
          <button @click="handleLogout" class="logout-btn">Logout</button>
        </div>
      </aside>
    </template>

    <main :class="{ 'full-width': route.name === 'login' }">
      <RouterView />
    </main>
    <Toast :show="show" :message="message" :type="type" />
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

.overlay {
  display: none;
}

.sidebar {
  width: 240px;
  background-color: #1e2a3a;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-header h1 {
  color: white;
  font-size: 18px;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 4px;
}

.sidebar-nav a {
  color: #b8c4d4;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.2s;
}

.sidebar-nav a:hover {
  background-color: rgba(74, 158, 235, 0.12);
  color: white;
}

.sidebar-nav a.router-link-active {
  background-color: #4a9eeb;
  color: white;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.user-info {
  margin-bottom: 12px;
}

.user-name {
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.role-badge {
  background-color: #4a9eeb;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.logout-btn {
  width: 100%;
  background-color: rgba(231, 76, 60, 0.15);
  color: #ff6b5c;
  border: none;
  padding: 9px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-family: inherit;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: rgba(231, 76, 60, 0.25);
}

main {
  flex: 1;
  padding: 32px 40px;
  background-color: #f7fafd;
  min-height: 100vh;
  min-width: 0;
}

main.full-width {
  padding: 0;
}

/* ===== RESPONSIVE: layar kecil (HP/tablet) ===== */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    height: 100vh;
    z-index: 50;
    transition: left 0.25s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 40;
  }

  main {
    padding: 70px 16px 24px;
    width: 100%;
  }
}
</style>