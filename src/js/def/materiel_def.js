let materielDef = [
  {
    title: '高河能源物料倒运计划表',
    pageIndex: 13,
    pageIndexDaily: 9,
    pageIndexKeynote: 4,
    nameTitle: 'materiel_bar',
    needBreakDown: false,
    needLayered: true,
    names: ['工作性质', '单位', '品名', '使用车数', '倒运物料地点', '卸料物料地点', '完成情况'],
    fields: ['work_property', 'company_name', 'product_name', 'vehcile_number', 'bar_place', 'discharge_place', 'complate_situation'],
    types: ['NUMBER', 'STRING', 'STRING', 'NUMBER', 'STRING', 'STRING', 'NUMBER'],
    isAuthority: true
  },
  {
    title: '高河能源物料报送审批计划表',
    pageIdex: 13,
    pageIndexDaily: 9,
    pageIndexKeynote: 4,
    nameTitle: 'materiel_submitted',
    needBreakDown: false,
    needLayered: true,
    names: ['单位', '品名', '车数', '胶轮车数', '卸料地点', '装车情况'],
    fields: ['company_name', 'product_name', 'vehicle_number', 'rubber_tire_number', 'discharge_place', 'vehicle_describe'],
    types: ['STRING', 'STRING', 'NUMBER', 'NUMBER', 'STRING', 'STRING'],
    isAuthority: false
  },
  {
    title: '特种车计划',
    pageIndex: 13,
    pageIndexDaily: 7,
    pageIndexKeynote: 6,
    nameTitle: 'special_vehicle_plan',
    needBreakDown: true,
    needLayered: true,
    names: ['工作性质', '单位', '品名', '使用车数', '倒运物料地点', '卸料物料地点', '完成情况'],
    fields: ['work_property', 'company_name', 'product_name', 'vehcile_number', 'bar_place', 'discharge_place', 'complate_situation'],
    types: ['NUMBER', 'STRING', 'STRING', 'NUMBER', 'STRING', 'STRING', 'NUMBER'],
    isAuthority: true
  }
]

export { materielDef }
