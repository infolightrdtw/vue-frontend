import FileImage from '@/html/FileImage.vue'
import FileLink from '@/html/FileLink.vue'
import Relation from '@/html/Relation.vue'
import FlowFlag from '@/components/flow/FlowFlag.vue'
import FlowReceiver from '@/components/flow/FlowReceiver.vue'
import LText from '@/html/LText.vue'
import Icon from '@/html/Icon.vue'

export default function (funcs: object) {
    const elements = {
        image: FileImage,
        link: FileLink,
        icon: Icon,
        relation: Relation,
        flowflag: FlowFlag,
        receiver: FlowReceiver,
        lText: LText
    }

    function getElement(type: any) {
        return elements[type]
    }

    return {
        getElement
    }
}