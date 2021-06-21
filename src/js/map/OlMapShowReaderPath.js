import ol from 'openlayers'
import { drawSymbol, getPolylineBYPoints } from './OlMapUtils.js'
import { getRows, getMessage } from '../utils/utils.js'

export default class OlMapShowReaderPath {
    constructor(workspace) {
        this.workspace = workspace
        this.map = workspace.map
        this.initReaderLayer()
        /**
         * @description: 点击实时界面左侧分站列表操作按钮 显示隐藏分站覆盖范围 
         */
        xbus.on('MAP-SHOW-READERPATH', (msg) => {
            this.readerPathLayer = new ol.layer.Vector({
                source: this.layerSource
            })
            this.map.addLayer(this.readerPathLayer)
            if (msg.checked) {
                if (msg.isModify) this.allowModify()
                let value = Number(msg.name)
                let store = xdata.metaStore
                let rows = msg.rows ? msg.rows : this.getDefaultPathTof(value)
                let ptable = {
                    def: store.defs['reader_path_tof_n'],
                    rows: rows,
                    maxid: store.maxIDs['reader_path_tof_n']
                }
                let pmessage = this.getPathInfo(ptable, 'INSERT', 'reader_id')
                // pmessage = pmessage.reverse()
                pmessage.sort(function(a, b){return b.rows[3].field_value-a.rows[3].field_value})
                let _msg = this.formartFn(pmessage)
                
                if (_msg.rows.length > 0) {
                    for(let i=0, len = _msg.rows.length; i < len; i++) {
                        let row = _msg.rows[i]
                        let path = getPolylineBYPoints(row), className = 'track-whole', PatrolPath = 'PatrolPath'
                        let line = this.drawOLLine(this.layerSource, path.pointCol, Number(msg.name), i)
                    }
                }
            } else {
                // 获取图层所有feature  分站覆盖范围有id属性 判断筛选有无id属性 有则是分站覆盖范围feature 
                let features = this.layerSource.getFeatures()
                for (let i = 0; i < features.length; i++) {
                    if (features[i].N.hasOwnProperty('id')) {
                        // 判断是否隐藏显示 分站覆盖范围
                        if (features[i].N.id === Number(msg.name)) {
                            let feature = features[i]
                            this.layerSource.removeFeature(feature)
                        }
                    }
                }
            }
        })
    }
    initReaderLayer() {
        this.modifyArr = []
        let self = this
        this.pathSelect = new ol.interaction.Select()
        this.pathModify = new ol.interaction.Modify({
            features: this.pathSelect.getFeatures(),
            insertVertexCondition: function(e) {
                return false
            }
        })
        this.pathSelect.setActive(false)
        this.pathModify.setActive(false)
        this.layerSource = new ol.source.Vector()
        this.readerLayer = new ol.layer.Vector({
            source: this.layerSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#0099ff',
                    width: 3
                })
            })
        })
        this.map.addLayer(this.readerLayer)
        this.pathModify.on('modifyend', (e)=> {
            this.modifyArr.push(e.features.getArray()[0])
        })
        this.map.addEventListener('dblclick', () =>{
            let isSelect = this.pathSelect.getActive()
            if (!isSelect) return
            let features = this.layerSource.getFeatures()
            let dealPathDatas = []
            for(let i = 0; i < features.length; i++) {
                let coordinates = features[i].getGeometry().getCoordinates()
                dealPathDatas.push(coordinates)
            }
            xbus.trigger('SHOW-READEDIALOG',{
                coordinates: dealPathDatas
            })
            xbus.trigger('SHOW-READEDIALOG-EDIT')
            this.clearlayerSource()
        })
    }
    drawOLLine(layerSource, _point, name, i) {
        let point = _point
        let linestring = new ol.geom.LineString(point) // 坐标数组
        let lineFeature = new ol.Feature({
            geometry: linestring,
            id: name,
            finished: false
        })
        lineFeature.setStyle(this.createPathStyle(i))
        layerSource.addFeature(lineFeature)
        return { lineFeature: lineFeature, lineLength: linestring.getLength() }
    }

    allowModify () {
        this.pathSelect.setActive(true)
        this.pathModify.setActive(true)
        this.map.addInteraction(this.pathSelect)
        this.map.addInteraction(this.pathModify)
        xbus.trigger('CHANGE-SWITCH-PANEL', {isShowPanel: false})
        this.layerSource.clear()
    }

    clearlayerSource () {
        this.layerSource.clear()
        // this.readerPathLayer.setVisible(false)
        for (let i = 0, len = this.modifyArr.length; i < len; i++) {
            if (this.modifyArr[i]) this.modifyArr[i].setGeometry(null)
        }
        this.pathSelect.setActive(false)
        this.pathModify.setActive(false)
        this.map.removeInteraction(this.pathSelect)
        this.map.removeInteraction(this.pathModify)
    }

    createPathStyle (i) {
        let pathColor = ['#FF4500', '#B8860B', '#0000CD', '#7CFC00', '#8A2BE2']
        let style = {
            stroke: { width: 8, color: pathColor[i] },
            fill: { color: 'rgba(255,255,255,0.2)'},
        }
        return new ol.style.Style({
            stroke: new ol.style.Stroke(style.stroke),
            fill: new ol.style.Fill(style.fill)
        })
    }

    getPathInfo(msg) {
        let result = []
        for (let i = 0; i < msg.rows.length; i++) {
            let eitem = {}
            eitem['row'] = msg.rows[i]
            let rows = getRows(eitem, msg.def, msg.maxid)
            let _msg = getMessage('INSERT', rows, msg.def, msg.maxid)

            result.push(_msg)
        }
        return result
    }

    getDefaultPathTof (readerId) {
        let rows = xdata.metaStore.dataInArray.get('reader_path_tof_n')
        return rows.filter(item => item.reader_id === readerId)
    } 

    /**
     * @description: 分站覆盖范围处理画线所需要的数据格式 
     */
    formartFn(rows_two) {
        let rows = []
        for (let i = 0; i < rows_two.length; i++) {
            let subset = {}
            let lsubset = {}
            let e = rows_two[i].rows
            for (let j = 0; j < e.length; j++) {
                if (e[j].field_name === 'reader_id') {
                    subset.reader_id = e[j].field_value
                }
                if (e[j].field_name === 'b_x') {
                    subset.x = e[j].field_value
                }
                if (e[j].field_name === 'b_y') {
                    subset.y = e[j].field_value
                }
                if (e[j].field_name === 'reader_id') {
                    lsubset.reader_id = e[j].field_value
                }
                if (e[j].field_name === 'e_x') {
                    lsubset.x = e[j].field_value
                }
                if (e[j].field_name === 'e_y') {
                    lsubset.y = e[j].field_value
                }

            }
            rows.push([subset, lsubset])
        }
        let id = xdata.metaStore.defaultMapID
        let msg = {
            mapID: id,
            rows: rows
        }
        return msg
    }
}