<template>
<div class='col col--12'>
    <div id='cy'></div>
</div>
</template>

<style>
#cy {
    height: 500px;
    width: 100%;
}
</style>

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
            }
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
                        'background-fit': 'cover',
                        'border-color': '#000',
                        'border-width': 3,
                        'border-opacity': 0.5
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
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('[type = "error"]').css({
                        'label': 'Error',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('[type = "selection"]').css({
                        'label': 'Selection',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
                    })
                    .selector('[type = "cog"]').css({
                        'label': 'COG',
                        'background-image': 'https://live.staticflickr.com/1261/1413379559_412a540d29_b.jpg'
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

            const latest = this.steps.upload_steps[this.steps.upload_steps.length - 1];
            const node = this.graph.$id(latest.id)
            node.addClass('selected');
            this.parents(node)

            this.graph.on('tap', 'node', (evt) => {
                this.graph.$('.selected').removeClass('selected');
                evt.target.addClass('selected');
                this.parents(evt.target)
            });
        });
    },
    methods: {
        process: function() {
            for (const step of this.steps.upload_steps) {
                if (this.map.has(step.id)) continue;

                this.map.set(step.id, step);
                this.graph.add([
                    { group: 'nodes', data: { id: step.id } },
                    { group: 'edges', data: { source: step.parent, target: step.id } }
                ]);
            }

            this.graph.fit();
        },
        parents: function(node) {
            let ids = [];
            ids.push(node.id());
            for (const parent of node.predecessors()) {
                if (!parent.isNode()) continue;
                ids.push(parent.id());
            }

            ids.pop(); // remove initial
            ids.reverse();
            ids = ids.map((id) => {
                return this.map.get(parseInt(id));
            });

            this.$emit('steps', ids);
        }
    }
}
</script>
