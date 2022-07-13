<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <svg class='icon fl mx12 mt3'><use xlink:href='#icon-cursor'/></svg>
        Variable Selection

        <template v-if='step.closed'>
            <button
                @click='folded = !folded'
                class='fr btn btn--stroke btn--s color-gray color-black-on-hover round mr12'
                style='height: 21px;'
            >
                <svg v-if='!folded' class='icon'><use xlink:href='#icon-chevron-down'/></svg>
                <svg v-else class='icon'><use xlink:href='#icon-chevron-right'/></svg>
            </button>

            <button
                @click='$emit("split", step)'
                class='fr btn btn--stroke btn--s color-gray color-black-on-hover round mr12'
                style='height: 21px;'
            >
                <svg class='icon'><use xlink:href='#icon-uncombine'/></svg>
            </button>

            <div class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr12'>
                <span v-text='new Date(step.created).toISOString()'/>
            </div>
        </template>
        <template v-else>
            <button
                @click='submit'
                class='fr btn btn--stroke btn--s color-gray color-green-on-hover round mr12'
            >Submit</button>
        </template>
    </div>
    <template v-if='!step.closed || !folded'>
        <div class='col col--12 border border--gray-light round grid mx12 my12 px12 py12'>
            <template v-if='loading.submit'>
                <Loading desc='Submitting Step'/>
            </template>
            <template v-else>
                <div class='col col--12'>
                    <span class='ml12' v-text='step.step.title || "Select from the following:"'/>
                </div>
                <div class='col col--12 grid border border--gray-light round mx12'>
                    <div @click='update(sel)' :key='sel.id' v-for='sel in step.step.selections' class='col col--12' :class='{
                        "cursor-pointer": !step.closed,
                        "bg-darken10-on-hover": !step.closed
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
</div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'StepSelection',
    props: {
        step: Object,
        open: Boolean
    },
    mounted: function() {
        this.folded = !(this.step.closed && this.open);
        if (this.step.step.selection) this.selection = this.step.step.selection;
    },
    watch: {
        open: function() {
            this.folded = !(this.step.closed && this.open);
        }
    },
    data: function() {
        return {
            loading: {
                submit: false
            },
            folded: null,
            selection: null
        }
    },
    methods: {
        update: function(sel) {
            if (this.step.closed) return;
            this.selection = sel.name;
        },
        submit: async function() {
            if (!this.selection) return;

            try {
                this.loading.submit = true;
                const step = await window.std(`/api/upload/${this.$route.params.uploadid}/step/${this.step.id}`, {
                    method: 'PATCH',
                    body: {
                        closed: true,
                        step: {
                            selection: this.selection,
                        }
                    }
                });
                this.loading.submit = false;
                this.$emit('step', step);
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
