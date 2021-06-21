
let position_all = `
[{
        "map_id":1,
        "pos_card":[{
            "card_id":"0020000000008",
            "card_type_id":"2",
            "number":"M1, 车辆, 一号位置",
            "x":0,
            "y":0,
            "rec_time":"2016-03-03 09:09:09",
            "down_time":"2016-03-03 09:09:09",
            "up_time":"2016-03-03 09:09:09",
            "enter_area_time":"2016-03-03 09:09:09",
            "enter_reader_time":"2016-03-03 09:09:09",
            "map_id":1,
            "area_id":1,
            "dept_id":1,
            "work_time":"10 小时 10 分钟 10 秒",
            "state":"1"
        }, {
            "card_id":"0010000000009",
            "card_type_id":"1",
            "number":"M1, 人员, 一号位置",
            "x":300,
            "y":100,
            "rec_time":"2016-03-03 09:09:09",
            "down_time":"2016-03-03 09:09:09",
            "up_time":"2016-03-03 09:09:09",
            "enter_area_time":"2016-03-03 09:09:09",
            "enter_reader_time":"2016-03-03 09:09:09",
            "map_id":1,
            "area_id":1,
            "dept_id":1,
            "work_time":"10 小时 10 分钟 10 秒",
            "state":"0"
        }]
    }, {
        "map_id":4,
        "pos_card":[{
            "card_id":"0010000000010",
            "card_type_id":"1",
            "number":"M4, 人员, 一号位置",
            "x":500,
            "y":200,
            "rec_time":"2016-03-03 09:09:09",
            "down_time":"2016-03-03 09:09:09",
            "up_time":"2016-03-03 09:09:09",
            "enter_area_time":"2016-03-03 09:09:09",
            "enter_reader_time":"2016-03-03 09:09:09",
            "map_id":4,
            "area_id":1,
            "dept_id":1,
            "work_time":"10 小时 10 分钟 10 秒",
            "state":"0"
        }, {
            "card_id":"0020000000011",
            "card_type_id":"2",
            "number":"M4, 车辆, 一号位置",
            "x":800,
            "y":0,
            "rec_time":"2016-03-03 09:09:09",
            "down_time":"2016-03-03 09:09:09",
            "up_time":"2016-03-03 09:09:09",
            "enter_area_time":"2016-03-03 09:09:09",
            "enter_reader_time":"2016-03-03 09:09:09",
            "map_id":4,
            "area_id":1,
            "dept_id":1,
            "work_time":"10 小时 10 分钟 10 秒",
            "state":"1"
        }]
    }]
`

// socket 是一个全局变量
var socket = null
let connectionOpts = {
  'force new connection': true,
  'reconnectionAttempts': 'Infinity', //avoid having user reconnect manually in order to prevent dead clients after a server restart
  'timeout': 10000, // 10s, before connect_error and connect_timeout are emitted.
  'transports': ['websocket']
}

function login(username, userpwd) {
  //     console.dir(socket)

  if (!socket) {
    socket = io.connect(window.location.host, connectionOpts)
    socket.on('connect', registerEventHandler)
  }

  // if socket.disconnected, need to re-open it
  if (socket.disconnected) {
    socket.connect()
  }

  socket.emit('USER', {
    cmd: 'login',
    data: {
      user_name: username,
      user_pass: userpwd
    }
  }, function (data) {
    console.log('OK, got into login-callback')
    console.log(JSON.stringify(data))
    if (data) {
      doLogin(socket, data)
    }
  })
}

function logout () {
  socket.emit('USER', {
    cmd: 'logout',
    user_name: socket.username
  })
}

function disconnect () {
  socket.disconnect()
}

// function sendCall(id) {
//     socket.emit('call', {
//         userid: id,
//         msg: 'on call.'
//     })
// }

// function send(msg) {
//     // 客户端 socket.send('hi')，服务器用socket.on('message', function(data){})来接收。
//     if (socket) {
//         socket.send(msg)
//     }
// }

/**
 * 注册网络消息事件的处理器
 *
 * @method registerEventHandler
 *
 */
function registerEventHandler () {
  // Fired upon connecting.
  socket.on('connect', function () {
    console.log('Socket connected')
  })

  // Fired upon a disconnection.
  socket.on('disconnect', function () {
    console.warn('Socket disconnected by remote.')
    console.dir(socket)
  })

  // Fired upon an attempt to reconnect.
  socket.on('reconnecting', function (number) {
    console.log('Trying to reconnect to the server... ', number)
  })

  // Fired upon a successful reconnection.
  socket.on('reconnect', function (number) {
    console.log('Reconnect succeed : ', number)
  })

  // Fired upon a connection error
  socket.on('error', function (error) {
    console.warn('Connection error : ', error)
  })


  socket.on('login_res', function (res) {
    console.log(res)
    doLoginRes(socket, res)
  })

  socket.on('logout_res', function (res) {
    console.log(res)
    doLogoutRes(socket, res)
  })

  socket.on('metadata_definition', function (res) {
    console.log(JSON.stringify(res))
    doMetadata_definition(socket, res)
  })

  socket.on('META', function (res) {
    console.log(JSON.stringify(res))
    // doMetadata(socket, res)
  })

  socket.on('filedata_res', function (res) {
    console.log(JSON.stringify(res))
    doFiledataRes(socket, res)
  })

  socket.on('update_metadata_res', function (res) {
    console.log(JSON.stringify(res))
    table.dispatchUpdateDBRes(res)
  })

  socket.on('CALL', function (res) {
    console.log(JSON.stringify(res))
  })

  // socket.on( 'REQUEST', function ( req, callback ) {
  //   console.log( JSON.stringify( req ) )
  //   let res = {
  //     cmd: 'positon_all',
  //     data: position_all
  //   }
  //   callback( res )
  // } )

}


function doLogin (socket, res) {
  if (res.code == 0) {
    socket.username = res.data.name
    socket.sid = res.data.sid

    console.log(`用户 ${res.data.name} 登录成功！`)
    // showUserName(res.data.name)
    // go2main()
  } else {
    // showTips('用户名或密码错误，请确认后重试。')
    console.log(`用户名 ${res.data.name} 或密码错误！`)
  }
}


function doLoginRes (socket, res) {
  if (res.code == 0) {
    socket.username = res.data.name
    socket.sid = res.data.sid
    console.log('用户 ${res.data.name} 登录成功！')

    //showUserName(res.data.name)
    //go2main()
  } else {
    //showTips('用户名或密码错误，请确认后重试。')
    console.log('用户名 ${res.data.name} 或密码错误！')
  }
}

function doLogoutRes (socket, res) {
  if (res.code == 0) {
    console.log(`退出成功！\n ${res.msg}`)
  } else {
    console.warn(`退出失败！\n ${res.msg}`)
  }
}

function doMetadata_definition (socket, res) {
  // save2mdd(res)
  console.log(res)
}

function doMetadata (socket, res) {
  if (parseInt(res.code, 10) == 0) { // execute succeed
    if (res.msg == 'OK') {
      console.log(res)
    } else {
      console.log(`${res.data.name}无有效记录。`)
    }
  }
}

function doFiledataRes (socket, res) {
  if (res.code == 0) {
    save2local(res.data.filename, res.data)
    if (currentMap == res.data.filename) {
      drawMap(res.data.data)
    }
  }
}
