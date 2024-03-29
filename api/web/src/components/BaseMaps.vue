<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix py6'>
            <span class='color-white'>Basemaps</span>

            <div class='fr'>
                <StdButton v-tooltip='"Search Basemaps"' @click='showSearch = !showSearch' icon='search'/>
                <StdButton v-tooltip='"Refresh Basemaps"' @click='refresh' icon='refresh'/>
                <StdButton v-tooltip='"Create Basemap"' @click='$router.push({ name: "newbasemap" })' hover='green' icon='plus'/>
            </div>
        </div>
        <div class='bg-white round relative pb12'>
            <RasterMenu/>

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
                <None name='BaseMaps'/>
            </template>
            <template v-else>
                <div @click='$router.push({ name: "basemap", params: { basemapid: basemap.id } })' :key='basemap.id' v-for='basemap in basemaps.slice(page * 10, page * 10 + 10)'>
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
import None from './util/None.vue';
import Loading from './util/Loading.vue';
import RasterMenu from './util/Menu.vue';

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
        RasterMenu,
        Pager,
        None
    }
}
</script>
