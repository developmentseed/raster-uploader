<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span class='cursor-pointer txt-underline-on-hover' @click='$router.push("/schedule")'>Schedules</span>
                &gt;
                <span v-if='$route.params.scheduleid' v-text='schedule.id'/>
                <span v-else>New</span>
            </h2>

            <button @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='$route.params.scheduleid' @click='deleteSchedule' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <template v-if='loading.schedule'>
                <Loading desc='Loading Schedule'/>
            </template>
            <template v-else>
                <div class='grid grid--gut12'>
                    <div class='col col--12 py6'>
                        <label>Schedule Name</label>
                        <input v-model='schedule.name' class='input' placeholder='Schedule Name'/>
                    </div>

                    <div class='col col--12 py6'>
                        <label>Schedule Url</label>
                        <input v-model='schedule.cron' class='input' placeholder='Schedule Cron'/>
                    </div>

                    <div class='col col--12 py12'>
                        <template v-if='$route.params.scheduleid'>
                            <button @click='postSchedule' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update Schedule</button>
                        </template>
                        <template v-else>
                            <button @click='postSchedule' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Schedule</button>
                        </template>
                    </div>
                </div>
            </template>

            <div v-if='$route.params.scheduleid' class='border border--gray-light round col col--12 px12 py12 clearfix'>
                <template v-if='loading.uploads'>
                    <Loading desc='Loading Uploads'/>
                </template>
                <template v-else-if='uploads.total === 0'>
                    <None name='Uploads'/>
                </template>
                <template v-else>
                    <div :key='upload.id' v-for='upload in uploads.uploads' class='col col--12'>
                        <UploadItem :upload='upload'/>
                    </div>
                </template>
            </div>
        </div>
    </div>

</template>

<script>
import Loading from './util/Loading.vue';
import UploadItem from './util/UploadItem.vue';
import None from './util/None.vue';

export default {
    name: 'Schedule',
    mounted: function() {
        if (this.$route.params.scheduleid) {
            this.getSchedule();
            this.getUploads();
        }
    },
    data: function() {
        return {
            loading: {
                schedule: false,
                uploads: false
            },
            errors: {
                url: false,
            },
            uploads: {
                total: 0,
                uploads: []
            },
            schedule: {
                name: '',
                cron: ''
            }
        };
    },
    methods: {
        getUploads: async function() {
            try {
                this.loading.uploads = true;
                this.uploads = await window.std(`/api/upload?schedule=${this.$route.params.scheduleid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.uploads = false;
        },
        getSchedule: async function() {
            try {
                this.loading.schedule = true;
                this.schedule = await window.std(`/api/schedule/${this.$route.params.scheduleid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.schedule = false;
        },
        deleteSchedule: async function() {
            this.loading.schedule = true;
            try {
                await window.std(window.api + `/api/schedule/${this.$route.params.scheduleid}`, {
                    method: 'DELETE'
                });
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.schedule = false;
        },
        postSchedule: async function() {
            this.loading.schedule = true;

            try {
                await window.std(window.api + `/api/schedule${this.$route.params.scheduleid ? '/' + this.$route.params.scheduleid : ''}`, {
                    method: this.$route.params.scheduleid ? 'PATCH' : 'POST',
                    body: {
                        name: this.schedule.name,
                        cron: this.schedule.cron
                    }
                });

                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.schedule = false;
        }
    },
    components: {
        None,
        Loading,
        UploadItem
    }
}
</script>
