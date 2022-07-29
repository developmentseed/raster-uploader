<template>
    <div class='z2 fixed top right bottom left scroll-auto bg-darken50'>
        <div class='flex flex--center-main pt36'>
            <div class='flex-child bg-white round relative w600'>
                <button @click='$emit("close")' class='absolute top right px12 py12'>
                    <svg class='icon link color-darken50'><use xlink:href='#icon-close'></use></svg>
                </button>

                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Modal'
}
</script>
