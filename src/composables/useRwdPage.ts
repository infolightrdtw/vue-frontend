import { ref } from 'vue'
import { compile } from 'vue'            // run-time compiler (v3)
import axios from 'axios'

/** 對照表：RWD 控制 → Vue Component tag */
const controlMap: Record<string, string> = {
  datagrid:  'DataGrid',
  panel:     'CollapsiblePanel',
  tab:       'Tabs'
  // 之後再逐項擴充…
}

/** 將 RWD page meta 轉為 Vue <template> 字串 */
function buildTemplate(meta: any): string {
  let tpl = ''

  meta.controls.forEach((ctrl: any) => {
    const tag = controlMap[ctrl.type.toLowerCase()] || 'div'
    const id  = ctrl.id ? ` :id="'${ctrl.id}'"` : ''

    switch (ctrl.type.toLowerCase()) {
      case 'datagrid':
        tpl += `<${tag}${id} :meta='controls["${ctrl.id}"]' />`
        break
      case 'panel':
        tpl += `<${tag} title="${ctrl.title}">${buildTemplate(ctrl)}</${tag}>`
        break
      default:
        tpl += `<${tag}${id}></${tag}>`
    }
  })

  // 若 page 裡只有 root datagrid，以 div 包起
  return `<div class="rwd-page">${tpl}</div>`
}

/** 動態取得 JSON → runtime compile → 回傳 component */
export async function loadRwdPage(pageName: string, clientInfo: string) {
  const { data: meta } = await axios.get('/api/ApiMain/PageJson',
    { params: { page: pageName },
      headers: { 'Client-Info': clientInfo } })

  const template = buildTemplate(meta)
  /* 用 Vue compile() 產生 render fn */
  const comp = {
    name: pageName + 'Runtime',
    props: {},
    data: () => ({ controls: meta.controls }),
    template,
    // 若有共用 setup 可在這裡寫
  }
  /* 透過 compile 讓 template 變 render 函式 */
  return compile(template).bind(comp) && comp
}
