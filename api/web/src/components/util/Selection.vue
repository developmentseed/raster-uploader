<template>
<div class='col col--12 grid my12'>
    <div class='col col--12'>
        <span v-text='"Select from the following:"'/>

        <button @click='$emit("create")' class='btn round btn--stroke btn--s mb3 color-gray color-green-on-hover fr'>
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
</div>
</template>

<script>
export default {
    name: 'Selection',
    props: {
        selections: Array,
        create: Boolean
    },
    watch: {
        'selection.id': function() {
            this.$emit("selection", this.selection.id)
        }
    },
    data: function() {
        return {
            selection: {
                id: null
            }
        };
    },
    mounted: function() {
        this.selection = this.selections[0];
    }
}
</script>
