<script lang="ts">
import fuzzysort from 'fuzzysort'
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      data: [],
      search: '',
      loading: false,
      fileName: '/@tw.json',
      folderFilter: '',
      typeFilter: '',
      sort: '',
      mode: localStorage.getItem('mode') || 'light',
    }
  },
  computed: {
    filteredData() {
      return (
        this.search.trim().length > 0
          ? fuzzysort.go(this.search.trim(), this.data ?? [], {
              keys: [
                'file',
                (obj) => obj.exports?.map((e) => e.name).join(),
                (obj) => obj.exports?.map((e) => e.text).join(),
                (obj) => obj.exports?.map((e) => e.type).join(),
                (obj) => obj.exports?.map((e) => e.parameters?.map((p) => p.name).flat()).join(),
                (obj) => obj.exports?.map((e) => e.parameters?.map((p) => p.text).flat()).join(),
                (obj) => obj.exports?.map((e) => e.parameters?.map((p) => p.type).flat()).join(),
              ],
              threshold: 0.3,
            })
          : this.data ?? []
      )
        ?.map((d) => d.obj ?? d)
        ?.filter((i) => i.file.includes(this.folderFilter) || this.folderFilter === '')
        ?.filter(
          (i) => i.exports.some((e) => e.type.includes(this.typeFilter)) || this.typeFilter === '',
        )
        ?.filter((i) => i.exports.length > 0)
        ?.sort((a, b) => {
          if (this.sort === 'asc') {
            return a.file.localeCompare(b.file)
          } else if (this.sort === 'desc') {
            return b.file.localeCompare(a.file)
          }
        })
    },
    totalFiles() {
      return this.data?.length ?? 0
    },
    totalExports() {
      return this.data?.reduce((acc, item) => acc + item.exports.length, 0) ?? 0
    },
    topLevelFolders() {
      return (
        this.data?.length > 0 &&
        this.data
          ?.map((item) => {
            return item.file?.split('/')[1]
          })
          ?.reduce((acc, item) => {
            if (!acc.includes(item) && item !== '@tw') {
              acc.push(item)
            }
            return acc
          }, [])
      )
    },
    availableTypes() {
      return (
        this.data?.length > 0 &&
        this.data
          ?.map((item) => {
            return item.exports?.map((e) => e.type)
          })
          ?.reduce((acc, item) => {
            item.forEach((type) => {
              if (!acc.includes(type) && type.length > 0 && type.length < 30) {
                acc.push(type)
              }
            })
            return acc
          }, [])
      )
    },
    hasFilterOrSearch() {
      return (
        this.search.trim().length > 0 ||
        this.folderFilter !== '' ||
        this.typeFilter !== '' ||
        this.sort !== ''
      )
    },
    modeEmoji() {
      return this.mode === 'light' ? '🌝' : '🌚'
    },
  },
  mounted() {
    this.getData()
    this.setModeOnHTML()
  },
  methods: {
    getData() {
      this.loading = true
      fetch(this.fileName)
        .then((res) => res.json())
        .then((data) => {
          this.data = data
        })
        .finally(() => {
          this.loading = false
        })
    },
    reset() {
      this.search = ''
      this.folderFilter = ''
      this.typeFilter = ''
      this.sort = ''
    },
    toggleMode() {
      this.mode = this.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('mode', this.mode)
      this.setModeOnHTML()
    },
    setModeOnHTML() {
      if (this.mode === 'dark') {
        document.querySelector('html')?.classList.add('dark')
      } else {
        document.querySelector('html')?.classList.remove('dark')
      }
    },
  },
})
</script>

<template>
  <nav>
    <h1><img src="/whale-icon.svg" />TW Helper Directory</h1>
    <div>
      <h2>
        <i aria-label="Light/Dark Mode" @click="toggleMode">{{ modeEmoji }}</i>
      </h2>
    </div>
  </nav>
  <h3 class="results" v-if="loading">Loading...</h3>
  <h3 class="results" v-else>
    <span>{{ totalFiles }} Files – {{ totalExports }} Exports</span>
    <span v-if="hasFilterOrSearch">{{ filteredData.length }} Results</span>
  </h3>
  <div class="inputs">
    <input type="text" v-model="search" placeholder="Search using fuzzysort" />
    <select v-model="folderFilter">
      <option value="">All Folders</option>
      <option v-for="folder in topLevelFolders" :value="folder">{{ folder }}</option>
    </select>
    <select v-model="typeFilter">
      <option value="">All Types</option>
      <option v-for="t in availableTypes" :value="t">{{ t }}</option>
    </select>
    <select v-model="sort">
      <option value="">Sort Initial</option>
      <option value="asc">Ascending</option>
      <option value="desc">Descending</option>
    </select>
    <button v-if="hasFilterOrSearch" @click="reset">Reset</button>
  </div>
  <div class="item-wrapper" v-if="loading">
    <div class="item"><h3 class="no-margin">Loading...</h3></div>
  </div>
  <div class="item-wrapper" v-else>
    <div class="item" v-for="item in filteredData" :key="item">
      <h3>{{ item.file }}</h3>
      <div v-for="file in item.exports" :key="file">
        <p class="code" :hover-tooltip="file.text.trim()" tooltip-position="bottom">
          [{{ file.type }}] <strong>{{ file.name }}</strong>
        </p>
        <ul v-if="file.parameters">
          <li v-for="param in file.parameters" :key="param">
            <p class="code" :hover-tooltip="file.text.trim()" tooltip-position="bottom">
              [{{ param.type }}] <strong>{{ param.name }}</strong>
            </p>
          </li>
        </ul>
      </div>
    </div>
    <div class="item" v-if="!filteredData.length"><h3 class="no-margin">No data found</h3></div>
  </div>
</template>
