import Combobox from '@/components/editors/Combobox.vue'
import Datebox from '@/components/editors/Datebox.vue'
import Datetimebox from '@/components/editors/Datetimebox.vue'
import Dateselect from '@/components/editors/Dateselect.vue'
import Numberbox from '@/components/editors/Numberbox.vue'
import Password from '@/components/editors/Password.vue'
import Options from '@/components/editors/Options.vue'
import Switch from '@/components/editors/Switch.vue'
import Textarea from '@/components/editors/Textarea.vue'
import Timebox from '@/components/editors/Timebox.vue'
import Fileupload from '@/components/editors/Fileupload.vue'
import Htmleditor from '@/components/editors/Htmleditor.vue'
import MapEditor from '@/components/editors/Map.vue'
import Multiinput from '@/components/editors/Multiinput.vue'
import Place from '@/components/editors/Place.vue'
import Barcode from '@/components/editors/Barcode.vue'
import Qrcode from '@/components/editors/Qrcode.vue'
import Signature from '@/components/editors/Signature.vue'
import Refval from '@/components/editors/Refval.vue'
import Textbox from '@/components/editors/Textbox.vue'
import Editgrid from '@/components/editors/Editgrid.vue'
import Autocomplete from '@/components/editors/Autocomplete.vue'
import Creator from '@/components/editors/Creator.vue'
import Updater from '@/components/editors/Updater.vue'
import Scan from '@/components/editors/Scan.vue'
import Mauiscan from '@/components/editors/Mauiscan.vue'
import Slider from '@/components/editors/Slider.vue'
import Submenu from '@/components/editors/Submenu.vue'

export default function (funcs: object) {
    const editors = {
        combobox: Combobox,
        datebox: Datebox,
        datetimebox: Datetimebox,
        dateselect: Dateselect,
        editgrid: Editgrid,
        numberbox: Numberbox,
        password: Password,
        options: Options,
        switch: Switch,
        switchbutton: Switch,
        textarea: Textarea,
        timebox: Timebox,
        fileupload: Fileupload,
        htmleditor: Htmleditor,
        map: MapEditor,
        multiinput: Multiinput,
        place: Place,
        barcode: Barcode,
        qrcode: Qrcode,
        signature: Signature,
        refval: Refval,
        textbox: Textbox,
        autocomplete: Autocomplete,
        creator: Creator,
        updater: Updater,
        scan: Scan,
        mauiscan: Mauiscan,
        slider: Slider,
        submenu: Submenu
    }

    function getEditor(type: any) {
        return editors[type] || Textbox
    }

    return {
        getEditor
    }
}