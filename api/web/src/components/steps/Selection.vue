<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <svg class='icon fl ml12 mt3 mr12'><use xlink:href='#icon-cursor'/></svg>
        Selection
        <button @click='submit' v-if='!disabled' class='fr btn btn--stroke btn--s color-gray color-green-on-hover round mr12'>Submit</button>
    </div>
    <template v-if='loading.submit'>
        <Loading desc='Submitting Step'/>
    </template>
    <template v-else>
        <div class='col col--12'>
            <span class='ml12' v-text='step.step.title || "Select from the following:"'/>
        </div>
        <div class='col col--12 grid border border--gray-light round mx12'>
            <div @click='selection = sel.name' :key='sel.id' v-for='sel in step.step.selections' class='col col--12 bg-darken10-on-hover' :class='{
                "cursor-pointer": !disabled
            }'>
                <div class='w-full py6 px6' :class='{
                    "bg-gray-light": selection === sel.name
                }'>
                    <span class='txt-h4 round' v-text='sel.name'/>
                </div>
            </div>
        </div>
    </template>
</div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'StepSelection',
    props: {
        step: Object,
        disabled: Boolean
    },
    mounted: function() {
        if (this.step.step.selection) this.selection = this.step.step.selection;
    },
    data: function() {
        return {
            loading: {
                submit: false
            },
            selection: null
        }
    },
    methods: {
        submit: async function() {
            if (!this.selection) return;

            try {
                this.loading.submit = true;
                await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}`, {
                    method: 'PATCH',
                    body: {
                        step: {
                            selection: this.selection
                        }
                    }
                });
                this.loading.submit = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading
    }
}
</script>
