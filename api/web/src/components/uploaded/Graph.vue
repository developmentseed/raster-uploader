<template>
<div class='col col--12 relative'>
    <div id='cy'></div>

    <div class='absolute top left z5 mx6 my6'>
        <button @click='centre' class='btn round btn--stroke color-gray color-red-on-hover'>
            <svg class='icon'><use href='#icon-position'/></svg>
        </button>
    </div>
</div>
</template>

<script>
import Cytoscape from 'cytoscape';

export default {
    name: 'UploadedGraph',
    props: {
        steps: Object
    },
    data: function() {
        return {
            map: new Map(),
            graph: null,
            selected: null,
            processed: {
                nodes: [],
                edges: []
            }
        };
    },
    watch: {
        steps: {
            deep: true,
            handler: function() {
                if (!this.graph) return;
                this.process();
                this.parents()
            }
        },
        selected: function() {
            this.graph.$('.selected').removeClass('selected');
            this.selected.addClass('selected');
            this.parents()
        }
    },
    mounted: function() {
        // Populate Nodes
        this.processed.nodes.push({ data: {
            id: 'initial',
            type: 'initial'
        }});

        for (const step of this.steps.upload_steps) {
            this.map.set(step.id, step);

            this.processed.nodes.push({ data: {
                id: step.id,
                type: step.type
            }});
        }

        for (const step of this.steps.upload_steps) {
            if (!step.parent) {
                this.processed.edges.push({ data: {
                    source: 'initial',
                    target: step.id
                }});
            } else {
                this.processed.edges.push({ data: {
                    source: step.parent,
                    target: step.id
                }});
            }
        }

        this.$nextTick(() => {
            this.graph = Cytoscape({
                container: document.getElementById('cy'),
                elements: this.processed,
                boxSelectionEnabled: false,
                autounselectify: true,
                style: Cytoscape.stylesheet()
                    .selector('node').css({
                        'height': 80,
                        'width': 80,
                        'background-color': '#fff',
                    })
                    .selector('edge').css({
                        'curve-style': 'bezier',
                        'width': 6,
                        'target-arrow-shape': 'triangle',
                        'line-color': '#c7cacc',
                        'target-arrow-color': '#c7cacc'
                    })
                    .selector('[type = "initial"]').css({
                        'label': 'Initial',
                        'background-image': '/svgs/info.svg.png'
                    })
                    .selector('[type = "error"]').css({
                        'label': 'Error',
                        'background-image': '/svgs/alert.svg.png'
                    })
                    .selector('[type = "selection"]').css({
                        'label': 'Selection',
                        'background-image': '/svgs/cursor.svg.png'
                    })
                    .selector('[type = "text"]').css({
                        'label': 'Text',
                        'background-image': '/svgs/pencil.svg.png'
                    })
                    .selector('[type = "cog"]').css({
                        'label': 'COG',
                        'background-image': '/svgs/picture.svg.png'
                    })
                    .selector('.selected').css({
                        'border-color': '#FF0000',
                        'border-width': 5,
                        'border-opacity': 1
                    }),
                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10
                }
            });
            this.graph.fit(50);

            this.selected = this.graph.$id(this.steps.upload_steps[this.steps.upload_steps.length - 1].id)

            this.graph.on('tap', 'node', (evt) => {
                this.selected = evt.target;
            });
        });
    },
    methods: {
        process: function() {
            for (const step of this.steps.upload_steps) {
                if (!this.map.has(step.id)) {
                    this.graph.add([
                        { group: 'nodes', data: { id: step.id, type: step.type } },
                        { group: 'edges', data: { source: step.parent ? step.parent : 'initial', target: step.id } }
                    ]);
                }

                this.map.set(step.id, step);
            }

            const layout = this.graph.layout({
                name: 'breadthfirst',
                directed: true,
                padding: 10
            });
            layout.run();

            this.graph.fit(50);
        },
        parents: function() {
            let ids = [];
            ids.push(this.selected.id());
            for (const parent of this.selected.predecessors()) {
                if (!parent.isNode()) continue;
                ids.push(parent.id());
            }

            ids.pop(); // remove initial
            ids.reverse();
            ids = ids.map((id) => {
                return this.map.get(parseInt(id));
            });

            this.$emit('steps', ids);
        },
        centre: function() {
            this.graph.fit(50);
        }
    }
}
</script>

<style>
#cy {
    height: 500px;
    width: 100%;
}
</style>

