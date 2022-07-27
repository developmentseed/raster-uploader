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
            <template v-if='loading'>
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
        </div>
    </div>

</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Schedule',
    mounted: function() {
        if (this.$route.params.scheduleid) {
            this.getSchedule();
        }
    },
    data: function() {
        return {
            loading: false,
            errors: {
                url: false,
            },
            schedule: {
                name: '',
                cron: ''
            }
        };
    },
    methods: {
        getSchedule: async function() {
            try {
                this.loading = true;
                this.schedule = await window.std(`/api/schedule/${this.$route.params.scheduleid}`);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        deleteSchedule: async function() {
            this.loading = true;
            try {
                await window.std(window.api + `/api/schedule/${this.$route.params.scheduleid}`, {
                    method: 'DELETE'
                });
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        postSchedule: async function() {
            this.loading = true;

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
            this.loading = false;
        }
    },
    components: {
        Loading
    }
}
</script>
