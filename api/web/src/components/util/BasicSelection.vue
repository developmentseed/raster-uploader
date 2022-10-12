<template>
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

<script>
export default {
    name: 'BasicSelection',
    props: {
        selections: {
            type: Array,
            default: function() {
                return [];
            }
        }
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
