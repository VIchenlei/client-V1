/*
 * @Description: 报表页面专用基础配置文件
 * @Author: tangyue
 * @since: 2019-05-27 09:47:21
 * @lastTime: 2019-05-31 15:45:31
 * @LastAuthor: tangyue
 */

/**
 * @description: 报表打印基础设置
 * @param {type} 
 * @return: 
 */
const printDef = {
  reptTable:[
    {label: "打印",name: "printPDF",icon: "icon-printer"},
    {label: "导出CSV",name: "csv",icon: "icon-file-excel"},
    {label: "导出PDF",name: "pdf",icon: "icon-file-pdf"}
  ],
  reptSpecial:[
    {label: "打印",name: "printPDF",icon: "icon-printer"},
    {label: "导出CSV",name: "csv",icon: "icon-file-excel"},
    {label: "导出PDF",name: "pdf",icon: "icon-file-pdf"},
  ],
  reptDeptMonth:[
    {label: "导出CSV",name: "csv",icon: "icon-file-excel"}
  ],
  worktimeDeptShift:[
    {label: "导出xlsx",name: "xlsx",icon: "icon-file-excel"}
  ],
  efficiencyManage:[
    {label: "导出xlsx",name: "xlsx",icon: "icon-file-excel"}
  ]
}

/**
 * @description: 报表中绘制echarts的报表name数组
 * @param {type} 
 * @return: 
 */

const printFields = {
  person_month : {
    names: ['staff_id', 'card_id', 'dept_id', 'm_count', 'work_time', 'avg_time', 'zero', 'eight', 'four', 'concat_day'],
    types: ['SELECT', 'SELECT', 'SELECT', 'NUMBER', 'NUMBER', 'NUMBER', 'STRING', 'NUMBER', 'NUMBER', 'STRING'],
    labels: ['姓名', '卡号', '部门名称', '次数', '合计时长', '平均时长', '0点班', '8点班', '4点班', '上班']
  }
}
const reptNames = ['v_vehicle_month', 'person_month', 'v_vehicle_day', 'driver_dept_month', 'whole_status']
export { printDef, reptNames, printFields }
