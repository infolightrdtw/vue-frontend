# RWD表單組件屬性

## DataGrid

以 grid 表格形式來顯示多筆資料，欄位定義於 **GridColumn** 中。

### datagrid 組成的 class

- 表格標題的 class 為 `datagrid-title`，須以 `const title = $dgMaster.value.title;` 方式尋找 class。
- 查詢視窗標題如果為 Dialog 式的，class 為 `modal-title`，須以 `const queryTitle = $dgMaster.value.queryTitle;` 方式尋找 class。
- 查詢視窗標題如果為 Panel 式的，class 為 `panel-title`，須以 `const queryTitle = $dgMaster.value.queryTitle;` 方式尋找 class。

### 屬性

| 名稱                   | 類型         | 説明                                                                                                                                                                                                                                                                                                        |
| -------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID                   | string     | 組件名稱，用於識別該組件                                                                                                                                                                                                                                                                                              |
| RemoteName           | string     | 組件連接的資料源                                                                                                                                                                                                                                                                                                  |
| Columns              | Collection | Grid 中顯示的欄位                                                                                                                                                                                                                                                                                               |
|                      |            | Columns 中的屬性請參考 GridColumn 説明                                                                                                                                                                                                                                                                             |
| WhereStr             | string     | 固定的過濾條件，如：一開始表單不顯示出資料可以設為 `1=0`                                                                                                                                                                                                                                                                           |
| AutoApply            | bool       | 是否自動存檔                                                                                                                                                                                                                                                                                                    |
| ConfirmDelete        | bool       | 是否刪除時跳出確認視窗                                                                                                                                                                                                                                                                                               |
| DuplicateCheck       | bool       | 是否存檔時檢測重複性                                                                                                                                                                                                                                                                                                |
| EditOnEnter          | bool       | 是否選中 Grid 當前筆資料即進入編輯狀態                                                                                                                                                                                                                                                                                    |
| ToolItems            | Collection | 用於設定 Grid 上的新增、修改、刪除等按鈕，請參照 ToolItem 屬性設定。特別注意: 修改、刪除的按鈕通常置於Grid的左方，根據每一筆資料去控制，可以透過ViewCommandVisible/EditCommandVisible/DeleteCommandVisible屬性或RowStyler事件進行動態控制                                                                                                                                         |
| ToolItemPosition     | string     | 用於設定 ToolItem 位於頂部或底部                                                                                                                                                                                                                                                                                     |
| ViewCommandVisible   | bool       | 是否在 grid 前顯示瀏覽按鈕                                                                                                                                                                                                                                                                                          |
| EditCommandVisible   | bool       | 是否在 grid 前顯示修改按鈕                                                                                                                                                                                                                                                                                          |
| DeleteCommandVisible | bool       | 是否在 grid 前顯示刪除按鈕                                                                                                                                                                                                                                                                                          |
| AUD_Detect           | bool       | 是否讀取選單的快速新增/編輯/刪除權限控制                                                                                                                                                                                                                                                                                     |
| ColumnHidable        | bool       | 是否開放讓 User 自行決定哪些欄位要隱藏/顯示，並會按 User 個人習慣自動保存此設定                                                                                                                                                                                                                                                            |
| AlwaysClose          | bool       | 開啟 grid 時，是否不載入資料                                                                                                                                                                                                                                                                                         |
| EditForm             | string     | 編輯的 DataForm 組件 ID                                                                                                                                                                                                                                                                                        |
| ParentObject         | string     | 在 MasterDetail 時，設定 detail 對應的 Master 顯示的組件 ID                                                                                                                                                                                                                                                            |
| TargetObject         | string     | 可針對其他 DataGrid 或 DataForm 作連動                                                                                                                                                                                                                                                                             |
| WhereItems           | Collection | 搭配 TargetDataGrid 使用，可對 TargetDataGrid 做條件過濾                                                                                                                                                                                                                                                              |
| TotalMode            | string     | 計算的模式（`all` 代表計算全部資料、`page` 代表只計算當前頁），預設請設定為 page                                                                                                                                                                                                                                                         |
| ShowColumnTitle      | bool       | 在小屏幕時是否顯示標題文字                                                                                                                                                                                                                                                                                             |
| AutoQueryColumn      | bool       | 自動在 Grid 上產生 textBox 提供欄位的查詢                                                                                                                                                                                                                                                                              |
| QueryColumns         | Collection | 用於設定 Grid 的查詢欄位，請參考 QueryColumn 屬性設定                                                                                                                                                                                                                                                                      |
| QueryMode            | enum       | `Dialog` 表示打開新窗口顯示查詢條件欄位；`Panel` 表示在 Grid 上方直接顯示查詢條件欄位；`Fuzzy` 表示在 Grid 上方直接顯示模糊查詢條件欄位                                                                                                                                                                                                                    |
| QueryTitle           | string     | 查詢視窗標題                                                                                                                                                                                                                                                                                                    |
| QueryColumnsCount    | int        | 查詢的水平欄位數，預設為 1                                                                                                                                                                                                                                                                                            |
| ShowCheckbox         | bool       | 是否顯示多選框                                                                                                                                                                                                                                                                                                   |
| RecordLock           | bool       | 是否做紀錄鎖定                                                                                                                                                                                                                                                                                                   |
| Pagination           | bool       | 是否分頁                                                                                                                                                                                                                                                                                                      |
| PageCount            | bool       | 預設請設定為True，當Pagination=True進行資料分頁時，系統會到後端去計算筆數與頁數，當資料數據龐大時(數十萬筆以上)，可設定PageCount為False代表不計算筆數與頁數，來提升效率。但此就無法得知有多少筆數據與頁數的控制，也不能進行欄位的加總，只能進行簡單的上下頁功能。                                                                                                                                                        |
| ReportName           | string     | 選擇 Report，可以用來搭配印表時的格式                                                                                                                                                                                                                                                                                    |
| PageSize             | Int        | 預設分頁筆數，此值需要在 PageList 中                                                                                                                                                                                                                                                                                   |
| PageList             | Int        | 控制分頁顯示的資料筆數，設定除了 10 以外，例如：`20,30,50,100` 讓使用者來選擇                                                                                                                                                                                                                                                          |
| Title                | string     | Grid 顯示標題                                                                                                                                                                                                                                                                                                 |
| Height               | Int        | Grid 高度，不設定時代表自動高度（預設）                                                                                                                                                                                                                                                                                    |
| RowStyler            | string     | 事件 `rowStyler(index, row)`：每列顯示時觸發，回傳 CSS 字串套到該列 `<tr :style>`，例如 `return 'background-color:#f8d7da;color:#842029;'`。`index` 為列次序，`row` 為該列資料。命名為 `<gridId>_rowStyler`，詳見 §15。注意：此事件只控制列樣式，**不能**控制命令鈕逐列顯隱（命令鈕在 Vue 是整 grid 布林）。 |
| OnBeforeLoad         | string     | 事件 `onBeforeLoad(param)`：載入資料前觸發。`param` 為參數，如改變 `param.whereStr` 可以固定加上 `whereStr` 指定的條件作為過濾；`param.sort` 為排序欄位；`param.order` 為 `"desc"` 或 `"asc"`。使用 `onBeforeLoad` 事件時最好配合 `AlwaysClose=True`，避免預設的資料條件衝突。`return true` 代表會執行載入，`return false` 代表取消。另外若要控制查詢欄位的預設值，請不要使用 `onBeforeLoad`，改用 `onLoad` 即可 |
| OnLoad               | string     | 事件 `onLoad(data)`：資料載入完成後觸發。`data.rows` 為資料內容，`data.rows.length` 為當頁資料數，`data.total` 為資料總筆數。注意：在 `onLoad` 中最好不要執行 `load` / `lodaData` / `setWhere` 方法，會造成遞迴；若一定要用，須用 `loaded` 變數（true/false）控制僅第一次執行                                                                                                      |
| OnLoadError          | string     | 事件 `onLoadError(msg)`：資料載入錯誤時觸發，`msg` 為錯誤訊息內容                                                                                                                                                                                                                                                             |
| OnSelect             | string     | 事件 `onSelect(index, row)`：資料選中時觸發，`index` 為資料次序，`row` 為資料內容，`row.ColumnName` 為欄位內容                                                                                                                                                                                                                        |
| OnInsert             | string     | 事件 `onInsert(row)`：資料新增時觸發，`row` 為新增的資料內容。`return true` 繼續新增，`false` 取消新增                                                                                                                                                                                                                                 |
| OnUpdate             | string     | 事件 `onUpdate(row)`：資料更改時觸發，`row` 為更改的資料內容。`return true` 繼續更改，`false` 取消更改                                                                                                                                                                                                                                 |
| OnDelete             | string     | 事件 `onDelete(row)`：資料刪除時觸發，`row` 為刪除的資料內容。`return true` 繼續刪除，`false` 取消刪除                                                                                                                                                                                                                                 |
| OnDeleted            | string     | 事件 `onDeleted(row)`：資料刪除後觸發，`row` 為刪除的資料內容                                                                                                                                                                                                                                                                |
| OnQuery              | string     | 事件 `onQuery(whereItems)`：資料查詢時觸發，`whereItems` 為查詢欄位的內容（list，有多個欄位，請參考附錄 3）。`return true` 代表繼續查詢，`false` 代表查詢無效                                                                                                                                                                                            |
| OnImportExcelSuccess | string     | 事件 `onImportExcelSuccess()`：當匯入 Excel 格式成功時觸發                                                                                                                                                                                                                                                             |
| OnShowEditor         | string     | 事件 `onShowEditor(index, field, editor)`：當某一筆資料被更改編輯時觸發，`index` 為資料次序，`field` 為欄位名稱，`editor` 為編輯物件。注意：僅限於在 DataGrid 上直接編輯時才有效                                                                                                                                                                              |
|                      |            | 存取 editor 的屬性請使用 `editor.options` 操作，請不要用 `editor.target`，例如：`editor.options.valueField`、`editor.options.textField`、`editor.options.whereItems`（whereItems 的定義請參考附錄 3）                                                                                                                                    |
|                      |            | 注意：此 `onShowEditor` 事件必須 `return editor`；如果欄位 readonly 想改用一般顯示資料的方式可以 `return {type: 'div'}`                                                                                                                                                                                                              |
| OnEndEdit            | string     | 事件 `onEndEdit(index, row)`：當某一筆資料編輯完畢時觸發，`index` 代表資料次序，`row` 代表編輯完的資料，`row.ColumnName` 為欄位內容                                                                                                                                                                                                             |
| OnTotal              | string     | 事件 `onTotal(totalRow, rows)`：當 datagrid 加總值有變化時觸發，`totalRow` 代表加總值；某欄位加總值為 `totalRow.ColumnName`；`rows` 為所有資料的對象                                                                                                                                                                                          |
| Bordered             | bool       | 是否要有外框線                                                                                                                                                                                                                                                                                                   |
| Hover                | bool       | 游標在資料上是否有動畫效果                                                                                                                                                                                                                                                                                             |
| Striped              | bool       | 是否條紋顯示奇偶行                                                                                                                                                                                                                                                                                                 |
| Condensed            | bool       | 是否讓表格排版更緊湊                                                                                                                                                                                                                                                                                                |
| Xsblock              | bool       | 在小屏幕時顯示成 Table 或 Grid 樣式                                                                                                                                                                                                                                                                                  |
| Simple               | bool       | 在寬屏時只顯示一個**浮動的** row command                                                                                                                                                                                                                                                                              |
| ChatDetect           | bool       | 是否要搭配 ChatUx 功能                                                                                                                                                                                                                                                                                           |

#### OnBeforeLoad 範例

```js
function dgMaster_onBeforeLoad(param) {
    const user = $this.getVariableValue('user');
    param.whereStr = `交辦人 = '${user}' or 待辦人='${user}'`;
}
```

#### OnSelect 範例

```js
function dgMaster_onSelect(index, row) {
    if ($dfMaster.value) {
        $dfMaster.value.setWhere(`客戶編號=${row.客戶編號}`);
    }
}
```

### 方法

格式為：`$dgMaster.value.methodName(parameters..)`（其中 `$dgMaster` 是該元件的 template ref，請依頁面中 `const $dgMaster = ref()` 的命名替換）

| 名稱與參數                                                        | 說明                                                                                                                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$dgMaster.value.getRows()`                                  | 傳回 `rows`，取得 datagrid 的所有資料（本頁），rows 為 array                                                                                                            |
| `$dgMaster.value.getTotal()`                                 | 傳回 `row`，取得加總的 row 對象，加總值為 `row.columnName`                                                                                                             |
| `$dgMaster.value.beginEdit(index)`                           | 進入單筆的編輯狀態                                                                                                                                               |
| `$dgMaster.value.endEdit()`                                  | 結束編輯狀態                                                                                                                                                  |
| `$dgMaster.value.cancelEdit()`                               | 取消編輯狀態                                                                                                                                                  |
| `$dgMaster.value.getSelectedIndex()`                         | 傳回 `index`，取得目前選中 datagrid 的 index 次序                                                                                                                   |
| `$dgMaster.value.getSelected()`                              | 傳回 `row`，取得目前選中 datagrid 的資料，可透過 `row.ColumnName` 取得欄位內容值                                                                                               |
| `$dgMaster.value.select(index)`                              | 設定選中某一筆資料，index 為次序                                                                                                                                     |
| `$dgMaster.value.check(index)`                               | 勾選某一筆資料，index 為次序                                                                                                                                       |
| `$dgMaster.value.uncheck(index)`                             | 取消勾選某一筆資料，index 為次序                                                                                                                                     |
| `$dgMaster.value.checkAll()`                                 | 全部勾選                                                                                                                                                    |
| `$dgMaster.value.uncheckAll()`                               | 全部取消勾選                                                                                                                                                  |
| `$dgMaster.value.getChecked()`                               | 傳回 `rows`，取得所有勾選的資料，rows 為 array 多筆資料                                                                                                                   |
| `$dgMaster.value.setWhere(whereStr)`                         | 設定後端數據 Where 的條件，whereStr 為 Where 條件；此方法已包含資料重載，不用再呼叫 `$dgMaster.value.load()`                                                                          |
|                                                              | 注意：`setWhere` 若在 `onMounted()` 中使用，請配合 `AlwaysClose=True`，避免與預設條件衝突                                                                                     |
| `$dgMaster.value.load()`                                     | 重新載入後端數據。若已執行 `$dgMaster.value.setWhere(whereStr)`，就不需要再執行此 `load`                                                                                      |
| `$dgMaster.value.load({page: n})`                            | 指定第 n 頁，重新載入後端資料                                                                                                                                        |
| `$dgMaster.value.loadData(data)`                             | 根據 data 的內容重新載入資料，data 格式請參考附錄 1                                                                                                                        |
| `$dgMaster.value.openQuery()`                                | 打開查詢視窗                                                                                                                                                  |
| `$dgMaster.value.openMove()`                                 | 打開整批挑選資料（ClientMove 組件）的視窗                                                                                                                              |
| `$dgMaster.value.viewRow(index)`                             | 打開查看對應的 DataForm 表單內容                                                                                                                                   |
| `$dgMaster.value.insert_row()`                               | 新增資料                                                                                                                                                    |
| `$dgMaster.value.copy_row()`                                 | 拷貝目前筆資料                                                                                                                                                 |
| `$dgMaster.value.edit_row(index)`                            | 編輯指定的資料；index 不設定代表目前筆資料                                                                                                                                |
| `$dgMaster.value.delete_row(index)`                          | 刪除指定的資料；index 不設定代表目前筆資料                                                                                                                                |
| `$dgMaster.value.appendRow(row)`                             | 以 row 的內容來新增一筆資料，row 格式為 `{field:value, ...}`                                                                                                           |
| `$dgMaster.value.updateRow({index:index, row:{}})`           | 更改指定某一筆資料，row 格式為 `{field:value, ...}`                                                                                                                  |
| `$dgMaster.value.submit()`                                   | 回存資料至後端資料庫                                                                                                                                              |
| `$dgMaster.value.getToolItem(name)`                          | 傳回 object，取得工具按鈕（ToolItems）的 button 對象，name 為按鈕執行的 function 名稱；可進行 `.hide()` / `.show()` 操作。已知 name：Add/Edit/Delete/Query/Copy/Ok/Cancel/Export/Print 等 |
| `$dgMaster.value.showColumn(name)`                           | 指定顯示某一欄位，name 為欄位名稱                                                                                                                                     |
| `$dgMaster.value.hideColumn(name)`                           | 指定隱藏某一欄位，name 為欄位名稱                                                                                                                                     |
| `$dgMaster.value.getEditorValue(name)`                       | 取得目前編輯中某一欄位內容，name 為欄位名稱                                                                                                                                |
| `$dgMaster.value.setEditorValue({field:field, value:value})` | 設定目前編輯中某一欄位內容                                                                                                                                           |
| `$dgMaster.value.getColumnOption(Column)`                    | 取得指定欄位屬性，Column 為欄位名稱                                                                                                                                   |
| `$dgMaster.value.setColumnTitle({field:field, title:title})` | 設定 datagrid 欄位標題抬頭                                                                                                                                      |
| `$dgMaster.value.importExcel({beforeImport:methodName})`     | 導入 Excel 數據並回存。beforeImport可以不用設定，methodName代表回存到Server端時可以指定一個Server Method來改變任何Excel欄位內容。                                                             |
| `$dgMaster.value.importExcelNotApply()`                      | 導入 Excel 數據但不回存（讓 User 可檢查後再按 `submit` 回存）                                                                                                              |
| `$dgMaster.value.export()`                                   | 將資料表「整份資料」直接輸出成 Excel（xlsx）。後端依目前查詢/排序條件重新取資料、用欄位 title 當表頭，**不需要套表範本**（與 `exportExcel` 不同）。可選參數見下                                                                  |
| `$dgMaster.value.exportWord({param})`                        | 針對某一筆數據以 Word 格式進行套表（param 定義見下）                                                                                                                        |
| `$dgMaster.value.exportWordPdf({param})`                     | 針對某一筆數據以 PDF 格式進行套表（param 請參考 `exportWord`）                                                                                                             |
| `$dgMaster.value.exportExcel({param})`                       | 將資料輸出至 Excel 套表（param 請參考 `exportWord`）                                                                                                                 |
| `$dgMaster.value.exportReport()`                             | 配合 ReportName 屬性印表，格式為 CloudReport 的報表格式                                                                                                                |
| `$dgMaster.value.hide()`                                     | 將 datagrid 隱藏                                                                                                                                           |
| `$dgMaster.value.show()`                                     | 將 datagrid顯示，或在 template 用 `v-show="visible"` 控制                                                                                                        |
| `$dgMaster.value.getChangedDatas()`                          | 傳回 `{ inserted, updated, deleted }` 三個 array，用於自訂送出邏輯                                                                                                   |
| `$dgMaster.value.getDefaultValues()`                         | 依 columns 的 defaultValue 設定算出新增列的預設值物件                                                                                                                  |

#### exportWord / exportWordPdf / exportExcel 的 param 參數

- `fileName`：word 的來源檔案名稱  
- `fileType`：輸出的檔案類型，如 `'doc'` 或 `'pdf'`  
- `directOpen`：是否直接打開檔案（true/false）  
- `downloadName`：指定輸出檔案名稱  
- `password`：是否要有密碼保護（在此設定密碼）  

#### export 的 param 參數（皆為可選）

`export()` 走後端 `mode=exportDataset`（直接匯出資料集，非套表），參數皆可省略：

- `name`：要匯出的資料來源名稱（省略時取目前頁面路徑最後一段）
- `title`：Excel sheet 標題與表頭（省略時等於 `name`）
- `downloadName`：下載檔名（省略時等於 `name`）

```js
// 直接把整個 datagrid 的資料（依目前查詢條件）匯出成 xlsx
$dgMaster.value.export();
$dgMaster.value.export({ title: '客戶清單', downloadName: '客戶清單' });
```

---

## GridColumn

設定 Grid 中顯示的具體欄位。

### DataGrid 編輯中（新增或更改）對 GridColumn 的取值與設值有三種狀態

#### 1. 在 onShowEditor 事件中取值與設值

- 取值：`$dgMaster.value.getRows()[index][fieldName]`（`fieldName` 為欄位名稱）
- 設值：`$dgMaster.value.getRows()[index][fieldName] = value`（`getRows()` 回傳的是 reactive 陣列，直接賦值即可觸發更新）

範例：

```js
function dgMaster_onShowEditor(index, field, editor) {
    if (field === '數量') {
        const rows = $dgMaster.value.getRows();
        const qty = rows[index][field];        // 取得數量的值
        const price = rows[index]['單價'];      // 取得單價的值
        rows[index]['金額'] = qty * price;      // 設定金額
    }
}
```

#### 2. 在欄位間的 onSelect 或 onBlur 事件中取值與設值

- 取值：`$dgDetail.value.getEditorValue(fieldName)`
- 設值：`$dgDetail.value.setEditorValue({ field: fieldName, value: 內容值 })`

範例：

```js
function dgDetail_類別_onSelect(row) {
    const type = $dgDetail.value.getEditorValue('類別'); // 讀取欄位值
    let amt = 0;
    if (type === '含稅') amt = row.金額;
    else amt = row.金額 * 1.05;
    $dgDetail.value.setEditorValue({ field: '金額', value: amt }); // 設定欄位值
}
```

- 動態 readonly／可編輯：透過 `getColumnOption(field)` 取得欄位設定物件後改其 `disabled` 屬性，下次 render 即生效。比 jQuery 直接操作 DOM `.setReadonly()` 更符合 Vue 響應式原則。

範例：

```js
function dgDetail_科目編號_onSelect(row) {
    const col = $dgDetail.value.getColumnOption('性質別');
    col.disabled = (row.性質控制 !== '是');   // true 時設為 readonly，false 時可編輯
}
```

#### 3. DataGrid 瀏覽狀態時對 GridColumn 的取值與設值

- 取值：

```js
const row = $dgMaster.value.getSelected(); // 選中的那筆資料
const val = row.ColumnName;                 // row.ColumnName 可以取得該欄位內容
```

- 設值：

```js
$dgDetail.value.updateRow({ index: i, row: { '金額': amt } });
```

### DataGrid 編輯時，判斷欄位是否有更改異動的方式

DataGrid的Columns (GridColumn) 中個欄位編輯時，並沒有 onChange事件，請改用 onBlur事件，並且針對不同的editor，使用 onSelect事件來處理欄位有異動的事件。

### DataGrid 瀏覽時對 GridColumn 的取值 / 設值

- 取值：

```js
const row = $dgMaster.value.currentRow;
// const row = $dgMaster.value.rows[index];
```

- 設值：

```js
const newRowData = {};
Object.assign($dgMaster.value.rows[index], newRowData);
```

### 明細 DataGrid 加總帶回主表 DataForm（OnTotal）

主從結構中，明細 DataGrid 新增／編輯／刪除資料後，常需要把某些金額欄位的加總帶回主表 DataForm。
做法：在明細 DataGrid 的有加總的欄位設 `Total:"sum"`，並掛 `OnTotal` 事件；事件在「加總值有變化時」觸發，於其中把 `totalRow.欄位` 寫回主表的 `currentRow`。

```js
// 明細 dgDetail 的「金額」欄位 Total:"sum"，dgDetail 設 OnTotal:"dgDetail_onTotal"
function dgDetail_onTotal(totalRow, rows) {
    // totalRow.金額 = 明細所有列「金額」的加總；rows = 明細全部資料
    $dfMaster.value.currentRow.合計金額 = totalRow.金額;          // 寫回主表（reactive，畫面即更新）
    $dfMaster.value.currentRow.稅額   = totalRow.金額 * 0.05;
    $dfMaster.value.currentRow.含稅總額 = totalRow.金額 * 1.05;
}
```

> ⚠️ 一定要寫回 `currentRow`（reactive formState），**不要**寫回 `getRow()`——`getRow()` 是 JSON 複本，賦值不會更新主表畫面。
> 加總值會在明細列數變動、或某筆「有加總的欄位」內容改變時自動重算並再次觸發 `onTotal`，主表加總會即時跟著更新。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 標題 |
| Field | string | 欄位名 |
| ColumnWidth | int | 控制欄位寬度 |
| AlignTop | string | 控制 DataGrid 一筆資料可顯示多列：透過 AlignTop 控制對齊上面的某個欄位；若兩個欄位都對齊同一個欄位還可自動分成兩個 Column，達到一筆顯示多列的效果（顯示/編輯皆有效） |
| Alignment | string | 欄位值對齊方式：`left\right\center` |
| Nowrap | bool | 是否做換行處理 |
| Hidden | bool | 是否隱藏欄位 |
| Sortable | bool | 是否允許排序 |
| Total | string | 計算類型（none 沒有、sum 加總、max 最大值、min 最小值） |
| Showxs | bool | `< 768px` 螢幕尺寸的分段點 |
| Showsm | bool | `>= 768px` 螢幕尺寸的分段點 |
| Format | string | 顯示格式（詳見下） |
| Formatter | string | 事件 `formatter(value,row,index)`：針對欄位自訂顯示格式；必須回傳要顯示的結果（詳見下） |
| Editor | string | 組件類型（若在 DataGrid 直接編輯，此設定才有用） |
| Relation | Collection | 顯示 DisplayMember 值（RemoteName / ValueField / TextField） |

#### Format 顯示格式

1. **日期格式**：`yyyy-mm-dd` 或 `yyyy/mm/dd` 等，`YYY-mm-dd` 代表民國年(YYY要大寫) 
2. **數值**：`Cn`、`Nn`  
   - n 代表小數位數  
   - 例如：`C3`（幣別有 `,` 且小數 3 位）、`N2`（有 `,` 且小數 2 位）  
3. **字串 Mask**：以 `?` 來 Mask 字串  
   - 例如：`??O??`（共顯示 5 碼，中間 1 個 Byte 使用 `O` 顯示）  
   - `????****`（共顯示 8 碼，後面 4 個 byte 使用 `****` 顯示）  
4. **checkbox 格式**：`logic:t,f`  
   - t 代表 True（字元 `Y/y` 或數值 1）的文字內容  
   - f 代表 False（字元 `N/n` 或數值 0）的文字內容  
   - 例如：`logic:是,否`、`logic:通過,不通過`、`logic:男,女`  
   - 若要顯示 checkbox 圖式：設定 `checkbox:True的值`，例如：`checkbox:1`  
5. **FileUpload**：`file,folder`（檔案下載連結）  
6. **Image**：`image,folder,width`（顯示圖檔；folder 代表圖檔目錄，`blob` 代表型態為 blob，width 代表顯示寬度）  
7. **Barcode**：`barcode,type`（顯示條碼；type 代表條碼格式）  
8. **QRCode**：`qrcode,width`（顯示二維碼）  
9. **Map**：`map,width`（顯示地圖）  
10. **Signature**：`signature`（顯示簽名）  
11. **Drilldown**：`drilldown`（配合 drilldown 組件進行資料追蹤）  
12. **FlowFlag**：`flowflag`（顯示該單據流程簽核狀態）  

#### Formatter 說明與範例

- 事件：`formatter(value,row,index)`  
- 參數：`value`（欄位內容）、`row`（整筆資料）、`index`（row 的 index）  
- 必須回傳要顯示的欄位結果

補充：

1. 若使用 formatter 事件又希望以原來的 format 顯示，可用：  
   `function custom_formatter(value, row, index) {
       if (value === '隱藏') return '';
       
       const formatString = 'file;Images'; 
       return $this.getFormatValue(value, row, formatString);
   }`
2. 若 format 為 FileUpload，value 內容只是檔案名稱，實際 src 應為：  
   `"../file?q="+value+"&f=Images"`（f 為目錄名稱）
3. 下載檔案案例：

```js
function dgMaster_上傳檔案_formatter(value, row, index) {
  if (!value) return '';
  return {
    type: 'link',
    text: value,
    folder: 'Files', 
    fileName: row.fileName 
  };
}

function downloadFile(name) {
  if (!name) return;

  const targetUrl = `../file?q=${encodeURIComponent(name)}&f=Files`;
  window.open(targetUrl, '_blank');
}
```

#### Relation（Collection）欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 關聯來源 |
| ValueField | string | 實際值欄位 |
| TextField | string | 顯示值欄位 |

---

## ToolItem

設定 DataGrid 或 DataForm 上面的操作按鈕。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Text | string | 按鈕文字 |
| HelpText | string | 可設定 ToolItem 的按鈕說明 |
| IconCls | string | 按鈕圖示 |
| IconAlign | string | 按鈕圖示位置 |
| BtnCls | string | 按鈕樣式 |
| Hidden | bool | 是否隱藏按鈕 |
| OnClick | string | 按鈕呼叫的 js 方法名稱 |

---

## QueryColumn

DataGrid 或 DataFrom 設定查詢的欄位，屬性為"Columns"，為一個Collection。

### 控制 QueryColumn 視窗的方法

- `$dfMaster.value.queryObj.query()`：執行 QueryColumn 查詢功能  
- `$dfMaster.value.queryObj.clear()`：清空查詢條件  
- `$dfMaster.value.queryObj.close()`：關閉查詢視窗  

當 QueryMode 為 Dialog 時：

- `$dfMaster.value.closeQuery()`：隱藏查詢視窗  
- `$dfMaster.value.openQuery()`：打開查詢視窗  

Columns的Collection，其屬性如下:
### 屬性

| 名稱           | 類型         | 説明                                                                                   |
| ------------ | ---------- | ------------------------------------------------------------------------------------ |
| Title        | string     | 標題                                                                                   |
| Field        | string     | 欄位名                                                                                  |
| NewRow       | bool       | 是否換行，可藉此控制排版                                                                         |
| Span         | int        | 每個欄位佔的欄位空間，可藉此控制排版                                                                   |
| Operator     | string     | 查詢條件運算元：`=` 等於、`!=` 不等於、`>` 大於、`>=` 大於等於、`<` 小於、`<=` 小於等於、`%` 以開始、`%%` 包含、`in` 在範圍之間 |
| Editor       | string     | 組件類型                                                                                 |
| DefaultValue | Collection | 預設值（常數、系統變數或方法）                                                                      |

另外 Columns 欄位取值與設值的方法如同 DataForm 的模式，請參考 DataForm。

---

## DataForm

用來顯示或編輯一筆資料的 Form 組件，欄位定義於 **formColumn** 中。

### dataform 組成的 class（Vue 實際 DOM，非 RWD）

Vue `DataForm` 是 Bootstrap card，**沒有** RWD 的 `modal-title`/`modal-footer`/`form-submit`/`form-close`/`pagination`：

- 整體根：`.bootstrap-form` → `.df-modal`（card）
- 表頭標題：`.card-header h5`
- 表尾：`.card-footer`（按鈕容器 `.card-footer .ms-auto.d-flex`）
- 確定（存檔）按鈕：`.card-footer .btn-primary`
- 取消按鈕：`.card-footer .btn-default`
- 欄位編輯區容器：`.df-input.form-editor`（每欄一個，**無逐欄位 id**）

### DataForm 欄位(Columns)的操作規則（**與 RWD 不同，請務必照這節**）

Vue 模式的 DataForm 欄位**沒有** `DataForm_id + '_' + fieldName` 這種逐欄位 DOM id／逐欄位元件。
（RWD 才有 `#dfMaster_客戶編號`；在 Vue 用 `組件名稱:"dfMaster_客戶編號"` 會回報「元件不存在」而失敗。）

**A. 改變某欄位的「編輯器型態／屬性」（如 textbox 改成開窗選單 refval）：**
這是對「共用 `.json`」的設計時異動，做法**與 RWD 完全相同**——修改 DataForm 元件本身的 `columns`，不是去動某個逐欄位元件：

- `動作`：`更改`
- `組件名稱`：DataForm 的 id（例：`dfMaster`）
- `組件類別`：`dataform`
- `屬性設定.columns`：只列要改的欄位，`editor.type` 指定新型態；refval 必須一併給 `remoteName / valueField / textField` 才可用（只給 `type:"refval"` 雖會切換型態，但開窗無資料來源）。

範例（把「客戶編號」改成開窗選單 refval）：

```json
[
  {
    "動作": "更改",
    "組件名稱": "dfMaster",
    "組件類別": "dataform",
    "屬性設定": {
      "columns": [
        {
          "field": "客戶編號",
          "editor": {
            "type": "refval",
            "remoteName": "客戶資料表.ref_客戶資料表",
            "valueField": "客戶編號",
            "textField": "客戶名稱",
            "valueTitle": "客戶編號",
            "textTitle": "客戶名稱"
          }
        }
      ]
    },
    "事件程式": "",
    "說明": "將 dfMaster 的「客戶編號」欄位編輯器由 textbox 改為 refval 開窗選單"
  }
]
```

> 機制說明：後端把 `Column.Editor` 以 `{type:'<C#類別名camelCase>', options:{...}}` 序列化給 Vue（`ObjectExtensions.GetDataOptions`），`DataForm.vue` 再以 `editor.type` / `editor.options` 取用。`editor.type` 取自載入後的 Editor **物件類別**，因此 `.json` 必須讓載入器把該欄位的 Editor 重建為 Refval（用上面「`組件類別:dataform` + `columns[].editor`」格式即可，與 RWD 同一條路徑；用錯成 `組件名稱:"dfMaster_客戶編號"` 或把 refval 屬性平鋪在 `屬性設定` 頂層都不會生效，產出的 `.vue` 仍是 textbox）。

**B. 執行期在 `.ts` user script 取／設某欄位的值：**
用 ref，不要用 id：

```ts
const row = $dfMaster.value.getRow();      // 取整列（JSON 複本）
const cust = row.客戶編號;                  // 取單一欄位
$dfMaster.value.currentRow.客戶編號 = 'C001'; // 設值（currentRow 為 reactive formState）
```

**C. 預設值／必填／驗證（Vue：沒有獨立的 default／validate 組件）**

> ⚠️ **與舊 RWD/jQuery 不同**：Vue **沒有獨立的 `default` / `validate` 組件**。若仍用 `組件類別:"default"` 去新增獨立組件，Core 會回報 `'xxx'的屬性:'columns.defaultValue'不存在`。

**1. 預設值 → 用 `事件程式` 在 `onLoad` 裡以程式設定**

對**既有的 dfMaster** 下 `動作:"更改"`，把預設值邏輯寫進 `事件程式` 的 `onLoad` 事件函式：

```json
[
  {
    "動作": "更改",
    "組件名稱": "dfMaster",
    "組件類別": "dataform",
    "屬性設定": {},
    "事件程式": "function dfMaster_onLoad(row) {\n    // 新增時才帶預設值，不覆蓋修改模式的既有資料\n    if (!row['英文姓名']) {\n        row['英文姓名'] = $this.getVariableValue('userName');\n    }\n}",
    "說明": "新增時，英文姓名預設為登入者名稱"
  }
]
```

`事件程式` 寫法說明：
- `row` 就是 DataForm 的 `currentRow`（reactive），直接對 `row['欄位名']` 賦值即可更新表單顯示值。
- `$this.getVariableValue('userName')` 取登入者名稱；`$this.getVariableValue('user')` 取登入者編號；`$this.getVariableValue('today')` 取今天日期（`yyyy-MM-dd`）。其他系統變數見附錄 4。
- 加 `if (!row['欄位'])` 判斷，只在欄位為空時帶預設，避免覆蓋修改模式的既有值。
- 常數預設：`row['狀態'] = 'A'`；主檔欄位帶入：`row['客戶編號'] = $this.getVariableValue('parentRow.客戶編號')`（見附錄 4）。

**2. 必填／格式驗證 → `動作:"更改"` 對 `columns` 寫 `required`／`validType`**

| 需求 | 組件類別 | 關鍵屬性 |
|---|---|---|
| 必填 | `dataform` 或 `datagrid` | `{field, required: true}` |
| 格式驗證 | `dataform` 或 `datagrid` | `{field, validType: 'email'}` 等 |

```json
[
  {
    "動作": "更改",
    "組件名稱": "dfMaster",
    "組件類別": "dataform",
    "屬性設定": {
      "columns": [
        { "field": "電子郵件", "required": true, "validType": "email" }
      ]
    },
    "事件程式": "",
    "說明": "電子郵件設為必填，並驗證格式"
  }
]
```

**3. 明細序號自動編號 → 見 AutoSeq 段**（DataGrid 欄位 `defaultValue:"autoseq[...]"`，搭配 `<AutoSeq>` 元件）

### 屬性

| 名稱                     | 類型         | 説明                                                                                                               |
| ---------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| ID                     | string     | 組件名稱，用於識別該組件                                                                                                     |
| RemoteName             | string     | 組件連接的資料源                                                                                                         |
| Columns                | Collection | Form 中顯示的欄位                                                                                                      |
|                        |            | Columns 中的屬性請參考 FormColumn 説明                                                                                    |
| WhereStr               | string     | 固定的過濾條件，如：一開始表單不顯示出資料可以設為 `1=0`（僅提供直接以表單為編輯方式才可使用）                                                               |
| HorizontalColumnsCount | int        | 水平方向顯示的欄位個數                                                                                                      |
| Mode                   | string     | Form 顯示樣式：Dialog / Panel                                                                                         |
| Fit                    | bool       | 自動適應視窗大小                                                                                                         |
| ToolItems              | Collection | 用於設定 Form 上的新增、修改、刪除等按鈕，請參照 ToolItem 屬性設定                                                                        |
| ToolItemsPosition      | string     | Toolitem 顯示的位置（top 上 / bottom 下）（僅提供直接以表單為編輯方式才可使用）                                                              |
| Title                  | string     | Form 顯示標題                                                                                                        |
| QueryColumns           | Collection | 如果此頁面僅有 DataForm，可設定 Form 的查詢欄位，請參考 QueryColumn 屬性設定                                                             |
| QueryMode              | enum       | `Dialog` 打開新窗口顯示查詢條件；`Panel` 在 Form 上方直接顯示；`Fuzzy` 在 Form 上方直接顯示模糊查詢                                             |
| QueryTitle             | string     | 查詢視窗標題                                                                                                           |
| QueryColumnsCount      | int        | 查詢的水平欄位數，預設為 1                                                                                                   |
| DuplicateCheck         | bool       | true 表示存檔時檢測重複性                                                                                                  |
| ValidateStyle          | string     | 驗證模式：Hint（即時驗證）/ Dialog（存檔時驗證）                                                                                   |
| CloseProtect           | bool       | 離開 DataForm 時是否跳出提醒                                                                                              |
| Autocomplete           | bool       | 根據使用者輸入值進行搜索和過濾，讓用戶快速找到並從預設值列表中選擇                                                                                |
| IsShowFlowIcon         | bool       | 顯示 Flow 相關的流程按鈕                                                                                                  |
| AutoPause              | bool       | Flow 用，自動暫停                                                                                                      |
| OnLoad                 | string     | 事件 `onLoad(row)`：Dataform 載入完成時調用；row 為當筆 dataform 的 object，格式 `{field:value,...}`                               |
| OnDelete               | string     | 刪除資料前調用；`return(true)` 可刪除，`false` 不可刪除                                                                          |
| OnApply                | string     | 存檔前調用；`return(true)` 可存檔，`false` 不可存檔                                                                            |
| OnApplied              | string     | 事件 `onApplied(data)`：存檔成功後調用；data 內有多筆 dataform 資料，目前新增 row 為 `data[0].inserted[0]`，目前更改那筆為 `data[0].updated[0]` |
| OnApplyError           | string     | 事件 `onApplyError(msg)`：存檔錯誤時調用，msg 為錯誤訊息                                                                         |
| OnCancel               | string     | Form 取消編輯時調用                                                                                                     |

#### OnApplyError 範例

```js
function dfMaster_onApplyError(message) {
    $this.alert(message, 'danger');
}
```

### 方法

格式為：`$dfMaster.value.methodName(parameters..)`（其中 `$dfMaster` 是該元件的 template ref，請依頁面中 `const $dfMaster = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$dfMaster.value.open({row:r, status:s, keys:k})` | 開啟 dataform：r 傳入 row 資料，s 狀態（`inserted` 新增 / `updated` 更改 / `view` 查看），k 鍵值。例如：`{row: {'EmployeeID':'自動編號','Name': 'Andy Kao'},status: 'inserted',keys:'EmployeeID'}` |
| `$dfMaster.value.close()` | 關閉 dataform。若要關閉整個分頁，請使用 `$this.closeCurrentTab()` |
| `$dfMaster.value.status()` | 傳回 dataform 的編輯狀態：`inserted` / `deleted` / `updated` / `view` |
| `$dfMaster.value.setWhere(whereStr)` | 設定 dataform 的資料條件 |
| `$dfMaster.value.openQuery()` | 打開查詢窗口 |
| `$dfMaster.value.insert_row()` | 新增 |
| `$dfMaster.value.edit_row()` | 編輯 |
| `$dfMaster.value.delete_row()` | 刪除 |
| `$dfMaster.value.view_row()` | 查看 |
| `$dfMaster.value.cancel()` | 取消編輯 |
| `$dfMaster.value.validate()` | 對所有欄位進行檢驗 |
| `$dfMaster.value.getDefaultValues()` | 執行 default 組件上所有欄位的預設值動作 |
| `$dfMaster.value.submit()` | 存檔 |
| `$dfMaster.value.exportWord()` | 印表輸出到 Word |
| `$dfMaster.value.exportReport()` | 印表輸出到 PDF |
| `$dfMaster.value.hideColumn(ColumnName)` | 隱藏指定欄位 |
| `$dfMaster.value.showColumn(ColumnName)` | 顯示指定欄位 |
| `$dfMaster.value.options()` | 讀取或設定屬性，如：`$dfMaster.value.options().RemoteName='xxxx'`（設定資料來源） |
| `$dfMaster.value.loadRow(row)` | 載入一筆 row 資料，row 格式 `{field:value,...}` |
| `$dfMaster.value.getRow()` | 讀取目前筆資料；`row.columnName` 為指定欄位內容 |
| `$dfMaster.value.hide()` | 將 dataform 隱藏（通常用於免登入資料輸入完畢時，在 `onApplied()` 事件中使用） |
| `$dfMaster.value.clear()` | 清空表單欄位內容 |
| `$dfMaster.value.reload()` | 依 dataKeys 從後端重抓目前列資料並覆蓋表單狀態 |
| `$dfMaster.value.setReadonly(v)` | 強制切換**整張表單**唯讀狀態；`v=null` 還原為原本邏輯（依 status / readonly prop 推導） |
| `$dfMaster.value.setColumnReadonly(field, readonly)` | 切換**單一欄位**唯讀（`readonly=true` 唯讀／`false` 可編輯）。會同時處理直接掛在 DataForm 上的欄位與子 DataPanel 內的欄位，並響應式即時重繪 |
| `$dfMaster.value.reloadViewObj()` | 觸發父層瀏覽元件（master DataGrid）重新載入；通常 submit/delete 完成後內部會自動呼叫 |
| `$dfMaster.value.loadDetail()` | 重新載入子表 (detail grid) 的資料，配合 master-detail 結構 |
| `$dfMaster.value.removeLock()` | 解除目前列的 RecordLock 鎖定（搭配 `recordLock=true`） |
| `$dfMaster.value.getParentObj()` | 取得 `{ parentRow, parentForm }` 結構，供 master-detail 預設值或 expression 使用 |
| `$dfMaster.value.exportWord(param)` | 委派給 onExportWord 事件處理 Word 套表（param 同 DataGrid 之 exportWord） |
#### exportWord / exportWordPdf / exportExcel 的 param 參數

- `fileName`：word 的來源檔案名稱  
- `fileType`：輸出的檔案類型，如 `'doc'` 或 `'pdf'`  
- `directOpen`：是否直接打開檔案（true/false）  
- `downloadName`：指定輸出檔案名稱  
- `password`：是否要有密碼保護（在此設定密碼）  

#### 範例

```js
// 以「客戶出貨單」為範本套印 Word
$dgMaster.value.exportWord({ fileName: '客戶出貨單' });

// 指定輸出檔名為 test.pdf，輸出後直接打開並加密碼 123
$dgMaster.value.exportWord({
    fileName: '客戶出貨單',
    fileType: 'pdf',
    downloadName: 'test',
    directOpen: true,
    password: '123'
});

// 以同樣的範本輸出 Excel
$dgMaster.value.exportExcel({
    fileName: '客戶出貨單',
    downloadName: 'test'
});
```

---

## Default

配合 DataForm 或 DataGrid 新增時的欄位預設值。

> ⚠️ **Vue 沒有獨立的 Default 組件**。下表是「預設值」的概念與 `DefaultValue` 取值型別參考；實際設定時是在 `事件程式` 的 `onLoad` 函式裡以 `row['欄位'] = $this.getVariableValue(...)` 設定（見上方「C. 預設值／必填／驗證 §1」與附錄 8）。**不要**用 `組件類別:"default"` 新增獨立組件，Core 會回報「屬性不存在」。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| BindingObjectID | string | 綁定組件 |
| Columns | collection | 預設值具體欄位信息 |

#### Columns 欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Field | string | 欄位名稱 |
| DefaultValue |  |  |

DefaultValue：

- Type：`constant` / `varaible` / `function` / `parent`

1. **Constant**：預設常量  
   - Value：固定值
2. **Varaible**：系統公用變數  
   - Varaible：經由下拉式選單選取(參考附錄 4)
1. **Function**：方法  
   - Function：方法名稱  
   - Parameter：傳入參數
4. **Parent**：主檔關聯（適用於明細檔）  
   - Field：設定來源欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| CarryOn | bool | 是否帶入前一筆的值（前一筆新增或更改的內容） |

---

## Validate

配合 DataFrom 或 DataGrid 的欄位檢驗合法性。

> ⚠️ **Vue 沒有獨立的 Validate 組件**。`required`／`validType` 是 **DataForm／DataGrid 欄位（column）本身的屬性**，比照「C. 預設值／必填／驗證」對該元件下 `動作:"更改"`，於 `屬性設定.columns` 放 `{field, required, validType}`。**不要**用 `組件類別:"validate"` 新增獨立組件。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| BindingObjectID | string | 綁定組件 |
| Columns | collection | 合法性檢驗具體欄位信息 |

#### Columns 欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| Tittle | string | 欄位標題 |
| Field | string | 欄位名稱 |
| Required | bool | 是否必填 |
| Validate |  |  |

Validate：

- Type：`length` / `minLength` / `maxLength` / `range` / `greater` / `less` / `function` / `url` / `mail` / `CID` / `TID` / `UID`

1. **Length**：欄位長度區間  
   - From：欄位長度從  
   - To：到欄位長度
2. **minLength**：最小欄位長度  
   - Length：最小欄位長度
3. **maxLength**：最大欄位長度  
   - Length：最大欄位長度
4. **range**：範圍檢驗  
   - from：範圍起始  
   - to：範圍結束
5. **greater**：大於等於設定值  
6. **less**：小於等於設定值  
7. **function**：調用 JS 方法檢查  
   - function：方法名稱  
   - Message：自定義驗證訊息  
   - 調用 function 時會傳入 value（欄位內容）；如要改變檢核訊息，可改變 `this.message`；`return true` 成功，`false` 失敗  
   - 例如：

```js
function check(value) {
    if (!value) {
        return '這是我的自訂錯誤訊息！'; 
    }
    return true; 
}
window.check = check;
```

8. **url**：驗證是否為網址格式  
9. **email**：驗證是否為 Mail 格式  
10. **CID**：驗證是否確實為大陸身份證  
11. **TID**：驗證是否確實為台灣身份證  
12. **UID**：驗證是否為公司統一編號格式  

---

## FormColumn

設定 DataForm 中具體顯示欄位。

### DataForm 編輯時，判斷欄位是否有更改異動的方式

DataForm 的 Columns（FormColumn）在欄位編輯時，並沒有 onChange 事件，請改用 onBlur 事件；針對不同的 editor，使用 onSelect 事件來處理欄位有異動的情況。

### DataForm 欄位存取的方式

> ⚠️ **取值與設值用不同入口**：`getRow()` 回傳的是 **JSON 複本**（非 reactive），只能用來「讀」；要「寫」一定要用 `currentRow`（reactive formState），否則寫了畫面不會更新。

#### 取值的方法

```js
const addr = $dfMaster.value.getRow().地址;       // 取得「地址」欄位的值（JSON 複本，只讀）
const name = $dfMaster.value.currentRow.CustName; // 也可從 currentRow 讀目前值
```

#### 設值的方法

```js
const row = $dfMaster.value.currentRow;   // currentRow = reactive formState
row.地址 = '台北市大同區';                 // 直接賦值，UI 會自動更新（reactive）
row.CustName = '台塑';
// ✗ 不要用 $dfMaster.value.getRow().地址 = ...：getRow() 是複本，寫了不會更新畫面
```

> 若要一次更新整筆 row（例如載入既有資料），改用 `$dfMaster.value.loadRow({...})`。
> 若要切換整個 DataForm 為唯讀／可編輯，使用 `$dfMaster.value.setReadonly(true|false)`。

### 屬性

| 名稱     | 類型     | 説明                                |
| ------ | ------ | --------------------------------- |
| Title  | string | 標題                                |
| Field  | string | 欄位名                               |
| NewRow | bool   | 是否換行，可藉此控制排版                      |
| Span   | int    | 每個欄位佔的欄位空間，可藉此控制排版                |
| Hidden | bool   | 是否隱藏欄位                            |
| Editor | String | 組件類型，Editor可以設定不同的type，以不同的組件進行編輯 |

---

## DataPanel

類似 DataForm，用來延伸 DataFrom 欄位的顯示或分群顯示（編輯）。

### DataPanel 欄位存取的方式

DataPanel 用來延伸／分群顯示父 DataForm 的欄位，**它的 row 是由父 DataForm 透過 slot props 傳入的**。因此 DataPanel 內欄位的取值與設值都走父 DataForm 的 `getRow()`，不直接透過 DataPanel ref 操作（DataPanel 只暴露 `show / hide / toggle / showColumn / hideColumn` 等方法）。**切換 DataPanel 內某欄位「不可輸入」也是走父 DataForm**：`$dfMaster.value.setColumnReadonly('欄位', true/false)`（見 §11 的 D 範例），不要在 DataPanel ref 上找方法。

#### 取值的方法

```js
const phone = $dfMaster.value.getRow().Phone;     // 即使 Phone 欄位顯示在 dpMaster 內（getRow 為複本，只讀）
const cls = $dfMaster.value.currentRow.Class;     // 即使 Class 欄位放在 dptab_基本資料 內
```

#### 設值的方法

```js
const row = $dfMaster.value.currentRow;   // 設值用 currentRow（reactive），不要用 getRow()
row.Phone = '02-12345678';   // 直接賦值即觸發更新
row.Class = '一般';
```

> 若需要動態切換 DataPanel 顯示／隱藏，仍使用 DataPanel 自身的 ref：
> `$dpgroup_詳細資料.value.hide()` / `.show()` / `.toggle()`
### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| Columns | collection | Panel 中顯示的欄位（Columns 中的屬性請參考 GridColumn 説明） |
| HorizontalColumnsCount | string | 水平方向顯示的欄位個數 |
| Title | string | 標題 |

組件為 DataPanel 時，展開與收合的方法：

```js
import { Collapse } from 'bootstrap';

function setPanelCollapse(mode) {
    $DataPanel1.value?.$el?.querySelectorAll('.panel-collapse').forEach(el => 
        Collapse.getOrCreateInstance(el, { toggle: false })[mode]()
    );
}
// 其中 'DataPanel1'為id，.panel-collapse' 為固定 class 名稱
// mode: 'show' 展開, 'hide' 收合
```

### 方法

格式為：`$DataPanel1.value.methodName(parameters..)`（其中 `$DataPanel1` 是該元件的 template ref，請依頁面中 `const $DataPanel1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$DataPanel1.value.show()` | 展開 panel 內容（在有 title 時對應 fieldset 的 toggle） |
| `$DataPanel1.value.hide()` | 收合 panel 內容 |
| `$DataPanel1.value.toggle()` | 切換 show/hide |
| `$DataPanel1.value.showColumn(name)` | 顯示指定欄位（透傳給內部的 BHtmlForm） |
| `$DataPanel1.value.hideColumn(name)` | 隱藏指定欄位 |

---

## DataList

用來自由排版顯示一筆資料上的各個欄位，可自由組合欄位類型與顯示效果。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| WhereStr | string | 固定的過濾條件，如：一開始表單不顯示出資料可以設為 `1=0` |
| Columns | collection | List 中顯示的欄位 |
|  |  |  |

#### Columns 欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 欄位名稱 |
| ColumnCls | string | 欄位寬度調整（手機介面 / 平版介面 / 電腦介面） |
| Formatter | string | 使用 js 方法調整顯示格式 |

| 名稱 | 類型 | 説明 |
|---|---|---|
| ListCls | string | 寬度調整（手機介面 / 平版介面 / 電腦介面） |
| ViewCommandVisible | bool | 是否顯示瀏覽按鈕 |
| EditCommandVisible | bool | 是否顯示修改按鈕 |
| DeleteCommandVisible | bool | 是否顯示刪除按鈕 |
| EditForm | string | 編輯的 DataForm 組件 ID |
| Pagination | bool | 是否分頁 |
| PageSize | int | 預設分頁筆數 |
| Title | string | List 顯示標題 |
| OnBeforeLoad | string | 在 List 載入前調用的 js 方法名稱 |
| OnLoad | string | 在 List 載入完成時調用的 js 方法名稱 |
| OnSelect | string | 在選中資料時調用的 js 方法名稱 |
| OnUpdate | string | 在資料準備修改時調用的 js 方法名稱 |
| OnDelete | string | 在資料準備刪除時調用的 js 方法名稱 |
| Bordered | bool | 是否要有外框線 |

---

## Layout

排版組件：用來進行表單最外層排版，分割表單上下左右板塊；板塊內通常會有 DataFrom / DataGrid / Tabs / DataPanel 等組件。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Columns | collection | 版面區塊設定 |
|  |  |  |

#### Columns 欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| ContentCls | string | 畫面內容排版調整 |

| 名稱 | 類型 | 説明 |
|---|---|---|
| ContentCls | bool | 版面調整：`container`（固定寬度）/ `container-fluid`（滿版） |

---

## Tabs

多頁籤組件：透過頁籤分類資料顯示。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Tabs | collection | 設定頁籤 |
|  |  |  |

#### Tabs 欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 頁籤標題 |
| Hidden | bool | 是否隱藏此頁籤 |

| 名稱 | 類型 | 説明 |
|---|---|---|
| Mode | string | Tab（頁籤樣式）/ Pill（膠囊樣式） |
| ContainerCls | string | 版面調整：`container`（固定寬度）/ `container-fluid`（滿版） |
| TabCls | string | 畫面標籤排版調整 |
| ContentCls | string | 畫面內容排版調整 |
| Justified | bool | 標籤顯示方式是否以自動調整方式呈現 |
| Stacked | bool | 標籤顯示方式是否以堆疊方式呈現 |
| OnSelect | string | 選中頁籤時調用的 js 方法名稱 |

#### OnSelect 範例

```js
function tabMaster_onSelect(index, title) {
    $this.alert(`第${index + 1}個Tab-${title}-被點擊了`, 'info');
}

```

### 方法

格式為：`$Tabs1.value.methodName(parameters..)`（請依頁面中 `const $Tabs1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$Tabs1.value.select(index)` | 切換到第 `index` 個頁籤（0-based）；同時觸發 `onSelect` 事件 |

### Tab 頁籤操作

1. **隱藏頁籤**：`$Tabs1.value.hideTab('頁簽名稱')`（傳入 `title` 字串或 0-based index；隱藏作用中頁簽會自動切到第一個可見頁簽）
2. **顯示頁籤**：`$Tabs1.value.showTab('頁簽名稱')`（同上，傳入名稱或 index）
3. **切換到指定頁籤**：`function goToTab(index) {
       if ($Tabs1.value) {
           $Tabs1.value.select(index);
       }
   }`
4. **加入 click 事件**：Vue 中，不需要為單一頁籤綁定click事件，可直接利用@onSelect事件

```js
function Tabs1_onSelect(index, title) {
    if (index === 0) {
    } 
}
```

5. **讓頁籤整頁都變成唯讀**：

```js
import { ref } from 'vue';

const isTabReadonly = ref(false);

function setTabReadonly(status) {
    isTabReadonly.value = status; 
}
```

---

## Tree

以樹狀結構方式顯示資料或項目。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| IdField | string | 節點欄位名稱 |
| ParentField | string | 與上一階層的關連欄位 |
| TextField | string | 節點標題欄位名稱 |
| TargetObject | string | 目標 datagrid |
| WhereItems | collection | 對應欄位（見下表） |
| Title | string | Tree 顯示標題 |
| Editable | bool | 是否允許編輯 |
| AllowAdd | bool | 是否允許新增 |
| EditForm | string | 編輯的 DataForm 組件 ID |
| Levels | int | 顯示階層數 |
| NodeIcon | string | 節點圖示 |
| ShowBorder | bool | 是否要有外框線 |
| BorderColor | string | 外框線顏色 |
| Width | int | 寬度 |
| OnBeforeLoad | string | 事件 `onBeforeLoad(param)`：載入資料前觸發。可改變 `param.whereStr` 重新載入 whereStr 指定條件資料。注意：若動態嵌入，必須配合延時的 `$Tree1.value.load()` 重新載入才會生效 |
| OnNodeSelected | string | 事件 `onNodeSelected(event, node)`：選中節點時觸發。node 屬性：`node.row`（選中 Node 資料）、`node.parentId`（上一層 Node 節點對象）、`node.state.selected`（是否允許節點選中：true/false） |
| onRenderNode | string | 事件 `onRenderNode(row)`：每個節點顯示事件，可自訂節點內容並 `return` 回傳；若節點要有 checkbox 或 button，請綁定 onclick 到 function。checkbox 案例可配合 `$Tree1.value.renderNode()` 更新節點內容（見下） |
| OnUpdate | string | 編輯時調用的 js 方法名稱 |

#### WhereItems（collection）欄位

| 名稱 | 類型 | 説明 |
|---|---|---|
| TargetField | string | 目的欄位名稱 |
| Operator | string | 運算元 |
| SouceField | string | 來源欄位名稱 |

#### onRenderNode：checkbox 更新節點內容範例

```js
function updateNodeCheckbox(nodeId, isChecked) {
    if (!$Tree1.value) return;
    // 1. 從 rawData 中找出對應的資料
    const targetRow = $Tree1.value.rawData.find(r => String(r.id) === String(nodeId));

    if (targetRow) {
        // 2. 修改資料的值
        targetRow.FieldName = isChecked ? 1 : 0; 
    }
}
```

若要取得所有 Checkbox 勾選節點：

```js
function getCheckedNodes() {
    if (!$Tree1.value) return [];
    const checkedRows = $Tree1.value.rawData.filter(row => row.FieldName === 1 || row.FieldName === true);

    checkedRows.forEach(row => {
        console.log("找到已勾選的節點:", row);
    });

    return checkedRows;
}
```

### 方法

格式為：`$Tree1.value.methodName(parameters..)`（其中 `$Tree1` 是該元件的 template ref，請依頁面中 `const $Tree1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$Tree1.value.options()` | 讀取或設定屬性，如：`$Tree1.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$Tree1.value.load()` | 載入資料 |
| `$Tree1.value.loadData(data)` | 指定 data 載入資料，data 格式請參考附錄 1 |
| `$Tree1.value.setWhere(WhereStr)` | 設定 tree 的過濾條件 |
| `$Tree1.value.insert_row()` | 新增一筆資料（須配合 EditForm 設定） |
| `$Tree1.value.delete_row()` | 刪除目前節點資料 |
| `$Tree1.value.getSelected()` | 傳回目前被選中的 Node 節點；`object.row` 為選中的 Node 資料 |
| `$Tree1.value.renderNode(class, {fieldName:value})` | 自訂顯示 Tree 格式時，若欄位值改變須以此方法更新節點資料；class 為自定義 class，fieldName 為欄位名稱，value 為更新欄位值 |

## ReportViewer

專門用來配合 **CloudReport** 查詢介面的組件。CloudReport 並沒有查詢的設定，必須配合 **DataGrid** 或 **ReportViewer** 組件來設置查詢欄位。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| ReportName | string | 關聯的報表名稱 |
| QueryColumns | Collection | 查詢欄位，請參考 QueryColumn 屬性設定 |
| Parameters | Collection | 傳遞參數（見下表） |
| DataSources | Collection | 報表上有多個 Table 時，設定其他 Table 的資料來源（見下表） |
| Visible | bool | 是否顯示 |
| Preload | bool | 是否預先載入 |
| Width | string | 寬度 |
| Height | string | 高度 |
| Fit | bool | 自動適應視窗大小 |

#### Parameters（Collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| ParameterName | string | 參數名稱 |
| Value | string | 參數值 |

#### DataSources（Collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| DatasourceName | string | 資料源的名稱 |
| RemoteName | string | 連接的資料源 |

### 方法

格式為：`$ReportViewer1.value.methodName(parameters..)`（請依頁面中 `const $ReportViewer1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$ReportViewer1.value.load()` | 重新載入報表內容 |
| `$ReportViewer1.value.setWhere(whereStr \| whereItems)` | 設定查詢條件並重新載入；`whereItems` 為 array 形式請參考附錄 3 |

---

## FieldOnBlur

欄位計算公式組件，當公式中的任何一個欄位被改變時會自動計算並改變另一個欄位的內容值。通常配合 **DataFrom / DataGrid / DataPanel**。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| BindingObject | string | 綁定組件 |
| Columns | collection | 欄位設定（見下表） |

#### Columns（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 標題 |
| TargetField | string | 目的欄位名稱 |
| Expression | string | 表達式（例如：`合計未稅*0.05`） |

---

## AutoSeq

為明細表（Detail）中的序號欄位自動編號。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| BindingObject | string | 綁定組件 |
| Field | String | 選擇要自動編號的欄位 |
| NumDig | int | 自動序號的位數 |
| StartValue | int | 自動序號的起始數 |
| Step | int | 自動序號的遞增間隔 |

---

## Schedule

行事曆組件。須配合資料的來源作為行事曆的依據。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| TitleField | string | 行事曆標題欄位 |
| TextField | string | 行事曆內容欄位 |
| DateField | string | 行事曆起始日欄位 |
| DateToField | string | 行事曆結束日欄位 |
| DateFormat | string | 日期顯示格式 |
| TimeFormField | string | 行事曆起始時間欄位 |
| TimeToField | string | 行事曆結束時間欄位 |
| TimeFormat | string | 時間顯示格式 |
| Views | string | 行事曆瀏覽形式 |
| DefaultView | string | 預設行事曆瀏覽形式 |
| DefaultItemClass | string | 設定內容樣版 |
| FirstDay | string | 設定以周一或周日為一周的起始 |
| StartHour | int | 開始時間 |
| EndHour | int | 結束時間 |
| TimeSplit | int | 間隔時機 |
| MonthTitle | bool | 是否顯示 Title 內容於月曆上 |
| Editable | bool | 是否可以編輯 |
| AllowAdd | bool | 是否允許新增（若為 true 需搭配 EditForm） |
| EditForm | string | 指定 DataForm（AllowAdd=true 才需設定） |
| OnBeforeLoad | string | 事件 `onBeforeLoad(param)`：載入資料前觸發，可改變 `param.whereStr` 重新載入指定條件資料；`return false` 可不載入資料。注意：若動態嵌入，需配合延時 `$dgMaster.value.load(true)` 重新載入才會生效 |
| OnRenderItem | string | 事件 `onRenderItem(event)`：顯示每筆行事曆時觸發（event 為 object，屬性見下） |
| OnTimeFormat | string | 事件 `onTimeFormat(value)`：View 為 week/day 時，用來設定左邊的時間標題；正常格式為 `'hh:mm'`，可透過此事件修改並 return 新 value |
| OnInsert | string | 事件 `onInsert()`：新增一筆行事曆時觸發 |
| OnUpdate | string | 事件 `onUpdate(row)`：更改一筆行事曆時觸發，row 為目前筆行事曆資料 |

#### OnRenderItem：event 物件屬性

- `class`：用來設定 css 的 class  
- `row`：用來取得行事曆資料內容（`event.row.columnName` 可取得欄位內容）  
- `title`：view 為 week/day 時行事曆標題內容（可更改）  
- `text`：行事曆標題內容（可更改）  
- `monthTitle`：view 為 month 時行事曆標題內容（可更改）  

#### OnRenderItem 範例

```js
function Schedule1_onRenderItem(event) {
    const dept = event.extendedProps["部門"] || '';
    
    if (dept) {
        event.title = `${event.title} (${dept})`;
    }

    return event;
}
```

### 方法

格式為：`$Schedule1.value.methodName(parameters..)`（其中 `$Schedule1` 是該元件的 template ref，請依頁面中 `const $Schedule1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$Schedule1.value.options()` | 可讀取或設定屬性，如：`$Schedule1.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$Schedule1.value.load(true)` | 載入資料 |
| `$Schedule1.value.loadData(data)` | 指定 data 載入資料（data 格式請參考附錄 1） |
| `$Schedule1.value.insert_row()` | 新增一筆行事曆資料 |
| `$Schedule1.value.setWhere(whereStr)` | 設定行事曆的資料條件；若是打開行事曆就要設定條件，請改用 `$Schedule1.value.options().onBeforeLoad` 事件 |

#### 注意（click 連結到別的表單）

如果有配合 `onRenderItem` 去控制 click 連結到別的表單時，請使用 `onClick` 事件處理，並需要註銷原來的 modal 頁面，如下：

```js
function Schedule1_onUpdate(row) {

    // 跳轉邏輯：
    // window.open(`../yourForm?id=${row.id}`);
    
    // 回傳 false，底層的就不會彈出編輯視窗
    return false;
}
```

---

## ClientMove

以開窗顯示一個資料來源並以 datagrid 方式顯示，讓用戶批次勾選資料新增到目的 datagrid 中。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Title | string | 標題 |
| RemoteName | string | 組件連接的資料源 |
| Columns | collection | 欄位設定（見下表） |
| PageSize | int | 設定整批新增的 DataGrid 的 PageSize |
| PageList | Int | 控制分頁顯示的資料筆數，設定除了 10 以外，例如：`20,30,50,100` 讓使用者來選擇 |
| ValidateXss | bool | 是否檢查字元包含特殊符號 |
| Height | int | 設定整批新增的 DataGrid 高度 |
| WhereItems | collection | 過濾條件（見下表） |
| AlwaysInsert | bool | 總是新增 |
| TriggerExpression | bool | 是否在 ColumnMatch 寫入欄位時，觸發 FieldOnBlur 公式自動計算 |
| TargetDataGrid | string | 目標 datagrid |
| KeyFields | collection | 主鍵欄位（見下表） |
| ColumnMatchs | collection | 自動對應欄位設定（見下表） |

#### Columns（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Field | string | 欄位名稱 |
| Format | string | 顯示格式 |

#### WhereItems（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 欄位名稱 |
| Operator | string | 運算元 |
| Value | Collection | Type：`constant/varaible/function/parent`（定義見下） |

Value（Type）：

1. **Constant**：預設常量  
   - Value：固定值  
2. **Varaible**：系統公用變數  
   - Varaible：經由下拉式選單選取(參考附錄 4)  
1. **Function**：方法  
   - Function：方法名稱  
   - Parameter：傳入的參數  
4. **Parent**：主檔關聯（適用於明細檔）  
   - Field：設定來源欄位  

#### KeyFields（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| TargetField | string | 目標欄位名稱 |
| SourceField | string | 來源欄位名稱 |

#### ColumnMatchs（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| TargetField | string | 對方 datagrid 的目的欄位 |
| SourceField | string | 來源（remoteName）的欄位 |
| SourceValue | string | 來源值（取值方式見下） |

SourceValue 取值方式：

- `row`：根據同表欄位，例如 `row['類型']`
- `constant`：固定值，例如 `constant['0']`
- `varaible`：系統公用變數，例如 `varaible[user]`
- `function`：自訂 js 方法，例如 `function['myfun','']`  
  - 自訂方法會自動傳送原始 row 資料到方法中，可透過 `row.ColumnName` 取得欄位資料

### 方法

格式為：`$ClientMove1.value.methodName(parameters..)`（其中 `$ClientMove1` 是該元件的 template ref，請依頁面中 `const $ClientMove1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$ClientMove1.value.options()` | 可讀取或設定屬性，如：`$ClientMove1.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$ClientMove1.value.openMove()` | 打開 ClientMove 的 datagrid 介面 |
| `$ClientMove1.value.addAll()` | 自動選取 ClientMove 所有資料並直接進行新增 |

---

## DrillDown

向下資料追蹤組件，用來針對 DataGrid 進行數據追蹤，可以往下打開一個表單或另一個 DataGrid 來呈現。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| BindingObject | string | 綁定組件（通常為 DataGrid） |
| Columns | string | 設定兩張表單的關聯鍵值（見下表） |
| Mode | string | 開啟方式（Tab / Dialog / Window / table） |
| TargetRemoteName | string | 開啟表單的資料來源 |
| TargetColumns | collection | 開啟目標 DataGrid 欄位（見下表） |
| Page | string | 設定表單作為開啟的瀏覽表單 |
| PageTitle | string | 頁面標題 |
| PageOpenForm | bool | 開啟表單後，是否自動開啟該筆資料的 DataFrom |
| OnFormat | string | 事件 `onFormat(value,row)`：針對要追蹤的欄位進行顯示格式化；格式化後不用再自行調用 `$Drilldown1.value.open()`，系統會自動處理 |
| OnClick | string | 事件 `onClick(row,whereItems)`：當 datagrid 選中資料追蹤時觸發；row 為目前筆資料，會自動傳遞到對方表單；若要傳遞其他參數可自定欄位（例如 `row.Color='Red'`）；whereItems 為 Where 條件（`[]` 多欄位，請參考附錄 3）。必須 `return true` 才會繼續追蹤，`false` 會中斷 |

#### Columns（關聯鍵值）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 資料欄位 |
| Operator | string | 運算元 |
| TargetField | string | 目標資料欄位 |

#### TargetColumns（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Field | string | 欄位名稱 |
| Alignment | string | 欄位值對齊方式：`left\right\center` |
| Sortable | bool | 是否允許排序 |
| Format | string | 顯示格式 |

### 方法

格式為：`$Drilldown1.value.methodName(parameters..)`（其中 `$Drilldown1` 是該元件的 template ref，請依頁面中 `const $Drilldown1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$Drilldown1.value.options()` | 可讀取或設定屬性，如：`$Drilldown1.value.options().targetRemoteName =資料來源;`（動態設定資料來源） |
| `Drilldown('options').pageTitle = '我的資料追蹤標題';` | 設定 pageTitle |
| `$Drilldown1.value.open(row)` | 開啟 drilldown 對象，會根據 mode 決定如何打開；row 為 drilldown 來源資料（示例見下） |

#### $Drilldown1.value.open(row) 使用示例

來源為 datagrid：

```js
function openDrilldownFromGrid() {
    const row = $datagridID.value?.currentRow;
    
    if (row && $drilldownID.value) {
        $drilldownID.value.open(row);
    }
}
```

來源為 dataform：

```js
function openDrilldownFromForm() {
    const row = $dataformID.value?.currentRow; 
    
    if (row && $drilldownID.value) {
        $drilldownID.value.open(row);
    }
}
```

#### 注意：打開 page 表單時的資料取得

drilldown 組件追蹤打開的 page 表單時，會自動傳遞 datagrid 的目前筆資料，可透過以下程式取得：

```js
import { onMounted, ref } from 'vue';
const currentDrillRow = ref(null);

onMounted(() => {
    const drillData = $this.getEncryptParameters('drill');
    
    if (drillData && drillData.drillRow) {
        currentDrillRow.value = drillData.drillRow;
    }
});
```

---

## Literal

HTML 組件，用來插入表單中自由定義的 HTML 或 CSS 內容。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Html | Html | 可以在此使用 HTML 語法設計 |

---

## Label

標題組件，用來顯示一個文字標題或內容。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Text | string | 編輯文字內容 |
| Color | string | 文字顏色 |
| Background | string | 背景顏色 |
| Padding | string | 設定內距 |
| Border | string | 邊框顏色 |
| Font | collection | 可選擇字體 / 大小 / 形式 |
| LabelCls | string | 樣式設定 |
| OnClick | string | 點擊時，調用的 js 方法名稱 |

---

## Image

圖片組件，用來顯示一個圖像的內容。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Src | string | 圖片檔案位置 |
| ImageCls | string | 圖片外框型狀 |
| Style | string | 圖片樣式 |
| OnClick | string | 點擊時，調用的 js 方法名稱 |

---

## Card

看板組件，用來定義一個以卡片作為看板的容器。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| IconCls | string | 圖示 |
| Title | string | 標題 |
| Class | string | 看板背景顏色 |
| Commands | string | 看板按鍵功能（可複選）：`moveTop`（移到頂端）、`moveBottom`（移到底部）、`hide`（隱藏）、`open`（打開） |
| Url | string | 連接網址 |
| Visible | bool | 是否顯示 |
| Large | bool | 是否呈現兩倍寬度 |
| Height | string | 看板高度 |
| OnOpen | string | 點擊看板「打開」功能時，調用的 js 方法名稱 |

---

## Carousel

幻燈片輪播組件。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| PageSize | int | 預設輪播筆數 |
| ImageFolder | collection | 圖片資料夾路徑 |
| ImageField | string | 圖片欄位 |
| CaptionField | string | 標題欄位 |
| URLField | string | 連結網址欄位 |
| BindingObject | string | 綁定組件 |
| Images | string | 未使用資料表來源時，可設定固定的多個圖檔 |
| Interval | Int | 間隔時間 |
| OnClick | string | 點擊時，調用的 js 方法名稱 |

---

## Pivottable

樞紐分析組件，提供用戶自由拖拉欄位進行動態樞紐分析與統計。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| Columns | collection | X 軸項目欄位設定（見下表） |
| WhereStr | string | 固定過濾條件，如：一開始不顯示資料可設為 `1=0` |
| OnLoad | string | 載入時調用的 js 方法名稱 |
| PanelHeight | Int | 樞紐分析表的高度 |
| DigitsAfterDecima | Int | 控制數值小數點位數；0 代表沒有小數 |
| Rows | collection | Y 軸項目欄位設定（見下表） |
| ShowColumns | collection | 要顯示的項目欄位設定（見下表） |
| DefaultColumn | string | 預設統計的欄位 |
| Aggregators | string | 統計方式（可複選） |
| Renderers | string | 呈現方式（可複選） |
| QueryObj | string | 搭配的查詢視窗 id |
| OnClick | string | 點擊時，調用的 js 方法名稱 |

#### Columns（X 軸）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Field | string | 欄位名稱 |
| TableName | string | 定義此欄位來自哪個 Table |

#### Rows（Y 軸）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Field | string | 欄位名稱 |
| TableName | string | 定義此欄位來自哪個 Table |

#### ShowColumns（顯示項目）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Field | string | 欄位名稱 |
| TableName | string | 定義此欄位來自哪個 Table |
| HideInValue | bool | 是否於統計選項中隱藏 |

---

## Gantt

甘特圖組件，用來顯示甘特圖。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| WhereStr | string | 固定過濾條件，如：一開始不顯示資料可設為 `1=0` |
| OnLoad | string | 載入時調用的 js 方法名稱 |
| OnBeforeLoad | string | 載入前調用的 js 方法名稱 |
| RowID | string | Key 欄位（通常為唯一鍵值） |
| ParentID | string | 上層欄位（多層關係時定義上層連結） |
| TextCoumn | string | 甘特圖項目名稱欄位 |
| TextCaption | string | 項目欄位標題 |
| StartDate | string | 起始日期欄位 |
| StartDateCaption | string | 起始日期欄位標題 |
| DurationCaption | string | 期間日期欄位標題 |
| Duration | string | 期間日期欄位 |
| EndDate | string | 結束日期欄位 |
| ActuallyStart | string | 實際起始日期欄位（有則填） |
| ActuallyEnd | string | 實際結束日期欄位（有則填） |
| Progress | string | 進度百分比欄位（無可省略） |
| QueryObj | string | 搭配的查詢視窗 id |
| PanelHeight | int | 樞紐分析表的高度 |
| ShowToday | bool | 是否顯示今天的日期線 |
| ShowGrid | bool | 是否顯示左方的表格資料 |
| ShowStartDateColumn | bool | ShowGrid=True 時，是否顯示起始日期內容 |
| ShowDurationColumn | bool | ShowGrid=True 時，是否顯示期間日數（天） |
| Readonly | bool | 是否為唯讀 |
| AutoSave | bool | 是否自動存檔 |
| Scale | string | 範圍可選：日期 / 星期 / 月份 |
| TitleFormatter | string | 使用 js 方法設定每條甘特圖的浮動 Title 內容 |
| Toolitems | collection | 可添加按鈕 |

---

## PromptDialog

輸入窗口組件：用來讓用戶自由編輯變數或欄位內容，或輸入查詢條件等。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Columns | Collection | Form 中顯示的欄位（Columns 中的屬性請參考 FormColumn 説明） |
| HorizantalColumn | int | 水平方向顯示的欄位個數 |
| Title | string | 標題 |

### 方法

格式為：`$PromptDialog1.value.methodName(parameters..)`（其中 `$PromptDialog1` 是該元件的 template ref，請依頁面中 `const $PromptDialog1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$PromptDialog1.value.show({ onOK: function(row){}, onCancel: function(){} } )` | 開啟 PromptDialog。onOK：按下確定時執行；onCancel：按下取消時執行；row 代表輸入欄位資料，可用 `row.ColumnName` 取得欄位值 |
| `$PromptDialog1.value.show(onOK)` | 簡化呼叫：只傳 onOK callback 也接受 |
| `$PromptDialog1.value.ok()` | 程式自行送出：等同點擊「確定」按鈕（觸發 onOK 並關閉視窗） |
| `$PromptDialog1.value.cancel()` | 程式自行取消：等同點擊「取消」按鈕（觸發 onCancel 並關閉視窗） |
| `$PromptDialog1.value.clear()` | 清空所有輸入欄位內容 |
| `$PromptDialog1.value.getRow()` | 傳回目前輸入的 row 物件（`row.ColumnName`） |

---

## FLcomment

此組件會自動配合該表單的 Workflow，自動顯示流程簽核狀態（簽核過程與簽核意見等）。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |

---

## LineChart

折線圖組件。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| KeyField | collection | 分類項目欄位 |
| DataFields | collection | 資料來源數值欄位（見下表） |
| Title | string | 標題 |
| GroupByKey | bool | 是否將相同 KeyField 的資料合併 |
| Smooth | bool | 是否平滑折線圖線條 |
| Animate | bool | 是否使折線圖動態呈現 |
| LegendShow | bool | 是否顯示圖例說明 |
| LegendLocation | string | 調整圖例位置（方位） |
| LegendPlacement | string | 調整圖例位置（於折線圖內或外） |
| Width | string | 寬度 |
| Height | string | 高度 |
| OnBeforeLoad | string | 載入前調用的 js 方法名稱 |
| OnClick | string | 點擊時調用的 js 方法名稱 |
| QueryObj | string | 搭配查詢使用的 ID，一般為 `dgMasterqueryObj`（datagrid 的 ID + `queryObj`） |

#### DataFields（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Label | string | 目標欄位名稱 |
| Field | string | 欄位名稱 |
| ShowLine | bool | 是否顯示線條 |
| LineWidth | int | 線條寬度 |
| Markerstyle | string | 標記點樣式 |
| ShowPointLabels | bool | 是否顯示標記點的值 |
| FormatString | string | 標記點值的顯示格式 |
| Style | string | 資料顯示格式 |

### 方法

格式為：`$LineChart1.value.methodName(parameters..)`（其中 `$LineChart1` 是該元件的 template ref，請依頁面中 `const $LineChart1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$LineChart1.value.options()` | 可讀取或設定屬性，如：`$LineChart1.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$LineChart1.value.setWhere(WhereStr)` | 設定 linechart 的過濾條件 |
| `$LineChart1.value.load()` | 重新載入資料 |
| `$LineChart1.value.loadData(data)` | 根據 data 內容重新載入資料（data 格式請參考附錄 1） |
| `$LineChart1.value.resize()` | 重新調整統計圖大小（需配合 `setTimeout(...,200)`） |

---

## BarChart

柱狀圖組件。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| KeyField | collection | 分類項目欄位 |
| DataFields | collection | 資料來源數值欄位（見下表） |
| Title | string | 標題 |
| GroupByKey | bool | 是否將相同 KeyField 的資料合併 |
| Stack | bool | 是否以堆疊來源數值欄位來呈現 |
| BarWidth | Int | 柱狀寬度 |
| Animate | bool | 是否使柱狀圖動態呈現 |
| LegendShow | bool | 是否顯示圖例說明 |
| LegendLocation | string | 調整圖例位置（方位） |
| LegendPlacement | string | 調整圖例位置（於柱狀圖內或外） |
| Width | string | 寬度 |
| Height | string | 高度 |
| OnBeforeLoad | string | 在柱狀圖載入前調用的 js 方法名稱 |
| OnClick | string | 點擊時調用的 js 方法名稱 |
| QueryObj | string | 搭配查詢使用的 ID，一般為 `dgMasterqueryObj`（datagrid 的 ID + `queryObj`） |

#### DataFields（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Label | string | 目標欄位名稱 |
| Field | string | 欄位名稱 |
| ShowPointLabels | bool | 是否顯示標記點的值 |
| FormatString | string | 顯示格式 |

### 方法

格式為：`$BarChart1.value.methodName(parameters..)`（其中 `$BarChart1` 是該元件的 template ref，請依頁面中 `const $BarChart1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$BarChart1.value.options()` | 可讀取或設定屬性，如：`$BarChart1.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$BarChart1.value.setWhere(WhereStr)` | 設定 barchart 的過濾條件 |
| `$BarChart1.value.load()` | 重新載入資料 |
| `$BarChart1.value.loadData(data)` | 根據 data 內容重新載入資料（data 格式請參考附錄 1） |
| `$BarChart1.value.resize()` | 重新調整統計圖大小（需配合 `setTimeout(...,200)`） |

---

## PieChart

圓餅圖組件。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| RemoteName | string | 組件連接的資料源 |
| LabelFields | string | 分類項目欄位 |
| ValueFields | string | 資料來源數值欄位 |
| Title | string | 標題 |
| ShowDataLabels | bool | 是否顯示每筆資料所占比例 |
| DataLabelStyle | string | 資料呈現方式：Label（項目名稱）/ Value（數值）/ Percent（百分比） |
| SliceMargin | int | 每塊圓餅圖之間的距離 |
| LegendShow | bool | 是否顯示圖例說明 |
| LegendLocation | string | 調整圖例位置（方位） |
| LegendPlacement | string | 調整圖例位置（於圓餅圖內或外） |
| LegendRows | int | 設定幾個圖例一行 |
| Width | string | 寬度 |
| Height | string | 高度 |
| OnBeforeLoad | string | 在折線圖載入前調用的 js 方法名稱 |
| OnClick | string | 點擊時調用的 js 方法名稱 |
| QueryObj | string | 搭配查詢使用的 ID，一般為 `dgMasterqueryObj`（datagrid 的 ID + `queryObj`） |

### 方法

格式為：`$PieChart1.value.methodName(parameters..)`（其中 `$PieChart1` 是該元件的 template ref，請依頁面中 `const $PieChart1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$PieChart1.value.options()` | 可讀取或設定屬性，如：`$PieChart1.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$PieChart1.value.setWhere(WhereStr)` | 設定 piechart 的過濾條件 |
| `$PieChart1.value.load()` | 重新載入資料 |
| `$PieChart1.value.loadData(data)` | 根據 data 內容重新載入資料（data 格式請參考附錄 1） |
| `$PieChart1.value.resize()` | 重新調整統計圖大小（需配合 `setTimeout(...,200)`） |

---

## ImageList

圖片列表組件，用來顯示多張圖片效果。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 組件資料來源 |
| PageSize | int | 每頁小圖個數 |
| Pagination | bool | 是否顯示分頁導航條 |
| ImageFolder | string | 圖檔目錄 |
| ImageField | string | 圖檔欄位 |
| CaptionField | string | 標題欄位 |
| UrlField | string | 連結內容欄位 |
| BindingObject | string | 綁定組件 |
| Images | string | 未使用資料表來源時，可設定固定的多個圖檔 |
| HorizontalColumns | int | 大螢幕水平排列數 |
| ContainerCls | string | 版面調整：`container`（固定寬度）/ `container-fluid`（滿版） |
| Style | string | 滑鼠滑過圖片時的效果 |
| TextFormatter | string | 可自由設定圖檔下文字格式 |
| onClick | string | 點擊時調用的 js 方法名稱 |

---

## ImageZooms

圖檔放大組件，用來處理圖檔局部放大的顯示效果。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 圖片來源（後端資料庫資料源名稱） |
| Images | string | 非資料表來源的圖片內容，可設定多個 |
| PageSize | int | 每頁小圖個數 |
| ImageFolder | string | 圖片的服務端子目錄 |
| ImageField | string | 小圖片來源欄位 |
| LargeImageField | string | 大圖片來源欄位（可與小圖相同） |
| ZoomType | string | 放大模式：standard（標準）/ drag（拖拉）/ innerzoom（內建放大） |
| Position | string | 放大圖位置：左 / 右 / 上 / 下 |
| ImageWidth | int | 大圖片寬度（高度自動） |
| ZoomWidth | int | 放大框寬度（高度自動） |
| Title | string | 組件標題 |
| OnBeforeLoad | string | 載入前調用的 js 方法名稱 |

---

## Steps

步驟式頁簽組件，專門用來配合步驟式操作（步驟內容與 Tab 頁簽模式類似）。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Steps | string | Step 的步驟標題（可設定多個，與 Tabs 頁簽標題相同） |
| Style | string | Steps 風格：default / arrows / dots / dark（預設標題式 / 箭頭式 / 圓點式 / 深色標題式） |
| Animation | bool | 上下步驟切換時是否有動畫效果 |
| Justified | bool | 標題是否左右撐滿 |
| LastPageLimit | bool | 是否允許退回上一步 |
| AnchorClickable | bool | 標題是否可點擊已切換步驟 |
| Selected | int | 目前執行到第幾個 step（預設 0，表示第一個 step） |
| OnNextClick | string | 下一步事件 |
| OnPrevClick | string | 上一步事件 |

> 註：存檔成功後要跳轉的頁面，要寫在 DataForm 的 **OnApplied** 事件中。

---
## Logon

登入交談框組件：彈出帳號／密碼輸入視窗，提供登入流程。登入成功後透過 `onSuccess` prop 或 `@success` 事件接收結果（`clientInfo` 會自動寫入 `sessionStorage`）。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ID | string | 組件名稱，用於識別該組件 |
| Title | string | 視窗標題（未設定時使用 i18n `logon`） |
| UserText | string | 帳號欄位的標籤文字（預設 `user`） |
| PasswordText | string | 密碼欄位的標籤文字（預設 `password`） |
| ForgetPassword | bool | 是否顯示「忘記密碼」連結（連到 `/account?type=resetP`） |
| Registered | bool | 是否顯示「註冊帳號」連結（連到 `/account?type=registerU`） |
| Designer | string | 帶入 `/account` 路由的 `designer` query 參數 |
| onSuccess | Function | 登入成功時呼叫，參數為後端回傳的 `clientInfo`；亦可改用 `@success` event 接收 |

### 方法

格式為：`$Logon1.value.methodName(parameters..)`（其中 `$Logon1` 是該元件的 template ref，請依頁面中 `const $Logon1 = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$Logon1.value.show()` | 打開 Logon 交談框讓用戶登入。**登入成功後要執行的程式請寫在 `onSuccess` prop 或 `@success` event handler**，不是傳給 `show()` |
| `$Logon1.value.cancel()` | 關閉 Logon 交談框（不觸發登入） |
| `$Logon1.value.logout()` | 讓目前登入的用戶登出（呼叫後端登出 API、清除 `sessionStorage.clientInfo`、跳轉至 `/logon`） |
| `$Logon1.value.changePwd()` | 讓目前登入的用戶變更密碼（跳轉至 `/account?type=changePwd`） |

### 範例：登入／登出切換按鈕

點擊連結時，未登入則開啟登入交談框，已登入則詢問是否登出。登入成功後重新載入主頁；登出後由 `logout()` 內部跳轉至 `/logon`。

```vue
<template>
  <Logon ref="$Logon1" :onSuccess="onLoginSuccess" />
  <a id="loginLink" href="#" @click.prevent="login">{{ loginText }}</a>
</template>

<script setup>
import { ref } from 'vue';

const $Logon1 = ref(null);
const loginText = ref($this.getVariableValue('user') || '未登入');

function login() {
    const user = $this.getVariableValue('user'); // 取得目前登入的帳號
    if (!user) {
        // 沒有登入 → 以 Logon 組件對 EEP 進行登入
        $Logon1.value.show();
    } else {
        // 已登入 → 確認後登出
        confirmLogout();
    }
}

// 登入成功的 callback，由 Logon 元件透過 onSuccess prop 觸發
function onLoginSuccess(clientInfo) {
    loginText.value = $this.getVariableValue('user'); // 顯示目前登入的帳號
    window.location.reload();                          // 重新載入主頁
}

async function confirmLogout() {
    const ok = await $this.confirm('確認登出?');
    if (ok) {
        loginText.value = '未登入';
        await $Logon1.value.logout(); // 內部會清 sessionStorage 並跳轉至 /logon
    }
}
</script>
```

---

## SiteMap

網站地圖組件，用來顯示網站地圖風格。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Aligment | string | 地圖連結對齊（靠左 / 靠中 / 靠右） |
| IconCls | string | 網站地圖圖示 |
| Items | string | 網站地圖項目（見下表） |

#### Items

| 名稱 | 類型 | 説明 |
|---|---|---|
| Caption | string | 項目名稱 |
| URL | string | 連結網址 |

---

## ShoppingCart

購物車組件，專門為購物網站設計；購物車資料須配合後端資料表交互。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 購物車對應的後端資料表 |
| NameField | string | 商品名稱欄位 |
| QuantityField | string | 商品數量欄位 |
| ImageField | string | 商品圖檔欄位 |
| ImageFolder | string | 購物車圖檔目錄名稱 |
| PriceFormatter | string | 格式化價格顯示事件 |
| PanelTitle | string | 購物車 Panel（明細小頁面）標題 |
| PanelHeight | int | 購物車 Panel（明細小頁面）高度（寬度自動） |
| Placement | string | 購物車位置 |
| OnRenderFooter | string | 顯示購物車明細小頁面頁尾（商品與金額加總） |
| OnQuantityChanged | string | 購物商品數量更改事件 |

---

## Counter

計數組件，專門用來處理網頁瀏覽次數。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 後端資料源名稱 |
| KeyField | string | 唯一鍵值欄位 |
| CounterField | string | 計數欄位 |
| Formatter | string | 顯示格式（傳入 Counter 欄位；未設定時則不顯示） |


## TextBox

文字輸入組件，一般標準的輸入組件。

### 屬性

| 名稱        | 類型     | 説明                         |
| --------- | ------ | -------------------------- |
| MaxLength | int    | 最大長度                       |
| TextAlign | string | 文字對齊位置（right 靠右 / left 靠左） |
| Prompt    | string | 提醒文字（例如：請輸入中文）             |
| Readonly  | bool   | 是否為唯讀                      |
| IconCls   | string | 按鈕圖示                       |
| OnBlur    | string | 離開此欄位時，觸發 js 的方法           |
- 存取TextBox的方法，如下
  - 讀取格式：
  - 例如：
```js
const rem = $dfMaster.value['說明'];
```
  - 設值格式：
  - 例如：
```js
$dfMaster.value['說明'] = '我的說明';
```
 - 設定唯讀： // true為唯讀，false可編輯
 - 例如：
```js
function setFieldReadonly(fieldName, isReadonly) {
    // 透過 DataForm 的 setColumnReadonly 切換欄位唯讀；它會在 DataForm 自身欄位
    // 與子 DataPanel 彙整的 panelColumns 中找到該欄位，並響應式更新 editor.options.readonly。
    $dfMaster.value.setColumnReadonly(fieldName, isReadonly);
}

setFieldReadonly('說明', true);
```

---


## TextArea

多行文字組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| MaxLength | int | 最大長度 |
| Rows | int | 欄位佔的欄位空間 |
| Prompt | string | 提醒文字（例如：請輸入中文） |
| ReadOnly | bool | 是否為唯讀 |

- 存取TextArea的方法，如下
  - 讀取格式：
  - 例如：
```js
const rem = $dfMaster.value['說明'];
```
  - 設值格式：
  - 例如：
```js
$dfMaster.value['說明'] = '我的說明';
```
 - 設定唯讀：// true為唯讀，false可編輯
 - 例如：
```js
function setFieldReadonly(fieldName, isReadonly) {
    // 透過 DataForm 的 setColumnReadonly 切換欄位唯讀；它會在 DataForm 自身欄位
    // 與子 DataPanel 彙整的 panelColumns 中找到該欄位，並響應式更新 editor.options.readonly。
    $dfMaster.value.setColumnReadonly(fieldName, isReadonly);
}

setFieldReadonly('說明', true);
```
---

## Combobox

下拉選單組件

### 屬性

| 名稱                | 類型         | 説明                                                                                                                                                    |
| ----------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RemoteName        | string     | 組件連接的資料源                                                                                                                                              |
| FromSysParameters | bool       | 是否使用系統參數表                                                                                                                                             |
| ValueField        | string     | 保存資料值欄位                                                                                                                                               |
| TextField         | string     | 顯示資料欄位                                                                                                                                                |
| Items             | collection | 選項集合                                                                                                                                                  |
| WhereItems        | collection | 過濾條件（見下表）                                                                                                                                             |
| ReadOnly          | bool       | 在 ComboBox 中不可輸入                                                                                                                                      |
| OnBeforeLoad      | string     | 事件 `onBeforeLoad(param)`：當 Combobox 載入數據前觸發；`param.whereStr` 為載入 where 條件，`param.sort` 為排序欄位，`param.order` 為 `"desc"` 或 `"asc"`；`return false` 可不載入資料 |
| OnSelect          | string     | 事件 `onSelect(value)`：當 Combobox 有變動時觸發，value 為變動內容                                                                                                    |
| Mutilple          | bool       | 是否為複選                                                                                                                                                 |
| AllowEmpty        | bool       | 是否添加空白選項                                                                                                                                              |
| MultipleSeparator | string     | 多選資料分隔符號，預設為 `','`                                                                                                                                    |

#### WhereItems（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 欄位名稱 |
| Operator | string | 運算元 |
| Value | string | 值 |

### 方法

格式為：`$combobox.value.methodName(parameters..)`（其中 `$combobox` 是該元件的 template ref，請依頁面中 `const $combobox = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$combobox.value.load(data)` | 重新載入資料；若有設定 data 代表動態載入資料，data 為資料內容（rows），格式請參考附錄 1 |
| `$combobox.value.setWhere(WhereStr)` | 設定 combobox 的過濾條件，WhereStr 為 Where 條件 |
| `$combobox.value.options()` | 讀取或設定屬性，如：`$combobox.value.options().remoteName=資料來源;`（動態設定資料來源） |
| `$combobox.value.getText()` | 取得 combobox 的 textField 顯示內容 |
| `$combobox.value.getValue()` | 取得 combobox 的 valueField 內容值 |
| `$combobox.value.setValue(value)` | 設定 combobox 欄位內容值 |

---

## Refval

開窗選單組件：開窗顯示多筆資料讓用戶選擇並傳回。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 組件連接的資料源 |
| ValueField | string | 保存資料值欄位 |
| TextField | string | 顯示資料欄位 |
| ValueTitle | string | 保存資料值欄位標題 |
| TextTitle | string | 顯示資料欄位標題 |
| Columns | collection | 顯示 grid 中的欄位；未設定時 Grid 顯示 DisplayMember/ValueMember 中設定的欄位（Columns 屬性請參考 GridColumn 説明） |
| PageSize | string | 分頁筆數 |
| PageList | Int | 控制分頁顯示筆數（除 10 外，如：`20,30,50,100` 讓使用者選擇） |
| QueryMode | string | 是否使用模糊查詢（fuzzy） |
| WhereItems | collection | 過濾條件（見下表） |
| ColumnMatches | collection | 自動對應欄位（見下表） |
| ShowValueText | bool | 是否同時顯示 ValueField 和 TextField |
| CheckData | bool | 是否檢查資料重覆 |
| AutoQueryColumn | bool | 是否開窗啟用全欄位查詢功能 |
| PanelTitle | string | 開窗選單標題 |
| ReadOnly | bool | 在 Refval 中不可輸入 |
| Fit | bool | 自動適應視窗大小 |
| OnSelect | string | 事件 `onSelect(row)`：Refval 變動時觸發；row 為選中資料（object），格式 `row.ColumnName` |
| onFocus | string | 事件 `onFocus(row)`：游標進入 Refval 時觸發；row 為選中資料（object），格式 `row.ColumnName` |

#### WhereItems（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 欄位名稱 |
| Operator | string | 運算元 |
| Value | string | 值 |

#### ColumnMatches（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| TargetFieldName | string | 目標資料欄位 |
| SourceFieldName | string | 來源資料欄位 |

#### 觸發打開 Refval 選單

```js
import { ref } from 'vue';
const refval_id = ref(null);

function triggerRefvalPicker() {
    if (refval_id.value) {
        refval_id.value.openPicker();
    }
}
```

### 方法

格式為：`$refval.value.methodName(parameters..)`（其中 `$refval` 是該元件的 template ref，請依頁面中 `const $refval = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$combobox.value.load(data)` | 重新載入資料；若設定 data 代表動態載入資料，data 為資料內容（rows），格式請參考附錄 1 |
| `$refval.value.setWhere(WhereStr)` | 設定 refval 的過濾條件 |
| `$refval.value.getWhereItems()` | 取得 WhereItem 條件，傳回 `whereItem[]`（array） |
| `$refval.value.options()` | 讀取或設定屬性，如：`$refval.value.options().remoteName=動態資料來源;` |
| `$refval.value.doColumnMatch()` | 進行 ColumnMatch 欄位帶值動作 |
| `$refval.value.getText()` | 取得 refval 的 textField 顯示內容 |
| `$refval.value.getValue()` | 取得 refval 的 valueField 內容值 |
| `$refval.value.setValue(value)` | 設定 refval 欄位內容值 |

---

## Options

單選或多選選單組件，可透過 Mode 選擇：勾選選項 / 按鈕 / 開窗勾選 / 開窗表列。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 組件連接的資料源 |
| FromSysParameters | bool | 使用系統參數表 |
| ValueField | string | 保存資料值欄位 |
| TextField | string | 顯示資料欄位 |
| Items | collection | 選項集合 |
| WhereItems | collection | 過濾條件（見下表） |
| Multiple | bool | 是否多選 |
| ShowTextbox | bool | 是否在選項最後增加一個輸入框 |
| Separator | string | 多選時分割字符 |
| Mode | string | 選項樣式：Checkradio / button / dialog / List（勾選選項 / 按鈕 / 開窗勾選 / 開窗表列） |
| Orientation | string | 排列方式：Horizontal（水平）/ Vertical（垂直） |
| ReadOnly | bool | 在 Options 中不可輸入 |
| OnSelect | string | 事件 `onSelect(value)`：Options 變動時觸發，value 為變動內容 |

#### WhereItems（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 欄位名稱 |
| Operator | string | 運算元 |
| Value | string | 值 |

### 方法

格式為：`$options.value.methodName(parameters..)`（其中 `$options` 是該元件的 template ref，請依頁面中 `const $options = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$options.value.load(data)` | 重新載入資料；若設定 data 代表動態載入資料，data 為資料內容（rows），格式請參考附錄 1 |
| `$options.value.options()` | 讀取或設定屬性，如：`$options.value.options().remoteName=資料來源;` |
| `$options.value.setWhere(WhereStr)` | 設定 option 的過濾條件 |
| `$options.value.addItems(value)` | 設定 options 內容；value 為 object，格式 `{text:…, value:…}` |
| `$options.value.getText()` | 取得 options 的 textField 顯示內容 |
| `$options.value.getValue()` | 取得 options 的 valueField 內容值 |
| `$options.value.setValue(value)` | 設定 options 欄位內容值 |

---

## NumberBox

專門用來輸入數值的組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Min | int | 欄位值不能低於此數值 |
| Max | int | 欄位值不能高於此數值 |
| Prompt | string | 提醒文字（例如：請輸入中文） |
| TextAlign | string | 文字對齊方式 |
| Format | string | 顯示格式（N2、C2） |
| ReadOnly | bool | 是否為唯讀 |
| OnBlur | string | 離開此欄位時，觸發 js 的方法 |
- 存取NumberBox的方法，如下
  - 讀取格式：
  - 例如：
```js
const rem = $dfMaster.value['價格'];
```
  - 設值格式：
  - 例如：
```js
$dfMaster.value['價格'] = '0';
```
 - 設定唯讀： // true為唯讀，false可編輯
 - 例如：
```js
function setFieldReadonly(fieldName, isReadonly) {
    // 透過 DataForm 的 setColumnReadonly 切換欄位唯讀；它會在 DataForm 自身欄位
    // 與子 DataPanel 彙整的 panelColumns 中找到該欄位，並響應式更新 editor.options.readonly。
    $dfMaster.value.setColumnReadonly(fieldName, isReadonly);
}

setFieldReadonly('價格', true);
```


---

## Password

用來輸入密碼的組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ReadOnly | bool | 是否為唯讀 |

---

## DateBox

專門用來輸入日期格式的組件（不含時間格式）

### 屬性

| 名稱             | 類型     | 説明                                                                    |
| -------------- | ------ | --------------------------------------------------------------------- |
| Format         | string | 日期格式（yyyy-mm-dd、yyyy/mm/dd），民國年為YYY.mm.dd，用YYY代表民國年                   |
| DataType       | string | 資料庫欄位型態（datetime / varchar8）                                          |
| SelectOnly     | bool   | 是否開放輸入框輸入                                                             |
| PickerPosition | string | 日曆出現位置：top-left（左上）/ top-right（右上）/ bottom-left（左下）/ bottom-right（右下） |
| Prompt         | string | 提醒文字（例如：請輸入中文）                                                        |
| ReadOnly       | bool   | 是否為唯讀                                                                 |
| OnSelect       | string | 事件 `onSelect(value)`：datebox 變動時觸發，value 為變動內容值                       |

### 方法

格式為：`$datebox.value.methodName(parameters..)`（其中 `$datebox` 是該元件的 template ref，請依頁面中 `const $datebox = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$datebox.value.options()` | 讀取或設定屬性，如：`$datebox.value.options().format = 'yyyy.mm.dd'`（日期格式設定） |
| `$datebox.value.getValue()` | 取得欄位內容值 |
| `$datebox.value.setValue(value)` | 設定欄位內容值 |

---

## DateTimeBox

專門用來輸入日期與時間的組件

### 屬性

| 名稱             | 類型     | 説明                                                       |
| -------------- | ------ | -------------------------------------------------------- |
| Format         | string | 日期格式（yyyy-mm-dd、yyyy/mm/dd），民國年格式為YYY.mm.dd，用YYY代表民國年    |
| TimeFormat     | string | 時間格式（hh:ii）                                              |
| DataType       | string | 資料庫欄位型態（datetime / varchar8）                             |
| SelectOnly     | bool   | 是否開放輸入框輸入                                                |
| PickerPosition | string | 日曆出現位置：top-left / top-right / bottom-left / bottom-right |
| Prompt         | string | 提醒文字（例如：請輸入中文）                                           |
| ReadOnly       | bool   | 是否為唯讀                                                    |
| OnSelect       | string | 事件 `onSelect(value)`：datetimebox 變動時觸發，value 為變動內容值      |
| MinView        | string | 可選擇的最小日期時間單位                                             |

### 方法

格式為：`$datetimebox.value.methodName(parameters..)`（其中 `$datetimebox` 是該元件的 template ref，請依頁面中 `const $datetimebox = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$datetimebox.value.options()` | 讀取或設定屬性，如：`$datetimebox.value.options().format = 'yyyy.mm.dd'`（日期格式設定） |
| `$datetimebox.value.getValue()` | 取得欄位內容值 |
| `$datetimebox.value.setValue(value)` | 設定欄位內容值 |

---

## TimeBox

專門用來輸入時間的組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| MinuteStep | int | 每個區間增加/減少的分鐘數 |
| DataType | string | 資料庫欄位型態（datetime / varchar6） |
| ReadOnly | bool | 是否為唯讀 |

### 方法

格式為：`$timebox.value.methodName(parameters..)`（其中 `$timebox` 是該元件的 template ref，請依頁面中 `const $timebox = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$timebox.value.options()` | 讀取或設定屬性，如：`$timebox.value.options().minHour = 8;`（最小為 8 點鐘） |
| `$timebox.value.getValue()` | 取得欄位內容值 |
| `$timebox.value.setValue(value)` | 設定欄位內容值 |

---

## Switch

開關組件，用來選擇或勾選開關項目，可用 Style 設定按鈕或勾選項目。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| OnText | string | 開關開啟時顯示文字 |
| OnValue | string | 開關開啟時保存值 |
| OffText | string | 開關關閉時顯示文字 |
| OffValue | string | 開關關閉時保存值 |
| ReadOnly | bool | 是否為唯讀 |
| Style | string | 顯示樣式（button / checkbox） |
| OnSelect | string | 事件 `onSelect(value)`：switch 變動時觸發，value 為變動內容值 |

### 方法

格式為：`$switch.value.methodName(parameters..)`（其中 `$switch` 是該元件的 template ref，請依頁面中 `const $switch = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$switch.value.options()` | 讀取或設定屬性，如：`$switch.value.options().style='button'` |
| `$switch.value.getValue()` | 取得欄位內容值 |
| `$switch.value.setValue(value)` | 設定欄位內容值 |

---

## Slider

數值滑桿組件，以滑桿設定數值範圍。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Min | int | 最小值 |
| Max | int | 最大值 |
| Step | int | 滑桿值增量 |
| Readonly | bool | 是否為唯讀 |

---

## Fileupload

檔案上傳組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Folder | String | 檔案上傳目錄 |
| ShowType | String | 顯示方式：檔案 / 圖片；image 代表圖形顯示，link 代表檔案下載顯示 |
| DataType | String | 儲存方式：blob / url；url 代表以檔名方式存到欄位，blob 代表以二進位內容存到欄位 |
| Readonly | bool | 是否為唯讀 |
| Editable | bool | 是否啟用編輯圖片功能 |
| UploadOnSave | bool | 是否於資料存檔時才將上傳檔案存入 Server |
| IsAutoNum | bool | 檔名重複時是否自動編號 |
| Multiple | bool | 是否可上傳多檔案 |
| DropEnable | bool | 是否允許拖曳上傳 |
| Filter | String | 限制附檔名 |
| CompressRate | float | 上傳檔案壓縮率 |
| SizeLimit | float | 上傳檔案大小限制 |
| AppCapture | bool | 適用於 App：是否啟用拍照上傳 |
| OnBeforeUpload | String | 事件 `onBeforeUpload(param,fileName)`：上傳前觸發；param.fileName 為新檔名、param.folder 為目錄、fileName 為原始檔名；return true 繼續上傳，false 中止 |
| OnSuccess | String | 事件 `onSuccess(name)`：上傳成功後觸發，name 為上傳後檔名 |

#### 動態修改上傳檔名（範例）

```js
import { ref } from 'vue';

function dfMaster_照片_onBeforeUpload(param, fileName) {
    param.fileName = 'test.jpg'; 
    
    return true; 
}
```

#### 上傳成功提示（範例）

```js
function dfMaster_照片_onSuccess(res) {
    const name = res.name || res.fileName || '檔案';
    
    $this.alert(`${name} upload success`, 'info');
}
```

### 方法

格式為：`$fileupload.value.methodName(parameters..)`（其中 `$fileupload` 是該元件的 template ref，請依頁面中 `const $fileupload = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$fileupload.value.editImage()` | 編輯圖檔 |
| `$fileupload.value.options()` | 讀取或設定屬性，如：`$fileupload.value.options().folder=指定目錄;`（動態目錄） |
| `$fileupload.value.getUrl()` | 取得檔案 URL 地址 |
| `$fileupload.value.getValue()` | 取得欄位內容值 |
| `$fileupload.value.setValue(value)` | 設定欄位內容值 |

---

## Multiinput

多欄位組件：可將單一實體欄位分隔為多個欄位，並可自動欄位格式。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Items | String | 多欄欄位設定（見下） |
| Count | int | 欄位數 |
| Separator | String | 欄位間分隔符號 |
| Readonly | bool | 是否為唯讀 |

Items 屬性內容：

- Text：欄位標題（可包含 `,` 符號）
- ShowTextBox：True/False，該欄位是否需要 TextBox 讓 User 輸入

---

## Qrcode

二維碼組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Height | string | 圖碼高度 |

---

## Signature

簽名組件：提供用戶簽名。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Height | string | 簽名框高度 |
| Color | string | 字體顏色 |
| Background | string | 背景顏色 |
| OnChange | string | 事件 `onChange()`：簽名變動時觸發 |

### 方法

格式為：`$signature.value.methodName(parameters..)`（其中 `$signature` 是該元件的 template ref，請依頁面中 `const $signature = ref()` 的命名替換）

| 名稱與參數 | 說明 |
|---|---|
| `$signature.value.reset()` | 清除簽名重來 |
| `$signature.value.replay()` | 顯示簽名軌跡 |
| `$signature.value.options()` | 讀取或設定屬性，如：`$signature.value.options().Height=指定高度;`（動態高度） |
| `$signature.value.getUrl()` | 取得檔案 URL 地址 |
| `$signature.value.getValue()` | 取得欄位內容值（為二進位內容） |

---

## Map

地圖組件（地圖顯示平台請配合系統設定中的地圖設定）

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Height | int | 地圖高度 |
| ValueType | string | 顯示型態：Latlng（經緯度）/ Address（地址）/ Current（自動定位）/ CurrentAddress（自動定位） |
| Level | int | 地圖顯示級別（數字越小地圖越大） |

---

## Place

定位組件：記錄或顯示裝置定位座標資訊。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| ValueType | string | 顯示型態：Address（地址）/ Latlng（經緯度） |
| ReadOnly | bool | 是否為唯讀 |

---

## DateSelect

日期選項組件：分別選擇年月日，可自訂格式。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Format | string | 日期格式（民國 `YYY年MM月DD日` / 西元 `YYYY年MM月DD日`） |
| YearRangeFrom | string | 可選最小年（預設 今年-50 年；以加減年數設定，如 `-50`） |
| YearRangeTo | string | 可選最大年（預設 今年+10 年；以加減年數設定，如 `+20`） |
| Year | string | 預設值（西元年） |
| Month | string | 預設值（月份） |
| Day | string | 預設值（日，請以 `01~31` 填寫） |
| Prompt | string | 提醒文字（例如：請輸入中文） |
| ReadOnly | bool | 是否為唯讀 |
| OnSelect | string | 事件 `onSelect(value)`：datebox 變動時觸發，value 為變動內容值 |

- 存取DateSelect的方法，如下
  - 例如：
```js
const rem = $dfMaster.value['日期'];
```
  - 設值格式：
  - 例如：
```js
$dfMaster.value['日期'] = '20250101';
```
 - 設定唯讀： // true為唯讀，false可編輯
 - 例如：
```js
function setFieldReadonly(fieldName, isReadonly) {
    // 透過 DataForm 的 setColumnReadonly 切換欄位唯讀；它會在 DataForm 自身欄位
    // 與子 DataPanel 彙整的 panelColumns 中找到該欄位，並響應式更新 editor.options.readonly。
    $dfMaster.value.setColumnReadonly(fieldName, isReadonly);
}

setFieldReadonly('日期', true);
```

---

## EditGrid

特殊 Grid 輸入組件：將單一欄位內容（JSON 格式）以 Grid 呈現多行多列，提供輸入並可回存該欄位。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Column | collection | 欄位定義（見下表） |
| Rows | int | 總共幾列 |
| Values | string | 預設值 |

#### Column（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Title | string | 欄位標題 |
| Editor | collection | EditGrid 中顯示的欄位類型；Columns 屬性請參考 FormColumn 說明（僅支援簡單的 TextBox / NumberBox / ComboBox / DateBox / Switch 等） |

---

## Htmleditor

圖文編輯器組件：較豐富的 HTML 編輯器，可輸入/顯示不同字形與顏色的圖文內容。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Height | int | 文字框高度 |
| ImageHeight | Int | 圖片高度 |
| ImageFolder | string | 圖片上傳目錄 |
| Readonly | bool | 是否唯讀 |
| HtmlAvailable | bool | 是否可直接編輯 Html 語法 |

---

## Creator

資料建檔者組件：自動記錄建檔者與日期時間並回存；欄位自動為唯讀狀態。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| DateField | string | 選擇記錄創建日期時間的欄位 |

---

## Updater

資料更改者組件：自動記錄更改者與日期時間並回存；欄位自動為唯讀狀態。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| DateField | string | 選擇記錄修改日期時間的欄位 |

---

## Scan

掃描組件：開啟條碼或二維碼掃描器進行掃描。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Readonly | bool | 是否唯讀 |
| OnScan | string | 掃描時調用的 js 方法名稱 |

---

## Autocomplete

自動完成選單組件：讓 User 輸入部分內容下拉查詢，選擇後自動完成。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| RemoteName | string | 組件資料來源 |
| TextField | string | 顯示資料欄位 |
| WhereItems | collection | 過濾條件（見下表） |

#### WhereItems（collection）

| 名稱 | 類型 | 説明 |
|---|---|---|
| Field | string | 欄位名稱 |
| Operator | string | 運算元 |
| Value | string | 值 |

---

## Barcode

條碼顯示組件

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Height | int | 條碼高度 |
| Format | string | 條碼格式 |

---

## FlowDesign

流程設計組件：讓 User 自訂動態子流程。需與 WorkFlow 子流程搭配使用，讓後續流程依 User 設定次序進行簽核。

---

## MAUIScan

MAUI 專用掃描組件：讀取條碼或二維碼。

### 屬性

| 名稱 | 類型 | 説明 |
|---|---|---|
| Readonly | bool | 是否為唯獨 |

---

# 附錄：共同的開發規範

## 附錄 1：loadData 注意事項

針對 `loadData` 中的 `data` 參數如透過 Server Method 取得，則須經過 `JSON.parse()` 轉換，如下：

```js
import { ref } from 'vue';
const $dgMaster = ref(null);

function loadGridData(data) {
    if (!$dgMaster.value) return;

    // 如果傳進來的是字串 (Server Method 回傳)，就自動解析；如果已經是陣列，就直接使用。
    let rows = [];
    try {
        rows = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
        console.error('資料解析失敗:', e);
        return;
    }

    $dgMaster.value.loadData({
        rows: rows,
        total: rows.length
    });
}
```


---

## 附錄 2：組件共同原則

所有的Columns欄位組件中的共同原則如下：

### onSelect 事件
當組件有 `onSelect` 事件時，如果欄位內容有變動時，不要使用 `blur()` 或 `change()` 事件來處理，須改用 `onSelect()` 事件。

### getValue() 方法
DataForm 中的所有組件都有 `getValue()` 方法，用來取得其組件的內容值。

- 格式：`const rem = $dfMaster.value[''];`
- 例如：

```js
const rem = $dfMaster.value['說明'];
```

### setValue(value) 方法
DataForm 中的所有組件都有 `setValue(value)` 方法，用來設定其組件的內容值。

- 格式：`$dfMaster.value[''] = '';`
- 例如：

```js
$dfMaster.value['說明'] = '我的說明';
```

### setDisabled(bool) 方法
設定欄位是否不可以編輯（唯讀）。bool 為 `true` 或 `false`。

- 格式：
- 例如：

```js
function setFieldReadonly(fieldName, isReadonly) {
    // 透過 DataForm 的 setColumnReadonly 切換欄位唯讀；它會在 DataForm 自身欄位
    // 與子 DataPanel 彙整的 panelColumns 中找到該欄位，並響應式更新 editor.options.readonly。
    $dfMaster.value.setColumnReadonly(fieldName, isReadonly);
}

setFieldReadonly('費用', true);
```

---

## 附錄 3：whereItems 的定義

WhereItems 的格式如下：

```js
[{field: columnName, operator: '=', value: valuetype[]}, {...}]
```

其中：

- `columnName`：where 的欄位名稱
- `operator`：可以為 `('=','!=','>','<','>=','<=','%','%%','in')` 等
- `valuetype` 共有下列幾種：
  - `row`：根據同表的欄位，如 `row['類型']`
  - `constant`：根據固定值，如 `constant['0']`
  - `varaible`：根據系統公用變數，如 `varaible[user]`
  - `function`：根據自訂的 js 方法，如 `function['myfun','']`
  - `parent`：根據主表的欄位，如 `parent['客戶編號']`

例如：

- `[{field: '編號', operator: '=', value: "parent['客戶編號']"}]`：代表取主表的客戶編號為條件
- `[{field: '組織編號', operator: '=', value: "row['部門']"}]`：代表取部門欄位內容為條件
- `[{field: '金額', operator: '>=', value: "constant['0']"}]`：代表金額大於等於 0 為條件

---

## 附錄 4：系統的公用變數 (系統變數)

### 1）讀取系統公用變數

`$.getVariableValue(Name)`：取得系統公用變數，Name 的定義如下：

- `user`：目前登入用戶編號
- `userName`：目前登入用戶名稱
- `groups`：目前登入用戶的角色／群組／部門（可多個，以 `,` 隔開）
- `database`：登入的資料庫名稱
- `solution`：登入的方案名稱
- `computer`：用戶的 IP 地址
- `locale`：用戶的語言別
- `site`：用戶的公司別
- `today`：今天日期（沒有時間）
- `now`：今天日期時間
- `firstday`：本月首日
- `lastday`：本月末日
- `firstdaylm`：上月首日
- `lastdaylm`：上月末日
- `firstdayty`：本年首日
- `lastdayty`：本年末日
- `firstdayly`：去年首日
- `lastdayly`：去年末日

例如：

```js
// 讀取瀏覽器語言別
const clientInfoStr = sessionStorage.getItem('clientInfo');
const currentLocale = clientInfoStr ? JSON.parse(clientInfoStr).locale : 'zh-tw';

// 讀取目前登入用戶
const userId = $this.clientInfo.value.userID;
```

#### 常用範例
// 取得用戶資訊
var userid = $.getVariableValue('user');        // 用戶編號
var username = $.getVariableValue('userName');   // 用戶名稱
var usergroups = $.getVariableValue('groups');   // 用戶群組

// 取得日期資訊
var today = $.getVariableValue('today');         // 今天日期
var now = $.getVariableValue('now');             // 現在日期時間
var monthFirst = $.getVariableValue('firstday'); // 本月首日
var monthLast = $.getVariableValue('lastday');   // 本月末日

// 取得系統資訊
var dbname = $.getVariableValue('database');     // 資料庫名稱
var clientip = $.getVariableValue('computer');   // 客戶端IP


### 2）改變系統公用變數

`$this.setAppLanguage('')`：

例如（設定指定語言別）：

```js
$this.setAppLanguage('en-us');
```

---

## 附錄 5：RWD 表單的系統公用函數方法

1. `$.alert(message,type)`：系統 alert 訊息；type：`'info'`（一般）、`'warning'`（警告）、`'danger'`（危險警告）
2. `$.confirm(text,function(bool){})`：系統確認框（Dialog）；bool=true 代表確認
3. `$.prompt(prompt,default,function(val){})`：系統 Dialog 輸入框（textbox）

   例如：

```js
async function askForDate() {
    const defaultDate = new Date().Format("yyyy-MM-dd");
    const yymmdd = await $this.prompt('輸入日期(格式:YYYY-MM-DD)?', defaultDate);

}
```

4. `$.openForm(title,formName,onclose)`：以 dialog 形式打開 RWD 表單；onclose 為關閉事件
5. `$.openTab(title,formName)`：以頁簽方式打開 RWD 表單
6. `$.callMethod(serverModule,methodName,param,function(result){ ... })`：調用 Server 端非同步程序（Server Method）
   - `serverModule`：Server 端模組名稱
   - `methodName`：程序方法名稱
   - `param`：傳遞參數（object），如 `{no:x,id:y,qty:z}`
   - 若回傳內容為 table 資料，請用 `JSON.parse()` 轉成 rows

7. `object $.callSyncMethod(serverModule,methodName,param)`：調用 Server 端同步程序（Server Method），等待執行完畢才回傳 object
   - 若回傳內容為 table 資料，請用 `JSON.parse()` 轉成 rows

8. `$.callProc(procName,param,function(result){ ... })`：調用 Server 端非同步 PROC（Procedure 模組）
   - 若回傳內容為 table 資料，請用 `JSON.parse()` 轉成 rows

9. `object $.callSyncProc(procName,param)`：調用 Server 端同步 PROC（Procedure 模組）
   - 若回傳內容為 table 資料，請用 `JSON.parse()` 轉成 rows

10. `$dgMaster.value.showLoading`：顯示進度條（顯示到指定 classid 上）

```js
$dgMaster.value.showLoading('處理中...'); // 顯示於 dgMaster 上
```

11. `$dgMaster.value.hideLoading`：關閉進度條（關閉指定 classid 上的進度條）

```js
$dgMaster.value.hideLoading(); // 關閉 dgMaster 的進度條
```

12. `$.getParameters()`：取得表單打開時傳入的網頁參數（如 `NO=5060&NAME=DISK&TYPE=INERT`）
    - `$.getEncryptParameters()`：取得功能選單（MENU）打開表單所傳參數（如 Workflow 表單），例如 `(P=MAIN)` 或流程活動 Parameters
    - 因 MENU 傳參數會加密，需解密後使用

13. `rows = JSON.parse(json)`：將 json 資料轉成 rows 集合
14. `$.downloadFile(fileName,textContent)`：下載 TXT/CSV 等文本檔
15. `$.loadHtml(TargetDiv,SourceHtml,SelectorDiv)`：更換目前網頁某一個 div 區塊的內容
16. `$.syslog(Subject,Remark)`：開發者自行記錄使用者 log（類別固定為 `"UserDefine"`）

---

## 附錄 6：RWD 表單常用的表單控制

### 1. `window.top.changeTheme(theme)`：切換使用者 Runtime 主題  
   - theme：`'default'/'black'/'voilet'/'blue'/'yellow'`

若只要更換某一個表單的主題，可以使用：

```js
// 發送訊息給父視窗 Main.vue 換主題
function changeGlobalTheme(themeName) {
    window.top.postMessage({ 
        type: 'THEME_CHANGE', 
        theme: themeName 
    }, '*');
}

changeGlobalTheme('black');
```

主題可自行更換為：  
`bootstrap_black.css / bootstrap_blue / bootstrap_violet / bootstrap_yellow / bootstrap_default` 等。

### 2. 打開表單時收合主畫面選單（菜單）：

```js
import { onMounted } from 'vue';

onMounted(() => {
    window.top.postMessage({ method: 'toggleSide', action: 'close' }, '*');
});
```

### 3. 控制表單關閉時進行確認或執行一個方法（範例）：

```js
async function handleCloseForm() {
    const isConfirm = await $this.confirm('資料尚未存檔，確定要關閉嗎？', 'warning');
    
    if (isConfirm) {     
        $this.closeCurrentTab();
    }
}
```

### 4. 彈出視窗顯示 QRCode (範例)：

```vue
<template>
  <div v-if="qrUrl" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-sm modal-dialog-centered">
      <div class="modal-content text-center p-4">
        <qrcode-vue :value="qrUrl" :size="200" class="mx-auto mb-3" />
        
        <button class="btn btn-primary" @click="qrUrl = ''">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QrcodeVue from 'qrcode.vue';

// 宣告一個變數存放網址
const qrUrl = ref('');

// 呼叫範例：把網址塞進去，視窗就會自動彈出來
function testOpenQR() {
    qrUrl.value = "[https://your-domain.com/checkin](https://your-domain.com/checkin)";
}
</script>
```

### 5. 在 EEP 的主畫面中：
   - 5.1 更換 logo：

```js
window.top.postMessage({ 
    type: 'UPDATE_BRANDING', 
    logo: 'images/logo.png', 
}, '*'); // logo 例如 'images/logo.png'
```

   - 5.2 更換首頁的圖檔：

```js
window.top.postMessage({ 
    type: 'UPDATE_BRANDING', 
    bg: 'images/bg_main.png' 
}, '*'); // home 例如 'images/bg_main.png'
```

### 6. 在 RWD 表單打開時就要新增 DataForm 的資料

依表單上是否有 DataGrid 採用不同事件：

- **6.1 有 DataGrid 時：使用 DataGrid 的 onLoad 事件**

```js
let loaded = false;
function dgMaster_onLoad() {
    if (!loaded) {
        $dgMaster.value.insert_row();
        loaded = true;
    }
}
```

- **6.2 沒有 DataGrid 時：使用 DataForm 的 onLoad 事件**

```js
let loaded = false;
function dfMaster_onLoad() {
    if (!loaded) {
        $dfMaster.value.insert_row();
        loaded = true;
    }
}
```

### 7. DataForm 下面的按鈕要改文字內容

確定／取消鈕文字來自系統語系，於 `dfMaster_onLoad` 等 DOM 繪出後改 `textContent`。
Vue DataForm 的鈕在 `.card-footer`：確定＝`.btn.btn-primary`、取消＝`.btn.btn-default`（**不是** RWD 的 `.form-submit`/`.form-close`）：

```ts
function dfMaster_onLoad() {
    setTimeout(() => {
        const el = $dfMaster.value?.$el as HTMLElement;
        if (!el) return;
        const submitBtn = el.querySelector('.card-footer .btn-primary');
        const closeBtn  = el.querySelector('.card-footer .btn-default');
        if (submitBtn) submitBtn.textContent = '存檔';
        if (closeBtn)  closeBtn.textContent  = '放棄';
    }, 100);
}
```

> **重要架構限制（先讀這段，再看以下所有案例）**
>
> Vue 前端的 `DataForm` **只有一個無名預設 slot**，**沒有** `#after-<欄位>`、`#footer-prepend` 等具名 slot；`Card` 等元件也沒有。
> JSON → `.vue` 由後端 `RWDPage.RenderVue()` 產生：你寫的程式只會以 **user script（`.ts`）原樣注入 `<script setup>`**，**無法**產生 `<template>` 內的 slot 標記；不在 `RWD_Vue_表單組件屬性.md` 列出的屬性 `RenderVue()` 會**直接忽略**（所以把按鈕塞成 dfMaster 的 `footer-prepend` 屬性，按鈕永遠不會出現）。
>
> 因此「在欄位後面加按鈕／在確定鈕前加按鈕／欄位後放連結」這類自訂 UI，**一律寫進 `.ts` user script**，在 `<id>_onLoad` 事件（或 `onMounted`）裡用 DOM 建立元素並掛事件 —— 這是 Vue 模式唯一能通過 pipeline 的做法（等同 RWD 模式 `RWD_表單組件屬性.md` 附錄6 #8+#9，只是改用 Vue runtime）。
> **不要**用 `動作=新增`、`組件名稱=dfMaster` 去重建已存在的元件（會與既有 dfMaster 衝突報錯）；自訂行為的 `組件名稱` 留空，全部寫在 `事件程式`。

### 8. DataForm 電子郵件欄位後面加一顆「發送EMAIL」按鈕並呼叫 Server Method

DataForm 欄位沒有固定 `id`，以 `label` 文字定位欄位的 `.df-input` 容器後插入按鈕；`dfMaster_onLoad` 觸發時 DOM 尚未繪出，沿用既有範例慣例以 `setTimeout(...,100)` 等待（或 `nextTick`）。按鈕點擊以真實的 `$this.callMethod` 非同步呼叫後端 `sendMail`：

```ts
// 以 label 文字找出某欄位的編輯區容器（.df-input）
function findFieldEditor(formEl: HTMLElement, label: string): HTMLElement | null {
    const labels = formEl.querySelectorAll('label.col-form-label');
    for (const lb of Array.from(labels)) {
        if ((lb.textContent || '').trim() === label) {
            return (lb.parentElement?.querySelector('.df-input') as HTMLElement) || null;
        }
    }
    return null;
}

function dfMaster_onLoad(row) {
    setTimeout(() => {
        const el = $dfMaster.value?.$el as HTMLElement;
        if (!el) return;
        const editor = findFieldEditor(el, '電子郵件');
        if (!editor || editor.querySelector('.js-send-mail')) return;   // 防重複插入
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-primary btn-sm ms-2 js-send-mail';
        btn.textContent = '發送EMAIL';
        btn.addEventListener('click', sendMail);
        editor.appendChild(btn);
    }, 100);
}

async function sendMail() {
    const row = $dfMaster.value.getRow();
    if (!row.電子郵件) {
        $this.alert('請先輸入電子郵件', 'warning');
        return;
    }
    // 第一參數為 design/server/<方案>/<模組>.json 的檔名（ServerModule）
    const result = await $this.callMethod('ServerModule', 'sendMail', {
        email: row.電子郵件,
        員工編號: row.員工編號,
        姓名: row.姓名
    });
    $this.alert(result || 'EMAIL 已發送', 'info');
}
```

### 9. 調用後端 Server Method

Vue 模式只有 **非同步** 一種：`$this.callMethod(module, method, parameters)` 回傳 `Promise`，用 `await` 取結果。
**沒有 callback 參數、也沒有 `callSyncMethod`**（RWD 模式那兩種寫法在 Vue 一律無效）。
`module` 為 `design/server/<方案>/<模組>.json` 的檔名；錯誤已由 `callMethod` 內部 `showError` 處理。

```ts
async function sendMail(to) {
    const result = await $this.callMethod('ServerModule', 'sendMail', { to });
    $this.alert(result, 'info');
}
```

> 函式內若要呼叫，外層需為 `async`；屬性層級事件（如 `FieldOnBlur`）也支援 `async` 函式。

### 10. 調整 DataForm 內欄位的上下間距

CSS 寫在 SFC 的 `<style scoped>`，不要用 jQuery 改：

```vue
<style scoped>
:deep(.dfMaster .form-editor) {
    margin-bottom: 3px;   /* 上下間距調整成 3px */
}
</style>
```

### 11. 依「欄位值」或「登入者條件」連動：隱藏頁簽 / 欄位、設不可輸入、自動帶值

DataForm **沒有逐欄位 onChange/onShowEditor 事件**（`onShowEditor` 只在 DataGrid 直接編輯時有效）。
連動一律用 `.ts` 對 `$dfMaster.value.currentRow`（reactive formState）做 `watch`，再呼叫已暴露的 API：
`hideColumn(欄位)/showColumn(欄位)`（**隱藏/顯示整個欄位**）、`setColumnReadonly(欄位, bool)`（**保留顯示但不可輸入/可輸入**，單一欄位）、`setReadonly(bool)`（整張表唯讀）。
> 「不可輸入」要用 `setColumnReadonly`，不是 `hideColumn`（後者會整欄消失）。`setColumnReadonly` 對「DataForm 直接欄位」與「DataPanel 內欄位」都有效。**注意**：若欄位在 DataPanel 內，首次設定要等子元件掛載（欄位才彙整進 `panelColumns`），故初次套用建議放在 `nextTick(...)`（見下方 D 範例）。
`Tabs` 元件已提供 `hideTab(標題或index)` / `showTab(...)`（標題比對 `title` 或 `name`），隱藏的頁簽其按鈕與內容都會收起；若隱藏的是作用中頁簽會自動切到第一個可見頁簽。

```ts
function dfMaster_onLoad(row) {
    // A) 依「欄位值」連動：員工狀態=離職 → 隱藏「家庭資料」頁簽；性別=女 → 兵役不可輸入
    watch(
        () => [$dfMaster.value?.currentRow?.員工狀態, $dfMaster.value?.currentRow?.性別],
        ([狀態, 性別]) => {
            if (狀態 === '離職') $tabMaster.value.hideTab('家庭資料');
            else                 $tabMaster.value.showTab('家庭資料');
            if (性別 === '女') $dfMaster.value.hideColumn('兵役');   // hideColumn=整欄隱藏
            else               $dfMaster.value.showColumn('兵役');
        },
        { immediate: true }
    );

    // D) 依「欄位值」連動欄位「不可輸入」（保留顯示）：性別=女 → 兵種階級不可輸入，=男 → 可輸入
    //    兵種階級在 DataPanel 內，首次要等掛載後（欄位進 panelColumns）才設得到，故用 nextTick。
    //    ⚠️ switch 編輯器在「新增」時若沒存過值，row.性別 是空字串（畫面雖顯示 offValue「女」），
    //       所以判斷要用「!== 男（onValue）」而非「=== 女」，預設/空值才會正確視為女、初始就套唯讀。
    const applyMilitary = () => {
        $dfMaster.value.setColumnReadonly('兵種階級', row.性別 !== '男');
    };
    nextTick(applyMilitary);            // 初次（含新增的預設狀態與編輯既有資料）
    watch(() => row.性別, applyMilitary); // 之後每次切換性別

    // B) 自動帶值：輸入「戶籍地址」後，「聯絡地址」預設成戶籍地址（空才帶，避免覆蓋使用者輸入）
    watch(
        () => $dfMaster.value?.currentRow?.戶籍地址,
        (v) => {
            const r = $dfMaster.value?.currentRow;
            if (r && v && !r.聯絡地址) r.聯絡地址 = v;
        }
    );
}

// C) 依「登入者條件」（例如部門/群組）隱藏頁簽
function dfMaster_onLoad2() {
    const groups = $this.getVariableValue('groups') || '';
    if (groups.indexOf('99') >= 0) $tabMaster.value.showTab('進階');
    else                            $tabMaster.value.hideTab('進階');
}
```

> `watch` / `nextTick` 由 `vueRWD.js` 樣板已 import，user script 可直接用，不需自行 import。`currentRow` 是 `DataForm.vue` `defineExpose` 出來的 reactive `formState`，改它即同步畫面。`$tabMaster` 依頁面中 Tabs 的 ref 命名替換。

### 12. 在 QueryColumns 的欄位中取值與設值

QueryColumns 的欄位資料統一存在 DataGrid 的 query state，透過 `$dgMaster.value.options().queryRow` reactive 物件讀寫：

```js
function dgMaster_onLoad(data) {
    const queryRow = $dgMaster.value.options().queryRow;
    const yymm = queryRow['結算年月'];   // 讀取
    queryRow['子公司'] = 'tpe';           // 設值
}
```

### 13. 利用事件存取 QueryColumns 範圍查詢欄位

範圍查詢時 from / to 兩個欄位以同名 + 後綴存於 queryRow（依 designer 命名約定，以下為示意）：

```js
function dgMaster_訂單日期_onSelect(date) {
    const queryRow = $dgMaster.value.options().queryRow;
    const fromDate = queryRow['訂單日期_from'];     // 取出從訂單日期(>=)
    const addDate = addDays(fromDate, 30);           // 加 30 天
    queryRow['訂單日期_to'] = addDate;               // 設定至訂單日期(<=)
}
```

> 詳細欄位 key 名稱請參考 designer 產生的 `queryColumns` 定義；亦可透過 `setWhere(whereStr)` 直接指定 SQL 條件。

### 14. 針對某個流程活動控制表單的狀態

`param.ActivityText` 為目前流程活動名稱：

```js
function dfMaster_onLoad(row) {
    const flowParam = $this.getEncryptParameters();    // 取得流程參數
    if (flowParam && flowParam.ActivityText === '財務審核') {
        // 動態切換 dpgridDetail 上「核發金額」欄位的 disabled 狀態
        const col = $dpgridDetail.value.options().columns
            .find((c) => c.field === '核發金額');
        if (col) col.disabled = false;     // 財務審核時才能更改
    }
}
```

### 15. DataGrid 條件樣式（rowStyler）與命令鈕顯隱

- **逐列樣式：用 `rowStyler` 事件**（`DataGrid.vue` 的 `rowStyle()` 會 `$.invoke(rowStyler,index,row)` 套到 `<tr :style>`）。函式回傳 CSS 字串即可，**不要用 DOM**。
- **命令鈕顯隱：`editCommandVisible/deleteCommandVisible/viewCommandVisible` 在 Vue 是「整個 grid 的布林」**（非逐列函式）。依登入者部門等全域條件，於載入時設定其 ref 值即可；逐列差異請改用 `rowStyler` 上色呈現。

```ts
// A) 未聯繫天數 > 50 → 整列淺紅底（rowStyler 事件，命名為 <gridId>_rowStyler）
function dgMaster_rowStyler(index, row) {
    if (Number(row.未聯繫天數) > 50) return 'background-color:#f8d7da;color:#842029;';
    return '';
}

// B) 依登入者部門，整批顯示/隱藏更改‧刪除鈕（全域布林，非逐列）
function dgMaster_onLoad() {
    const dept = $this.getVariableValue('groups') || '';
    const allow = dept.indexOf('10') >= 0 || dept.indexOf('20') >= 0;
    $dgMaster.value.editCommandVisible = allow;
    $dgMaster.value.deleteCommandVisible = allow;
}
```

> 「只顯示負責業務＝登入者 / 只顯示申請人＝user」這類過濾，用 `dgMaster_onBeforeLoad(param){ param.whereStr = "負責業務=N'"+($this.getVariableValue('user'))+"'" }`（`DataGrid.vue` load 會套用 `loadParam.whereStr`）。

### 16. 在 DataForm 下方的確定按鈕前添加一個按鈕

footer 沒有 slot（見本章開頭限制）。確定／取消鈕在 `.card-footer` 內的 `.ms-auto.d-flex` 容器，於 `dfMaster_onLoad` 用 DOM 把自訂鈕插到它最前面：

```ts
function dfMaster_onLoad() {
    setTimeout(() => {
        const el = $dfMaster.value?.$el as HTMLElement;
        const bar = el?.querySelector('.card-footer .ms-auto') as HTMLElement;
        if (!bar || bar.querySelector('.js-custom')) return;     // 防重複插入
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary me-2 js-custom';
        btn.textContent = '自訂按鈕';
        btn.addEventListener('click', onCustom);
        bar.insertBefore(btn, bar.firstChild);                   // 置於「確定」鈕之前
    }, 100);
}

function onCustom() {
    // 自行定義執行的程式；如需呼叫後端用 await $this.callMethod(...)
}
```

### 17. alert 訊息

請改用 `$this.alert(訊息內容, type)`：

```js
if (ret) $this.alert('執行結果:' + ret, 'info');
else     $this.alert('執行錯誤:' + err, 'danger');
```

### 18. DataForm 欄位後方插入連結、並打開另一個表單

沿用 §8 的 `findFieldEditor`，在欄位後插入 `<a>`，點擊用 `$this.addTab` 開新 Tab。
讀取 query 參數請用 `URLSearchParams`（pageApi **沒有** `getParameter`；加密參數才用 `$this.getEncryptParameters()`）：

```ts
function dfMaster_onLoad(row) {
    setTimeout(() => {
        const el = $dfMaster.value?.$el as HTMLElement;
        if (!el) return;
        const editor = findFieldEditor(el, '請假年度');   // findFieldEditor 見 §8
        if (!editor || editor.querySelector('.js-leave-link')) return;
        const a = document.createElement('a');
        a.className = 'ms-2 js-leave-link';
        a.style.cursor = 'pointer';
        a.textContent = '請假狀況';
        a.addEventListener('click', openLeaveStatus);
        editor.appendChild(a);
    }, 100);
}

function openLeaveStatus() {
    const row = $dfMaster.value.getRow();
    $this.addTab({
        title: '請假狀況表',
        id: '請假狀況表',
        src: `bootstrap/請假狀況表?year=${row.請假年度}&user=${row.申請人}`
    });
}

// 對方表單載入時取 query 參數設定 Where 條件
function dgMaster_onBeforeLoad(param) {
    const q = new URLSearchParams(window.location.search);
    const year = q.get('year');
    const user = q.get('user');
    if (year && user) {
        param.whereStr = `年度 = '${year}' AND 員工編號='${user}'`;
    }
}
```

### 19. DataPanel 整個 Panel 設為唯讀

DataPanel 接受 `readonly` prop；亦可透過父 DataForm 的 `setReadonly` 一次切換整張表單。

```vue
<template>
  <DataPanel ref="$dpgroup_詳細資料" :readonly="isReadonlyPanel" ... />
</template>

<script setup>
import { ref } from 'vue';
const isReadonlyPanel = ref(true);    // true = 整個 panel 唯讀
// 或：$dfMaster.value.setReadonly(true);   // 整張 DataForm 唯讀
</script>
```

### 20. DataForm 所有欄位標題都靠左

寫在 SFC 的 `<style scoped>`，不需要 Literal 組件：

```vue
<style scoped>
@media (min-width: 768px) {
    :deep(.form-horizontal .control-label) {
        text-align: left;
    }
}
</style>
```

### 21. 控制 DataForm 某欄位與標題顏色

Vue DataForm 欄位沒有 id、label 也沒有 `for`，無法用 `#dfMaster_員工編號` / `label[for=...]` 選取。
做法：在 `dfMaster_onLoad` 用 §8 的 `findFieldEditor` 找到該欄位容器，加一個標記 class，再用 scoped CSS 著色：

```ts
function dfMaster_onLoad() {
    setTimeout(() => {
        const el = $dfMaster.value?.$el as HTMLElement;
        if (!el) return;
        const editor = findFieldEditor(el, '員工編號');     // findFieldEditor 見 §8
        if (!editor) return;
        editor.classList.add('hl-emp');                      // 欄位內容
        editor.closest('.row')?.querySelector('label')?.classList.add('hl-emp-label'); // 標題
    }, 100);
}
```

```vue
<style scoped>
:deep(.hl-emp-label) { color: blue; }   /* 標題顏色 */
:deep(.hl-emp) { color: green; }        /* 欄位內容顏色 */
</style>
```

### 22. 動態切換 DataGrid 的資料來源 RemoteName

```js
function reLoad() {
    $dgMaster.value.options().remoteName = '薪資發放.薪資發放統計';
    $dgMaster.value.load();    // 重新載入資料
}
```

> 若要完全 Vue-style，可把 `remoteName` 綁成 reactive ref（`<DataGrid :remoteName="rn" />`），更新該 ref 即觸發重新載入。

### 22.1 DataGrid 工具鈕呼叫 Server Method 並把結果回填表格

`DataGrid.vue` 沒有暴露 `loadData`；要把 Server Method 回傳的資料顯示到表格，請對**已暴露的 reactive `getRows()` 陣列**做 `splice` 取代（會即時更新畫面）。
工具鈕：在 dataform/datagrid 的 `toolItems` 加一顆，`onclick` 指向函式名（事件程式寫該函式）。

```ts
// toolItems: [{ text:'未聯繫客戶', iconCls:'fa fa-bell', onclick:'showWarning' }]
async function showWarning() {
    // 客戶資料表.warning 回傳列陣列（若為 JSON 字串需先 JSON.parse）
    let result = await $this.callMethod('客戶資料表', 'warning', {});
    if (typeof result === 'string') result = JSON.parse(result);
    const rows = $dgMaster.value.getRows();          // reactive 陣列
    rows.splice(0, rows.length, ...(result || []));  // 整批取代並即時刷新
}
```

> 若只是「加條件過濾」而非回傳整批資料，改用 `$dgMaster.value.setWhere("...")`（已暴露，會自動重載）。

### 23. DataGrid 動態控制使用者的查詢條件

`onQuery` 事件中可改寫 `whereItems`：

```js
function dgMaster_onQuery(whereItems) {
    for (let i = 0; i < whereItems.length; i++) {
        if (whereItems[i].field === '帳戶' && whereItems[i].value === '全部') {
            whereItems[i].value = '';   // 「全部」代表查詢為空
        }
    }
    return true;
}
```

### 24. DataGrid 控制欄位 editor 的內容

透過 `onShowEditor` 事件動態改 editor.options：

```js
function dgDetail2_onShowEditor(index, field, editor) {
    if (field === '聯絡人') {
        editor.options.valueField = '次序';
        editor.options.textField  = '姓名';
        editor.options.whereItems = [{
            field: '客戶編號',
            operator: '=',
            value: "parent['客戶編號']"
        }];
    }
    return editor;
}
```

### 25. DataGrid 指定選中某一筆資料

直接呼叫 `select(index)`，不要 DOM 操作：

```js
function select_first() {
    $dgMaster.value.select(0);     // 從 0 計算，選中第一筆
}
```

### 26. 控制 ClientMove 組件中 Grid 的條件

```js
function testOpenmove() {
    $cmDetail.value.options().whereItems = [
        { field: '產品類別', operator: '=', value: "constant['A']" }
    ];
    $cmDetail.value.openMove();    // 打開 ClientMove 的 Grid
}
```

### 27. DataGrid 用 rowStyler 依資料即時改變整列顏色

`rowStyler` prop 給的是字串，指向 page `.ts` 裡的同名函式；函式 `return` 一段 CSS 字串就會套到該列 `<tr>`。

```vue
<template>
  <DataGrid ref="$dgMaster" rowStyler="dgMaster_rowStyler" />
</template>

<script setup>
// 逾期紅底、金額過大黃底，其餘不上色
function dgMaster_rowStyler(index, row) {
    if (row.狀態 === '逾期')   return 'background-color:#f8d7da;color:#842029;';
    if (row.金額 > 100000)     return 'background-color:#fff3cd;';
    return '';
}
</script>
```

即時更新：row 是 reactive，下列任一寫法改值後，該列 rowStyler 會立刻重跑、顏色當下就變，不需 reload：

```js
$dgMaster.value.setEditorValue(index, '狀態', '逾期');   // 編輯中
$dgMaster.value.updateRow(index, { 狀態: '逾期' });       // 整列更新
$dgMaster.value.getRows()[index].狀態 = '逾期';           // 直接改欄位
```

> 被選取的列原本套 `.info` 淡藍底；若該列 rowStyler 也回傳 `background-color`，inline style 會蓋過選取色（easyui 一貫行為）。要兩者並存需在 rowStyler 內自行判斷。
> 控制 View/Edit/Delete icon 是否顯示請用案例 15 的 `*CommandVisible` 函式 prop，不要用 rowStyler。

---

## 附錄 7：RWD 表單配合 Workflow 的常用控制

### 1）從功能表（MENU）打開工作流程表單的參數

可以透過 `$.getEncryptParameters()` 取得參數，參數定義如下：

- `NAVIGATOR_MODE`：流程狀態（三種）
  - `"0"` 查詢：打開表單會進入瀏覽或查詢狀態，用來查詢已結案或簽核中的單據
  - `"1"` 新增：打開表單會自動進入新增狀態
  - `"2"` 預備：打開表單會進入瀏覽或查詢狀態，但可以修改或刪除單據  
    - 修改會進入「變更申請」
    - 刪除會進入「作廢申請」
- `WEBFORM_NAME`：流程表單名稱（目前打開的表單名稱）
- `XomlName`：工作流程名稱（要簽核的流程名稱）
- `tabTitle`：表單標題名稱

### 2）從待辦／經辦／通知等個人事項中打開表單的參數

同樣透過 `param = $.getEncryptParameters()` 取得參數，param 的參數意義如下：

- `ActivityID`：目前的流程活動編號
- `ActivityText`：目前的流程活動名稱
- `CanAgent`：是否可以代理（true/false）
- `CanEdit`：是否可以編輯（true/false）
- `CanPlus`：是否可以加簽（true/false）
- `CanPrint`：是否可以印表（true/false）
- `CanReject`：是否可以作廢（true/false）
- `CanReturn`：是否可以退回（true/false）
- `Datetime`：上一個活動的日期時間
- `FlowID`：工作流程編號
- `FlowText`：工作流程的名稱
- `InstanceID`：工作流程實例編號（InstanceID）
- `RoleID`：接收者角色編號
- `RoleName`：接收者角色名稱
- `SenderID`：發送者用戶編號
- `SenderName`：發送者用戶名稱
- `UserID`：接收者用戶編號
- `UserName`：接收者用戶名稱
- `Status`：流程進行的狀態  
  - `0`：啟動  
  - `1`：審核中  
  - `2`：退回  
  - `3`：取回  
  - `5`：加簽  
  - `6`：轉單  
  - `7`：作廢  
  - `8`：暫停  
  - `9`：結案  
- `openStatus`：`"todo"`（待辦）、`"history"`（經辦）、`"notify"`（通知）
- `P`：自定義流程參數，可透過個別流程活動設定（例如 P=ADJUST，這裡會收到 `"ADJUST"`）

例：`param.ActivityText` 取得目前流程活動名稱。

### 3）FlowFlag 欄位定義

流程進行當中，表單資料內有一個流程狀態（FlowFlag）欄位，為一個長度至少為 38 byte 的 varchar：

- 第 1 個 byte：流程狀態
- 第 2 個 byte：固定為 `':'`
- 第 3 個 byte 至第 38 個 byte（共 36 byte）：對應的流程實例編號（InstanceID）

流程狀態定義如下：

- `''`（或 null）：代表該表單尚未經過工作流程審核
- `'P'`：暫停中（草稿狀態）
- `'N'`：審核中（流程進行中）
- `'X'`：已作廢
- `'Z'`：已結案

### 4）自行打開流程的 RWD 表單（示意）

```js
import { v4 as uuidv4 } from 'uuid';

function openFlowForm(formName, tabTitle, workflowName, keyField) {
    // 1. 產生 8 碼隨機 ID 
    const p = uuidv4().substring(0, 8); 

    // 2. 建立參數物件
    const flowData = {
        NAVIGATOR_MODE: 1,
        XomlName: workflowName,
        ParameterField: keyField
    };

    // 3. 存入 sessionStorage
    sessionStorage.setItem(p, JSON.stringify(flowData));

    // 4. 組合 URL 可能是 `/${formName}?p=${p}`
    const url = `/${formName}?p=${p}`;

    // 5. 呼叫 pageApi 的 addTab
    $this.addTab({ 
        title: tabTitle, 
        url: url, 
        path: url 
    });
}
```

### 5）流程打開 RWD 表單時，下方 dataform 的按鈕 class

```js
import { ref } from 'vue';

const dfMaster_toolItems = ref([
    { id: 'btnApprove', text: '簽核', hidden: false, onClick: doApprove },
    { id: 'btnReject', text: '退回', hidden: false, onClick: doReject }
]);

function dfMaster_onLoad(row) {
    const isFinished = row.Status === '結案';
    
    const approveBtn = dfMaster_toolItems.value.find(btn => btn.id === 'btnApprove');
    
    if (approveBtn) {
        approveBtn.hidden = isFinished; 
    }
}
```

可以透過 dataform 的 `onLoad` 事件來插入或隱藏 button。

### 6）FlowFlag 顯示流程狀態與歷程（dataform 範例）

datagrid 可使用 FlowFlag 欄位以 `Format:"flowflag"` 來顯示流程狀態與歷程並可預覽流程圖。  
如果是 dataform，則可以用以下方式處理：

```js
async function viewFlowHistory() {
    const flowFlagValue = formData.value.FlowFlag || '';
    
    if (!flowFlagValue) {
        $this.alert('目前無流程歷程資料', 'info');
        return;
    }

    // 解析 instanceID 
    const v = flowFlagValue.split(':');
    const instanceID = v[1];

    if (instanceID) {
        try {
            // 第一個參數為實際註冊的流程視窗名稱 ( 'flowView','flowHistory')
            await $this.openFlowModal('flowView', { 
                _showPreview: true, 
                InstanceID: instanceID 
            });
            
        } catch (e) {
            console.error('開啟流程視窗失敗:', e);
        }
    }
}
```
## 附錄 8：DefaultValue格式
DefaultValue為一個string的類型，用來預設欄位值使用，可以設置以下的string格式:
1. **constant[value]**：預設常量，value為內容，如:
   - **constant['0']**: 預設為 0
   - **constant['自動編號']**: 預設為'自動編號'
1. **varaible[varName]**：以系統公用變數為預設值，varName為系統變數(請參考附錄 4)，如:
   - **varaible['today']**: 預設為今天 
   - **varaible['user']**: 預設為登入的使用者編號
1. **function(funName)**：以JS的方法傳回預設值，funName為JS程式名稱，如:
   - **function['getName']**: 以getName()的JS方法取得預設值 
   - **function['getCarry','0']**: 以getCarry('0')的JS方法取得預設值
1. **parent[field]**：以主檔欄位為預設值（僅適用於明細檔），field為主檔欄位名稱，通常用於同步主檔與明細檔的共同欄位，如:
   - **parent['CustCode']**: 預設為主檔的CustCode
   - **parent['出貨日期']**: 預設為主檔的出貨日期
注意事項:
- 當有鍵值欄位欲進行自動編號時，為了配合後端AutoNumber組件的處理，該欄位務必設定預設為 '自動編號' 來防止因為空值而無法存檔。


## 附錄 9：iCoder .NET Core 發布說明
### 環境準備

LibreOffice 安裝：
如發布環境未安裝 LibreOffice 7.5.3，請執行安裝包下的 `LibreOffice_7.5.3.2_Win_x86-64`，跟著安裝精靈一步一步地完成。

---
### Step 1: 發布 .NET Core 專案

1. 請在 VS Code 上方工具列點擊【終端機】→【新增終端】
2. 請輸入以下指令，將 .NET Core 網站發布至 publish 資料夾下：
   ```bash
   dotnet publish EEPWebClient.Core.csproj -c Release -o ../publish
   ```
3. 完成後，請將 `EEPWebClient.Core` 資料夾下的 `design` 資料夾整個複製，貼到剛剛發布的 `publish` 資料夾下

---

### Step 2: 複製必要檔案

將 `EEPWebClient.Core` 資料夾下的以下檔案複製到 `publish` 資料夾下：
- `EEPAdapter.dll`
- `EEPRegister.Core.dll`
- `EEPRegister.Core.exe`

---

### Step 3: 憑證註冊

執行 `publish` 下的 `EEPRegister.Core.exe`，填入「序列號」和「公司名稱」後，導入提供的 `.eepkey` 文件即可完成憑證註冊。

---

### Step 4: 下載 .NET 8.0 SDK

請點擊連結，前往 .NET 8.0 SDK 下載網頁進行下載：
[https://dotnet.microsoft.com/zh-tw/download/dotnet/8.0](https://dotnet.microsoft.com/zh-tw/download/dotnet/8.0)

---

### Step 5: 安裝 .NET Core 裝載套件組合

請至以下網址，安裝 .NET Core 裝載套件組合：
[https://dotnet.microsoft.com/zh-tw/download/dotnet/thank-you/runtime-aspnetcore-8.0.13-windows-hosting-bundle-installer](https://dotnet.microsoft.com/zh-tw/download/dotnet/thank-you/runtime-aspnetcore-8.0.13-windows-hosting-bundle-installer)

---

### Step 6: 設定 IIS 應用程式集區

1. 打開 Internet Information Services (IIS)
2. 在【應用程式集區】按下右鍵 →【新增應用程式集區】
3. 設定參數：
   - 名稱：可自行命名
   - .NET CLR 版本：請選擇【沒有受控碼】
   - 受控管線模式：【整合式】

---

### Step 7: 設定 IIS 網站

1. 新增完成後，展開【站台】，在【Default Web Site】按下右鍵
2. 選擇【管理網站】→【進階設定】
3. 進階設定中，請將：
   - (1) 實體路徑：請改為前面發布的 `publish` 資料夾的路徑
   - (2) 應用程式集區：請改為前面新增，沒有受控碼的集區
4. 設定完成後，請在右側選單點擊【瀏覽】來瀏覽網站

---

### Step 8: 完成發布

此時，瀏覽器將會開啟 Runtime 畫面，發布完成。

---

### 注意事項

- 確保所有步驟按順序執行
- 檢查檔案路徑是否正確
- 確認 IIS 設定無誤
- 如遇問題，請檢查 Windows 事件檢視器中的錯誤訊息
