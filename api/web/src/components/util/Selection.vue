<template>
<div class='col col--12 grid my12'>
    <template v-if='loading'>
        <Loading desc='Loading Selections'/>
    </template>
    <template v-if='total === 0'>
        <div class='col col--12 ml12 mt12 border border--gray-light round'>
            <None
                name='Upload Sources'
                :create='create'
                @create='$emit("create", $event)'
            />
        </div>
    </template>

    <template v-else>
        <div class='col col--12'>
            <span v-text='"select from the following:"'/>

            <button v-if='create' @click='$emit("create")' class='btn round btn--stroke btn--s mb3 color-gray color-green-on-hover fr'>
                <svg class='icon'><use href='#icon-plus'/></svg>
            </button>
        </div>
        <div class='col col--12 grid border border--gray-light round'>
            <div
                @click='selection = sel'
                :key='sel.id'
                v-for='sel in selections'
                class='col col--12 cursor-pointer bg-darken10-on-hover'
            >
                <div class='w-full py6 px6' :class='{
                    "bg-gray-light": selection.id === sel.id
                }'>
                    <span class='txt-h4 round' v-text='sel.name'/>
                </div>
            </div>
        </div>
    </template>
</div>
</template>

<script>
import Loading from './Loading.vue';
import None from './None.vue';

export default {
    name: 'selection',
    props: {
        url: URL,
        limit: {
            type: Number,
            default: 20
        },
        create: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        'selection.id': function() {
            this.$emit("selection", this.selection.id)
        }
    },
    data: function() {
        return {
            loading: false,
            selection: {
                id: null
            },
            total: 0,
            selections: []
        };
    },
    mounted: function() {
        this.selection = this.selections[0];

        this.getList();
    },
    methods: {
        async getList() {
            this.loading = true;

            try {
                this.url.searchParams.set('limit', this.limit);
                const list = await window.std(this.url);

                this.total = list.total;
                this.selections = list[this.$.vnode.key];
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading = false;
        }
    },
    components: {
        None,
        Loading
    }
}
</script>
