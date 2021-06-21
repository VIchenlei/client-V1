# v0.5.0

## date: 2016/01/31

## changes

* [ADD] 根据 PUSH 消息，在地图上移动对象； ==done==
* [ADD] 对象移动时，增加动画； ==done==
* [ADD] CHANGELOG.md文档 (即本文档)；  ==done==

# v0.6.0

## date: 2016/02/07

## changes

* [ADD] 定位 CARD ：对应 Card 对象移动到视图中心； ==done==
* [ADD] 跟踪对象：从跟踪时刻起，画出对象在地图上移动轨迹，直到跟踪结束； ==doing==
* [OPM] 解决地图缩放时，参考线宽度保持问题； ==done==

bugs：

* 定位 CARD 时，如果移动地图增加动画，则动画完成后 pan & zoom 失效；

# v0.7.0

## date: 2016/02/14

## changes

* [FIXED] 如果只是变更照片，因为文件名没有变化，对应在DB中的整条记录没有变化，提交时会提示“无需提交”。解决方案：去掉提示步骤即可。（another：照片也加上 md5？）  ==done==
* [FIXED] 在 grid -> map 之间多次切换，初始缩放比例不对； ==done==
* [FIXED] socket.io 断开后，可以自动重连上，但没法恢复通讯（push message 无法发送），新的 socket 没有加入对应的 room；  ==done== 重新连接后，需根据 sessioin 信息恢复会话。
* [FIXED] chrome 升级到 >＝48 后，sidemenu CSS 显示位置错乱（部分 div 被覆盖）；  ==done==


# v0.8.0

## date: 2016/02/21

## changes

* [ADD] sidebar 增加可展开、收拢功能；  ==done==
* [OPM] UI优化，包括 title、sidebar 等的样式； ==done==
* [OPM] 重构客户端：架构调整
	* 网络通讯：comm_service(socket.io)
		* ~~静态资源通过 nginx 分发；~~（放入 1.x.x 实现）
		* 除基本静态资源外，前后端交互全部通过 socket.io 实现；  ==done==
		* 统一前后端 socket 通讯的协议定义： Protocol.js； ==done==
		*
	* 展示视图：view_service(riot), 自动生成组件
		* 页面组件定义
			* login  ==done==
			* 主菜单  ==done==
			* 连接状态  ==done==
			* 用户bar  ==done==
			* META侧边栏菜单  ==done==
			* Report侧边栏菜单  ==done==
			* Map工具拦  ==done==
			* 统计表格  ==done==
			* 告警表格  ==done==
			* META表格  ==done==
			* META dialog  ==done==
			* META select  ==done==
			* uploader dialog  ==done==
			* map grid  ==done==
			* map  ==done==
			* tooltips  ==done==
			* 报表查询bar  ==done==
			* 报表表格  ==done==
		* 客户端本地模块/组件间交互
			* 模块高内聚：一个模块，尽量完成一件工作；  ==done==
			* 模块间低耦合：需要交互的地方，统一通过消息总线（xbus）进行；  ==done==
		* 采用 JSON 文件保存； ==done==
		* 通过 socket 下载定义文件，转换为html 字符串并 cache 至本地；  ==done==
		* 显示时由 js 载入；  ==done==
	* 资源管理：resource_service(), 静态资源的管理，拉取、存储/组织、访问、更新、清理
		* 负责资源的 cache ：组件定义文件、地图文件、图标文件；
		* 检测服务器端资源是否有更新；
		* 下载更新的资源并刷新显示；
		* 清理无效或已超时的资源；
	* 数据管理：DataStore(Observable), 动态数据的管理，拉取、存储/组织、访问、更新、清理
		* 离线数据：META  ==done==
		* 实时数据：PUSH  ==done==
	* 地图交互：Workspace
		* 按照统一 SVG 模板组织地图数据；
		* 由 Workspace 统一管理交互分层；  ==done==
		*
* [ADD] 报表：
	* 查询：查询条件构造器；  ==done==
	* 分页：服务器端分页；
	* 打印：按区域打印；  ==done==
	* 打印：应用样式；  ==done==
	* 打印：添加页眉、页脚、标题；
	* 报表数据格式化：如时间格式、数字对齐等；  ==done==
	* 数据格式化：编号转名称（map_id 转换为 map名称）；  ==done==
* [ADD] Map编辑模式： ==doing==
	* 在地图的 toolbar 上增加进入编辑模式的入口； ==done==
	* 坐标轴； ==done==
	* 参考线； ==done==
	* 鼠标实时坐标值； ==done==
	* 对象面板；
	* 拖放对象、删除对象、编辑对象属性；
	* 对象坐标按其中心点计算（SVG默认为按 left-top 计算）  ==done==
	* 巡检路线定义、编辑、删除；
	* 区域定义、编辑、删除；

bugs:

* 同一台机器，多个用户登录，socket 重连时，只有最后登录的用户成功；（同一台机器，多个用户登录后的 socket.handshake.sessionID 相同？） ==done== 见0.9.0中的bug
* chrome升级至 >= 48，统计和告警布局变得混乱；解决方案：组件化重构时一并解决； ==done==
* 新增 META 记录，新增的记录不显示； ==done==  原因：meta 和 report 使用了相同的选择器 .table_container，新增了 report 模块后，选择器选择的对象有冲突。
* 修改 map view 包含 map, toolbar, tooltips 后，拖动 toolbar，map会跟着一起被拖动。  ==done==  原因：map 的拖动事件被注册在 container 上，container 是 toolbar 和 map 的容器，事件冒泡后会一起触发处理器。
* 在构造查询条件时，切换查询字段至日期类型时，会导致查询条件的 label 被修改； ==done== 原因：Object.assign 是浅拷贝，修改复制的对象，会影响源对象；
* 打印时，table > tbody > tr > td 的 `page-break-inside: avoid` 在 chrome 下无效，导致分页时一行数据/文字被截断。(https://bugs.chromium.org/p/chromium/issues/detail?id=99124)  （注：div 的 `page-break-inside: avoid` 有效。） ??? 解决方案：通过程序自己生成每个打印页，每页放入一个 `div` 中，包括标题、表头、数据表格、页码等。问题：如果每条数据的高度不一定，如何知道一页打印多少条？
* MapList 偶尔无法加载； ==done==   原因：因为在 mount map-list 时，初始化 this.name = opts.def.name，如果当时 META 数据还没有下载下来，则 opts.def.name 为 null，即 this.name ＝ null。而后面在 META 更新时，map-list 使用了 this.name 来判断 META 数据是否是地图列表。因为 this.name=null，这样就没有机会更新 map-list 的数据了。 解决：直接设置 this.name = ‘map’

# v0.9.0

## date: 2016/02/28

## changes:

* [OPM] 分离 server 和 client 作为两个独立的 project； ==done==
	* server
		* 使用 babel 转码；  ==done==
		* 使用 mocha 测试；
	* client
		* 使用 webpack 打包；  ==done==
		* 使用 karma 测试；
* [OPM] 去掉 tag 中的 style ，统一使用外部 CSS，便于更换皮肤； ==done==
* ~~[ADD] 支持自组网络的显示：没有坐标，HOW？？？~~
* [OPM] 地图数据单独一层，按需动态载入（需在程序中将原始地图数据分解）；
* [ADD] 增加输入类型限制：数字类型、字符类型、email等等；  ==done==
* [ADD] 地图设备列表详情；  ==done==
* [ADD] 地图卡列表详情；  ==done==
* [ADD] 地图卡 TIPS 展示状态（动态）、资料（静态）、照片；
* [ADD] 卡运动轨迹跟踪；  ==done==
* [ADD] 卡历史运动轨迹查询、跟踪及报表；  ==done==
* [ADD] 复杂报表：主要是统计类；  ==done==
* [ADD] 用户账户管理：独立的tab入口；
	* 个人资料维护；
	* 修改用户密码；  ==done==

* [ADD] 所有界面元素的变化都加上动画；
* [ADD] 增加样式指南 guide.html；
* [OPM] 去掉card中的 z坐标；  ==done==
* [OPM] 统一 META、CARD、REPT等的数据定义并修改对应程序：fields:{names:[], types:[], labels:[]}  ==done==
* [OPM]  babel 转码不支持 tag 中的 `methodName() {} `，全部修改为 `this.methodName = () => {}`。  ==done==
* [OPM] login页面的提示；
* [ADD] map上 symbol 状态的实时更新和提示；
* [ADD] PUSH 过来的 device 状态处理；
* [ADD] 自组网支持；
* [OPM] 样式优化：精简样式，dialog, table, op-panel, content-panel等。
* [OPM] MAP：
	* 指定地图上的一个坐标，在当前zoom情况下，平移地图使得该点到当前视区中心；
	* 指定地图上的一个或多个跟踪轨迹，自动a.调整地图的zoom b. 并平移地图，使所有轨迹显示在当前视区内；
* [OPM] 完善map tag，用 map tag 替换当前监控视图；

bugs:

* collector 登录时，会收到所有 META 数据； 原因：同台机器、同一个浏览器，多个连接的sessionID是相同的，所以登录账号会串。  ==done==  同一台机器的同一个浏览器，只允许登录一个账号
* Map 上偶尔出现鼠标 move 事件无法释放的问题； ??? 未重现
* 文件上传 dialog，当上传文件预览时，如果图片过大，则拖动 dialog 时，dialog 会粘在窗口边缘，dialog size 会随着拖动改变。 ??? max-width: 100% 导致？
* 重构 SVGPan.js 为 class 后，不断抛出 ”this.getEventPointOnViewPort is not a function”. ==done== 原因：在 mouse 事件的处理函数中调用 this.xxx，其中 this 指向对应的事件触发对象，而不是 SVGPan 对象。
* 在 tag 的 script 中通过 import 引入 class，不加 type=babel，则无法使用 import（编译不通过）。加上 type=babel，则出现 “Module build failed: SyntaxError: /Users/HANK/work/loc/client/.: Unexpected token”。WHY？  ==done== 原因见下
* 使用 `webpack --display-error-details -p`时（加上 -p 参数），抛出错误：

```shell
ERROR in bundle.js from UglifyJs
Unexpected token: operator (>) [./~/riotjs-loader!./tags/side-bar.tag:7,0]
npm run build  14.43s user 0.87s system 104% cpu 14.671 total
```

推测是不支持 `=>` 符号？ ???

```shell
riot compile *.tag -> *.js  /* in es2015 */
```
OK

```shell
babel compile *.js -> *.js /* in es5 */
```

OK. 为什么在 `uglify` 的时候，还会有 `=>` 符号？ webpack 的问题？？？  ==done==  解决：1. 在 webpack.config.js 的 riotjs-loader 配置中，增加 `query: { type: 'babel' }`  2.
Riot's default mini-ES6 method syntax cannot work when we are using babel, so we need to change (https://github.com/txchen/feplay/tree/gh-pages/riot_webpack):

```js
// This would not work with babel
buttonHandler(e) {
  // code
}

// Change to this
this.buttonHandler = e => {
  // code
}
```


* 登录时，偶尔需要点击两次登录按钮才能提交成功。  ==done==  原因：socket.connect() 是异步操作，执行 socket.connect() 以后马上执行登录操作时，socket连接不一定已经成功。
* 打开一个 meta-dialog（如 reader），进行操作后 unmount。然后，重新 mount 一个新的 meta-dialog(需要是上传文件的，如staff)，当上传文件时，发现居然是原来的 meta-dialog 收到了文件上传成功的消息，处理出错。？？？  ==done==  原因：使用 xbus.on 注册到 xbus 上的全局事件处理器，如果不使用 xbus.off 手动注销的话，将一直存在。所有注册的事件处理器，都会被通过 xbus 传输的消息触发。所以，在 app 中，应该：1. 统一在对象初始化时，注册全局事件；2. 在对象销毁时，注销全局事件。
* 分离地图后，如果显示历史轨迹后，地图监控中对象的动画位移会比实际的大一倍！！！
* 打印地图时，不打印新生成的轨迹；（path style的问题？）
* chrome 49中，地图大小显示不对（hight != 100%）；（chrome 49 的bug？）  ==done==
* client使用 webpack 打包OK，但是浏览时报错：

```shell
bundle.js:1Uncaught ReferenceError: webpackJsonp is not defined(anonymous function) @ bundle.js:1
```

原因：https://www.zhihu.com/question/37698009  ==done==
* 删除 meta 记录时，最后一条记录无法删除；  ==done==


# v1.0.0

*发布的第一个正式版本。*

## date: 2016/03/15

## changes

* [ADD] 自动构建：测试、合并、压缩、打包；
* [ADD] 自动部署：监控、集群等；
* [OPM] client端：分离出 app 和 vendor 代码分别打包； ==done==  注意：socket.io 打包时，只需要打包 client ，所以在 webpack.config.js 中的配置不是 `vendor: ['socket.io', 'riot’]`, 而是 `vendor: ['socket.io-client', 'riot’]`，否则会报错，比如 `fs can’t find`等。

bugs

* webpack 没有打包 images 。 修改 div 的 background-image ，没有任何相关的打包信息：

```shell
                               Asset      Size  Chunks             Chunk Names
                       app.bundle.js   1.24 MB       0  [emitted]  app
                    vendor.bundle.js   1.32 MB       1  [emitted]  vendor
0.dd61c451963e9ef1e18b.hot-update.js   36.3 kB       0  [emitted]  app
dd61c451963e9ef1e18b.hot-update.json  36 bytes          [emitted]  
chunk    {0} app.bundle.js, 0.dd61c451963e9ef1e18b.hot-update.js (app) 426 kB {1} [rendered]
   [85] ./~/css-loader?sourceMap!./~/sass-loader!./sass/pt.sass 12.7 kB {0} [built]
     + 110 hidden modules
chunk    {1} vendor.bundle.js (vendor) 452 kB [rendered]
     + 121 hidden modules
webpack: bundle is now VALID.
```

# v1.x.x

date: 2016/06/15

changes:

* [OPM] 客户端代码采用 ES6 重写，与 server 端代码一致；要求：  ==done==  采用方案二：使用Babel 转码，对浏览器无要求
	* `chrome > 49` 或者 在 `chrome://flags` 中启用 `Enable Experimental JavaScript`）
	* 或者，使用 babel 编译成 es5 代码，可以兼容所有浏览器；
* [OPM] 去掉 express 及相关依赖，采用 nginx 实现静态资源的下发，http2 作为 web server；在 socket.io 中保持会话session（需要自己实现整个的 session 机制！！！）；

* [OPM] 监控模块切分为几个子模块
	* 地图列表：全局
	* 地图
	* 设备列表：状态（全局 or 按地图？）、呼叫
	* 标识卡列表：状态（全局 or 按地图？）、呼叫
	* 告警（全局 or 地图？）
	* 统计（全局 or 地图？）
	* 消息：接收的消息列表、发送消息的入口
	* 跟踪列表：全局
	* 定位列表：全局
* [OPM] 独立 DataStore ，下辖：
	* meta
		* def
		* data
	* card: state, info
		* def
		* data
	* device: state, info
		* def
		* data
	* call:
	* track:
	*  

## V1.8.x

date:

changes:

* [ADD] WEB服务器管理界面
	* 当前状态；
	* 当前连接的 client 个数、列表；
	* 历史连接的 client 数量曲线；
	* 当前连接的 collector 个数、列表；
	* 历史连接的 collector 数量曲线；


## v2.0.0

*发布的第一个支持移动设备的正式版本。*

date: 2016/07/01

changes:

* [ADD] 支持移动设备；