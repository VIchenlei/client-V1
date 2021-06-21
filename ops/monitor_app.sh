#!/bin/sh

app_cmd="caddy -conf app"  # App进程 特征字符串，唯一
app_start_sh = "./start_app.sh" # 启动 app 的脚本
# app_dir="/home/yaxt/caddy/" # 启动 app 脚本所在目录
app_dir=`pwd` # app 启动脚本所在目录
restart_log="./restart_app_log.log"  # 重启日志

pid=0

proc_num()
{
  num=`ps -ef | grep "$app_cmd" | grep -v grep | wc -l`
  return $num
}

proc_id()
{
  pid=`ps -ef | grep "$app_cmd" | grep -v grep | awk '{print $2}'`
}

proc_num
number=$?
# echo "the count of caddy is $number"
if [ $number -eq 0 ]   # 判断进程是否存在
then
    # echo "Going to restart the app."
    cd $app_dir; $app_start_sh -DZone    # 重启进程的命令
    proc_id                # 获取新进程号
    echo ${pid}, `date` >> $restart_log      # 将新进程号和重启时间记录
fi
