<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix py6'>
            <h2 @click='$router.push({ path: "/" })' class='dropdown fl cursor-default'>
                <svg class='icon inline'><use href='#icon-chevron-down'/></svg>
                BaseMaps

                <div class='round dropdown-content color-black' style='top: 24px;'>
                    <div @click.stop='$router.push({ path: "/" })' class='round bg-gray-light-on-hover cursor-pointer px12'>Uploads</div>
                </div>
            </h2>

            <div class='fr'>
                <button @click='showSearch = !showSearch' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-search'/></svg>
                </button>
                <button @click='refresh' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>
                <button @click='$router.push({ name: "newbasemap" })' class='btn round btn--stroke color-gray color-green-on-hover'>
                    <svg class='icon'><use href='#icon-plus'/></svg>
                </button>
            </div>
        </div>
        <div class='border border--gray-light round mb60'>
            <template v-if='showSearch'>
                <div class='col col--12 px24 py6'>
                    <div class='relative'>
                        <div class='absolute flex flex--center-cross flex--center-main w36 h36'>
                            <svg class='icon'><use xlink:href='#icon-search'></use></svg>
                        </div>
                        <input ref='search' v-model='search' class='input pl36' placeholder='BaseMap Name'>
                    </div>
                </div>
            </template>
            <template v-if='loading.basemaps'>
                <Loading desc='Loading BaseMaps'/>
            </template>
            <template v-else-if='basemaps.length === 0'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>No BaseMaps Found</h1>
                </div>
            </template>
            <template v-else>
                <div @click='$router.push({ name: "basemap", params: { basemapid: basemap.id } })' :key='basemap.id' v-for='basemap in basemap.slice(page * 10, page * 10 + 10)'>
                    <div class='cursor-pointer bg-darken10-on-hover col col--12 py12'>
                        <div class='col col--12 grid py6 px12'>
                            <div class='col col--6'>
                                <div class='col col--12 clearfix'>
                                    <h3 class='txt-h4 fl' v-text='basemap.name'></h3>
                                </div>
                            </div>
                            <div class='col col--6'>
                                <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                                    <span v-text='new Date(basemap.created).toISOString()'/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Pager
                    @page='page = $event'
                    :total='basemaps.length'
                    perpage='10'
                />
            </template>
        </div>
    </div>
</template>

<script>
import Pager from './util/Pager.vue';
import Loading from './util/Loading.vue';

export default {
    name: 'BaseMaps',
    props: ['meta'],
    data: function() {
        return {
            page: 0,
            showSearch: false,
            search: '',
            archived: false,
            basemaps: [],
            loading: {
                basemaps: true
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
            this.getBaseMaps();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getBaseMaps: async function() {
            this.loading.basemaps = true;

            try {
                const url = new URL('/api/basemap', window.api);
                url.searchParams.append('filter', this.search);
                const basemaps = await window.std(url);

                this.basemaps = basemaps.basemap;
                this.loading.basemaps = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading,
        Pager
    }
}
</script>
