<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <span v-text='"select from the following:"'/>

        <button v-if='create' @click='$emit("create")' class='btn round btn--stroke btn--s mb3 color-gray color-green-on-hover fr mx3'>
            <svg class='icon'><use href='#icon-plus'/></svg>
        </button>

        <button v-if='filter_param' @click='filter.shown = !filter.shown' class='btn round btn--stroke btn--s mb3 color-gray color-green-on-hover fr mx3'>
            <svg class='icon'><use href='#icon-search'/></svg>
        </button>
    </div>

    <template v-if='filter.shown'>
        <div class='col col--12 py6'>
            <div class='relative'>
                <div class='absolute flex flex--center-cross flex--center-main w36 h36'>
                    <svg class='icon'><use xlink:href='#icon-search'></use></svg>
                </div>
                <input v-model='filter.value' class='input pl36' :placeholder='name'>
            </div>
        </div>
    </template>

    <template v-if='loading'>
        <Loading desc='Loading Selections'/>
    </template>
    <template v-else-if='total === 0'>
        <div class='col col--12 ml12 mt12 border border--gray-light round'>
            <None
                :name='name'
                :create='create'
                @create='$emit("create", $event)'
            />
        </div>
    </template>
    <template v-else>
        <BasicSelection
            :selections='selections'
            @selection='selection = $event'
        />
    </template>
</div>
</template>

<script>
import BasicSelection from './BasicSelection.vue';
import Loading from './Loading.vue';
import None from './None.vue';

export default {
    name: 'Selection',
    props: {
        url: URL,
        name: {
            type: String,
            default: 'Selections'
        },
        limit: {
            type: Number,
            default: 10
        },
        filter_param: {
            type: String,
            default: ''
        },
        create: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        'filter.value': function() {
            this.getList();
        },
        'filter.shown': function() {
            if (!this.filter.show) this.filter.value = '';
        },
        'selection.id': function() {
            this.$emit("selection", this.selection.id)
        }
    },
    data: function() {
        return {
            loading: false,
            filter: {
                shown: false,
                value: ''
            },
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

            this.url.searchParams.set('limit', this.limit);
            if (this.filter_param) {
                this.url.searchParams.set(this.filter_param, this.filter.value);
            } else {
                this.url.searchParams.delete(this.filter_param);
            }

            try {
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
        Loading,
        BasicSelection
    }
}
</script>
