<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix py6 color-white'>
            Collections

            <div class='fr'>
                <button @click='showSearch = !showSearch' class='btn round btn--stroke color-white color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-search'/></svg>
                </button>
                <button @click='refresh' class='btn round btn--stroke color-white color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>
                <button @click='$router.push({ name: "newcollection" })' class='btn round color-white btn--stroke color-green-on-hover'>
                    <svg class='icon'><use href='#icon-plus'/></svg>
                </button>
            </div>
        </div>
        <div class='round relative bg-white pb12'>
            <RasterMenu/>

            <template v-if='showSearch'>
                <div class='col col--12 px24 py6'>
                    <div class='relative'>
                        <div class='absolute flex flex--center-cross flex--center-main w36 h36'>
                            <svg class='icon'><use xlink:href='#icon-search'></use></svg>
                        </div>
                        <input ref='search' v-model='search' class='input pl36' placeholder='Collection Name'>
                    </div>
                </div>
            </template>
            <template v-if='loading.collections'>
                <Loading desc='Loading Collections'/>
            </template>
            <template v-else-if='collections.length === 0'>
                <None name='Collections'/>
            </template>
            <template v-else>
                <div @click='$router.push({ name: "collection", params: { collectionid: collection.id } })' :key='collection.id' v-for='collection in collections.slice(page * 10, page * 10 + 10)'>
                    <div class='cursor-pointer bg-darken10-on-hover col col--12 py12'>
                        <div class='col col--12 grid py6 px12'>
                            <div class='col col--6'>
                                <div class='col col--12 clearfix'>
                                    <h3 class='txt-h4 fl' v-text='collection.name'></h3>
                                </div>
                            </div>
                            <div class='col col--6'>
                                <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                                    <span v-text='new Date(collection.created).toISOString()'/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Pager
                    @page='page = $event'
                    :total='collections.length'
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
    name: 'Collections',
    props: ['meta'],
    data: function() {
        return {
            page: 0,
            showSearch: false,
            search: '',
            archived: false,
            collections: [],
            loading: {
                collections: true
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
            this.getCollections();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getCollections: async function() {
            this.loading.collections = true;

            try {
                const url = new URL('/api/collection', window.api);
                url.searchParams.append('filter', this.search);
                const collections = await window.std(url);

                this.collections = collections.collections;
                this.loading.collections = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        None,
        Loading,
        RasterMenu,
        Pager
    }
}
</script>
