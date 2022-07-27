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
                        <label>Schedule Cron</label>
                        <input v-model='schedule.cron' class='input' placeholder='Schedule Cron'/>

                        <template v-if='errors.cron'>
                            <InputError :desc='human'/>
                        </template>
                        <template v-else>
                            <span v-text='human'/>
                        </template>
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

            <template v-if='$route.params.scheduleid'>
                <h2 class='mb3'>Uploads</h2>
                <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
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
            </template>
        </div>
    </div>

</template>

<script>
import Loading from './util/Loading.vue';
import UploadItem from './util/UploadItem.vue';
import None from './util/None.vue';
import InputError from './util/InputError.vue';
import cron from 'cronstrue';

export default {
    name: 'Schedule',
    mounted: async function() {
        if (this.$route.params.scheduleid) {
            await this.getSchedule();
            this.setHuman();

            this.getUploads();
        } else {
            this.setHuman();
        }
    },
    data: function() {
        return {
            loading: {
                schedule: false,
                uploads: false
            },
            human: '',
            errors: {
                cron: false
            },
            uploads: {
                total: 0,
                uploads: []
            },
            schedule: {
                name: '',
                cron: '1 12 ? * MON-FRI *'
            }
        };
    },
    watch: {
        'schedule.cron': function() {
            this.setHuman()
        }
    },
    methods: {
        setHuman: function() {
            try {
                this.errors.cron = false;
                this.human = cron.toString(this.schedule.cron)
            } catch (err) {
                this.errors.cron = true;
                this.human = String(err);
            }
        },
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
                this.schedule = await window.std(window.api + `/api/schedule${this.$route.params.scheduleid ? '/' + this.$route.params.scheduleid : ''}`, {
                    method: this.$route.params.scheduleid ? 'PATCH' : 'POST',
                    body: {
                        name: this.schedule.name,
                        cron: this.schedule.cron
                    }
                });

                if (!this.$route.params.scheduleid) {
                    this.$emit('refresh');
                    this.$router.go(-1);
                }
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.schedule = false;
        }
    },
    components: {
        None,
        Loading,
        UploadItem,
        InputError
    }
}
</script>
