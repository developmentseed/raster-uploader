<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix py6 relative'>
            Uploads

            <div class='fr'>
                <label class='switch-container px6'>
                    <span class='mr6'>Archived</span>
                    <input v-model='archived' type='checkbox' />
                    <div class='switch'></div>
                </label>

                <button @click='showSearch = !showSearch' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-search'/></svg>
                </button>
                <button @click='refresh' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>
                <button @click='$router.push({ name: "newupload" })' class='btn round btn--stroke color-gray color-green-on-hover'>
                    <svg class='icon'><use href='#icon-plus'/></svg>
                </button>
            </div>
        </div>
        <div class='border border--gray-light round mb60 relative'>
            <RasterMenu/>

            <template v-if='showSearch'>
                <div class='col col--12 px24 py6'>
                    <div class='relative'>
                        <div class='absolute flex flex--center-cross flex--center-main w36 h36'>
                            <svg class='icon'><use xlink:href='#icon-search'></use></svg>
                        </div>
                        <input ref='search' v-model='search' class='input pl36' placeholder='Upload Name'>
                    </div>
                </div>
            </template>
            <template v-if='loading.uploads'>
                <Loading desc='Loading Uploads'/>
            </template>
            <template v-else-if='uploads.length === 0'>
                <None name='Uploads'/>
            </template>
            <template v-else>
                <div :key='upload.id' v-for='upload in uploads.slice(page * 10, page * 10 + 10)'>
                    <UploadItem :upload='upload'/>
                </div>

                <Pager
                    @page='page = $event'
                    :total='uploads.length'
                    perpage='10'
                />
            </template>
        </div>
    </div>
</template>

<script>
import Pager from './util/Pager.vue';
import UploadItem from './util/UploadItem.vue';
import Loading from './util/Loading.vue';
import None from './util/None.vue';
import RasterMenu from './util/Menu.vue';

export default {
    name: 'Home',
    props: ['meta'],
    data: function() {
        return {
            page: 0,
            showSearch: false,
            search: '',
            archived: false,
            uploads: [],
            loading: {
                uploads: true
            }
        }
    },
    mounted: function() {
        this.refresh();

        window.addEventListener('keydown', (e) => {
            if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
                e.preventDefault();
                this.showSearch = true;
                this.$refs.search.focus()
            } else if (e.keyCode === 27) {
                e.preventDefault();
                this.showSearch = false;
            }
        })
    },
    watch: {
        showSearch: function() {
            if (!this.showSearch) this.search = '';

            this.$nextTick(() => {
                if (this.showSearch) this.$refs.search.focus()
            });
        },
        search: function() {
            this.refresh();
        },
        archived: function() {
            this.refresh();
        }
    },
    methods: {
        refresh: function() {
            this.page = 0;
            this.getUploads();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getUploads: async function() {
            this.loading.uploads = true;
            this.uploads = [];

            try {
                const url = new URL('/api/upload', window.api);
                url.searchParams.append('filter', this.search);
                url.searchParams.append('archived', this.archived);
                const uploads = await window.std(url);

                this.uploads = uploads.uploads;
                this.loading.uploads = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading,
        RasterMenu,
        UploadItem,
        Pager,
        None
    }
}
</script>
