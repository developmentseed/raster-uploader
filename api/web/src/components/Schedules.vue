<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix py6'>
            <RasterMenu item='Schedules'/>

            <div class='fr'>
                <button @click='showSearch = !showSearch' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-search'/></svg>
                </button>
                <button @click='refresh' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>
                <button @click='$router.push({ name: "newschedule" })' class='btn round btn--stroke color-gray color-green-on-hover'>
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
                        <input ref='search' v-model='search' class='input pl36' placeholder='Schedule Name'>
                    </div>
                </div>
            </template>
            <template v-if='loading.schedules'>
                <Loading desc='Loading Schedules'/>
            </template>
            <template v-else-if='schedules.length === 0'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>No Schedules Found</h1>
                </div>
            </template>
            <template v-else>
                <div @click='$router.push({ name: "schedule", params: { scheduleid: schedule.id } })' :key='schedule.id' v-for='schedule in schedules.slice(page * 10, page * 10 + 10)'>
                    <div class='cursor-pointer bg-darken10-on-hover col col--12 py12'>
                        <div class='col col--12 grid py6 px12'>
                            <div class='col col--6'>
                                <div class='col col--12 clearfix'>
                                    <h3 class='txt-h4 fl' v-text='schedule.name'></h3>
                                </div>
                            </div>
                            <div class='col col--6'>
                                <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                                    <span v-text='new Date(schedule.created).toISOString()'/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Pager
                    @page='page = $event'
                    :total='schedules.length'
                    perpage='10'
                />
            </template>
        </div>
    </div>
</template>

<script>
import Pager from './util/Pager.vue';
import Loading from './util/Loading.vue';
import RasterMenu from './util/Menu.vue';

export default {
    name: 'Schedules',
    props: ['meta'],
    data: function() {
        return {
            page: 0,
            showSearch: false,
            search: '',
            archived: false,
            schedules: [],
            loading: {
                schedules: true
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
            this.getSchedules();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getSchedules: async function() {
            this.loading.schedules = true;

            try {
                const url = new URL('/api/schedule', window.api);
                url.searchParams.append('filter', this.search);
                const schedules = await window.std(url);

                this.schedules = schedules.schedules;
                this.loading.schedules = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading,
        RasterMenu,
        Pager
    }
}
</script>
