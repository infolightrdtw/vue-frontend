<template>
    <g class="flow-line" fill="transparent" stroke="black" stroke-width="1">
        <path :d="linePath"></path>
        <path v-if="showArrow" :d="arrowPath" fill="black"></path>
    </g>
</template>
<script lang="ts" setup>
    import { computed } from 'vue'
    const { source, target, showArrow = true } = defineProps<{
        source: object,
        target: object,
        showArrow?: boolean
    }>()

    const linePath = computed(() => {
        const path = []
        path.push(`M ${points[0].x} ${points[0].y}`)
        for (let i = 1; i < points.length; i++) {
            path.push(`L ${points[i].x} ${points[i].y}`)
        }
        return path.join(' ')
    })

    const arrowPath = computed(() => {
        const endP = points[points.length - 1]
        const path = []
        path.push(`M ${endP.x} ${endP.y}`)
        if (endP.d == 0) {
            path.push(`L ${endP.x - 4} ${endP.y - 12}`)
            path.push(`L ${endP.x + 4} ${endP.y - 12}`)
        } else if (endP.d == 90) {
            path.push(`L ${endP.x + 12} ${endP.y - 4}`)
            path.push(`L ${endP.x + 12} ${endP.y + 4}`)
        }
        else if (endP.d == 180) {
            path.push(`L ${endP.x - 4} ${endP.y + 12}`)
            path.push(`L ${endP.x + 4} ${endP.y + 12}`)
        }
        else if (endP.d == 270) {
            path.push(`L ${endP.x - 12} ${endP.y - 4}`)
            path.push(`L ${endP.x - 12} ${endP.y + 4}`)
        }
        path.push('Z')
        return path.join(' ')
    })

    const minLineLength = 10
    const innerOffset = 10
    const POINTS_INFOS = [{
        x: 0.5,
        y: 0,
        d: 0
    }, {
        x: 0,
        y: 0.5,
        d: 270
    }, {
        x: 0.5,
        y: 1,
        d: 180
    }, {
        x: 1,
        y: 0.5,
        d: 90
    }]
    const LINE_TYPES = {
        Backup: 0,
        Same: 1,
        Diffrent: 2,
        Opposite: 3
    }


    const lineInfos = []
    const sourcePoints = getPoints(source)
    const targetPoints = getPoints(target)
    for (let i = 0; i < sourcePoints.length; i++) {
        for (let j = 0; j < targetPoints.length; j++) {
            const p1 = sourcePoints[i]
            const p2 = targetPoints[j]
            let p = 0
            if (p1.d != p2.d) {
                if ((p1.y <= p2.y + minLineLength && (p1.d == 0 || p2.d == 180)) ||
                    (p1.y + minLineLength >= p2.y && (p2.d == 0 || p1.d == 180)) ||
                    (p1.x + minLineLength >= p2.x && (p1.d == 90 || p2.d == 270)) ||
                    (p1.x <= p2.x + minLineLength && (p2.d == 90 || p1.d == 270))) {
                    p = 0   //backups
                } else if ((p1.d + p2.d) % 180 == 0) {
                    p = 3   //opposite direction
                } else {
                    p = 2   //diffrent direction
                }
            } else {
                p = 1       //same direction
            }

            lineInfos.push({
                p1: p1,
                p2: p2,
                p: p
            })
        }
    }
    //sort lines
    lineInfos.sort(function (line1, line2) {
        if (line1.p == line2.p) {
            const length2 = getLineLength(line2)
            const length1 = getLineLength(line1)
            return line1.p == 1 ? length1 - length2 : length2 - length1
        } else {
            return line2.p - line1.p
        }
    })
    const l = lineInfos[0]
    if (!source.points) {
        source.used = l.p1.d
    }
    if (!target.points) {
        target.used = l.p2.d
    }

    const points = []
    const p1 = l.p1
    const p2 = l.p2
    points.push(p1)
    if (l.p == LINE_TYPES.Opposite) {
        if (p1.d % 180 == 0) {
            let midY = (p1.y + p2.y) / 2
            if (p1.inner) {
                midY = p1.d == 180 ? p1.y + innerOffset : p1.y - innerOffset
            }
            else if (p2.inner) {
                midY = p2.d == 180 ? p2.y + innerOffset : p2.y - innerOffset
            }
            points.push({
                x: p1.x,
                y: midY
            })
            points.push({
                x: p2.x,
                y: midY
            })
        } else {
            const midX = (p1.x + p2.x) / 2
            points.push({
                x: midX,
                y: p1.y
            })
            points.push({
                x: midX,
                y: p2.y
            })
        }
    }
    else if (l.p == LINE_TYPES.Diffrent) {
        if (p1.d % 180 == 0) {
            points.push({
                x: p1.x,
                y: p2.y
            })
        } else {
            points.push({
                x: p2.x,
                y: p1.y
            })
        }
    }
    else if (l.p == LINE_TYPES.Same) {
        if (p1.d == 0) {
            points.push({
                x: p1.x,
                y: Math.min(p1.y, p2.y) - 2 * minLineLength
            })
            points.push({
                x: p2.x,
                y: Math.min(p1.y, p2.y) - 2 * minLineLength
            })
        } else if (p1.d == 90) {
            points.push({
                x: Math.max(p1.x, p2.x) + 2 * minLineLength,
                y: p1.y
            })
            points.push({
                x: Math.max(p1.x, p2.x) + 2 * minLineLength,
                y: p2.y
            })
        } else if (p1.d == 180) {
            points.push({
                x: p1.x,
                y: Math.max(p1.y, p2.y) + 2 * minLineLength
            })
            points.push({
                x: p2.x,
                y: Math.max(p1.y, p2.y) + 2 * minLineLength
            })
        } else {
            points.push({
                x: Math.min(p1.x, p2.x) - 2 * minLineLength,
                y: p1.y
            })
            points.push({
                x: Math.min(p1.x, p2.x) - 2 * minLineLength,
                y: p2.y
            })
        }
    }
    points.push(p2)

    function getLineLength(line: object) {
        return (line.p1.d % 180 == 0) ? (line.p2.y - line.p1.y) * (line.p2.y - line.p1.y) : (line.p2.x - line.p1.x) * (line.p2.x - line.p1.x)
    }
    function getPoints(activity: object) {
        if (activity.points) {
            return [activity.points]
        }
        else {
            const points = POINTS_INFOS.filter(pt => pt.d !== activity.used)
            return points.map(function (pt) {
                return {
                    x: activity.left + pt.x * activity.width,
                    y: activity.top + pt.y * activity.height,
                    d: pt.d,
                }
            })
        }
    }

</script>